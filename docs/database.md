# Database

Titan usa **SQLite** tramite `better-sqlite3`, in modalità WAL, con un solo file per profilo utente. Tutto l'accesso passa da `src/main/database/schema.ts` (istanza e migrazioni) e `src/main/bot/manager.ts` (query).

## Dove vivono i file

Il percorso deriva da `productName` in `electron-builder.yml`, trasformato in kebab-case da Electron:

| Sistema | Cartella |
| :--- | :--- |
| Windows | `%APPDATA%\runtime-telegram-bot-titan-edition\` |
| Linux | `~/.config/runtime-telegram-bot-titan-edition/` |

In sviluppo (`npm run dev`) la cartella è invece `titan-desktop`.

Contenuto:

| File | Cosa contiene |
| :--- | :--- |
| `titan.db` | Il database. Con `-wal` e `-shm` accanto mentre l'applicazione gira. |
| `titan.db.backup-<timestamp>` | Copie automatiche pre-migrazione, ne vengono conservate le ultime 3. |
| `.machine-key` | Chiave AES-256 (permessi `0600`), presente solo dove `safeStorage` non è disponibile. |
| `titan-settings.json` | Performance Mode e ultima versione vista (per la schermata «Novità»). |
| `logs/titan-YYYY-MM-DD.log` | Log giornalieri, cancellati automaticamente dopo 7 giorni. |

> **Attenzione:** cambiare `productName` sposta questa cartella e fa perdere agli utenti esistenti bot, feed, storico e token. Vedi [CONTRIBUTING.md](../CONTRIBUTING.md).

## Tabelle (schema v12)

### `bots`
Un record per bot Telegram. `token` è **cifrato** (`ss:` safeStorage oppure `mk:` AES-256-GCM — vedi `src/main/crypto.ts`); `start_date` è la data di cutoff oltre la quale i contenuti vengono pubblicati; `send_from`/`send_until` delimitano le quiet hours; le quattro colonne `template_*` contengono i modelli di messaggio in HTML Telegram.

### `feeds`
Sorgenti associate a un bot (`ON DELETE CASCADE`). `type` è vincolata a `podcast | news | youtube`. `keyword_filter` è una stringa JSON `{include:[], exclude:[]}`. `check_interval` sovrascrive l'intervallo del bot per il singolo feed; `last_fetch_at` regola lo scheduler. `digest_interval` e `digest_last_sent` governano la modalità digest.

### `history`
Chiave primaria composta `(id, bot_id)` dove `id` è l'MD5 del link. È il registro anti-duplicati.

`title_hash` (MD5 del titolo normalizzato) è la rete di sicurezza per quando il publisher cambia l'URL mantenendo il titolo. `content_type` (`rss` | `youtube`) restringe quel controllo al tipo di contenuto: senza, un video YouTube impedirebbe la pubblicazione di un articolo omonimo — è successo davvero, ed è la ragione della migrazione v12.

La tabella è potata a ogni avvio a **20.000 righe per bot**, un tetto enormemente superiore a qualsiasi finestra di feed reale.

### `pending_queue`
Coda persistente delle quiet hours. Gli item trovati durante la fascia di silenzio finiscono qui su disco, non in memoria: un riavvio nel cuore della notte non li perde. `UNIQUE(bot_id, item_id)`.

### `digest_queue`
Buffer dei feed in modalità digest, svuotato dopo l'invio del messaggio riepilogativo. `UNIQUE(bot_id, feed_id, item_id)`.

### Indici
`idx_history_bot_id`, `idx_history_bot_id_sent_at`, e `idx_history_title_dedup` su `(bot_id, title_hash, content_type)`.

## Migrazioni

Il versionamento usa `PRAGMA user_version`. Una nuova installazione crea direttamente lo schema completo e imposta `user_version = 12` senza passare dalle migrazioni.

| Versione | Cosa introduce |
| :---: | :--- |
| 1 | Migrazioni legacy pre-versionamento: `start_date`, `check_interval`, chiave primaria composta su `history`, tipo `youtube` sui feed |
| 2 | `bots.notifications_enabled` |
| 3 | `bots.send_from`, `bots.send_until` — quiet hours |
| 4 | `bots.template_podcast`, `template_news`, `template_youtube` |
| 5 | `bots.template_startup` |
| 6 | Indici su `history` |
| 7 | `history.title_hash` + backfill in JS (SQLite non ha MD5 nativo) |
| 8 | `feeds.keyword_filter` |
| 9 | `feeds.check_interval`, `feeds.last_fetch_at` |
| 10 | `feeds.digest_interval`, `digest_last_sent`, tabella `digest_queue` |
| 11 | Tabella `pending_queue` |
| 12 | `history.content_type` + backfill, indice di dedup ricostruito (IronShield v2) |

### Regole
1. **Si aggiunge solo in coda.** Non riordinare né rinumerare i blocchi esistenti: girano su database con anni di storico.
2. **Backup automatico** prima di qualsiasi migrazione (solo se ce n'è davvero una da applicare), con rotazione a 3 copie.
3. **Safety check post-migrazione.** Dopo la catena, il codice verifica *fisicamente* con `PRAGMA table_info` che le colonne critiche esistano e le aggiunge se mancano. Difende dallo stato corrotto in cui `user_version` è avanzato ma un `ALTER TABLE` è fallito in silenzio.
4. **Le migrazioni legacy non sono transazionali**, per statement. È una scelta consapevole: il safety check è la rete, e riscriverle su codice che funziona è più rischioso del problema che risolverebbe.
5. **Provare sempre su una copia** di un `titan.db` reale, mai direttamente sul proprio.

## Chiusura

`closeDB()` esegue `wal_checkpoint(TRUNCATE)` prima di chiudere, così che tutto confluisca in `titan.db` e il file `-wal` non cresca tra un avvio e l'altro. È chiamata da `app.on('before-quit')`. I percorsi che usano `app.exit()` — eccezione fatale, importazione di un database — non passano da lì: nel primo caso lo stato è già compromesso, nel secondo la chiusura è già stata fatta a mano.
