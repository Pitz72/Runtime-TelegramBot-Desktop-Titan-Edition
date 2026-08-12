import { fetchFeed } from './parser';
import { fetchYouTubeVideos, clearYouTubeCache } from './youtube';
import { TelegramClient } from './telegram';
import { BotManager } from './manager';
import { BotConfig, FeedConfig } from '../../shared/types';
import { TitanLogger } from '../logger';
import { app, BrowserWindow, Notification } from 'electron';

/** Filtra item RSS/YouTube in base al campo keyword_filter del feed (F4). */
function passesKeywordFilter(item: { title: string; summary: string }, feed: FeedConfig): boolean {
    if (!feed.keyword_filter) return true;
    try {
        const { include = [], exclude = [] } = JSON.parse(feed.keyword_filter) as { include?: string[]; exclude?: string[] };
        const text = `${item.title} ${item.summary}`.toLowerCase();
        if (include.length > 0 && !include.some(kw => text.includes(kw.toLowerCase()))) return false;
        if (exclude.some(kw => text.includes(kw.toLowerCase()))) return false;
        return true;
    } catch {
        return true;
    }
}

/**
 * Interpreta un timestamp del DB come UTC.
 * Le righe scritte da `datetime('now')` (formato "YYYY-MM-DD HH:MM:SS", UTC senza timezone)
 * verrebbero lette da `new Date()` come ora locale, sfasando i confronti di N ore.
 * Le righe nuove sono in ISO-UTC con 'Z' (vedi manager.updateFeedLastFetch) e vengono
 * parsate correttamente dal ramo `new Date()`.
 */
export function parseUtcTimestamp(s: string): number {
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
        return Date.parse(s.replace(' ', 'T') + 'Z');
    }
    return new Date(s).getTime();
}

/** Controlla se il feed ha superato il proprio intervallo di check (F5). */
function isFeedDue(feed: FeedConfig, bot: BotConfig): boolean {
    const interval = feed.check_interval ?? bot.check_interval ?? 15;
    if (!feed.last_fetch_at) return true;
    const elapsed = Date.now() - parseUtcTimestamp(feed.last_fetch_at);
    return elapsed >= interval * 60 * 1000;
}

interface PublishJob {
    bot: BotConfig;
    feed: FeedConfig;
    item: any;
    /** Numero di tentativi già effettuati (0 = primo invio) — F2 Retry Queue */
    retryCount: number;
}

const MAX_RETRIES = 3;

/**
 * Perf Fix B (v2.1.5): numero massimo di fetch RSS/Atom eseguiti in parallelo per bot.
 * Ogni feed colpisce di norma un host diverso, quindi 6 richieste concorrenti non
 * sovraccaricano un singolo server ma abbattono il tempo di ciclo con molti feed.
 * I feed YouTube restano fuori dal pool (seriali + throttle) per via dell'antibot Innertube.
 */
const RSS_FETCH_CONCURRENCY = 6;

export class BotEngine {
    private isRunning: boolean = false;
    private timeoutId: NodeJS.Timeout | null = null;
    private clients: Map<number, TelegramClient> = new Map();
    private publishQueue: PublishJob[] = [];
    private isPublishing: boolean = false;
    private hasNotifiedYoutubeError: boolean = false;

    constructor() { }

    /** Stato corrente del motore — usato dal renderer per sincronizzare la UI al mount. */
    isEngineRunning(): boolean {
        return this.isRunning;
    }

    private isTimeAllowed(from: string, until: string): boolean {
        const current = new Date().toTimeString().slice(0, 5);
        if (from <= until) {
            // Standard case (e.g., 08:00 - 22:00)
            return current >= from && current <= until;
        } else {
            // Night shift case (e.g., 22:00 - 06:00)
            return current >= from || current <= until;
        }
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;

        const appVersion = app.getVersion();

        // Broadcast startup message to Telegram
        const bots = BotManager.getBots();
        for (const bot of bots) {
            if (bot.is_active && bot.token) {
                try {
                    const client = this.getClient(bot);
                    const customTemplate = bot.template_startup;
                    const baseMessage = customTemplate && customTemplate.trim() !== ''
                        ? customTemplate
                        : `🟢 <b>${this.escapeHTML(bot.name)} Online</b>`;
                    const finalMessage = `${baseMessage}\n\n<pre>Runtime TelegramBot Desktop v${appVersion}</pre>`;
                    await client.sendMessage(finalMessage);
                } catch (e) {
                    TitanLogger.log(`❌ Failed to send startup message for ${bot.name}: ${e}`);
                }
            }
        }

        TitanLogger.log("🚀 Engine Started - Multi-Bot Mode");

        // Immediate check, then schedule next
        await this.checkLoop();
        this.scheduleNext();
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.timeoutId) clearTimeout(this.timeoutId);

