import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { useTranslation } from '../locales/I18nContext';
import { notesFor } from '../lib/releaseNotes';
import logo from '../assets/logo.png';

interface Props {
    version: string;
    onClose: () => void;
}

/**
 * Schermata grande delle novità, mostrata al primo avvio dopo un aggiornamento
 * automatico. Elenca i punti salienti della versione nella lingua corrente.
 */
export function WhatsNewModal({ version, onClose }: Props) {
    const { locale, t } = useTranslation();
    const highlights = notesFor(version, locale);

    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[70] p-4 selection:bg-primary/30">
            {/* Alone ambientale */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none grid-dots">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[130px] opacity-60" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] bg-secondary/6 rounded-full blur-[90px] opacity-40" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-xl glass-panel rounded-3xl p-10 flex flex-col items-center text-center"
            >
                <div className="relative mb-6">
                    <img src={logo} alt="Titan" className="w-24 h-24 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 24px rgba(173,198,255,0.3))' }} />
                    <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-9 h-9 rounded-full bg-primary-container text-on-primary-fixed shadow-lg">
                        <Sparkles size={17} />
                    </span>
                </div>

                <span className="text-micro text-secondary drop-glow-secondary mb-2 tracking-widest uppercase">
                    {t('whatsNew.badge')}
                </span>
                <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface mb-2">
                    {t('whatsNew.title')}
                </h1>
                <p className="text-sm text-on-surface-variant mb-8">
                    {t('whatsNew.subtitle').replace('{{version}}', version)}
                </p>

                {/* Elenco novità */}
                <div className="w-full space-y-3 mb-9 text-left">
                    {highlights ? (
                        highlights.map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
                                className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-lowest/60 ghost-border"
                            >
                                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary mt-0.5">
                                    <Check size={14} />
                                </span>
                                <span className="text-sm text-on-surface-variant leading-relaxed">{h}</span>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-sm text-on-surface-variant text-center py-4">{t('whatsNew.fallback')}</p>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onClose}
                    className="ignition-btn flex items-center gap-2 text-on-primary-fixed px-10 py-3.5 rounded-full font-headline font-bold text-sm shadow-lg"
                >
                    {t('whatsNew.cta')}
                    <ChevronRight size={18} />
                </motion.button>
            </motion.div>
        </div>
    );
}
