/**
 * Titan come programma che resta acceso: icona nell'area di notifica, cosa fa la X della
 * finestra, avvio insieme al computer.
 *
 * Fino alla 2.3 chiudere la finestra chiudeva Titan, motore compreso, senza una parola:
 * per uno strumento che deve pubblicare giorno e notte bastava un clic distratto per
 * fermare tutti i canali. Ora, a motore acceso, la X chiede cosa fare (e si può fargli
 * ricordare la risposta), e Titan può continuare a lavorare nell'area di notifica.
 */
import { app, BrowserWindow, Menu, Notification, Tray, dialog, nativeImage, powerMonitor } from 'electron';
import { join } from 'node:path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { getBotEngine } from './bot/engine';
import { BotManager } from './bot/manager';
import { onMainLocaleChange, tm } from './i18n';
import { readSettings, writeSettings, type CloseAction } from './settings';

let tray: Tray | null = null;
let quitting = false;
let getWindow: () => BrowserWindow | null = () => null;

/** Da chiamare quando l'uscita è voluta (menu, aggiornamento): la X non la intercetta più. */
export function markQuitting() {
    quitting = true;
}

/** Argomento con cui il sistema avvia Titan all'accensione: parte nell'area di notifica. */
export const HIDDEN_ARG = '--hidden';

export function showMainWindow() {
    const win = getWindow();
    if (!win || win.isDestroyed()) return;
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
}

function hasActiveBots(): boolean {
    try { return BotManager.getBots().some(b => b.is_active); } catch { return false; }
}

// ─── Area di notifica ────────────────────────────────────────────────────────

function trayImage() {
    // Windows vuole l'.ico multi-misura; altrove un PNG piccolo, o il pannello lo sfoca.
    const base = join(__dirname, '../../resources');
    if (process.platform === 'win32') return nativeImage.createFromPath(join(base, 'icon.ico'));
    return nativeImage.createFromPath(join(base, 'icon.png')).resize({ width: 22, height: 22 });
}

function refreshTray() {
    if (!tray) return;
    const engine = getBotEngine();
    const running = engine.isEngineRunning();
    tray.setToolTip(`Titan — ${running ? tm('trayRunning') : tm('trayStopped')}`);
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: tm('trayOpen'), click: showMainWindow },
        { type: 'separator' },
        { label: running ? tm('trayRunning') : tm('trayStopped'), enabled: false },
        running
            ? { label: tm('trayStop'), click: () => engine.stop() }
            : { label: tm('trayStart'), enabled: hasActiveBots(), click: () => engine.start() },
        ...(running ? [{ label: tm('trayScanNow'), click: () => { engine.scanNow(); } }] : []),
        { type: 'separator' },
        { label: tm('trayQuit'), click: () => app.quit() },
    ]));
}

export function setupDesktop(windowGetter: () => BrowserWindow | null) {
    getWindow = windowGetter;
    try {
        tray = new Tray(trayImage());
        tray.on('click', showMainWindow);
        refreshTray();
    } catch (e) {
        // Senza area di notifica (certi desktop Linux) Titan funziona lo stesso: la X chiude.
        console.error('Area di notifica non disponibile:', e);
        tray = null;
    }

    const engine = getBotEngine();
    engine.onStatusChange(running => {
        refreshTray();
        // L'interfaccia si aggiorna subito, chiunque abbia acceso o spento il motore
        // (il suo pulsante, il menu dell'area di notifica, l'avvio automatico).
        for (const win of BrowserWindow.getAllWindows()) {
            if (!win.isDestroyed()) win.webContents.send('engine-status', { running });
        }
    });
    onMainLocaleChange(refreshTray);
    powerMonitor.on('resume', onResume);
}

// ─── Ripresa dalla sospensione ───────────────────────────────────────────────

/** Il tempo che si lascia alla rete per tornare, dopo il risveglio. */
const RESUME_DELAY_MS = 30_000;
const RESUME_ATTEMPTS = 4;
let resumeTimer: NodeJS.Timeout | null = null;

/**
 * Dopo una sospensione il giro in calendario scatta subito, spesso con la rete non ancora
 * tornata: tutte le sorgenti vanno in errore e aspettano il loro intervallo. Qui, passato il
 * tempo di riconnettersi, si fa un controllo completo. Se in quel momento un giro è in corso
 * si riprova poco dopo, qualche volta.
 */
