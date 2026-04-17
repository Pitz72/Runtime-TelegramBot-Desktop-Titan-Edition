# Changelog v1.9.0

**Data:** 17 Aprile 2026  
**Branch:** main  
**Tag:** v1.9.0

---

## Feature F6 — Statistiche/Analytics Dettagliate per Feed

### Descrizione

Nuova modale `StatsModal.tsx` accessibile cliccando sull'icona BarChart nella dashboard. Mostra statistiche aggregate e per-feed per il bot selezionato.

### Implementazione

**Backend (`src/main/bot/manager.ts`)**
- Nuovo metodo `getDetailedStats(botId)`: conta item pubblicati per feed con breakdown oggi/7 giorni/totale
- Query SQL con aggregazione per `feed_id` e `sent_at` timestamp

**IPC (`src/main/ipc.ts` + `src/preload/index.ts`)**
- Nuovo handler `get-detailed-stats` → `BotManager.getDetailedStats()`
- Esposto come `window.api.getDetailedStats(botId)` nel preload

**UI (`src/renderer/src/components/StatsModal.tsx`)**
- 3 contatori globali: oggi / 7 giorni / totale
- Lista feed ordinata per volume (decrescente)
- Barra progress proporzionale per ogni feed
- Accessibile da click sull'icona ChartBar in Dashboard

**Localizzazione:** 8 lingue complete

---

## Feature F7 — Preview Template Inline

### Descrizione

Bottone "Anteprima" nel `TemplateEditor` per visualizzare il rendering del template con dati campione prima di salvare.

### Implementazione

**UI (`src/renderer/src/components/TemplateEditor.tsx`)**
- Bottone toggle Eye/EyeSlash visibile solo se il template non è vuoto
- Funzione `renderPreview()`: sostituisce `{{title}}`, `{{feedName}}`, `{{link}}`, `{{summary}}` con dati campione localizzati
- Panel preview con `white-space: pre-wrap` per rispettare i newline
- Supporta `&#10;` → `\n` per i template con a-capo

**Localizzazione:** chiavi `templateEditor.sampleTitle/sampleFeed/sampleSummary` in 8 lingue

---

## Feature F8 — Import OPML

### Descrizione

Importazione massiva di feed da file OPML standard (usato da Feedly, Pocket Casts, ecc.). Accessibile dal pulsante OPML in `FeedManager`.

### Implementazione

**Backend (`src/main/ipc.ts`)**
- Handler IPC `import-opml(botId)`: apre dialog file `.opml/.xml`, legge il file, estrae `<outline xmlUrl="...">` con regex
- Validazione anti-SSRF su ogni URL prima dell'inserimento (riusa `validateFeedUrl`)
- Inserimento transazionale: ogni feed valido viene aggiunto con tipo `news`, feed già esistenti vengono saltati
- Ritorna `{ success, imported, skipped, errors }`

**Preload/API:** `window.api.importOpml(botId)`

**UI (`src/renderer/src/components/FeedManager.tsx`)**
- Pulsante "OPML" nell'header del FeedManager
- Toast con conteggio feed importati/saltati

**Localizzazione:** 8 lingue complete

---

## Feature F9 — Digest Mode

### Descrizione

Modalità di pubblicazione alternativa per i feed: invece di inviare ogni item singolarmente, raccoglie gli item in una coda e li invia come messaggio riassuntivo a intervalli configurabili.

### Schema Database (v10)

**Modifiche alla tabella `feeds`:**
```sql
ALTER TABLE feeds ADD COLUMN digest_interval INTEGER DEFAULT NULL;
ALTER TABLE feeds ADD COLUMN digest_last_sent DATETIME DEFAULT NULL;
```

**Nuova tabella `digest_queue`:**
```sql
CREATE TABLE digest_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bot_id INTEGER NOT NULL,
    feed_id INTEGER NOT NULL,
    item_title TEXT NOT NULL,
    item_link TEXT NOT NULL,
    item_summary TEXT,
    queued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bot_id, feed_id, item_link)
);
```

Migration automatica v9→v10 con safety check post-migration.

### Logica Engine (`src/main/bot/engine.ts`)

- In `processFeed()`: se `feed.digest_interval` è impostato, gli item vengono inseriti in `digest_queue` con `markProcessed()` invece di `publishQueue`
- Nuovo metodo `processDigests()` chiamato alla fine di ogni `checkLoop()`: controlla i feed con digest scaduto (`digest_last_sent + digest_interval < now`), compone il messaggio digest (header + lista numerata max 20 item), invia via Telegram, aggiorna `digest_last_sent`, svuota la coda

### UI (`src/renderer/src/components/FeedManager.tsx`)

- Select preset per `digest_interval`: Disabilitato / 1h / 6h / 12h / 24h / 7 giorni
- Badge viola con intervallo se digest attivo
- Incluso in export/import `.rtb`

**Localizzazione:** 8 lingue complete

---

## Note tecniche

- Schema DB: v9 → v10 (migration automatica, backup condizionale)
- Nessuna dipendenza esterna aggiunta
- TypeScript: zero errori
- Build: `Runtime Telegram Bot Titan Edition Setup 1.9.0.exe`
