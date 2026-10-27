import { describe, expect, it, vi } from 'vitest';

vi.mock('../logger', () => ({ TitanLogger: { log: () => {} } }));

import { TelegramClient, defaultTemplate, renderItemMessage } from './telegram';

const item = {
    title: 'Puntata <12> & altro',
    link: 'https://example.org/ep?id=1&x=2',
    summary: '',
    feedName: 'Radio',
    image: 'https://example.org/cover.jpg',
};

describe('renderItemMessage', () => {
    it('riempie il template mettendo in sicurezza i campi, con l\'anteprima in testa', () => {
        const text = renderItemMessage(item, defaultTemplate('news'));
        expect(text.startsWith('<a href="https://example.org/cover.jpg">&#8203;</a>')).toBe(true);
        expect(text).toContain('<b>Puntata &lt;12&gt; &amp; altro</b>');
        expect(text).toContain("href='https://example.org/ep?id=1&amp;x=2'");
    });

    it('un sommario vuoto non lascia buchi nel messaggio', () => {
        const text = renderItemMessage({ ...item, image: undefined }, defaultTemplate('podcast'));
        expect(text).not.toMatch(/\n{3,}/);
    });

    it('un titolo vuoto non lascia un grassetto senza testo', () => {
        const text = renderItemMessage({ ...item, title: '', image: undefined }, defaultTemplate('youtube'));
        expect(text).not.toContain('<b></b>');
        expect(text).toContain('<b>Radio</b>');
    });
});

/** Un client con la chiamata a Telegram sostituita: `replies` dice come risponde, in ordine. */
function clientWith(replies: Array<'ok' | 'reject'>) {
    const client = new TelegramClient('123:abc', '@c');
    const sent: string[] = [];
    (client as any).client = {
        sendMessage: vi.fn(async (_chat: string, text: string) => {
            sent.push(text);
            if (replies.shift() === 'reject') {
                throw { response: { error_code: 400, description: "Bad Request: can't parse entities" } };
            }
        }),
    };
    return { client, sent };
}

describe('sendFormattedMessage con un template personalizzato rifiutato', () => {
    it('ripiega sul modello predefinito invece di perdere il contenuto', async () => {
        // Personalizzato: rifiutato con anteprima e senza; poi il predefinito passa.
        const { client, sent } = clientWith(['reject', 'reject', 'ok']);
        const res = await client.sendFormattedMessage(item, '<b>{{title}}', 'news');
        expect(res.ok).toBe(true);
        expect(sent).toHaveLength(3);
        expect(sent[2]).toContain("Leggi l'articolo completo");
    });

    it('con il modello predefinito un rifiuto resta un rifiuto', async () => {
        const { client, sent } = clientWith(['reject', 'reject']);
        const res = await client.sendFormattedMessage(item, null, 'news');
        expect(res).toMatchObject({ ok: false, kind: 'rejected' });
        expect(sent).toHaveLength(2);
    });
});
