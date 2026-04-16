import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { app } from 'electron';
import fs from 'fs';
import crypto from 'crypto';

const dbPath = join(app.getPath('userData'), 'titan.db');
const dbDir = dirname(dbPath);
const isNewInstall = !fs.existsSync(dbPath);

// Istanza DB lazily inizializzata dentro initDB() — fix #16
// Non viene più creata al momento dell'import del modulo.
let _db: Database.Database | null = null;

/**
 * Restituisce l'istanza del database inizializzata.
 * Lancia un errore se initDB() non è stata ancora chiamata.
 */
export function getDB(): Database.Database {
    if (!_db) throw new Error('Database not initialized. Call initDB() first.');
    return _db;
}

/**
 * Funzione per gestire le migrazioni legacy (pre-versione 1).
 * Queste migrazioni usavano blocchi try/catch per aggiungere colonne o modificare tabelle.
 */
function runLegacyMigrations(db: Database.Database) {
    console.log("Running legacy migrations (Version 0 -> 1 Transition)...");

    // Migration: Check if start_date exists (for v1.1.4 upgrade)
    try {
        const columns = db.pragma('table_info(bots)') as any[];
        const hasStartDate = columns.some(col => col.name === 'start_date');
        if (!hasStartDate) {
            console.log("Migration: Adding start_date column to bots table...");
            db.exec(`ALTER TABLE bots ADD COLUMN start_date DATETIME DEFAULT CURRENT_TIMESTAMP`);
        }
    } catch (e) {
        console.error("Migration Error (start_date):", e);
    }

    // Migration v1.1.0: Add check_interval column
    try {
        const columns = db.pragma('table_info(bots)') as any[];
        const hasCheckInterval = columns.some((col: any) => col.name === 'check_interval');
        if (!hasCheckInterval) {
            console.log("Migration v1.1.0: Adding check_interval column to bots table...");
            db.exec(`ALTER TABLE bots ADD COLUMN check_interval INTEGER DEFAULT 15`);
        }
    } catch (e) {
        console.error("Migration Error (check_interval):", e);
    }

    // Migration: Fix history table if it has single-column PRIMARY KEY (pre v1.4.1)
    try {
        const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='history'").get() as any;
        if (tableInfo && tableInfo.sql && !tableInfo.sql.includes('PRIMARY KEY (id, bot_id)')) {
            console.log('Migration: Upgrading history table to composite PRIMARY KEY (id, bot_id)...');
            db.exec(`
                BEGIN TRANSACTION;
                CREATE TABLE history_new (
                    id TEXT NOT NULL,
                    bot_id INTEGER NOT NULL,
                    feed_id INTEGER,
                    title TEXT,
                    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id, bot_id),
                    FOREIGN KEY(bot_id) REFERENCES bots(id) ON DELETE CASCADE
                );
                INSERT OR IGNORE INTO history_new SELECT id, bot_id, feed_id, title, sent_at FROM history;
                DROP TABLE history;
                ALTER TABLE history_new RENAME TO history;
                COMMIT;
            `);
        }
    } catch (e) {
        console.error('Migration Error (history):', e);
    }

    // Migration: Add 'youtube' to feeds type CHECK constraint
    try {
        const feedsInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='feeds'").get() as any;
        if (feedsInfo && feedsInfo.sql && !feedsInfo.sql.includes('youtube')) {
            console.log('Migration: Upgrading feeds table to support youtube type...');
            db.exec(`
                BEGIN TRANSACTION;
                CREATE TABLE feeds_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bot_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    url TEXT NOT NULL,
                    type TEXT CHECK(type IN ('podcast', 'news', 'youtube')) NOT NULL DEFAULT 'podcast',
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(bot_id) REFERENCES bots(id) ON DELETE CASCADE
                );
                INSERT INTO feeds_new SELECT * FROM feeds;
                DROP TABLE feeds;
                ALTER TABLE feeds_new RENAME TO feeds;
                COMMIT;
            `);
        }
    } catch (e) {
        console.error('Migration Error (feeds):', e);
    }
}

