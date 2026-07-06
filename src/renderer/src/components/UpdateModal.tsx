import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, CheckCircle2, AlertTriangle, Rocket } from 'lucide-react';
import { useTranslation } from '../locales/I18nContext';
import type { Updater } from '../hooks/useUpdater';

/**
 * Schermata di aggiornamento — centrale e ben evidente (sostituisce il vecchio toast).
 * Compare sopra qualunque vista (intro o dashboard) quando c'è un aggiornamento da gestire
 * o come feedback di un controllo manuale.
 */
export function UpdateModal({ updater }: { updater: Updater }) {
    const { t } = useTranslation();
    const { status, currentVersion, newVersion, progress, errorMessage } = updater;

    const visible = status === 'available' || status === 'downloading'
        || status === 'downloaded' || status === 'uptodate' || status === 'error';

    const fmt = (key: string, version?: string | null) =>
        t(key).replace('{{version}}', version || '').replace('{{percent}}', String(progress));

    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    {/* Scrim */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/85 backdrop-blur-md"
                        onClick={() => { if (status !== 'downloading') updater.dismiss(); }}
                    />

                    <motion.div
                        initial={{ scale: 0.94, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.94, opacity: 0, y: 20, transition: { duration: 0.15 } }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="relative w-full max-w-lg glass-panel rounded-2xl overflow-hidden"
                        style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 24px rgba(173,198,255,0.12)' }}
                    >
                        {/* Ambient halo */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/10 blur-[80px]" />
                        </div>

                        <div className="relative z-10 p-8 flex flex-col items-center text-center">

                            {/* --- AVAILABLE --- */}
                            {status === 'available' && (
                                <>
                                    <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-5 drop-glow-primary">
                                        <Rocket size={34} />
                                    </div>
                                    <h2 className="font-headline text-2xl font-black tracking-tight text-on-surface mb-2">
                                        {t('updater.title')}
                                    </h2>
                                    <p className="text-sm text-on-surface-variant leading-relaxed mb-6 max-w-sm">
                                        {t('updater.availableMsg')}
                                    </p>
                                    <VersionRow t={t} current={currentVersion} next={newVersion} />
                                    <div className="flex items-center gap-3 mt-7 w-full justify-center">
                                        <button
                                            onClick={updater.dismiss}
                                            className="px-5 py-2.5 rounded-lg text-sm font-body text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/20 transition-all"
                                        >
                                            {t('updater.later')}
                                        </button>
                                        <button
                                            onClick={updater.download}
                                            className="flex items-center gap-2 px-7 py-2.5 rounded-lg text-sm font-headline font-bold ignition-btn text-on-primary-fixed shadow-lg transition-all active:scale-95"
                                        >
                                            <Download size={16} />
                                            {t('updater.download')}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* --- DOWNLOADING --- */}
                            {status === 'downloading' && (
                                <>
                                    <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-5">
                                        <Download size={34} className="animate-pulse" />
                                    </div>
                                    <h2 className="font-headline text-xl font-bold text-on-surface mb-5">
                                        {fmt('updater.progress')}
                                    </h2>
                                    <div className="w-full max-w-sm h-2.5 rounded-full bg-surface-container-highest overflow-hidden ghost-border">
                                        <div
                                            className="h-full bg-primary drop-glow-primary transition-[width] duration-300 ease-out"
                                            style={{ width: `${Math.max(4, progress)}%` }}
                                        />
                                    </div>
                                    <p className="text-nano text-outline-variant/40 mt-4">v{newVersion}</p>
                                </>
                            )}

                            {/* --- DOWNLOADED --- */}
                            {status === 'downloaded' && (
                                <>
                                    <div className="p-4 rounded-2xl bg-success/10 text-success mb-5">
                                        <CheckCircle2 size={34} />
                                    </div>
                                    <h2 className="font-headline text-2xl font-black tracking-tight text-on-surface mb-2">
                                        {t('updater.downloadedTitle')}
                                    </h2>
                                    <p className="text-sm text-on-surface-variant leading-relaxed mb-2 max-w-sm">
                                        {fmt('updater.downloadedMsg', newVersion)}
                                    </p>
                                    <div className="flex items-center gap-3 mt-6 w-full justify-center">
                                        <button
                                            onClick={updater.dismiss}
                                            className="px-5 py-2.5 rounded-lg text-sm font-body text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/20 transition-all"
                                        >
                                            {t('updater.later')}
                                        </button>
                                        <button
                                            onClick={updater.install}
                                            className="flex items-center gap-2 px-7 py-2.5 rounded-lg text-sm font-headline font-bold ignition-btn text-on-primary-fixed shadow-lg transition-all active:scale-95"
                                        >
                                            <RefreshCw size={16} />
                                            {t('updater.install')}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* --- UP TO DATE (controllo manuale) --- */}
                            {status === 'uptodate' && (
                                <>
                                    <div className="p-4 rounded-2xl bg-success/10 text-success mb-5">
                                        <CheckCircle2 size={34} />
                                    </div>
                                    <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
                                        {t('updater.upToDate')}
                                    </h2>
                                    <p className="text-sm text-outline-variant/50 mb-6">v{currentVersion}</p>
                                    <button
                                        onClick={updater.dismiss}
                                        className="px-7 py-2.5 rounded-lg text-sm font-headline font-bold ignition-btn text-on-primary-fixed shadow-lg transition-all active:scale-95"
                                    >
                                        OK
                                    </button>
                                </>
                            )}

                            {/* --- ERROR (controllo manuale) --- */}
                            {status === 'error' && (
                                <>
                                    <div className="p-4 rounded-2xl bg-error/10 text-error mb-5">
                                        <AlertTriangle size={34} />
                                    </div>
                                    <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
                                        {t('updater.errorMsg')}
                                    </h2>
                                    {errorMessage && (
                                        <p className="text-nano text-outline-variant/40 mb-6 max-w-sm break-words">{errorMessage}</p>
                                    )}
                                    <button
                                        onClick={updater.dismiss}
                                        className="px-7 py-2.5 rounded-lg text-sm font-headline font-bold ignition-btn text-on-primary-fixed shadow-lg transition-all active:scale-95 mt-2"
                                    >
                                        OK
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function VersionRow({ t, current, next }: { t: (k: string) => string; current: string; next: string | null }) {
    return (
        <div className="flex items-center justify-center gap-4 w-full">
            <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-surface-container-lowest ghost-border min-w-[120px]">
                <span className="text-nano text-outline-variant/40 mb-1">{t('updater.currentLabel')}</span>
                <span className="font-headline text-base font-bold text-on-surface-variant">v{current}</span>
            </div>
            <span className="text-outline-variant/30 text-lg">→</span>
            <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 min-w-[120px]">
                <span className="text-nano text-primary/50 mb-1">{t('updater.newLabel')}</span>
                <span className="font-headline text-base font-black text-primary drop-glow-primary">v{next}</span>
            </div>
        </div>
    );
}
