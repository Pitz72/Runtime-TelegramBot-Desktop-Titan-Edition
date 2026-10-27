import { describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({ app: { getLocale: () => 'it-IT' } }));

import { MAIN_STRINGS, setMainLocale, tm } from './i18n';

const placeholders = (text: string) => [...text.matchAll(/\{\{?(\w+)\}?\}/g)].map(m => m[0]).sort();

describe('testi del main process', () => {
    it('italiano e inglese hanno le stesse chiavi', () => {
        expect(Object.keys(MAIN_STRINGS.en).sort()).toEqual(Object.keys(MAIN_STRINGS.it).sort());
    });

    it('e gli stessi segnaposto in ogni testo', () => {
        for (const key of Object.keys(MAIN_STRINGS.it) as Array<keyof typeof MAIN_STRINGS.it>) {
            expect(placeholders(MAIN_STRINGS.en[key]), key).toEqual(placeholders(MAIN_STRINGS.it[key]));
        }
    });

    it('i modelli italiani sono identici a quelli della 2.4.1: sui canali non cambia una virgola', () => {
        expect(MAIN_STRINGS.it.tplNews).toBe("📰 <b>{{feedName}}</b>\n\n<b>{{title}}</b>\n\n🔗 <a href='{{link}}'>Leggi l'articolo completo</a>");
        expect(MAIN_STRINGS.it.tplPodcast).toBe("🎙 <b>{{feedName}}</b>\n\n<i>{{title}}</i>\n\n{{summary}}\n\n🎧 <a href='{{link}}'>Ascolta l'episodio</a>");
        expect(MAIN_STRINGS.it.tplYoutube).toBe("🎬 <b>{{feedName}}</b>\n\n<b>{{title}}</b>\n\n▶️ <a href='{{link}}'>Guarda il video</a>");
    });

    it('segue la lingua scelta e sostituisce i segnaposto', () => {
        setMainLocale('en');
        expect(tm('notifySent', { title: 'Ep. 12' })).toBe('Published: Ep. 12');
        setMainLocale('it');
        expect(tm('notifySent', { title: 'Ep. 12' })).toBe('Pubblicato: Ep. 12');
    });

    it('ignora una lingua che non esiste', () => {
        setMainLocale('it');
        setMainLocale('fr');
        expect(tm('cancel')).toBe('Annulla');
    });
});
