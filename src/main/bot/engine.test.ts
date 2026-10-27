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

import { closeDB, getDB, initDB } from '../database/schema';
import { BotManager } from './manager';
import { BotEngine } from './engine';

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
