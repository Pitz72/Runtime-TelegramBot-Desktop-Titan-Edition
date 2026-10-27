import { getDB } from '../database/schema';
const db = () => getDB(); // lazy accessor — fix #16
import { BotConfig, FeedConfig } from '../../shared/types';
import { safeStorage } from 'electron';
import nodeCrypto from 'node:crypto';
import { encryptToken, decryptToken } from '../crypto';
import { validateFeedUrl } from './parser';
import { MUTE_MODES, sameChannel, type MuteMode } from './rules';
import { tm } from '../i18n';

// --- RTB Import Validation ---
// Stesso set di regole applicato dagli handler IPC (ipc.ts) per create-bot/add-feed,
// ma riapplicato qui perché importSingleBot/importConfig bypassano il layer IPC.

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function rtbAssertString(value: unknown, field: string): string {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(tm('rtbFieldMissing', { field }));
    }
    return value.trim();
}

function rtbAssertCheckInterval(value: unknown): number {
    if (value === undefined || value === null) return 15;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 1440) {
        throw new Error(tm('rtbInterval', { value: String(value) }));
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
        throw new Error(tm('rtbFeedType', { value: String(value) }));
    }
    return value;
}

/** Un intero facoltativo tra `min` e `max`; tutto il resto diventa `null` («valore del bot»). */
function rtbOptionalInt(value: unknown, min: number, max: number): number | null {
    if (value === undefined || value === null || value === '') return null;
    const n = Number(value);
    return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

/** Il filtro per parole chiave di un feed importato: solo una stringa JSON leggibile. */
function rtbKeywordFilter(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim() === '') return null;
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' ? value : null;
    } catch {
        return null;
    }
}

const rtbTemplate = (value: unknown): string | undefined => (typeof value === 'string' && value.trim() !== '' ? value : undefined);
const isFalse = (value: unknown) => value === false || value === 0;

/**
 * Un bot letto da un profilo .rtb, nei due formati che esistono: quello del singolo bot
 * (`channelId`, `isActive`…) e quello di «tutti i bot» (`channel_id`, `is_active`…).
 * Prima l'import multiplo validava i campi ma poi scriveva nel database i valori grezzi:
 * un orario sbagliato o un intervallo scritto come testo arrivavano tali e quali.
 *
 * La data di partenza del file **non** si usa: vedi `BotManager.insertImportedBot`.
 */
function readRtbBot(raw: any) {
    if (!raw || typeof raw !== 'object') throw new Error(tm('rtbItemInvalid'));
    return {
        name: rtbAssertString(raw.name, 'bot.name'),
        token: decryptTokenFromExport(typeof raw.token === 'string' ? raw.token : ''),
        channelId: rtbAssertString(raw.channelId ?? raw.channel_id, 'bot.channelId'),
        checkInterval: rtbAssertCheckInterval(raw.checkInterval ?? raw.check_interval),
        notificationsEnabled: !isFalse(raw.notificationsEnabled ?? raw.notifications_enabled),
        sendFrom: rtbAssertTimeOrDefault(raw.sendFrom ?? raw.send_from, '00:00'),
        sendUntil: rtbAssertTimeOrDefault(raw.sendUntil ?? raw.send_until, '23:59'),
        templatePodcast: rtbTemplate(raw.template_podcast),
        templateNews: rtbTemplate(raw.template_news),
        templateYoutube: rtbTemplate(raw.template_youtube),
        templateStartup: rtbTemplate(raw.template_startup),
        isActive: !isFalse(raw.isActive ?? raw.is_active),
        behavior: rtbBehavior(raw),
    };
}

function readRtbFeed(raw: any) {
    if (!raw || typeof raw !== 'object') throw new Error(tm('rtbFeedInvalid'));
    const name = rtbAssertString(raw.name, 'feed.name');
    const type = rtbAssertFeedType(raw.type);
    const url = rtbAssertString(raw.url, 'feed.url');
    // Validazione anti-SSRF: stessa regola di add-feed in ipc.ts
    if (type !== 'youtube') validateFeedUrl(url);
    return {
        name, url, type,
        keywordFilter: rtbKeywordFilter(raw.keyword_filter),
        checkInterval: rtbOptionalInt(raw.check_interval, 1, 1440),
        digestInterval: rtbOptionalInt(raw.digest_interval, 1, 10080),
        isActive: !isFalse(raw.isActive ?? raw.is_active),
    };
}

