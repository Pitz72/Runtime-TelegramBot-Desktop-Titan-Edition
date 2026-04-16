import { ipcMain, app, dialog } from 'electron';
import { getBotEngine } from './bot/engine';
import { getDB, initDB } from './database/schema';
import { BotManager } from './bot/manager';
import { fetchFeed, validateFeedUrl } from './bot/parser';
import { fetchYouTubeVideos } from './bot/youtube';
import { writeFile, copyFile, readFile } from 'fs/promises';
import { join } from 'path';

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
    ipcMain.handle('get-feeds', (_, botId) => BotManager.getFeeds(botId));

    ipcMain.handle('add-feed', (_, { botId, name, url, type, keywordFilter }) => {
        const validBotId = assertPositiveInt(botId, 'botId');
        const validName = assertString(name, 'name');
        const validType = assertFeedType(type);
        if (validType !== 'youtube') validateFeedUrl(assertString(url, 'url'));
        const validFilter = (typeof keywordFilter === 'string' && keywordFilter.trim()) ? keywordFilter.trim() : null;
        return BotManager.addFeed(validBotId, validName, assertString(url, 'url'), validType, validFilter);
    });

    ipcMain.handle('update-feed', (_, { id, name, url, type, keywordFilter }) => {
        const validId = assertPositiveInt(id, 'id');
        const validName = assertString(name, 'name');
        const validType = assertFeedType(type);
        if (validType !== 'youtube') validateFeedUrl(assertString(url, 'url'));
        const validFilter = (typeof keywordFilter === 'string' && keywordFilter.trim()) ? keywordFilter.trim() : null;
        return BotManager.updateFeed(validId, validName, assertString(url, 'url'), validType, validFilter);
    });

    ipcMain.handle('delete-feed', (_, id) => BotManager.deleteFeed(assertPositiveInt(id, 'id')));

    ipcMain.handle('toggle-feed', (_, { id, isActive }) => {
        BotManager.toggleFeed(assertPositiveInt(id, 'id'), isActive);
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

    ipcMain.handle('check-for-updates', async () => {
        try {
            const response = await fetch('https://ecosystem.runtimeradio.com/updates/titan-version.json');
            if (!response.ok) return { hasUpdate: false };
            const data = await response.json();
            const currentVersion = app.getVersion();
            const isNewer = data.version.localeCompare(currentVersion, undefined, { numeric: true, sensitivity: 'base' }) > 0;
            if (isNewer) {
                return { hasUpdate: true, latestVersion: data.version, downloadUrl: data.downloadUrl };
            }
            return { hasUpdate: false };
        } catch (error) {
            // Fail silently se il server è irraggiungibile o il file non esiste
            return { hasUpdate: false, error: String(error) };
        }
    });
}
