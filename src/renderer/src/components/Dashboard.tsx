import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Bot as BotIcon, Rss, Activity } from 'lucide-react';
import { BotConfig, LogEntry } from '../../../shared/types';
import { TopBar } from './TopBar';
import { BotSidebar } from './BotSidebar';
import { BotHeader } from './BotHeader';
import { FeedManager } from './FeedManager';
import { JournalPanel } from './ScanJournal';
import { NewBotDialog } from './NewBotDialog';
import { BotSettingsModal } from './BotSettingsModal';
import { SystemSettingsModal } from './SystemSettingsModal';
import { StatsModal } from './StatsModal';
import { GuideModal } from './GuideModal';
import { Button } from './ui/Button';
import { Tabs, TabPanel } from './ui/Controls';
import { useToast } from './ui/Toast';
import { useTranslation } from '../locales/I18nContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { errorMessage } from '../lib/errors';
import type { Updater } from '../hooks/useUpdater';

const MAX_LOGS = 5000;

export function Dashboard({ updater }: { updater?: Updater }) {
    const { t } = useTranslation();
    const { toast, error, success } = useToast();

    const [bots, setBots] = useState<BotConfig[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [running, setRunning] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    // Sorgente in lettura e prossimo giro: si riscrivono sul posto, non si accodano al diario
    const [activity, setActivity] = useState<string | null>(null);
    const [nextScanAt, setNextScanAt] = useState<Date | null>(null);
    const [stats, setStats] = useState<{ total: number; today: number; week: number } | null>(null);
    const [statsKey, setStatsKey] = useState(0);
    const [rawConsole, setRawConsole] = useState(false);
    const [onlySelectedBot, setOnlySelectedBot] = useState(false);
    const [panel, setPanel] = useState<'feeds' | 'journal'>('feeds');

    const [showNewBot, setShowNewBot] = useState(false);
    const [showBotSettings, setShowBotSettings] = useState(false);
    const [showSystem, setShowSystem] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    // Sopra questa larghezza sorgenti e attività stanno affiancate; sotto diventano schede.
    const wide = useMediaQuery('(min-width: 1180px)');
    // ID negativi decrescenti per le righe generate qui: non collidono con quelle del motore.
    const localLogId = useRef(0);

    const selectedBot = bots.find(b => b.id === selectedId) ?? null;

    const loadBots = useCallback(async (select?: number) => {
        try {
            const loaded: BotConfig[] = await window.api.getBots();
            setBots(loaded);
            setSelectedId(prev => {
                if (select && loaded.some(b => b.id === select)) return select;
                if (prev && loaded.some(b => b.id === prev)) return prev;
                return loaded[0]?.id ?? null;
            });
        } catch (e) {
            error(errorMessage(e));
        }
    }, [error]);

    const addLocalLog = useCallback((message: string, level: LogEntry['level']) => {
        setLogs(prev => [{ id: --localLogId.current, level, message: `[${new Date().toLocaleTimeString()}] ${message}` }, ...prev].slice(0, MAX_LOGS));
    }, []);

    useEffect(() => {
        loadBots();
        // Lo stato vero del motore vive nel main process e sopravvive a un ricaricamento.
        window.api.getBotStatus().then(s => setRunning(s.running)).catch(() => {});

        window.api.onLogsBatch((batch: LogEntry[]) => {
            for (const entry of batch) {
                const type = entry.event?.type;
                if (type === 'source-start') setActivity(entry.event!.source ?? null);
                else if (type === 'scan-end' || type === 'engine-stop') setActivity(null);
                if (type === 'next-scan' && entry.event?.count) setNextScanAt(new Date(Date.now() + entry.event.count * 60000));
                if (type === 'engine-stop') setNextScanAt(null);
                if (type === 'engine-start') setRunning(true);
                if (type === 'engine-stop') setRunning(false);
            }
            setLogs(prev => [...[...batch].reverse(), ...prev].slice(0, MAX_LOGS));
        });
        window.api.onYouTubeApiError(() => {
            error(t('youtubeError.message'), t('youtubeError.title'));
        });

        // Profilo .rtb aperto con doppio clic: il main lo importa e avvisa.
        return window.api.onBotsChanged(({ botId }) => {
            loadBots(botId);
            if (botId) success(t('bots.imported'));
        });
    }, []);

    // Statistiche del bot selezionato: subito, e ogni 30 secondi a motore acceso.
    useEffect(() => {
        if (!selectedId) { setStats(null); return; }
        let alive = true;
        const load = () => window.api.getStats(selectedId).then(s => { if (alive) setStats(s); }).catch(() => {});
        load();
        const timer = running ? setInterval(load, 30000) : null;
        return () => { alive = false; if (timer) clearInterval(timer); };
    }, [selectedId, running, statsKey]);

    useEffect(() => { setOnlySelectedBot(false); }, [selectedId]);

    const toggleEngine = async () => {
        setToggling(true);
        try {
            if (running) {
                await window.api.stopBot();
                setRunning(false);
                setActivity(null);
                setNextScanAt(null);
            } else {
                const result = await window.api.startBot();
                if (result.success) setRunning(true);
                else {
                    addLocalLog(`❌ ${t('engine.startFailed')} ${result.error || ''}`, 'error');
                    error(`${t('engine.startFailed')} ${result.error || ''}`);
                }
            }
        } catch (e) {
            error(errorMessage(e));
        } finally {
            setToggling(false);
        }
    };

    const exportLog = async () => {
        const result = await window.api.exportLogs();
        if (result.success) success(result.path ?? '', t('journal.exported'));
        else if (result.error === 'NoLogFile') toast(t('journal.exportEmpty'), 'info');
        else if (result.error !== 'Cancelled') error(`${t('journal.exportFailed')} ${result.error}`);
    };

    const importBot = async () => {
        try {
            const res = await window.api.importSingleBot();
            if (res.success && res.botId) {
                success(t('bots.imported'));
                await loadBots(res.botId);
            } else if (!res.success && res.error) {
                error(`${t('bots.importFailed')} ${res.error}`);
            }
        } catch (e) {
            error(`${t('bots.importFailed')} ${errorMessage(e)}`);
        }
    };

    // Il filtro per bot legge il nome dall'evento quando c'è: è un campo, non una sottostringa.
    const visibleLogs = onlySelectedBot && selectedBot
        ? logs.filter(l => l.event?.bot ? l.event.bot === selectedBot.name : l.message.includes(`[${selectedBot.name}]`))
        : logs;

    const journal = (
        <JournalPanel
            logs={visibleLogs}
            activity={activity}
            rawConsole={rawConsole}
            onRawConsoleChange={setRawConsole}
            onlySelectedBot={onlySelectedBot}
            onOnlySelectedBotChange={setOnlySelectedBot}
            selectedBotName={selectedBot?.name ?? null}
            onExport={exportLog}
            onClear={() => setLogs([])}
            showTitle={wide}
        />
    );

    return (
        <div className="flex h-screen flex-col bg-canvas">
            <a href="#main-content" className="skip-link">{t('app.skipToContent')}</a>

            <TopBar
                running={running}
                busy={toggling}
                nextScanAt={nextScanAt}
                activity={activity}
                canStart={bots.length > 0}
                onToggle={toggleEngine}
                onOpenSettings={() => setShowSystem(true)}
                onOpenGuide={() => setShowGuide(true)}
            />

            <div className="flex min-h-0 flex-1">
                <BotSidebar
                    bots={bots}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onCreate={() => setShowNewBot(true)}
                    onImport={importBot}
                />

                {/* L'area principale scorre quando l'altezza non basta (finestra bassa o interfaccia
                    ingrandita): sorgenti e attività tengono un'altezza minima utile invece di
                    ridursi a una striscia. È il criterio WCAG 1.4.4 — ingrandire senza perdere contenuto. */}
                <main id="main-content" tabIndex={-1} className="flex min-w-0 flex-1 flex-col overflow-y-auto focus:outline-none">
                    {selectedBot ? (
                        <>
                            <BotHeader
                                bot={selectedBot}
                                stats={stats}
                                onOpenSettings={() => setShowBotSettings(true)}
                                onOpenStats={() => setShowStats(true)}
                            />

                            {wide ? (
                                <div className="grid min-h-[420px] flex-1 grid-cols-2 divide-x divide-line">
                                    <FeedManager botId={selectedBot.id} />
                                    <div className="min-h-0 bg-surface-1">{journal}</div>
                                </div>
                            ) : (
                                <div className="flex min-h-[460px] flex-1 flex-col">
                                    <Tabs
                                        idBase="workspace"
                                        label={t('workspace.tabsLabel')}
                                        value={panel}
                                        onChange={setPanel}
                                        className="px-5"
                                        items={[
                                            { id: 'feeds', label: t('feeds.title'), icon: Rss },
                                            { id: 'journal', label: t('journal.title'), icon: Activity },
                                        ]}
                                    />
                                    <TabPanel idBase="workspace" id={panel} className="min-h-0 flex-1">
                                        {panel === 'feeds' ? <FeedManager botId={selectedBot.id} showTitle={false} /> : journal}
                                    </TabPanel>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-3 text-accent" aria-hidden="true">
                                <BotIcon size={26} />
                            </span>
                            <h1 className="text-2xl font-semibold text-fg">{t('workspace.emptyTitle')}</h1>
                            <p className="mt-2 max-w-md text-base text-fg-3">{t('workspace.emptyText')}</p>
                            <Button className="mt-6" variant="primary" icon={Plus} onClick={() => setShowNewBot(true)}>{t('bots.new')}</Button>
                        </div>
                    )}
                </main>
            </div>

            <NewBotDialog
                open={showNewBot}
                onClose={() => setShowNewBot(false)}
                onCreated={(id) => {
                    setShowNewBot(false);
                    success(t('bots.created'));
                    loadBots(id);
                }}
            />

            {selectedBot && (
                <BotSettingsModal
                    open={showBotSettings}
                    bot={selectedBot}
                    onClose={() => setShowBotSettings(false)}
                    onSaved={() => { setShowBotSettings(false); loadBots(selectedBot.id); setStatsKey(k => k + 1); }}
                    onDeleted={() => { setShowBotSettings(false); setSelectedId(null); loadBots(); }}
                    onHistoryCleared={() => setStatsKey(k => k + 1)}
                />
            )}

            <SystemSettingsModal
                open={showSystem}
                onClose={() => setShowSystem(false)}
                onBotsImported={() => loadBots()}
                onOpenGuide={() => setShowGuide(true)}
                updater={updater}
            />

            {selectedBot && (
                <StatsModal open={showStats} botId={selectedBot.id} botName={selectedBot.name} onClose={() => setShowStats(false)} />
            )}

            <GuideModal open={showGuide} onClose={() => setShowGuide(false)} />
        </div>
    );
}