/** Esito dell'import di un bot: `pausedFor` è il bot che pubblica già su quel canale. */
export interface ImportedBot {
    botId: number;
    name: string;
    pausedFor?: string;
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

/**
 * Comportamento del bot aggiunto con lo schema v13: avvio silenzioso e pubblicazione senza
 * suono. Un oggetto a parte invece di altri parametri in coda a `createBot`/`updateBot`,
 * che ne avevano già dodici. In `updateBot` un campo assente vuol dire «lascia com'è».
 */
export interface BotBehavior {
    silentStart?: boolean;
    muteMode?: MuteMode;
    muteFrom?: string;
    muteUntil?: string;
}

/** Riga del DB → BotConfig: token decifrato, booleani SQLite (0/1) in boolean — fix #18. */
function rowToBot(row: any): BotConfig {
    return {
        ...row,
        token: decryptToken(row.token),
        is_active: row.is_active === 1,
        notifications_enabled: row.notifications_enabled === 1,
        silent_start: row.silent_start === 1,
        mute_mode: MUTE_MODES.includes(row.mute_mode) ? row.mute_mode : 'off',
        mute_from: TIME_REGEX.test(row.mute_from ?? '') ? row.mute_from : '22:00',
        mute_until: TIME_REGEX.test(row.mute_until ?? '') ? row.mute_until : '07:00',
    } as BotConfig;
}

/** Il comportamento di un bot letto da un profilo .rtb: valori sconosciuti → predefiniti. */
function rtbBehavior(source: any): BotBehavior {
    return {
        silentStart: source?.silentStart === true || source?.silent_start === true || source?.silent_start === 1,
        muteMode: MUTE_MODES.includes(source?.muteMode ?? source?.mute_mode) ? (source.muteMode ?? source.mute_mode) : 'off',
        muteFrom: rtbAssertTimeOrDefault(source?.muteFrom ?? source?.mute_from, '22:00'),
        muteUntil: rtbAssertTimeOrDefault(source?.muteUntil ?? source?.mute_until, '07:00'),
    };
}

export class BotManager {
    // --- BOTS ---
    static getBots(): BotConfig[] {
        // Il token in formato legacy (senza prefisso) si legge comunque e torna nel formato
        // corrente alla prossima scrittura.
        const rows = db().prepare('SELECT * FROM bots ORDER BY created_at DESC').all() as any[];
        return rows.map(rowToBot);
    }

    /** Un solo bot, con il token decifrato — `null` se non esiste (più). */
    static getBot(id: number): BotConfig | null {
        const row = db().prepare('SELECT * FROM bots WHERE id = ?').get(id) as any;
        return row ? rowToBot(row) : null;
    }

    static createBot(name: string, token: string, channelId: string, startDate?: string, checkInterval?: number, notificationsEnabled?: boolean, sendFrom?: string, sendUntil?: string, templatePodcast?: string, templateNews?: string, templateYoutube?: string, templateStartup?: string, behavior: BotBehavior = {}): number | bigint {
        const date = startDate || new Date().toISOString();
        const interval = checkInterval || 15;
        const notif = notificationsEnabled !== undefined ? (notificationsEnabled ? 1 : 0) : 1;
        const sFrom = sendFrom || '00:00';
        const sUntil = sendUntil || '23:59';
        const secureToken = encryptToken(token);
        const stmt = db().prepare('INSERT INTO bots (name, token, channel_id, start_date, check_interval, notifications_enabled, send_from, send_until, template_podcast, template_news, template_youtube, template_startup, silent_start, mute_mode, mute_from, mute_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        const info = stmt.run(
            name, secureToken, channelId, date, interval, notif, sFrom, sUntil,
            templatePodcast || null, templateNews || null, templateYoutube || null, templateStartup || null,
            behavior.silentStart ? 1 : 0, behavior.muteMode ?? 'off', behavior.muteFrom ?? '22:00', behavior.muteUntil ?? '07:00',
        );
        return info.lastInsertRowid;
    }

