import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import logo from '../assets/logo.png';
import { useTranslation } from '../locales/I18nContext';
import { errorMessage } from '../lib/errors';
import { Button } from './ui/Button';
import { TextField } from './ui/Controls';
import { TokenVisibility, TOKEN_SHAPE } from './NewBotDialog';
import { BotCheck } from './BotCheck';

interface Props {
    onComplete: (name: string, token: string, channel: string, startDate: string) => Promise<void> | void;
}

const TOTAL = 4;

/**
 * Primo avvio: quattro domande, una per schermata. A ogni passo il focus va sul campo,
 * Invio prosegue, «Indietro» non perde nulla, e il passo corrente è detto anche a parole
 * («Passo 2 di 4»), non solo dalla barra di avanzamento.
 */
export function SetupWizard({ onComplete }: Props) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [botName, setBotName] = useState('');
    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(true);
    const [channel, setChannel] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setError('');
        requestAnimationFrame(() => inputRef.current?.focus());
    }, [step]);

    const value = step === 1 ? botName : step === 2 ? token : step === 3 ? channel : startDate;

    const next = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!value.trim()) {
            setError(t('botForm.required'));
            return;
        }
        if (step === 4 && isNaN(new Date(startDate).getTime())) {
            setError(t('setup.invalidDate'));
            return;
        }
        if (step < TOTAL) {
            setStep(s => s + 1);
            return;
        }
        setSaving(true);
        try {
            await onComplete(botName.trim(), token.trim(), channel.trim(), startDate);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const fields = {
        1: { label: t('setup.step1Label'), hint: t('setup.step1Desc'), placeholder: t('setup.step1Placeholder') },
        2: { label: t('setup.step2Label'), hint: token.trim() && !TOKEN_SHAPE.test(token.trim()) ? t('botForm.tokenShape') : t('setup.step2Desc'), placeholder: '123456789:ABC-DefGhiJklm…' },
        3: { label: t('setup.step3Label'), hint: t('setup.step3Desc'), placeholder: t('setup.step3Placeholder') },
        4: { label: t('setup.step4Label'), hint: t('setup.step4Desc'), placeholder: '' },
    }[step as 1 | 2 | 3 | 4];

    return (
        <main className="relative h-screen overflow-y-auto bg-canvas">
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0"
                style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(37, 99, 235, 0.18), transparent 70%)' }}
            />

            {/* Centrato quando c'è spazio, scorrevole dall'inizio quando non c'è (vedi IntroScreen) */}
            <div className="relative flex min-h-full flex-col items-center px-6 py-10">
            <div className="my-auto w-full max-w-md">
                <div className="mb-8 text-center">
                    <img src={logo} alt="" className="mx-auto mb-4 h-16 w-16" />
                    <h1 className="text-2xl font-semibold text-fg">{t('setup.title')}</h1>
                    <p className="mt-1 text-base text-fg-3">{t('setup.subtitle')}</p>
                </div>

                <form onSubmit={next} noValidate className="rounded-xl border border-line bg-surface-1 p-6 shadow-raised">
                    <div className="mb-5">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-fg-2" aria-live="polite">{t('setup.stepOf').replace('{n}', String(step)).replace('{total}', String(TOTAL))}</span>
                        </div>
                        <div
                            role="progressbar"
                            aria-valuemin={1}
                            aria-valuemax={TOTAL}
                            aria-valuenow={step}
                            aria-label={t('setup.progress')}
                            className="h-1.5 overflow-hidden rounded-full bg-surface-3"
                        >
                            <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(step / TOTAL) * 100}%` }} />
                        </div>
                    </div>

                    <TextField
                        key={step}
                        ref={inputRef}
                        label={fields.label}
                        hint={fields.hint}
                        placeholder={fields.placeholder}
                        type={step === 4 ? 'date' : step === 2 && !showToken ? 'password' : 'text'}
                        className={step >= 2 && step <= 3 ? 'font-mono text-sm' : undefined}
                        spellCheck={step === 1}
                        autoComplete="off"
                        value={value}
                        onChange={e => {
                            setError('');
                            const v = e.target.value;
                            if (step === 1) setBotName(v);
                            else if (step === 2) setToken(v);
                            else if (step === 3) setChannel(v);
                            else setStartDate(v);
                        }}
                        error={error}
                        required
                        trailing={step === 2 ? <TokenVisibility visible={showToken} onToggle={() => setShowToken(v => !v)} /> : undefined}
                    />

                    {/* Al passo del canale token e destinazione ci sono entrambi: si possono provare subito */}
                    {step === 3 && (
                        <div className="mt-4">
                            <BotCheck token={token} channelId={channel} headingLevel={2} />
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-between gap-3">
                        <Button variant="ghost" icon={ArrowLeft} disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>
                            {t('common.back')}
                        </Button>
                        <Button type="submit" variant="primary" iconRight={step < TOTAL ? ArrowRight : Check} loading={saving}>
                            {step < TOTAL ? t('common.next') : t('setup.finish')}
                        </Button>
                    </div>
                </form>

                <p className="mt-6 text-center text-xs text-fg-3">{t('app.copyright')}</p>
            </div>
            </div>
        </main>
    );
}
