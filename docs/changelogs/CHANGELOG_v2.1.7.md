# v2.1.7 — Rifiniture: nome prodotto uniforme, icona taskbar, schermata novità

**Data di rilascio:** 2026-07-07

## Overview

Rilascio di rifinitura sulla v2.1.6: uniforma il nome del prodotto in tutta l'app, corregge l'icona nella barra applicazioni di Windows e rende affidabile la schermata «Novità» per chi aggiorna da versioni precedenti.

## Nome prodotto uniforme

Il software ora si chiama **"Runtime TelegramBot Desktop Titan Edition"** ovunque, eliminando il nome divergente "Titan Desktop":
- Titolo della finestra (`src/renderer/index.html`).
- Schermate Intro, Dashboard e Setup Wizard (`app.title` = "Runtime TelegramBot Desktop" + "Titan Edition" in tutte e 8 le lingue).
- Guida rapida in-app e guide rapide dei pacchetti (8 lingue).

## Icona nella barra applicazioni (Windows)

La finestra usava `resources/icon.png` (1024px): su Windows un PNG così grande non produce l'icona nella taskbar. Ora su Windows la finestra usa `resources/icon.ico` (multi-risoluzione 16–256px), mentre Linux continua a usare il PNG.

## Schermata «Novità» — aggiornamenti da versioni precedenti

`consume-whats-new` mostrava le novità solo se era già stata salvata una versione precedente: chi aggiornava da una release anteriore alla 2.1.6 (che non salvava `lastSeenVersion`) non la vedeva. Ora, se `lastSeenVersion` è assente ma esistono già dei bot, l'utente è riconosciuto come esistente e — a versione cambiata — la schermata compare.

## Banner

Banner premium aggiornato: titolo unico "Runtime TelegramBot Desktop / Titan Edition" con stesso font e gradienti, «Edition» in blu.

## File modificati

- `src/main/index.ts` — icona finestra `.ico` su Windows.
- `src/main/ipc.ts` — `consume-whats-new`: riconoscimento utente esistente via bot.
- `src/renderer/index.html` — titolo finestra.
- `src/renderer/src/locales/*.json` — `app.title` (8 lingue).
- `src/renderer/src/assets/guides/*.md`, `docs/guide/quick-start-guide-*.md` — nome prodotto uniforme.
- `resources/icon.ico` — nuovo (per l'icona finestra Windows).
- `branding/` — banner v2.1.7.
