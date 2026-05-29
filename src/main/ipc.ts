import { ipcMain, app, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import Database from 'better-sqlite3';
import { getBotEngine } from './bot/engine';
import { getDB, initDB } from './database/schema';
import { BotManager } from './bot/manager';
import { fetchFeed, validateFeedUrl } from './bot/parser';
import { fetchYouTubeVideos } from './bot/youtube';
import { writeFile, copyFile, readFile } from 'fs/promises';
import { join } from 'path';

// --- Settings File (titan-settings.json in userData) ---
interface TitanSettings { performanceMode: boolean; }
const DEFAULT_SETTINGS: TitanSettings = { performanceMode: false };

function getSettingsPath(): string {
    return join(app.getPath('userData'), 'titan-settings.json');
}

async function readSettings(): Promise<TitanSettings> {
    try {
        const raw = await readFile(getSettingsPath(), 'utf-8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

async function writeSettings(settings: TitanSettings): Promise<void> {
    await writeFile(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8');
}

// --- Input Validation Helpers ---
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function assertString(value: unknown, field: string): string {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Campo obbligatorio mancante o non valido: "${field}"`);
    }
    return value.trim();
}

function assertPositiveInt(value: unknown, field: string): number {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) {
        throw new Error(`"${field}" deve essere un intero positivo, ricevuto: ${value}`);
    }
    return n;
}

function assertCheckInterval(value: unknown): number {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 1440) {
        throw new Error(`check_interval deve essere compreso tra 1 e 1440 minuti, ricevuto: ${value}`);
    }
    return n;
}

function assertTimeOrDefault(value: unknown, defaultVal: string): string {
    if (value === undefined || value === null) return defaultVal;
    if (typeof value !== 'string' || !TIME_REGEX.test(value)) {
        throw new Error(`Formato orario non valido: "${value}". Usare HH:MM (es. 08:00)`);
    }
    return value;
}

function assertFeedType(value: unknown): 'podcast' | 'news' | 'youtube' {
    if (value !== 'podcast' && value !== 'news' && value !== 'youtube') {
        throw new Error(`Tipo feed non valido: "${value}". Valori consentiti: podcast, news, youtube`);
    }
    return value;
}

function assertFeedCheckInterval(value: unknown): number | null {
    if (value === undefined || value === null) return null;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 1440) {
        throw new Error(`check_interval del feed deve essere compreso tra 1 e 1440 minuti, ricevuto: ${value}`);
    }
    return n;
}

function assertKeywordFilter(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') throw new Error('keyword_filter deve essere una stringa JSON o null');
    return value;
}

function assertDigestInterval(value: unknown): number | null {
    if (value === undefined || value === null) return null;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 10080) {
        throw new Error(`digest_interval deve essere tra 1 e 10080 minuti, ricevuto: ${value}`);
    }
    return n;
}

/** Parser OPML minimale — estrae xmlUrl e name dagli outline senza dipendenze esterne. */
function parseOpml(content: string): Array<{ name: string; url: string }> {
    const results: Array<{ name: string; url: string }> = [];
    const re = /<outline([^>]+)>/gi;
    let match: RegExpExecArray | null;
    while ((match = re.exec(content)) !== null) {
        const attrs = match[1];
        const xmlUrl = /xmlUrl\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1];
        const text = /\btext\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1]
            || /\btitle\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1];
        if (xmlUrl && text && (xmlUrl.startsWith('http://') || xmlUrl.startsWith('https://'))) {
            results.push({ name: text.trim(), url: xmlUrl.trim() });
        }
    }
    return results;
}

export function setupIpc() {
    // Initialize Database
    initDB();

    // --- SYSTEM ---
    ipcMain.handle('get-version', () => app.getVersion());

    // --- BOT MANAGEMENT ---
    ipcMain.handle('get-bots', () => BotManager.getBots());

    ipcMain.handle('create-bot', (_, data) => {
        const name = assertString(data.name, 'name');
        const token = assertString(data.token, 'token');
        const channelId = assertString(data.channelId || data.channel_id, 'channelId');
        const checkInterval = data.checkInterval !== undefined ? assertCheckInterval(data.checkInterval) : 15;
        const sendFrom = assertTimeOrDefault(data.sendFrom, '00:00');
        const sendUntil = assertTimeOrDefault(data.sendUntil, '23:59');
        return BotManager.createBot(name, token, channelId, data.startDate, checkInterval, data.notificationsEnabled, sendFrom, sendUntil, data.templatePodcast, data.templateNews, data.templateYoutube, data.templateStartup);
    });

    ipcMain.handle('delete-bot', (_, id) => {
        const botId = assertPositiveInt(id, 'id');
        getBotEngine().removeClient(botId);
        return BotManager.deleteBot(botId);
    });

    ipcMain.handle('update-bot', (_, { id, name, token, channelId, isActive, startDate, checkInterval, notificationsEnabled, sendFrom, sendUntil, templatePodcast, templateNews, templateYoutube, templateStartup }) => {
        const validId = assertPositiveInt(id, 'id');
        const validName = assertString(name, 'name');
        const validToken = assertString(token, 'token');
        const validChannelId = assertString(channelId, 'channelId');
        const validInterval = checkInterval !== undefined ? assertCheckInterval(checkInterval) : 15;
        const validSendFrom = assertTimeOrDefault(sendFrom, '00:00');
        const validSendUntil = assertTimeOrDefault(sendUntil, '23:59');
        return BotManager.updateBot(validId, validName, validToken, validChannelId, isActive, startDate, validInterval, notificationsEnabled, validSendFrom, validSendUntil, templatePodcast, templateNews, templateYoutube, templateStartup);
    });

    // --- FEED MANAGEMENT ---
    ipcMain.handle('get-feeds', (_, botId) => BotManager.getFeeds(assertPositiveInt(botId, 'botId')));

    ipcMain.handle('add-feed', (_, { botId, name, url, type, keywordFilter, checkInterval, digestInterval }) => {
        const validBotId = assertPositiveInt(botId, 'botId');
        const validName = assertString(name, 'name');
        const validType = assertFeedType(type);
        if (validType !== 'youtube') validateFeedUrl(assertString(url, 'url'));
        const validKeywordFilter = assertKeywordFilter(keywordFilter);
        const validCheckInterval = assertFeedCheckInterval(checkInterval);
        const validDigestInterval = assertDigestInterval(digestInterval);
        return BotManager.addFeed(validBotId, validName, assertString(url, 'url'), validType, validKeywordFilter, validCheckInterval, validDigestInterval);
    });

    ipcMain.handle('update-feed', (_, { id, name, url, type, keywordFilter, checkInterval, digestInterval }) => {
        const validId = assertPositiveInt(id, 'id');
        const validName = assertString(name, 'name');
        const validType = assertFeedType(type);
        if (validType !== 'youtube') validateFeedUrl(assertString(url, 'url'));
        const validKeywordFilter = assertKeywordFilter(keywordFilter);
        const validCheckInterval = assertFeedCheckInterval(checkInterval);
        const validDigestInterval = assertDigestInterval(digestInterval);
        return BotManager.updateFeed(validId, validName, assertString(url, 'url'), validType, validKeywordFilter, validCheckInterval, validDigestInterval);
    });

    ipcMain.handle('delete-feed', (_, id) => BotManager.deleteFeed(assertPositiveInt(id, 'id')));

    ipcMain.handle('toggle-feed', (_, { id, isActive }) => {
        BotManager.toggleFeed(assertPositiveInt(id, 'id'), !!isActive);
    });

    ipcMain.handle('test-feed', async (_, { url, type }) => {
        try {
            let items;
            if (type === 'youtube') {
                items = await fetchYouTubeVideos(url);
            } else {
                items = await fetchFeed('Test', url);
            }
            return { success: true, count: items.length };
        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    });

    ipcMain.handle('clear-history', (_, botId) => {
        return BotManager.clearHistory(assertPositiveInt(botId, 'botId'));
    });

    // --- STATS ---
    ipcMain.handle('get-stats', (_, botId) => {
        return BotManager.getStats(assertPositiveInt(botId, 'botId'));
    });

    ipcMain.handle('get-detailed-stats', (_, botId) => {
        return BotManager.getDetailedStats(assertPositiveInt(botId, 'botId'));
    });

    // --- OPML IMPORT ---
    ipcMain.handle('import-opml', async (_, botId) => {
        try {
            const validBotId = assertPositiveInt(botId, 'botId');
            const { filePaths, canceled } = await dialog.showOpenDialog({
                title: 'Importa Feed da OPML',
                properties: ['openFile'],
                filters: [
                    { name: 'OPML Files', extensions: ['opml', 'xml'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });
            if (canceled || filePaths.length === 0) return { success: false, count: 0 };

            const content = await readFile(filePaths[0], 'utf-8');
            const found = parseOpml(content);
            if (found.length === 0) return { success: true, count: 0 };

            let imported = 0;
            for (const f of found) {
                try {
                    validateFeedUrl(f.url);
                    BotManager.addFeed(validBotId, f.name, f.url, 'news');
                    imported++;
                } catch { /* skip feed non valido */ }
            }
            return { success: true, count: imported };
        } catch (e: any) {
            return { success: false, count: 0, error: e.message || String(e) };
        }
    });

    // --- ENGINE CONTROL ---
    ipcMain.handle('start-bot', async () => {
        try {
            await getBotEngine().start();
            return { success: true };
        } catch (e) {
            console.error('Failed to start bot engine:', e);
            return { success: false, error: String(e) };
        }
    });

    ipcMain.handle('stop-bot', async () => {
        getBotEngine().stop();
        return { success: true };
    });

    ipcMain.handle('get-bot-status', () => ({ running: getBotEngine().isEngineRunning() }));

    // --- LOG EXPORT ---
    ipcMain.handle('export-logs', async (_, logs: string[]) => {
        try {
            const { filePath, canceled } = await dialog.showSaveDialog({
                title: 'Esporta Log',
                defaultPath: `titan-log-${new Date().toISOString().split('T')[0]}.txt`,
                filters: [
                    { name: 'Text Files', extensions: ['txt'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (canceled || !filePath) {
                return { success: false, error: 'Cancelled' };
            }

            const content = logs.join('\n');
            await writeFile(filePath, content, 'utf-8');
            return { success: true, path: filePath };
        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    });

    // --- DATABASE MNGT ---
    ipcMain.handle('export-database', async () => {
        try {
            const { filePath, canceled } = await dialog.showSaveDialog({
                title: 'Esporta Database Completo',
                defaultPath: `titan-backup-${new Date().toISOString().split('T')[0]}.db`,
                filters: [
                    { name: 'Database SQLite', extensions: ['db', 'sqlite'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (canceled || !filePath) return { success: false, error: 'Cancelled' };

            await getDB().backup(filePath);
            return { success: true, path: filePath };
        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    });

    ipcMain.handle('import-database', async () => {
        try {
            const msg = "ATTENZIONE: Importando un database sovrascriverai TUTTI i dati attuali e l'applicazione si riavvierà automaticamente. Continuare?";
            const { response } = await dialog.showMessageBox({
                type: 'warning',
                title: 'Conferma Importazione',
                message: msg,
                buttons: ['Annulla', 'Procedi'],
                defaultId: 0,
                cancelId: 0
            });

            if (response === 0) return { success: false, error: 'Cancelled by user' };

            const { filePaths, canceled } = await dialog.showOpenDialog({
                title: 'Importa Database',
                properties: ['openFile'],
                filters: [
                    { name: 'Database SQLite', extensions: ['db', 'sqlite'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (canceled || filePaths.length === 0) return { success: false, error: 'Cancelled' };

            // Validazione PRIMA di toccare il DB attivo: un file corrotto o non-SQLite
            // sovrascritto su titan.db renderebbe l'app non avviabile (initDB lancerebbe
            // al riavvio, senza vie d'uscita dalla UI). Apriamo in sola lettura, verifichiamo
            // l'integrità e la presenza della tabella "bots".
            try {
                const candidate = new Database(filePaths[0], { readonly: true, fileMustExist: true });
                try {
                    const integrity = candidate.pragma('integrity_check', { simple: true });
                    if (integrity !== 'ok') throw new Error(`integrity_check ha restituito "${integrity}"`);
                    const hasBots = candidate.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bots'").get();
                    if (!hasBots) throw new Error('non è un database Titan valido (tabella "bots" assente)');
                } finally {
                    candidate.close();
                }
            } catch (e: any) {
                return { success: false, error: `File non importato: database non valido o corrotto. ${e.message || e}` };
            }

            getBotEngine().stop();
            getDB().close();
            const dbPath = join(app.getPath('userData'), 'titan.db');
            await copyFile(filePaths[0], dbPath);

            app.relaunch();
            app.exit(0);
        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    });

    ipcMain.handle('export-config', async () => {
        try {
            const { filePath, canceled } = await dialog.showSaveDialog({
                title: 'Esporta Tutti i Bot',
                defaultPath: `titan-bots-backup-${new Date().toISOString().split('T')[0]}.rtb`,
                filters: [
                    { name: 'Titan Bot Profiles', extensions: ['rtb'] }
                ]
            });

            if (canceled || !filePath) return { success: false, error: 'Cancelled' };

            const jsonData = BotManager.exportConfig();
            await writeFile(filePath, jsonData, 'utf-8');
            return { success: true, path: filePath };
        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    });

    ipcMain.handle('import-config', async () => {
        try {
            const { filePaths, canceled } = await dialog.showOpenDialog({
                title: 'Importa Profili Bot',
                properties: ['openFile'],
                filters: [
                    { name: 'Titan Bot Profiles', extensions: ['rtb'] }
                ]
            });

            if (canceled || filePaths.length === 0) return { success: false, error: 'Cancelled' };

            const content = await readFile(filePaths[0], 'utf-8');
            BotManager.importConfig(content);

            // Rileggiamo i bot aggiornati
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    });

    // --- IMPORT / EXPORT SINGOLO BOT (.rtb) ---
    ipcMain.handle('export-single-bot', async (_, botId: number) => {
        try {
            // Ottieni il nome del bot per il suggerimento del file
            const bots = BotManager.getBots();
            const botRecord = bots.find((b: any) => b.id === botId);
            if (!botRecord) throw new Error('Bot non trovato');

            const suggestedName = `${botRecord.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.rtb`;

            const { canceled, filePath } = await dialog.showSaveDialog({
                title: 'Esporta Profilo Bot',
                defaultPath: suggestedName,
                filters: [{ name: 'Titan Bot Profile', extensions: ['rtb'] }]
            });

            if (canceled || !filePath) {
                return { success: false };
            }

            const jsonData = BotManager.exportSingleBot(botId);
            await writeFile(filePath, jsonData, 'utf-8');

            return { success: true, path: filePath };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('import-single-bot', async () => {
        try {
            const { canceled, filePaths } = await dialog.showOpenDialog({
                title: 'Importa Profilo Bot',
                properties: ['openFile'],
                filters: [{ name: 'Titan Bot Profile', extensions: ['rtb'] }]
            });

            if (canceled || filePaths.length === 0) {
                return { success: false };
            }

            const jsonData = await readFile(filePaths[0], 'utf-8');
            const newBotId = BotManager.importSingleBot(jsonData);

            return { success: true, botId: newBotId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    // --- PERFORMANCE SETTINGS ---
    ipcMain.handle('get-performance-mode', async () => {
        const s = await readSettings();
        return s.performanceMode;
    });

    ipcMain.handle('set-performance-mode', async (_, enabled: boolean) => {
        const s = await readSettings();
        s.performanceMode = !!enabled;
        await writeSettings(s);
        return { success: true };
    });

    ipcMain.handle('check-for-updates', async () => {
        try {
            await autoUpdater.checkForUpdates();
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle('install-update', () => {
        autoUpdater.quitAndInstall(false, true);
    });
}
