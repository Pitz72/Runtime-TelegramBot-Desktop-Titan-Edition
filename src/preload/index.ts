import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
    // Bot Management
    getBots: () => ipcRenderer.invoke('get-bots'),
    createBot: (bot: { name: string; token: string; channelId: string; startDate?: string; checkInterval?: number; notificationsEnabled?: boolean; sendFrom?: string; sendUntil?: string; templatePodcast?: string; templateNews?: string; templateYoutube?: string; templateStartup?: string; }) =>
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
    }) => ipcRenderer.invoke('update-bot', data),

    // Feed Management
    getFeeds: (botId: number) => ipcRenderer.invoke('get-feeds', botId),
    addFeed: (feed: { botId: number; name: string; url: string; type: string }) =>
        ipcRenderer.invoke('add-feed', feed),
    updateFeed: (feed: { id: number; name: string; url: string; type: string }) =>
        ipcRenderer.invoke('update-feed', feed),
    deleteFeed: (id: number) => ipcRenderer.invoke('delete-feed', id),
    toggleFeed: (id: number, isActive: boolean) =>
        ipcRenderer.invoke('toggle-feed', { id, isActive }),
    testFeed: (data: { url: string; type: string }) => ipcRenderer.invoke('test-feed', data),
    clearHistory: (botId: number) => ipcRenderer.invoke('clear-history', botId),

    // Engine
    startBot: () => ipcRenderer.invoke('start-bot'),
    stopBot: () => ipcRenderer.invoke('stop-bot'),
    onLog: (callback: (message: string) => void) => {
        ipcRenderer.removeAllListeners('bot-log');
        ipcRenderer.on('bot-log', (_, message) => callback(message));
    },
    onLogsBatch: (callback: (messages: string[]) => void) => {
        ipcRenderer.removeAllListeners('bot-logs-batch');
        ipcRenderer.on('bot-logs-batch', (_, messages) => callback(messages));
    },
    onYouTubeApiError: (callback: () => void) => {
        ipcRenderer.removeAllListeners('youtube-api-error');
        ipcRenderer.on('youtube-api-error', () => callback());
    },

    // Stats
    getStats: (botId: number) => ipcRenderer.invoke('get-stats', botId),

    // System
    getVersion: () => ipcRenderer.invoke('get-version'),
    exportLogs: (logs: string[]) => ipcRenderer.invoke('export-logs', logs),
    exportDatabase: () => ipcRenderer.invoke('export-database'),
    importDatabase: () => ipcRenderer.invoke('import-database'),
    exportConfig: () => ipcRenderer.invoke('export-config'),
    importConfig: () => ipcRenderer.invoke('import-config'),
    exportSingleBot: (botId: number) => ipcRenderer.invoke('export-single-bot', botId),
    importSingleBot: () => ipcRenderer.invoke('import-single-bot'),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
