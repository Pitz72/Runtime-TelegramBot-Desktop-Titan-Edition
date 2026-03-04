import { ipcMain, app, dialog } from 'electron';
import { botEngine } from './bot/engine';
import { db, initDB } from './database/schema';
import { BotManager } from './bot/manager';
import { fetchFeed } from './bot/parser';
import { fetchYouTubeVideos } from './bot/youtube';
import { writeFile, copyFile, readFile } from 'fs/promises';
import { join } from 'path';

export function setupIpc() {
    // Initialize Database
    initDB();

    // --- SYSTEM ---
    ipcMain.handle('get-version', () => app.getVersion());

    // --- BOT MANAGEMENT ---
    ipcMain.handle('get-bots', () => BotManager.getBots());

    ipcMain.handle('create-bot', (_, data) => {
        const channelId = data.channelId || data.channel_id;
        return BotManager.createBot(data.name, data.token, channelId, data.startDate, data.checkInterval, data.notificationsEnabled, data.sendFrom, data.sendUntil, data.templatePodcast, data.templateNews, data.templateYoutube, data.templateStartup);
    });

    ipcMain.handle('delete-bot', (_, id) => {
        botEngine.removeClient(id); // Sync engine with deletion
        return BotManager.deleteBot(id);
    });

    ipcMain.handle('update-bot', (_, { id, name, token, channelId, isActive, startDate, checkInterval, notificationsEnabled, sendFrom, sendUntil, templatePodcast, templateNews, templateYoutube, templateStartup }) => {
        return BotManager.updateBot(id, name, token, channelId, isActive, startDate, checkInterval, notificationsEnabled, sendFrom, sendUntil, templatePodcast, templateNews, templateYoutube, templateStartup);
    });

    // --- FEED MANAGEMENT ---
    ipcMain.handle('get-feeds', (_, botId) => BotManager.getFeeds(botId));

    ipcMain.handle('add-feed', (_, { botId, name, url, type }) => {
        return BotManager.addFeed(botId, name, url, type);
    });

    ipcMain.handle('update-feed', (_, { id, name, url, type }) => {
        return BotManager.updateFeed(id, name, url, type);
    });

    ipcMain.handle('delete-feed', (_, id) => BotManager.deleteFeed(id));

    ipcMain.handle('toggle-feed', (_, { id, isActive }) => {
        BotManager.toggleFeed(id, isActive);
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
        return BotManager.clearHistory(botId);
    });

    // --- STATS ---
    ipcMain.handle('get-stats', (_, botId) => {
        return BotManager.getStats(botId);
    });

    // --- ENGINE CONTROL ---
    ipcMain.handle('start-bot', async () => {
        try {
            await botEngine.start();
            return { success: true };
        } catch (e) {
            console.error('Failed to start bot engine:', e);
            return { success: false, error: String(e) };
        }
    });

    ipcMain.handle('stop-bot', async () => {
        botEngine.stop();
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

            await db.backup(filePath);
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

            botEngine.stop();
            db.close();
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
