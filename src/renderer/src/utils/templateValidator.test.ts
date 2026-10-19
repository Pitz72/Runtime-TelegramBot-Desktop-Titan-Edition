import { describe, expect, it } from 'vitest';
import { validateTemplate } from './templateValidator';

const codes = (t: string, startup = false) => validateTemplate(t, startup).map(i => i.severity);

describe('validateTemplate', () => {
    it('i template predefiniti sono validi', () => {
        expect(validateTemplate("🎙 <b>{{feedName}}</b>\n\n<i>{{title}}</i>\n\n{{summary}}\n\n🎧 <a href='{{link}}'>Ascolta l'episodio</a>")).toEqual([]);
        expect(validateTemplate("🎬 <b>{{feedName}}</b>\n\n<b>{{title}}</b>\n\n▶️ <a href='{{link}}'>Guarda il video</a>")).toEqual([]);
    });

    it('un template vuoto è solo un\'informazione: si userà quello predefinito', () => {
        expect(codes('')).toEqual(['info']);
    });

    it('i tag che Telegram non conosce sono errori', () => {
        expect(codes('<div>{{title}}</div>')).toContain('error');
        expect(codes('<p>x</p>')).toContain('error');
    });

    it('tag non bilanciati o incrociati sono errori', () => {
        expect(codes('<b>{{title}}')).toContain('error');
        expect(codes('{{title}}</b>')).toContain('error');
        expect(codes('<b><i>x</b></i>')).toContain('error');
    });

    it('<a> senza href è un errore', () => {
        expect(codes('<a>link</a>')).toContain('error');
    });

    it('segnaposto sconosciuti e segnaposto dentro href sono avvisi', () => {
        expect(codes('{{autore}}')).toEqual(['warning']);
        expect(codes('<a href="{{title}}">x</a>')).toContain('warning');
    });

    it('nel messaggio di avvio i segnaposto non vengono sostituiti', () => {
        expect(codes('Avvio {{title}}', true)).toEqual(['info']);
    });
});
