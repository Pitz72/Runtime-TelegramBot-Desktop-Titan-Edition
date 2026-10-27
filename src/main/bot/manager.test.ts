/**
 * Il gestore su un database SQLite vero, in una cartella temporanea: Electron è simulato
 * (percorsi e cifratura), il resto è il codice di produzione. Nessun dato reale coinvolto.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = vi.hoisted(() => ({ path: '' }));

vi.mock('electron', () => ({
    app: { getPath: () => dir.path, getVersion: () => '0.0.0-test', getLocale: () => 'it' },
    safeStorage: { isEncryptionAvailable: () => false },
}));

import { closeDB, getDB, initDB } from '../database/schema';
import { BotManager } from './manager';

beforeAll(() => {
    dir.path = mkdtempSync(join(tmpdir(), 'titan-manager-test-'));
    initDB();
});

afterAll(() => {
    closeDB();
    rmSync(dir.path, { recursive: true, force: true });
});

beforeEach(() => {
    getDB().exec('DELETE FROM bots');
});

const TOKEN = '123456789:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

function singleProfile(over: Record<string, unknown> = {}, feeds: unknown[] = []) {
    return JSON.stringify({
        bot: {
            name: 'Radio', token: TOKEN, channelId: '@Radio', isActive: true,
            startDate: '2026-01-01', checkInterval: 30, sendFrom: '08:00', sendUntil: '22:00',
            ...over,
        },
        feeds,
    });
}

describe('import di un profilo .rtb', () => {
    it('il bot parte da adesso, non dalla data del file: niente arretrato ripubblicato', () => {
        const before = Date.now();
        const { botId } = BotManager.importSingleBot(singleProfile());
        const bot = BotManager.getBot(botId)!;
        expect(Date.parse(bot.start_date)).toBeGreaterThanOrEqual(before - 1000);
        expect(bot.is_active).toBe(true);
        expect(bot.check_interval).toBe(30);
        expect(bot.send_from).toBe('08:00');
    });

    it('resta spento se un altro bot attivo pubblica già sullo stesso canale', () => {
        BotManager.createBot('Originale', TOKEN, 't.me/radio');
        const res = BotManager.importSingleBot(singleProfile({ channelId: '@RADIO' }));
        expect(res.pausedFor).toBe('Originale');
        expect(BotManager.getBot(res.botId)!.is_active).toBe(false);
    });

    it('un bot spento sullo stesso canale non ne blocca un altro', () => {
        const id = Number(BotManager.createBot('Vecchio', TOKEN, '@Radio'));
        getDB().prepare('UPDATE bots SET is_active = 0 WHERE id = ?').run(id);
        const res = BotManager.importSingleBot(singleProfile());
        expect(res.pausedFor).toBeUndefined();
        expect(BotManager.getBot(res.botId)!.is_active).toBe(true);
    });

    it('importa i feed con i loro valori, scartando quelli fuori regola', () => {
        const { botId } = BotManager.importSingleBot(singleProfile({}, [
            { name: 'A', url: 'https://example.org/a.xml', type: 'news', isActive: false, check_interval: 60, digest_interval: 1440, keyword_filter: '{"include":["x"]}' },
            { name: 'B', url: 'https://example.org/b.xml', type: 'podcast', check_interval: 'tanto', digest_interval: -3, keyword_filter: 'non json' },
        ]));
        const feeds = BotManager.getFeeds(botId).sort((x, y) => x.name.localeCompare(y.name));
        expect(feeds[0]).toMatchObject({ name: 'A', is_active: false, check_interval: 60, digest_interval: 1440, keyword_filter: '{"include":["x"]}' });
        expect(feeds[1]).toMatchObject({ name: 'B', is_active: true, check_interval: null, digest_interval: null, keyword_filter: null });
    });

    it('rifiuta un feed verso una rete privata senza scrivere nulla', () => {
        expect(() => BotManager.importSingleBot(singleProfile({}, [
            { name: 'Locale', url: 'http://192.168.1.10/feed', type: 'news' },
        ]))).toThrow();
        expect(BotManager.getBots()).toHaveLength(0);
    });

    it('l\'import di tutti i bot normalizza orari e intervalli invece di scriverli grezzi', () => {
        const res = BotManager.importConfig(JSON.stringify([
            { name: 'Uno', token: '', channel_id: '@uno', check_interval: '45', send_from: '25:99', send_until: 7, is_active: 1, feeds: [] },
            { name: 'Due', token: '', channel_id: '@UNO', is_active: true, feeds: [] },
        ]));
        expect(res).toHaveLength(2);
        const uno = BotManager.getBot(res[0].botId)!;
        expect(uno.check_interval).toBe(45);
        expect(uno.send_from).toBe('00:00');
        expect(uno.send_until).toBe('23:59');
        // Il secondo punta allo stesso canale del primo, appena importato: resta spento.
        expect(res[1].pausedFor).toBe('Uno');
    });
});

describe('deduplica', () => {
    it('un titolo vuoto non blocca i contenuti successivi senza titolo', () => {
        const botId = Number(BotManager.createBot('Bot', TOKEN, '@c'));
        const feedId = BotManager.addFeed(botId, 'F', 'https://example.org/f.xml', 'news');
        BotManager.markProcessed(botId, feedId, 'id-1', '');
        expect(BotManager.isProcessed(botId, 'id-1', feedId, '')).toBe(true);
        expect(BotManager.isProcessed(botId, 'id-2', feedId, '')).toBe(false);
    });

    it('un titolo vero continua a bloccare lo stesso contenuto con un link diverso', () => {
        const botId = Number(BotManager.createBot('Bot', TOKEN, '@c'));
        const feedId = BotManager.addFeed(botId, 'F', 'https://example.org/f.xml', 'news');
        BotManager.markProcessed(botId, feedId, 'id-1', 'Puntata 12');
        expect(BotManager.isProcessed(botId, 'id-9', feedId, ' puntata 12 ')).toBe(true);
    });
});

describe('coda del digest', () => {
    it('digestFeedIds trova i feed con contenuti in attesa, anche a digest spento', () => {
        const botId = Number(BotManager.createBot('Bot', TOKEN, '@c'));
        const feedId = BotManager.addFeed(botId, 'F', 'https://example.org/f.xml', 'news', null, null, 60);
        BotManager.addToDigestQueue(botId, feedId, { id: 'x', title: 'T', link: 'https://example.org/x', summary: '' });
        BotManager.updateFeed(feedId, 'F', 'https://example.org/f.xml', 'news', null, null, null);
        expect(BotManager.digestFeedIds(botId)).toEqual([feedId]);
    });
});
