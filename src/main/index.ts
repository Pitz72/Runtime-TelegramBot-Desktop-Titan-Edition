// Deve restare il primo import: sposta `userData` prima che logger e database lo leggano.
import './profile'
import { app, BrowserWindow, shell, dialog, session } from 'electron'
import { join, basename } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { setupIpc } from './ipc'
import { getBotEngine } from './bot/engine'
import { BotManager } from './bot/manager'
import { closeDB } from './database/schema'
import { tm } from './i18n'
import { readSettings, applyZoom, stepZoom } from './settings'

let mainWindow: BrowserWindow | null = null

// --- GESTORI DI ERRORI GLOBALI FATALI ---
// Cattura eccezioni non gestite (es. errori di sintassi, chiamate a metodi inesistenti)
process.on('uncaughtException', (error) => {
    console.error('CRITICAL: uncaughtException:', error);
    // Usa un try-catch nel caso `dialog` fallisse se l'app è in uno stato troppo corrotto
    try {
        if (app.isReady()) {
            dialog.showErrorBox(tm('fatalTitle'), error.message || 'Errore sconosciuto');
        } else {
            console.error('App non ancora pronta, dialog impossibile da mostrare in uncaughtException.');
        }
    } catch (e) {
        console.error('Fallimento nel mostrare showErrorBox:', e);
    }
    // Forza la chiusura del processo Node.js ("uccide il fantasma")
    app.exit(1);
});

// Cattura Promise rigettate e non gestite.
// NON chiudere l'app: una rejection è quasi sempre un errore transitorio (rete,
// rate-limit, lock DB momentaneo) generato da un task in background del motore bot.
// Per un'app che deve restare attiva 24/7, terminare il processo qui significherebbe
// spegnere il bot a ogni singhiozzo di rete. Logghiamo e proseguiamo.
process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection (non fatale, app mantenuta attiva):', reason);
});

// --- ISTANZA SINGOLA ---
// Due processi Titan aperti sullo stesso profilo utente aprirebbero lo stesso titan.db e
// avvierebbero DUE motori indipendenti. La deduplica non protegge da questo: markProcessed()
// viene eseguita solo DOPO l'invio Telegram riuscito, quindi entrambe le istanze possono
// superare isProcessed() sullo stesso item e pubblicarlo due volte sul canale (oltre alla
// contesa WAL su SQLite). La seconda istanza esce subito e passa il fuoco alla prima —
// insieme all'eventuale file .rtb con cui è stata lanciata (doppio clic sul file).
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (_event, argv) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.show()
            mainWindow.focus()
        }
        const rtb = findRtbArg(argv)
        if (rtb) void importRtbFromFile(rtb)
    })
}

// --- DISABILITA ACCELERAZIONE HARDWARE ---
// Previene crash GPU "silenti" su macchine vecchie o Server Virtualizzati (VPS),
// dove Electron potrebbe avviarsi in background ma bloccarsi prima di renderizzare la finestra.
app.disableHardwareAcceleration();

/** Il primo argomento che sia un profilo .rtb esistente (associazione file del sistema). */
function findRtbArg(argv: string[]): string | null {
    return argv.slice(1).find(a => /\.rtb$/i.test(a) && existsSync(a)) ?? null
}

/**
 * Importa un profilo .rtb aperto con doppio clic.
 *
 * L'installer registra l'estensione .rtb per Titan, ma fino alla 2.3 l'app ignorava il
 * file ricevuto: il doppio clic apriva Titan e basta. Ora chiede conferma, importa e
 * avvisa l'interfaccia, che ricarica l'elenco dei bot.
 */
async function importRtbFromFile(filePath: string) {
    if (!mainWindow || mainWindow.isDestroyed()) return
    const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'question',
        title: tm('openRtbTitle'),
        message: tm('openRtbMessage', { file: basename(filePath) }),
        detail: tm('openRtbDetail'),
        buttons: [tm('cancel'), tm('import')],
        defaultId: 1,
        cancelId: 0,
        noLink: true,
    })
    if (response !== 1) return
    try {
        const botId = BotManager.importSingleBot(await readFile(filePath, 'utf-8'))
        mainWindow.webContents.send('bots-changed', { botId })
    } catch (e: any) {
        dialog.showErrorBox(tm('openRtbFailed'), e?.message || String(e))
    }
}

