import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
    Play, Square, Settings, Download, BarChart3, Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BotConfig, LogEntry } from '../../../shared/types';
import { BotSelector } from './BotSelector';
import { FeedManager } from './FeedManager';
import logo from '../assets/logo.png';
import { BotSettingsModal } from './BotSettingsModal';
import { SystemSettingsModal } from './SystemSettingsModal';
import { StatsModal } from './StatsModal';
import { useTranslation } from '../locales/I18nContext';
import { useToast } from './ui/Toast';
import type { Updater } from '../hooks/useUpdater';

export function Dashboard({ updater }: { updater?: Updater }) {
    const { t } = useTranslation();
    const { error } = useToast();
    const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [version, setVersion] = useState('1.1.0');
    const [showSettings, setShowSettings] = useState(false);
    const [showSystemSettings, setShowSystemSettings] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [stats, setStats] = useState<{ total: number; today: number; week: number } | null>(null);
    const [filterBySelectedBot, setFilterBySelectedBot] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const logContainerRef = useRef<HTMLDivElement>(null);
    // ID monotono per i log generati localmente. Negativo decrescente: non collide mai
    // con gli ID del backend (positivi crescenti) né con altri log locali nello stesso ms.
    const localLogIdRef = useRef(0);

    useEffect(() => {
        window.api.getVersion().then(setVersion);

        // Sincronizza con lo stato reale del motore (che vive nel main process e
        // sopravvive a un reload del renderer): evita di mostrare "offline" se gira già.
        window.api.getBotStatus().then(s => setIsRunning(s.running)).catch(() => {});

        // Il controllo aggiornamenti e la relativa schermata sono gestiti a livello di App
        // (useUpdater + UpdateModal), così partono già dall'intro. Qui non serve più nulla.

        window.api.onLogsBatch((newLogs: LogEntry[]) => {
            setLogs(prev => [...newLogs.reverse(), ...prev].slice(0, 5000));
        });
        window.api.onYouTubeApiError(() => {
            error(t('youtubeError.message'), t('youtubeError.title'));
        });
    }, []);

    useEffect(() => {
        if (selectedBot) {
            window.api.getStats(selectedBot.id).then(setStats);
        } else {
            setStats(null);
        }
    }, [selectedBot, refreshKey]);

    useEffect(() => {
        if (!isRunning || !selectedBot) return;
        const interval = setInterval(() => {
            window.api.getStats(selectedBot.id).then(setStats);
        }, 30000);
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
        const level: LogEntry['level'] =
            message.includes('❌') ? 'error'
            : message.includes('⚠️') ? 'warn'
            : (message.includes('✅') || message.includes('🚀')) ? 'success'
            : 'info';
        setLogs(prev => [{
            id: --localLogIdRef.current,
            level,
            message: `[${timestamp}] ${message}`,
        }, ...prev].slice(0, 5000));
    };

    const handleExportLog = async () => {
        if (logs.length === 0) return;
        const result = await window.api.exportLogs(logs.map(l => l.message));
        if (result.success) {
            addLocalLog(`📋 Log esportato: ${result.path}`);
        } else if (result.error !== 'Cancelled') {
            addLocalLog(`❌ Errore export: ${result.error}`);
        }
    };

    useEffect(() => {
        setShowSettings(false);
        setFilterBySelectedBot(false);
    }, [selectedBot]);

    const displayedLogs = filterBySelectedBot && selectedBot
        ? logs.filter(l => l.message.includes(`[${selectedBot.name}]`))
        : logs;

    const logVirtualizer = useVirtualizer({
        count: displayedLogs.length,
        getScrollElement: () => logContainerRef.current,
        estimateSize: () => 22,
        overscan: 15,
    });

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
        <div className="h-screen bg-background text-on-surface flex font-body overflow-hidden relative" style={{ userSelect: 'none' }}>

            {/* LEFT HALF — Bot Selector + Feed Manager */}
            <div className="w-1/2 flex h-full">
                <BotSelector
                    key={refreshKey}
                    onSelect={(bot) => setSelectedBot(bot)}
                    currentBotId={selectedBot?.id}
                    onEdit={() => setShowSettings(true)}
                />
                {selectedBot ? (
                    <div className="flex-1 border-r border-outline-variant/15 flex flex-col bg-surface-container-lowest h-full overflow-hidden">
                        <FeedManager botId={selectedBot.id} />
                    </div>
                ) : (
                    <div className="flex-1 border-r border-outline-variant/15 flex items-center justify-center bg-surface-container-lowest p-8 text-center relative overflow-hidden">
                        {/* Ambient halo */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[400px] h-[400px] rounded-full bg-primary/5 blur-[80px]" />
                        </div>
                        <div className="relative z-10 grid-dots absolute inset-0 opacity-40" />
                        <div className="relative z-20">
                            <Circle size={40} strokeWidth={1} className="mx-auto mb-4 text-outline-variant/30" />
                            <p className="text-micro text-outline-variant/40">{t('status.selectBot')}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT HALF — Console */}
            <main className="w-1/2 flex flex-col relative bg-surface-container-lowest">

                {/* Header */}
                <header className="px-6 py-3 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-low/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-9 h-9 drop-shadow-[0_0_10px_rgba(59,130,246,0.30)]" />
                        <div>
                            <h1 className="font-headline text-base font-bold tracking-tight text-on-surface uppercase leading-tight">
                                {t('app.title')} <span className="text-primary font-light">{t('app.edition')}</span>
                            </h1>
                            <div className="flex gap-2 items-baseline">
                                <p className="text-nano text-outline-variant/40">{t('app.copyright')}</p>
                                <p className="text-nano text-primary/30">v{version}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedBot && (
                            <>
                                <div className={cn(
                                    "px-3 py-1 rounded text-micro font-bold border flex items-center gap-2",
                                    isRunning
                                        ? "bg-success/10 border-success/25 text-success"
                                        : "bg-error/10 border-error/20 text-error"
                                )}>
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        isRunning
                                            ? "bg-success status-dot-active animate-pulse"
                                            : "bg-error status-dot-stopped"
                                    )} />
                                    {isRunning ? t('status.online') : t('status.offline')}
                                </div>
                                <div className="w-px h-5 bg-outline-variant/20" />
                            </>
                        )}

                        <button
                            onClick={() => setShowSystemSettings(true)}
                            className="p-2 rounded hover:bg-surface-container-highest/60 text-outline-variant hover:text-primary transition-all border border-transparent hover:border-outline-variant/20"
                            title={t('dashboard.systemSettingsTitle')}
                        >
                            <Settings size={16} />
                        </button>
                    </div>
                </header>

                {selectedBot ? (
                    <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">

                        {/* STATS + IGNITION ROW */}
                        <div className="flex items-center justify-center gap-8 py-2">

                            {/* Stats Left — Today + Week */}
                            {stats && (
                                <div className="flex items-center gap-5">
                                    <div className="text-center">
                                        <p className="font-headline text-2xl font-bold text-primary text-glow leading-none">{stats.today}</p>
                                        <p className="text-nano text-outline-variant/50 mt-1">{t('stats.today')}</p>
                                    </div>
                                    <div className="w-px h-8 bg-outline-variant/20" />
                                    <div className="text-center">
                                        <p className="font-headline text-2xl font-bold text-secondary text-glow-cyan leading-none">{stats.week}</p>
                                        <p className="text-nano text-outline-variant/50 mt-1">{t('stats.week')}</p>
                                    </div>
                                </div>
                            )}

                            {/* IGNITION BUTTON */}
                            <div className="relative">
                                {isRunning && <div className="ignition-ring" />}
                                <button
                                    onClick={toggleBot}
                                    className={cn(
                                        "ignition-btn relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95",
                                        isRunning ? "active stopping" : ""
                                    )}
                                >
                                    {isRunning ? (
                                        <Square size={22} color="white" fill="white" className="relative z-10" />
                                    ) : (
                                        <Play size={26} color="white" fill="white" className="ml-1 relative z-10" />
                                    )}
                                </button>
                            </div>

                            {/* Stats Right — Total + Analytics trigger */}
                            {stats && (
                                <div className="flex items-center gap-5">
                                    <div className="text-center">
                                        <p className="font-headline text-2xl font-bold text-on-surface-variant leading-none">{stats.total}</p>
                                        <p className="text-nano text-outline-variant/50 mt-1">{t('stats.total')}</p>
                                    </div>
                                    <div className="w-px h-8 bg-outline-variant/20" />
                                    <button
                                        onClick={() => setShowStatsModal(true)}
                                        className="flex flex-col items-center gap-1 text-outline-variant/40 hover:text-primary transition-colors cursor-pointer group"
                                        title={t('stats.detailsTitle') as string}
                                    >
                                        <BarChart3 size={16} className="group-hover:drop-glow-primary transition-all" />
                                        <span className="text-nano">{t('stats.statsLabel')}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* LOG PANEL */}
                        <div className="flex-1 bg-surface-container-lowest rounded-xl ghost-border font-mono text-xs overflow-hidden flex flex-col shadow-inner relative scanline-bg">
                            {/* Log header */}
                            <div className="flex justify-between items-center px-4 py-2.5 border-b border-outline-variant/10 bg-surface-container-low/60 relative z-10">
                                <div className="flex items-center gap-3">
                                    <span className="text-micro text-outline-variant/50">{t('logs.title')}</span>
                                    <div className="flex items-center bg-surface-container-lowest/80 rounded border border-outline-variant/10 overflow-hidden">
                                        <button
                                            onClick={() => setFilterBySelectedBot(false)}
                                            className={cn(
                                                "px-2 py-0.5 text-nano font-bold transition-colors",
                                                !filterBySelectedBot
                                                    ? "bg-primary/15 text-primary"
                                                    : "text-outline-variant/40 hover:text-outline-variant"
                                            )}
                                        >{t('logs.filterAll')}</button>
                                        <button
                                            onClick={() => setFilterBySelectedBot(true)}
                                            disabled={!selectedBot}
                                            className={cn(
                                                "px-2 py-0.5 text-nano font-bold transition-colors disabled:opacity-30",
                                                filterBySelectedBot
                                                    ? "bg-primary/15 text-primary"
                                                    : "text-outline-variant/40 hover:text-outline-variant"
                                            )}
                                        >{t('logs.filterBot')}</button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 relative z-10">
                                    {logs.length > 0 && (
                                        <>
                                            <button
                                                onClick={handleExportLog}
                                                className="text-outline-variant/40 hover:text-primary text-nano transition-colors flex items-center gap-1"
                                                title={t('logs.exportTitle')}
                                            >
                                                <Download size={11} />
                                                {t('logs.export')}
                                            </button>
                                            <span className="text-outline-variant/20">|</span>
                                            <button
                                                onClick={() => setLogs([])}
                                                className="text-outline-variant/40 hover:text-primary text-nano transition-colors"
                                            >
                                                {t('logs.clear')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Log entries — virtual scroll, fino a 5000 righe senza impatto RAM/DOM */}
                            <div
                                ref={logContainerRef}
                                className="flex-1 overflow-y-auto relative z-10 px-4 pt-2 pb-2"
                            >
                                {displayedLogs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-outline-variant/20 gap-2">
                                        <span className="text-micro">
                                            {filterBySelectedBot ? `— ${selectedBot?.name} —` : t('status.awaiting')}
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ height: logVirtualizer.getTotalSize(), position: 'relative' }}>
                                        {logVirtualizer.getVirtualItems().map(vRow => {
                                            const log = displayedLogs[vRow.index];
                                            return (
                                                <div
                                                    key={vRow.key}
                                                    data-index={vRow.index}
                                                    ref={logVirtualizer.measureElement}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        transform: `translateY(${vRow.start}px)`,
                                                        paddingBottom: '2px',
                                                    }}
                                                    className="break-words font-medium opacity-75 hover:opacity-100 transition-opacity leading-relaxed"
                                                >
                                                    <span className={
                                                        log.level === 'error'   ? "text-error"
                                                        : log.level === 'success' ? "text-secondary"
                                                        : log.level === 'warn'    ? "text-tertiary"
                                                        : "text-on-surface-variant"
                                                    }>{log.message}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-outline-variant/20 relative overflow-hidden">
                        <div className="grid-dots absolute inset-0 opacity-30" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]" />
                        </div>
                        <span className="text-micro relative z-10">{t('status.selectBot')}</span>
                    </div>
                )}
            </main>

            {showSettings && selectedBot && (
                <BotSettingsModal
                    bot={selectedBot}
                    onClose={() => setShowSettings(false)}
                    onUpdate={handleBotUpdate}
                    onDelete={handleBotDelete}
                />
            )}

            {showSystemSettings && (
                <SystemSettingsModal onClose={() => setShowSystemSettings(false)} updater={updater} />
            )}

            {showStatsModal && selectedBot && (
                <StatsModal
                    botId={selectedBot.id}
                    botName={selectedBot.name}
                    onClose={() => setShowStatsModal(false)}
                />
            )}
        </div>
    );
}
