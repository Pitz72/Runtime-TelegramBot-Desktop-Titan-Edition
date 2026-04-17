# Changelog v1.8.8

**Data:** 17 Aprile 2026  
**Branch:** main  
**Tag:** v1.8.8

---

## Feature F4 — Filtro Keyword sui Feed

### Descrizione

Ogni feed può ora avere un filtro keyword indipendente. Il filtro viene applicato dal motore prima di accodare l'item per l'invio: se l'item non supera il filtro viene scartato silenziosamente senza toccare la history.

### Logica del filtro

Due liste configurabili, separate da virgola:

| Lista | Comportamento |
|-------|---------------|
| **Include** | L'item viene accodato **solo se** il testo (titolo + sommario) contiene **almeno una** delle keyword |
| **Exclude** | L'item viene **scartato** se il testo contiene **qualsiasi** keyword della lista |

- Il confronto è **case-insensitive**.
- Le due liste sono indipendenti: si possono usare insieme o separatamente.
- Liste vuote = nessun filtro (comportamento invariato).
- Il testo confrontato è `titolo + sommario` dell'item RSS/YouTube.

**Esempi:**
```
Include: "intelligenza artificiale, AI, machine learning"
  → pubblica solo articoli che parlano di AI

Exclude: "pubblicità, sponsored, promozione"
  → blocca articoli promozionali

Combinati:
  Include: "calcio"  +  Exclude: "serie B"
  → articoli di calcio, ma non di Serie B
```

### Implementazione

**`passesKeywordFilter(item, feed)`** in `engine.ts` — funzione pura, dopo `isProcessed()` e prima di `isTimeAllowed()`:

```
isProcessed()           → skip se già visto
passesKeywordFilter()   → skip se non supera il filtro keyword  ← F4
isTimeAllowed()         → skip se quiet hours attive
publishQueue.push()     → accodato per l'invio
```

Log dedicato per item filtrati: `🔍 [BotName] Filtrato da keyword: <titolo>`

### Storage

**Schema v8**: nuova colonna `keyword_filter TEXT DEFAULT NULL` nella tabella `feeds`.

**Formato JSON** nel DB:
```json
{ "include": ["keyword1", "keyword2"], "exclude": ["keyword3"] }
```

**Migration automatica v7→v8** al primo avvio di v1.8.8:
- `ALTER TABLE feeds ADD COLUMN keyword_filter TEXT DEFAULT NULL`
- Feed esistenti rimangono senza filtro (NULL = nessun filtro)

### UI in FeedManager

- **Sezione "Filtro Keyword"** nel form di aggiunta/modifica feed, con icona `Filter`
- Due input affiancati: **Include** (bordo verde) e **Exclude** (bordo rosso)
- Valori inseriti come lista separata da virgole
- **Badge ambra** sulla card del feed se il filtro è attivo (`filtro attivo`)
- Localizzazione completa per tutte e 8 le lingue

### Import/Export .rtb

Il campo `keyword_filter` è incluso nei file `.rtb` (export multi-bot e singolo bot). Feed importati con filtro lo mantengono; feed importati da versioni precedenti (campo assente) partono senza filtro.

---

## Feature F5 — Scheduler per-feed (Intervallo Individuale)

### Descrizione

Ogni feed può ora avere il proprio intervallo di check, indipendente dall'intervallo globale del bot. Feed con contenuto raro (es. YouTube settimanale) possono essere controllati meno frequentemente, riducendo chiamate inutili e log rumorosi.

### Logica

- Se `feed.check_interval` è `NULL` → usa il `check_interval` del bot (comportamento invariato)
- Se `feed.check_interval` è valorizzato → il feed viene skippato finché non è trascorso almeno quell'intervallo dall'ultimo fetch

**Funzione `isFeedDue(feed, bot)`** in `engine.ts`:
```typescript
function isFeedDue(feed: FeedConfig, bot: BotConfig): boolean {
    const interval = feed.check_interval ?? bot.check_interval ?? 15;
    if (!feed.last_fetch_at) return true; // mai fetchato
    const elapsed = Date.now() - new Date(feed.last_fetch_at).getTime();
    return elapsed >= interval * 60 * 1000;
}
```