export function initDB() {
    // 1. Crea istanza DB — fix #16: non più a livello di modulo ma dentro initDB()
    _db = new Database(dbPath);
    const db = _db; // alias locale per non modificare il codice sottostante

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // 2. Schema Base Aggiornato (Stato dell'arte per nuove installazioni)
    db.exec(`
        CREATE TABLE IF NOT EXISTS bots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            token TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            check_interval INTEGER DEFAULT 15,
            send_from TEXT DEFAULT '00:00',
            send_until TEXT DEFAULT '23:59',
            template_podcast TEXT DEFAULT NULL,
            template_news TEXT DEFAULT NULL,
            template_youtube TEXT DEFAULT NULL,
            template_startup TEXT DEFAULT NULL,
            notifications_enabled BOOLEAN DEFAULT 1,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS feeds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bot_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            type TEXT CHECK(type IN ('podcast', 'news', 'youtube')) NOT NULL DEFAULT 'podcast',
            is_active BOOLEAN DEFAULT 1,
            keyword_filter TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(bot_id) REFERENCES bots(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS history (
            id TEXT NOT NULL,
            bot_id INTEGER NOT NULL,
            feed_id INTEGER,
            title TEXT,
            title_hash TEXT,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id, bot_id),
            FOREIGN KEY(bot_id) REFERENCES bots(id) ON DELETE CASCADE
        );
    `);

    // Indici base su history (senza title_hash — quella colonna potrebbe non esistere ancora su DB vecchi)
    // idx_history_title_dedup viene creato nella migration v7 e nel safety check post-migration.
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_history_bot_id ON history(bot_id);
        CREATE INDEX IF NOT EXISTS idx_history_bot_id_sent_at ON history(bot_id, sent_at);
    `);

    // 3. Sistema di Versionamento Deterministic
    if (isNewInstall) {
        // È un'installazione pulita. Lo schema è già alla versione massima.
        db.pragma('user_version = 8');
        console.log("Nuova installazione rilevata. Database inizializzato alla v8.");
        console.log('Database initialized at:', dbPath);
        return db;
    }

    // È un database esistente: leggiamo la versione corrente
    let currentVersion = db.pragma('user_version', { simple: true }) as number;

    // 4. Backup automatico SOLO se servono migrazioni — fix #20
    // Cattura lo stato pre-migrazione per consentire il ripristino in caso di errore.
    // Su DB già alla versione corrente (nessuna migrazione), nessun backup viene creato.
    if (currentVersion < 8) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = `${dbPath}.backup-${timestamp}`;
            fs.copyFileSync(dbPath, backupPath);
            console.log(`Backup pre-migrazione creato: ${backupPath}`);

            // Rotazione: mantieni solo gli ultimi 3 backup
            const files = fs.readdirSync(dbDir);
            const backups = files
                .filter(f => f.startsWith('titan.db.backup-'))
                .map(f => ({ name: f, time: fs.statSync(join(dbDir, f)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time);

            if (backups.length > 3) {
                backups.slice(3).forEach(b => {
                    fs.unlinkSync(join(dbDir, b.name));
                    console.log(`Vecchio backup rimosso: ${b.name}`);
                });
            }
        } catch (e) {
            console.error("Errore durante la gestione dei backup:", e);
        }
    }

    // 5. Migrazioni sequenziali
    if (currentVersion === 0) {
            runLegacyMigrations(db);
            db.pragma('user_version = 1');
            currentVersion = 1;
            console.log("Database version set to 1");
        }

    if (currentVersion < 2) {
        console.log("Migration: Adding notifications_enabled column...");
        try { db.exec(`ALTER TABLE bots ADD COLUMN notifications_enabled BOOLEAN DEFAULT 1`); } catch (e) { }
        db.pragma('user_version = 2');
        currentVersion = 2;
        console.log("Database version set to 2");
    }

    if (currentVersion < 3) {
        console.log("Migration: Adding quiet hours columns...");
        try {
            db.exec(`ALTER TABLE bots ADD COLUMN send_from TEXT DEFAULT '00:00'`);
            db.exec(`ALTER TABLE bots ADD COLUMN send_until TEXT DEFAULT '23:59'`);
        } catch (e) { }
        db.pragma('user_version = 3');
        currentVersion = 3;
        console.log("Database version set to 3");
    }

    if (currentVersion < 4) {
        console.log("Migration: Adding template columns...");
        try {
            db.exec(`ALTER TABLE bots ADD COLUMN template_podcast TEXT DEFAULT NULL`);
            db.exec(`ALTER TABLE bots ADD COLUMN template_news TEXT DEFAULT NULL`);
            db.exec(`ALTER TABLE bots ADD COLUMN template_youtube TEXT DEFAULT NULL`);
        } catch (e) { }
        db.pragma('user_version = 4');
        currentVersion = 4;
        console.log("Database version set to 4");
    }

    if (currentVersion < 5) {
        console.log("Migration: Adding startup template column...");
        try { db.exec(`ALTER TABLE bots ADD COLUMN template_startup TEXT DEFAULT NULL`); } catch (e) { }
        db.pragma('user_version = 5');
        currentVersion = 5;
        console.log("Database version set to 5");
    }

    if (currentVersion < 6) {
        console.log("Migration: Adding indexes on history table...");
        try {
            db.exec(`CREATE INDEX IF NOT EXISTS idx_history_bot_id ON history(bot_id)`);
            db.exec(`CREATE INDEX IF NOT EXISTS idx_history_bot_id_sent_at ON history(bot_id, sent_at)`);
        } catch (e) { }
        db.pragma('user_version = 6');
        currentVersion = 6;
        console.log("Database version set to 6");
    }

    if (currentVersion < 7) {
        console.log("Migration v7: Adding title_hash column for anti-spam deduplication...");
        // 1. Aggiungi la colonna (idempotente con try/catch)
        try { db.exec(`ALTER TABLE history ADD COLUMN title_hash TEXT`); } catch (e) { }

        // 2. Backfill: calcola MD5(lower(trim(title))) per tutte le righe esistenti in JS
        //    (SQLite non ha MD5 nativo)
        try {
            const rows = db.prepare('SELECT rowid, title FROM history WHERE title_hash IS NULL AND title IS NOT NULL').all() as any[];
            const updateStmt = db.prepare('UPDATE history SET title_hash = ? WHERE rowid = ?');
            const backfill = db.transaction(() => {
                for (const row of rows) {
                    if (row.title && row.title.trim()) {
                        const hash = crypto.createHash('md5').update(row.title.toLowerCase().trim()).digest('hex');
                        updateStmt.run(hash, row.rowid);
                    }
                }
            });
            backfill();
            console.log(`Migration v7: Backfilled title_hash for ${rows.length} history rows.`);
        } catch (e) {
            console.error("Migration v7: Errore nel backfill title_hash:", e);
        }

        // 3. Indice composito per il doppio-check anti-spam
        try {
            db.exec(`CREATE INDEX IF NOT EXISTS idx_history_title_dedup ON history(bot_id, feed_id, title_hash)`);
        } catch (e) { }

        db.pragma('user_version = 7');
        currentVersion = 7;
        console.log("Database version set to 7");
    }

    if (currentVersion < 8) {
        console.log("Migration v8: Adding keyword_filter column to feeds table (F4)...");
        try { db.exec(`ALTER TABLE feeds ADD COLUMN keyword_filter TEXT DEFAULT NULL`); } catch (e) { }
        db.pragma('user_version = 8');
        currentVersion = 8;
        console.log("Database version set to 8");
    }

    // Safety check post-migration: verifica fisicamente l'esistenza delle colonne critiche.
    // Difende da stati corrotti dove user_version è avanzato ma ALTER TABLE è fallito silenziosamente.
    try {
        const histCols = db.pragma('table_info(history)') as any[];
        if (!histCols.some((c: any) => c.name === 'title_hash')) {
            console.warn('Safety fix: title_hash mancante dalla tabella history — aggiunto retroattivamente.');
            db.exec(`ALTER TABLE history ADD COLUMN title_hash TEXT`);
            db.exec(`CREATE INDEX IF NOT EXISTS idx_history_title_dedup ON history(bot_id, feed_id, title_hash)`);
        }
    } catch (e) {
        console.error('Safety check title_hash fallito:', e);
    }

    try {
        const feedCols = db.pragma('table_info(feeds)') as any[];
        if (!feedCols.some((c: any) => c.name === 'keyword_filter')) {
            console.warn('Safety fix: keyword_filter mancante dalla tabella feeds — aggiunto retroattivamente.');
            db.exec(`ALTER TABLE feeds ADD COLUMN keyword_filter TEXT DEFAULT NULL`);
        }
    } catch (e) {
        console.error('Safety check keyword_filter fallito:', e);
    }

    console.log('Database initialized at:', dbPath);
    return db;
}
