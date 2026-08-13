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
 * Rileva il livello semantico di un messaggio dagli emoji/keyword — fix #23.
 * Ordine: error > warn > success > info.
 *
 * Resta la via di ripiego per le decine di righe che il motore emette senza evento
 * strutturato (errori, avvisi, diagnostica). Le righe con un `ScanEvent` non passano
 * di qui: il loro livello è dichiarato, non indovinato — Fase 7.
 */
function detectLevel(message: string): LogLevel {
    if (message.includes('❌') || message.includes('Error') || message.includes('Fallito') || message.includes('error')) return 'error';
    if (message.includes('⚠️') || message.includes('SKIP') || message.includes('⏳')) return 'warn';
    if (message.includes('✅') || message.includes('🆕') || message.includes('🚀') || message.includes('Found New Item')) return 'success';
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
     * @param event evento strutturato, se la riga è una voce del diario di scansione.
     *              Il file su disco riceve comunque la riga di testo per intero: il diario
     *              dirada l'interfaccia, non la registrazione.
     */
    public async log(message: string, event?: ScanEvent) {
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
            level: event ? levelForEvent(event) : detectLevel(message),
            message: formattedMessage,
            ...(event ? { event } : {}),
        };
        this.ipcBuffer.push(entry);
    }
}

export const TitanLogger = new Logger();
