import { fetchFeed } from './parser';
import { fetchYouTubeVideos, clearYouTubeCache } from './youtube';
import { TelegramClient, type SendResult } from './telegram';
import { BotManager } from './manager';
import { BotConfig, FeedConfig, RssItem } from '../../shared/types';
import { TitanLogger } from '../logger';
import { tm } from '../i18n';
import { app, BrowserWindow, Notification } from 'electron';
import {
    buildDigestMessage, hostOf, isFeedDue, isMuted, isTimeAllowed, isTransientFetchError,
    loopIntervalMinutes, parseStartDate, parseUtcTimestamp, passesKeywordFilter, startupMessage,
} from './rules';

// Re-export per chi lo importava da qui prima che le regole avessero un modulo proprio.
export { parseUtcTimestamp };

interface PublishJob {
    botId: number;
    /** Nome al momento dell'accodamento: serve solo ai log se il bot sparisce nel frattempo */
    botName: string;
    feed: FeedConfig;
    item: RssItem;
    /** Numero di tentativi già effettuati (0 = primo invio) — F2 Retry Queue */
    retryCount: number;
    /** Il contenuto veniva dalla coda delle ore di silenzio: se non parte, ci torna */
    fromPending: boolean;
}

/**
 * Tentativi a livello di coda per gli errori transitori. Ognuno include già i ~35 secondi
 * di ripetizioni interne del client: in tutto il contenuto ha circa due minuti per partire.
 * Poi **non** viene marcato come pubblicato: resta nel feed e torna al giro successivo.
 */
const MAX_RETRIES = 2;

/**
 * Perf Fix B (v2.1.5): numero massimo di fetch RSS/Atom eseguiti in parallelo per bot.
 * Ogni feed colpisce di norma un host diverso, quindi 6 richieste concorrenti non
 * sovraccaricano un singolo server ma abbattono il tempo di ciclo con molti feed.
 * I feed YouTube restano fuori dal pool (seriali + throttle) per via dell'antibot Innertube.
 */
const RSS_FETCH_CONCURRENCY = 6;

/**
 * Letture parallele verso lo stesso server. Molti podcast stanno sullo stesso host (Spreaker):
 * sei letture insieme verso di lui, ripetute per ogni bot, sono il sospetto del 19/10, quando
 * sette feed sono andati in timeout nello stesso momento.
 */
const PER_HOST_CONCURRENCY = 3;

/** Attesa prima del secondo tentativo di lettura di un feed. */
const FEED_RETRY_DELAY_MS = 5000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const contentTypeOf = (feed: FeedConfig): 'youtube' | 'rss' => (feed.type === 'youtube' ? 'youtube' : 'rss');

export class BotEngine {
    private isRunning: boolean = false;
    /**
     * Generazione del motore. Ogni avvio la incrementa, ogni arresto pure: giri, code e
     * catene di pianificazione portano con sé la generazione in cui sono nati e si fermano
     * appena non è più quella corrente.
     *
     * Senza questo, fermare e riavviare il motore durante una scansione lasciava viva la
     * vecchia catena di `setTimeout` accanto alla nuova: due scansioni parallele e due
     * consumatori della coda di invio, con il rischio concreto di pubblicare due volte.
     */
    private runId: number = 0;
    private timeoutId: NodeJS.Timeout | null = null;
    private clients: Map<number, { client: TelegramClient; signature: string }> = new Map();
    private publishQueue: PublishJob[] = [];
    private isPublishing: boolean = false;
    private hasNotifiedYoutubeError: boolean = false;
    /** Contenuti pubblicati nel giro in corso — è il numero della riga «pubblicati N» (Fase 7) */
    private publishedInScan: number = 0;
    /**
     * Generazione che sta leggendo le sorgenti in questo momento (avvio compreso), o null.
     * Legata alla generazione e non un semplice booleano: un giro vecchio che finisce dopo
     * un riavvio non deve dichiarare libero il motore mentre quello nuovo sta lavorando.
     */
    private scanningRun: number | null = null;
    private statusListeners = new Set<(running: boolean) => void>();
    /**
     * Letture RSS del giro in corso, per indirizzo: lo stesso feed usato da più bot si legge
     * una volta sola. Si svuota a ogni giro, quindi non serve mai un contenuto vecchio.
     */
    private scanFeedReads = new Map<string, Promise<{ items: RssItem[]; retried: boolean }>>();
    /** Letture in corso e in attesa, per server (vedi PER_HOST_CONCURRENCY). */
    private hostActive = new Map<string, number>();
    private hostWaiters = new Map<string, Array<() => void>>();
    /** Campo e non costante solo perché i test possano accorciarla. */
    private feedRetryDelayMs = FEED_RETRY_DELAY_MS;

    /** Avvisa chi ascolta (l'icona nell'area di notifica) quando il motore si accende o si spegne. */
    onStatusChange(listener: (running: boolean) => void): () => void {
        this.statusListeners.add(listener);
        return () => this.statusListeners.delete(listener);
    }

