import { Telegram } from 'telegraf';
import { TitanLogger } from '../logger';
import { tm } from '../i18n';
import { classifyTelegramError, escapeHtml, escapeUrl, normalizeChannelId, tidyMessage, type TelegramErrorKind } from './rules';

/**
 * Esito di un invio. Chi chiama decide cosa fare del contenuto in base a `kind`
 * (vedi `classifyTelegramError` in rules.ts) — prima l'esito era un booleano, e un
 * guasto di rete di due minuti valeva quanto un messaggio rifiutato: in entrambi i
 * casi il contenuto finiva marcato come pubblicato senza esserlo mai stato.
 */
export type SendResult =
    | { ok: true }
    | { ok: false; kind: TelegramErrorKind | 'aborted'; error: string };

export interface SendOptions {
    /** Pubblica senza suono: gli iscritti ricevono il messaggio senza squillo né vibrazione */
    silent?: boolean;
}

/**
 * Il modello che il motore usa quando il bot non ha un template per quel tipo di sorgente,
 * nella lingua dell'app: in italiano è identico a quello di sempre; con l'interfaccia in
 * inglese i messaggi dicono «Read the full article» invece di «Leggi l'articolo completo».
 */
export function defaultTemplate(type: 'podcast' | 'news' | 'youtube'): string {
    if (type === 'podcast') return tm('tplPodcast');
    if (type === 'youtube') return tm('tplYoutube');
    return tm('tplNews');
}

/** Il messaggio di un contenuto: template riempito, campi messi in sicurezza, anteprima in testa. */
export function renderItemMessage(item: any, template: string): string {
    // Escape di TUTTI i campi per prevenire errori di parsing HTML Telegram
    // (URL con '&' causano "Bad Request: can't parse entities")
    const safeImage = escapeUrl(item.image);
    const text = template
        .replace(/\{\{title\}\}/g, escapeHtml(String(item.title || '')))
        .replace(/\{\{link\}\}/g, escapeUrl(item.link || ''))
        .replace(/\{\{feedName\}\}/g, escapeHtml(String(item.feedName || '')))
        .replace(/\{\{summary\}\}/g, item.summary ? escapeHtml(String(item.summary)) : '');

    // L'anteprima: un link invisibile all'immagine, che Telegram mostra sopra il testo.
    const previewHack = safeImage ? `<a href="${safeImage}">&#8203;</a>` : '';
    return previewHack + tidyMessage(text);
}

/**
 * Tempo massimo di una singola chiamata a Telegram. Telegraf ne ha uno suo di 500 secondi:
 * una connessione rimasta appesa (il PC che si risveglia, il Wi-Fi che cambia) teneva ferma
 * la coda di invio di **tutti** i bot per otto minuti a tentativo. Un invio normale dura meno
 * di un secondo; il margine resta largo perché un messaggio arrivato a Telegram, ma la cui
 * risposta si perde, al tentativo successivo uscirebbe due volte.
 *
 * L'arresto del motore, invece, non interrompe la chiamata in volo, per la stessa ragione:
 * se il messaggio è già partito, l'esito va registrato.
 */
const SEND_TIMEOUT_MS = 45_000;

/**
 * Il tipo di segnale che dichiara telegraf viene da un vecchio shim di AbortController, non
 * da quello di Node: a runtime node-fetch accetta il segnale nativo, solo i tipi divergono.
 */
type TelegrafSignal = NonNullable<NonNullable<Parameters<Telegram['callApi']>[2]>['signal']>;

/** Pause tra i tentativi per gli errori transitori: ~35 secondi in tutto. */
const TRANSIENT_BACKOFF_MS = [5000, 10000, 20000];
/** Tetto all'attesa chiesta da Telegram: oltre, si lascia il contenuto al giro successivo. */
const MAX_FLOOD_WAIT_S = 120;

export class TelegramClient {
    private client: Telegram;
    private channelId: string;
    private aborted: boolean = false;

    /** Argomento di un gruppo con argomenti: i messaggi vanno lì invece che nel «Generale». */
    private topicId: number | null;

    constructor(token: string, channelId: string, topicId: number | null = null) {
        this.client = new Telegram(token);
        this.channelId = normalizeChannelId(channelId);
        this.topicId = topicId;
    }

    /**
     * Interrompe i tentativi in corso. È definitivo per questa istanza: il motore crea
     * un client nuovo quando riparte o quando cambiano token o canale. Prima `sendMessage`
     * rimetteva `aborted = false` a ogni chiamata, e un invio partito da una coda vecchia
     * poteva riattivare un client già fermato.
     */
    abort() {
        this.aborted = true;
    }

