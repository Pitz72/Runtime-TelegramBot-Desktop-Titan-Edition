import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = vi.hoisted(() => ({ path: '' }));
vi.mock('electron', () => ({ app: { getPath: () => dir.path } }));

import { readSettings, updateSettings } from './settings';

const file = () => join(dir.path, 'titan-settings.json');

beforeAll(() => { dir.path = mkdtempSync(join(tmpdir(), 'titan-settings-test-')); });
afterAll(() => rmSync(dir.path, { recursive: true, force: true }));
beforeEach(() => {
    for (const f of readdirSync(dir.path)) rmSync(join(dir.path, f), { force: true });
});

describe('impostazioni', () => {
    it('due modifiche vicine restano entrambe: nessuna cancella l\'altra', async () => {
        await Promise.all([
            updateSettings(s => { s.uiZoom = 1.4; }),
            updateSettings(s => { s.closeAction = 'tray'; }),
            updateSettings(s => { s.autoStartEngine = true; }),
        ]);
        const s = await readSettings();
        expect(s).toMatchObject({ uiZoom: 1.4, closeAction: 'tray', autoStartEngine: true });
    });

    it('la scrittura non lascia file temporanei', async () => {
        await updateSettings(s => { s.performanceMode = true; });
        expect(readdirSync(dir.path)).toEqual(['titan-settings.json']);
        expect(JSON.parse(readFileSync(file(), 'utf-8')).performanceMode).toBe(true);
    });

    it('un file rovinato torna ai predefiniti ma resta da parte, non sparisce', async () => {
        writeFileSync(file(), '{"autoStartEngine": tr');
        const s = await readSettings();
        expect(s.autoStartEngine).toBeUndefined();
        expect(existsSync(file())).toBe(false);
        expect(readdirSync(dir.path).some(f => f.startsWith('titan-settings.json.corrupt-'))).toBe(true);
    });

    it('una modifica che fallisce non blocca le successive', async () => {
        await expect(updateSettings(() => { throw new Error('rotta'); })).rejects.toThrow('rotta');
        await updateSettings(s => { s.uiZoom = 1.1; });
        expect((await readSettings()).uiZoom).toBe(1.1);
    });
});
