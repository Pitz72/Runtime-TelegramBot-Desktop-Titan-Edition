# IronShield v2 — Content-Type Scoped Title Deduplication

**Stato:** Da implementare  
**Priorità:** Media (edge case reale, workaround manuale possibile)  
**Versione target:** v2.1.0  
**Schema DB target:** v12

---

## Il problema

IronShield (v1.10.5) deduplicazione per `title_hash` è **globale per bot**, senza distinzione di tipo di contenuto. Se un feed YouTube pubblica un video intitolato "Casa", nessun altro feed dello stesso bot (podcast, articolo, newsletter) può mai pubblicare qualcosa con lo stesso titolo: viene silenziosamente bloccato come duplicato.

### Caso reale che ha innescato questo documento

Il 28 aprile 2026 il canale YouTube Runtime Radio ha pubblicato un video intitolato **"Runtime TelegramBot Titan Edition"**. Titan lo ha pubblicato correttamente su Telegram. Il giorno dopo, il sito simonepizzi.runtimeradio.it ha pubblicato un articolo con lo **stesso identico titolo**. Titan lo ha bloccato perché il `title_hash` era già in `history`. L'articolo non è mai apparso su Telegram.

### Perché IronShield usa title_hash globale

La scelta era motivata: YouTube può restituire lo stesso video con URL diverse tra sessioni (link normalizzato vs `/shorts/` vs parametri query), quindi il check sull'ID (MD5 del link) non era sufficiente. Il `title_hash` globale per bot garantisce che lo stesso video non venga inviato due volte anche se il link cambia.

---

## La soluzione

Aggiungere una dimensione **`content_type`** alla deduplicazione per `title_hash`. Due item con lo stesso titolo si bloccano a vicenda **solo se provengono dallo stesso tipo di sorgente**.

| Tipo A        | Tipo B        | Stesso titolo → blocco? |
|---------------|---------------|-------------------------|
| youtube       | youtube       | ✅ Sì (comportamento attuale, corretto) |
| rss           | rss           | ✅ Sì (podcast in due aggregatori) |
| youtube       | rss           | ❌ No (video + articolo) |
| rss           | youtube       | ❌ No (articolo + video) |

Il check sull'**ID (MD5 del link)** rimane invariato e globale: se due feed diversi producono lo stesso link, è sempre un duplicato a prescindere dal tipo.

---

## Classificazione dei feed

Il `content_type` si deriva deterministicamente dall'URL del feed al momento della creazione/aggiornamento. Non serve input manuale.

```typescript
function getFeedContentType(url: string): 'youtube' | 'rss' {
  return url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube' : 'rss';
}
```

---

## Modifiche al DB — Schema v12

### 1. Tabella `feeds`

```sql
ALTER TABLE feeds ADD COLUMN content_type TEXT NOT NULL DEFAULT 'rss';
```

Backfill automatico in migrazione:
```sql
UPDATE feeds SET content_type = 'youtube'
WHERE url LIKE '%youtube.com%' OR url LIKE '%youtu.be%';
```

### 2. Tabella `history`

```sql
ALTER TABLE history ADD COLUMN content_type TEXT NOT NULL DEFAULT 'rss';
```

Backfill: per ogni riga esistente, join con `feeds` per ricavare il `content_type` dalla URL del feed originario. Per le righe orfane (feed eliminato), lasciare `'rss'` (safe default).

```sql
UPDATE history SET content_type = 'youtube'
WHERE feed_id IN (
  SELECT id FROM feeds WHERE url LIKE '%youtube.com%' OR url LIKE '%youtu.be%'
);
```

### 3. Indice aggiornato

Rimpiazzare `idx_history_title_dedup`:
```sql
DROP INDEX IF EXISTS idx_history_title_dedup;
CREATE INDEX idx_history_title_dedup ON history(bot_id, title_hash, content_type);
```

---

## Modifiche al codice

### `src/main/database/schema.ts`

- Incrementare `SCHEMA_VERSION` a 12.
- Aggiungere migration v12 con le tre SQL sopra (ALTER + backfill feeds + backfill history + drop/create index).
- Nella definizione `CREATE TABLE history` (fresh install), aggiungere `content_type TEXT NOT NULL DEFAULT 'rss'`.
- Nella definizione `CREATE TABLE feeds` (fresh install), aggiungere `content_type TEXT NOT NULL DEFAULT 'rss'`.
- Nel safety check finale, verificare presenza di `content_type` in entrambe le tabelle.

### `src/main/bot/manager.ts`

**`isProcessed()`** — aggiungere il parametro `contentType`:

