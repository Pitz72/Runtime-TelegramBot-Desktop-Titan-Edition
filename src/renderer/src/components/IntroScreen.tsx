import React, { useState } from 'react';
import { motion, useReducedMotionConfig } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles, BookOpen, Download, Heart } from 'lucide-react';
import { useTranslation, Language } from '../locales/I18nContext';
import { FlagIT, FlagGB } from './ui/Flags';
import type { UpdateStatus } from '../hooks/useUpdater';
import { GuideModal } from './GuideModal';
import { Button } from './ui/Button';
import { TitanOrbit } from './brand/TitanOrbit';
import { RuntimeUtilitiesLogo } from './brand/RuntimeUtilitiesLogo';
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

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Cielo di fondo: poche stelle ferme, sempre nelle stesse posizioni (generatore con seme
 * fisso), più fitte in alto e sfumate verso il basso dove ci sono i controlli.
 */
const STARS = (() => {
    let seed = 20261019;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: 46 }, () => {
        const x = rnd() * 100;
        const y = Math.pow(rnd(), 1.4) * 100;
        const big = rnd() > 0.86;
        return { x, y, size: big ? 2 : 1, opacity: 0.18 + rnd() * (big ? 0.5 : 0.4), delay: 0.2 + rnd() * 1.6 };
    });
})();

/**
 * Schermata d'ingresso: chi è il programma, in che lingua parlarti, e la porta per entrare.
 *
 * L'entrata è una coreografia breve — orbita, titolo, controlli, firma — che si chiude
 * in meno di quattro secondi e poi resta ferma. Chi chiede meno movimento (al sistema o
 * nelle impostazioni di Titan) trova la schermata già composta.
 */
