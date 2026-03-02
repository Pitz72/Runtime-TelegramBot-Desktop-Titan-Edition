import fs from 'fs';
import path from 'path';
import { app, BrowserWindow } from 'electron';

class Logger {
    private ipcBuffer: string[] = [];
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

    public async log(message: string) {
        const timestamp = new Date().toLocaleTimeString();
        const formattedMessage = `[${timestamp}] ${message}`;

        // 1. Console log
        console.log(formattedMessage);

        // 2. File log (asynchronous append)
        try {
            await fs.promises.appendFile(this.logFilePath, formattedMessage + '\n');
        } catch (error) {
            console.error('[Logger] Failed to write to log file:', error);
        }

        // 3. IPC Buffer (with timestamp)
        this.ipcBuffer.push(formattedMessage);
    }
}

export const TitanLogger = new Logger();
