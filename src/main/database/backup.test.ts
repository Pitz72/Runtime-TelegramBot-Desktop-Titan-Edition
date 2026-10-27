import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';

const dir = vi.hoisted(() => ({ path: '' }));
vi.mock('electron', () => ({
    app: { getPath: () => dir.path },
    safeStorage: { isEncryptionAvailable: () => false },
}));
vi.mock('../logger', () => ({ TitanLogger: { log: () => {} } }));

import { closeDB, getDB, initDB } from './schema';
import { backupBeforeImport, DAILY_BACKUPS_KEPT, ensureDailyBackup, pruneBackups } from './backup';

beforeAll(() => {
    dir.path = mkdtempSync(join(tmpdir(), 'titan-backup-test-'));
    initDB();
});
afterAll(() => {
    closeDB();
    rmSync(dir.path, { recursive: true, force: true });
});

describe('backup del database', () => {
    it('il backup di oggi si fa una volta, ed è un database Titan leggibile con i dati dentro', async () => {
        getDB().prepare("INSERT INTO bots (name, token, channel_id) VALUES ('Radio', 'x', '@r')").run();
        const backups = join(dir.path, 'b1');
        const file = await ensureDailyBackup(backups);
        expect(file).not.toBeNull();
        expect(await ensureDailyBackup(backups)).toBeNull();

        const copy = new Database(file!, { readonly: true });
        try {
            expect((copy.prepare('SELECT name FROM bots').get() as any).name).toBe('Radio');
        } finally {
            copy.close();
        }
        expect(readdirSync(backups).some(f => f.endsWith('.part'))).toBe(false);
    });

    it('tiene solo gli ultimi sette giorni', () => {
        const backups = join(dir.path, 'b2');
        mkdirSync(backups, { recursive: true });
        for (let d = 1; d <= 10; d++) writeFileSync(join(backups, `titan-2026-10-${String(d).padStart(2, '0')}.db`), '');
        writeFileSync(join(backups, 'altro-file.txt'), '');
        pruneBackups(backups, /^titan-\d{4}-\d{2}-\d{2}\.db$/, DAILY_BACKUPS_KEPT);
        const left = readdirSync(backups).sort();
        expect(left).toContain('altro-file.txt');
        expect(left.filter(f => f.startsWith('titan-'))).toEqual(
            ['04', '05', '06', '07', '08', '09', '10'].map(d => `titan-2026-10-${d}.db`),
        );
    });

    it('prima di un import salva il database attuale, senza toccare i backup quotidiani', async () => {
        const backups = join(dir.path, 'b3');
        const file = await backupBeforeImport(backups);
        expect(existsSync(file)).toBe(true);
        expect(file).toMatch(/titan-before-import-.+\.db$/);
    });
});