```typescript
static isProcessed(
  botId: number,
  itemId: string,
  feedId?: number,
  title?: string,
  contentType: 'youtube' | 'rss' = 'rss'
): boolean {
  // Check 1: ID — globale, invariato
  const byId = db().prepare(
    'SELECT id FROM history WHERE bot_id = ? AND id = ?'
  ).get(botId, itemId);
  if (byId) return true;

  // Check 2: title_hash — scoped al content_type
  if (title && title.trim()) {
    const titleHash = nodeCrypto.createHash('md5')
      .update(title.toLowerCase().trim()).digest('hex');
    const byTitle = db().prepare(
      'SELECT id FROM history WHERE bot_id = ? AND title_hash = ? AND content_type = ?'
    ).get(botId, titleHash, contentType);
    if (byTitle) return true;
  }

  return false;
}
```

**`markProcessed()`** — aggiungere `contentType`:

```typescript
static markProcessed(
  botId: number,
  feedId: number,
  itemId: string,
  title: string,
  contentType: 'youtube' | 'rss' = 'rss'
) {
  const titleHash = title && title.trim()
    ? nodeCrypto.createHash('md5').update(title.toLowerCase().trim()).digest('hex')
    : null;
  db().prepare(
    'INSERT OR IGNORE INTO history (id, bot_id, feed_id, title, title_hash, content_type) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(itemId, botId, feedId, title, titleHash, contentType);
}
```

### `src/main/bot/engine.ts`

Nei punti dove vengono chiamati `isProcessed()` e `markProcessed()`, passare il `content_type` del feed corrente. Il feed è già disponibile nel contesto del loop (`feed.content_type` dopo che la colonna è presente).

Tutti i siti di chiamata da aggiornare:
- Riga 291: `BotManager.isProcessed(bot.id, item.id, feed.id, item.title, feed.content_type)`
- Riga 305: `BotManager.markProcessed(bot.id, feed.id, item.id, item.title, feed.content_type)`
- Riga 372: `BotManager.isProcessed(bot.id, p.item_id, p.feed_id, p.item_title ?? undefined, feed?.content_type ?? 'rss')`
- Riga 430: `BotManager.markProcessed(bot.id, feed.id, item.id, item.title, feed.content_type)`
- Riga 447: `BotManager.markProcessed(bot.id, feed.id, item.id, item.title, feed.content_type)`

### `src/main/ipc.ts` / `src/main/bot/manager.ts` — aggiunta feed

Nel handler IPC `add-feed` (e nel BotManager, se il feed viene aggiunto lì), derivare e salvare `content_type` automaticamente al momento dell'inserimento:

```typescript
const contentType = url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube' : 'rss';
// includere content_type nell'INSERT INTO feeds
```

---

## Garanzie di IronShield v1 mantenute

| Scenario | v1 | v2 |
|---|---|---|
| Stesso video YouTube in 2 feed YouTube diversi | ✅ Bloccato | ✅ Bloccato |
| Stesso link in 2 feed qualsiasi | ✅ Bloccato | ✅ Bloccato |
| Stesso podcast in 2 RSS diversi (stessa URL) | ✅ Bloccato | ✅ Bloccato |
| Stesso titolo su YouTube e su un articolo RSS | ❌ Bloccato (falso positivo) | ✅ Entrambi pubblicati |

---

## Edge case e rischi

**Podcast video su YouTube + episodio in RSS con stesso titolo**  
→ Con v2 vengono pubblicati entrambi. Accettabile: sono genuinamente contenuti diversi (video vs audio), e la stessa logica umana li distingue.

**Feed YouTube che cambia URL** (scenario che ha motivato IronShield originariamente)  
→ Il `content_type = 'youtube'` è lo stesso, il `title_hash` è lo stesso → ancora bloccato correttamente.

**Feed esistenti al momento della migrazione**  
→ Il backfill assegna `content_type` in base all'URL corrente del feed. I feed YouTube vengono marcati `'youtube'`, tutto il resto `'rss'`. Nessuna azione manuale richiesta.

**Feed eliminato: history orfana**  
→ Le righe in history senza feed_id corrispondente hanno già `content_type = 'rss'` come default di migrazione. Non interferiscono con la nuova logica.

---

## Versioning e note di rilascio

- **Schema:** v11 → v12
- **Versione software:** v2.1.0
- **Breaking change:** No — retrocompatibile. Feed esistenti ricevono `content_type` automaticamente in migrazione.
- **Note changelog:** "IronShield v2 — la deduplicazione per titolo ora distingue tra feed YouTube e feed RSS. Video e articoli con lo stesso nome non si bloccano più a vicenda."
