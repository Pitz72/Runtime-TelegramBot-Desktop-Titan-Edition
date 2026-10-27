/**
 * Il motore su un database SQLite vero, in una cartella temporanea, con Electron simulato e
 * Telegram sostituito da un finto client che registra cosa gli si chiede di pubblicare.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = vi.hoisted(() => ({ path: '' }));

vi.mock('electron', () => ({
    app: { getPath: () => dir.path, getVersion: () => '0.0.0-test', getLocale: () => 'it' },
    safeStorage: { isEncryptionAvailable: () => false },
    BrowserWindow: { getAllWindows: () => [] },
    Notification: { isSupported: () => false },
}));
vi.mock('../logger', () => ({ TitanLogger: { log: () => {} } }));
vi.mock('./parser', async (importOriginal) => ({
    ...(await importOriginal<typeof import('./parser')>()),
    fetchFeed: vi.fn(),
}));

import { closeDB, getDB, initDB } from '../database/schema';
import { BotManager } from './manager';
import { BotEngine } from './engine';
import { fetchFeed } from './parser';

const fetchFeedMock = vi.mocked(fetchFeed);

beforeAll(() => {
    dir.path = mkdtempSync(join(tmpdir(), 'titan-engine-test-'));
    initDB();
});

afterAll(() => {
    closeDB();
    rmSync(dir.path, { recursive: true, force: true });
});

beforeEach(() => {
    getDB().exec('DELETE FROM bots');
});

/** Un motore «acceso» alla generazione 1, con un client finto al posto di Telegram. */
function engineWithFakeTelegram() {
    const sent: string[] = [];
    const engine = new BotEngine();
    Object.assign(engine as any, {
        isRunning: true,
        runId: 1,
        getClient: () => ({ sendMessage: async (text: string) => { sent.push(text); return { ok: true }; } }),
    });
    return { engine, sent };
}

const hh = (h: number) => `${String(((h % 24) + 24) % 24).padStart(2, '0')}:00`;

function botWithDigestQueue(sendFrom = '00:00', sendUntil = '23:59') {
    const botId = Number(BotManager.createBot('Bot', '123456789:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '@c', undefined, 15, true, sendFrom, sendUntil));
    const feedId = BotManager.addFeed(botId, 'Notizie', 'https://example.org/f.xml', 'news', null, null, 1440);
    for (const n of [1, 2, 3]) {
        BotManager.addToDigestQueue(botId, feedId, { id: `id-${n}`, title: `Titolo ${n}`, link: `https://example.org/${n}`, summary: '' });
    }
    return { botId, feedId };
}

describe('lettura dei feed', () => {
    const sample = [{ id: 'a', title: 'T', link: 'https://example.org/a', pubDate: new Date(), summary: '', feedName: 'Nome A' }];

    beforeEach(() => { fetchFeedMock.mockReset(); });

    it('lo stesso feed usato da più bot si legge una volta per giro', async () => {
        fetchFeedMock.mockResolvedValue(sample);
        const { engine } = engineWithFakeTelegram();
        const first = await (engine as any).readFeedOnce('https://example.org/f.xml', 'Nome A', 1);
        const second = await (engine as any).readFeedOnce('https://example.org/f.xml', 'Nome B', 1);
        expect(fetchFeedMock).toHaveBeenCalledTimes(1);
        expect(second.items).toBe(first.items);
    });

    it('un timeout si ritenta una volta, e lo si dice', async () => {
        fetchFeedMock
            .mockRejectedValueOnce(new Error('Fetch fallito: Request timed out after 30000ms'))
            .mockResolvedValueOnce(sample);
        const { engine } = engineWithFakeTelegram();
        (engine as any).feedRetryDelayMs = 0;
        const read = await (engine as any).fetchWithRetry('F', 'https://example.org/f.xml', 1);
        expect(read.retried).toBe(true);
        expect(fetchFeedMock).toHaveBeenCalledTimes(2);
    });

    it('un 404 non si ritenta', async () => {
        fetchFeedMock.mockRejectedValue(new Error('Fetch fallito: Status code 404'));
        const { engine } = engineWithFakeTelegram();
        (engine as any).feedRetryDelayMs = 0;
        await expect((engine as any).fetchWithRetry('F', 'https://example.org/f.xml', 1)).rejects.toThrow('404');
        expect(fetchFeedMock).toHaveBeenCalledTimes(1);
    });

    it('al massimo tre letture parallele verso lo stesso server, senza frenare gli altri', async () => {
        const { engine } = engineWithFakeTelegram();
        const active: Record<string, number> = {};
        const peak: Record<string, number> = {};
        const task = (host: string) => (engine as any).withHostSlot(`https://${host}/feed`, async () => {
            active[host] = (active[host] ?? 0) + 1;
            peak[host] = Math.max(peak[host] ?? 0, active[host]);
            await new Promise(r => setTimeout(r, 15));
            active[host]--;
        });
        await Promise.all([
            ...Array.from({ length: 8 }, () => task('www.spreaker.com')),
            ...Array.from({ length: 4 }, () => task('altro.example.org')),
        ]);
        expect(peak['www.spreaker.com']).toBe(3);
        expect(peak['altro.example.org']).toBe(3);
        expect((engine as any).hostActive.size).toBe(0);
        expect((engine as any).hostWaiters.size).toBe(0);
    });
});

describe('digest', () => {
    it('spegnere il digest non fa sparire i contenuti in coda: partono in un ultimo digest', async () => {
        const { botId, feedId } = botWithDigestQueue();
        BotManager.updateFeed(feedId, 'Notizie', 'https://example.org/f.xml', 'news', null, null, null);
        const { engine, sent } = engineWithFakeTelegram();

        await (engine as any).processDigests(BotManager.getBot(botId), 1);

        expect(sent).toHaveLength(1);
        expect(sent[0]).toContain('Titolo 1');
        expect(sent[0]).toContain('Titolo 3');
        expect(BotManager.getDigestQueue(botId, feedId)).toHaveLength(0);
    });

    it('durante le ore di silenzio il digest aspetta', async () => {
        const now = new Date().getHours();
        const { botId, feedId } = botWithDigestQueue(hh(now + 2), hh(now + 3));
        const { engine, sent } = engineWithFakeTelegram();

        await (engine as any).processDigests(BotManager.getBot(botId), 1);

        expect(sent).toHaveLength(0);
        expect(BotManager.getDigestQueue(botId, feedId)).toHaveLength(3);
    });

    it('fuori dalle ore di silenzio il digest scaduto parte', async () => {
        const { botId, feedId } = botWithDigestQueue();
        const { engine, sent } = engineWithFakeTelegram();

        await (engine as any).processDigests(BotManager.getBot(botId), 1);

        expect(sent).toHaveLength(1);
        expect(BotManager.getDigestQueue(botId, feedId)).toHaveLength(0);
    });
});
