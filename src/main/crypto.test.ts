/**
 * Cifratura dei token con le API asincrone di safeStorage, su un portachiavi simulato.
 *
 * Il portachiavi finto «cifra» anteponendo `K:`: basta a distinguere ciò che è passato da
 * lì da ciò che non c'è passato. `keychain.available` permette di simulare un sistema
 * senza portachiavi (Linux senza libsecret), dove vale la chiave macchina.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = vi.hoisted(() => ({ path: '' }));
const keychain = vi.hoisted(() => ({ available: true }));

vi.mock('electron', () => ({
    app: { getPath: () => dir.path, getLocale: () => 'it' },
    safeStorage: {
        isAsyncEncryptionAvailable: async () => keychain.available,
        encryptStringAsync: async (s: string) => Buffer.from('K:' + s),
        decryptStringAsync: async (b: Buffer) => {
            const s = b.toString();
            if (!s.startsWith('K:')) throw new Error('non è un blob di questo portachiavi');
            return { result: s.slice(2), shouldReEncrypt: false };
        },
    },
}));

import { decryptToken, encryptToken } from './crypto';
import { closeDB, getDB, initDB } from './database/schema';
import { BotManager } from './bot/manager';

const TOKEN = '123456789:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

beforeAll(() => {
    dir.path = mkdtempSync(join(tmpdir(), 'titan-crypto-test-'));
    initDB();
});
afterAll(() => {
    closeDB();
    rmSync(dir.path, { recursive: true, force: true });
});
beforeEach(() => {
    keychain.available = true;
    getDB().exec('DELETE FROM bots');
});

describe('cifratura dei token', () => {
    it('con il portachiavi: formato ss:, e torna uguale', async () => {
        const stored = await encryptToken(TOKEN);
        expect(stored.startsWith('ss:')).toBe(true);
        expect(stored).not.toContain(TOKEN);
        expect(await decryptToken(stored)).toEqual({ token: TOKEN, upgrade: false });
    });

    it('senza portachiavi: chiave macchina, formato mk:', async () => {
        keychain.available = false;
        const stored = await encryptToken(TOKEN);
        expect(stored.startsWith('mk:')).toBe(true);
        expect((await decryptToken(stored)).token).toBe(TOKEN);
    });

    it('un token ss: senza portachiavi (altro computer) è illeggibile, senza errori', async () => {
        const stored = await encryptToken(TOKEN);
        keychain.available = false;
        expect(await decryptToken(stored)).toEqual({ token: '', upgrade: false });
    });

    it('i formati vecchi si leggono e vanno riscritti', async () => {
        const legacyKeychain = Buffer.from('K:' + TOKEN).toString('base64'); // safeStorage senza prefisso (≤ 1.10.1)
        expect(await decryptToken(legacyKeychain)).toEqual({ token: TOKEN, upgrade: true });
        expect(await decryptToken(TOKEN)).toEqual({ token: TOKEN, upgrade: true }); // in chiaro (< 1.7.8)
        expect(await decryptToken('{"e":"x","iv":"y"}')).toEqual({ token: '', upgrade: false });
    });
});

describe('token dei bot all\'avvio', () => {
    it('loadTokens decifra tutto e riscrive subito i formati vecchi', async () => {
        const legacy = Buffer.from('K:' + TOKEN).toString('base64');
        getDB().prepare("INSERT INTO bots (name, token, channel_id) VALUES ('Vecchio', ?, '@a')").run(legacy);
        getDB().prepare("INSERT INTO bots (name, token, channel_id) VALUES ('In chiaro', ?, '@b')").run(TOKEN);
        expect(await BotManager.loadTokens()).toBe(0);

        for (const bot of BotManager.getBots()) expect(bot.token).toBe(TOKEN);
        const stored = getDB().prepare('SELECT token FROM bots').all() as Array<{ token: string }>;
        for (const row of stored) expect(row.token.startsWith('ss:')).toBe(true);
    });

    it('conta i token illeggibili, che restano vuoti', async () => {
        const id = await BotManager.createBot('Bot', TOKEN, '@c');
        keychain.available = false;
        expect(await BotManager.loadTokens()).toBe(1);
        expect(BotManager.getBot(id)!.token).toBe('');
    });

    it('salvare aggiorna subito il token che il motore legge', async () => {
        const id = await BotManager.createBot('Bot', TOKEN, '@c');
        await BotManager.updateBot(id, 'Bot', '987654321:BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', '@c', true);
        expect(BotManager.getBot(id)!.token).toBe('987654321:BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');
    });

    it('un profilo .rtb esportato qui si reimporta con il token leggibile', async () => {
        const id = await BotManager.createBot('Bot', TOKEN, '@c');
        const exported = await BotManager.exportSingleBot(id);
        expect(exported).not.toContain(TOKEN);
        getDB().prepare('UPDATE bots SET is_active = 0').run();
        const { botId } = await BotManager.importSingleBot(exported);
        expect(BotManager.getBot(botId)!.token).toBe(TOKEN);
    });
});
