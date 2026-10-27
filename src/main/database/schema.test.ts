/**
 * Migrazione v13 → v14 su un database costruito come quello della 2.4.1, in una cartella
 * temporanea. Verifica che le colonne nuove arrivino, che i dati restino e che il backup
 * pre-migrazione venga creato.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';

const dir = vi.hoisted(() => ({ path: '' }));
vi.mock('electron', () => ({ app: { getPath: () => dir.path } }));

import { closeDB, getDB, initDB } from './schema';

beforeAll(() => {
    dir.path = mkdtempSync(join(tmpdir(), 'titan-schema-test-'));
    const old = new Database(join(dir.path, 'titan.db'));
    old.exec(`
        CREATE TABLE bots (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, token TEXT NOT NULL, channel_id TEXT NOT NULL,
            start_date DATETIME DEFAULT CURRENT_TIMESTAMP, check_interval INTEGER DEFAULT 15, send_from TEXT DEFAULT '00:00',
            send_until TEXT DEFAULT '23:59', template_podcast TEXT, template_news TEXT, template_youtube TEXT, template_startup TEXT,
            notifications_enabled BOOLEAN DEFAULT 1, is_active BOOLEAN DEFAULT 1, silent_start BOOLEAN DEFAULT 0,
            mute_mode TEXT DEFAULT 'off', mute_from TEXT DEFAULT '22:00', mute_until TEXT DEFAULT '07:00', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE feeds (id INTEGER PRIMARY KEY AUTOINCREMENT, bot_id INTEGER NOT NULL, name TEXT NOT NULL, url TEXT NOT NULL,
            type TEXT CHECK(type IN ('podcast', 'news', 'youtube')) NOT NULL DEFAULT 'podcast', is_active BOOLEAN DEFAULT 1,
            keyword_filter TEXT, check_interval INTEGER, last_fetch_at DATETIME, digest_interval INTEGER, digest_last_sent DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(bot_id) REFERENCES bots(id) ON DELETE CASCADE);
        CREATE TABLE history (id TEXT NOT NULL, bot_id INTEGER NOT NULL, feed_id INTEGER, title TEXT, title_hash TEXT,
            content_type TEXT NOT NULL DEFAULT 'rss', sent_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id, bot_id));
        INSERT INTO bots (name, token, channel_id) VALUES ('Radio', 'x', '@radio');
        INSERT INTO feeds (bot_id, name, url, type) VALUES (1, 'Notizie', 'https://example.org/f.xml', 'news');
        PRAGMA user_version = 13;
    `);
    old.close();
    initDB();
});

afterAll(() => {
    closeDB();
    rmSync(dir.path, { recursive: true, force: true });
});

const columns = (table: string) => (getDB().pragma(`table_info(${table})`) as Array<{ name: string }>).map(c => c.name);

describe('migrazione alla v14', () => {
    it('porta lo schema alla v14 con le colonne nuove', () => {
        expect(getDB().pragma('user_version', { simple: true })).toBe(14);
        expect(columns('bots')).toContain('topic_id');
        expect(columns('feeds')).toEqual(expect.arrayContaining(['last_status', 'last_error', 'last_checked_at', 'last_item_count']));
    });

    it('i dati della 2.4.1 restano dove erano', () => {
        expect(getDB().prepare('SELECT name, topic_id FROM bots').get()).toEqual({ name: 'Radio', topic_id: null });
        expect((getDB().prepare('SELECT name FROM feeds').get() as any).name).toBe('Notizie');
    });

    it('prima di migrare salva una copia del database', () => {
        expect(readdirSync(dir.path).some(f => f.startsWith('titan.db.backup-'))).toBe(true);
    });
});
