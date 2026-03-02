
import React, { useState, useEffect } from 'react';
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

    return (
        <div className="h-screen flex items-center justify-center bg-dark-950 text-white p-8 font-titan overflow-hidden relative">
            {/* Background */}
            <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-titan-500/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute inset-0 grid-dots pointer-events-none opacity-30"></div>

            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700 relative z-10">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
                        {t('app.title')} <span className="text-titan-400">{t('app.edition')}</span>
                    </h1>
                    <p className="text-neutral-500 text-sm font-light">{t('setup.subtitle')}</p>
                    <div className="flex flex-col items-center justify-center gap-1 opacity-40">
                        <p className="text-[10px] text-neutral-600 font-medium">{t('app.copyright')}</p>
                    </div>
                </div>

                <div className="bg-dark-900/80 backdrop-blur-xl border border-titan-500/10 p-8 rounded-2xl shadow-2xl shadow-titan-500/5 relative overflow-hidden">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 h-1 bg-dark-950 w-full">
                        <div className="h-full bg-gradient-to-r from-titan-500 to-titan-400 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-5 mt-4">
                            <label className="block text-[10px] font-bold text-titan-500/50 uppercase tracking-[0.15em]">{t('setup.step1Label')}</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={botName}
                                    onChange={(e) => setBotName(e.target.value)}
                                    placeholder={t('setup.step1Placeholder') as string}
                                    className="w-full bg-dark-950 border border-titan-500/10 rounded-lg p-3.5 text-white focus:outline-none focus:border-titan-500/30 transition-all text-sm placeholder:text-neutral-700"
                                />
                            </div>
                            <p className="text-[10px] text-neutral-600">{t('setup.step1Desc')}</p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5 mt-4">
                            <label className="block text-[10px] font-bold text-titan-500/50 uppercase tracking-[0.15em]">{t('setup.step2Label')}</label>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="123456:ABC-DefGhiJklm..."
                                className="w-full bg-dark-950 border border-titan-500/10 rounded-lg p-3.5 text-white focus:outline-none focus:border-titan-500/30 transition-all font-mono text-sm placeholder:text-neutral-700"
                            />
                            <p className="text-[10px] text-neutral-600">
                                {t('setup.step2Desc')}
                            </p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5 mt-4">
                            <label className="block text-[10px] font-bold text-titan-500/50 uppercase tracking-[0.15em]">{t('setup.step3Label')}</label>
                            <input
                                type="text"
                                value={channel}
                                onChange={(e) => setChannel(e.target.value)}
                                placeholder={t('setup.step3Placeholder') as string}
                                className="w-full bg-dark-950 border border-titan-500/10 rounded-lg p-3.5 text-white focus:outline-none focus:border-titan-500/30 transition-all font-mono text-sm placeholder:text-neutral-700"
                            />
                            <p className="text-[10px] text-neutral-600">{t('setup.step3Desc')}</p>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-5 mt-4">
                            <label className="block text-[10px] font-bold text-titan-500/50 uppercase tracking-[0.15em]">{t('setup.step4Label')}</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-dark-950 border border-titan-500/10 rounded-lg p-3.5 text-white focus:outline-none focus:border-titan-500/30 transition-all font-mono text-sm [color-scheme:dark]"
                            />
                            <p className="text-[10px] text-neutral-600">{t('setup.step4Desc')}</p>
                            {dateError && <p className="text-xs text-red-400">{dateError}</p>}
                        </div>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={step === 1 ? !botName : step === 2 ? !token : step === 3 ? !channel : !startDate}
                        className="mt-10 w-full bg-gradient-to-r from-titan-600 to-titan-500 hover:from-titan-500 hover:to-titan-400 disabled:from-neutral-900 disabled:to-neutral-900 disabled:text-neutral-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-titan-500/20 transform active:scale-[0.98]"
                    >
                        {step < totalSteps ? t('setup.btnNext') : t('setup.btnLaunch')}
                        {step < totalSteps ? <ArrowRight size={20} /> : <Check size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
