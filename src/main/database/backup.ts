/**
 * Backup automatici del database.
 *
 * Fino alla 2.4 l'unico backup automatico era quello prima di una migrazione dello schema:
 * un disco che si rovina, un database danneggiato o un import sbagliato si portavano via
 * bot, sorgenti e storico. Ora Titan tiene una copia al giorno, le ultime sette, più una
 * copia del database attuale prima di ogni importazione.
 *
 * Le copie si fanno con l'API di backup di SQLite, non copiando il file: con il WAL attivo
 * il file `titan.db` da solo può non contenere le ultime scritture.
 */
import { app } from 'electron';
import { join } from 'node:path';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { rename } from 'node:fs/promises';
import { getDB } from './schema';

export const DAILY_BACKUPS_KEPT = 7;
const BEFORE_IMPORT_KEPT = 3;
const DAILY = /^titan-\d{4}-\d{2}-\d{2}\.db$/;
const BEFORE_IMPORT = /^titan-before-import-[\dT-]+\.db$/;

export function backupDir(): string {
    return join(app.getPath('userData'), 'backups');
}

/** Data locale «AAAA-MM-GG»: il backup è quello della giornata di chi usa Titan. */
function localDateStamp(d = new Date()): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Tiene gli ultimi `keep` file che rispettano `pattern`; il nome ordina per data. */
export function pruneBackups(dir: string, pattern: RegExp, keep: number): string[] {
    const files = readdirSync(dir).filter(f => pattern.test(f)).sort();
    const removed = files.slice(0, Math.max(0, files.length - keep));
    for (const f of removed) rmSync(join(dir, f), { force: true });
    return removed;
}

/** Copia consistente del database aperto in `target`, passando da un file temporaneo. */
async function backupTo(target: string): Promise<void> {
    const temp = `${target}.part`;
    rmSync(temp, { force: true });
    await getDB().backup(temp);
    await rename(temp, target);
}

/** Il backup di oggi, se non c'è ancora. Restituisce il file creato, o `null`. */
export async function ensureDailyBackup(dir = backupDir()): Promise<string | null> {
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `titan-${localDateStamp()}.db`);
    if (existsSync(file)) return null;
    await backupTo(file);
    pruneBackups(dir, DAILY, DAILY_BACKUPS_KEPT);
    return file;
}

/** Copia del database attuale prima che un'importazione lo sostituisca. */
export async function backupBeforeImport(dir = backupDir()): Promise<string> {
    mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace('Z', '');
    const file = join(dir, `titan-before-import-${stamp}.db`);
    await backupTo(file);
    pruneBackups(dir, BEFORE_IMPORT, BEFORE_IMPORT_KEPT);
    return file;
}

/**
 * Backup quotidiano: un minuto dopo l'avvio (non nel pieno della partenza) e poi un
 * controllo ogni ora, perché Titan resta acceso per giorni e la data cambia.
 */
export function scheduleDailyBackups(log: (message: string, level?: 'warn' | 'error') => void) {
    const run = () => {
        ensureDailyBackup()
            .then(file => {
                if (file) log(`🗄️ Backup quotidiano del database salvato (${file.split(/[\\/]/).pop()}); Titan tiene gli ultimi ${DAILY_BACKUPS_KEPT}.`);
            })
            .catch(e => log(`❌ Backup quotidiano del database non riuscito: ${e}`, 'error'));
    };
    setTimeout(run, 60_000);
    setInterval(run, 60 * 60 * 1000);
}
