import { useCallback, useEffect, useRef, useState } from 'react';

export type UpdateStatus =
    | 'idle'        // nessun aggiornamento in vista
    | 'checking'    // controllo in corso
    | 'available'   // trovata nuova versione, in attesa di conferma download
    | 'downloading' // download in corso
    | 'downloaded'  // pronto per l'installazione (riavvio)
    | 'uptodate'    // già aggiornato (mostrato solo dopo un controllo manuale)
    | 'error';      // errore (mostrato solo dopo un controllo manuale)

export interface Updater {
    status: UpdateStatus;
    currentVersion: string;
    newVersion: string | null;
    progress: number;
    errorMessage: string | null;
    /** Avvia un controllo. `manual` = feedback visibile anche per "sei aggiornato"/errore. */
    check: (manual?: boolean) => void;
    /** Conferma e avvia il download dell'aggiornamento trovato. */
    download: () => void;
    /** Riavvia e installa l'aggiornamento scaricato. */
    install: () => void;
    /** Chiude la schermata di aggiornamento senza agire. */
    dismiss: () => void;
}

/**
 * Gestione centralizzata del ciclo di vita degli aggiornamenti (electron-updater).
 * Vive a livello di App così il controllo parte già dalla schermata intro e la
 * schermata di avviso può comparire sopra qualunque vista.
 */
export function useUpdater(): Updater {
    const [status, setStatus] = useState<UpdateStatus>('idle');
    const [currentVersion, setCurrentVersion] = useState('');
    const [newVersion, setNewVersion] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // true quando l'utente ha avviato il controllo di persona (es. dal modale impostazioni):
    // solo in quel caso mostriamo "sei aggiornato" o l'errore, altrimenti restiamo silenziosi.
    const manualRef = useRef(false);

    const check = useCallback((manual = true) => {
        manualRef.current = manual;
        setErrorMessage(null);
        setStatus('checking');
        window.api.checkForUpdates().catch(() => {
            // L'esito reale arriva via evento update-error; qui ignoriamo il reject della IPC.
        });
    }, []);

    const download = useCallback(() => {
        setProgress(0);
        setStatus('downloading');
        window.api.downloadUpdate().catch(() => {});
    }, []);

    const install = useCallback(() => {
        window.api.installUpdate();
    }, []);

    const dismiss = useCallback(() => {
        setStatus('idle');
    }, []);

    useEffect(() => {
        window.api.getVersion().then(setCurrentVersion).catch(() => {});

        window.api.onUpdateAvailable((info) => {
            setNewVersion(info.version);
            setStatus('available');
        });
        window.api.onUpdateNotAvailable(() => {
            setStatus(manualRef.current ? 'uptodate' : 'idle');
        });
        window.api.onUpdateProgress((info) => {
            setProgress(Math.round(info.percent));
            setStatus('downloading');
        });
        window.api.onUpdateDownloaded((info) => {
            setNewVersion(info.version);
            setStatus('downloaded');
        });
        window.api.onUpdateError((info) => {
            setErrorMessage(info.message);
            setStatus(manualRef.current ? 'error' : 'idle');
        });

        // Controllo automatico all'avvio (silenzioso su "sei aggiornato"/errore).
        check(false);
    }, [check]);

    return { status, currentVersion, newVersion, progress, errorMessage, check, download, install, dismiss };
}
