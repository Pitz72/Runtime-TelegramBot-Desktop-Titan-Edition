import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
    Power, PowerOff, RefreshCw, Rss, Send, Moon, Clock, Flag,
    AlertTriangle, XCircle, Loader2, Download, Eraser, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogEntry, ScanEventType } from '../../../shared/types';
import { Button } from './ui/Button';
import { Segmented } from './ui/Controls';
import { useTranslation } from '../locales/I18nContext';

/**
 * DIARIO DI SCANSIONE — Fase 7, ridisegnato nella 2.4.
 *
 * A schermo arrivano solo gli eventi che contano — scansione avviata, contenuti trovati,
 * pubblicazioni, chiusura del giro — più tutto ciò che è andato storto. Il file di log su
 * disco riceve comunque ogni riga, ed è quello che «Esporta» salva. La console grezza sta
 * dietro l'interruttore Diario/Console.
 */

/** Tipi di evento che meritano una riga nel diario. `source-start` no: alimenta la riga di attività. */
const JOURNAL_TYPES = new Set<ScanEventType>([
    'engine-start', 'engine-stop', 'scan-start',
    'item-found', 'item-deferred', 'item-published',
    'scan-end', 'next-scan',
]);

/**
 * Una riga entra nel diario se il motore l'ha dichiarata come evento, **oppure** se è un
 * errore o un avviso: le righe di guasto sono decine, sparse nel motore, e nessuna ha un
 * evento strutturato. Filtrarle via significherebbe nascondere proprio ciò che va visto.
 */
export function isJournalEntry(entry: LogEntry): boolean {
    if (entry.event) return JOURNAL_TYPES.has(entry.event.type);
    return entry.level === 'error' || entry.level === 'warn';
}

/**
 * Estrae l'ora dal messaggio già formattato dal logger: "[HH:MM:SS] testo", e toglie
 * l'emoji iniziale: nel diario il livello lo dicono già icona ed etichetta.
 */
function splitTimestamp(message: string): { time: string; body: string } {
    const strip = (s: string) => s.replace(/^[\p{Extended_Pictographic}️\s]+/u, '');
    const match = /^\[([^\]]+)\]\s*/.exec(message);
    if (!match) return { time: '', body: strip(message) };
    return { time: match[1], body: strip(message.slice(match[0].length)) };
}

interface Style {
    icon: LucideIcon;
    color: string;
    /** Chiave i18n dell'etichetta, sotto `journal.` */
    label: string;
}

const EVENT_STYLES: Record<ScanEventType, Style> = {
    'engine-start':   { icon: Power,         color: 'text-success', label: 'engineStart' },
    'engine-stop':    { icon: PowerOff,      color: 'text-fg-3',    label: 'engineStop' },
    'scan-start':     { icon: RefreshCw,     color: 'text-accent',  label: 'scanStart' },
    'source-start':   { icon: Rss,           color: 'text-accent',  label: 'sourceStart' },
    'item-found':     { icon: Rss,           color: 'text-accent',  label: 'itemFound' },
    'item-deferred':  { icon: Moon,          color: 'text-warning', label: 'itemDeferred' },
    'item-published': { icon: Send,          color: 'text-success', label: 'itemPublished' },
    'scan-end':       { icon: Flag,          color: 'text-fg-2',    label: 'scanEnd' },
    'next-scan':      { icon: Clock,         color: 'text-fg-3',    label: 'nextScan' },
};

const FALLBACK_STYLES = {
    error: { icon: XCircle,       color: 'text-danger',  label: 'error' },
    warn:  { icon: AlertTriangle, color: 'text-warning', label: 'warn' },
};

const CONSOLE_COLORS: Record<LogEntry['level'], string> = {
    error: 'text-danger',
    warn: 'text-warning',
    success: 'text-success',
    info: 'text-fg-2',
};

type T = (key: string) => string;

