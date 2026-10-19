import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles, BookOpen, Download, Heart } from 'lucide-react';
import { useTranslation, Language } from '../locales/I18nContext';
import { FlagIT, FlagGB } from './ui/Flags';
import logo from '../assets/logo.png';
import type { UpdateStatus } from '../hooks/useUpdater';
import { GuideModal } from './GuideModal';
import { Button } from './ui/Button';
import { openManual } from '../lib/docs';
import { DONATE_URL, openLink } from '../lib/links';
import { cn } from '@/lib/utils';

interface Props {
    onComplete: () => void;
    updateStatus?: UpdateStatus;
    newVersion?: string | null;
    currentVersion?: string;
}

export const flagsList: { id: Language; label: string; component: React.FC<{ className?: string }> }[] = [
    { id: 'it', label: 'Italiano', component: FlagIT },
    { id: 'en', label: 'English', component: FlagGB },
];

/** Schermata d'ingresso: chi è il programma, in che lingua parlarti, e la porta per entrare. */
export function IntroScreen({ onComplete, updateStatus = 'idle', newVersion, currentVersion }: Props) {
    const { locale, setLocale, t } = useTranslation();
    const [showGuide, setShowGuide] = useState(false);
    const updateAvailable = updateStatus === 'available' || updateStatus === 'downloading' || updateStatus === 'downloaded';

    return (
        <main className="relative flex h-screen items-center justify-center overflow-y-auto bg-canvas px-6 py-10">
            {/* Un solo alone, dall'alto: profondità senza rumore */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(37, 99, 235, 0.22), transparent 70%)' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative w-full max-w-lg text-center"
            >
                <img src={logo} alt="" className="mx-auto mb-6 h-24 w-24" />

                <h1 className="text-3xl font-semibold tracking-tight text-fg">
                    {t('app.title')}
                    <span className="mt-1 block text-accent">{t('app.edition')}</span>
                </h1>
                <p className="mx-auto mt-3 max-w-md text-base text-fg-3">{t('intro.tagline')}</p>

                <p className="mt-3 flex h-6 items-center justify-center gap-1.5 text-sm" aria-live="polite">
                    {updateAvailable ? (
                        <span className="inline-flex items-center gap-1.5 text-accent">
                            <Sparkles size={14} aria-hidden="true" />
                            {t('updater.newBadge').replace('{{version}}', newVersion || '')}
                        </span>
                    ) : updateStatus === 'checking' ? (
                        <span className="inline-flex items-center gap-1.5 text-fg-3">
                            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                            {t('updater.checking')}
                        </span>
                    ) : currentVersion ? (
                        <span className="font-mono text-fg-3">v{currentVersion}</span>
                    ) : null}
                </p>

                <fieldset className="mt-8 rounded-xl border border-line bg-surface-1 p-5 text-left shadow-raised">
                    <legend className="sr-only">{t('system.language.title')}</legend>
                    <p className="mb-3 text-sm font-medium text-fg-2" aria-hidden="true">{t('system.language.title')}</p>
                    <div className="grid grid-cols-2 gap-3">
                        {flagsList.map(lang => {
                            const Flag = lang.component;
                            const checked = locale === lang.id;
                            return (
                                <label
                                    key={lang.id}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                                        'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                                        checked ? 'border-accent bg-surface-4' : 'border-line bg-surface-2 hover:border-line-strong',
                                    )}
                                >
                                    <input type="radio" name="intro-language" value={lang.id} checked={checked} onChange={() => setLocale(lang.id)} className="sr-only" />
                                    <span className="h-5 w-7 shrink-0 overflow-hidden rounded-sm" aria-hidden="true"><Flag className="h-full w-full" /></span>
                                    <span className={cn('text-base font-medium', checked ? 'text-fg' : 'text-fg-2')} lang={lang.id}>{lang.label}</span>
                                    <span
                                        aria-hidden="true"
                                        className={cn('ml-auto flex h-4 w-4 items-center justify-center rounded-full border-2', checked ? 'border-accent' : 'border-line-strong')}
                                    >
                                        {checked && <span className="h-2 w-2 rounded-full bg-accent" />}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </fieldset>

                <Button variant="primary" size="lg" iconRight={ArrowRight} className="mt-6 w-full" onClick={onComplete} data-autofocus>
                    {t('intro.enter')}
                </Button>

                <nav aria-label={t('intro.linksLabel')} className="mt-5 flex flex-wrap items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" icon={BookOpen} onClick={() => setShowGuide(true)}>{t('quickGuide.btn')}</Button>
                    <Button variant="ghost" size="sm" icon={Download} onClick={() => openManual(locale)}>{t('quickGuide.manualBtn')}</Button>
                    <Button variant="ghost" size="sm" icon={Heart} onClick={() => openLink(DONATE_URL)}>{t('support.donateBtn')}</Button>
                </nav>

                <p className="mt-6 text-sm text-fg-3">{t('credits.short')}</p>
                <p className="mt-1 text-xs text-fg-3">{t('app.copyright')}</p>
            </motion.div>

            <GuideModal open={showGuide} onClose={() => setShowGuide(false)} />
        </main>
    );
}
