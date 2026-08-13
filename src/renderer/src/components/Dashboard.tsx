import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
    Play, Square, Settings, Download, BarChart3, Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BotConfig, LogEntry } from '../../../shared/types';
import { isJournalEntry, JournalRow, ActivityStrip } from './ScanJournal';
import { BotSelector } from './BotSelector';
import { FeedManager } from './FeedManager';
import logo from '../assets/logo.png';
import { BotSettingsModal } from './BotSettingsModal';
import { SystemSettingsModal } from './SystemSettingsModal';
import { StatsModal } from './StatsModal';
import { useTranslation } from '../locales/I18nContext';
import { useToast } from './ui/Toast';
import type { Updater } from '../hooks/useUpdater';

/**
 * Le linguette dell'intestazione del pannello (diario/console, tutti/solo questo).
 *
 * `text-nano` sta **fuori** da `cn()` di proposito: tailwind-merge lo scambia per una
 * classe di colore e lo elimina in favore di quella condizionale che segue. Le linguette
 * perdevano corpo, maiuscoletto e spaziatura senza che nulla lo segnalasse.
 *
 * Il colore inattivo era `outline-variant/40`, cioè il blu pieno #3b82f6: 1,7:1 su fondo
 * scuro. Con `on-surface-variant/55` sta a 4,65:1, sopra il minimo AA.
 */
function pillClass(active: boolean, accent: string): string {
    return `text-nano ${cn(
        'px-1.5 py-0.5 font-bold transition-colors whitespace-nowrap',
        active ? accent : 'text-on-surface-variant/55 hover:text-on-surface-variant'
    )}`;
}

