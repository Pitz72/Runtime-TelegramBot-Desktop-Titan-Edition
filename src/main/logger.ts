import fs from 'fs';
import path from 'path';
import { app, BrowserWindow } from 'electron';
import { LogEntry, LogLevel, ScanEvent, ScanEventType } from '../shared/types';

// Counter monotono per ID stabili — fix #22/#23
let _logId = 0;

/**
 * Rimuove i token dei bot Telegram da qualsiasi messaggio di log.
 *
 * Telegraf costruisce le chiamate come `https://api.telegram.org/bot<TOKEN>/sendMessage`:
 * se l'URL finisce nel testo di un'eccezione di rete, il token arriverebbe nel file di log,
 * nella console della Dashboard e nel log esportato — cioè in qualunque allegato di una
 * segnalazione di bug. Il formato del token è `<8-10 cifre>:<35 caratteri>`.
 */
function redactTokens(message: string): string {
    return message
        .replace(/\b\d{8,10}:[A-Za-z0-9_-]{35}\b/g, '<TOKEN-REDACTED>')
        .replace(/\/bot\d{8,10}:[A-Za-z0-9_-]+/g, '/bot<TOKEN-REDACTED>');
}

/**
 * Rileva il livello semantico di un messaggio dai **marcatori** — fix #23.
 * Ordine: error > warn > success > info.
 *
 * Resta la via di ripiego per le righe che il motore emette senza dichiarare nulla.
 * Le righe con un `ScanEvent` non passano di qui (Fase 7), e nemmeno quelle che
 * dichiarano il proprio livello.
 *
 * ⚠️ Guarda SOLO gli emoji, mai le parole del messaggio. La versione precedente cercava
 * anche `Error`/`error`/`Fallito` in tutta la stringa, e nelle righe di diagnostica il
 * titolo del contenuto è *dentro* la stringa: due video innocui — «97. Checked Errors» e
 * «91. Digital transformation by trial and error» — finivano in rosso nel diario a ogni
 * giro di scansione. Su un log reale erano 10 falsi allarmi contro 1 errore vero.
 * Chi ha un guasto da segnalare senza emoji lo dichiara con il parametro `level`.
 */
function detectLevel(message: string): LogLevel {
    if (message.includes('❌')) return 'error';
    if (message.includes('⚠️') || message.includes('⏳')) return 'warn';
    if (message.includes('✅') || message.includes('🆕') || message.includes('🚀')) return 'success';
    return 'info';
}

/** Livello di ogni tipo di evento del diario — dichiarato, non dedotto (Fase 7). */
const EVENT_LEVELS: Record<ScanEventType, LogLevel> = {
    'engine-start': 'success',
    'engine-stop': 'info',
    'scan-start': 'info',
    'source-start': 'info',
    'item-found': 'success',
    'item-deferred': 'warn',
    'item-published': 'success',
    'scan-end': 'success',
    'next-scan': 'info',
};

function levelForEvent(event: ScanEvent): LogLevel {
    // Un giro chiuso senza pubblicare nulla è un esito normale, non un successo:
    // dipingerlo di verde direbbe che è successo qualcosa quando non è successo niente.
    if (event.type === 'scan-end' && !event.count) return 'info';
    return EVENT_LEVELS[event.type];
}

class Logger {
    private ipcBuffer: LogEntry[] = [];
    private logDir: string;
    private logFilePath: string;

    constructor() {
        this.logDir = path.join(app.getPath('userData'), 'logs');

        // Ensure logs directory exists
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }

        // Clean up old logs (> 7 days)
        this.cleanupOldLogs();

        // Set up current log file
        const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        this.logFilePath = path.join(this.logDir, `titan-${dateStr}.log`);

        // Set up IPC batching
        setInterval(() => this.flushIpcBuffer(), 300);
    }

    private cleanupOldLogs() {
        try {
            const files = fs.readdirSync(this.logDir);
            const now = Date.now();
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

            for (const file of files) {
                if (file.startsWith('titan-') && file.endsWith('.log')) {
                    const filePath = path.join(this.logDir, file);
                    const stats = fs.statSync(filePath);
                    if (now - stats.mtime.getTime() > sevenDaysMs) {
                        fs.unlinkSync(filePath);
                        console.log(`[Logger] Deleted old log file: ${file}`);
                    }
                }
            }
        } catch (error) {
            console.error('[Logger] Error cleaning up old logs:', error);
        }
    }

    private flushIpcBuffer() {
        if (this.ipcBuffer.length === 0) return;

        const messagesToSend = [...this.ipcBuffer];
        this.ipcBuffer = [];

        BrowserWindow.getAllWindows().forEach(win => {
            if (!win.isDestroyed()) {
                win.webContents.send('bot-logs-batch', messagesToSend);
            }
        });
    }

    /** Percorso del file di log della giornata — l'esportazione legge questo, non la memoria. */
    public getLogFilePath(): string {
        return this.logFilePath;
    }

    /**
     * @param meta o un evento strutturato, se la riga è una voce del diario di scansione,
     *             o un `LogLevel` dichiarato, per le righe di guasto che non hanno un
     *             evento ma non devono nemmeno essere indovinate da `detectLevel`.
     *             Il file su disco riceve comunque la riga di testo per intero: il diario
     *             dirada l'interfaccia, non la registrazione.
     */
    public async log(message: string, meta?: ScanEvent | LogLevel) {
        // Discriminazione per forma: il livello è una stringa, l'evento un oggetto.
        const event = typeof meta === 'object' ? meta : undefined;
        const declaredLevel = typeof meta === 'string' ? meta : undefined;
        const timestamp = new Date().toLocaleTimeString();
        const formattedMessage = `[${timestamp}] ${redactTokens(message)}`;

        // 1. Console log
        console.log(formattedMessage);

        // 2. File log (asynchronous append)
        try {
            await fs.promises.appendFile(this.logFilePath, formattedMessage + '\n');
        } catch (error) {
            console.error('[Logger] Failed to write to log file:', error);
        }

        // 3. IPC Buffer — strutturato con id + level (fix #22/#23) + evento (Fase 7)
        const entry: LogEntry = {
            id: ++_logId,
            level: event ? levelForEvent(event) : declaredLevel ?? detectLevel(message),
            message: formattedMessage,
            ...(event ? { event } : {}),
        };
        this.ipcBuffer.push(entry);
    }
}

export const TitanLogger = new Logger();
