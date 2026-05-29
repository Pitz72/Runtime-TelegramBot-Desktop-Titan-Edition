# v2.1.1 — Correzioni di robustezza (audit, criticità medie)

**Data di rilascio:** 2026-05-29

## Overview

Quattro correzioni di media gravità emerse dall'audit, tutte collaudate.

## 1. Mismatch fuso orario su `last_fetch_at` e `digest_last_sent`

**Problema:** i timestamp venivano scritti con `datetime('now')` (UTC, formato `"YYYY-MM-DD HH:MM:SS"` senza timezone) e riletti con `new Date()`, che li interpretava come **ora locale**. Per un utente in UTC+2 il timestamp risultava sfasato di 2 ore: l'intervallo per-feed (F5) di fatto non throttava (i feed venivano controllati a ogni ciclo) e i digest partivano in anticipo.

**Fix:**
- Le scritture usano ora ISO-UTC esplicito (`strftime('%Y-%m-%dT%H:%M:%SZ','now')`).
- Le letture passano per un helper `parseUtcTimestamp()` che tratta il vecchio formato-spazio come UTC, così anche le righe già presenti nel DB vengono interpretate correttamente (self-healing, nessuna migrazione necessaria).

## 2. Reset Innertube su ogni errore transitorio YouTube

**Problema:** il `catch` di `fetchYouTubeVideos()` chiamava `resetYouTubeSession()` a **ogni** errore, ricreando l'istanza Innertube — esattamente l'handshake ravvicinato che l'antibot YouTube penalizza (issue LuanRT/YouTube.js#1158), in contraddizione con la mitigazione introdotta in v2.0.3.

**Fix:** la sessione viene mantenuta viva sugli errori transitori (cache inclusa). Un contatore di errori consecutivi resetta l'istanza **solo dopo 5 fallimenti di fila**, quando è plausibile che la sessione sia davvero compromessa. Il contatore si azzera a ogni risposta valida dell'API.

## 3. Crescita illimitata della tabella `history`

**Problema:** `history` cresceva senza limiti (solo pulizia manuale), con impatto su disco e prestazioni nel tempo.

**Fix:** pruning automatico all'avvio che mantiene, per ogni bot, le 20.000 righe più recenti (per `sent_at`). Il cap è enorme rispetto a qualsiasi finestra di feed reale (poche centinaia di item), quindi una riga eliminata è ben oltre il backlog visibile e **non può causare ri-pubblicazioni**.

## 4. Validazione input mancante su handler IPC

**Problema:** `get-feeds` non validava `botId` (un valore undefined arrivava fino a better-sqlite3, causando un'eccezione).

**Fix:** `get-feeds` valida `botId` con `assertPositiveInt`; `toggle-feed` coerce `isActive` a booleano.

## File modificati

- `src/main/bot/manager.ts` — scritture ISO-UTC per `last_fetch_at`/`digest_last_sent`.
- `src/main/bot/engine.ts` — helper `parseUtcTimestamp()`; letture corrette in `isFeedDue`/`processDigests`.
- `src/main/bot/youtube.ts` — reset Innertube solo dopo 5 errori consecutivi.
- `src/main/database/schema.ts` — pruning `history` (cap 20.000/bot) all'avvio.
- `src/main/ipc.ts` — validazione `get-feeds`/`toggle-feed`.
- `package.json`, `README.md`, `CHANGELOG.md`.

## Note

Criticità ancora aperte (basso impatto / scelta di prodotto): stat "oggi" su giorno UTC, perdita contenuto dopo `MAX_RETRIES` (deliberata), e la cache persistente `@handle → UC...` per YouTube.
