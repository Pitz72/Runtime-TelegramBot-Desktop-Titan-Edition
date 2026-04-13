import { fetchFeed } from './parser';
import { fetchYouTubeVideos } from './youtube';
import { TelegramClient } from './telegram';
import { BotManager } from './manager';
import { BotConfig, FeedConfig } from '../../shared/types';
import { TitanLogger } from '../logger';
import { app, BrowserWindow, Notification } from 'electron';

interface PublishJob {
    bot: BotConfig;
    feed: FeedConfig;
    item: any;
}

export class BotEngine {
    private isRunning: boolean = false;
    private timeoutId: NodeJS.Timeout | null = null;
    private clients: Map<number, TelegramClient> = new Map();
    private publishQueue: PublishJob[] = [];
    private isPublishing: boolean = false;
    private hasNotifiedYoutubeError: boolean = false;

    constructor() { }

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
            if (bot.is_active) {
                try {
                    const client = this.getClient(bot);
                    const customTemplate = bot.template_startup;
                    const baseMessage = customTemplate && customTemplate.trim() !== ''
                        ? customTemplate
                        : `🟢 <b>${this.escapeHTML(bot.name)} Online</b>`;
                    const finalMessage = `${baseMessage}\n\n<pre>Titan Desktop v${appVersion}</pre>`;
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
            this.checkLoop().then(() => this.scheduleNext());
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

            try {
                const feeds = BotManager.getFeeds(bot.id);
                if (feeds.length === 0) {
                    TitanLogger.log(`⚠️ Bot [${bot.name}] has no feeds.`);
                    continue;
                }

                const client = this.getClient(bot);
                TitanLogger.log(`🤖 Bot [${bot.name}]: Checking ${feeds.length} feeds...`);

                for (const feed of feeds) {
                    if (!this.isRunning) break;
                    if (!feed.is_active) {
                        TitanLogger.log(`   ⏸️ Feed [${feed.name}] is disabled. Skipped.`);
                        continue;
                    }

                    try {
                        await this.processFeed(bot, client, feed);
                    } catch (feedError) {
                        TitanLogger.log(`  ❌ [${feed.name}] Critical error: ${feedError}`);
                    }
                }

            } catch (e) {
                TitanLogger.log(`❌ Error processing bot ${bot.name}: ${e}`);
            }
        }

        // Avvio consumer se non è già in esecuzione e la coda non è vuota
        if (this.publishQueue.length > 0 && !this.isPublishing) {
            this.processPublishQueue(); // fire and forget
        }
    }

    private async processFeed(bot: BotConfig, client: TelegramClient, feed: FeedConfig) {
        try {
            const tag = `[${bot.name}]`;

            const cutoffDate = new Date(bot.start_date);
            TitanLogger.log(`  📡 ${tag} Fetching: ${feed.name}`);

            let items;
            if (feed.type === 'youtube') {
                items = await fetchYouTubeVideos(feed.url);
            } else {
                items = await fetchFeed(feed.name, feed.url);
            }

            // SAFETY CHECK: Validazione post-fetch. Poiché il fetch è asincrono (può durare svariati secondi),
            // il bot potrebbe essere stato eliminato (CASCADE) in quel frangente dall'utente tramite la Dashboard.
            if (!BotManager.getBots().some((b: any) => b.id === bot.id)) {
                TitanLogger.log(`  ⚠️ ${tag} Elaborazione interrotta: il bot è stato eliminato durante il fetch.`);
                return;
            }

            TitanLogger.log(`  📋 ${tag} ${items.length} items da ${feed.name}`);

            let newCount = 0;
            let skipCount = 0;

            for (const item of items) {
                if (!this.isRunning) break;

                // Confronto millisecondi (più robusto contro errori di fuso orario)
                if (item.pubDate.getTime() < cutoffDate.getTime()) {
                    skipCount++;
                    continue;
                }

                if (BotManager.isProcessed(bot.id, item.id)) {
                    continue;
                }

                if (!this.isTimeAllowed(bot.send_from, bot.send_until)) {
                    TitanLogger.log(`  🌙 ${tag} Quiet hours active. Postponing: ${item.title}`);
                    continue;
                }

                TitanLogger.log(`  🆕 ${tag} Added to queue: ${item.title}`);
                this.publishQueue.push({ bot, feed, item });
                newCount++;
            }

            if (newCount === 0) {
                let msg = `No updates for ${feed.name}`;
                if (skipCount > 0) msg += ` (${skipCount} skipped due to cutoff date)`;
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

    private async processPublishQueue() {
        this.isPublishing = true;

        while (this.isRunning && this.publishQueue.length > 0) {
            const job = this.publishQueue.shift();
            if (!job) continue;

            const { bot, feed, item } = job;
            
            // SAFETY CHECK: Validazione pre-publish. Evita che BotManager.markProcessed vada in crash (Foreign Key fail)
            // se il bot originario della coda è stato eliminato prima del compimento dell'invio Telegram.
            if (!BotManager.getBots().some((b: any) => b.id === bot.id)) {
                TitanLogger.log(`  ⚠️ [${bot.name}] Job scartato dalla coda: il bot originario è stato eliminato.`);
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
                BotManager.markProcessed(bot.id, feed.id, item.id, item.title);
                TitanLogger.log(`  ✅ ${tag} Sent: ${item.title}`);

                if (bot.notifications_enabled && Notification.isSupported()) {
                    new Notification({
                        title: `Titan: ${bot.name}`,
                        body: `Inviato: ${item.title}`
                    }).show();
                }

                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                TitanLogger.log(`  ❌ ${tag} Send failed: ${item.title}`);
            }
        }

        this.isPublishing = false;
    }

    private escapeHTML(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}

// Lazy singleton: istanziato solo al primo accesso, non all'import del modulo.
// Evita side-effect al momento del require e permette reset nei test.
let _botEngine: BotEngine | null = null;
export function getBotEngine(): BotEngine {
    if (!_botEngine) _botEngine = new BotEngine();
    return _botEngine;
}
