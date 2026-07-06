# v2.1.5 — Scansione RSS parallela, aggiornamenti con conferma, fix console log

**Data di rilascio:** 2026-07-06

## Overview

Rilascio di manutenzione e UX: la scansione dei feed RSS ora è parallela (grosso guadagno con molti bot/feed), il flusso di aggiornamento chiede conferma con una schermata centrale invece di un toast, e viene corretto l'accavallamento visivo delle righe lunghe nella console dei log.

## Scansione RSS in parallelo (Perf Fix B)

Con molti bot e feed la scansione "si ingolfava" perché tutto era seriale (feed dopo feed) con pause fisse tra un fetch e l'altro. In `src/main/bot/engine.ts`, `checkLoop` ora separa i feed scaduti in RSS vs YouTube:

- **RSS/Atom** scaricati in parallelo con un pool a concorrenza limitata (`runPool`, `RSS_FETCH_CONCURRENCY = 6`): il tempo di ciclo passa dalla *somma* dei fetch al fetch più lento del gruppo.
- **YouTube** resta **seriale** con throttle di 5s: l'antibot Innertube (LuanRT/YouTube.js#1158, #1166) penalizza i burst ravvicinati, quindi lì la parallelizzazione sarebbe controproducente.
- Rimossa la pausa fissa di 1s tra i feed RSS (Fix C). Il 3s post-invio su Telegram resta (limite canali ~20 msg/min).
- Il processamento degli item dopo il fetch è sincrono (better-sqlite3), quindi non c'è race tra feed dello stesso bot.

## Aggiornamenti con conferma (nuovo flusso)

Prima l'aggiornamento si scaricava da solo e compariva un toast; ora l'utente decide.

- `autoUpdater.autoDownload = false`: il download parte solo dopo conferma.
- Nuova schermata centrale (`UpdateModal`) ben evidente: **Scarica ora / Più tardi** → barra di avanzamento → **Riavvia e installa / Più tardi**.
- Controllo aggiornamenti centralizzato (`useUpdater`, hook a livello di App): parte già dalla **schermata iniziale**, che ora mostra la **versione attuale** e un badge "**Nuova versione disponibile**".
- **Impostazioni di sistema → Generale**: nuovo pulsante **"Verifica aggiornamenti"** con esito (sei aggiornato / nuova versione).
- Nuovi eventi IPC: `download-update`, `update-not-available`, `update-progress`, `update-error`.
- `t()` (I18nContext) ora fa fallback sull'inglese per le chiavi non ancora tradotte in tutte le lingue.

## Fix console log (accavallamento righe)

Nella console dei log le righe lunghe che andavano a capo si sovrapponevano alla riga successiva: il virtualizer usava un'altezza stimata fissa (22px). Ora ogni riga viene **misurata dinamicamente** (`measureElement`), così l'altezza reale riposiziona correttamente le righe seguenti.

## CI

`setup-node` aggiornato da Node 20 a **Node 24** in `build.yml` (job Linux e Windows), rimuovendo il warning di deprecazione delle GitHub Actions.

## Note

Rimangono volutamente non toccati `any` casting residui (M2) e l'atomicità delle migrazioni (M7, già mitigata dal safety-check post-migrazione).

## File modificati

- `src/main/bot/engine.ts` — `runPool` + scansione RSS parallela / YouTube seriale.
- `src/main/index.ts` — `autoDownload=false` + nuovi eventi updater.
- `src/main/ipc.ts` — handler `download-update`.
- `src/preload/index.ts`, `src/renderer/src/env.d.ts` — superficie API updater.
- `src/renderer/src/hooks/useUpdater.ts` — hook ciclo di vita aggiornamenti (nuovo).
- `src/renderer/src/components/UpdateModal.tsx` — schermata di aggiornamento centrale (nuovo).
- `src/renderer/src/App.tsx`, `IntroScreen.tsx`, `Dashboard.tsx`, `SystemSettingsModal.tsx` — cablaggio updater + versione/badge in intro + tasto in impostazioni.
- `src/renderer/src/locales/I18nContext.tsx` — fallback su `en`; nuove chiavi `updater.*` in `it.json`/`en.json`.
- `src/renderer/src/components/Dashboard.tsx` — misurazione dinamica righe log.
- `.github/workflows/build.yml` — Node 24.
- `package.json`, changelog.