/**
 * Il renderer carica solo file locali e non ha bisogno di nessun permesso del browser.
 * Tutto ciò che non è previsto viene negato: navigazioni verso altri indirizzi, webview,
 * richieste di permessi (fotocamera, posizione, notifiche web…). Le notifiche di Titan
 * partono dal main process e non passano di qui.
 */
function hardenSession() {
    const allowed = new Set(['clipboard-sanitized-write'])
    session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
        callback(allowed.has(permission))
    })
    session.defaultSession.setPermissionCheckHandler((_wc, permission) => allowed.has(permission))
}

function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 720,
        // Sotto questa misura il layout non ha più spazio per sorgenti e diario affiancati
        // né per i modali: meglio impedirlo che mostrare un'interfaccia tagliata.
        minWidth: 880,
        minHeight: 600,
        show: false,
        autoHideMenuBar: true,
        backgroundColor: '#0b1220',
        // Su Windows serve un .ico multi-size per l'icona nella barra applicazioni;
        // il PNG 1024px non viene mostrato correttamente nella taskbar.
        icon: join(__dirname, process.platform === 'win32' ? '../../resources/icon.ico' : '../../resources/icon.png'),
        webPreferences: {
            preload: join(__dirname, '../preload/index.cjs'),
            sandbox: true,
            contextIsolation: true,
            nodeIntegration: false,
            webviewTag: false,
            spellcheck: false,
        }
    })

    let isShown = false;

    mainWindow.on('ready-to-show', () => {
        if (!isShown) {
            isShown = true;
            if (showTimeout) clearTimeout(showTimeout);
            mainWindow!.maximize()
            mainWindow!.show()
        }
    })

    // --- TIMEOUT DI SICUREZZA ANTI-GHOST ---
    // Se per qualche motivo `ready-to-show` non scatta (comune su Windows/VM lenti),
    // forziamo la visualizzazione della finestra dopo 10 secondi per evitare di restare in background.
    const showTimeout = setTimeout(() => {
        if (!isShown && mainWindow && !mainWindow.isDestroyed()) {
            console.warn('SAFETY TIMEOUT: ready-to-show non è scattato entro 10s. Forzatura show() in corso...');
            isShown = true;
            mainWindow.maximize();
            mainWindow.show();
        }
    }, 10000);

    mainWindow.webContents.setWindowOpenHandler((details) => {
        // Solo http/https finiscono nel browser di sistema: schemi come file:, smb: o
        // custom-protocol non devono poter essere aperti dal renderer (stessa regola
        // dell'handler IPC 'open-external').
        if (/^https?:\/\//i.test(details.url)) {
            shell.openExternal(details.url)
        }
        return { action: 'deny' }
    })

    // La finestra principale non lascia mai l'interfaccia di Titan. Un link o un
    // `<meta refresh>` finito per errore nel DOM porterebbe altrimenti una pagina esterna
    // dentro una finestra che ha il preload con le API del programma.
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (url !== mainWindow?.webContents.getURL()) event.preventDefault()
    })
    mainWindow.webContents.on('will-attach-webview', (event) => event.preventDefault())

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['VITE_DEV_SERVER_URL']) {
        mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL'])
    } else {
        const indexPath = join(__dirname, '../../dist/index.html');
        console.log('Loading production index from:', indexPath);
        mainWindow.loadFile(indexPath).catch(err => {
            console.error('Failed to load index.html:', err);
            // Mostriamo all'utente che il file UI non è stato trovato (es. build corrotta)
            dialog.showErrorBox(tm('uiLoadFailedTitle'), tm('uiLoadFailed', { error: err.message }));
            app.exit(1);
        });
    }

    // Ingrandimento salvato: si riapplica a ogni caricamento dell'interfaccia.
    mainWindow.webContents.on('did-finish-load', () => {
        void readSettings().then(s => {
            if (mainWindow && !mainWindow.isDestroyed()) void applyZoom(mainWindow, s.uiZoom ?? 1, false)
        })
    })

    // Ctrl + / Ctrl − / Ctrl 0: le scorciatoie di zoom di ogni browser, ma con l'ingrandimento
    // che resta salvato e che l'interfaccia mostra nelle impostazioni.
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.type !== 'keyDown' || !(input.control || input.meta) || input.alt) return
        const win = mainWindow
        if (!win) return
        const current = win.webContents.getZoomFactor()
        if (input.key === '+' || input.key === '=' || input.code === 'NumpadAdd') {
            event.preventDefault()
            void applyZoom(win, stepZoom(current, 1))
        } else if (input.key === '-' || input.code === 'NumpadSubtract') {
            event.preventDefault()
            void applyZoom(win, stepZoom(current, -1))
        } else if (input.key === '0' || input.code === 'Numpad0') {
            event.preventDefault()
            void applyZoom(win, 1)
        }
    })

    // Profilo .rtb con cui è stata lanciata l'app: si importa a interfaccia pronta,
    // così l'elenco dei bot può aggiornarsi subito dopo.
    const rtbAtLaunch = findRtbArg(process.argv)
    if (rtbAtLaunch) {
        mainWindow.webContents.once('did-finish-load', () => { void importRtbFromFile(rtbAtLaunch) })
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
    // Seconda istanza: app.quit() è già stato richiesto sopra, non inizializzare nulla
    // (niente DB, niente engine, niente finestra).
    if (!gotTheLock) return

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.runtimeradio.titandesktop')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    hardenSession()

    // Il database si apre qui dentro. Se fallisce (file danneggiato, disco pieno, permessi)
    // prima l'eccezione rompeva questa promise *prima* di creare la finestra: Titan restava
    // un processo invisibile, e il blocco di istanza singola impediva perfino di rilanciarlo.
    try {
        setupIpc()
    } catch (e: any) {
        console.error('Inizializzazione fallita:', e)
        dialog.showErrorBox(
            tm('dbOpenFailedTitle'),
            tm('dbOpenFailed', { path: join(app.getPath('userData'), 'titan.db'), error: e?.message || String(e) })
        )
        app.exit(1)
        return
    }

    createWindow()

    if (!is.dev) {
        // autoDownload = false: l'utente decide se scaricare tramite la schermata di aggiornamento
        // (window.api.downloadUpdate). Prima il download partiva da solo appena trovato un update.
        autoUpdater.autoDownload = false
        autoUpdater.autoInstallOnAppQuit = false

        autoUpdater.on('update-available', (info) => {
            mainWindow?.webContents.send('update-available', { version: info.version })
        })
        autoUpdater.on('update-not-available', () => {
            mainWindow?.webContents.send('update-not-available')
        })
        autoUpdater.on('download-progress', (progress) => {
            mainWindow?.webContents.send('update-progress', { percent: progress.percent })
        })
        autoUpdater.on('update-downloaded', (info) => {
            mainWindow?.webContents.send('update-downloaded', { version: info.version })
        })
        autoUpdater.on('error', (err) => {
            mainWindow?.webContents.send('update-error', { message: err?.message || String(err) })
        })
        // checkForUpdates() è avviato dal renderer via IPC dopo il mount (window.api.checkForUpdates).
        // Non chiamarlo qui: il renderer non è ancora pronto e il messaggio update-available verrebbe perso.
    }

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// --- CHIUSURA PULITA (fix #G3) ---
// Alla chiusura normale dell'app fermiamo il motore (abort invii in corso, svuota code)
// e chiudiamo il database con checkpoint WAL, così titan.db resta consistente e il file
// -wal non cresce indefinitamente tra un avvio e l'altro.
// Nota: app.exit() (uncaughtException, import-database) NON scatena before-quit — in quei
// percorsi la chiusura è già gestita o volutamente forzata.
app.on('before-quit', () => {
    try {
        getBotEngine().stop()
    } catch (e) {
        console.error('Errore durante lo stop del motore in before-quit:', e)
    }
    closeDB()
})
