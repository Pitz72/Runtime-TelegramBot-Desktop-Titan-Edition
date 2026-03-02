import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import en from './en.json';
import it from './it.json';
import fr from './fr.json';
import de from './de.json';
import es from './es.json';
import pt from './pt.json';
import ru from './ru.json';
import zh from './zh.json';

const translations = {
    en, it, fr, de, es, pt, ru, zh
};

export type Language = keyof typeof translations;

interface I18nContextType {
    locale: Language;
    setLocale: (lang: Language) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocaleState] = useState<Language>('it');

    useEffect(() => {
        // Carica lingua salvata all'avvio
        const saved = localStorage.getItem('titan-lang') as Language;
        if (saved && Object.keys(translations).includes(saved)) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (lang: Language) => {
        setLocaleState(lang);
        localStorage.setItem('titan-lang', lang);
    };

    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = translations[locale];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path} in lang: ${locale}`);
                return path;
            }
            current = current[key];
        }

        return typeof current === 'string' ? current : path;
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
};
