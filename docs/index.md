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
- **[Quick Start Guide (IT)](guide/quick-start-guide-it.md)** — Guida rapida in italiano (consultare la cartella `guide/` per altre lingue).

---

## 🧹 Manutenzione e Archiviazione

Norme e best practice per tenere in ordine la repository e ottimizzarne il peso fisico su disco.

- **[Guida alla Pulizia Spazio](manutenzione-archivio.md)** — Regole ufficiali per la rimozione di cache, la pulizia dei folder di build (Electron/Vite) e l'archiviazione di progetti legacy.

---

## 📜 Storico Release (Changelog)

Per migliorare la consultazione da parte degli LLM, lo storico delle modifiche è stato suddiviso in blocchi cronologici (per Major e Minor Version) piuttosto che in un unico grande file di centinaia di righe:

- **[v1.4.x (Corrente)](changelogs/v1.4.x.md)**
  Dalla v1.4.0 in poi, introducendo notifiche native OS. Questa è l'attuale linea di sviluppo stabile.
- **[v1.3.x (Archivio)](changelogs/v1.3.x.md)**
  Dalla v1.3.0 alla v1.3.5: Ripristino YouTube base, Sistema Logging Ibrido, Refactoring Producer-Consumer, Backup DB e Error Boundaries.
- **[v1.2.x (Archivio)](changelogs/v1.2.x.md)**
  Versione 1.2.x: Internazionalizzazione (i18n a 8 lingue), Import/Export JSON, Cifratura Token e Custom Toasts.
- **[v1.1.x (Archivio)](changelogs/v1.1.x.md)**
  Dalla v1.1.0 in poi (intervalli di check configurabili, statistiche out-of-the-box, export log manuale...).
- **[v1.0.x (Release Ufficiali)](changelogs/v1.0.x.md)**
  Da RTB 1.0.0 (data in cui l'interfaccia ha ricevuto il restyling Titan) alle varie patch 1.0.x che hanno migliorato l'affidabilità del parser RSS.
- **[Legacy (Pre-Release e Alpha)](changelogs/legacy-pre-v1.md)**
  Include tutte le build primordiali (0.x, alpha, beta, e i vecchi cicli numerici pre v1 come 1.4.1) che segnano il passaggio dall'architettura Python a TypeScript/Electron.

> Il file `CHANGELOG.md` globale posizionato nella cartella radice funge ora da puro rinvio a questi file storici.

---

## 🛠️ Diagnostica, Bug Report e Feature Bloccate

Documentazione relativa a moduli critici, troubleshooting avanzato e indagini tecniche:

- **[Report YouTube (Issue v1.0.5)](relazione-youtube.md)**
  Un'analisi profonda del perché i canali YouTube restituiscono fallimenti 404 (Feed XML pubblici Atom deprecati) e il piano strutturato per migrarlo prossimamente alla YouTube Data API v3.

---

## 🗺️ Sviluppi Futuri

Cosa è in cantiere per le prossime iterazioni.

- **[Roadmap Marzo 2026](roadmap-marzo2026.md)**
  Il piano formale che delinea le implementazioni da fare (tra cui il passaggio alla YouTube v3 API, l'uso di React Error Boundary, notifiche OS native e toast messages in-app).

---

*(C) 2026 Simone Pizzi per Runtime Radio*