    async sendFormattedMessage(item: any, template: string | null, type: 'podcast' | 'news' | 'youtube', options: SendOptions = {}): Promise<SendResult> {
        const custom = template && template.trim() !== '' ? template : null;
        const result = await this.sendMessage(renderItemMessage(item, custom ?? defaultTemplate(type)), options);

        // Un template personalizzato rifiutato da Telegram (un tag non chiuso, un'entità
        // sbagliata) farebbe saltare ogni contenuto di quel tipo, uno dopo l'altro. Si riprova
        // con il modello predefinito: il contenuto esce con l'aspetto standard invece di perdersi.
        if (!result.ok && result.kind === 'rejected' && custom) {
            this.logToUI(tm('templateRejected', { error: result.error, title: String(item.title || '') }), 'warn');
            return this.sendMessage(renderItemMessage(item, defaultTemplate(type)), options);
        }
        return result;
    }

    async sendMessage(text: string, options: SendOptions = {}): Promise<SendResult> {
        let transientAttempts = 0;
        let floodWaits = 0;
        let previewDisabled = false;

        while (true) {
            if (this.aborted) {
                return { ok: false, kind: 'aborted', error: 'engine stopped' };
            }

            try {
                // callApi invece di sendMessage: è l'unica via di telegraf che accetta un segnale,
                // e senza segnale una connessione appesa aspettava i suoi 500 secondi.
                await this.client.callApi('sendMessage', {
                    chat_id: this.channelId,
                    ...(this.topicId ? { message_thread_id: this.topicId } : {}),
                    text,
                    parse_mode: 'HTML',
                    disable_notification: options.silent === true,
                    link_preview_options: previewDisabled
                        ? { is_disabled: true }
                        : { is_disabled: false, show_above_text: true },
                }, { signal: AbortSignal.timeout(SEND_TIMEOUT_MS) as unknown as TelegrafSignal });
                return { ok: true };
            } catch (e) {
                const info = classifyTelegramError(e);

                if (info.kind === 'flood') {
                    const wait = info.retryAfter ?? 5;
                    if (wait > MAX_FLOOD_WAIT_S || floodWaits >= 3) {
                        this.logToUI(tm('floodTooLong', { wait: String(wait) }), 'warn');
                        return { ok: false, kind: 'transient', error: info.description };
                    }
                    floodWaits++;
                    this.logToUI(tm('floodWait', { wait: String(wait) }), 'warn');
                    if (await this.abortableSleep(wait * 1000)) return { ok: false, kind: 'aborted', error: 'engine stopped' };
                    continue;
                }

                if (info.kind === 'config') {
                    // Token, canale o permessi: ritentare non cambia nulla finché l'utente non corregge.
                    return { ok: false, kind: 'config', error: info.description };
                }

                if (info.kind === 'rejected') {
                    // Unico ripiego sensato per un rifiuto: togliere l'anteprima del link, che è
                    // la parte del messaggio più spesso contestata. Se non basta, il rifiuto è definitivo.
                    if (!previewDisabled) {
                        previewDisabled = true;
                        this.logToUI(tm('previewRetry', { error: info.description }), 'warn');
                        continue;
                    }
                    return { ok: false, kind: 'rejected', error: info.description };
                }

                // transient
                if (transientAttempts >= TRANSIENT_BACKOFF_MS.length) {
                    return { ok: false, kind: 'transient', error: info.description };
                }
                const pause = TRANSIENT_BACKOFF_MS[transientAttempts++];
                this.logToUI(tm('networkRetry', { n: String(transientAttempts), max: String(TRANSIENT_BACKOFF_MS.length), error: info.description }), 'warn');
                if (await this.abortableSleep(pause)) return { ok: false, kind: 'aborted', error: 'engine stopped' };
            }
        }
    }

    /** Sleep that can be interrupted by abort(). Returns true if aborted. */
    private abortableSleep(ms: number): Promise<boolean> {
        return new Promise(resolve => {
            const interval = 500; // check every 500ms
            let elapsed = 0;
            const timer = setInterval(() => {
                elapsed += interval;
                if (this.aborted || elapsed >= ms) {
                    clearInterval(timer);
                    resolve(this.aborted);
                }
            }, interval);
        });
    }

    /** Log unificato tramite TitanLogger (visibile sia in console che nella UI) */
    private logToUI(message: string, level?: 'warn' | 'error'): void {
        TitanLogger.log(message, level);
    }
}
