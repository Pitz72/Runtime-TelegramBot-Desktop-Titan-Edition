# v2.1.6 — Documentazione in-app: guida rapida, manuale PDF, schermata novità

**Data di rilascio:** 2026-07-07

## Overview

Rilascio commerciale v2 su Gumroad. Porta la documentazione dentro l'applicazione: guida rapida consultabile a schermo nella lingua corrente, download del manuale d'uso completo in PDF e una schermata "Novità" che riepiloga le modifiche a ogni aggiornamento. Consolida inoltre il nuovo branding Titan in tutta l'interfaccia.

## Guida rapida in-app

Nuovo componente `GuideModal` (`src/renderer/src/components/GuideModal.tsx`) che renderizza la guida rapida (`assets/guides/guide-XX.md`) nella lingua attiva, con un renderer markdown minimale interno (nessuna dipendenza aggiunta). Apribile da:

- la **schermata iniziale** (pulsante «Guida Rapida»);
- il **modale Impostazioni → Generale**, nuova sezione «Documentazione».

## Download del manuale PDF

Dalla schermata iniziale e dalla sezione «Documentazione» delle impostazioni è possibile scaricare il **manuale d'uso avanzato completo** in PDF nella lingua corrente. I PDF sono ospitati sulla repo pubblica di release; l'app li apre nel browser di sistema tramite il nuovo canale IPC `open-external` (solo URL `https`). Mappa lingua→file in `src/renderer/src/lib/docs.ts`.

## Schermata «Novità» post-aggiornamento

Al primo avvio dopo un aggiornamento automatico compare `WhatsNewModal`, una schermata grande che elenca i punti salienti della nuova versione nella lingua dell'utente. Il main process confronta la versione corrente con l'ultima vista (`lastSeenVersion` in `titan-settings.json`) tramite l'handler `consume-whats-new`, che consuma il flag così la schermata appare **una sola volta** e non alla prima installazione. Note per versione localizzate in `src/renderer/src/lib/releaseNotes.ts`.

## Branding Titan

Nuovo logo/icona «T + anello orbitale» (palette Titan Blue) confermato in tutta l'interfaccia, nella barra dell'app, nell'icona dell'eseguibile e nell'icona del tipo file `.rtb`.

## Internazionalizzazione

Nuove chiavi `quickGuide.*` (manualBtn, docsSection, docsDesc, close) e sezione `whatsNew.*` in tutte e 8 le lingue (it, en, fr, de, es, pt, ru, zh).

## File modificati

- `src/renderer/src/components/GuideModal.tsx` — nuovo, guida rapida in-app.
- `src/renderer/src/components/WhatsNewModal.tsx` — nuovo, schermata novità.
- `src/renderer/src/lib/docs.ts` — nuovo, mappa guide + URL manuali PDF.
- `src/renderer/src/lib/releaseNotes.ts` — nuovo, note di rilascio localizzate.
- `src/renderer/src/components/IntroScreen.tsx` — pulsanti guida + manuale.
- `src/renderer/src/components/SystemSettingsModal.tsx` — sezione Documentazione.
- `src/renderer/src/App.tsx` — wiring schermata novità all'avvio.
- `src/main/ipc.ts` — handler `open-external` e `consume-whats-new`, campo `lastSeenVersion`.
- `src/preload/index.ts`, `src/renderer/src/env.d.ts` — API `openExternal` e `consumeWhatsNew`.
- `src/renderer/src/locales/*.json` — chiavi `quickGuide.*` e `whatsNew.*` (8 lingue).
