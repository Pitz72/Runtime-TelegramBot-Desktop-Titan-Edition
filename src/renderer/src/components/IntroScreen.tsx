import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation, Language } from '../locales/I18nContext';
import { FlagIT, FlagGB } from './ui/Flags';
import { ChevronRight, Loader2, Sparkles, BookOpen, Download, Heart } from 'lucide-react';
import logo from '../assets/logo.png';
import type { UpdateStatus } from '../hooks/useUpdater';
import { GuideModal } from './GuideModal';
import { openManual } from '../lib/docs';
import { DONATE_URL, openLink } from '../lib/links';

interface Props {
    onComplete: () => void;
    updateStatus?: UpdateStatus;
    newVersion?: string | null;
    currentVersion?: string;
}

export const flagsList: { id: Language; label: string; component: React.FC<{ className?: string }> }[] = [
    { id: 'en', label: 'English', component: FlagGB },
    { id: 'it', label: 'Italiano', component: FlagIT }
];

export function IntroScreen({ onComplete, updateStatus = 'idle', newVersion, currentVersion }: Props) {
    const { locale, setLocale, t } = useTranslation();
    const [showGuide, setShowGuide] = useState(false);

    const updateAvailable = updateStatus === 'available' || updateStatus === 'downloading' || updateStatus === 'downloaded';

    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 selection:bg-primary/30">
            {/* Ambient halo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none grid-dots">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] opacity-60" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] opacity-40" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-2xl w-full p-8 flex flex-col items-center"
            >
                <img src={logo} alt="Titan Logo" className="w-28 h-28 mb-6 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 24px rgba(173,198,255,0.25))' }} />

                {/* Le due parti del nome canonico stanno su due righe: «Titan Edition» non si spezza mai */}
                <h1 className="font-headline text-4xl font-black tracking-tight mb-2 text-on-surface text-center">
                    {t('app.title')}
                    <span className="block text-primary drop-glow-primary">Titan Edition</span>
                </h1>

                <p className="text-outline-variant/60 text-sm font-body mb-1">
                    {t('app.copyright') || '© 2026 Simone Pizzi per Runtime Radio'}
                </p>

                {/* Paternità del progetto — il testo esteso è in Impostazioni di Sistema → Crediti */}
                <p className="text-xs text-on-surface-variant/70 font-body mb-3 text-center max-w-md">
                    {t('credits.short')}
                </p>

                {/* Versione + stato controllo aggiornamenti */}
                <div className="h-6 mb-9 flex items-center justify-center">
                    {updateAvailable ? (
                        <span className="flex items-center gap-1.5 text-xs font-body text-primary drop-glow-primary">
                            <Sparkles size={13} />
                            {t('updater.newBadge').replace('{{version}}', newVersion || '')}
                        </span>
                    ) : updateStatus === 'checking' ? (
                        <span className="flex items-center gap-1.5 text-nano text-outline-variant/40">
                            <Loader2 size={11} className="animate-spin" />
                            {t('updater.checking')}
                        </span>
                    ) : (
                        currentVersion && (
                            <span className="text-nano text-outline-variant/35 font-mono">v{currentVersion}</span>
                        )
                    )}
                </div>

                {/* Language selector panel */}
                <div className="w-full glass-panel rounded-2xl p-6 mb-8">
                    <h3 className="text-center text-micro text-secondary mb-6 drop-glow-secondary">
                        {t('systemSettings.langSection.title') || 'Interface Language'}
                    </h3>

                    {/* Centrato sul numero reale di lingue: niente colonne fisse */}
                    <div className="flex flex-wrap justify-center gap-4">
                        {flagsList.map((lang) => {
                            const Flag = lang.component;
                            const isActive = locale === lang.id;

                            return (
                                <button
                                    key={lang.id}
                                    onClick={() => setLocale(lang.id)}
                                    className={`relative w-32 flex flex-col items-center p-3 rounded-xl border transition-all duration-300 ${
                                        isActive
                                            ? 'bg-primary/15 border-primary/40 text-on-surface'
                                            : 'bg-surface-container-lowest border-outline-variant/10 text-outline-variant/60 hover:bg-surface-container hover:text-on-surface-variant hover:border-outline-variant/25'
                                    }`}
                                >
                                    <div className="w-8 h-6 mb-2 rounded overflow-hidden shadow-sm shadow-black/50">
                                        <Flag className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-nano">{lang.label}</span>

                                    {isActive && (
                                        <motion.div
                                            layoutId="lang-active"
                                            className="absolute inset-0 border-2 border-primary/50 rounded-xl pointer-events-none"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onComplete}
                    className="ignition-btn flex items-center gap-2 text-on-primary-fixed px-10 py-3.5 rounded-full font-headline font-bold text-sm shadow-lg"
                >
                    {t('setup.btnLaunch') || 'Lancia Titan'}
                    <ChevronRight size={18}  />
                </motion.button>

                {/* Azioni documentazione: guida rapida + manuale PDF */}
                <div className="flex items-center gap-3 mt-6">
                    <button
                        onClick={() => setShowGuide(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full ghost-border text-outline-variant/70 hover:text-on-surface hover:border-primary/30 hover:bg-primary/5 transition-all text-xs font-body"
                    >
                        <BookOpen size={14} />
                        {t('quickGuide.btn')}
                    </button>
                    <button
                        onClick={() => openManual(locale)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full ghost-border text-outline-variant/70 hover:text-on-surface hover:border-secondary/30 hover:bg-secondary/5 transition-all text-xs font-body"
                    >
                        <Download size={14} />
                        {t('quickGuide.manualBtn')}
                    </button>
                    <button
                        onClick={() => openLink(DONATE_URL)}
                        title={t('support.donateTitle')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full ghost-border text-outline-variant/70 hover:text-tertiary hover:border-tertiary/40 hover:bg-tertiary/5 transition-all text-xs font-body"
                    >
                        <Heart size={14} />
                        {t('support.donateBtn')}
                    </button>
                </div>
            </motion.div>

            {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
        </div>
    );
}
