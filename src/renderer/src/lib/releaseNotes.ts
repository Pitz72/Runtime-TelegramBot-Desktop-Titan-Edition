import type { Language } from '../locales/I18nContext';

/**
 * Punti salienti per versione, localizzati. Mostrati nella schermata "Novità"
 * al primo avvio dopo un aggiornamento automatico. Se una versione non è qui,
 * la schermata usa un testo di fallback generico.
 */
export const RELEASE_NOTES: Record<string, Record<Language, string[]>> = {
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
        fr: [
            'Guide rapide intégré, disponible dans toutes les langues directement dans l’application.',
            'Manuel d’utilisation complet téléchargeable en PDF en un clic.',
            'Nouvel écran des nouveautés affiché après chaque mise à jour.',
            'Nouveau logo et identité Titan dans toute l’interface.',
        ],
        de: [
            'Integrierte Kurzanleitung, in jeder Sprache direkt in der App verfügbar.',
            'Vollständiges Benutzerhandbuch mit einem Klick als PDF herunterladbar.',
            'Neuer Neuigkeiten-Bildschirm nach jedem Update.',
            'Neues Titan-Logo und Branding in der gesamten Oberfläche.',
        ],
        es: [
            'Guía rápida integrada, disponible en todos los idiomas dentro de la app.',
            'Manual de usuario completo descargable en PDF con un clic.',
            'Nueva pantalla de novedades tras cada actualización.',
            'Nuevo logo e identidad Titan en toda la interfaz.',
        ],
        pt: [
            'Guia rápido integrado, disponível em todos os idiomas dentro da aplicação.',
            'Manual do utilizador completo transferível em PDF com um clique.',
            'Novo ecrã de novidades apresentado após cada atualização.',
            'Novo logótipo e identidade Titan em toda a interface.',
        ],
        ru: [
            'Встроенное краткое руководство на всех языках прямо в приложении.',
            'Полное руководство пользователя можно скачать в PDF одним щелчком.',
            'Новый экран с новинками после каждого обновления.',
            'Новый логотип и оформление Titan во всём интерфейсе.',
        ],
        zh: [
            '内置快速指南，可在应用内以任意语言查看。',
            '一键即可下载完整的 PDF 用户手册。',
            '每次更新后显示全新的更新说明界面。',
            '全新的 Titan 徽标与视觉形象贯穿整个界面。',
        ],
    },
};

/** Punti salienti per la versione indicata, o null se non presenti. */
export function notesFor(version: string, locale: Language): string[] | null {
    const entry = RELEASE_NOTES[version];
    if (!entry) return null;
    return entry[locale] || entry.en || null;
}
