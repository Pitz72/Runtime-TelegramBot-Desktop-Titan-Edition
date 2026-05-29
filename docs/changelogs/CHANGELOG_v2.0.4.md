# v2.0.4 — Hardening stabilità: l'app non si chiude più su errori asincroni

**Data di rilascio:** 2026-05-29

## Overview

Hotfix di stabilità. Una criticità gravissima poteva spegnere **l'intera applicazione** in risposta a un singolo errore asincrono non gestito (es. un singhiozzo di rete, un rate-limit YouTube, un lock momentaneo del database) generato da un task in background del motore bot. Per un'app pensata per restare attiva 24/7, questo significava che il bot poteva chiudersi da solo mentre l'utente non stava facendo nulla.

Questa release elimina la causa alla radice e mette in sicurezza la catena asincrona dell'engine.

## Bug risolti

### 1. `unhandledRejection` chiudeva forzatamente l'app (GRAVISSIMA)

**Causa:** il global handler in `src/main/index.ts` chiamava `app.exit(1)` su **ogni** promise rejected non gestita. Le rejection, però, sono quasi sempre transitorie (rete, rate-limit, lock DB) e non giustificano la terminazione del processo. Esisteva inoltre un percorso concreto che le innescava (vedi punto 2).

**Fix — `src/main/index.ts`:**
L'handler `unhandledRejection` ora **logga e prosegue**, senza chiudere l'app né mostrare un dialog bloccante. L'handler `uncaughtException` resta invariato (uno stato di processo realmente corrotto è genuinamente fatale).

### 2. Catena asincrona dell'engine non protetta

**Causa:** in `src/main/bot/engine.ts`:
- `processPublishQueue()` era invocata **fire-and-forget** (senza `await` né `.catch`).
- All'interno del consumer, `BotManager.markProcessed()` e `this.getClient()` erano **fuori** dal blocco `try/catch`: un errore SQLite o un token malformato faceva rigettare l'intera promise → `unhandledRejection` → chiusura app (punto 1).
- `this.checkLoop().then(...)` nello scheduler non aveva un `.catch`.

**Fix — `src/main/bot/engine.ts`:**
- `processPublishQueue()` ora è invocata con `.catch` che logga l'errore e resetta `isPublishing`.
- Il corpo del consumer è racchiuso in `try/finally`: `isPublishing` viene sempre ripristinato, e ogni singolo job è isolato in un `try/catch` — un errore su un job (DB, client) viene loggato e il job saltato, senza bloccare i successivi né rigettare la promise.
- Lo scheduler usa `.catch().finally(() => this.scheduleNext())`: un errore in `checkLoop` non interrompe più il loop di polling.

## Impatto

Nessuna modifica funzionale alla pubblicazione, allo schema DB o all'UI. Solo robustezza: errori transitori che prima abbattevano l'app ora vengono assorbiti e loggati, e il bot continua a girare.

## File modificati

- `src/main/index.ts` — `unhandledRejection` reso non fatale.
- `src/main/bot/engine.ts` — `.catch` su `processPublishQueue` e `checkLoop`; `try/finally` + `try/catch` per-job nel consumer.
- `package.json` — bump 2.0.3 → 2.0.4.
- `CHANGELOG.md` — entry v2.0.4.

## Note

Le altre criticità emerse nell'analisi (deduplica `title_hash` cross-feed, mismatch fuso orario su `last_fetch_at`/`digest_last_sent`, validazione DB import, `decryptToken` silenzioso) restano aperte e sono candidate per le prossime release.
