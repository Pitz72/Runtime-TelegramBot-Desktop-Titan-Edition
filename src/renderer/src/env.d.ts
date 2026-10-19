/// <reference types="vite/client" />

import { BotCheckResult, BotConfig, DesktopSettings, FeedConfig, LogEntry } from '../../shared/types'

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
        silentStart?: boolean
        muteMode?: 'off' | 'always' | 'window'
        muteFrom?: string
        muteUntil?: string
    }) => Promise<void>
    testBot: (data: { token: string; channelId: string }) => Promise<BotCheckResult>

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
    getBotStatus: () => Promise<{ running: boolean; scanning?: boolean }>
    scanNow: () => Promise<{ status: 'started' | 'busy' | 'stopped' }>
    getRecentLogs: () => Promise<LogEntry[]>
    onEngineStatus: (callback: (info: { running: boolean }) => void) => () => void
    getDesktopSettings: () => Promise<DesktopSettings>
    setDesktopSettings: (data: { closeAction?: DesktopSettings['closeAction']; autoStartEngine?: boolean; openAtLogin?: boolean }) => Promise<DesktopSettings>
    onLog: (callback: (message: string) => void) => void
    onLogsBatch: (callback: (messages: LogEntry[]) => void) => void
    onYouTubeApiError: (callback: () => void) => void

    // Stats
    getStats: (botId: number) => Promise<{ total: number; today: number; week: number }>
    getDetailedStats: (botId: number) => Promise<{ total: number; today: number; week: number; byFeed: Array<{ feedId: number; feedName: string | null; total: number; today: number }> }>

    // OPML
    importOpml: (botId: number) => Promise<{ success: boolean; count: number; error?: string }>

    // Performance Settings
    getPerformanceMode: () => Promise<boolean>
    setPerformanceMode: (enabled: boolean) => Promise<{ success: boolean }>

    // System
    getVersion: () => Promise<string>
    setLocale: (locale: string) => Promise<void>
    onBotsChanged: (callback: (info: { botId?: number }) => void) => () => void
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
    getUiZoom: () => Promise<number>
    setUiZoom: (zoom: number) => Promise<number>
    onUiZoomChanged: (callback: (zoom: number) => void) => () => void
    readLicense: (kind: 'app' | 'third-party') => Promise<string | null>
    exportLogs: () => Promise<{ success: boolean; path?: string; error?: string }>
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
    }
}