/** Una voce del diario: etichetta, sorgente e ora sulla prima riga, titolo sotto. */
export function JournalRow({ entry, t }: { entry: LogEntry; t: T }) {
    const { time, body } = splitTimestamp(entry.message);
    const event = entry.event;
    const style = event ? EVENT_STYLES[event.type] : FALLBACK_STYLES[entry.level === 'error' ? 'error' : 'warn'];
    const Icon = style.icon;
    // Le etichette con un numero dentro usano il segnaposto {n}.
    const label = t(`journal.${style.label}`).replace('{n}', String(event?.count ?? 0));
    const detail = event?.title ?? (event ? null : body);
    const source = event?.source;

    return (
        <div className="flex gap-3 rounded-md px-2 py-2 hover:bg-surface-2">
            <Icon size={15} className={cn('mt-0.5 shrink-0', style.color)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                    <span className={cn('shrink-0 text-sm font-semibold', style.color)}>{label}</span>
                    {source && <span className="min-w-0 truncate text-sm text-fg-3">· {source}</span>}
                    {time && <span className="ml-auto shrink-0 font-mono text-xs text-fg-3 tabular">{time}</span>}
                </div>
                {detail && <p className="mt-0.5 break-words text-sm text-fg-2">{detail}</p>}
            </div>
        </div>
    );
}

/**
 * Riga di attività: quale sorgente il motore sta leggendo adesso. Si riscrive sul posto
 * invece di accodarsi, così il pannello non sembra fermo mentre lavora.
 */
export function ActivityStrip({ source, t }: { source: string | null; t: T }) {
    if (!source) return null;
    return (
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-5 py-2">
            <Loader2 size={14} className="shrink-0 animate-spin text-accent" aria-hidden="true" />
            <span className="shrink-0 text-sm text-fg-3">{t('journal.reading')}</span>
            <span className="truncate font-mono text-sm text-fg-2">{source}</span>
        </div>
    );
}

interface PanelProps {
    logs: LogEntry[];
    activity: string | null;
    rawConsole: boolean;
    onRawConsoleChange: (raw: boolean) => void;
    onlySelectedBot: boolean;
    onOnlySelectedBotChange: (only: boolean) => void;
    selectedBotName: string | null;
    onExport: () => void;
    onClear: () => void;
    /** false quando la sezione è già nominata da una scheda */
    showTitle?: boolean;
}

/** Pannello dell'attività: intestazione con le viste, riga di attività, elenco virtualizzato. */
export function JournalPanel({
    logs, activity, rawConsole, onRawConsoleChange, onlySelectedBot, onOnlySelectedBotChange,
    selectedBotName, onExport, onClear, showTitle = true,
}: PanelProps) {
    const { t } = useTranslation();
    const scrollRef = useRef<HTMLDivElement>(null);

    const displayed = rawConsole ? logs : logs.filter(isJournalEntry);

    const virtualizer = useVirtualizer({
        count: displayed.length,
        getScrollElement: () => scrollRef.current,
        // Le voci del diario sono alte due righe, quelle della console una o due.
        estimateSize: () => (rawConsole ? 24 : 54),
        overscan: 12,
    });

    return (
        <section aria-labelledby="journal-heading" className="flex h-full min-h-0 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-4">
                <h2 id="journal-heading" className={showTitle ? 'text-lg font-semibold text-fg' : 'sr-only'}>{t('journal.title')}</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <Segmented
                        label={t('journal.viewLabel')}
                        value={rawConsole ? 'console' : 'journal'}
                        onChange={v => onRawConsoleChange(v === 'console')}
                        options={[
                            { value: 'journal', label: t('journal.viewJournal') },
                            { value: 'console', label: t('journal.viewConsole') },
                        ]}
                    />
                    <Segmented
                        label={t('journal.filterLabel')}
                        value={onlySelectedBot ? 'bot' : 'all'}
                        onChange={v => onOnlySelectedBotChange(v === 'bot')}
                        options={[
                            { value: 'all', label: t('journal.filterAll') },
                            { value: 'bot', label: t('journal.filterBot'), disabled: !selectedBotName },
                        ]}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-1 px-5 pb-2">
                <Button size="sm" variant="ghost" icon={Download} onClick={onExport} title={t('journal.exportTitle')}>{t('journal.export')}</Button>
                <Button size="sm" variant="ghost" icon={Eraser} onClick={onClear} disabled={logs.length === 0}>{t('journal.clear')}</Button>
            </div>

            {!rawConsole && <ActivityStrip source={activity} t={t} />}

            <div
                ref={scrollRef}
                // `log`: regione che riceve aggiunte nel tempo. Niente aria-live: con decine di
                // righe per giro sarebbe rumore continuo. Lo stato del motore lo annuncia la barra in alto.
                role="log"
                aria-label={rawConsole ? t('journal.viewConsole') : t('journal.title')}
                tabIndex={0}
                className={cn('min-h-0 flex-1 select-text overflow-y-auto px-3 py-2', rawConsole && 'font-mono text-xs')}
            >
                {displayed.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
                        <p className="text-base text-fg-2">
                            {onlySelectedBot && selectedBotName
                                ? t('journal.emptyBot').replace('{name}', selectedBotName)
                                : t('journal.empty')}
                        </p>
                        <p className="text-sm text-fg-3">{t('journal.emptyHint')}</p>
                    </div>
                ) : (
                    <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                        {virtualizer.getVirtualItems().map(row => {
                            const log = displayed[row.index];
                            return (
                                <div
                                    key={row.key}
                                    data-index={row.index}
                                    ref={virtualizer.measureElement}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${row.start}px)` }}
                                >
                                    {rawConsole
                                        ? <p className={cn('whitespace-pre-wrap break-words px-2 py-0.5 leading-5', CONSOLE_COLORS[log.level])}>{log.message}</p>
                                        : <JournalRow entry={log} t={t} />}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