    private notifyStatus() {
        for (const listener of this.statusListeners) {
            try { listener(this.isRunning); } catch { /* un ascoltatore rotto non ferma il motore */ }
        }
    }

    /** True mentre il motore legge le sorgenti (o sta ancora partendo). */
    isScanning(): boolean {
        return this.scanningRun !== null && this.scanningRun === this.runId;
    }

    /** Contenuti del bot nella coda di invio in questo momento (code visibili). */
    queuedFor(botId: number): number {
        return this.publishQueue.filter(job => job.botId === botId).length;
    }

    /** Stato corrente del motore — usato dal renderer per sincronizzare la UI al mount. */
    isEngineRunning(): boolean {
        return this.isRunning;
    }

    private isLive(run: number): boolean {
        return this.isRunning && run === this.runId;
    }

    /**
     * Avvia il motore e restituisce subito. Il messaggio di avvio e il primo giro corrono
     * in sottofondo: prima la chiamata IPC aspettava la fine della prima scansione, e
     * l'interfaccia restava su «spento» anche per un minuto dopo aver premuto Avvia.
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        const run = ++this.runId;
        // Avvio e primo giro sono un unico tratto «occupato»: un «Controlla adesso» premuto
        // in questi secondi aprirebbe un secondo giro accanto al primo.
        this.scanningRun = run;
        this.notifyStatus();

        void (async () => {
            try {
                await this.broadcastStartup(run);
                if (!this.isLive(run)) return;
                TitanLogger.log("🚀 Engine Started - Multi-Bot Mode", { type: 'engine-start' });
                await this.checkLoop(run);
            } catch (e) {
                TitanLogger.log(tm('engineStartFailed', { error: String(e) }));
            } finally {
                if (this.scanningRun === run) this.scanningRun = null;
                // Comunque vada il primo giro, il successivo va pianificato: prima un'eccezione
                // qui lasciava il motore «acceso» ma senza più nessuna scansione in calendario.
                this.scheduleNext(run);
            }
        })();
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        this.runId++;
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = null;

        this.hasNotifiedYoutubeError = false;

        // Svuota la coda di invio
        this.publishQueue = [];
        this.isPublishing = false;

        // Abort all in-progress Telegram send operations
        this.clients.forEach(({ client }) => client.abort());
        this.clients.clear();

        // Invalida la cache YouTube alla fermata — fix #19
        clearYouTubeCache();
        this.scanFeedReads.clear();

        this.scanningRun = null;
        TitanLogger.log("🛑 Engine Stopped", { type: 'engine-stop' });
        this.notifyStatus();
    }

    /**
     * «Controlla adesso»: un giro subito, su tutte le sorgenti attive anche se il loro
     * intervallo non è scaduto, poi il calendario riparte da qui. Prima l'unico modo per
     * non aspettare era fermare e riavviare il motore, che rimandava i messaggi di avvio.
     *
     * Non apre mai un secondo giro accanto a uno in corso: in quel caso risponde `busy`.
     */
    scanNow(reason: 'user' | 'resume' = 'user'): 'started' | 'busy' | 'stopped' {
        if (!this.isRunning) return 'stopped';
        if (this.isScanning()) return 'busy';
        const run = this.runId;
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = null;
        TitanLogger.log(tm(reason === 'resume' ? 'scanNowResume' : 'scanNowUser'));
        this.checkLoop(run, true)
            .catch(e => TitanLogger.log(tm('engineUnexpected', { error: String(e) })))
            .finally(() => this.scheduleNext(run));
        return 'started';
    }

    /** Remove cached client and pending jobs when a bot is deleted */
    removeClient(botId: number) {
        const cached = this.clients.get(botId);
        if (cached) {
            cached.client.abort();
            this.clients.delete(botId);
        }

        // Svuota immediatamente la coda di invio da eventuali job riferiti al bot eliminato
        this.publishQueue = this.publishQueue.filter(job => job.botId !== botId);
    }

    /**
     * Client Telegram del bot, ricreato se token o canale sono cambiati.
     *
     * Prima la cache guardava solo l'id: modificando token o canale a motore acceso, i
     * messaggi continuavano ad andare al canale vecchio fino al riavvio del motore.
     */
    private getClient(bot: BotConfig): TelegramClient {
        const signature = `${bot.token}\n${bot.channel_id}\n${bot.topic_id ?? ''}`;
        const cached = this.clients.get(bot.id);
        if (cached && cached.signature === signature) return cached.client;
        cached?.client.abort();
        const client = new TelegramClient(bot.token, bot.channel_id, bot.topic_id);
        this.clients.set(bot.id, { client, signature });
        return client;
    }

