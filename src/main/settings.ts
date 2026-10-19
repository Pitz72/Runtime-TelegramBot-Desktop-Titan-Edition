import { app, BrowserWindow } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/** Impostazioni dell'applicazione (titan-settings.json in userData). */
export interface TitanSettings {
    /** «Riduci effetti e animazioni»: nome storico, la chiave resta per compatibilità */
    performanceMode: boolean;
    lastSeenVersion?: string;
    /** Ingrandimento dell'interfaccia, 1 = 100% */
    uiZoom?: number;
}

const DEFAULT_SETTINGS: TitanSettings = { performanceMode: false, uiZoom: 1 };

function getSettingsPath(): string {
    return join(app.getPath('userData'), 'titan-settings.json');
}

export async function readSettings(): Promise<TitanSettings> {
    try {
        const raw = await readFile(getSettingsPath(), 'utf-8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

export async function writeSettings(settings: TitanSettings): Promise<void> {
    await writeFile(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8');
}

// --- Ingrandimento dell'interfaccia ---
// Per chi vede poco l'ingrandimento è la prima cosa che serve, e deve restare tra un avvio
// e l'altro. Chromium lo applica a tutto — testo, icone, misure in px — senza toccare il layout.

export const ZOOM_STEPS = [0.8, 0.9, 1, 1.1, 1.25, 1.4, 1.6, 1.8];

export function clampZoom(value: unknown): number {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    return Math.min(ZOOM_STEPS[ZOOM_STEPS.length - 1], Math.max(ZOOM_STEPS[0], Math.round(n * 100) / 100));
}

/** Il gradino successivo (direction = 1) o precedente (-1) rispetto all'ingrandimento attuale. */
export function stepZoom(current: number, direction: 1 | -1): number {
    if (direction > 0) return ZOOM_STEPS.find(s => s > current + 0.001) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1];
    return [...ZOOM_STEPS].reverse().find(s => s < current - 0.001) ?? ZOOM_STEPS[0];
}

export async function applyZoom(win: BrowserWindow, value: number, persist = true): Promise<number> {
    const zoom = clampZoom(value);
    if (!win.isDestroyed()) {
        win.webContents.setZoomFactor(zoom);
        win.webContents.send('ui-zoom-changed', zoom);
    }
    if (persist) {
        const s = await readSettings();
        s.uiZoom = zoom;
        await writeSettings(s);
    }
    return zoom;
}
