import React from 'react';
import { Play, Square, Settings, BookOpen, RefreshCw } from 'lucide-react';
import logo from '../assets/logo.png';
import { Button, IconButton } from './ui/Button';
import { StatusDot } from './ui/Controls';
import { useTranslation } from '../locales/I18nContext';

interface Props {
    running: boolean;
    busy: boolean;
    /** Ora del prossimo giro, se il motore l'ha annunciata */
    nextScanAt: Date | null;
    /** Sorgente in lettura in questo momento */
    activity: string | null;
    canStart: boolean;
    onToggle: () => void;
    /** «Controlla adesso»: un giro subito, senza aspettare l'intervallo */
    onScanNow: () => void;
    onOpenSettings: () => void;
    onOpenGuide: () => void;
}

/**
 * Barra superiore: marchio, stato del motore e il suo comando.
 *
 * Il motore è uno solo per tutti i bot. Fino alla 2.3 il pulsante di avvio stava nella
 * colonna del bot selezionato, tra le statistiche di quel bot, e sembrava accenderne uno
 * solo; qui sta dove sta lo stato globale, e dice a parole cosa fa.
 */
export function TopBar({ running, busy, nextScanAt, activity, canStart, onToggle, onScanNow, onOpenSettings, onOpenGuide }: Props) {
    const { t, locale } = useTranslation();

    const detail = running
        ? activity
            ? t('engine.reading').replace('{source}', activity)
            : nextScanAt
                ? t('engine.nextScanAt').replace('{time}', nextScanAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }))
                : t('engine.working')
        : t('engine.stoppedHint');

    return (
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-surface-1 px-4">
            <div className="flex min-w-0 items-center gap-3">
                <img src={logo} alt="" className="h-8 w-8 shrink-0" />
                <div className="min-w-0 leading-tight">
                    <p className="truncate text-base font-semibold text-fg">{t('app.title')}</p>
                    <p className="truncate text-xs text-fg-3">{t('app.edition')}</p>
                </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
                <div className="flex min-w-0 items-center gap-2.5 rounded-full border border-line bg-surface-2 py-1 pl-3 pr-4">
                    <StatusDot tone={running ? 'success' : 'neutral'} pulse={running} />
                    {/* Solo lo stato è una regione live: annunciato quando il motore si accende
                        o si spegne, non a ogni sorgente letta (sarebbe un rumore continuo). */}
                    <span role="status" className="whitespace-nowrap text-sm font-semibold text-fg">{running ? t('engine.running') : t('engine.stopped')}</span>
                    <span className="hidden max-w-[280px] truncate text-sm text-fg-3 lg:inline" title={detail}>{detail}</span>
                </div>

                {running && (
                    <Button
                        variant="ghost"
                        icon={RefreshCw}
                        disabled={busy || !!activity}
                        onClick={onScanNow}
                        title={activity ? t('engine.scanBusy') : t('engine.scanNowHint')}
                        aria-label={t('engine.scanNow')}
                    >
                        {/* Sotto i 1024 px resta l'icona: il nome per i lettori di schermo è nell'aria-label */}
                        <span className="hidden lg:inline">{t('engine.scanNow')}</span>
                    </Button>
                )}

                <Button
                    variant={running ? 'secondary' : 'primary'}
                    icon={running ? Square : Play}
                    loading={busy}
                    disabled={!running && !canStart}
                    onClick={onToggle}
                    title={!running && !canStart ? t('engine.noBotsHint') : undefined}
                >
                    {running ? t('engine.stop') : t('engine.start')}
                </Button>

                <div className="h-6 w-px bg-line" aria-hidden="true" />

                <IconButton icon={BookOpen} label={t('quickGuide.btn')} onClick={onOpenGuide} />
                <IconButton icon={Settings} label={t('system.title')} onClick={onOpenSettings} />
            </div>
        </header>
    );
}
