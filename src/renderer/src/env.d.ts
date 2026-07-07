/// <reference types="vite/client" />

import { BotConfig, FeedConfig, LogEntry } from '../../shared/types'

export interface TitanAPI {
    // Bot Management
    getBots: () => Promise<BotConfig[]>
    createBot: (bot: { name: string; token: string; channelId: string; startDate?: string }) => Promise<number>
    deleteBot: (id: number) => Promise<void>
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
    }) => Promise<void>

    // Feed Management
    getFeeds: (botId: number) => Promise<FeedConfig[]>
    addFeed: (feed: { botId: number; name: string; url: string; type: string; keywordFilter?: string | null; checkInterval?: number | null; digestInterval?: number | null }) => Promise<void>
    updateFeed: (feed: { id: number; name: string; url: string; type: string; keywordFilter?: string | null; checkInterval?: number | null; digestInterval?: number | null }) => Promise<void>
    deleteFeed: (id: number) => Promise<void>
    toggleFeed: (id: number, isActive: boolean) => Promise<void>
    testFeed: (data: { url: string; type: string }) => Promise<{ success: boolean; count?: number; error?: string }>
    clearHistory: (botId: number) => Promise<void>

    // Engine
    startBot: () => Promise<{ success: boolean; error?: string }>
    stopBot: () => Promise<{ success: boolean }>
    getBotStatus: () => Promise<{ running: boolean }>
    onLog: (callback: (message: string) => void) => void
    onLogsBatch: (callback: (messages: LogEntry[]) => void) => void
    onYouTubeApiError: (callback: () => void) => void

    // Stats
    getStats: (botId: number) => Promise<{ total: number; today: number; week: number }>
    getDetailedStats: (botId: number) => Promise<{ total: number; today: number; week: number; byFeed: Array<{ feedId: number; feedName: string; total: number; today: number }> }>

    // OPML
    importOpml: (botId: number) => Promise<{ success: boolean; count: number; error?: string }>

    // Performance Settings
    getPerformanceMode: () => Promise<boolean>
    setPerformanceMode: (enabled: boolean) => Promise<{ success: boolean }>

    // System
    getVersion: () => Promise<string>
    checkForUpdates: () => Promise<{ success: boolean; error?: string }>
    downloadUpdate: () => Promise<{ success: boolean; error?: string }>
    installUpdate: () => Promise<void>
    openExternal: (url: string) => Promise<void>
    consumeWhatsNew: () => Promise<{ show: boolean; version: string }>
    onUpdateAvailable: (callback: (info: { version: string }) => void) => void
    onUpdateNotAvailable: (callback: () => void) => void
    onUpdateProgress: (callback: (info: { percent: number }) => void) => void
    onUpdateDownloaded: (callback: (info: { version: string }) => void) => void
    onUpdateError: (callback: (info: { message: string }) => void) => void
    exportLogs: (logs: string[]) => Promise<{ success: boolean; path?: string; error?: string }>
    exportDatabase: () => Promise<{ success: boolean; path?: string; error?: string }>
    importDatabase: () => Promise<{ success: boolean; error?: string }>
    exportConfig: () => Promise<{ success: boolean; path?: string; error?: string }>
    importConfig: () => Promise<{ success: boolean; error?: string }>
    exportSingleBot: (botId: number) => Promise<{ success: boolean; path?: string; error?: string }>
    importSingleBot: () => Promise<{ success: boolean; botId?: number; error?: string }>
}

declare global {
    interface Window {
        api: TitanAPI
        electron: any
    }
}
