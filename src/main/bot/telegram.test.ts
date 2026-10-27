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
    const signals: AbortSignal[] = [];
    (client as any).client = {
        callApi: vi.fn(async (method: string, payload: { text: string }, opts: { signal: AbortSignal }) => {
            expect(method).toBe('sendMessage');
            sent.push(payload.text);
            signals.push(opts.signal);
            if (replies.shift() === 'reject') {
                throw { response: { error_code: 400, description: "Bad Request: can't parse entities" } };
            }
        }),
    };
    return { client, sent, signals };
}

describe('sendMessage', () => {
    it('ogni chiamata a Telegram ha un tempo massimo proprio', async () => {
        const { client, signals } = clientWith(['ok']);
        await client.sendMessage('ciao');
        expect(signals[0]).toBeInstanceOf(AbortSignal);
        expect(signals[0].aborted).toBe(false);
    });

    it('con un argomento il messaggio va lì (message_thread_id), senza va nella chat intera', async () => {
        const payloads: any[] = [];
        for (const topic of [45, null]) {
            const client = new TelegramClient('123:abc', '-1001234', topic);
            (client as any).client = { callApi: async (_m: string, payload: any) => { payloads.push(payload); } };
            await client.sendMessage('ciao');
        }
        expect(payloads[0].message_thread_id).toBe(45);
        expect('message_thread_id' in payloads[1]).toBe(false);
    });

    it('un timeout è un errore transitorio, da ritentare', async () => {
        const client = new TelegramClient('123:abc', '@c');
        let calls = 0;
        (client as any).client = {
            callApi: async () => {
                calls++;
                if (calls === 1) throw Object.assign(new Error('The user aborted a request.'), { name: 'AbortError', type: 'aborted' });
            },
        };
        // Pausa tra i tentativi accorciata: qui conta solo che si ritenti.
        (client as any).abortableSleep = async () => false;
        const res = await client.sendMessage('ciao');
        expect(res.ok).toBe(true);
        expect(calls).toBe(2);
    });
});

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
