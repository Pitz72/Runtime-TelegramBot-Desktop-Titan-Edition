import React from 'react';
import { Download, RefreshCw, CheckCircle2, AlertTriangle, Rocket, ArrowRight } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { useTranslation } from '../locales/I18nContext';
import type { Updater } from '../hooks/useUpdater';

/**
 * Schermata di aggiornamento, sopra qualunque vista. Compare quando c'è un aggiornamento
 * da gestire o come esito di un controllo manuale. Durante il download non si chiude.
 */
export function UpdateModal({ updater }: { updater: Updater }) {
    const { t } = useTranslation();
    const { status, currentVersion, newVersion, progress, errorMessage } = updater;

    const visible = status === 'available' || status === 'downloading'
        || status === 'downloaded' || status === 'uptodate' || status === 'error';

    const fmt = (key: string, version?: string | null) =>
        t(key).replace('{{version}}', version || '').replace('{{percent}}', String(progress));

    const config = {
        available: { icon: Rocket, tone: 'accent' as const, title: t('updater.title') },
        downloading: { icon: Download, tone: 'accent' as const, title: t('updater.downloadingTitle') },
        downloaded: { icon: CheckCircle2, tone: 'success' as const, title: t('updater.downloadedTitle') },
        uptodate: { icon: CheckCircle2, tone: 'success' as const, title: t('updater.upToDate') },
        error: { icon: AlertTriangle, tone: 'danger' as const, title: t('updater.errorMsg') },
    }[visible ? status as 'available' : 'available'];

    const footer = status === 'available' ? (
        <>
            <Button variant="ghost" onClick={updater.dismiss}>{t('updater.later')}</Button>
            <Button variant="primary" icon={Download} onClick={updater.download} data-autofocus>{t('updater.download')}</Button>
        </>
    ) : status === 'downloaded' ? (
        <>
            <Button variant="ghost" onClick={updater.dismiss}>{t('updater.later')}</Button>
            <Button variant="primary" icon={RefreshCw} onClick={updater.install} data-autofocus>{t('updater.install')}</Button>
        </>
    ) : status === 'downloading' ? null : (
        <Button variant="primary" onClick={updater.dismiss} data-autofocus>{t('common.ok')}</Button>
    );

    return (
        <Dialog
            open={visible}
            onClose={updater.dismiss}
            dismissible={status !== 'downloading'}
            icon={config.icon}
            tone={config.tone}
            title={config.title}
            size="sm"
            footer={footer}
        >
            {status === 'available' && (
                <>
                    <p className="text-base text-fg-2">{t('updater.availableMsg')}</p>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 rounded-md border border-line bg-surface-2 px-3 py-2">
                            <p className="text-xs text-fg-3">{t('updater.currentLabel')}</p>
                            <p className="font-mono text-base text-fg-2">v{currentVersion}</p>
                        </div>
                        <ArrowRight size={16} className="text-fg-3" aria-hidden="true" />
                        <div className="flex-1 rounded-md border border-accent bg-surface-4 px-3 py-2">
                            <p className="text-xs text-fg-3">{t('updater.newLabel')}</p>
                            <p className="font-mono text-base font-semibold text-accent-strong">v{newVersion}</p>
                        </div>
                    </div>
                </>
            )}

            {status === 'downloading' && (
                <>
                    <p className="text-base text-fg-2" aria-live="polite">{fmt('updater.progress')}</p>
                    <div
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress}
                        aria-label={t('updater.downloadingTitle')}
                        className="mt-4 h-2.5 overflow-hidden rounded-full border border-line bg-surface-3"
                    >
                        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${Math.max(3, progress)}%` }} />
                    </div>
                    <p className="mt-2 font-mono text-sm text-fg-3">v{newVersion}</p>
                </>
            )}

            {status === 'downloaded' && <p className="text-base text-fg-2">{fmt('updater.downloadedMsg', newVersion)}</p>}
            {status === 'uptodate' && <p className="font-mono text-base text-fg-2">v{currentVersion}</p>}
            {status === 'error' && errorMessage && <p className="break-words text-sm text-fg-3">{errorMessage}</p>}
        </Dialog>
    );
}
