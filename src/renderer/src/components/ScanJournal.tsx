import React from 'react';
import { motion } from 'framer-motion';
import {
    Power, PowerOff, RefreshCw, Rss, Send, Moon, Clock, Flag,
    AlertTriangle, XCircle, Loader2, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogEntry, ScanEventType } from '../../../shared/types';

/**
 * DIARIO DI SCANSIONE — Fase 7.
 *
 * Il pannello dei log scaricava a schermo tutto quel che il motore scriveva: con più bot
 * in scansione sono decine di righe ogni 300 ms, e il risultato era un pannello che «va a
 * singhiozzoni». Qui a schermo arrivano solo gli eventi che contano — scansione avviata,
 * contenuti trovati, pubblicazioni, chiusura del giro — più tutto ciò che è andato storto.
 *
 * Il diradamento riguarda **solo l'interfaccia**: il file di log su disco continua a
 * ricevere ogni riga, ed è quello che il pulsante «Esporta» adesso salva.
 *
 * La console grezza non è sparita: sta dietro l'interruttore nell'intestazione del pannello.
 */

/** Tipi di evento che meritano una riga nel diario. `source-start` no: alimenta la riga di attività. */
const JOURNAL_TYPES = new Set<ScanEventType>([
    'engine-start', 'engine-stop', 'scan-start',
    'item-found', 'item-deferred', 'item-published',
    'scan-end', 'next-scan',
]);

/**
 * Una riga entra nel diario se il motore l'ha dichiarata come evento, **oppure** se è un
 * errore o un avviso. La seconda condizione è deliberata: le righe di guasto sono decine,
 * sparse in tutto il motore, e nessuna ha un evento strutturato. Filtrarle via per assenza
 * di evento significherebbe nascondere proprio ciò che l'utente deve vedere.
 */
export function isJournalEntry(entry: LogEntry): boolean {
    if (entry.event) return JOURNAL_TYPES.has(entry.event.type);
    return entry.level === 'error' || entry.level === 'warn';
}

/**
 * Estrae l'ora dal messaggio già formattato dal logger: "[HH:MM:SS] testo".
 *
 * Toglie anche l'emoji iniziale: nel diario il livello lo dicono già l'icona e l'etichetta,
 * e una ❌ davanti a «Errore» è la stessa cosa detta due volte. Nella console grezza e nel
 * file l'emoji resta — lì è l'unico segnale che c'è.
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
    'engine-start':   { icon: Power,         color: 'text-success',              label: 'engineStart' },
    'engine-stop':    { icon: PowerOff,      color: 'text-outline-variant/60',   label: 'engineStop' },
    'scan-start':     { icon: RefreshCw,     color: 'text-primary',              label: 'scanStart' },
    'source-start':   { icon: Rss,           color: 'text-primary',              label: 'sourceStart' },
    'item-found':     { icon: Rss,           color: 'text-secondary',            label: 'itemFound' },
    'item-deferred':  { icon: Moon,          color: 'text-tertiary',             label: 'itemDeferred' },
    'item-published': { icon: Send,          color: 'text-success',              label: 'itemPublished' },
    'scan-end':       { icon: Flag,          color: 'text-primary',              label: 'scanEnd' },
    'next-scan':      { icon: Clock,         color: 'text-outline-variant/60',   label: 'nextScan' },
};

const FALLBACK_STYLES = {
    error: { icon: XCircle,        color: 'text-error',    label: 'error' },
    warn:  { icon: AlertTriangle,  color: 'text-tertiary', label: 'warn' },
};

interface RowProps {
    entry: LogEntry;
    /** Traduttore della Dashboard: il diario non apre un proprio contesto i18n */
    t: (key: string) => string;
}

/**
 * Una voce del diario. Due registri:
 * - gli eventi che riguardano un contenuto mostrano titolo e sorgente su una seconda riga;
 * - quelli di stato (motore, giro, attesa) stanno su una riga sola.
 */
export function JournalRow({ entry, t }: RowProps) {
    const { time, body } = splitTimestamp(entry.message);
    const event = entry.event;

    const style = event
        ? EVENT_STYLES[event.type]
        : FALLBACK_STYLES[entry.level === 'error' ? 'error' : 'warn'];
    const Icon = style.icon;

    // Le etichette con un numero dentro usano il segnaposto {n}: I18nContext non interpola.
    const label = t(`journal.${style.label}`).replace('{n}', String(event?.count ?? 0));

    // Il titolo del contenuto è l'informazione della riga; senza evento strutturato
    // (errori e avvisi) resta il messaggio grezzo, che è tutto quel che abbiamo.
    const detail = event?.title ?? (event ? null : body);
    const source = event?.source;

    return (
        <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex gap-2.5 py-1.5 pl-2 border-l border-outline-variant/10 hover:border-outline-variant/30 hover:bg-surface-container-lowest/40 transition-colors"
        >
            <Icon size={13} className={cn('shrink-0 mt-0.5', style.color)} />

            <div className="min-w-0 flex-1">
                {/* `text-micro` NON passa da cn(): tailwind-merge lo scambia per una classe
                    di colore e lo elimina in favore di quella che segue — la voce perderebbe
                    corpo, maiuscoletto e spaziatura. Concatenazione semplice, nessun conflitto. */}
                <div className="flex items-baseline gap-2">
                    <span className={`text-micro shrink-0 ${style.color}`}>{label}</span>

                    {/* La sorgente sta accanto all'etichetta, non su una riga propria:
                        una voce alta 68px riempiva il pannello con quattro contenuti. */}
                    {source && (
                        <span className="min-w-0 truncate font-mono text-[10px] text-on-surface-variant/70">
                            · {source}
                        </span>
                    )}

                    {time && (
                        <span className="ml-auto shrink-0 font-mono text-[10px] text-on-surface-variant/60 tabular-nums">
                            {time}
                        </span>
                    )}
                </div>

                {detail && (
                    <p className="text-xs text-on-surface-variant leading-snug break-words mt-0.5">
                        {detail}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

/**
 * Riga di attività: dice quale sorgente il motore sta leggendo **adesso**.
 *
 * Serve a rispondere alla controindicazione del diradamento — con pochi eventi a schermo
 * il pannello può sembrare fermo mentre invece sta lavorando. Questa riga si riscrive sul
 * posto invece di accodarsi, quindi non ricrea il problema che la fase è nata per togliere.
 */
export function ActivityStrip({ source, t }: { source: string | null; t: (key: string) => string }) {
    if (!source) return null;

    return (
        <div className="flex items-center gap-2 px-4 py-1.5 border-b border-outline-variant/10 bg-surface-container-low/40">
            <Loader2 size={11} className="animate-spin text-primary/70 shrink-0" />
            {/* `outline-variant` è blu pieno (#3b82f6): come colore di testo su fondo scuro
                non arriva a un contrasto leggibile a nessuna opacità utile — lezione della
                Fase 6. Qui e nelle voci si usa `on-surface-variant`, che è il token previsto. */}
            <span className="text-nano text-on-surface-variant/60 shrink-0">{t('journal.reading')}</span>
            <span className="text-xs text-on-surface-variant font-mono truncate">{source}</span>
        </div>
    );
}
