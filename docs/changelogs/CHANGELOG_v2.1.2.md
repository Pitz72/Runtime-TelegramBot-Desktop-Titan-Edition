# v2.1.2 — Rifiniture (criticità lievi)

**Data di rilascio:** 2026-05-29

## Overview

Quattro rifiniture di basso impatto a chiusura dell'audit di stabilità.

## 1. Statistiche "oggi"/"settimana" sul giorno locale

`getStats`/`getDetailedStats` confrontavano `sent_at` con `date('now')` (UTC): il contatore "oggi" si azzerava a mezzanotte UTC (es. alle 02:00 in Italia). Ora `sent_at` e il confine del giorno vengono calcolati in `localtime`.

## 2. Collisione di key React nei log locali

`addLocalLog` usava `id: Date.now()`: due log generati nello stesso millisecondo condividevano la stessa key React. Ora i log locali usano un contatore negativo monotono, che non collide né tra loro né con gli ID del backend (positivi crescenti).

## 3. Stato del motore sincronizzato al mount

La UI inizializzava `isRunning = false` senza interrogare il motore (che vive nel main process e sopravvive a un reload del renderer). Aggiunto l'IPC `get-bot-status`: al mount la Dashboard riflette lo stato reale, evitando di mostrare "offline" mentre il bot è attivo.

## 4. Metadata package.json

`homepage` puntava a un repo inesistente (`runtimeradio/titan-desktop`); ora punta al repository sorgente reale su `Ecosystem-Runtime`.

## File modificati

- `src/main/bot/manager.ts` — stats su `localtime`.
- `src/renderer/src/components/Dashboard.tsx` — ID log locali monotoni; query stato motore al mount.
- `src/main/bot/engine.ts` — getter pubblico `isEngineRunning()`.
- `src/main/ipc.ts` — handler `get-bot-status`.
- `src/preload/index.ts`, `src/renderer/src/env.d.ts` — API `getBotStatus`.
- `package.json`, `README.md`, `CHANGELOG.md`.

## Stato audit

GRAVISSIME (v2.0.4), GRAVI (v2.1.0), MEDIE (v2.1.1) e LIEVI (v2.1.2) chiuse. Restano: cache persistente `@handle → UC...` per YouTube (feature) e la perdita contenuto dopo `MAX_RETRIES` (scelta di prodotto deliberata). Assenza di test automatizzati: rischio di processo, non un bug.
