import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import en from './en.json';
import it from './it.json';

// Le lingue del progetto sono due: l'italiano è la sorgente, l'inglese la traduzione.
const translations = {
    en, it
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
        // Carica lingua salvata all'avvio.
        const saved = localStorage.getItem('titan-lang') as Language;
        if (!saved) return;
        if (Object.keys(translations).includes(saved)) {
            setLocaleState(saved);
        } else {
            // Lingua rimossa dalla 2.1.8 (fr, de, es, pt, ru, zh): chi la usava viene
            // portato in inglese, non in italiano, e la preferenza morta viene riscritta.
            setLocale('en');
        }
    }, []);

    const setLocale = (lang: Language) => {
        setLocaleState(lang);
        localStorage.setItem('titan-lang', lang);
    };

    // Risolve una chiave "a.b.c" dentro un oggetto traduzioni; undefined se manca un anello.
    const resolve = (dict: any, keys: string[]): unknown => {
        let current: any = dict;
        for (const key of keys) {
            if (current == null || current[key] === undefined) return undefined;
            current = current[key];
        }
        return current;
    };

    const t = (path: string): string => {
        const keys = path.split('.');

        // 1) lingua attiva → 2) fallback inglese (evita di mostrare chiavi grezze quando una
        // traduzione non è ancora stata portata in entrambe le lingue) → 3) la chiave stessa.
        const local = resolve(translations[locale], keys);
        if (typeof local === 'string') return local;

        const fallback = resolve(translations.en, keys);
        if (typeof fallback === 'string') return fallback;

        console.warn(`Translation missing for key: ${path} in lang: ${locale}`);
        return path;
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
