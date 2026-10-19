import { ipcMain, app, dialog, shell, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import Database from 'better-sqlite3';
import { getBotEngine } from './bot/engine';
import { getDB, initDB, closeDB } from './database/schema';
import { BotManager } from './bot/manager';
import { fetchFeed, validateFeedUrl } from './bot/parser';
import { fetchYouTubeVideos } from './bot/youtube';
import { TitanLogger } from './logger';
import { writeFile, copyFile, readFile } from 'fs/promises';
import { readSettings, writeSettings, applyZoom } from './settings';
import { join, dirname } from 'path';
import { tm, setMainLocale } from './i18n';
import { parseStartDate } from './bot/rules';

/**
 * Testo di un file di licenza spedito con l'app: quella di Titan (MIT) o l'elenco delle
 * licenze di terze parti generato a ogni build. Nell'app installata stanno fuori dall'asar
 * (asarUnpack: resources/**); in sviluppo nella cartella del progetto.
 */
async function readLicenseFile(kind: 'app' | 'third-party'): Promise<string | null> {
    const appPath = app.getAppPath();
    const unpacked = appPath.replace(/app\.asar$/, 'app.asar.unpacked');
    const candidates = kind === 'app'
        ? [join(unpacked, 'resources', 'LICENSE.txt'), join(appPath, 'LICENSE')]
        : [join(unpacked, 'resources', 'THIRD-PARTY-NOTICES.txt'), join(appPath, 'resources', 'THIRD-PARTY-NOTICES.txt')];
    for (const candidate of candidates) {
        try {
            return await readFile(candidate, 'utf-8');
        } catch { /* prova il prossimo */ }
    }
    return null;
}

// --- Cartella dei dialoghi ---
// Da Electron 43 i dialoghi senza `defaultPath` partono sempre da Download e il sistema
// non ricorda più l'ultima cartella usata. La ricordiamo noi, per la sessione.
let lastDialogDir: string | null = null;

function dialogDir(): string {
    return lastDialogDir ?? app.getPath('documents');
}

function rememberDir(filePath: string | undefined) {
    if (filePath) lastDialogDir = dirname(filePath);
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

/** Data di partenza facoltativa: se c'è, deve essere una data (vedi `parseStartDate`). */
function assertStartDateOrUndefined(value: unknown): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (parseStartDate(value) === null) {
        throw new Error(`Data di partenza non valida: "${String(value)}"`);
    }
    return String(value).trim();
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

    // Lingua dell'interfaccia: serve ai dialoghi nativi aperti da qui (vedi main/i18n.ts).
    ipcMain.handle('set-locale', (_, locale: unknown) => { setMainLocale(locale); });

    // Apre un URL esterno nel browser di sistema. Solo https per sicurezza.
    ipcMain.handle('open-external', (_, url: string) => {
        if (typeof url === 'string' && /^https:\/\//i.test(url)) {
            shell.openExternal(url);
        }
    });

    // Schermata "Novità": va mostrata SOLO al primo avvio dopo un aggiornamento
    // (versione salvata diversa dalla corrente e non prima installazione).
    // Consuma il flag: aggiorna subito lastSeenVersion così compare una volta sola.
    ipcMain.handle('consume-whats-new', async () => {
        const current = app.getVersion();
        const s = await readSettings();
        const previous = s.lastSeenVersion;
        // È un utente esistente (non una prima installazione) se ha già salvato una
        // versione, oppure se ha già dei bot: in tal caso, se la versione è cambiata,
        // mostriamo le novità. Il secondo caso copre gli aggiornamenti da versioni
        // precedenti alla 2.1.6, che non salvavano ancora lastSeenVersion.
        let existingUser = previous !== undefined;
        if (!existingUser) {
            try { existingUser = BotManager.getBots().length > 0; } catch { /* DB non pronto */ }
        }
        const show = existingUser && previous !== current;
        if (previous !== current) {
            s.lastSeenVersion = current;
            await writeSettings(s);
        }
        return { show, version: current };
    });

    // --- BOT MANAGEMENT ---
    ipcMain.handle('get-bots', () => BotManager.getBots());

    ipcMain.handle('create-bot', (_, data) => {
        const name = assertString(data.name, 'name');
        const token = assertString(data.token, 'token');
        const channelId = assertString(data.channelId || data.channel_id, 'channelId');
        const checkInterval = data.checkInterval !== undefined ? assertCheckInterval(data.checkInterval) : 15;
        const sendFrom = assertTimeOrDefault(data.sendFrom, '00:00');
        const sendUntil = assertTimeOrDefault(data.sendUntil, '23:59');
        const startDate = assertStartDateOrUndefined(data.startDate);
        return BotManager.createBot(name, token, channelId, startDate, checkInterval, data.notificationsEnabled, sendFrom, sendUntil, data.templatePodcast, data.templateNews, data.templateYoutube, data.templateStartup);
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
        const validStartDate = assertStartDateOrUndefined(startDate);
        return BotManager.updateBot(validId, validName, validToken, validChannelId, !!isActive, validStartDate, validInterval, notificationsEnabled, validSendFrom, validSendUntil, templatePodcast, templateNews, templateYoutube, templateStartup);
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
                title: tm('importOpmlTitle'),
                defaultPath: dialogDir(),
                properties: ['openFile'],
                filters: [
                    { name: tm('filterOpml'), extensions: ['opml', 'xml'] },
                    { name: tm('filterAll'), extensions: ['*'] }
                ]
            });
            if (canceled || filePaths.length === 0) return { success: false, count: 0 };
            rememberDir(filePaths[0]);

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
            // Ritorna subito: messaggio di avvio e primo giro corrono in sottofondo.
            getBotEngine().start();
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
    // Fase 7: si esporta il **file** della giornata, non l'array in memoria del renderer.
    // Due ragioni. La prima è che il diario mostra a schermo solo gli eventi che contano,
    // e un export costruito su quel che si vede sarebbe monco. La seconda vale comunque:
    // la memoria contiene solo ciò che è arrivato da quando la finestra è aperta, mentre
    // il file ha tutta la giornata — ed è quel che serve allegare a una segnalazione.
    ipcMain.handle('export-logs', async () => {
        try {
            const sourcePath = TitanLogger.getLogFilePath();

            // Il file nasce alla prima riga scritta: se il motore non è mai partito oggi,
            // non esiste ancora. Meglio dirlo che salvare un file vuoto.
            const content = await readFile(sourcePath, 'utf-8').catch(() => null);
            if (content === null) {
                return { success: false, error: 'NoLogFile' };
            }

            const { filePath, canceled } = await dialog.showSaveDialog({
                title: tm('exportLogTitle'),
                defaultPath: join(dialogDir(), `titan-log-${new Date().toISOString().split('T')[0]}.txt`),
                filters: [
                    { name: tm('filterText'), extensions: ['txt'] },
                    { name: tm('filterAll'), extensions: ['*'] }
                ]
            });

            if (canceled || !filePath) {
                return { success: false, error: 'Cancelled' };
            }
            rememberDir(filePath);

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
                title: tm('exportDbTitle'),
                defaultPath: join(dialogDir(), `titan-backup-${new Date().toISOString().split('T')[0]}.db`),
                filters: [
                    { name: tm('filterDb'), extensions: ['db', 'sqlite'] },
                    { name: tm('filterAll'), extensions: ['*'] }
                ]
            });

            if (canceled || !filePath) return { success: false, error: 'Cancelled' };
            rememberDir(filePath);

            await getDB().backup(filePath);
            return { success: true, path: filePath };
        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    });

    ipcMain.handle('import-database', async () => {
        try {
            const { response } = await dialog.showMessageBox({
                type: 'warning',
                title: tm('importDbConfirmTitle'),
                message: tm('importDbConfirm'),
                buttons: [tm('cancel'), tm('proceed')],
                defaultId: 0,
                cancelId: 0,
                noLink: true,
            });

            if (response === 0) return { success: false, error: 'Cancelled by user' };

            const { filePaths, canceled } = await dialog.showOpenDialog({
                title: tm('importDbTitle'),
                defaultPath: dialogDir(),
                properties: ['openFile'],
                filters: [
                    { name: tm('filterDb'), extensions: ['db', 'sqlite'] },
                    { name: tm('filterAll'), extensions: ['*'] }
                ]
            });

            if (canceled || filePaths.length === 0) return { success: false, error: 'Cancelled' };
            rememberDir(filePaths[0]);

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
            // closeDB: checkpoint WAL e chiusura pulita, così il file -wal del vecchio
            // database non resta accanto a quello nuovo.
            closeDB();
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
                title: tm('exportConfigTitle'),
                defaultPath: join(dialogDir(), `titan-bots-backup-${new Date().toISOString().split('T')[0]}.rtb`),
                filters: [
                    { name: tm('filterRtb'), extensions: ['rtb'] }
                ]
            });

            if (canceled || !filePath) return { success: false, error: 'Cancelled' };
            rememberDir(filePath);

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
                title: tm('importConfigTitle'),
                defaultPath: dialogDir(),
                properties: ['openFile'],
                filters: [
                    { name: tm('filterRtb'), extensions: ['rtb'] }
                ]
            });

            if (canceled || filePaths.length === 0) return { success: false, error: 'Cancelled' };
            rememberDir(filePaths[0]);

            const content = await readFile(filePaths[0], 'utf-8');
            BotManager.importConfig(content);

            // Rileggiamo i bot aggiornati
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    });

    // --- IMPORT / EXPORT SINGOLO BOT (.rtb) ---
    ipcMain.handle('export-single-bot', async (_, rawBotId: unknown) => {
        try {
            const botId = assertPositiveInt(rawBotId, 'botId');
            const botRecord = BotManager.getBot(botId);
            if (!botRecord) throw new Error('Bot non trovato');

            const suggestedName = `${botRecord.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.rtb`;

            const { canceled, filePath } = await dialog.showSaveDialog({
                title: tm('exportBotTitle'),
                defaultPath: join(dialogDir(), suggestedName),
                filters: [{ name: tm('filterRtb'), extensions: ['rtb'] }]
            });

            if (canceled || !filePath) {
                return { success: false };
            }
            rememberDir(filePath);

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
                title: tm('importBotTitle'),
                defaultPath: dialogDir(),
                properties: ['openFile'],
                filters: [{ name: tm('filterRtb'), extensions: ['rtb'] }]
            });

            if (canceled || filePaths.length === 0) {
                return { success: false };
            }
            rememberDir(filePaths[0]);

            const jsonData = await readFile(filePaths[0], 'utf-8');
            const newBotId = BotManager.importSingleBot(jsonData);

            return { success: true, botId: newBotId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    // --- ACCESSIBILITÀ E LICENZE ---
    ipcMain.handle('get-ui-zoom', async () => (await readSettings()).uiZoom ?? 1);

    ipcMain.handle('set-ui-zoom', async (event, value: unknown) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        return win ? applyZoom(win, Number(value)) : 1;
    });

    ipcMain.handle('read-license', async (_, kind: unknown) => {
        if (kind !== 'app' && kind !== 'third-party') throw new Error('Licenza sconosciuta');
        return readLicenseFile(kind);
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

    ipcMain.handle('download-update', async () => {
        try {
            await autoUpdater.downloadUpdate();
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle('install-update', () => {
        autoUpdater.quitAndInstall(false, true);
    });
}
