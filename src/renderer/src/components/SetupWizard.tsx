
import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import logo from '../assets/logo.png';
import { useTranslation } from '../locales/I18nContext';

interface Props {
    onComplete: (name: string, token: string, channel: string, startDate: string) => void;
    onSkip: () => void;
}

export function SetupWizard({ onComplete, onSkip }: Props) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [botName, setBotName] = useState('');
    const [token, setToken] = useState('');
    const [channel, setChannel] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [dateError, setDateError] = useState('');

    const handleNext = () => {
        if (step === 1 && botName) setStep(2);
        else if (step === 2 && token) setStep(3);
        else if (step === 3 && channel) setStep(4);
        else if (step === 4 && startDate) {
            const date = new Date(startDate);
            if (isNaN(date.getTime())) {
                setDateError(t('setup.invalidDate') as string);
                return;
            }
            onComplete(botName, token, channel, startDate);
        }
    };

    const totalSteps = 4;

    const inputCls = "w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg p-3.5 text-on-surface focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all text-sm font-body placeholder:text-outline-variant/30";

    return (
        <div className="h-screen flex items-center justify-center bg-background text-on-surface p-8 font-body overflow-hidden relative">
            {/* Background */}
            <div className="absolute inset-0 grid-dots pointer-events-none opacity-40" />
            <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-primary/6 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-secondary/4 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700 relative z-10">
                {/* Header */}
                <div className="text-center space-y-2">
                    <img src={logo} alt="Titan Logo" className="w-16 h-16 mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 16px rgba(173,198,255,0.2))' }} />
                    <h1 className="font-headline text-3xl font-black text-on-surface tracking-tighter uppercase">
                        {t('app.title')} <span className="text-primary drop-glow-primary">{t('app.edition')}</span>
                    </h1>
                    <p className="text-outline-variant/50 text-sm">{t('setup.subtitle')}</p>
                    <p className="text-nano text-outline-variant/25">{t('app.copyright')}</p>
                </div>

                {/* Wizard panel */}
                <div className="glass-panel rounded-2xl overflow-hidden relative">
                    {/* Progress stripe */}
                    <div className="h-0.5 bg-surface-container-lowest w-full">
                        <div
                            className="h-full transition-all duration-500"
                            style={{
                                width: `${(step / totalSteps) * 100}%`,
                                background: 'linear-gradient(90deg, #4d8eff, #03b5d3)',
                                boxShadow: '0 0 8px rgba(77,142,255,0.5)'
                            }}
                        />
                    </div>

                    <div className="p-8">
                        {/* Step counter */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-nano text-outline-variant/40">SETUP_WIZARD</span>
                            <span className="text-nano text-primary/60">{step}/{totalSteps}</span>
                        </div>

                        {step === 1 && (
                            <div className="space-y-4">
                                <label className="block text-micro text-primary/60">{t('setup.step1Label')}</label>
                                <input
                                    type="text"
                                    value={botName}
                                    onChange={(e) => setBotName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && botName && handleNext()}
                                    placeholder={t('setup.step1Placeholder') as string}
                                    className={inputCls}
                                    autoFocus
                                />
                                <p className="text-nano text-outline-variant/40">{t('setup.step1Desc')}</p>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <label className="block text-micro text-primary/60">{t('setup.step2Label')}</label>
                                <input
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && token && handleNext()}
                                    placeholder="123456:ABC-DefGhiJklm..."
                                    className={`${inputCls} font-mono`}
                                    autoFocus
                                />
                                <p className="text-nano text-outline-variant/40">{t('setup.step2Desc')}</p>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <label className="block text-micro text-primary/60">{t('setup.step3Label')}</label>
                                <input
                                    type="text"
                                    value={channel}
                                    onChange={(e) => setChannel(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && channel && handleNext()}
                                    placeholder={t('setup.step3Placeholder') as string}
                                    className={`${inputCls} font-mono`}
                                    autoFocus
                                />
                                <p className="text-nano text-outline-variant/40">{t('setup.step3Desc')}</p>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4">
                                <label className="block text-micro text-primary/60">{t('setup.step4Label')}</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setDateError(''); }}
                                    className={`${inputCls} font-mono [color-scheme:dark]`}
                                    autoFocus
                                />
                                <p className="text-nano text-outline-variant/40">{t('setup.step4Desc')}</p>
                                {dateError && <p className="text-nano text-error">{dateError}</p>}
                            </div>
                        )}

                        <button
                            onClick={handleNext}
                            disabled={step === 1 ? !botName : step === 2 ? !token : step === 3 ? !channel : !startDate}
                            className="mt-8 w-full ignition-btn disabled:opacity-30 disabled:cursor-not-allowed text-on-primary-fixed font-headline font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            {step < totalSteps ? t('setup.btnNext') : t('setup.btnLaunch')}
                            {step < totalSteps
                                ? <ArrowRight size={18}  />
                                : <Check size={18}  />
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
