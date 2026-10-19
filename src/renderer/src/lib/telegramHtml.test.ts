// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { sanitizeTelegramHtml } from './telegramHtml';
import { errorMessage } from './errors';

describe('sanitizeTelegramHtml', () => {
    it('conserva la formattazione di Telegram', () => {
        expect(sanitizeTelegramHtml('<b>Titolo</b> <i>corsivo</i> <code>x</code>'))
            .toBe('<b>Titolo</b> <i>corsivo</i> <code>x</code>');
    });

    it('trasforma i link in testo con l\'indirizzo nel tooltip', () => {
        expect(sanitizeTelegramHtml(`<a href='https://a.it/x?a=1&b=2'>Leggi</a>`))
            .toBe('<span class="tg-link" title="https://a.it/x?a=1&amp;b=2">Leggi</span>');
        expect(sanitizeTelegramHtml('<a href="javascript:alert(1)">x</a>'))
            .toBe('<span class="tg-link">x</span>');
    });

    it('elimina interi gli elementi pericolosi', () => {
        const out = sanitizeTelegramHtml(
            '<meta http-equiv="refresh" content="0;url=https://evil.example">' +
            '<iframe src="https://evil.example"></iframe>' +
            '<script>alert(1)</script><style>*{}</style>ok'
        );
        expect(out).toBe('ok');
    });

    it('toglie tag e attributi non ammessi ma tiene il testo', () => {
        const out = sanitizeTelegramHtml('<div onclick="x()"><img src=x onerror="alert(1)">ciao <b onmouseover="y()">tu</b></div>');
        expect(out).toBe('ciao <b>tu</b>');
        expect(out).not.toMatch(/on\w+=/i);
    });

    it('lo spoiler resta solo nella forma che Telegram accetta', () => {
        expect(sanitizeTelegramHtml('<span class="tg-spoiler">s</span><span style="x">t</span><tg-spoiler>u</tg-spoiler>'))
            .toBe('<span class="tg-spoiler">s</span>t<span class="tg-spoiler">u</span>');
    });

    it('il testo con caratteri speciali resta testo', () => {
        expect(sanitizeTelegramHtml('A &amp; B &lt;b&gt;')).toBe('A &amp; B &lt;b&gt;');
    });
});

describe('errorMessage', () => {
    it('toglie l\'involucro di Electron e lascia il messaggio per l\'utente', () => {
        const e = new Error("Error invoking remote method 'add-feed': Error: Indirizzo di rete privata/locale non consentito: \"10.0.0.1\"");
        expect(errorMessage(e)).toBe('Indirizzo di rete privata/locale non consentito: "10.0.0.1"');
    });
    it('lascia intatti gli altri errori', () => {
        expect(errorMessage(new Error('boom'))).toBe('boom');
        expect(errorMessage('testo')).toBe('testo');
    });
});
