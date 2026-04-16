# Changelog v1.8.7

**Data:** 17 Aprile 2026  
**Branch:** main  
**Tag:** v1.8.7

---

## Feature F4 — Filtro Keyword sui Feed

### Descrizione

Ogni feed può ora avere un filtro keyword indipendente. Il filtro viene applicato dal motore prima di accodare l'item per l'invio: se l'item non supera il filtro viene scartato silenziosamente (log di debug) senza toccare la history.

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

**`passesKeywordFilter(item, feed)`** in `engine.ts` — funzione pura, prima del check quiet hours:

```
isProcessed()           → skip se già visto
passesKeywordFilter()   → skip se non supera il filtro keyword  ← nuovo
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

**Migration automatica v7→v8** al primo avvio di v1.8.7:
- `ALTER TABLE feeds ADD COLUMN keyword_filter TEXT DEFAULT NULL`
- Feed esistenti rimangono senza filtro (NULL = nessun filtro)
- Nessun backup pre-migrazione (operazione non distruttiva — solo aggiunta colonna)

### UI in FeedManager

- **Sezione "Filtro Keyword"** nel form di aggiunta/modifica feed, con icona `Filter`
- Due input affiancati: **Include** (bordo verde) e **Exclude** (bordo rosso)
- Valori inseriti come lista separata da virgole
- **Badge ambra** sulla card del feed se il filtro è attivo (`filtro attivo`)
- Localizzazione completa per tutte e 8 le lingue

### Import/Export .rtb

Il campo `keyword_filter` è incluso nei file `.rtb` (export multi-bot e singolo bot). Feed importati con filtro lo mantengono; feed importati da versioni precedenti (campo assente) partono senza filtro.

---

## File modificati

| File | Modifica |
|------|----------|
| `src/shared/types.ts` | `FeedConfig.keyword_filter: string \| null` |
| `src/main/database/schema.ts` | Colonna `keyword_filter` in CREATE TABLE; migration v8; new install a v8 |
| `src/main/bot/manager.ts` | `addFeed()` e `updateFeed()` accettano `keywordFilter`; export/import .rtb include il campo |
| `src/main/bot/engine.ts` | `passesKeywordFilter()` helper; chiamata in `processFeed()` con log `🔍` |
| `src/main/ipc.ts` | Handler `add-feed` e `update-feed` passano `keywordFilter` al manager |
| `src/preload/index.ts` | Tipo `addFeed`/`updateFeed` aggiornato con `keywordFilter?: string \| null` |
| `src/renderer/src/env.d.ts` | `TitanAPI` aggiornata |
| `src/renderer/src/components/FeedManager.tsx` | Sezione filtro nel form; badge sulla card; helper serialize/deserialize |
| `src/renderer/src/locales/*.json` | 8 chiavi aggiunte: `filterLabel`, `filterInclude`, `filterExclude`, `filterPlaceholder`, `filterActive` |
| `package.json` | Versione bump 1.8.6 → 1.8.7 |

---

## Hotfix 1 — Safety check post-migration colonne critiche

Aggiunto controllo fisico delle colonne critiche **dopo tutte le migrazioni**, come difesa contro stati DB corrotti in cui `user_version` è avanzato ma `ALTER TABLE` è fallito silenziosamente nel `try/catch`.

- Se `title_hash` manca dalla tabella `history` → aggiunta retroattivamente con il relativo indice
- Se `keyword_filter` manca dalla tabella `feeds` → aggiunta retroattivamente

Scenario che causava il bug: migration v7 si esegue, `user_version` viene portato a 7, ma la colonna non è stata fisicamente creata. Al successivo avvio la migration non gira più (versione già aggiornata) → `SqliteError: no such column: title_hash` al primo uso.

---

## Hotfix 2 — Bug critico: idx_history_title_dedup crashava prima della migration

**Causa radice dell'errore** `SqliteError: no such column: title_hash`.

Il blocco che crea gli indici su `history` girava su **tutti i DB** (nuovi e vecchi) e includeva:
```sql
CREATE INDEX IF NOT EXISTS idx_history_title_dedup ON history(bot_id, feed_id, title_hash);
```
Questo blocco **non era protetto da try/catch** e veniva eseguito **prima delle migration**. Su DB esistenti (pre-v7) senza la colonna `title_hash`, crashava immediatamente come `unhandledRejection`, impedendo all'app di avviarsi.

**Fix:** rimosso `idx_history_title_dedup` dal blocco indici iniziale. L'indice continua ad essere creato nella migration v7 (dove appartiene) e nel safety check post-migration.

---

## Hotfix 3 — Dev server ESM/CJS loop (npm run dev)

In watch mode, `vite-plugin-electron` rilevava i propri output (`dist-electron/main/index.cjs`) come file modificati e riavviava una seconda build. Questa seconda build non ereditava correttamente `lib: { formats: ['cjs'] }` e produceva ESM dentro un file `.cjs` → `SyntaxError: Cannot use import statement outside a module`.

**Fix in `vite.config.ts`:**
- `rollupOptions.watch.exclude: ['dist-electron/**', 'dist/**', 'node_modules/**']` — rompe il loop del watcher
- `chunkFileNames: '[name]-[hash].cjs'` — garantisce che anche i chunk secondari abbiano estensione `.cjs`

---

## File modificati (hotfix)

| File | Modifica |
|------|----------|
| `src/main/database/schema.ts` | Rimosso `idx_history_title_dedup` dal blocco indici iniziale; aggiunto safety check post-migration per `title_hash` e `keyword_filter` |
| `vite.config.ts` | `watch.exclude` + `chunkFileNames: '[name]-[hash].cjs'` |
