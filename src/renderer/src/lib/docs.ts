import type { Language } from '../locales/I18nContext';

// Guide rapide in-app (markdown grezzo importato via Vite `?raw`).
import guideEn from '../assets/guides/guide-en.md?raw';
import guideIt from '../assets/guides/guide-it.md?raw';
import guideFr from '../assets/guides/guide-fr.md?raw';
import guideDe from '../assets/guides/guide-de.md?raw';
import guideEs from '../assets/guides/guide-es.md?raw';
import guidePt from '../assets/guides/guide-pt.md?raw';
import guideRu from '../assets/guides/guide-ru.md?raw';
import guideZh from '../assets/guides/guide-zh.md?raw';

export const GUIDES: Record<Language, string> = {
    en: guideEn,
    it: guideIt,
    fr: guideFr,
    de: guideDe,
    es: guideEs,
    pt: guidePt,
    ru: guideRu,
    zh: guideZh,
};

// I manuali PDF completi sono ospitati sulla repo pubblica di release.
// URL raw sul branch main → si aprono nel browser di sistema.
const MANUAL_BASE =
    'https://github.com/Ecosystem-Runtime/runtime-telegrambot-releases/raw/main/manuals/';

const MANUAL_FILES: Record<Language, string> = {
    it: 'Manuale-Utente-Avanzato-Titan-IT.pdf',
    en: 'Titan-Advanced-User-Manual-EN.pdf',
    de: 'Titan-Benutzerhandbuch-DE.pdf',
    es: 'Titan-Manual-de-Usuario-ES.pdf',
    pt: 'Titan-Manual-do-Utilizador-PT.pdf',
    fr: 'Titan-Manuel-Utilisateur-FR.pdf',
    ru: 'Titan-Rukovodstvo-Polzovatelya-RU.pdf',
    zh: 'Titan-Yonghu-Shouce-ZH.pdf',
};

/** URL del manuale PDF completo nella lingua indicata. */
export function manualUrlFor(locale: Language): string {
    return MANUAL_BASE + encodeURIComponent(MANUAL_FILES[locale] || MANUAL_FILES.en);
}

/** Apre il manuale PDF nel browser di sistema. */
export function openManual(locale: Language): void {
    window.api.openExternal(manualUrlFor(locale));
}