    private async broadcastStartup(run: number) {
        const appVersion = app.getVersion();
        for (const bot of BotManager.getBots()) {
            if (!this.isLive(run)) return;
            const message = startupMessage(bot, appVersion);
            if (message === null) {
                if (bot.is_active && bot.token && bot.silent_start) {
                    TitanLogger.log(`🤫 [${bot.name}] Avvio silenzioso: nessun messaggio nel canale.`);
                }
                continue;
            }
            // Ore di silenzio: niente annuncio. Con l'avvio insieme al computer il motore può
            // partire alle tre di notte, e l'«Online» arrivava sul canale a quell'ora.
            if (!isTimeAllowed(bot.send_from, bot.send_until)) {
                TitanLogger.log(`🌙 [${bot.name}] Ore di silenzio: nessun messaggio di avvio nel canale.`);
                continue;
            }
            let res = await this.getClient(bot).sendMessage(message, { silent: isMuted(bot) });
            // Messaggio di avvio personalizzato rifiutato: si ripiega su quello standard.
            if (!res.ok && res.kind === 'rejected' && bot.template_startup?.trim() && this.isLive(run)) {
                TitanLogger.log(tm('startupTemplateRejected', { bot: bot.name, error: res.error }), 'warn');
                res = await this.getClient(bot).sendMessage(startupMessage({ ...bot, template_startup: null }, appVersion)!, { silent: isMuted(bot) });
            }
            // Motore fermato mentre la richiesta era in volo: l'esito non interessa più.
            if (!this.isLive(run)) return;
            if (!res.ok && res.kind !== 'aborted') {
                TitanLogger.log(tm('startupFailed', { bot: bot.name, error: res.error }));
            }
        }
    }

    /** Minuti di attesa del prossimo giro: il bot o il feed attivo più frequente. */
    private getMinInterval(): number {
        const bots = BotManager.getBots().filter(b => b.is_active);
        const feedIntervals = bots.flatMap(b =>
            BotManager.getFeeds(b.id)
                .filter(f => f.is_active && f.check_interval)
                .map(f => f.check_interval as number)
        );
        return loopIntervalMinutes(bots, feedIntervals) * 60 * 1000;
    }

    private scheduleNext(run: number) {
        if (!this.isLive(run)) return;
        let interval = 15 * 60 * 1000;
        try {
            interval = this.getMinInterval();
        } catch (e) {
            TitanLogger.log(tm('nextScanFallback', { error: String(e) }));
        }
        const minutes = interval / 60000;
        TitanLogger.log(
            `⏳ Next check in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}...`,
            { type: 'next-scan', count: minutes }
        );
        this.timeoutId = setTimeout(() => {
            // .catch + .finally: un errore non gestito in checkLoop non deve interrompere
            // il loop di scheduling (né propagarsi come unhandledRejection). Il prossimo
            // ciclo viene comunque pianificato — dalla stessa generazione, o da nessuna.
            this.checkLoop(run)
                .catch(e => TitanLogger.log(tm('engineUnexpected', { error: String(e) })))
                .finally(() => this.scheduleNext(run));
        }, interval);
    }

    /** @param force «Controlla adesso»: legge anche le sorgenti con l'intervallo non ancora scaduto. */
    private async checkLoop(run: number, force = false) {
        if (!this.isLive(run)) return;
        this.scanningRun = run;
        try {
            await this.scanAllBots(run, force);
        } finally {
            if (this.scanningRun === run) this.scanningRun = null;
        }
    }