Log dedicato per feed skippati: `⏱️ [FeedName] Intervallo non scaduto, saltato.`

### Storage

**Schema v9**: due nuove colonne nella tabella `feeds`:
- `check_interval INTEGER DEFAULT NULL` — intervallo in minuti (null = usa default bot)
- `last_fetch_at DATETIME DEFAULT NULL` — timestamp ISO dell'ultimo fetch completato

**`BotManager.updateFeedLastFetch(id)`**: aggiorna `last_fetch_at = datetime('now')` dopo ogni fetch riuscito, indipendentemente dalla presenza di nuovi item.

**Migration automatica v8→v9** al primo avvio di v1.8.8:
- `ALTER TABLE feeds ADD COLUMN check_interval INTEGER DEFAULT NULL`
- `ALTER TABLE feeds ADD COLUMN last_fetch_at DATETIME DEFAULT NULL`
- Feed esistenti: `last_fetch_at = NULL` → al primo ciclo vengono tutti fetchati normalmente

### UI in FeedManager

- **Select "Intervallo Check"** nel form di aggiunta/modifica feed, con icona `Clock`
- Preset disponibili: `Default bot | 5 min | 15 min | 30 min | 1h | 2h | 4h | 8h | 24h`
- **Badge cyan** sulla card del feed se ha un intervallo custom (es. `1h`)
- Localizzazione completa per tutte e 8 le lingue

### Import/Export .rtb

I campi `check_interval` sono inclusi nei file `.rtb`. `last_fetch_at` non viene esportato (viene azzerato all'import — il feed riparte come mai fetchato).

---

## Safety check post-migration (esteso)

Il blocco di safety check post-migrazione ora verifica fisicamente l'esistenza di **tutte e tre** le nuove colonne feeds (`keyword_filter`, `check_interval`, `last_fetch_at`), con aggiunta retroattiva in caso di colonna mancante.

---

## Fix incluso: idx_history_title_dedup

Rimosso `idx_history_title_dedup` dal blocco indici iniziale (eseguito su tutti i DB prima delle migrazioni), dove era senza try/catch e crashava su DB pre-v7 senza la colonna `title_hash`. L'indice è creato correttamente nella migration v7 e nel safety check.

---

## File modificati

| File | Modifica |
|------|----------|
| `src/shared/types.ts` | `FeedConfig`: aggiunti `keyword_filter`, `check_interval`, `last_fetch_at` |
| `src/main/database/schema.ts` | Colonne F4+F5 in CREATE TABLE feeds; migration v8+v9; new install a v9; backup `< 9`; safety checks estesi; fix `idx_history_title_dedup` |
| `src/main/bot/manager.ts` | `addFeed()`/`updateFeed()` con `keywordFilter`+`checkInterval`; nuovo `updateFeedLastFetch()`; export/import .rtb include i nuovi campi |
| `src/main/bot/engine.ts` | `passesKeywordFilter()` + `isFeedDue()` helper; skip in `checkLoop()`; call `updateFeedLastFetch()` dopo fetch |
| `src/main/ipc.ts` | `assertFeedCheckInterval()` + `assertKeywordFilter()` validator; handler `add-feed`/`update-feed` aggiornati |
| `src/preload/index.ts` | Tipo `addFeed`/`updateFeed` aggiornato |
| `src/renderer/src/env.d.ts` | `TitanAPI` aggiornata |
| `src/renderer/src/components/FeedManager.tsx` | UI F4 (filtro keyword, badge ambra) + F5 (select intervallo, badge cyan) |
| `src/renderer/src/locales/*.json` | 10 chiavi aggiunte (8 file): `filterLabel`, `filterInclude`, `filterExclude`, `filterPlaceholder`, `filterActive`, `intervalLabel`, `intervalDefault` |
| `package.json` | Versione bump 1.8.6 → 1.8.8 |
| `docs/STATO-PROGETTO.md` | F4+F5 segnati FATTO; roadmap aggiornata |
