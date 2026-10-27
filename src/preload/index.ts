import { contextBridge, ipcRenderer } from 'electron'
import type { LogEntry } from '../shared/types'

// Il renderer vede SOLO questa API, canale per canale. Fino alla 2.3 il preload esponeva
// anche `window.electron` di @electron-toolkit/preload, cioè `ipcRenderer` intero: nessun
// componente lo usava, ma chiunque riuscisse a eseguire codice nella pagina avrebbe potuto
// invocare qualunque canale IPC. Superficie inutile, tolta.

// Custom APIs for renderer
const api = {
    // Bot Management
    getBots: () => ipcRenderer.invoke('get-bots'),
    createBot: (bot: { name: string; token: string; channelId: string; startDate?: string; checkInterval?: number; notificationsEnabled?: boolean; sendFrom?: string; sendUntil?: string; templatePodcast?: string; templateNews?: string; templateYoutube?: string; templateStartup?: string; silentStart?: boolean; }) =>
        ipcRenderer.invoke('create-bot', bot),
    deleteBot: (id: number) => ipcRenderer.invoke('delete-bot', id),
    updateBot: (data: {
        id: number
        name: string
        token: string
        channelId: string
        isActive: boolean
        startDate?: string
        checkInterval?: number
        notificationsEnabled?: boolean
        sendFrom?: string
        sendUntil?: string
        templatePodcast?: string
        templateNews?: string
        templateYoutube?: string
        templateStartup?: string
        silentStart?: boolean
        muteMode?: 'off' | 'always' | 'window'
        muteFrom?: string
        muteUntil?: string
    }) => ipcRenderer.invoke('update-bot', data),
    testBot: (data: { token: string; channelId: string }) => ipcRenderer.invoke('test-bot', data),

    // Feed Management
    getFeeds: (botId: number) => ipcRenderer.invoke('get-feeds', botId),
    addFeed: (feed: { botId: number; name: string; url: string; type: string; keywordFilter?: string | null; checkInterval?: number | null; digestInterval?: number | null }) =>
        ipcRenderer.invoke('add-feed', feed),
    updateFeed: (feed: { id: number; name: string; url: string; type: string; keywordFilter?: string | null; checkInterval?: number | null; digestInterval?: number | null }) =>
        ipcRenderer.invoke('update-feed', feed),
    deleteFeed: (id: number) => ipcRenderer.invoke('delete-feed', id),
    toggleFeed: (id: number, isActive: boolean) =>
        ipcRenderer.invoke('toggle-feed', { id, isActive }),
    testFeed: (data: { url: string; type: string }) => ipcRenderer.invoke('test-feed', data),
    clearHistory: (botId: number) => ipcRenderer.invoke('clear-history', botId),

    // Engine
    startBot: () => ipcRenderer.invoke('start-bot'),
    stopBot: () => ipcRenderer.invoke('stop-bot'),
    getBotStatus: () => ipcRenderer.invoke('get-bot-status'),
    scanNow: () => ipcRenderer.invoke('scan-now'),
    getRecentLogs: () => ipcRenderer.invoke('get-recent-logs'),
    onEngineStatus: (callback: (info: { running: boolean }) => void) => {
        const handler = (_: unknown, info: { running: boolean }) => callback(info);
        ipcRenderer.on('engine-status', handler);
        return () => { ipcRenderer.removeListener('engine-status', handler); };
    },
    getDesktopSettings: () => ipcRenderer.invoke('get-desktop-settings'),
    setDesktopSettings: (data: { closeAction?: 'ask' | 'tray' | 'quit'; autoStartEngine?: boolean; openAtLogin?: boolean }) =>
        ipcRenderer.invoke('set-desktop-settings', data),
    onLog: (callback: (message: string) => void) => {
        ipcRenderer.removeAllListeners('bot-log');
        ipcRenderer.on('bot-log', (_, message) => callback(message));
    },
    onLogsBatch: (callback: (messages: LogEntry[]) => void) => {
        ipcRenderer.removeAllListeners('bot-logs-batch');
        ipcRenderer.on('bot-logs-batch', (_, messages) => callback(messages));
    },
    onYouTubeApiError: (callback: () => void) => {
        ipcRenderer.removeAllListeners('youtube-api-error');
        ipcRenderer.on('youtube-api-error', () => callback());
    },

    // Stats
    getStats: (botId: number) => ipcRenderer.invoke('get-stats', botId),
    getDetailedStats: (botId: number) => ipcRenderer.invoke('get-detailed-stats', botId),

    // OPML
    importOpml: (botId: number) => ipcRenderer.invoke('import-opml', botId),

    // Performance Settings
    getPerformanceMode: () => ipcRenderer.invoke('get-performance-mode') as Promise<boolean>,
    setPerformanceMode: (enabled: boolean) => ipcRenderer.invoke('set-performance-mode', enabled),

    // System
    getVersion: () => ipcRenderer.invoke('get-version'),
    setLocale: (locale: string) => ipcRenderer.invoke('set-locale', locale),
    // Più ascoltatori (App e selettore dei bot): si aggiunge e si restituisce chi lo toglie.
    onBotsChanged: (callback: (info: { botId?: number; pausedFor?: string }) => void) => {
        const handler = (_: unknown, info: { botId?: number; pausedFor?: string }) => callback(info ?? {});
        ipcRenderer.on('bots-changed', handler);
        return () => { ipcRenderer.removeListener('bots-changed', handler); };
    },
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates') as Promise<{ success: boolean; error?: string }>,
    downloadUpdate: () => ipcRenderer.invoke('download-update') as Promise<{ success: boolean; error?: string }>,
    installUpdate: () => ipcRenderer.invoke('install-update'),
    openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
    consumeWhatsNew: () => ipcRenderer.invoke('consume-whats-new') as Promise<{ show: boolean; version: string }>,
    onUpdateAvailable: (callback: (info: { version: string }) => void) => {
        ipcRenderer.removeAllListeners('update-available');
        ipcRenderer.on('update-available', (_, info) => callback(info));
    },
    onUpdateNotAvailable: (callback: () => void) => {
        ipcRenderer.removeAllListeners('update-not-available');
        ipcRenderer.on('update-not-available', () => callback());
    },
    onUpdateProgress: (callback: (info: { percent: number }) => void) => {
        ipcRenderer.removeAllListeners('update-progress');
        ipcRenderer.on('update-progress', (_, info) => callback(info));
    },
    onUpdateDownloaded: (callback: (info: { version: string }) => void) => {
        ipcRenderer.removeAllListeners('update-downloaded');
        ipcRenderer.on('update-downloaded', (_, info) => callback(info));
    },
    onUpdateError: (callback: (info: { message: string }) => void) => {
        ipcRenderer.removeAllListeners('update-error');
        ipcRenderer.on('update-error', (_, info) => callback(info));
    },
    // Accessibilità e licenze
    getUiZoom: () => ipcRenderer.invoke('get-ui-zoom') as Promise<number>,
    setUiZoom: (zoom: number) => ipcRenderer.invoke('set-ui-zoom', zoom) as Promise<number>,
    onUiZoomChanged: (callback: (zoom: number) => void) => {
        const handler = (_: unknown, zoom: number) => callback(zoom);
        ipcRenderer.on('ui-zoom-changed', handler);
        return () => { ipcRenderer.removeListener('ui-zoom-changed', handler); };
    },
    readLicense: (kind: 'app' | 'third-party') => ipcRenderer.invoke('read-license', kind) as Promise<string | null>,
    // Fase 7: nessun argomento — il main esporta il file di log della giornata
    exportLogs: () => ipcRenderer.invoke('export-logs'),
    exportDatabase: () => ipcRenderer.invoke('export-database'),
    importDatabase: () => ipcRenderer.invoke('import-database'),
    openBackupsFolder: () => ipcRenderer.invoke('open-backups-folder'),
    exportConfig: () => ipcRenderer.invoke('export-config'),
    importConfig: () => ipcRenderer.invoke('import-config'),
    exportSingleBot: (botId: number) => ipcRenderer.invoke('export-single-bot', botId),
    importSingleBot: () => ipcRenderer.invoke('import-single-bot'),
}

// contextIsolation è sempre attivo (vedi BrowserWindow in main/index.ts): l'API passa
// solo dal contextBridge, mai assegnata direttamente al DOM.
try {
    contextBridge.exposeInMainWorld('api', api)
} catch (error) {
    console.error(error)
}