    private async scanAllBots(run: number, force: boolean) {
        const bots = BotManager.getBots();
        // Il contatore riparte a ogni giro: se un drenaggio precedente è ancora in corso
        // (coda lunga, invii lenti) il suo residuo confluisce nel riepilogo di questo giro.
        this.publishedInScan = 0;
        this.scanFeedReads.clear();
        TitanLogger.log(`🔄 Checking ${bots.length} bots...`, { type: 'scan-start', count: bots.length });

        for (const bot of bots) {
            if (!this.isLive(run)) break;
            if (!bot.is_active) {
                TitanLogger.log(`⏸️ Bot [${bot.name}] is disabled. Skipped.`);
                continue;
            }

            // Token illeggibile su questa macchina (es. DB importato da un altro PC, keychain
            // OS non disponibile): inutile tentare invii destinati a fallire con "Unauthorized".
            if (!bot.token) {
                TitanLogger.log(tm('tokenUnreadable', { bot: bot.name }), 'warn');
                continue;
            }

            const cutoff = parseStartDate(bot.start_date);
            if (cutoff === null) {
                TitanLogger.log(tm('startDateInvalid', { bot: bot.name, date: String(bot.start_date) }), 'error');
                continue;
            }

            try {
                const feeds = BotManager.getFeeds(bot.id);
                if (feeds.length === 0) {
                    TitanLogger.log(tm('botNoFeeds', { bot: bot.name }), 'warn');
                    continue;
                }

                TitanLogger.log(`🤖 Bot [${bot.name}]: Checking ${feeds.length} feeds...`);

                if (cutoff > Date.now()) {
                    TitanLogger.log(tm('startDateFuture', { bot: bot.name, date: String(bot.start_date) }), 'warn');
                }

                // Drena la coda quiet hours prima di processare i nuovi feed
                try {
                    this.drainPendingQueue(bot, run);
                } catch (e) {
                    TitanLogger.log(tm('pendingDrainFailed', { bot: bot.name, error: String(e) }), 'error');
                }

                const activeFeeds = feeds.filter(f => f.is_active);
                const skippedFeeds = feeds.length - activeFeeds.length;
                if (skippedFeeds > 0) {
                    TitanLogger.log(`   ⏸️ Bot [${bot.name}]: ${skippedFeeds} feed disabilitati, saltati.`);
                }

                // F5: filtra i feed effettivamente da controllare in questo ciclo (intervallo scaduto).
                const dueFeeds = force ? activeFeeds : activeFeeds.filter(feed => {
                    const interval = feed.check_interval ?? bot.check_interval ?? 15;
                    if (!isFeedDue(feed.last_fetch_at, interval)) {
                        TitanLogger.log(`  ⏱️ [${feed.name}] Intervallo non scaduto, saltato.`);
                        return false;
                    }
                    return true;
                });

                // --- Perf Fix B (v2.1.5): fetch RSS in parallelo, YouTube seriale ---
                // Il processamento degli item dopo il fetch è sincrono (better-sqlite3), quindi
                // non c'è race tra feed sullo stesso bot.
                const rssFeeds = dueFeeds.filter(f => f.type !== 'youtube');
                const youtubeFeeds = dueFeeds.filter(f => f.type === 'youtube');

                await this.runPool(rssFeeds, RSS_FETCH_CONCURRENCY, run, async (feed) => {
                    try {
                        await this.processFeed(bot, feed, cutoff, run);
                    } catch (feedError) {
                        TitanLogger.log(tm('feedFailed', { feed: feed.name, error: String(feedError) }), 'error');
                    }
                });

                // I feed YouTube restano SERIALI e distanziati (throttle 5s): l'antibot Innertube
                // (issue LuanRT/YouTube.js#1158, #1166) penalizza i burst ravvicinati di chiamate.
                for (let i = 0; i < youtubeFeeds.length; i++) {
                    if (!this.isLive(run)) break;
                    const feed = youtubeFeeds[i];

                    try {
                        await this.processFeed(bot, feed, cutoff, run);
                    } catch (feedError) {
                        TitanLogger.log(tm('feedFailed', { feed: feed.name, error: String(feedError) }), 'error');
                    }

                    if (i < youtubeFeeds.length - 1 && this.isLive(run)) {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }

                // Warning: coda troppo grande segnala un accumulo anomalo — fix #17
                if (this.publishQueue.length > 50) {
                    TitanLogger.log(tm('queueLarge', { bot: bot.name, n: String(this.publishQueue.length) }), 'warn');
                }

                // F9 Digest: invia i digest in scadenza per questo bot
                try {
                    await this.processDigests(bot, run);
                } catch (e) {
                    TitanLogger.log(tm('digestError', { bot: bot.name, error: String(e) }), 'error');
                }

            } catch (e) {
                TitanLogger.log(tm('botFailed', { bot: bot.name, error: String(e) }), 'error');
            }
        }

        if (!this.isLive(run)) return;

        // Avvio consumer se non è già in esecuzione e la coda non è vuota.
        // .catch obbligatorio: è fire-and-forget, senza handler una rejection qui
        // diventerebbe un unhandledRejection a livello di processo.
        if (this.publishQueue.length > 0 && !this.isPublishing) {
            this.processPublishQueue(run).catch(e => {
                if (run === this.runId) this.isPublishing = false;
                TitanLogger.log(tm('engineUnexpected', { error: String(e) }), 'error');
            });
        } else if (!this.isPublishing) {
            // Nessun contenuto da inviare: il giro finisce qui, e va detto. Se invece la coda
            // c'è, il riepilogo lo emette processPublishQueue quando ha finito di svuotarla.
            this.emitScanEnd(run);
        }
    }

    /** Riga di chiusura del giro: «pubblicati N» — Fase 7. */
    private emitScanEnd(run: number) {
        if (!this.isLive(run)) return;
        const count = this.publishedInScan;
        TitanLogger.log(`🏁 Scan complete — ${count} published`, { type: 'scan-end', count });
    }

    /**
     * Esegue `worker` su tutti gli item con al massimo `concurrency` esecuzioni in parallelo
     * (Perf Fix B). Il worker gestisce i propri errori: qui non si intercetta nulla, così un
     * feed lento o fallito non blocca gli altri runner del pool.
     */
    private async runPool<T>(items: T[], concurrency: number, run: number, worker: (item: T) => Promise<void>): Promise<void> {
        if (items.length === 0) return;
        let cursor = 0;
        const size = Math.max(1, Math.min(concurrency, items.length));
        const runners = Array.from({ length: size }, async () => {
            while (cursor < items.length && this.isLive(run)) {
                const item = items[cursor++];
                await worker(item);
            }
        });
        await Promise.all(runners);
    }

    /** Lettura di un feed RSS, condivisa tra i bot del giro e limitata per server. */
    private readFeedOnce(url: string, name: string, run: number): Promise<{ items: RssItem[]; retried: boolean }> {
        let read = this.scanFeedReads.get(url);
        if (!read) {
            read = this.withHostSlot(url, () => this.fetchWithRetry(name, url, run));
            this.scanFeedReads.set(url, read);
        }
        return read;
    }

    /**
     * Una lettura con un secondo tentativo, dopo qualche secondo, se la prima fallisce per un
     * singhiozzo di rete (vedi `isTransientFetchError`). Prima un timeout isolato diventava
     * subito un errore nel diario, e il feed aspettava il giro successivo.
     */
    private async fetchWithRetry(name: string, url: string, run: number): Promise<{ items: RssItem[]; retried: boolean }> {
        try {
            return { items: await fetchFeed(name, url), retried: false };
        } catch (e) {
            if (!isTransientFetchError(String(e)) || !this.isLive(run)) throw e;
            await sleep(this.feedRetryDelayMs);
            if (!this.isLive(run)) throw e;
            return { items: await fetchFeed(name, url), retried: true };
        }
    }

    /** Esegue `task` quando c'è un posto libero tra le letture verso quel server. */
    private async withHostSlot<T>(url: string, task: () => Promise<T>): Promise<T> {
        const host = hostOf(url);
        while ((this.hostActive.get(host) ?? 0) >= PER_HOST_CONCURRENCY) {
            await new Promise<void>(resolve => {
                const waiters = this.hostWaiters.get(host) ?? [];
                waiters.push(resolve);
                this.hostWaiters.set(host, waiters);
            });
        }
        this.hostActive.set(host, (this.hostActive.get(host) ?? 0) + 1);
        try {
            return await task();
        } finally {
            const left = (this.hostActive.get(host) ?? 1) - 1;
            if (left > 0) this.hostActive.set(host, left);
            else this.hostActive.delete(host);
            const waiters = this.hostWaiters.get(host);
            const next = waiters?.shift();
            if (waiters && waiters.length === 0) this.hostWaiters.delete(host);
            next?.();
        }
    }

    private async processFeed(bot: BotConfig, feed: FeedConfig, cutoffTime: number, run: number) {
        try {
            const tag = `[${bot.name}]`;
            TitanLogger.log(`  📡 ${tag} Fetching: ${feed.name}`, {
                type: 'source-start', bot: bot.name, source: feed.name
            });

            let items: RssItem[];
            if (feed.type === 'youtube') {
                items = await fetchYouTubeVideos(feed.url);
            } else {
                const read = await this.readFeedOnce(feed.url, feed.name, run);
                // La lettura può venire da un altro bot: il nome della sorgente è quello di questo.
                items = read.items.map(item => ({ ...item, feedName: feed.name }));
                if (read.retried) {
                    TitanLogger.log(tm('feedRetried', { bot: bot.name, feed: feed.name }), 'warn');
                }
            }

            if (!this.isLive(run)) return;

            // SAFETY CHECK: il fetch è asincrono e può durare secondi; nel frattempo l'utente
            // può aver eliminato il bot (CASCADE) dalla Dashboard.
            if (!BotManager.botExists(bot.id)) {
                TitanLogger.log(tm('botDeletedDuringFetch', { bot: bot.name }), 'warn');
                return;
            }

            TitanLogger.log(`  📋 ${tag} ${items.length} items da ${feed.name}`);

            // Aggiorna il timestamp dell'ultimo fetch (F5) — anche se non ci sono nuovi item
            BotManager.updateFeedLastFetch(feed.id);
            BotManager.recordFeedResult(feed.id, { ok: true, count: items.length });

            let newCount = 0;
            let skipCount = 0;
            let alreadyProcessedCount = 0;
            let deferredCount = 0;
            // I contenuti esclusi dal filtro non si marcano (cambiando il filtro devono poter
            // passare), quindi tornano a ogni giro: una riga ciascuno riempiva il diario.
            let filteredCount = 0;
            const toPublish: RssItem[] = [];
            const contentType = contentTypeOf(feed);

            for (const item of items) {
                if (!this.isLive(run)) break;

                // --- TRIPLE-LOCK CUTOFF SECURITY (Fix Anti-Spam Definitivo) ---
                const itemTime = item.pubDate ? item.pubDate.getTime() : 0;

                // 1. Data invalida (NaN, 0) o fallback di sicurezza (anno 2000, usato da youtube.ts
                //    quando lo scraping della data fallisce): scarta. NaN bypasserebbe i confronti.
                if (isNaN(itemTime) || itemTime <= Date.UTC(2000, 0, 1)) {
                    skipCount++;
                    continue;
                }

                // 2. Precedente alla data di partenza del bot: scarta.
                if (itemTime < cutoffTime) {
                    skipCount++;
                    continue;
                }

                // 3. Deduplica (hash URL + hash titolo) — scoped per content_type (IronShield v2)
                if (BotManager.isProcessed(bot.id, item.id, feed.id, item.title, contentType)) {
                    alreadyProcessedCount++;
                    continue;
                }

                if (!passesKeywordFilter(item, feed.keyword_filter)) {
                    filteredCount++;
                    continue;
                }

                // F9 Digest Mode: se il feed ha un digest_interval, accoda nel buffer invece di pubblicare subito
                if (feed.digest_interval) {
                    BotManager.addToDigestQueue(bot.id, feed.id, item);
                    BotManager.markProcessed(bot.id, feed.id, item.id, item.title, contentType);
                    TitanLogger.log(`  📋 ${tag} Buffered for digest: ${item.title}`, {
                        type: 'item-found', bot: bot.name, source: feed.name, title: item.title
                    });
                    newCount++;
                    continue;
                }

                if (!isTimeAllowed(bot.send_from, bot.send_until)) {
                    const added = BotManager.addToPendingQueue(bot.id, feed.id, item);
                    if (added) TitanLogger.log(`  🌙 ${tag} Quiet hours — salvato in coda persistente: ${item.title}`, {
                        type: 'item-deferred', bot: bot.name, source: feed.name, title: item.title
                    });
                    deferredCount++;
                    continue;
                }

                toPublish.push(item);
                newCount++;
            }

            // Il feed arriva dal più recente al più vecchio. Pubblicati in quell'ordine, tre
            // episodi nuovi finivano sul canale al contrario: il più vecchio come ultimo
            // messaggio. Si accodano invece in ordine cronologico, come già la coda delle ore
            // di silenzio.
            toPublish.sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime());
            for (const item of toPublish) {
                TitanLogger.log(`  🆕 ${tag} Added to queue: ${item.title}`, {
                    type: 'item-found', bot: bot.name, source: feed.name, title: item.title
                });
                this.publishQueue.push({ botId: bot.id, botName: bot.name, feed, item, retryCount: 0, fromPending: false });
            }

            if (filteredCount > 0) {
                TitanLogger.log(`  🔍 ${tag} ${feed.name}: ${filteredCount} contenuti esclusi dal filtro per parole chiave.`);
            }

            if (newCount === 0) {
                let msg = `No updates for ${feed.name}`;
                if (skipCount > 0) msg += ` (${skipCount} skipped due to cutoff date)`;
                if (alreadyProcessedCount > 0) msg += ` (${alreadyProcessedCount} already processed)`;
                if (deferredCount > 0) msg += ` (${deferredCount} deferred to quiet hours queue)`;
                TitanLogger.log(`  ℹ️ ${tag} ${msg}`);
            }

        } catch (e) {
            TitanLogger.log(tm('feedFailed', { feed: feed.name, error: String(e) }), 'error');
            try {
                BotManager.recordFeedResult(feed.id, { ok: false, error: e instanceof Error ? e.message : String(e) });
            } catch { /* la sorgente può essere stata eliminata nel frattempo */ }
            if (feed.type === 'youtube' && !this.hasNotifiedYoutubeError) {
                this.hasNotifiedYoutubeError = true;
                BrowserWindow.getAllWindows().forEach(win => {
                    if (!win.isDestroyed()) {
                        win.webContents.send('youtube-api-error');
                    }
                });
            }
        }
    }

