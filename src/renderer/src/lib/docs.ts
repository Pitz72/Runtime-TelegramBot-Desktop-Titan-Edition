import type { Language } from '../locales/I18nContext';

// Guide rapide in-app (markdown grezzo importato via Vite `?raw`).
import guideEn from '../assets/guides/guide-en.md?raw';
import guideIt from '../assets/guides/guide-it.md?raw';

export const GUIDES: Record<Language, string> = {
    en: guideEn,
    it: guideIt,
};

// I manuali PDF completi sono versionati nella repo pubblica, accanto ai loro
// sorgenti Typst. URL raw sul branch main → si aprono nel browser di sistema.
const MANUAL_BASE =
    'https://github.com/Pitz72/Runtime-TelegramBot-Desktop-Titan-Edition/raw/main/Manuale%20Utente%20Avanzato/typst/';

const MANUAL_FILES: Record<Language, string> = {
    it: 'Manuale-Utente-Avanzato-Titan-IT.pdf',
    en: 'Titan-Advanced-User-Manual-EN.pdf',
};

/** URL del manuale PDF completo nella lingua indicata. */
export function manualUrlFor(locale: Language): string {
    return MANUAL_BASE + encodeURIComponent(MANUAL_FILES[locale] || MANUAL_FILES.en);
}

/** Apre il manuale PDF nel browser di sistema. */
export function openManual(locale: Language): void {
    window.api.openExternal(manualUrlFor(locale));
}
