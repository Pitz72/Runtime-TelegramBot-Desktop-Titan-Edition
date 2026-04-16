import { getDB } from '../database/schema';
const db = () => getDB(); // lazy accessor — fix #16
import { BotConfig, FeedConfig } from '../../shared/types';
import { safeStorage } from 'electron';
import crypto from 'crypto';
import { validateFeedUrl } from './parser';

// --- RTB Import Validation ---
// Stesso set di regole applicato dagli handler IPC (ipc.ts) per create-bot/add-feed,
// ma riapplicato qui perché importSingleBot/importConfig bypassano il layer IPC.

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function rtbAssertString(value: unknown, field: string): string {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Campo obbligatorio mancante o non valido nel file .rtb: "${field}"`);
    }
    return value.trim();
}

function rtbAssertCheckInterval(value: unknown): number {
    if (value === undefined || value === null) return 15;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 1440) {
        throw new Error(`check_interval nel file .rtb deve essere compreso tra 1 e 1440, ricevuto: ${value}`);
    }
    return n;
}

function rtbAssertTimeOrDefault(value: unknown, defaultVal: string): string {
    if (value === undefined || value === null) return defaultVal;
    if (typeof value !== 'string' || !TIME_REGEX.test(value)) return defaultVal;
    return value;
}

function rtbAssertFeedType(value: unknown): 'podcast' | 'news' | 'youtube' {
    if (value !== 'podcast' && value !== 'news' && value !== 'youtube') {
        throw new Error(`Tipo feed non valido nel file .rtb: "${value}". Valori consentiti: podcast, news, youtube`);
    }
    return value;
}

function validateRtbBot(bot: any): void {
    rtbAssertString(bot.name, 'bot.name');
    rtbAssertString(bot.channelId ?? bot.channel_id, 'bot.channelId');
    rtbAssertCheckInterval(bot.checkInterval ?? bot.check_interval);
    rtbAssertTimeOrDefault(bot.sendFrom ?? bot.send_from, '00:00');
    rtbAssertTimeOrDefault(bot.sendUntil ?? bot.send_until, '23:59');
}

function validateRtbFeed(feed: any): void {
    rtbAssertString(feed.name, 'feed.name');
    const type = rtbAssertFeedType(feed.type);
    const url = rtbAssertString(feed.url, 'feed.url');
    // Validazione anti-SSRF: stessa regola di add-feed in ipc.ts
    if (type !== 'youtube') {
        validateFeedUrl(url);
    }
}

// --- RTB Export Encryption ---
// Il token esportato viene cifrato utilizzando safeStorage (se disponibile).
// I file .rtb risultano vincolati alla macchina corrente per la massima sicurezza.

function encryptTokenForExport(plaintext: string): string {
    if (safeStorage.isEncryptionAvailable()) {
        try {
            const encrypted = safeStorage.encryptString(plaintext);
            return JSON.stringify({ ss: encrypted.toString('base64') });
        } catch (error) {
            console.error('Errore durante la cifratura safeStorage per export', error);
        }
    }
    // Su macchine senza safeStorage, esportiamo il token vuoto per evitare data leak
    return '';
}

function decryptTokenFromExport(data: string): string {
    if (!data) return '';
    try {
        const parsed = JSON.parse(data);
        // Nuovo formato sicuro via safeStorage (v1.7.8+)
        if (parsed.ss && safeStorage.isEncryptionAvailable()) {
            try {
                const buffer = Buffer.from(parsed.ss, 'base64');
                return safeStorage.decryptString(buffer);
            } catch (error) {
                console.error('Errore durante la decifratura safeStorage di un export', error);
                return ''; // Token illeggibile o proveniente da altra macchina
            }
        } 
        // Vecchio formato vulnerabile (v1.7.7) basato su chiave hardcoded
        else if (parsed.e && parsed.iv) {
            return ''; // Forziamo il reinserimento del token per i vecchi export per sicurezza
        }
    } catch {
        // Fallback per file .rtb molto vecchi (pre-v1.7.7) dove il token era in chiaro.
        // Se il parse fallisce, la stringa potrebbe essere il token raw.
    }
    
    // Evita di restituire blob JSON non validi come token
    if (data.startsWith('{')) return '';
    
    return data;
}

export class BotManager {
    // --- BOTS ---
    static getBots(): BotConfig[] {
        const bots = db().prepare('SELECT * FROM bots ORDER BY created_at DESC').all() as any[];
        return bots.map(bot => {
            let token = bot.token;
            if (safeStorage.isEncryptionAvailable()) {
                try {
                    const buffer = Buffer.from(token, 'base64');
                    token = safeStorage.decryptString(buffer);
                } catch {
                    // Se fallisce, il token è probabilmente in chiaro (vecchia versione).
                    // Lo migriamo crittografandolo e aggiornando il DB in background.
                    const encrypted = safeStorage.encryptString(token).toString('base64');
                    db().prepare('UPDATE bots SET token = ? WHERE id = ?').run(encrypted, bot.id);
                }
            }
            // Normalizza i booleani SQLite (0/1) in boolean TypeScript — fix #18
            return {
                ...bot,
                token,
                is_active: (bot.is_active as number) === 1,
                notifications_enabled: (bot.notifications_enabled as number) === 1,
            } as BotConfig;
        });
    }

    static createBot(name: string, token: string, channelId: string, startDate?: string, checkInterval?: number, notificationsEnabled?: boolean, sendFrom?: string, sendUntil?: string, templatePodcast?: string, templateNews?: string, templateYoutube?: string, templateStartup?: string): number | bigint {
        const date = startDate || new Date().toISOString();
        const interval = checkInterval || 15;
        const notif = notificationsEnabled !== undefined ? (notificationsEnabled ? 1 : 0) : 1;
        const sFrom = sendFrom || '00:00';
        const sUntil = sendUntil || '23:59';
        const secureToken = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(token).toString('base64') : token;
        const stmt = db().prepare('INSERT INTO bots (name, token, channel_id, start_date, check_interval, notifications_enabled, send_from, send_until, template_podcast, template_news, template_youtube, template_startup) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        const info = stmt.run(name, secureToken, channelId, date, interval, notif, sFrom, sUntil, templatePodcast || null, templateNews || null, templateYoutube || null, templateStartup || null);
        return info.lastInsertRowid;
    }

    static updateBot(id: number, name: string, token: string, channelId: string, isActive: boolean, startDate?: string, checkInterval?: number, notificationsEnabled?: boolean, sendFrom?: string, sendUntil?: string, templatePodcast?: string, templateNews?: string, templateYoutube?: string, templateStartup?: string) {
        const secureToken = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(token).toString('base64') : token;
        const stmt = db().prepare(
            'UPDATE bots SET name = ?, token = ?, channel_id = ?, is_active = ?, start_date = COALESCE(?, start_date), check_interval = COALESCE(?, check_interval), notifications_enabled = COALESCE(?, notifications_enabled), send_from = COALESCE(?, send_from), send_until = COALESCE(?, send_until), template_podcast = ?, template_news = ?, template_youtube = ?, template_startup = ? WHERE id = ?'
        );
        stmt.run(name, secureToken, channelId, isActive ? 1 : 0, startDate || null, checkInterval || null, notificationsEnabled !== undefined ? (notificationsEnabled ? 1 : 0) : null, sendFrom || null, sendUntil || null, templatePodcast || null, templateNews || null, templateYoutube || null, templateStartup || null, id);
    }

    static deleteBot(id: number) {
        db().prepare('DELETE FROM bots WHERE id = ?').run(id);
    }

    // --- FEEDS ---
    static getFeeds(botId: number): FeedConfig[] {
        const rows = db().prepare('SELECT * FROM feeds WHERE bot_id = ? ORDER BY created_at DESC').all(botId) as any[];
        // Normalizza is_active SQLite (0/1) in boolean TypeScript — fix #18
        return rows.map(f => ({ ...f, is_active: f.is_active === 1 })) as FeedConfig[];
    }

    static addFeed(bot_id: number, name: string, url: string, type: 'podcast' | 'news' | 'youtube') {
        const stmt = db().prepare('INSERT INTO feeds (bot_id, name, url, type, is_active) VALUES (?, ?, ?, ?, 1)');
        stmt.run(bot_id, name, url, type);
    }

    static updateFeed(id: number, name: string, url: string, type: string) {
        const stmt = db().prepare('UPDATE feeds SET name = ?, url = ?, type = ? WHERE id = ?');
        stmt.run(name, url, type, id);
    }

    static deleteFeed(id: number) {
        db().prepare('DELETE FROM feeds WHERE id = ?').run(id);
    }

    static toggleFeed(id: number, isActive: boolean) {
        db().prepare('UPDATE feeds SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, id);
    }

    // --- HISTORY ---
    static isProcessed(botId: number, itemId: string): boolean {
        const row = db().prepare('SELECT id FROM history WHERE bot_id = ? AND id = ?').get(botId, itemId);
        return !!row;
    }

    static markProcessed(botId: number, feedId: number, itemId: string, title: string) {
        const stmt = db().prepare('INSERT OR IGNORE INTO history (id, bot_id, feed_id, title) VALUES (?, ?, ?, ?)');
        stmt.run(itemId, botId, feedId, title);
    }

    static clearHistory(botId: number) {
        db().prepare('DELETE FROM history WHERE bot_id = ?').run(botId);
    }

    // --- STATS ---
    static getStats(botId: number): { total: number; today: number; week: number } {
        const total = (db().prepare('SELECT COUNT(*) as count FROM history WHERE bot_id = ?').get(botId) as any)?.count || 0;
        const today = (db().prepare(
            "SELECT COUNT(*) as count FROM history WHERE bot_id = ? AND sent_at >= date('now', 'start of day')"
        ).get(botId) as any)?.count || 0;
        const week = (db().prepare(
            "SELECT COUNT(*) as count FROM history WHERE bot_id = ? AND sent_at >= date('now', '-7 days')"
        ).get(botId) as any)?.count || 0;

        return { total, today, week };
    }

    // --- IMPORT/EXPORT CONFIG ---
    static exportConfig(): string {
        const bots = BotManager.getBots();
        const exportData = bots.map(bot => {
            const feeds = BotManager.getFeeds(bot.id);
            return {
                name: bot.name,
                token: encryptTokenForExport(bot.token), // AES-256-CBC cifrato per il file .rtb
                channel_id: bot.channel_id,
                start_date: bot.start_date,
                check_interval: bot.check_interval,
                send_from: bot.send_from,
                send_until: bot.send_until,
                template_podcast: bot.template_podcast,
                template_news: bot.template_news,
                template_youtube: bot.template_youtube,
                template_startup: bot.template_startup,
                notifications_enabled: bot.notifications_enabled,
                is_active: bot.is_active,
                feeds: feeds.map(f => ({
                    name: f.name,
                    url: f.url,
                    type: f.type,
                    is_active: f.is_active
                }))
            };
        });
        return JSON.stringify(exportData, null, 2);
    }

    static importConfig(jsonData: string) {
        const data = JSON.parse(jsonData);
        if (!Array.isArray(data)) throw new Error("Invalid config format");

        // Validazione strutturale di tutti i bot e feed prima di toccare il DB
        for (const bot of data) {
            if (!bot || typeof bot !== 'object') throw new Error('Elemento non valido nel file .rtb multi-bot');
            validateRtbBot({ ...bot, channelId: bot.channel_id, checkInterval: bot.check_interval, sendFrom: bot.send_from, sendUntil: bot.send_until });
            if (Array.isArray(bot.feeds)) {
                for (const f of bot.feeds) validateRtbFeed(f);
            }
        }

        const applyImport = db().transaction(() => {
            for (const bot of data) {
                const botId = BotManager.createBot(
                    bot.name,
                    decryptTokenFromExport(bot.token),
                    bot.channel_id,
                    bot.start_date,
                    bot.check_interval,
                    bot.notifications_enabled,
                    bot.send_from,
                    bot.send_until,
                    bot.template_podcast,
                    bot.template_news,
                    bot.template_youtube,
                    bot.template_startup
                );

                if (bot.is_active === 0 || bot.is_active === false) {
                    db().prepare('UPDATE bots SET is_active = 0 WHERE id = ?').run(botId);
                }

                if (Array.isArray(bot.feeds)) {
                    for (const f of bot.feeds) {
                        BotManager.addFeed(Number(botId), f.name, f.url, f.type);
                        if (f.is_active === 0 || f.is_active === false) {
                            const lastFeed = db().prepare('SELECT id FROM feeds WHERE bot_id = ? ORDER BY id DESC LIMIT 1').get(botId) as any;
                            if (lastFeed) {
                                db().prepare('UPDATE feeds SET is_active = 0 WHERE id = ?').run(lastFeed.id);
                            }
                        }
                    }
                }
            }
        });

        applyImport();
    }

    // --- IMPORT/EXPORT SINGOLO BOT (.rtb) ---
    static exportSingleBot(botId: number): string {
        try {
            const botRecord = db().prepare('SELECT * FROM bots WHERE id = ?').get(botId) as any;
            if (!botRecord) {
                throw new Error('Bot non trovato');
            }

            // Decripta il token per l'esportazione
            let plainToken = botRecord.token;
            if (safeStorage.isEncryptionAvailable() && plainToken) {
                try {
                    plainToken = safeStorage.decryptString(Buffer.from(plainToken, 'base64'));
                } catch (e) {
                    console.error('Errore decrittografia token bot singolo, esporto vuoto/invalido', e);
                    plainToken = '';
                }
            }

            // Recupera fields
            const feeds = db().prepare('SELECT * FROM feeds WHERE bot_id = ?').all(botId) as any[];

            // Costruisci oggetto pulito
            const exportData = {
                bot: {
                    name: botRecord.name,
                    token: encryptTokenForExport(plainToken), // AES-256-CBC cifrato per il file .rtb
                    channelId: botRecord.channel_id,
                    isActive: botRecord.is_active === 1,
                    startDate: botRecord.start_date,
                    checkInterval: botRecord.check_interval,
                    notificationsEnabled: botRecord.notifications_enabled === 1,
                    template_podcast: botRecord.template_podcast,
                    template_news: botRecord.template_news,
                    template_youtube: botRecord.template_youtube,
                    template_startup: botRecord.template_startup
                },
                feeds: feeds.map(f => ({
                    name: f.name,
                    url: f.url,
                    type: f.type,
                    isActive: f.is_active === 1
                }))
            };

            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Errore durante exportSingleBot:', error);
            throw error;
        }
    }

    static importSingleBot(jsonData: string): number {
        try {
            const data = JSON.parse(jsonData);

            if (!data.bot || !data.feeds || !Array.isArray(data.feeds)) {
                throw new Error('Formato .rtb non valido');
            }

            // Validazione strutturale: stesse regole degli handler IPC (ipc.ts)
            validateRtbBot(data.bot);
            for (const feed of data.feeds) validateRtbFeed(feed);

            const newBotId = db().transaction(() => {
                // Instanzio il bot e questo ne incapsula il token in sicirezza
                const createdBotId = BotManager.createBot(
                    data.bot.name,
                    decryptTokenFromExport(data.bot.token),
                    data.bot.channelId,
                    data.bot.startDate,
                    data.bot.checkInterval,
                    data.bot.notificationsEnabled !== undefined ? data.bot.notificationsEnabled : true,
                    undefined, // sendFrom
                    undefined, // sendUntil
                    data.bot.template_podcast,
                    data.bot.template_news,
                    data.bot.template_youtube,
                    data.bot.template_startup
                ) as number;

                // Aggiorna is_active (che createBot() omette partendo da acceso)
                db().prepare(`
                    UPDATE bots 
                    SET is_active = ?
                    WHERE id = ?
                `).run(
                    data.bot.isActive ? 1 : 0,
                    createdBotId
                );

                for (const feed of data.feeds) {
                    BotManager.addFeed(
                        createdBotId,
                        feed.name,
                        feed.url,
                        feed.type
                    );

                    if (feed.isActive === false) {
                        const lastFeed = db().prepare('SELECT id FROM feeds WHERE bot_id = ? ORDER BY id DESC LIMIT 1').get(createdBotId) as any;
                        if (lastFeed) {
                            db().prepare('UPDATE feeds SET is_active = 0 WHERE id = ?').run(lastFeed.id);
                        }
                    }
                }

                return createdBotId;
            })();

            return newBotId;
        } catch (error) {
            console.error('Errore durante importSingleBot:', error);
            throw error;
        }
    }
}