    /** Drena la coda quiet hours per un bot: se le ore di silenzio sono terminate,
     *  sposta gli item persistenti in publishQueue in ordine cronologico. */
    private drainPendingQueue(bot: BotConfig, run: number) {
        if (!isTimeAllowed(bot.send_from, bot.send_until)) return;

        const pending = BotManager.getPendingQueue(bot.id);
        if (pending.length === 0) return;

        const feedMap = new Map(BotManager.getFeeds(bot.id).map(f => [f.id, f]));
        TitanLogger.log(`  🌅 [${bot.name}] Quiet hours terminate — recupero ${pending.length} item dalla coda`);

        for (const p of pending) {
            if (!this.isLive(run)) break;

            // Feed eliminato nel frattempo: rimuovi dalla coda silenziosamente
            const feed = feedMap.get(p.feed_id);
            if (!feed) {
                BotManager.removePendingItem(p.id);
                continue;
            }

            // Già processato (es. lo stesso item era ancora nel backlog del feed e inviato regolarmente)
            if (BotManager.isProcessed(bot.id, p.item_id, p.feed_id, p.item_title ?? undefined, contentTypeOf(feed))) {
                BotManager.removePendingItem(p.id);
                continue;
            }

            const item: RssItem = {
                id: p.item_id,
                title: p.item_title || '',
                link: p.item_link,
                pubDate: new Date(p.item_date),
                summary: p.item_summary || '',
                image: p.item_image || undefined,
                feedName: feed.name
            };

            // Rimuovi dalla pending_queue e accoda per l'invio. Se l'invio poi non riesce per
            // un guasto, il job torna nella pending_queue (vedi `fromPending`).
            BotManager.removePendingItem(p.id);
            this.publishQueue.push({ botId: bot.id, botName: bot.name, feed, item, retryCount: 0, fromPending: true });
            TitanLogger.log(`  🌅 [${bot.name}] Recuperato da quiet hours → coda invio: ${item.title}`);
        }
    }