    static updateBot(id: number, name: string, token: string, channelId: string, isActive: boolean, startDate?: string, checkInterval?: number, notificationsEnabled?: boolean, sendFrom?: string, sendUntil?: string, templatePodcast?: string, templateNews?: string, templateYoutube?: string, templateStartup?: string, behavior: BotBehavior = {}) {
        const secureToken = encryptToken(token);
        const stmt = db().prepare(
            'UPDATE bots SET name = ?, token = ?, channel_id = ?, is_active = ?, start_date = COALESCE(?, start_date), check_interval = COALESCE(?, check_interval), notifications_enabled = COALESCE(?, notifications_enabled), send_from = COALESCE(?, send_from), send_until = COALESCE(?, send_until), template_podcast = ?, template_news = ?, template_youtube = ?, template_startup = ?, silent_start = COALESCE(?, silent_start), mute_mode = COALESCE(?, mute_mode), mute_from = COALESCE(?, mute_from), mute_until = COALESCE(?, mute_until) WHERE id = ?'
        );
        stmt.run(
            name, secureToken, channelId, isActive ? 1 : 0, startDate || null, checkInterval || null,
            notificationsEnabled !== undefined ? (notificationsEnabled ? 1 : 0) : null, sendFrom || null, sendUntil || null,
            templatePodcast || null, templateNews || null, templateYoutube || null, templateStartup || null,
            behavior.silentStart !== undefined ? (behavior.silentStart ? 1 : 0) : null,
            behavior.muteMode ?? null, behavior.muteFrom ?? null, behavior.muteUntil ?? null,
            id,
        );
    }
    static deleteBot(id: number) {
        db().prepare('DELETE FROM bots WHERE id = ?').run(id);
    }

    /**
     * Verifica leggera dell'esistenza di un bot — perf.
     * Usato nei loop caldi dell'engine (post-fetch e per-job) al posto di
     * getBots().some(...), che rileggeva TUTTI i bot e decifrava ogni token via
     * safeStorage a ogni chiamata. Qui una singola SELECT indicizzata sulla PK.
     */
    static botExists(id: number): boolean {
        return db().prepare('SELECT id FROM bots WHERE id = ?').get(id) !== undefined;
    }

    // --- FEEDS ---
    static getFeeds(botId: number): FeedConfig[] {
        const rows = db().prepare('SELECT * FROM feeds WHERE bot_id = ? ORDER BY created_at DESC').all(botId) as any[];
        // Normalizza is_active SQLite (0/1) in boolean TypeScript — fix #18
        return rows.map(f => ({ ...f, is_active: f.is_active === 1 })) as FeedConfig[];
    }

    static addFeed(bot_id: number, name: string, url: string, type: 'podcast' | 'news' | 'youtube', keywordFilter?: string | null, checkInterval?: number | null, digestInterval?: number | null): number {
        const stmt = db().prepare('INSERT INTO feeds (bot_id, name, url, type, is_active, keyword_filter, check_interval, digest_interval) VALUES (?, ?, ?, ?, 1, ?, ?, ?)');
        return Number(stmt.run(bot_id, name, url, type, keywordFilter ?? null, checkInterval ?? null, digestInterval ?? null).lastInsertRowid);
    }

    static updateFeed(id: number, name: string, url: string, type: string, keywordFilter?: string | null, checkInterval?: number | null, digestInterval?: number | null) {
        const stmt = db().prepare('UPDATE feeds SET name = ?, url = ?, type = ?, keyword_filter = ?, check_interval = ?, digest_interval = ? WHERE id = ?');
        stmt.run(name, url, type, keywordFilter ?? null, checkInterval ?? null, digestInterval ?? null, id);
    }

    static updateFeedLastFetch(id: number) {
        // ISO-UTC esplicito con 'Z': datetime('now') produce "YYYY-MM-DD HH:MM:SS" (UTC senza
        // timezone), che new Date() in JS interpreterebbe come ora locale — sfasando isFeedDue.
        db().prepare("UPDATE feeds SET last_fetch_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = ?").run(id);
    }

    static deleteFeed(id: number) {
        db().prepare('DELETE FROM feeds WHERE id = ?').run(id);
    }

