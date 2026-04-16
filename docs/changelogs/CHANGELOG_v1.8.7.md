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
