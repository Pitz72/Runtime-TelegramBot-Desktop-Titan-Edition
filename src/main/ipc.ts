import { ipcMain, app, dialog, shell, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import Database from 'better-sqlite3';
import { getBotEngine } from './bot/engine';
import { getDB, initDB, closeDB } from './database/schema';
import { BotManager } from './bot/manager';
import { fetchFeed, validateFeedUrl } from './bot/parser';
import { fetchYouTubeVideos } from './bot/youtube';
import { TitanLogger } from './logger';
import { writeFile, readFile } from 'fs/promises';
import { mkdirSync, renameSync, rmSync } from 'fs';
import { backupBeforeImport, backupDir } from './database/backup';
import { readSettings, updateSettings, applyZoom, CLOSE_ACTIONS } from './settings';
import { canHideToTray, getOpenAtLogin, markQuitting, setOpenAtLogin } from './desktop';
import { join, dirname } from 'path';
import { tm, setMainLocale } from './i18n';
import { MUTE_MODES, parseStartDate, parseTopicId } from './bot/rules';
import type { BotBehavior } from './bot/manager';
import { checkBot } from './bot/check';
import { defaultTemplate } from './bot/telegram';

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

/**
 * Avvio silenzioso e pubblicazione senza suono. Ogni campo assente resta `undefined`, che
 * per `updateBot` vuol dire «invariato»: un chiamante che non li conosce non li azzera.
 */
function assertBehavior(data: any): BotBehavior {
    const behavior: BotBehavior = {};
    if (data?.silentStart !== undefined) behavior.silentStart = data.silentStart === true;
    if (data?.muteMode !== undefined) {
        if (!MUTE_MODES.includes(data.muteMode)) throw new Error(`Modalità senza suono non valida: "${data.muteMode}"`);
        behavior.muteMode = data.muteMode;
    }
    if (data?.muteFrom !== undefined) behavior.muteFrom = assertTimeOrDefault(data.muteFrom, '22:00');
    if (data?.muteUntil !== undefined) behavior.muteUntil = assertTimeOrDefault(data.muteUntil, '07:00');
    if (data?.topicId !== undefined) behavior.topicId = parseTopicId(data.topicId);
    return behavior;
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

    // Lingua dell'interfaccia: serve ai testi del main (vedi main/i18n.ts). Si salva, così
    // al prossimo avvio vale da subito, anche per il motore che parte da solo.
    ipcMain.handle('set-locale', async (_, locale: unknown) => {
        if (locale !== 'it' && locale !== 'en') return;
        setMainLocale(locale);
        if ((await readSettings()).locale !== locale) await updateSettings(s => { s.locale = locale; });
    });

    // I modelli predefiniti dei messaggi, come li usa il motore: l'interfaccia li mostra
    // invece di tenerne una copia propria, che poteva divergere.
    ipcMain.handle('get-default-templates', () => ({
        news: defaultTemplate('news'),
        podcast: defaultTemplate('podcast'),
        youtube: defaultTemplate('youtube'),
    }));

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
        if (previous !== current) await updateSettings(next => { next.lastSeenVersion = current; });
        return { show, version: current };
    });

    // --- BOT MANAGEMENT ---
    ipcMain.handle('get-bots', () => BotManager.getBots());

    ipcMain.handle('create-bot', async (_, data) => {
        const name = assertString(data.name, 'name');
        const token = assertString(data.token, 'token');
        const channelId = assertString(data.channelId || data.channel_id, 'channelId');
        const checkInterval = data.checkInterval !== undefined ? assertCheckInterval(data.checkInterval) : 15;
        const sendFrom = assertTimeOrDefault(data.sendFrom, '00:00');
        const sendUntil = assertTimeOrDefault(data.sendUntil, '23:59');
        const startDate = assertStartDateOrUndefined(data.startDate);
        return await BotManager.createBot(name, token, channelId, startDate, checkInterval, data.notificationsEnabled, sendFrom, sendUntil, data.templatePodcast, data.templateNews, data.templateYoutube, data.templateStartup, assertBehavior(data));
    });

    ipcMain.handle('delete-bot', (_, id) => {
        const botId = assertPositiveInt(id, 'id');
        getBotEngine().removeClient(botId);
        return BotManager.deleteBot(botId);
    });

    ipcMain.handle('update-bot', async (_, data) => {
        const { id, name, token, channelId, isActive, startDate, checkInterval, notificationsEnabled, sendFrom, sendUntil, templatePodcast, templateNews, templateYoutube, templateStartup } = data ?? {};
        const validId = assertPositiveInt(id, 'id');
        const validName = assertString(name, 'name');
        const validToken = assertString(token, 'token');
        const validChannelId = assertString(channelId, 'channelId');
        const validInterval = checkInterval !== undefined ? assertCheckInterval(checkInterval) : 15;
        const validSendFrom = assertTimeOrDefault(sendFrom, '00:00');
        const validSendUntil = assertTimeOrDefault(sendUntil, '23:59');
        const validStartDate = assertStartDateOrUndefined(startDate);
        return await BotManager.updateBot(validId, validName, validToken, validChannelId, !!isActive, validStartDate, validInterval, notificationsEnabled, validSendFrom, validSendUntil, templatePodcast, templateNews, templateYoutube, templateStartup, assertBehavior(data));
    });

    // «Prova il bot»: token, canale e permessi verificati senza pubblicare nulla. Usa i
    // valori del modulo, non quelli salvati, così si prova prima di salvare.
    ipcMain.handle('test-bot', (_, data) => {
        const token = assertString(data?.token, 'token');
        const channelId = assertString(data?.channelId, 'channelId');
        return checkBot(token, channelId, parseTopicId(data?.topicId));
    });

    // Code visibili: cosa sta per uscire e perché non è ancora uscito.
    ipcMain.handle('get-queues', (_, botId) => {
        const id = assertPositiveInt(botId, 'botId');
        return { sending: getBotEngine().queuedFor(id), ...BotManager.getQueues(id) };
    });

    // Storico consultabile: gli ultimi contenuti registrati per il bot.
    ipcMain.handle('get-history', (_, botId) => BotManager.getRecentHistory(assertPositiveInt(botId, 'botId'), 100));

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

    // --- AVVIO E CHIUSURA ---
    const desktopSettings = async () => {
        const s = await readSettings();
        return {
            closeAction: s.closeAction ?? 'ask',
            autoStartEngine: s.autoStartEngine === true,
            openAtLogin: getOpenAtLogin(),
            trayAvailable: canHideToTray(),
        };
    };

    ipcMain.handle('get-desktop-settings', desktopSettings);

    ipcMain.handle('set-desktop-settings', async (_, data) => {
        if (data?.closeAction !== undefined && !CLOSE_ACTIONS.includes(data.closeAction)) {
            throw new Error(`Azione di chiusura non valida: "${data.closeAction}"`);
        }
        await updateSettings(s => {
            if (data?.closeAction !== undefined) s.closeAction = data.closeAction;
            if (data?.autoStartEngine !== undefined) s.autoStartEngine = data.autoStartEngine === true;
        });
        if (data?.openAtLogin !== undefined) setOpenAtLogin(data.openAtLogin === true);
        return desktopSettings();
    });

    ipcMain.handle('get-bot-status', () => ({ running: getBotEngine().isEngineRunning(), scanning: getBotEngine().isScanning() }));

    // «Controlla adesso»: 'started', 'busy' (un giro è già in corso) o 'stopped'.
    ipcMain.handle('scan-now', () => ({ status: getBotEngine().scanNow() }));

    // Righe di log arrivate prima che l'interfaccia le ascoltasse: motore avviato da solo
    // all'apertura, o finestra nell'area di notifica mentre si era ancora sulla schermata d'ingresso.
    ipcMain.handle('get-recent-logs', () => TitanLogger.getRecent());

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

            const dbPath = join(app.getPath('userData'), 'titan.db');
            const staged = `${dbPath}.importing`;

            // Validazione PRIMA di toccare il DB attivo: un file corrotto o non-SQLite
            // sovrascritto su titan.db renderebbe l'app non avviabile (initDB lancerebbe
            // al riavvio, senza vie d'uscita dalla UI). Apriamo in sola lettura, verifichiamo
            // l'integrità e la presenza della tabella "bots", e ne facciamo una copia accanto
            // a titan.db con l'API di backup: copiare il file e basta perdeva le scritture
            // ancora nel suo -wal, se il file scelto era il database di un Titan acceso.
            try {
                const candidate = new Database(filePaths[0], { readonly: true, fileMustExist: true });
                try {
                    const integrity = candidate.pragma('integrity_check', { simple: true });
                    if (integrity !== 'ok') throw new Error(`integrity_check ha restituito "${integrity}"`);
                    const hasBots = candidate.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bots'").get();
                    if (!hasBots) throw new Error('non è un database Titan valido (tabella "bots" assente)');
                    rmSync(staged, { force: true });
                    await candidate.backup(staged);
                } finally {
                    candidate.close();
                }
            } catch (e: any) {
                rmSync(staged, { force: true });
                return { success: false, error: tm('dbImportInvalid', { error: String(e.message || e) }) };
            }

            // Il database attuale non si perde: una copia resta nella cartella dei backup.
            await backupBeforeImport();

            getBotEngine().stop();
            // closeDB: checkpoint WAL e chiusura pulita. I file -wal e -shm rimasti si tolgono:
            // accanto al database nuovo, SQLite proverebbe ad applicargli quelli del vecchio.
            closeDB();
            try {
                rmSync(`${dbPath}-wal`, { force: true });
                rmSync(`${dbPath}-shm`, { force: true });
                renameSync(staged, dbPath);
            } catch (e) {
                // Sostituzione non riuscita (file bloccato da un antivirus, permessi): prima
                // Titan restava aperto senza database, e ogni operazione falliva fino al riavvio.
                // Si riapre il database di prima, che è ancora intatto.
                rmSync(staged, { force: true });
                initDB();
                throw e;
            }

            app.relaunch();
            app.exit(0);
        } catch (e: any) {
            return { success: false, error: e.message || String(e) };
        }
    });

    // Backup automatici (database/backup.ts): la cartella si apre nel file manager del sistema.
    ipcMain.handle('open-backups-folder', async () => {
        const dir = backupDir();
        mkdirSync(dir, { recursive: true });
        const error = await shell.openPath(dir);
        return error ? { success: false, error } : { success: true, path: dir };
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

            const jsonData = await BotManager.exportConfig();
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
            const imported = await BotManager.importConfig(content);

            // `paused`: bot importati spenti perché il loro canale è già servito da un altro bot.
            return {
                success: true,
                imported: imported.length,
                paused: imported.filter(b => b.pausedFor).map(b => ({ name: b.name, pausedFor: b.pausedFor! })),
            };
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

            const jsonData = await BotManager.exportSingleBot(botId);
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
            const { botId, pausedFor } = await BotManager.importSingleBot(jsonData);

            return { success: true, botId, pausedFor };
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
        await updateSettings(s => { s.performanceMode = !!enabled; });
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
        markQuitting();
        autoUpdater.quitAndInstall(false, true);
    });
}
