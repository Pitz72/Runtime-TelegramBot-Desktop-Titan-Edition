/**
 * Electron nei test: un sostituto minimo, collegato in vitest.config.ts.
 *
 * Il vero pacchetto `electron`, importato fuori da Electron, restituisce il percorso del
 * binario e, se il binario manca, lo scarica: un test che importava anche solo i testi del
 * main restava appeso al download. Chi ha bisogno di comportamenti precisi (percorsi,
 * cifratura) li dichiara con `vi.mock('electron', …)` nel proprio file.
 */
import { tmpdir } from 'node:os';

export const app = {
    getPath: () => tmpdir(),
    getVersion: () => '0.0.0-test',
    getLocale: () => 'it',
    isReady: () => false,
    isPackaged: false,
};
export const safeStorage = { isAsyncEncryptionAvailable: async () => false };
export const BrowserWindow = { getAllWindows: () => [] };
export const Notification = { isSupported: () => false };
export const shell = {};
export const dialog = {};
export const ipcMain = { handle: () => {} };
export const powerMonitor = { on: () => {} };

export default { app, safeStorage, BrowserWindow, Notification, shell, dialog, ipcMain, powerMonitor };
