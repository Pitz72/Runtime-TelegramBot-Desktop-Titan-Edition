import type { Language } from '../locales/I18nContext';

/**
 * Punti salienti per versione, localizzati. Mostrati nella schermata "Novità"
 * al primo avvio dopo un aggiornamento automatico. Se una versione non è qui,
 * la schermata usa un testo di fallback generico.
 */
export const RELEASE_NOTES: Record<string, Record<Language, string[]>> = {
    '2.1.9': {
        it: [
            'La schermata iniziale porta «Titan Edition» su una riga sua, senza spezzarlo.',
            'Il credito agli LLM e a chi ha diretto il progetto ora si legge davvero.',
            'Le bandiere delle lingue sono centrate, non più allineate a sinistra.',
            'Le Impostazioni di Sistema non escono più dallo schermo: scheda «Generale» su due colonne.',
            'Le tre schede delle impostazioni hanno tutte la stessa misura.',
        ],
        en: [
            'The intro screen keeps “Titan Edition” whole on a line of its own.',
            'The credit to the LLMs and to whoever directed the project is now actually readable.',
            'The language flags are centred instead of hugging the left edge.',
            'System Settings no longer runs off the screen: the General tab is on two columns.',
            'All three settings tabs are now the same size.',
        ],
    },
    '2.1.8': {
        it: [
            'Titan è software libero: codice sorgente pubblico, licenza MIT.',
            'I token dei bot non compaiono più nei log, nemmeno in quelli esportati.',
            'Avviare l’applicazione due volte non pubblica più i contenuti in doppio.',
            'Il campo della data si chiama «Data di Partenza» anche nelle impostazioni del bot.',
            'Interfaccia, guide e manuale in italiano e inglese.',
        ],
        en: [
            'Titan is free software: public source code under the MIT licence.',
            'Bot tokens no longer appear in the logs, not even in exported ones.',
            'Starting the app twice no longer publishes everything twice.',
            'The date field is called “Start From Date” in the bot settings too.',
            'Interface, guides and manual in Italian and English.',
        ],
    },
    '2.1.7': {
        it: [
            'Nome del prodotto uniforme in tutta l’applicazione.',
            'Icona dell’app corretta nella barra applicazioni di Windows.',
            'Schermata delle novità affidabile a ogni aggiornamento.',
            'Guida rapida e manuale PDF completo sempre a portata di mano.',
        ],
        en: [
            'Consistent product name across the whole app.',
            'Fixed the app icon in the Windows taskbar.',
            'Reliable what’s-new screen after every update.',
            'Quick guide and full PDF manual always at hand.',
        ],
    },
    '2.1.6': {
        it: [
            'Guida rapida integrata, consultabile in ogni lingua direttamente dall’app.',
            'Manuale d’uso completo scaricabile in PDF con un clic.',
            'Nuova schermata delle novità a ogni aggiornamento.',
            'Nuovo logo e branding Titan in tutta l’interfaccia.',
        ],
        en: [
            'Built-in quick guide, available in every language right inside the app.',
            'Full user manual downloadable as a PDF in one click.',
            'New what’s-new screen shown after every update.',
            'Fresh Titan logo and branding across the whole interface.',
        ],
    },
};

/** Punti salienti per la versione indicata, o null se non presenti. */
export function notesFor(version: string, locale: Language): string[] | null {
    const entry = RELEASE_NOTES[version];
    if (!entry) return null;
    return entry[locale] || entry.en || null;
}
