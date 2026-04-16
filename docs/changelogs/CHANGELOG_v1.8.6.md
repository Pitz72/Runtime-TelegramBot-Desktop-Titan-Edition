# Changelog v1.8.6

**Data:** 16 Aprile 2026  
**Branch:** main  
**Tag:** v1.8.6

---

## Bug fix critico #27 — Anti-spam title hash deduplication

### Problema identificato (causa radice)

Lo spam di item già pubblicati era causato da una dipendenza assoluta del sistema di deduplicazione dal link dell'item come fonte dell'ID univoco.

```
id = MD5(link)
isProcessed(botId, id) → cerca (bot_id, id) in history
```

**Scenario di spam:**
1. Il publisher (sito web, canale YouTube) pubblica un item. Titan lo invia, salva `MD5(link_v1)` nella history.
2. Il publisher modifica la URL dell'articolo (cambio categoria, slug, re-upload video, refactor del sito).
3. Al prossimo ciclo, lo stesso contenuto ha `link_v2` → `MD5(link_v2) ≠ MD5(link_v1)`.
4. `isProcessed()` non trova corrispondenza → item **ri-pubblicato come se fosse nuovo**.

### Prove dal database di produzione

Investigazione diretta su `C:\Users\Utente\AppData\Roaming\titan-desktop\titan.db` (v1.8.3 in produzione):

- **26 titoli duplicati** (stesso titolo, MD5 diversi) su 248 titoli unici (10.5%)
- Caso più grave: **17 articoli dal sito di Simone Pizzi** ri-inviati dopo refactor categorie del sito
- Caso critico: batch di **8 articoli ri-spammati a 3 minuti di distanza** (2026-03-01 10:37 → 10:40)
- Caso YouTube: "FCP AutoDuck NX" ri-inviato 2 giorni dopo su 2 bot diversi (re-upload canale)

### Fix implementato

**Doppio controllo in `BotManager.isProcessed()`:**

```
Check 1 (invariato): (bot_id, id)          → match esatto sul MD5 del link
Check 2 (nuovo):     (bot_id, feed_id, title_hash) → safety net su MD5(lower(trim(title)))
```

Se il link è cambiato ma il titolo è identico nello stesso feed per lo stesso bot → già pubblicato → **nessuno spam**.

**`BotManager.markProcessed()`** ora salva anche `title_hash = MD5(lower(trim(title)))`.

**`engine.ts`**: la chiamata a `isProcessed` passa ora anche `feed.id` e `item.title`.

### Schema v7

**Nuova colonna** `title_hash TEXT` nella tabella `history`.

**Nuovo indice** `idx_history_title_dedup ON history(bot_id, feed_id, title_hash)` per lookup O(log n).

**Migration automatica v6→v7** al primo avvio di v1.8.6:
- `ALTER TABLE history ADD COLUMN title_hash TEXT`
- Backfill JS di tutte le righe esistenti (SQLite non ha MD5 nativo)
- Creazione indice

Backup pre-migrazione creato automaticamente in `AppData/Roaming/titan-desktop/`.

### Perché title_hash e non il titolo grezzo

- MD5 del titolo normalizzato (lowercase + trim) è compatto (32 hex), indicizzabile, resistente a differenze di case e spazi
- Il confronto è O(1) sull'indice invece di LIKE/LOWER su TEXT
- Nessun dato personale in chiaro nell'indice

### Trade-off accettati

- Se lo stesso titolo esatto appare legittimamente due volte nello stesso feed → il secondo viene bloccato. Caso raro e accettabile (es. "Untitled Episode" è improbabile in feed reali).
- Se il publisher corregge un refuso nel titolo E cambia URL → viene trattato come nuovo item. Comportamento corretto.

---

## File modificati

| File | Modifica |
|------|----------|
| `src/main/database/schema.ts` | Import crypto; `title_hash TEXT` nello schema; indice `idx_history_title_dedup`; migration v7 con backfill JS; new install a v7 |
| `src/main/bot/manager.ts` | `isProcessed()` dual check; `markProcessed()` salva `title_hash` |
| `src/main/bot/engine.ts` | Chiamata `isProcessed(bot.id, item.id, feed.id, item.title)` |
| `package.json` | Versione bump 1.8.5 → 1.8.6 |
