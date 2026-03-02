import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation, Language } from '../locales/I18nContext';
import { FlagIT, FlagFR, FlagDE, FlagES, FlagPT, FlagRU, FlagCN, FlagGB } from './ui/Flags';
import { ChevronRight } from 'lucide-react';
import logo from '../assets/logo.png';

interface Props {
    onComplete: () => void;
}

export const flagsList: { id: Language; label: string; component: React.FC<{ className?: string }> }[] = [
    { id: 'en', label: 'English', component: FlagGB },
    { id: 'it', label: 'Italiano', component: FlagIT },
    { id: 'fr', label: 'Français', component: FlagFR },
    { id: 'de', label: 'Deutsch', component: FlagDE },
    { id: 'es', label: 'Español', component: FlagES },
    { id: 'pt', label: 'Português', component: FlagPT },
    { id: 'ru', label: 'Русский', component: FlagRU },
    { id: 'zh', label: '中文', component: FlagCN }
];

export function IntroScreen({ onComplete }: Props) {
    const { locale, setLocale, t } = useTranslation();

    return (
        <div className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center z-50 text-white selection:bg-titan-500/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-titan-500/10 rounded-full blur-[100px] opacity-50"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-2xl w-full p-8 flex flex-col items-center"
            >
                <img src={logo} alt="Titan Logo" className="w-28 h-28 mb-6 drop-shadow-2xl" />

                <h1 className="text-4xl font-black tracking-tight mb-2">
                    {t('app.title')} <span className="text-titan-400">Titan Edition</span>
                </h1>

                <p className="text-neutral-400 text-lg mb-12">
                    {t('app.copyright') || "© 2026 Simone Pizzi per Runtime Radio"}
                </p>

                <div className="w-full bg-dark-800/50 backdrop-blur-md rounded-2xl p-6 border border-titan-500/10 mb-8 shadow-2xl">
                    <h3 className="text-center text-sm font-bold tracking-widest text-titan-400 uppercase mb-6">
                        {t('systemSettings.langSection.title') || "Interface Language"}
                    </h3>

                    <div className="grid grid-cols-4 gap-4">
                        {flagsList.map((lang) => {
                            const Flag = lang.component;
                            const isActive = locale === lang.id;

                            return (
                                <button
                                    key={lang.id}
                                    onClick={() => setLocale(lang.id)}
                                    className={`relative flex flex-col items-center p-3 rounded-xl border transition-all duration-300 ${isActive
                                        ? 'bg-titan-500/20 border-titan-500 text-white'
                                        : 'bg-dark-900 border-transparent text-neutral-400 hover:bg-dark-700 hover:text-white'
                                        }`}
                                >
                                    <div className="w-8 h-6 mb-2 rounded overflow-hidden shadow-sm shadow-black/50">
                                        <Flag className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-xs font-medium">{lang.label}</span>

                                    {isActive && (
                                        <motion.div
                                            layoutId="lang-active"
                                            className="absolute inset-0 border-2 border-titan-500 rounded-xl pointer-events-none"
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
                    className="flex items-center gap-2 bg-titan-500 hover:bg-titan-400 text-dark-950 px-8 py-3 rounded-full font-bold transition-colors"
                >
                    {t('setup.btnLaunch') || "Lancia Titan"}
                    <ChevronRight size={20} />
                </motion.button>
            </motion.div>
        </div>
    );
}