export function IntroScreen({ onComplete, updateStatus = 'idle', newVersion, currentVersion }: Props) {
    const { locale, setLocale, t } = useTranslation();
    const [showGuide, setShowGuide] = useState(false);
    const reduce = useReducedMotionConfig() ?? false;
    const updateAvailable = updateStatus === 'available' || updateStatus === 'downloading' || updateStatus === 'downloaded';

    /** Entrata dal basso con dissolvenza; niente del tutto se il movimento è ridotto. */
    const rise = (delay: number, distance = 10) => reduce ? {} : {
        initial: { opacity: 0, y: distance },
        animate: { opacity: 1, y: 0 },
        transition: { delay, duration: 0.7, ease: EASE_OUT },
    };

    const titleWords = t('app.title').split(' ');

    return (
        <main className="relative h-screen overflow-y-auto bg-canvas">
            {/* Fondo: un alone dall'alto e un cielo appena accennato. Fisso, non scorre col contenuto. */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0">
                <motion.div
                    className="absolute inset-0"
                    style={{ background: 'radial-gradient(70% 55% at 50% 0%, rgba(37, 99, 235, 0.24), rgba(37, 99, 235, 0.06) 55%, transparent 80%)' }}
                    {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1.6, ease: 'easeOut' } })}
                />
                <div
                    className="absolute inset-0"
                    style={{ maskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 75%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 75%)' }}
                >
                    {STARS.map((s, i) => (
                        <motion.span
                            key={i}
                            className="absolute rounded-full bg-fg-2"
                            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.opacity }}
                            {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: s.opacity }, transition: { delay: s.delay, duration: 1.2, ease: 'easeOut' } })}
                        />
                    ))}
                </div>
            </div>

            {/* min-h-full + margine automatico: centrato quando c'è spazio, scorrevole dall'inizio quando
                non c'è (con items-center su un contenitore che scorre, la parte alta restava irraggiungibile). */}
            <div className="relative flex min-h-full flex-col items-center px-6 py-8">
                <div className="my-auto w-full max-w-lg text-center">
                    <TitanOrbit />

                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">
                        <span className="sr-only">{`${t('app.title')} ${t('app.edition')}`}</span>
                        <span aria-hidden="true" className="block">
                            {titleWords.map((word, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && ' '}
                                    <span className="-mb-1 inline-block overflow-hidden pb-1 align-bottom">
                                        <motion.span
                                            className="inline-block"
                                            {...(reduce ? {} : {
                                                initial: { y: '105%' },
                                                animate: { y: 0 },
                                                transition: { delay: 0.55 + i * 0.1, duration: 0.8, ease: EASE_OUT },
                                            })}
                                        >
                                            {word}
                                        </motion.span>
                                    </span>
                                </React.Fragment>
                            ))}
                        </span>
                        <motion.span
                            aria-hidden="true"
                            className="mt-1 block text-accent"
                            {...(reduce ? {} : {
                                initial: { opacity: 0, letterSpacing: '0.42em', filter: 'blur(6px)' },
                                animate: { opacity: 1, letterSpacing: '-0.025em', filter: 'blur(0px)' },
                                transition: { delay: 0.85, duration: 1.4, ease: EASE_OUT },
                            })}
                        >
                            {t('app.edition')}
                        </motion.span>
                    </h1>

                    <motion.div
                        aria-hidden="true"
                        className="mx-auto mt-4 h-px w-44 bg-gradient-to-r from-transparent via-accent/70 to-transparent"
                        {...(reduce ? {} : { initial: { scaleX: 0, opacity: 0 }, animate: { scaleX: 1, opacity: 1 }, transition: { delay: 1.15, duration: 1.0, ease: EASE_OUT } })}
                    />

                    <motion.p className="mx-auto mt-4 max-w-md text-base text-fg-3" {...rise(1.25)}>{t('intro.tagline')}</motion.p>

                    <motion.p className="mt-3 flex h-6 items-center justify-center gap-1.5 text-sm" aria-live="polite" {...rise(1.35)}>
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
                    </motion.p>

                    <motion.fieldset className="mt-6 rounded-xl border border-line bg-surface-1 p-5 text-left shadow-raised" {...rise(1.45, 14)}>
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
                    </motion.fieldset>

                    <motion.div {...rise(1.6, 14)}>
                        <Button variant="primary" size="lg" iconRight={ArrowRight} className="mt-6 w-full" onClick={onComplete} data-autofocus>
                            {t('intro.enter')}
                        </Button>
                    </motion.div>

                    <motion.nav aria-label={t('intro.linksLabel')} className="mt-4 flex flex-wrap items-center justify-center gap-1" {...rise(1.75)}>
                        <Button variant="ghost" size="sm" icon={BookOpen} onClick={() => setShowGuide(true)}>{t('quickGuide.btn')}</Button>
                        <Button variant="ghost" size="sm" icon={Download} onClick={() => openManual(locale)}>{t('quickGuide.manualBtn')}</Button>
                        <Button variant="ghost" size="sm" icon={Heart} onClick={() => openLink(DONATE_URL)}>{t('support.donateBtn')}</Button>
                    </motion.nav>

                    {/* Firma: il marchio di chi pubblica il programma, poi le righe di credito */}
                    <motion.footer className="mt-7 flex flex-col items-center" {...rise(1.95, 6)}>
                        <div className="flex w-full items-center justify-center gap-4">
                            <span aria-hidden="true" className="h-px flex-1 max-w-[72px] bg-gradient-to-r from-transparent to-line-strong/60" />
                            <RuntimeUtilitiesLogo className="h-9 w-auto text-fg-2" animateDelay={2.15} />
                            <span aria-hidden="true" className="h-px flex-1 max-w-[72px] bg-gradient-to-l from-transparent to-line-strong/60" />
                        </div>
                        <p className="mt-3 text-xs text-fg-3">{t('app.copyright')}</p>
                        <p className="mt-1 text-xs text-fg-3">{t('credits.short')}</p>
                    </motion.footer>
                </div>
            </div>

            <GuideModal open={showGuide} onClose={() => setShowGuide(false)} />
        </main>
    );
}
