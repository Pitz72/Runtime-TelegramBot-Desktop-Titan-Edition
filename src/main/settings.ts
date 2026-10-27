import { app, BrowserWindow } from 'electron';
import { readFile, rename, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Cosa fa la X della finestra: `ask` chiede se il motore è acceso (e altrimenti chiude),
 * `tray` nasconde Titan nell'area di notifica, `quit` chiude sempre.
 */
export type CloseAction = 'ask' | 'tray' | 'quit';
export const CLOSE_ACTIONS: readonly CloseAction[] = ['ask', 'tray', 'quit'];

/** Impostazioni dell'applicazione (titan-settings.json in userData). */
export interface TitanSettings {
    closeAction?: CloseAction;
    /** Il motore parte da solo all'apertura di Titan */
    autoStartEngine?: boolean;
    /** L'avviso «Titan continua nell'area di notifica» è già comparso una volta */
    trayHintShown?: boolean;
    /** «Riduci effetti e animazioni»: nome storico, la chiave resta per compatibilità */
    performanceMode: boolean;
    lastSeenVersion?: string;
    /** Ingrandimento dell'interfaccia, 1 = 100% */
    uiZoom?: number;
    /**
     * Lingua scelta nell'interfaccia. Il renderer la tiene nel suo localStorage; qui serve al
     * main, che deve conoscerla prima che la finestra esista: il motore può partire da solo,
     * e diario, notifiche e modelli dei messaggi devono uscire già nella lingua giusta.
     */
    locale?: 'it' | 'en';
}

const DEFAULT_SETTINGS: TitanSettings = { performanceMode: false, uiZoom: 1 };

function getSettingsPath(): string {
    return join(app.getPath('userData'), 'titan-settings.json');
}

export async function readSettings(): Promise<TitanSettings> {
    let raw: string;
    try {
        raw = await readFile(getSettingsPath(), 'utf-8');
    } catch {
        return { ...DEFAULT_SETTINGS }; // prima apertura: il file non c'è ancora
    }
    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
        // File illeggibile: si torna ai valori predefiniti, ma lo si dice e lo si mette da
        // parte. Prima spariva in silenzio, e con lui l'avvio automatico del motore.
        const aside = `${getSettingsPath()}.corrupt-${Date.now()}`;
        console.error(`[settings] titan-settings.json illeggibile, spostato in ${aside}:`, e);
        await rename(getSettingsPath(), aside).catch(() => {});
        return { ...DEFAULT_SETTINGS };
    }
}

/**
 * Scrittura atomica: prima un file temporaneo, poi la sostituzione. Scritto direttamente,
 * un'interruzione a metà (crash, PC spento) lasciava un JSON troncato.
 */
export async function writeSettings(settings: TitanSettings): Promise<void> {
    const target = getSettingsPath();
    const temp = `${target}.tmp`;
    await writeFile(temp, JSON.stringify(settings, null, 2), 'utf-8');
    await rename(temp, target);
}

let settingsQueue: Promise<unknown> = Promise.resolve();

/**
 * Legge, modifica e riscrive le impostazioni, una modifica alla volta.
 *
 * Ogni punto che salvava faceva leggi-modifica-scrivi per conto suo: due salvataggi vicini
 * (lo zoom e l'azione della X, per dire) leggevano lo stesso file e l'ultimo cancellava la
 * modifica del primo. Qui le modifiche passano in fila.
 */
export function updateSettings(mutate: (settings: TitanSettings) => void): Promise<TitanSettings> {
    const next = settingsQueue.then(async () => {
        const settings = await readSettings();
        mutate(settings);
        await writeSettings(settings);
        return settings;
    });
    settingsQueue = next.catch(() => {});
    return next;
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
    if (persist) await updateSettings(s => { s.uiZoom = zoom; });
    return zoom;
}
