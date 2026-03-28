# 📚 Documentazione TITAN_DESKTOP

Benvenuto nel centro documentale di **Runtime TelegramBot Titan Edition**. Questo indice organizza in modo logico tutte le informazioni, guide e storici relativi al progetto, risultando ottimizzato sia per la consultazione umana che per l'analisi e il refactoring guidato da AI.

---

## 🏗️ Architettura & Setup

La panoramica generale dell'architettura e delle scelte tecnologiche si trova principalmente nel README centrale. Le guide di compilazione cross-platform si trovano qui:

- **[Panoramica Progetto](../README.md)** — Architettura, stack, funzionalità core, design system e path database.
- **[Whitepaper Architetturale](whitepaper_titan_architecture.md)** — Analisi approfondita dell'architettura Titan, Producer-Consumer, OmniSync e sicurezza.
- **[Compilazione Linux](build-linux.md)** — Istruzioni per pacchettizzare in `.AppImage` e `.deb`, incluse le fix per moduli nativi SQLite.
- **[Compilazione macOS](build-mac.md)** — Istruzioni per la build di `.dmg` su sistemi Mac (senza Xcode completo).

---

## 📖 Manuali e Guide

Informazioni per l'utilizzo dell'applicazione da parte dell'utente finale.

- **[Manuale d'Uso Avanzato](manuale.md)** — Guida completa all'installazione, configurazione bot, feed, YouTube scraping e OmniSync.
- **[Quick Start Guide (IT)](guide/quick-start-guide-it.md)** — Guida rapida in italiano (consultare la cartella `guide/` per le altre 7 lingue supportate).

---

## 🧹 Manutenzione e Archiviazione

Norme e best practice per tenere in ordine la repository e ottimizzarne il peso fisico su disco.

- **[Guida alla Pulizia Spazio](manutenzione-archivio.md)** — Regole ufficiali per la rimozione di cache, la pulizia dei folder di build (Electron/Vite) e l'archiviazione di progetti legacy.

---

## 📜 Storico Release (Changelog)

Per migliorare la consultazione da parte degli LLM, lo storico delle modifiche è stato suddiviso in blocchi cronologici (per Major e Minor Version) piuttosto che in un unico grande file di centinaia di righe:

- **[v1.7.x (Corrente)](changelogs/v1.7.7.md)**
  Versione attuale: **v1.7.7** — Security Patch + Build Cross-Platform. Cifratura AES-256-CBC dei token nei file `.rtb`, validazione anti-SSRF sugli URL feed, validazione input su tutti gli handler IPC, rimozione dipendenze orfane. **Nuovo:** build automatica tramite GitHub Actions CI per **macOS DMG (Apple Silicon arm64, confermato ✅)** e **Linux AppImage/deb (confermato ✅)**. Vedere anche [v1.7.6](changelogs/v1.7.6.md) per guide in-app, Auto-Updater e distribuzione Windows.

- **[v1.6.x (Archivio)](changelogs/v1.6.1.md)**
  Dalla v1.6.0 alla v1.6.1: sistema OmniSync con formato `.rtb` per la portabilità sicura dei bot tra macchine diverse, con ri-cifratura automatica tramite `safeStorage`.

- **[v1.5.x (Archivio)](changelogs/v1.5.4.md)**
  Dalla v1.5.0 alla v1.5.4: template messaggi personalizzabili con editor Smart Chips, variabili dinamiche (`{{title}}`, `{{link}}`, ecc.), gestione escaping HTML per Telegram.

- **[v1.4.x (Archivio)](changelogs/v1.4.x.md)**
  Dalla v1.4.0 alla v1.4.2: Quiet Hours (fasce orarie di silenzio), notifiche native OS, perfezionamento job queue asincrona.

- **[v1.3.x (Archivio)](changelogs/v1.3.x.md)**
  Dalla v1.3.0 alla v1.3.5: integrazione YouTube tramite `youtubei.js` (InnerTube, zero-config), sistema di logging ibrido, refactoring Producer-Consumer, backup DB automatico e Error Boundaries React.

- **[v1.2.x (Archivio)](changelogs/v1.2.x.md)**
  Versione 1.2.x: Internazionalizzazione (i18n a 8 lingue), Import/Export JSON, cifratura token e Custom Toasts.

- **[v1.1.x (Archivio)](changelogs/v1.1.x.md)**
  Dalla v1.1.0 in poi (intervalli di check configurabili, statistiche out-of-the-box, export log manuale...).

- **[v1.0.x (Release Ufficiali)](changelogs/v1.0.x.md)**
  Da RTB 1.0.0 (data in cui l'interfaccia ha ricevuto il restyling Titan) alle varie patch 1.0.x che hanno migliorato l'affidabilità del parser RSS.

- **[Legacy (Pre-Release e Alpha)](changelogs/legacy-pre-v1.md)**
  Include tutte le build primordiali (0.x, alpha, beta) che segnano il passaggio dall'architettura Python a TypeScript/Electron.

> Il file `CHANGELOG.md` globale posizionato nella cartella radice funge da indice di rinvio a questi file storici.

---

## 🔍 Analisi Tecnica e Qualità del Codice

- **[Analisi Tecnica v1.7.6](analisi-tecnica.md)** — Report completo di criticità (gravissime, gravi, medie, lievi), dipendenze orfane, aree di miglioramento e decisione architetturale su Tauri. Redatto il 27/03/2026.

---

## 🛠️ Diagnostica e Bug Report

Documentazione relativa a moduli critici, troubleshooting avanzato e indagini tecniche:

- **[Report YouTube — Analisi e Soluzione (v1.0.5 → v1.3.1)](relazione-youtube.md)**
  Analisi approfondita del problema dei feed Atom YouTube (HTTP 404 su endpoint pubblici) con diagnosi completa delle cause, valutazione delle alternative (YouTube Data API v3 poi scartata) e documentazione della soluzione adottata: scraping InnerTube via `youtubei.js`, implementata in v1.3.1. **Problema risolto definitivamente.**

---

## 🗺️ Storico Pianificazione

- **[Roadmap Marzo 2026 — Completata](roadmap-marzo2026.md)**
  Piano di sviluppo formale redatto a v1.4.0 per le funzionalità mancanti verso la Gold Release. Tutte le feature pianificate (Quiet Hours, Template Smart Chips) sono state implementate nelle versioni successive. Documento conservato come riferimento storico.

---

*(C) 2026 Simone Pizzi per Runtime Radio*