        this.hasNotifiedYoutubeError = false;

        // Svuota la coda di invio
        this.publishQueue = [];
        this.isPublishing = false;

        // Abort all in-progress Telegram send operations
        this.clients.forEach(client => client.abort());
        this.clients.clear();

        // Invalida la cache YouTube alla fermata — fix #19
        clearYouTubeCache();

        TitanLogger.log("🛑 Engine Stopped");
    }

    /** Remove cached client and pending jobs when a bot is deleted */
    removeClient(botId: number) {
        const client = this.clients.get(botId);
        if (client) {
            client.abort();
            this.clients.delete(botId);
        }
        
        // Svuota immediatamente la coda di invio da eventuali job riferiti al bot eliminato
        this.publishQueue = this.publishQueue.filter(job => job.bot.id !== botId);
    }

    private getClient(bot: BotConfig): TelegramClient {
        if (!this.clients.has(bot.id)) {
            this.clients.set(bot.id, new TelegramClient(bot.token, bot.channel_id));
        }
        return this.clients.get(bot.id)!;
    }

    /** Calculate the minimum check interval across all active bots (in ms) */
    private getMinInterval(): number {
        const bots = BotManager.getBots().filter(b => b.is_active);
        if (bots.length === 0) return 15 * 60 * 1000; // default 15 min
        const minMinutes = Math.min(...bots.map(b => b.check_interval || 15));
        // Clamp: minimum 1 minute, maximum 120 minutes
        const clamped = Math.max(1, Math.min(120, minMinutes));
        return clamped * 60 * 1000;
    }

    private scheduleNext() {
        if (!this.isRunning) return;
        const interval = this.getMinInterval();
        const minutes = interval / 60000;
        TitanLogger.log(`⏳ Next check in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}...`);
        this.timeoutId = setTimeout(() => {
            // .catch + .finally: un errore non gestito in checkLoop non deve interrompere
            // il loop di scheduling (né propagarsi come unhandledRejection). Il prossimo
            // ciclo viene comunque pianificato.
            this.checkLoop()
                .catch(e => TitanLogger.log(`❌ Errore non gestito in checkLoop: ${e}`))
                .finally(() => this.scheduleNext());
        }, interval);
    }

    private async checkLoop() {
        if (!this.isRunning) return;

        const bots = BotManager.getBots();
        TitanLogger.log(`🔄 Checking ${bots.length} bots...`);

        for (const bot of bots) {
            if (!this.isRunning) break;
            if (!bot.is_active) {
                TitanLogger.log(`⏸️ Bot [${bot.name}] is disabled. Skipped.`);
                continue;
            }

            // Token illeggibile su questa macchina (es. DB importato da un altro PC, keychain
            // OS non disponibile): inutile tentare invii destinati a fallire con "Unauthorized".
            // Segnaliamo in modo azionabile e saltiamo il bot.
            if (!bot.token) {
                TitanLogger.log(`⚠️ Bot [${bot.name}]: token non leggibile su questa macchina — bot saltato. Apri le impostazioni del bot e reinserisci il token.`);
                continue;
            }

            try {
                const feeds = BotManager.getFeeds(bot.id);
                if (feeds.length === 0) {
                    TitanLogger.log(`⚠️ Bot [${bot.name}] has no feeds.`);
                    continue;
                }

                const client = this.getClient(bot);
                TitanLogger.log(`🤖 Bot [${bot.name}]: Checking ${feeds.length} feeds...`);

                // Drena la coda quiet hours prima di processare i nuovi feed
                try {
                    await this.drainPendingQueue(bot, client);
                } catch (e) {
                    TitanLogger.log(`  ❌ [${bot.name}] Errore drenaggio coda quiet hours: ${e}`);
                }

                const activeFeeds = feeds.filter(f => f.is_active);
                const skippedFeeds = feeds.length - activeFeeds.length;
                if (skippedFeeds > 0) {
                    TitanLogger.log(`   ⏸️ Bot [${bot.name}]: ${skippedFeeds} feed disabilitati, saltati.`);
                }

                // F5: filtra i feed effettivamente da controllare in questo ciclo (intervallo scaduto).
                const dueFeeds = activeFeeds.filter(feed => {
                    if (!isFeedDue(feed, bot)) {
                        TitanLogger.log(`  ⏱️ [${feed.name}] Intervallo non scaduto, saltato.`);
                        return false;
                    }
                    return true;
                });

                // --- Perf Fix B (v2.1.5): fetch RSS in parallelo, YouTube seriale ---
                // I feed RSS/Atom si scaricano in un pool con concorrenza limitata: il tempo di ciclo
                // passa dalla *somma* dei fetch al fetch più lento del gruppo. Il processamento degli item
                // dopo il fetch è sincrono (better-sqlite3), quindi non c'è race tra feed sullo stesso bot.
                const rssFeeds = dueFeeds.filter(f => f.type !== 'youtube');
                const youtubeFeeds = dueFeeds.filter(f => f.type === 'youtube');

                await this.runPool(rssFeeds, RSS_FETCH_CONCURRENCY, async (feed) => {
                    if (!this.isRunning) return;
                    try {
                        await this.processFeed(bot, client, feed);
                    } catch (feedError) {
                        TitanLogger.log(`  ❌ [${feed.name}] Critical error: ${feedError}`);
                    }
                });

                // I feed YouTube restano SERIALI e distanziati (throttle 5s): l'antibot Innertube
                // (issue LuanRT/YouTube.js#1158, #1166) penalizza i burst ravvicinati di chiamate,
                // che degenerano in risposte vuote. La pausa si salta sull'ultimo del gruppo.
                for (let i = 0; i < youtubeFeeds.length; i++) {
                    if (!this.isRunning) break;
                    const feed = youtubeFeeds[i];

                    try {
                        await this.processFeed(bot, client, feed);
                    } catch (feedError) {
                        TitanLogger.log(`  ❌ [${feed.name}] Critical error: ${feedError}`);
                    }

                    if (i < youtubeFeeds.length - 1 && this.isRunning) {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }

                // Warning: coda troppo grande segnala un accumulo anomalo — fix #17
                if (this.publishQueue.length > 50) {
                    TitanLogger.log(`  ⚠️ [${bot.name}] Coda di invio grande: ${this.publishQueue.length} item in attesa.`);
                }

                // F9 Digest: invia i digest in scadenza per questo bot
                try {
                    await this.processDigests(bot, client);
                } catch (e) {
                    TitanLogger.log(`  ❌ [${bot.name}] Errore digest: ${e}`);
                }

            } catch (e) {
                TitanLogger.log(`❌ Error processing bot ${bot.name}: ${e}`);
            }
        }

        // Avvio consumer se non è già in esecuzione e la coda non è vuota.
        // .catch obbligatorio: è fire-and-forget, senza handler una rejection qui
        // diventerebbe un unhandledRejection a livello di processo.
        if (this.publishQueue.length > 0 && !this.isPublishing) {
            this.processPublishQueue().catch(e => {
                this.isPublishing = false;
                TitanLogger.log(`❌ Errore non gestito in processPublishQueue: ${e}`);
            });
        }
    }

    /**
     * Esegue `worker` su tutti gli item con al massimo `concurrency` esecuzioni in parallelo
     * (Perf Fix B). Il worker gestisce i propri errori: qui non si intercetta nulla, così un
     * feed lento o fallito non blocca gli altri runner del pool.
     */
    private async runPool<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>): Promise<void> {
        if (items.length === 0) return;
        let cursor = 0;
        const size = Math.max(1, Math.min(concurrency, items.length));
        const runners = Array.from({ length: size }, async () => {
            while (cursor < items.length && this.isRunning) {
                const item = items[cursor++];
                await worker(item);
            }
        });
        await Promise.all(runners);
    }

    private async processFeed(bot: BotConfig, client: TelegramClient, feed: FeedConfig) {
        try {
            const tag = `[${bot.name}]`;

            const cutoffDate = new Date(bot.start_date);
            if (cutoffDate.getTime() > Date.now()) {
                TitanLogger.log(`  ⚠️ ${tag} ATTENZIONE: la start_date del bot (${bot.start_date}) è nel futuro — nessun item verrà pubblicato finché la data non viene raggiunta.`);
            }
            TitanLogger.log(`  📡 ${tag} Fetching: ${feed.name}`);

            let items;
            if (feed.type === 'youtube') {
                items = await fetchYouTubeVideos(feed.url);
            } else {
                items = await fetchFeed(feed.name, feed.url);
            }

            // SAFETY CHECK: Validazione post-fetch. Poiché il fetch è asincrono (può durare svariati secondi),
            // il bot potrebbe essere stato eliminato (CASCADE) in quel frangente dall'utente tramite la Dashboard.
            if (!BotManager.botExists(bot.id)) {
                TitanLogger.log(`  ⚠️ ${tag} Elaborazione interrotta: il bot è stato eliminato durante il fetch.`);
                return;
            }

            TitanLogger.log(`  📋 ${tag} ${items.length} items da ${feed.name}`);

            // Aggiorna il timestamp dell'ultimo fetch (F5) — anche se non ci sono nuovi item
            BotManager.updateFeedLastFetch(feed.id);

            let newCount = 0;
            let skipCount = 0;
            let alreadyProcessedCount = 0;
            let deferredCount = 0;

            for (const item of items) {
                if (!this.isRunning) break;

                // --- TRIPLE-LOCK CUTOFF SECURITY (Fix Anti-Spam Definitivo) ---
                const itemTime = item.pubDate ? item.pubDate.getTime() : 0;
                const cutoffTime = cutoffDate.getTime();

                // 1. Se la data dell'item è invalida (NaN, 0) o è il fallback di sicurezza (Anno 2000), scarta.
                // NaN bypasserebbe i confronti < e <= in JS — va escluso esplicitamente.
                // L'anno 2000 viene usato in youtube.ts come fallback se lo scraping fallisce.
                if (isNaN(itemTime) || itemTime <= Date.UTC(2000, 0, 1)) { // 1 Gennaio 2000 00:00:00 UTC
                    skipCount++;
                    continue;
                }

                // 2. Se l'item è precedente alla data di inizio del bot, scarta.
                if (itemTime < cutoffTime) {
                    skipCount++;
                    continue;
                }

                // 3. Verifica deduplica (Hash Titolo + Hash URL) — scoped per content_type (IronShield v2)
                if (BotManager.isProcessed(bot.id, item.id, feed.id, item.title, feed.type === 'youtube' ? 'youtube' : 'rss')) {
                    alreadyProcessedCount++;
                    continue;
                }
                // --------------------------------------------------------------

                if (!passesKeywordFilter(item, feed)) {
                    TitanLogger.log(`  🔍 ${tag} Filtrato da keyword: ${item.title}`);
                    continue;
                }

                // F9 Digest Mode: se il feed ha un digest_interval, accoda nel buffer invece di pubblicare subito
                if (feed.digest_interval) {
                    BotManager.addToDigestQueue(bot.id, feed.id, item);
                    BotManager.markProcessed(bot.id, feed.id, item.id, item.title, feed.type === 'youtube' ? 'youtube' : 'rss');
                    TitanLogger.log(`  📋 ${tag} Buffered for digest: ${item.title}`);
                    newCount++;
                    continue;
                }

                if (!this.isTimeAllowed(bot.send_from, bot.send_until)) {
                    const added = BotManager.addToPendingQueue(bot.id, feed.id, item);
                    if (added) TitanLogger.log(`  🌙 ${tag} Quiet hours — salvato in coda persistente: ${item.title}`);
                    deferredCount++;
                    continue;
                }

                TitanLogger.log(`  🆕 ${tag} Added to queue: ${item.title}`);
                this.publishQueue.push({ bot, feed, item, retryCount: 0 });
                newCount++;
            }

            if (newCount === 0) {
                let msg = `No updates for ${feed.name}`;
                if (skipCount > 0) msg += ` (${skipCount} skipped due to cutoff date)`;
                if (alreadyProcessedCount > 0) msg += ` (${alreadyProcessedCount} already processed)`;
                if (deferredCount > 0) msg += ` (${deferredCount} deferred to quiet hours queue)`;
                TitanLogger.log(`  ℹ️ ${tag} ${msg}`);
            }

        } catch (e) {
            TitanLogger.log(`  ❌ [${feed.name}] Processing error: ${e}`);
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
    private async drainPendingQueue(bot: BotConfig, client: TelegramClient) {
        if (!this.isTimeAllowed(bot.send_from, bot.send_until)) return;

        const pending = BotManager.getPendingQueue(bot.id);
        if (pending.length === 0) return;

        const feedMap = new Map(BotManager.getFeeds(bot.id).map(f => [f.id, f]));
        TitanLogger.log(`  🌅 [${bot.name}] Quiet hours terminate — recupero ${pending.length} item dalla coda`);

        for (const p of pending) {
            if (!this.isRunning) break;

            // Quiet hours rientrate a metà drenaggio (es. finestra corta notturna)
            if (!this.isTimeAllowed(bot.send_from, bot.send_until)) {
                TitanLogger.log(`  🌙 [${bot.name}] Quiet hours rientrate durante il drenaggio — item rimanenti restano in coda`);
                break;
            }

            // Feed eliminato nel frattempo: rimuovi dalla coda silenziosamente
            const feed = feedMap.get(p.feed_id);
            if (!feed) {
                BotManager.removePendingItem(p.id);
                continue;
            }

            // Già processato (es. lo stesso item era ancora nel backlog del feed e inviato regolarmente)
            if (BotManager.isProcessed(bot.id, p.item_id, p.feed_id, p.item_title ?? undefined, feed.type === 'youtube' ? 'youtube' : 'rss')) {
                BotManager.removePendingItem(p.id);
                continue;
            }

            const item = {
                id: p.item_id,
                title: p.item_title || '',
                link: p.item_link,
                pubDate: new Date(p.item_date),
                summary: p.item_summary || '',
                image: p.item_image || undefined,
                feedName: feed.name
            };

            // Rimuovi dalla pending_queue e accoda per l'invio.
            // Se il motore si interrompe tra questi due step, al ciclo successivo
            // l'item passerà di nuovo isProcessed → false e verrà re-accodato in pending_queue.
            BotManager.removePendingItem(p.id);
            this.publishQueue.push({ bot, feed, item, retryCount: 0 });
            TitanLogger.log(`  🌅 [${bot.name}] Recuperato da quiet hours → coda invio: ${item.title}`);
        }
    }

    private async processPublishQueue() {
        this.isPublishing = true;

        try {
            while (this.isRunning && this.publishQueue.length > 0) {
                const job = this.publishQueue.shift();
                if (!job) continue;

                // Ogni job è isolato: un errore (es. lock DB su markProcessed, token
                // malformato in getClient) non deve far rigettare l'intera promise né
                // bloccare il consumo dei job successivi.
                try {
                    const { bot, feed, item } = job;

                    // SAFETY CHECK: Validazione pre-publish. Evita che BotManager.markProcessed vada in crash (Foreign Key fail)
                    // se il bot originario della coda è stato eliminato prima del compimento dell'invio Telegram.
                    if (!BotManager.botExists(bot.id)) {
                        TitanLogger.log(`  ⚠️ [${bot.name}] Job scartato dalla coda: il bot originario è stato eliminato.`);
                        continue;
                    }

                    // DEDUP CHECK: item già processato. Può succedere quando drainPendingQueue e processFeed
                    // girano nello stesso ciclo — drain aggiunge l'item a publishQueue ma non lo marca in history
                    // (markProcessed avviene solo dopo il send), quindi processFeed lo trova ancora "nuovo" e
                    // lo accoda una seconda volta. Questo guard blocca il secondo invio.
                    if (BotManager.isProcessed(bot.id, item.id, feed.id, item.title, feed.type === 'youtube' ? 'youtube' : 'rss')) {
                        TitanLogger.log(`  ⏭️ [${bot.name}] Skip duplicato in coda: ${item.title}`);
                        continue;
                    }

                    const tag = `[${bot.name}]`;
                    const client = this.getClient(bot);

                    let success = false;

                    try {
                        let template: string | null = null;
                        if (feed.type === 'podcast') template = bot.template_podcast || null;
                        else if (feed.type === 'youtube') template = bot.template_youtube || null;
                        else template = bot.template_news || null;

                        success = await client.sendFormattedMessage(item, template, feed.type);
                    } catch (err) {
                        TitanLogger.log(`  ❌ ${tag} Telegram connection error: ${err}`);
                        success = false;
                    }

                    if (success) {
                        BotManager.markProcessed(bot.id, feed.id, item.id, item.title, feed.type === 'youtube' ? 'youtube' : 'rss');
                        TitanLogger.log(`  ✅ ${tag} Sent: ${item.title}`);

                        if (bot.notifications_enabled && Notification.isSupported()) {
                            new Notification({
                                title: `Titan: ${bot.name}`,
                                body: `Inviato: ${item.title}`
                            }).show();
                        }

                        await new Promise(resolve => setTimeout(resolve, 3000));
                    } else {
                        if (job.retryCount < MAX_RETRIES) {
                            TitanLogger.log(`  ⚠️ ${tag} Send failed (tentativo ${job.retryCount + 1}/${MAX_RETRIES}): ${item.title} — riaccodato`);
                            this.publishQueue.push({ ...job, retryCount: job.retryCount + 1 });
                        } else {
                            TitanLogger.log(`  ❌ ${tag} Contenuto NON inviato al canale dopo ${MAX_RETRIES} tentativi: "${item.title}" — marcato come processato per evitare loop infinito. Verificare la connessione Telegram.`);
                            BotManager.markProcessed(bot.id, feed.id, item.id, item.title, feed.type === 'youtube' ? 'youtube' : 'rss');
                        }
                    }
                } catch (jobError) {
                    TitanLogger.log(`  ❌ [${job.bot?.name ?? '?'}] Errore imprevisto durante l'elaborazione del job "${job.item?.title ?? '?'}": ${jobError} — job saltato.`);
                }
            }
        } finally {
            this.isPublishing = false;
        }
    }

    /** F9 Digest: invia i digest scaduti per il bot dato. */
    private async processDigests(bot: BotConfig, client: TelegramClient) {
        const feeds = BotManager.getFeeds(bot.id).filter(f => f.is_active && f.digest_interval);
        for (const feed of feeds) {
            if (!this.isRunning) break;
            const interval = feed.digest_interval!;
            const lastSent = feed.digest_last_sent ? parseUtcTimestamp(feed.digest_last_sent) : 0;
            if (Date.now() - lastSent < interval * 60 * 1000) continue;

            const items = BotManager.getDigestQueue(bot.id, feed.id);

            // Coda vuota: avanza il timer per non ri-controllare inutilmente al prossimo ciclo.
            if (items.length === 0) {
                BotManager.updateFeedDigestLastSent(feed.id);
                continue;
            }

            const capped = items.slice(0, 20);
            const header = `📋 <b>${this.escapeHTML(feed.name)}</b> — ${capped.length} ${capped.length === 1 ? 'contenuto' : 'contenuti'}\n\n`;
            const body = capped.map((it, i) =>
                `${i + 1}. <b>${this.escapeHTML(it.item_title || '')}</b>\n🔗 <a href="${this.escapeUrl(it.item_link || '')}">Leggi</a>`
            ).join('\n\n');

            const success = await client.sendMessage(header + body);
            if (success) {
                // Aggiorna il timer SOLO dopo invio confermato, poi svuota la coda.
                // Ordine critico: se clearDigestQueue fallisse dopo updateFeedDigestLastSent,
                // gli item verrebbero ri-inviati al ciclo successivo (doppio digest).
                // Con questo ordine, in caso di failure il timer non avanza e si riprova.
                BotManager.updateFeedDigestLastSent(feed.id);
                BotManager.clearDigestQueue(bot.id, feed.id);
                TitanLogger.log(`  📋 [${bot.name}] Digest inviato per "${feed.name}": ${capped.length} item`);
            } else {
                TitanLogger.log(`  ⚠️ [${bot.name}] Digest fallito per "${feed.name}" — verrà riprovato al prossimo ciclo`);
            }
        }
    }

    private escapeHTML(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /**
     * Rende un URL del feed sicuro dentro l'href dei digest.
     * Stessa regola di TelegramClient.escapeUrl: i caratteri che chiuderebbero l'attributo
     * (`'` `"` `<` `>`) vengono percent-encodati e gli schemi non http/https scartati,
     * altrimenti chi controlla il feed può iniettare HTML nel messaggio pubblicato.
     */
    private escapeUrl(url: string): string {
        if (!/^https?:\/\//i.test(url.trim())) return '';
        return url
            .replace(/%(?![0-9A-Fa-f]{2})/g, '%25')
            .replace(/'/g, '%27')
            .replace(/"/g, '%22')
            .replace(/</g, '%3C')
            .replace(/>/g, '%3E')
            .replace(/&(?!amp;)/g, '&amp;');
    }
}

// Lazy singleton: istanziato solo al primo accesso, non all'import del modulo.
// Evita side-effect al momento del require e permette reset nei test.
let _botEngine: BotEngine | null = null;
export function getBotEngine(): BotEngine {
    if (!_botEngine) _botEngine = new BotEngine();
    return _botEngine;
}
