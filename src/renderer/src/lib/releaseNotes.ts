import type { Language } from '../locales/I18nContext';

/**
 * Punti salienti per versione, localizzati. Mostrati nella schermata "Novità"
 * al primo avvio dopo un aggiornamento automatico. Se una versione non è qui,
 * la schermata usa un testo di fallback generico.
 */
export const RELEASE_NOTES: Record<string, Record<Language, string[]>> = {
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
