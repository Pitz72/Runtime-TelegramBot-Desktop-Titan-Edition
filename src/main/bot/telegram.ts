
import { Telegram } from 'telegraf';
import { BrowserWindow } from 'electron';

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

    /** Call this to abort any in-progress retry loops */
    abort() {
        this.aborted = true;
    }

    async sendFormattedMessage(item: any, template: string | null, type: 'podcast' | 'news' | 'youtube'): Promise<boolean> {
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

        // Parsing Logica
        text = text
            .replace(/\{\{title\}\}/g, this.escape(item.title || ''))
            .replace(/\{\{link\}\}/g, item.link || '')
            .replace(/\{\{feedName\}\}/g, this.escape(item.feedName || ''))
            .replace(/\{\{summary\}\}/g, item.summary ? this.escape(item.summary) : '');

        // Image hack prepended to formatting
        const previewHack = item.image ? `<a href="${item.image}">&#8203;</a>` : "";
        const finalMessage = previewHack + text;

        return this.sendMessage(finalMessage);
    }

    async sendMessage(text: string): Promise<boolean> {
        const maxRetries = 5;
        this.aborted = false;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            // Check abort before each attempt
            if (this.aborted) {
                this.logToUI(`🛑 Send aborted (engine stopped).`);
                return false;
            }

            try {
                await this.client.sendMessage(this.channelId, text, {
                    parse_mode: 'HTML',
                    link_preview_options: {
                        is_disabled: false,
                        show_above_text: true,
                    }
                });
                return true;
            } catch (e: any) {
                const errorMsg = e.response?.description || e.message || String(e);

                // FloodWait: Telegram says to wait
                if (e.response?.parameters?.retry_after) {
                    const waitTime = e.response.parameters.retry_after;
                    this.logToUI(`⏳ FloodWait: waiting ${waitTime}s (attempt ${attempt}/${maxRetries})`);
                    if (await this.abortableSleep(waitTime * 1000)) return false;
                    continue;
                }

                // Network errors: wait 10s
                if (errorMsg.includes('ETIMEOUT') || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('network')) {
                    this.logToUI(`⚠️ Network error (attempt ${attempt}/${maxRetries}): ${errorMsg}`);
                    if (await this.abortableSleep(10000)) return false;
                    continue;
                }

                // Fatal API errors (bad token, chat not found, etc.) - don't retry
                if (errorMsg.includes('chat not found') || errorMsg.includes('bot was blocked') || errorMsg.includes('Unauthorized')) {
                    this.logToUI(`❌ Fatal Telegram error: ${errorMsg}`);
                    return false;
                }

                // Other errors
                this.logToUI(`❌ Telegram error (attempt ${attempt}/${maxRetries}): ${errorMsg}`);

                if (attempt === maxRetries) {
                    // Try without preview as last resort
                    try {
                        this.logToUI(`🔄 Last attempt without link preview...`);
                        await this.client.sendMessage(this.channelId, text, {
                            parse_mode: 'HTML',
                            link_preview_options: { is_disabled: true }
                        });
                        return true;
                    } catch {
                        // Final failure
                    }
                }

                if (await this.abortableSleep(5000)) return false;
            }
        }

        this.logToUI(`❌ Failed after ${maxRetries} attempts.`);
        return false;
    }

    private escape(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
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

    private logToUI(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        const logMsg = `[${timestamp}] ${message}`;
        console.log(logMsg);

        BrowserWindow.getAllWindows().forEach(win => {
            if (!win.isDestroyed()) {
                win.webContents.send('bot-log', logMsg);
            }
        });
    }
}
