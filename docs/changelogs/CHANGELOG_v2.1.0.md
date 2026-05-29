# v2.1.0 — IronShield v2 + robustezza import DB e token

**Data di rilascio:** 2026-05-29
**Schema DB:** v11 → v12

## Overview

Release che chiude tre criticità gravi emerse dall'audit di stabilità, di cui una di prodotto (deduplica) e due di robustezza (import database, token illeggibili).

## 1. IronShield v2 — deduplica per titolo distinta per tipo di contenuto

**Problema (falso positivo confermato 28-29/04/2026):** la deduplica per `title_hash` era globale per bot. Un video YouTube intitolato "X" bloccava **per sempre** qualsiasi articolo RSS/podcast con lo stesso titolo sullo stesso bot, anche se erano contenuti completamente diversi.

**Soluzione:** la deduplica per titolo è ora **scoped per `content_type`**. Due item con lo stesso titolo si bloccano a vicenda solo se provengono dallo stesso tipo di sorgente (YouTube↔YouTube o RSS↔RSS). Video e articoli omonimi vengono entrambi pubblicati. Il check sull'**ID (MD5 del link) resta globale e invariato**: lo stesso link è sempre un duplicato.

| Scenario | v1 (IronShield) | v2 |
|---|---|---|
| Stesso video YouTube in 2 feed YouTube | ✅ Bloccato | ✅ Bloccato |
| Stesso link in 2 feed qualsiasi | ✅ Bloccato | ✅ Bloccato |
| Stesso titolo su YouTube e su un articolo RSS | ❌ Bloccato (falso positivo) | ✅ Entrambi pubblicati |

**Implementazione:**
- **Schema v12:** colonna `content_type TEXT NOT NULL DEFAULT 'rss'` su `history`; backfill automatico dei dati esistenti (`feeds.type='youtube'` → `'youtube'`, resto → `'rss'`; righe orfane su default `'rss'`); indice `idx_history_title_dedup` ricreato su `(bot_id, title_hash, content_type)`.
- Il `content_type` si deriva dal campo `feed.type` già esistente — nessun input manuale, nessuna colonna ridondante sui feed.
- `isProcessed()`/`markProcessed()` accettano il parametro `contentType`; i 6 call site in `engine.ts` lo passano.
- La migrazione è stata collaudata su DB simulato (backfill, righe orfane, dedup scoped) — esito PASS.

## 2. Validazione del file in "Importa Database"

**Problema (grave):** `import-database` copiava un file `.db` arbitrario sopra `titan.db` e riavviava, **senza alcuna validazione**. Un file corrotto o non-SQLite rendeva l'app non avviabile al riavvio (errore in `initDB`), senza vie d'uscita dalla UI.

**Fix:** prima di sovrascrivere, il file viene aperto in **sola lettura** e validato con `PRAGMA integrity_check` + verifica della presenza della tabella `bots`. Se la validazione fallisce, l'import viene annullato con un messaggio chiaro e il database attivo resta intatto.

## 3. Token illeggibili non più silenziosi

**Problema (grave):** se `safeStorage` (keychain OS) diventava non disponibile o il DB veniva importato da un altro PC, `decryptToken()` restituiva `''` **in silenzio**. I bot smettevano di pubblicare con un generico "Unauthorized", senza che l'utente capisse il perché.

**Fix:**
- `crypto.ts`: ogni fallimento di decifratura ora emette un warning diagnostico esplicito.
- `engine.ts`: i bot con token non leggibile vengono **saltati** con un messaggio azionabile in console/UI ("token non leggibile su questa macchina — reinserisci il token"), invece di tentare invii destinati a fallire.

## File modificati

- `src/main/database/schema.ts` — migrazione v12, fresh-install a v12, safety check `content_type`, soglia backup `< 12`.
- `src/main/bot/manager.ts` — `isProcessed()`/`markProcessed()` con `contentType`, query dedup scoped.
- `src/main/bot/engine.ts` — 6 call site con `content_type`; guard sui bot con token illeggibile (checkLoop + startup).
- `src/main/crypto.ts` — warning su decifratura fallita.
- `src/main/ipc.ts` — validazione `import-database` (integrity_check + tabella `bots`).
- `package.json`, `README.md`, `CHANGELOG.md`, `docs/PROGETTO-IRONSHIELD-V2.md`.

## Note

Restano aperte alcune criticità medie individuate nell'audit (mismatch fuso orario su `last_fetch_at`/`digest_last_sent`, reset Innertube su errore transitorio, crescita illimitata della tabella `history`) e la cache persistente `@handle → UC...` per YouTube, candidate per una release successiva.