    /** Rimette in coda «ore di silenzio» i job che venivano da lì: non devono andare persi. */
    private returnToPending(jobs: PublishJob[]) {
        for (const job of jobs) {
            if (!job.fromPending) continue;
            try {
                BotManager.addToPendingQueue(job.botId, job.feed.id, job.item);
            } catch (e) {
                TitanLogger.log(tm('requeueFailed', { bot: job.botName, title: job.item.title, error: String(e) }), 'error');
            }
        }
    }

    private async processPublishQueue(run: number) {
        this.isPublishing = true;

        try {
            while (this.isLive(run) && this.publishQueue.length > 0) {
                const job = this.publishQueue.shift();
                if (!job) continue;

                // Ogni job è isolato: un errore non deve far rigettare l'intera promise né
                // bloccare il consumo dei job successivi.
                try {
                    const { feed, item } = job;
                    const contentType = contentTypeOf(feed);

                    // Configurazione letta adesso, non quella del momento dell'accodamento:
                    // token, canale e template modificati nel frattempo valgono da subito.
                    const bot = BotManager.getBot(job.botId);
                    if (!bot) {
                        TitanLogger.log(tm('jobBotDeleted', { bot: job.botName }), 'warn');
                        continue;
                    }
                    if (!bot.is_active) {
                        // Disattivato a metà giro: niente invio, e niente marcatura — se il bot
                        // viene riattivato, il contenuto ancora nel feed tornerà da sé.
                        this.returnToPending([job]);
                        continue;
                    }

                    // DEDUP CHECK: drainPendingQueue e processFeed nello stesso ciclo possono
                    // accodare lo stesso contenuto due volte (markProcessed avviene solo dopo l'invio).
                    if (BotManager.isProcessed(bot.id, item.id, feed.id, item.title, contentType)) {
                        TitanLogger.log(`  ⏭️ [${bot.name}] Skip duplicato in coda: ${item.title}`);
                        continue;
                    }

                    const tag = `[${bot.name}]`;
                    const client = this.getClient(bot);

                    let template: string | null;
                    if (feed.type === 'podcast') template = bot.template_podcast || null;
                    else if (feed.type === 'youtube') template = bot.template_youtube || null;
                    else template = bot.template_news || null;

                    let result: SendResult;
                    try {
                        result = await client.sendFormattedMessage(item, template, feed.type, { silent: isMuted(bot) });
                    } catch (err) {
                        result = { ok: false, kind: 'transient', error: String(err) };
                    }

                    if (result.ok) {
                        BotManager.markProcessed(bot.id, feed.id, item.id, item.title, contentType);
                        this.publishedInScan++;
                        TitanLogger.log(`  ✅ ${tag} Sent: ${item.title}`, {
                            type: 'item-published', bot: bot.name, source: feed.name, title: item.title
                        });

                        if (bot.notifications_enabled && Notification.isSupported()) {
                            new Notification({
                                title: `Titan: ${bot.name}`,
                                body: tm('notifySent', { title: item.title }),
                            }).show();
                        }

                        await new Promise(resolve => setTimeout(resolve, 3000));
                        continue;
                    }

                    switch (result.kind) {
                        case 'aborted':
                            // Client sostituito (token o canale cambiati) a motore acceso: si riprova col nuovo.
                            if (this.isLive(run)) this.publishQueue.push(job);
                            break;

                        case 'transient':
                            if (job.retryCount < MAX_RETRIES) {
                                TitanLogger.log(tm('sendRetry', { bot: bot.name, n: String(job.retryCount + 1), max: String(MAX_RETRIES + 1), title: item.title }), 'warn');
                                this.publishQueue.push({ ...job, retryCount: job.retryCount + 1 });
                            } else {
                                // NON si marca come pubblicato: il contenuto è ancora nel feed e torna
                                // al prossimo giro. Prima veniva dato per inviato — e perso per sempre —
                                // dopo pochi secondi di Telegram irraggiungibile.
                                TitanLogger.log(tm('sendGaveUp', { bot: bot.name, title: item.title, error: result.error }), 'warn');
                                this.returnToPending([job]);
                            }
                            break;

                        case 'config': {
                            // Token, canale o permessi: tutti gli altri invii del bot fallirebbero allo
                            // stesso modo. Si fermano qui, senza marcare nulla: ripartono da soli appena
                            // l'utente corregge la configurazione.
                            const sameBot = this.publishQueue.filter(j => j.botId === bot.id);
                            this.publishQueue = this.publishQueue.filter(j => j.botId !== bot.id);
                            this.returnToPending([job, ...sameBot]);
                            TitanLogger.log(tm('botRejected', { bot: bot.name, error: result.error, n: String(sameBot.length + 1) }), 'error');
                            break;
                        }

                        case 'rejected':
                            // Telegram rifiuta proprio questo messaggio, anche senza anteprima: ritentare
                            // darebbe lo stesso esito a ogni giro. Si salta, dicendolo.
                            TitanLogger.log(tm('itemRejected', { bot: bot.name, title: item.title, error: result.error }), 'error');
                            BotManager.markProcessed(bot.id, feed.id, item.id, item.title, contentType);
                            break;
                    }
                } catch (jobError) {
                    TitanLogger.log(tm('jobFailed', { bot: job.botName, title: job.item?.title ?? '?', error: String(jobError) }), 'error');
                }
            }
        } finally {
            if (run === this.runId) this.isPublishing = false;
            // La coda è vuota (o il motore è stato fermato): il giro si chiude qui, con il
            // conto reale dei contenuti finiti sul canale. `emitScanEnd` tace a motore fermo.
            this.emitScanEnd(run);
        }
    }

