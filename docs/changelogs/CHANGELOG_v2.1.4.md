# v2.1.4 — Fix link Spreaker, chiusura DB pulita, performance scansione

**Data di rilascio:** 2026-07-05

## Overview

Rilascio di manutenzione: corregge il link degli episodi Spreaker, chiude il database in modo pulito all'uscita, migliora lo stripping dell'HTML nei sommari e riduce il carico delle scansioni con molti bot/feed.

## Fix link Spreaker

Alcune show Spreaker impostano come `<link>` degli item il sito personale dell'autore (es. `dk.dataknightmare.eu`) invece della pagina dell'episodio: il click portava quindi al sito del podcast anziché all'episodio Spreaker. Il parser (`src/main/bot/parser.ts`) ora normalizza il link derivandolo dal `<guid>`, che per Spreaker è sempre `https://api.spreaker.com/episode/{ID}`, riscrivendolo nella pagina pubblica `https://www.spreaker.com/episode/{ID}`.

- Verificato sul feed reale DataKnightmare (show 1977562): **390/390 episodi** normalizzati correttamente, URL pubblici a HTTP 200.
- Nessun re-invio degli episodi già pubblicati: la deduplica per `title_hash` (IronShield v2) copre gli item già in history nonostante il cambio di ID derivato dal nuovo link.

## Chiusura DB pulita (G3)

Aggiunto `closeDB()` in `src/main/database/schema.ts` (checkpoint `wal_checkpoint(TRUNCATE)` + `close`, idempotente) e un handler `app.on('before-quit')` in `src/main/index.ts` che ferma il motore e chiude il database. `titan.db` resta consistente e il file `-wal` non cresce indefinitamente tra un avvio e l'altro.

## HTML stripping più robusto (M6)

`cleanSummary` in `parser.ts` riscritta: rimuove interi blocchi `<script>`/`<style>`, gestisce i tag malformati o non chiusi a fine stringa (che la vecchia regex `/<[^>]*>?/gm` lasciava passare), decodifica le entità HTML e numeriche più comuni e normalizza gli spazi.

## Performance scansione (molti bot/feed)

Nei due loop caldi dell'engine (validazione post-fetch e per-job in coda di invio) la verifica di esistenza del bot usava `BotManager.getBots().some(...)`, che a ogni chiamata rileggeva **tutti** i bot e ne **decifrava i token via safeStorage** (round-trip al keychain OS). Introdotto `BotManager.botExists(id)` — singola `SELECT id FROM bots WHERE id = ?` sulla PK — che elimina migliaia di decifrature inutili per ciclo con molti bot/feed.

- Semantica identica a `getBots().some(...)` verificata su DB reale (true per esistenti, false dopo delete).

## Note

Rimangono volutamente non toccati `any` casting residui (M2) e l'atomicità delle migrazioni (M7, già mitigata dal safety-check post-migrazione): cosmetici o ad alto rischio rispetto al valore.

## File modificati

- `src/main/bot/parser.ts` — normalizzazione link Spreaker + `cleanSummary` robusto.
- `src/main/database/schema.ts` — `closeDB()` con checkpoint WAL.
- `src/main/index.ts` — handler `before-quit` (stop engine + closeDB).
- `src/main/bot/manager.ts` — `botExists()`.
- `src/main/bot/engine.ts` — uso di `botExists()` nei loop caldi.
- `package.json`, `CHANGELOG.md`.