    static toggleFeed(id: number, isActive: boolean) {
        db().prepare('UPDATE feeds SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, id);
    }

    // --- HISTORY ---

    /**
     * Controlla se un item è già stato pubblicato.
     * Doppio controllo anti-spam — fix #27 (v1.8.6), IronShield v2 (schema v12):
     *   1. Match diretto su (bot_id, id): percorso veloce, globale, comportamento invariato.
     *   2. Match su title_hash: safety net per URL cambiate lato publisher, ma ora
     *      *scoped per content_type* — un video YouTube non blocca più un articolo RSS
     *      con lo stesso titolo (e viceversa).
     */
    static isProcessed(botId: number, itemId: string, feedId?: number, title?: string, contentType: 'youtube' | 'rss' = 'rss'): boolean {
        // Check 1: match esatto sull'ID (MD5 del link) — globale, invariato
        const byId = db().prepare('SELECT id FROM history WHERE bot_id = ? AND id = ?').get(botId, itemId);
        if (byId) return true;

        // Check 2: match per titolo normalizzato, scoped al tipo di contenuto.
        // Stesso titolo + stesso bot + stesso content_type → già pubblicato, anche se il link è cambiato.
        if (title && title.trim()) {
            const titleHash = nodeCrypto.createHash('md5').update(title.toLowerCase().trim()).digest('hex');
            const byTitle = db().prepare(
                'SELECT id FROM history WHERE bot_id = ? AND title_hash = ? AND content_type = ?'
            ).get(botId, titleHash, contentType);
            if (byTitle) return true;
        }

        return false;
    }

    static markProcessed(botId: number, feedId: number, itemId: string, title: string, contentType: 'youtube' | 'rss' = 'rss') {
        const titleHash = title && title.trim()
            ? nodeCrypto.createHash('md5').update(title.toLowerCase().trim()).digest('hex')
            : null;
        const stmt = db().prepare(
            'INSERT OR IGNORE INTO history (id, bot_id, feed_id, title, title_hash, content_type) VALUES (?, ?, ?, ?, ?, ?)'
        );
        stmt.run(itemId, botId, feedId, title, titleHash, contentType);
    }

    static clearHistory(botId: number) {
        db().prepare('DELETE FROM history WHERE bot_id = ?').run(botId);
    }

    // --- DIGEST QUEUE ---
    static addToDigestQueue(botId: number, feedId: number, item: { id: string; title: string; link: string; summary: string; image?: string }) {
        db().prepare(
            'INSERT OR IGNORE INTO digest_queue (bot_id, feed_id, item_id, item_title, item_link, item_summary, item_image) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(botId, feedId, item.id, item.title, item.link, item.summary || null, item.image || null);
    }

    static getDigestQueue(botId: number, feedId: number): Array<{ item_id: string; item_title: string; item_link: string; item_summary: string; item_image: string | null }> {
        return db().prepare(
            'SELECT item_id, item_title, item_link, item_summary, item_image FROM digest_queue WHERE bot_id = ? AND feed_id = ? ORDER BY added_at ASC'
        ).all(botId, feedId) as any[];
    }

    /** Feed del bot che hanno contenuti in attesa nel digest — anche se il digest è stato spento. */
    static digestFeedIds(botId: number): number[] {
        return (db().prepare('SELECT DISTINCT feed_id FROM digest_queue WHERE bot_id = ?').all(botId) as Array<{ feed_id: number }>)
            .map(r => r.feed_id);
    }

    static clearDigestQueue(botId: number, feedId: number) {
        db().prepare('DELETE FROM digest_queue WHERE bot_id = ? AND feed_id = ?').run(botId, feedId);
    }

    /** Toglie dalla coda del digest solo i contenuti indicati (quelli effettivamente inviati). */
    static removeDigestItems(botId: number, feedId: number, itemIds: string[]) {
        const stmt = db().prepare('DELETE FROM digest_queue WHERE bot_id = ? AND feed_id = ? AND item_id = ?');
        db().transaction(() => {
            for (const id of itemIds) stmt.run(botId, feedId, id);
        })();
    }

    static updateFeedDigestLastSent(feedId: number) {
        // ISO-UTC esplicito con 'Z' — vedi nota in updateFeedLastFetch.
        db().prepare("UPDATE feeds SET digest_last_sent = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = ?").run(feedId);
    }

    // --- PENDING QUEUE (Quiet Hours) ---
    static addToPendingQueue(botId: number, feedId: number, item: { id: string; title: string; link: string; summary: string; image?: string; pubDate: Date }): boolean {
        const result = db().prepare(
            'INSERT OR IGNORE INTO pending_queue (bot_id, feed_id, item_id, item_title, item_link, item_summary, item_image, item_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(botId, feedId, item.id, item.title, item.link, item.summary || null, item.image || null, item.pubDate.toISOString());
        return result.changes > 0;
    }

    static getPendingQueue(botId: number): Array<{ id: number; feed_id: number; item_id: string; item_title: string | null; item_link: string; item_summary: string | null; item_image: string | null; item_date: string }> {
        return db().prepare(
            'SELECT id, feed_id, item_id, item_title, item_link, item_summary, item_image, item_date FROM pending_queue WHERE bot_id = ? ORDER BY item_date ASC'
        ).all(botId) as any[];
    }

    static removePendingItem(id: number) {
        db().prepare('DELETE FROM pending_queue WHERE id = ?').run(id);
    }

    // --- STATS ---
    static getStats(botId: number): { total: number; today: number; week: number } {
        // sent_at è in UTC (CURRENT_TIMESTAMP); il confine "oggi"/"settimana" va calcolato
        // nel fuso locale dell'utente, altrimenti "oggi" si azzererebbe a mezzanotte UTC.
        const total = (db().prepare('SELECT COUNT(*) as count FROM history WHERE bot_id = ?').get(botId) as any)?.count || 0;
        const today = (db().prepare(
            "SELECT COUNT(*) as count FROM history WHERE bot_id = ? AND datetime(sent_at, 'localtime') >= datetime('now', 'localtime', 'start of day')"
        ).get(botId) as any)?.count || 0;
        const week = (db().prepare(
            "SELECT COUNT(*) as count FROM history WHERE bot_id = ? AND datetime(sent_at, 'localtime') >= datetime('now', 'localtime', '-7 days', 'start of day')"
        ).get(botId) as any)?.count || 0;

        return { total, today, week };
    }

    static getDetailedStats(botId: number): { total: number; today: number; week: number; byFeed: Array<{ feedId: number; feedName: string | null; total: number; today: number }> } {
        const base = BotManager.getStats(botId);
        const rows = db().prepare(`
            SELECT h.feed_id as feedId, f.name as feedName,
                COUNT(*) as total,
                SUM(CASE WHEN datetime(h.sent_at, 'localtime') >= datetime('now', 'localtime', 'start of day') THEN 1 ELSE 0 END) as today
            FROM history h
            LEFT JOIN feeds f ON f.id = h.feed_id
            WHERE h.bot_id = ?
            GROUP BY h.feed_id
            ORDER BY total DESC
        `).all(botId) as any[];
        // feedName null = sorgente eliminata: l'etichetta la mette l'interfaccia, nella sua lingua.
        return { ...base, byFeed: rows.map(r => ({ feedId: r.feedId, feedName: r.feedName ?? null, total: r.total, today: r.today })) };
    }

    // --- IMPORT/EXPORT CONFIG ---
    static exportConfig(): string {
        const bots = BotManager.getBots();
        const exportData = bots.map(bot => {
            const feeds = BotManager.getFeeds(bot.id);
            return {
                name: bot.name,
                token: encryptTokenForExport(bot.token), // safeStorage cifrato per il file .rtb
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
                silent_start: bot.silent_start,
                mute_mode: bot.mute_mode,
                mute_from: bot.mute_from,
                mute_until: bot.mute_until,
                feeds: feeds.map(f => ({
                    name: f.name,
                    url: f.url,
                    type: f.type,
                    is_active: f.is_active,
                    keyword_filter: f.keyword_filter ?? null,
                    check_interval: f.check_interval ?? null,
                    digest_interval: f.digest_interval ?? null,
                }))
            };
        });
        return JSON.stringify(exportData, null, 2);
    }

    /** Il primo bot attivo che pubblica già su quel canale, se c'è. */
    static findActiveBotOnChannel(channelId: string): BotConfig | null {
        const rows = db().prepare('SELECT id, name, channel_id FROM bots WHERE is_active = 1').all() as any[];
        const match = rows.find(r => sameChannel(r.channel_id, channelId));
        return match ? BotManager.getBot(match.id) : null;
    }

    /**
     * Scrive nel database un bot letto da un profilo .rtb. Va chiamata dentro una transazione.
     *
     * **Il bot parte da adesso.** Un profilo non porta lo storico di ciò che è già stato
     * pubblicato: con la data di partenza del file, al primo giro il bot nuovo — senza storico —
     * ripubblicava sul canale tutto l'arretrato dei feed da quella data in poi. Sullo stesso
     * computer il token si legge subito, quindi bastava reimportare un backup.
     *
     * **Resta spento se il canale è già servito** da un altro bot attivo: due bot sullo
     * stesso canale pubblicherebbero ogni contenuto due volte.
     */
    private static insertImportedBot(bot: ReturnType<typeof readRtbBot>, feeds: Array<ReturnType<typeof readRtbFeed>>): ImportedBot {
        const owner = bot.isActive ? BotManager.findActiveBotOnChannel(bot.channelId) : null;
        const botId = Number(BotManager.createBot(
            bot.name, bot.token, bot.channelId, undefined, bot.checkInterval, bot.notificationsEnabled,
            bot.sendFrom, bot.sendUntil, bot.templatePodcast, bot.templateNews, bot.templateYoutube, bot.templateStartup,
            bot.behavior,
        ));
        if (!bot.isActive || owner) db().prepare('UPDATE bots SET is_active = 0 WHERE id = ?').run(botId);

        for (const feed of feeds) {
            const feedId = BotManager.addFeed(botId, feed.name, feed.url, feed.type, feed.keywordFilter, feed.checkInterval, feed.digestInterval);
            if (!feed.isActive) BotManager.toggleFeed(feedId, false);
        }
        return { botId, name: bot.name, ...(owner ? { pausedFor: owner.name } : {}) };
    }

    static importConfig(jsonData: string): ImportedBot[] {
        const data = JSON.parse(jsonData);
        if (!Array.isArray(data)) throw new Error(tm('rtbFormatInvalid'));

        // Validazione strutturale di tutti i bot e feed prima di toccare il DB
        const parsed = data.map(bot => ({
            bot: readRtbBot(bot),
            feeds: Array.isArray(bot?.feeds) ? bot.feeds.map(readRtbFeed) : [],
        }));

        return db().transaction(() => parsed.map(({ bot, feeds }) => BotManager.insertImportedBot(bot, feeds)))();
    }

    // --- IMPORT/EXPORT SINGOLO BOT (.rtb) ---
    static exportSingleBot(botId: number): string {
        try {
            const botRecord = db().prepare('SELECT * FROM bots WHERE id = ?').get(botId) as any;
            if (!botRecord) {
                throw new Error('Bot non trovato');
            }

            // Decripta il token per l'esportazione
            const plainToken = decryptToken(botRecord.token);

            // Recupera fields
            const feeds = db().prepare('SELECT * FROM feeds WHERE bot_id = ?').all(botId) as any[];

            // Costruisci oggetto pulito
            const exportData = {
                bot: {
                    name: botRecord.name,
                    token: encryptTokenForExport(plainToken), // safeStorage cifrato per il file .rtb
                    channelId: botRecord.channel_id,
                    isActive: botRecord.is_active === 1,
                    startDate: botRecord.start_date,
                    checkInterval: botRecord.check_interval,
                    // Le ore di silenzio mancavano dal profilo singolo: importandolo su un
                    // altro PC il bot tornava a pubblicare a qualunque ora.
                    sendFrom: botRecord.send_from,
                    sendUntil: botRecord.send_until,
                    notificationsEnabled: botRecord.notifications_enabled === 1,
                    template_podcast: botRecord.template_podcast,
                    template_news: botRecord.template_news,
                    template_youtube: botRecord.template_youtube,
                    template_startup: botRecord.template_startup,
                    silentStart: botRecord.silent_start === 1,
                    muteMode: botRecord.mute_mode ?? 'off',
                    muteFrom: botRecord.mute_from ?? '22:00',
                    muteUntil: botRecord.mute_until ?? '07:00'
                },
                feeds: feeds.map(f => ({
                    name: f.name,
                    url: f.url,
                    type: f.type,
                    isActive: f.is_active === 1,
                    keyword_filter: f.keyword_filter ?? null,
                    check_interval: f.check_interval ?? null,
                    digest_interval: f.digest_interval ?? null,
                }))
            };

            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Errore durante exportSingleBot:', error);
            throw error;
        }
    }

    static importSingleBot(jsonData: string): ImportedBot {
        try {
            const data = JSON.parse(jsonData);

            if (!data.bot || !data.feeds || !Array.isArray(data.feeds)) {
                throw new Error(tm('rtbFormatInvalid'));
            }

            // Validazione strutturale prima di toccare il DB: stesse regole degli handler IPC
            const bot = readRtbBot(data.bot);
            const feeds = data.feeds.map(readRtbFeed);
            return db().transaction(() => BotManager.insertImportedBot(bot, feeds))();
        } catch (error) {
            console.error('Errore durante importSingleBot:', error);
            throw error;
        }
    }
}