    /**
     * F9 Digest: invia i digest scaduti per il bot dato.
     *
     * Un feed a cui l'utente ha tolto il digest può avere ancora contenuti in coda, già segnati
     * come pubblicati: prima restavano lì per sempre, perché qui si guardavano solo i feed con
     * il digest attivo. Ora partono subito, in un ultimo digest.
     *
     * Il digest rispetta le ore di silenzio come ogni altro invio: aspetta la loro fine.
     */
    private async processDigests(bot: BotConfig, run: number) {
        const queued = new Set(BotManager.digestFeedIds(bot.id));
        const feeds = BotManager.getFeeds(bot.id).filter(f => f.is_active && (f.digest_interval || queued.has(f.id)));
        if (feeds.length === 0) return;
        if (!isTimeAllowed(bot.send_from, bot.send_until)) return;

        for (const feed of feeds) {
            if (!this.isLive(run)) break;
            const flushing = !feed.digest_interval;
            const interval = feed.digest_interval ?? 0;
            const lastSent = feed.digest_last_sent ? parseUtcTimestamp(feed.digest_last_sent) : 0;
            if (!flushing && Date.now() - lastSent < interval * 60 * 1000) continue;

            const items = BotManager.getDigestQueue(bot.id, feed.id);

            // Coda vuota: avanza il timer per non ri-controllare inutilmente al prossimo ciclo.
            if (items.length === 0) {
                BotManager.updateFeedDigestLastSent(feed.id);
                continue;
            }

            const { text, included } = buildDigestMessage(feed.name, items, 20, {
                one: tm('digestOne'), many: tm('digestMany'), read: tm('digestRead'), more: tm('digestMore'),
            });
            const sentIds = items.slice(0, included).map(it => it.item_id);
            const result = await this.getClient(bot).sendMessage(text, { silent: isMuted(bot) });

            if (result.ok) {
                // Si tolgono dalla coda SOLO i contenuti finiti nel messaggio: prima si svuotava
                // tutta la coda anche quando il digest ne mostrava i primi venti, e il resto
                // spariva senza mai essere pubblicato. Ora aspetta il digest successivo.
                BotManager.updateFeedDigestLastSent(feed.id);
                BotManager.removeDigestItems(bot.id, feed.id, sentIds);
                TitanLogger.log(`  📋 [${bot.name}] ${flushing ? 'Ultimo digest (digest disattivato)' : 'Digest inviato'} per "${feed.name}": ${included} item${items.length > included ? ` (${items.length - included} al prossimo)` : ''}`);
            } else if (result.kind === 'rejected') {
                BotManager.updateFeedDigestLastSent(feed.id);
                BotManager.removeDigestItems(bot.id, feed.id, sentIds);
                TitanLogger.log(tm('digestRejected', { bot: bot.name, feed: feed.name, error: result.error, n: String(included) }), 'error');
            } else if (result.kind !== 'aborted') {
                TitanLogger.log(tm('digestFailed', { bot: bot.name, feed: feed.name, error: result.error }), 'warn');
            }
        }
    }
}

// Lazy singleton: istanziato solo al primo accesso, non all'import del modulo.
// Evita side-effect al momento del require e permette reset nei test.
let _botEngine: BotEngine | null = null;
export function getBotEngine(): BotEngine {
    if (!_botEngine) _botEngine = new BotEngine();
    return _botEngine;
}