function onResume() {
    if (resumeTimer) clearTimeout(resumeTimer);
    let attempts = 0;
    const tryScan = () => {
        resumeTimer = null;
        const status = getBotEngine().scanNow('resume');
        if (status === 'busy' && ++attempts < RESUME_ATTEMPTS) resumeTimer = setTimeout(tryScan, RESUME_DELAY_MS);
    };
    if (getBotEngine().isEngineRunning()) resumeTimer = setTimeout(tryScan, RESUME_DELAY_MS);
}

/** True se la finestra può nascondersi: senza icona nell'area di notifica non si ritroverebbe. */
export function canHideToTray(): boolean {
    return tray !== null;
}

async function hideToTray(win: BrowserWindow) {
    win.hide();
    const s = await readSettings();
    if (!s.trayHintShown && Notification.isSupported()) {
        new Notification({ title: tm('trayHintTitle'), body: tm('trayHintBody') }).show();
        s.trayHintShown = true;
        await writeSettings(s);
    }
}

// ─── La X della finestra ─────────────────────────────────────────────────────

export function attachCloseHandler(win: BrowserWindow) {
    win.on('close', (event) => {
        if (quitting) return;
        event.preventDefault();
        void decideClose(win);
    });
}

async function decideClose(win: BrowserWindow) {
    const s = await readSettings();
    const action: CloseAction = s.closeAction ?? 'ask';
    const running = getBotEngine().isEngineRunning();

    if (action === 'tray' && canHideToTray()) return hideToTray(win);
    if (action === 'quit' || !running) return app.quit();

    const trayAvailable = canHideToTray();
    const buttons = trayAvailable ? [tm('closeToTray'), tm('closeQuit'), tm('cancel')] : [tm('closeQuit'), tm('cancel')];
    const { response, checkboxChecked } = await dialog.showMessageBox(win, {
        type: 'question',
        title: tm('closeTitle'),
        message: tm('closeMessage'),
        detail: trayAvailable ? tm('closeDetail') : tm('closeDetailNoTray'),
        buttons,
        defaultId: 0,
        cancelId: buttons.length - 1,
        noLink: true,
        checkboxLabel: trayAvailable ? tm('closeRemember') : undefined,
    });
    const choice = trayAvailable ? (['tray', 'quit', 'cancel'] as const)[response] : (['quit', 'cancel'] as const)[response];
    if (choice === 'cancel') return;
    if (checkboxChecked) {
        s.closeAction = choice;
        await writeSettings(s);
    }
    if (choice === 'tray') await hideToTray(win);
    else app.quit();
}

// ─── Avvio insieme al computer ───────────────────────────────────────────────

/** L'eseguibile da avviare: per la versione portatile quello vero, non la copia temporanea. */
function launcherPath(): string {
    return process.env.PORTABLE_EXECUTABLE_FILE || process.env.APPIMAGE || process.execPath;
}

function linuxAutostartFile(): string {
    const configHome = process.env.XDG_CONFIG_HOME || join(app.getPath('home'), '.config');
    return join(configHome, 'autostart', 'titan-desktop.desktop');
}

export function getOpenAtLogin(): { supported: boolean; enabled: boolean } {
    // In sviluppo si registrerebbe l'Electron di sviluppo: niente.
    const supported = app.isPackaged && (process.platform === 'win32' || process.platform === 'linux');
    if (!supported) return { supported: false, enabled: false };
    if (process.platform === 'win32') {
        return { supported, enabled: app.getLoginItemSettings({ path: launcherPath(), args: [HIDDEN_ARG] }).openAtLogin };
    }
    return { supported, enabled: existsSync(linuxAutostartFile()) };
}

export function setOpenAtLogin(enabled: boolean) {
    if (!getOpenAtLogin().supported) return;
    if (process.platform === 'win32') {
        app.setLoginItemSettings({ openAtLogin: enabled, path: launcherPath(), args: [HIDDEN_ARG] });
        return;
    }
    // Linux: Electron non lo fa da sé. È lo standard XDG, letto da GNOME, KDE, XFCE e gli altri.
    const file = linuxAutostartFile();
    if (!enabled) {
        if (existsSync(file)) unlinkSync(file);
        return;
    }
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, [
        '[Desktop Entry]',
        'Type=Application',
        'Name=Runtime TelegramBot Desktop Titan Edition',
        `Exec="${launcherPath().replace(/"/g, '\\"')}" ${HIDDEN_ARG}`,
        'Icon=titan-desktop',
        'Terminal=false',
        'X-GNOME-Autostart-enabled=true',
        '',
    ].join('\n'));
}