export function Dashboard({ updater }: { updater?: Updater }) {
    const { t } = useTranslation();
    const { error, success } = useToast();
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
    // Fase 7: il diario è la vista predefinita, la console grezza sta dietro l'interruttore
    const [rawConsole, setRawConsole] = useState(false);
    // Sorgente attualmente in lettura: si riscrive sul posto, non si accoda al diario
    const [activity, setActivity] = useState<string | null>(null);
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
            // La riga di attività si legge dal lotto *prima* di rovesciarlo: l'ultimo
            // `source-start` del lotto è la sorgente più recente, e un `scan-end` o uno
            // spegnimento che arrivano dopo la spengono. Nessuna di queste è una voce
            // del diario: qui si aggiorna uno stato, non si accoda una riga.
            for (const entry of newLogs) {
                const type = entry.event?.type;
                if (type === 'source-start') setActivity(entry.event!.source ?? null);
                else if (type === 'scan-end' || type === 'engine-stop') setActivity(null);
            }
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

    /**
     * Righe generate dal renderer, non dal motore. Restano nella console grezza: gli eventi
     * del diario li dichiara il main process, e duplicarli qui significherebbe vedere due
     * volte l'accensione. Gli errori affiorano comunque nel diario, per livello.
     */
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

    /**
     * Fase 7: si esporta il file di log della giornata, non più l'array in memoria.
     * Non dipende più da quel che è a schermo — quindi il pulsante resta valido anche
     * quando il diario mostra sei righe invece di seicento.
     */
    const handleExportLog = async () => {
        const result = await window.api.exportLogs();
        if (result.success) {
            success(t('logs.exportDone'), result.path);
            addLocalLog(`📋 Log esportato: ${result.path}`);
        } else if (result.error === 'NoLogFile') {
            error(t('logs.exportEmpty'));
        } else if (result.error !== 'Cancelled') {
            error(`${t('logs.exportFailed')} ${result.error}`);
            addLocalLog(`❌ Errore export: ${result.error}`);
        }
    };

    useEffect(() => {
        setShowSettings(false);
        setFilterBySelectedBot(false);
    }, [selectedBot]);

    // Il filtro per bot legge il nome dall'evento quando c'è: è un campo, non una sottostringa
    // pescata dal testo. Per le righe senza evento resta il vecchio confronto sul messaggio.
    const matchesSelectedBot = (l: LogEntry) =>
        l.event?.bot ? l.event.bot === selectedBot!.name : l.message.includes(`[${selectedBot!.name}]`);

    const filteredLogs = filterBySelectedBot && selectedBot ? logs.filter(matchesSelectedBot) : logs;

    // Una sola sorgente, due modi di disegnarla: il diario non è un secondo archivio in memoria.
    const displayedLogs = rawConsole ? filteredLogs : filteredLogs.filter(isJournalEntry);

    const logVirtualizer = useVirtualizer({
        count: displayedLogs.length,
        getScrollElement: () => logContainerRef.current,
        // Le voci del diario sono alte due o tre righe, quelle della console una sola.
        // `measureElement` corregge comunque, ma partire dalla stima giusta evita il salto.
        estimateSize: () => (rawConsole ? 22 : 46),
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
                                {/* `text-micro` fuori da cn(): tailwind-merge lo scambia per una
                                    classe di colore e lo cancella in favore del ternario che segue.
                                    Il badge perdeva corpo, maiuscoletto e spaziatura in silenzio. */}
                                <div className={`text-micro ${cn(
                                    "px-3 py-1 rounded font-bold border flex items-center gap-2",
                                    isRunning
                                        ? "bg-success/10 border-success/25 text-success"
                                        : "bg-error/10 border-error/20 text-error"
                                )}`}>
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
                                {/* Le due linguette sono il titolo del pannello: dicono già quale
                                    vista è in mostra. Un'etichetta di testo in più le spingeva
                                    fuori misura — a metà di una finestra da 900px «CONSOLE» ed
                                    «ESPORTA» finivano tagliati. */}
                                <div className="flex items-center gap-3">
                                    {/* Diario ↔ console grezza. Stessi dati, due modi di disegnarli. */}
                                    <div className="flex items-center bg-surface-container-lowest/80 rounded border border-outline-variant/10 overflow-hidden">
                                        <button
                                            onClick={() => setRawConsole(false)}
                                            className={pillClass(!rawConsole, 'bg-secondary/15 text-secondary')}
                                        >{t('journal.viewJournal')}</button>
                                        <button
                                            onClick={() => setRawConsole(true)}
                                            className={pillClass(rawConsole, 'bg-secondary/15 text-secondary')}
                                        >{t('journal.viewConsole')}</button>
                                    </div>

                                    <div className="flex items-center bg-surface-container-lowest/80 rounded border border-outline-variant/10 overflow-hidden">
                                        <button
                                            onClick={() => setFilterBySelectedBot(false)}
                                            className={pillClass(!filterBySelectedBot, 'bg-primary/15 text-primary')}
                                        >{t('logs.filterAll')}</button>
                                        <button
                                            onClick={() => setFilterBySelectedBot(true)}
                                            disabled={!selectedBot}
                                            className={pillClass(filterBySelectedBot, 'bg-primary/15 text-primary') + ' disabled:opacity-30'}
                                        >{t('logs.filterBot')}</button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 relative z-10">
                                    {/* L'esportazione non dipende più da quel che è in memoria:
                                        legge il file della giornata, quindi resta sempre offerta. */}
                                    <button
                                        onClick={handleExportLog}
                                        className="text-outline-variant/40 hover:text-primary text-nano transition-colors flex items-center gap-1"
                                        title={t('logs.exportTitle')}
                                    >
                                        <Download size={11} />
                                        {t('logs.export')}
                                    </button>
                                    {logs.length > 0 && (
                                        <>
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

                            {/* Sorgente in lettura adesso — si riscrive sul posto, non si accoda */}
                            {!rawConsole && <ActivityStrip source={activity} t={t} />}

                            {/* Log entries — virtual scroll, fino a 5000 righe senza impatto RAM/DOM */}
                            <div
                                ref={logContainerRef}
                                className="flex-1 overflow-y-auto relative z-10 px-4 pt-2 pb-2"
                            >
                                {displayedLogs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-outline-variant/20 gap-2">
                                        <span className="text-micro">
                                            {filterBySelectedBot
                                                ? `— ${selectedBot?.name} —`
                                                : rawConsole ? t('status.awaiting') : t('journal.empty')}
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
                                                    className={rawConsole
                                                        ? "break-words font-medium opacity-75 hover:opacity-100 transition-opacity leading-relaxed"
                                                        : undefined}
                                                >
                                                    {rawConsole ? (
                                                        <span className={
                                                            log.level === 'error'   ? "text-error"
                                                            // Il verde dei successi era `text-secondary`, cioè il ciano:
                                                            // refuso, non scelta — `text-success` esiste ed è già in uso
                                                            // sul badge del bot attivo, poche righe più su.
                                                            : log.level === 'success' ? "text-success"
                                                            : log.level === 'warn'    ? "text-tertiary"
                                                            : "text-on-surface-variant"
                                                        }>{log.message}</span>
                                                    ) : (
                                                        <JournalRow entry={log} t={t} />
                                                    )}
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
