import React, { useState, useEffect, useCallback } from 'react';
import { Play, Square, Settings, Download, BarChart3, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BotConfig } from '../../../shared/types';
import { BotSelector } from './BotSelector';
import { FeedManager } from './FeedManager';
import logo from '../assets/logo.png';
import { BotSettingsModal } from './BotSettingsModal';
import { SystemSettingsModal } from './SystemSettingsModal';
import { useTranslation } from '../locales/I18nContext';
import { useToast } from './ui/Toast';

export function Dashboard() {
    const { t } = useTranslation();
    const { error } = useToast();
    const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [version, setVersion] = useState('1.1.0');
    const [showSettings, setShowSettings] = useState(false);
    const [showSystemSettings, setShowSystemSettings] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [stats, setStats] = useState<{ total: number; today: number; week: number } | null>(null);

    useEffect(() => {
        window.api.getVersion().then(setVersion);
        window.api.onLogsBatch((newLogs: string[]) => {
            setLogs(prev => [...newLogs.reverse(), ...prev].slice(0, 300));
        });
        window.api.onYouTubeApiError(() => {
            error(t('youtubeError.message'), t('youtubeError.title'));
        });
    }, []);

    // Load stats when bot changes
    useEffect(() => {
        if (selectedBot) {
            window.api.getStats(selectedBot.id).then(setStats);
        } else {
            setStats(null);
        }
    }, [selectedBot, refreshKey]);

    // Refresh stats periodically when running
    useEffect(() => {
        if (!isRunning || !selectedBot) return;
        const interval = setInterval(() => {
            window.api.getStats(selectedBot.id).then(setStats);
        }, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, [isRunning, selectedBot]);

    const toggleBot = async () => {
        if (!selectedBot) return;

        if (isRunning) {
            await window.api.stopBot();
            setIsRunning(false);
            addLocalLog("🛑 Engine stopped.");
        } else {
            addLocalLog(`🚀 Starting engine...`);
            const result = await window.api.startBot();
            if (result.success) {
                setIsRunning(true);
            } else {
                addLocalLog(`❌ Engine startup error: ${result.error || 'Unknown'}`);
            }
        }
    };

    const addLocalLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 300));
    };

    const handleExportLog = async () => {
        if (logs.length === 0) return;
        const result = await window.api.exportLogs(logs);
        if (result.success) {
            addLocalLog(`📋 Log esportato: ${result.path}`);
        } else if (result.error !== 'Cancelled') {
            addLocalLog(`❌ Errore export: ${result.error}`);
        }
    };

    useEffect(() => {
        setShowSettings(false);
    }, [selectedBot]);

    const handleBotUpdate = useCallback((updatedBot: BotConfig) => {
        setSelectedBot(updatedBot);
        setRefreshKey(prev => prev + 1);
        addLocalLog(`✅ Bot "${updatedBot.name}" aggiornato con successo.`);
    }, []);

    const handleBotDelete = useCallback(() => {
        setSelectedBot(null);
        setLogs([]);
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <div className="h-screen bg-dark-950 text-white flex font-titan overflow-hidden selection:bg-titan-500/30">
            {/* LEFT HALF — Bot Selector + Feed Manager */}
            <div className="w-1/2 flex h-full">
                <BotSelector
                    key={refreshKey}
                    onSelect={(bot) => {
                        setSelectedBot(bot);
                    }}
                    currentBotId={selectedBot?.id}
                    onEdit={() => setShowSettings(true)}
                />
                {selectedBot ? (
                    <div className="flex-1 border-r border-titan-500/10 flex flex-col bg-dark-900/50 h-full overflow-hidden">
                        <FeedManager botId={selectedBot.id} />
                    </div>
                ) : (
                    <div className="flex-1 border-r border-titan-500/10 flex items-center justify-center bg-dark-900/50 text-neutral-600 p-8 text-center">
                        <div>
                            <Settings size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="text-sm">{t('status.selectBot')}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT HALF — Console */}
            <main className="w-1/2 flex flex-col relative bg-dark-950">
                {/* Header */}
                <header className="px-6 py-3 border-b border-titan-500/10 flex justify-between items-center bg-dark-900/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-9 h-9 drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]" />
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-white uppercase leading-tight">
                                {t('app.title')} <span className="text-titan-400 font-light">{t('app.edition')}</span>
                            </h1>
                            <div className="flex gap-2 items-baseline">
                                <p className="text-[9px] text-neutral-600 font-medium tracking-wide">{t('app.copyright')}</p>
                                <p className="text-[8px] text-titan-500/40 font-mono">v{version}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedBot && (
                            <>
                                <div className={cn(
                                    "px-3 py-1 rounded-md text-[10px] font-bold border flex items-center gap-2 uppercase tracking-wider",
                                    isRunning
                                        ? "bg-titan-500/10 border-titan-500/20 text-titan-400"
                                        : "bg-red-500/10 border-red-500/20 text-red-400"
                                )}>
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        isRunning ? "bg-titan-400 status-dot-active animate-pulse" : "bg-red-500 status-dot-stopped"
                                    )}></div>
                                    {isRunning ? t('status.online') : t('status.offline')}
                                </div>

                                <div className="w-px h-6 bg-titan-500/10 mx-1"></div>
                            </>
                        )}

                        <button
                            onClick={() => setShowSystemSettings(true)}
                            className="p-2 rounded-lg hover:bg-titan-500/10 text-neutral-500 hover:text-titan-400 transition-all border border-transparent hover:border-titan-500/20"
                            title={t('dashboard.systemSettingsTitle')}
                        >
                            <Settings size={16} />
                        </button>
                    </div>
                </header>

                {selectedBot ? (
                    <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
                        {/* STATS + IGNITION ROW */}
                        < div className="flex items-center justify-center gap-8 py-2" >
                            {/* Stats Left */}
                            {stats && (
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-titan-400 leading-none">{stats.today}</p>
                                        <p className="text-[8px] text-titan-500/40 uppercase tracking-widest font-bold mt-1">{t('stats.today')}</p>
                                    </div>
                                    <div className="w-px h-8 bg-titan-500/10"></div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-titan-300 leading-none">{stats.week}</p>
                                        <p className="text-[8px] text-titan-500/40 uppercase tracking-widest font-bold mt-1">{t('stats.week')}</p>
                                    </div>
                                </div>
                            )
                            }

                            {/* IGNITION BUTTON */}
                            <div className="relative">
                                {isRunning && <div className="ignition-glow" />}
                                <button
                                    onClick={toggleBot}
                                    className={cn(
                                        "ignition-btn relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-2xl",
                                        isRunning
                                            ? "active bg-gradient-to-br from-titan-600 to-titan-800 shadow-titan-500/30"
                                            : "bg-gradient-to-br from-dark-700 to-dark-900 border border-titan-500/20 hover:border-titan-500/40 shadow-black/50"
                                    )}
                                >
                                    {isRunning ? (
                                        <Square size={22} fill="currentColor" className="text-white relative z-10" />
                                    ) : (
                                        <Play size={24} fill="currentColor" className="text-titan-400 ml-1 relative z-10" />
                                    )}
                                    {isRunning && (
                                        <div className="absolute inset-0 rounded-2xl bg-titan-500/10 animate-pulse" />
                                    )}
                                </button>
                            </div>

                            {/* Stats Right */}
                            {
                                stats && (
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-neutral-400 leading-none">{stats.total}</p>
                                            <p className="text-[8px] text-titan-500/40 uppercase tracking-widest font-bold mt-1">{t('stats.total')}</p>
                                        </div>
                                        <div className="w-px h-8 bg-titan-500/10"></div>
                                        <div className="flex items-center gap-1 text-titan-500/30">
                                            <BarChart3 size={12} />
                                            <span className="text-[8px] uppercase tracking-widest font-bold">{t('stats.statsLabel')}</span>
                                        </div>
                                    </div>
                                )
                            }
                        </div >

                        {/* LOG PANEL */}
                        < div className="flex-1 bg-dark-950/90 rounded-xl panel-border p-0 font-mono text-xs overflow-hidden flex flex-col shadow-inner relative scanline-bg" >
                            <div className="flex justify-between items-center px-4 py-2 border-b border-titan-500/10 bg-dark-900/50 relative z-10">
                                <span className="text-titan-500/50 font-bold tracking-widest text-[10px] uppercase">{t('logs.title')}</span>
                                <div className="flex items-center gap-2">
                                    {logs.length > 0 && (
                                        <>
                                            <button
                                                onClick={handleExportLog}
                                                className="text-neutral-600 hover:text-titan-400 text-[10px] uppercase tracking-wide transition-colors flex items-center gap-1"
                                                title={t('logs.exportTitle')}
                                            >
                                                <Download size={11} />
                                                {t('logs.export')}
                                            </button>
                                            <span className="text-neutral-800">|</span>
                                            <button
                                                onClick={() => setLogs([])}
                                                className="text-neutral-600 hover:text-titan-400 text-[10px] uppercase tracking-wide transition-colors"
                                            >
                                                {t('logs.clear')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-1 p-4 relative z-10">
                                {logs.map((log, i) => (
                                    <div key={i} className="break-words font-medium opacity-80 hover:opacity-100 transition-opacity">
                                        <span className={
                                            log.includes("Error") || log.includes("❌") || log.includes("Fallito")
                                                ? "text-red-400"
                                                : log.includes("Found New Item") || log.includes("🆕") || log.includes("✅")
                                                    ? "text-green-400"
                                                    : log.includes("SKIP") || log.includes("⚠️") || log.includes("⏳")
                                                        ? "text-yellow-500"
                                                        : "text-blue-100"
                                        }>{log}</span>
                                    </div>
                                ))}
                                {logs.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-titan-500/20 gap-2">
                                        <span className="text-sm tracking-widest uppercase">{t('status.awaiting')}</span>
                                    </div>
                                )}
                            </div>
                        </div >
                    </div >
                ) : (
                    <div className="flex-1 flex items-center justify-center text-neutral-700 grid-dots">
                        <span className="text-sm tracking-widest uppercase">{t('status.selectBot')}</span>
                    </div>
                )}
            </main >

            {showSettings && selectedBot && (
                <BotSettingsModal
                    bot={selectedBot}
                    onClose={() => setShowSettings(false)}
                    onUpdate={handleBotUpdate}
                    onDelete={handleBotDelete}
                />
            )}

            {
                showSystemSettings && (
                    <SystemSettingsModal onClose={() => setShowSystemSettings(false)} />
                )
            }
        </div >
    );
}
