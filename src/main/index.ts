import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { setupIpc } from './ipc'
import { getBotEngine } from './bot/engine'
import { closeDB } from './database/schema'

let mainWindow: BrowserWindow | null = null

// --- GESTORI DI ERRORI GLOBALI FATALI ---
// Cattura eccezioni non gestite (es. errori di sintassi, chiamate a metodi inesistenti)
process.on('uncaughtException', (error) => {
    console.error('CRITICAL: uncaughtException:', error);
    // Usa un try-catch nel caso `dialog` fallisse se l'app è in uno stato troppo corrotto
    try {
        if (app.isReady()) {
            dialog.showErrorBox('Errore Fatale di Sistema (Uncaught Exception)', error.message || 'Errore sconosciuto');
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

// --- DISABILITA ACCELERAZIONE HARDWARE ---
// Previene crash GPU "silenti" su macchine vecchie o Server Virtualizzati (VPS),
// dove Electron potrebbe avviarsi in background ma bloccarsi prima di renderizzare la finestra.
app.disableHardwareAcceleration();


function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        // Su Windows serve un .ico multi-size per l'icona nella barra applicazioni;
        // il PNG 1024px non viene mostrato correttamente nella taskbar.
        icon: join(__dirname, process.platform === 'win32' ? '../../resources/icon.ico' : '../../resources/icon.png'),
        webPreferences: {
            preload: join(__dirname, '../preload/index.cjs'),
            sandbox: true
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
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        const indexPath = join(__dirname, '../../dist/index.html');
        console.log('Loading production index from:', indexPath);
        mainWindow.loadFile(indexPath).catch(err => {
            console.error('Failed to load index.html:', err);
            // Mostriamo all'utente che il file UI non è stato trovato (es. build corrotta)
            dialog.showErrorBox('Errore Caricamento Interfaccia', 'Impossibile caricare i file grafici dell\'applicazione (index.html mancante o corrotto).\n\nReinstalla l\'applicazione.\nDettagli: ' + err.message);
            app.exit(1);
        });
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.runtimeradio.titandesktop')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    setupIpc()

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
