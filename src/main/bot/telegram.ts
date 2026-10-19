import { Telegram } from 'telegraf';
import { TitanLogger } from '../logger';
import { classifyTelegramError, escapeHtml, escapeUrl, type TelegramErrorKind } from './rules';

/**
 * Esito di un invio. Chi chiama decide cosa fare del contenuto in base a `kind`
 * (vedi `classifyTelegramError` in rules.ts) — prima l'esito era un booleano, e un
 * guasto di rete di due minuti valeva quanto un messaggio rifiutato: in entrambi i
 * casi il contenuto finiva marcato come pubblicato senza esserlo mai stato.
 */
export type SendResult =
    | { ok: true }
    | { ok: false; kind: TelegramErrorKind | 'aborted'; error: string };

/** Pause tra i tentativi per gli errori transitori: ~35 secondi in tutto. */
const TRANSIENT_BACKOFF_MS = [5000, 10000, 20000];
/** Tetto all'attesa chiesta da Telegram: oltre, si lascia il contenuto al giro successivo. */
const MAX_FLOOD_WAIT_S = 120;

export class TelegramClient {
    private client: Telegram;
    private channelId: string;
    private aborted: boolean = false;

    constructor(token: string, channelId: string) {
        this.client = new Telegram(token);
        this.channelId = TelegramClient.normalizeChannelId(channelId);
    }

    /**
     * Normalizes channel ID from various formats:
     * - "https://t.me/MyChannel" → "@MyChannel"
     * - "t.me/MyChannel" → "@MyChannel"
     * - "MyChannel" → "@MyChannel"
     * - "@MyChannel" → "@MyChannel" (already correct)
     * - "-1001234567890" → "-1001234567890" (numeric ID, keep as-is)
     */
    private static normalizeChannelId(raw: string): string {
        let id = raw.trim();

        // Strip URL prefixes
        id = id.replace(/^https?:\/\//i, '');
        id = id.replace(/^t\.me\//i, '');

        // If it's a numeric ID (possibly negative), keep as-is
        if (/^-?\d+$/.test(id)) {
            return id;
        }

        // Ensure @ prefix for username-based channels
        if (!id.startsWith('@')) {
            id = '@' + id;
        }

        return id;
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

    async sendFormattedMessage(item: any, template: string | null, type: 'podcast' | 'news' | 'youtube'): Promise<SendResult> {
        let text = template;

        if (!text || text.trim() === '') {
            // Logica di Fallback: Se template è nullo o vuoto, usa costanti interne
            if (type === 'podcast') {
                text = "🎙 <b>{{feedName}}</b>\n\n<i>{{title}}</i>\n\n{{summary}}\n\n🎧 <a href='{{link}}'>Ascolta l'episodio</a>";
            } else if (type === 'youtube') {
                text = "🎬 <b>{{feedName}}</b>\n\n<b>{{title}}</b>\n\n▶️ <a href='{{link}}'>Guarda il video</a>";
            } else { // news
                text = "📰 <b>{{feedName}}</b>\n\n<b>{{title}}</b>\n\n🔗 <a href='{{link}}'>Leggi l'articolo completo</a>";
            }
        }

        // Escape di TUTTI i campi per prevenire errori di parsing HTML Telegram
        // (URL con '&' causano "Bad Request: can't parse entities")
        const safeLink = escapeUrl(item.link || '');
        const safeImage = escapeUrl(item.image);

        text = text
            .replace(/\{\{title\}\}/g, escapeHtml(String(item.title || '')))
            .replace(/\{\{link\}\}/g, safeLink)
            .replace(/\{\{feedName\}\}/g, escapeHtml(String(item.feedName || '')))
            .replace(/\{\{summary\}\}/g, item.summary ? escapeHtml(String(item.summary)) : '');

        // Image hack prepended to formatting
        const previewHack = safeImage ? `<a href="${safeImage}">&#8203;</a>` : "";
        const finalMessage = previewHack + text;

        return this.sendMessage(finalMessage);
    }

    async sendMessage(text: string): Promise<SendResult> {
        let transientAttempts = 0;
        let floodWaits = 0;
        let previewDisabled = false;

        while (true) {
            if (this.aborted) {
                return { ok: false, kind: 'aborted', error: 'engine stopped' };
            }

            try {
                await this.client.sendMessage(this.channelId, text, {
                    parse_mode: 'HTML',
                    link_preview_options: previewDisabled
                        ? { is_disabled: true }
                        : { is_disabled: false, show_above_text: true },
                });
                return { ok: true };
            } catch (e) {
                const info = classifyTelegramError(e);

                if (info.kind === 'flood') {
                    const wait = info.retryAfter ?? 5;
                    if (wait > MAX_FLOOD_WAIT_S || floodWaits >= 3) {
                        this.logToUI(`⚠️ Telegram chiede di attendere ${wait}s: contenuto rimandato al prossimo giro.`, 'warn');
                        return { ok: false, kind: 'transient', error: info.description };
                    }
                    floodWaits++;
                    this.logToUI(`⏳ FloodWait: attesa di ${wait}s richiesta da Telegram`, 'warn');
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
                        this.logToUI(`🔄 Telegram ha rifiutato il messaggio (${info.description}): nuovo tentativo senza anteprima`, 'warn');
                        continue;
                    }
                    return { ok: false, kind: 'rejected', error: info.description };
                }

                // transient
                if (transientAttempts >= TRANSIENT_BACKOFF_MS.length) {
                    return { ok: false, kind: 'transient', error: info.description };
                }
                const pause = TRANSIENT_BACKOFF_MS[transientAttempts++];
                this.logToUI(`⚠️ Errore di rete verso Telegram (tentativo ${transientAttempts}/${TRANSIENT_BACKOFF_MS.length}): ${info.description}`, 'warn');
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
