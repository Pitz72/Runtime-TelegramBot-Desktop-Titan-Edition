# Documentazione — Runtime TelegramBot Titan Edition

Centro documentale del progetto. Indice completo di guide, changelog e documentazione tecnica.

**Versione corrente:** v1.10.9 — [Vedi changelog](changelogs/CHANGELOG_v1.10.9.md)  
**Repository:** https://github.com/Ecosystem-Runtime/Runtime-TelegramBot-Desktop-Titan-Edition

---

## Guide Utente

- **[Panoramica Progetto](../README.md)** — Funzionalità, stack, installazione, struttura repository.
- **[Manuale d'Uso Avanzato](manuale.md)** — Guida completa all'installazione, configurazione bot, feed, YouTube e OmniSync.
- **[Quick Start Guide (IT)](guide/quick-start-guide-it.md)** — Guida rapida in italiano. Le altre 7 lingue si trovano nella cartella `guide/`.

---

## Documentazione Tecnica

- **[Whitepaper Architetturale](whitepaper_titan_architecture.md)** — Analisi approfondita dell'architettura, Producer-Consumer, OmniSync e sicurezza.
- **[Analisi Tecnica v1.7.6](analisi-tecnica.md)** — Report di criticità (P0–P3), dipendenze orfane e aree di miglioramento. Storico.
- **[Report YouTube](relazione-youtube.md)** — Diagnosi e soluzione al problema dei feed Atom YouTube (v1.0.5 → v1.3.1). Storico.

---

## Documentazione di Progetto

- **[Stato Progetto e Roadmap v2.0.0](STATO-PROGETTO.md)** — Tutto il completato (F1–F9, #11 autoUpdater, fix P0–P3). Prossimo step: repo bridge + Gumroad.
- **[Progetto Porting macOS + Linux](PROGETTO-PORTING.md)** — Strategia e implementazione della compatibilità cross-platform (v1.10.2).
- **[Progetto Modalità Server](PROGETTO-SERVER.md)** — Analisi della modalità headless/VPS. **Rimandato a tempo indeterminato.**
- **[Manutenzione Repository](manutenzione-archivio.md)** — Regole per la pulizia cache, cartelle build e archivio legacy.

---

## Storico Release (Changelog)

| Versione | Data | Descrizione |
| :--- | :--- | :--- |
| **[v1.10.10](changelogs/CHANGELOG_v1.10.10.md)** | Apr 2026 | "LogVault + UpdateFix": auto-updater race condition, virtual scroll log, buffer 5000 entry |
| **[v1.10.9](changelogs/CHANGELOG_v1.10.9.md)** | Apr 2026 | Hotfix: parser date YouTube abbreviate — v1.10.8 assegnava oggi a tutti gli item YouTube |
| **[v1.10.8](changelogs/CHANGELOG_v1.10.8.md)** | Apr 2026 | "Alignment": YouTube locale forcing (Innertube gl/hl='en'), audit e sincronizzazione documentazione completa |
| **[v1.10.7](changelogs/CHANGELOG_v1.10.7.md)** | Apr 2026 | "SilentGuard": `pending_queue` persistente per quiet hours — item non persi su feed con backlog corto. Schema DB v11 |
| **[v1.10.6](changelogs/CHANGELOG_v1.10.6.md)** | Apr 2026 | "SteelCore" Quality Patch: bugfix digest, NaN bypass cutoff, UTC threshold, warning start_date futura, electron-builder.yml consolidato |
| **[v1.10.5](changelogs/CHANGELOG_v1.10.5.md)** | Apr 2026 | "IronShield" Security Patch: filtro cutoff iper-pessimista, deduplica globale title_hash, ottimizzazione indici DB. Hotfix definitivo spamming YouTube |
| **[v1.10.4](changelogs/CHANGELOG_v1.10.4.md)** | Apr 2026 | Fix YouTube ID non deterministico via search-fallback post-500; CI cleanup: rimosso `build-release.yml` obsoleto |
| **[v1.10.3](changelogs/CHANGELOG_v1.10.3.md)** | Apr 2026 | #11 Auto-Updater nativo: `electron-updater` con bridge repo pubblico, download in background, banner install-ready, 8 lingue |
| **[v1.10.2](changelogs/CHANGELOG_v1.10.2.md)** | Apr 2026 | Compatibilità cross-platform: `crypto.ts` (safeStorage + AES-256-GCM), build macOS/Linux, GitHub Actions CI/CD |
| **[v1.10.1](changelogs/CHANGELOG_v1.10.1.md)** | Apr 2026 | Performance Mode UI: disabilita effetti GPU-heavy, persistente in `titan-settings.json`, 8 lingue |
| **[v1.10.0](changelogs/CHANGELOG_v1.10.0.md)** | Apr 2026 | Fix contrasto semantico: token success verde, DANGER ZONE rosso, BotSettingsModal allargato |
| **[v1.9.x](changelogs/CHANGELOG_v1.9.0.md)** | Mar 2026 | F6 Stats + F7 Preview + F8 OPML + F9 Digest Mode. v1.9.1: Obsidian Pulse V2 UI overhaul |
| **[v1.8.x](changelogs/CHANGELOG_v1.8.8.md)** | Mar 2026 | F4 Filtro keyword + F5 Scheduler per-feed. Schema v8+v9. Fix critico #27 anti-spam |
| **[v1.7.x](changelogs/CHANGELOG_v1.7.16.md)** | Mar 2026 | Fix sicurezza P0–P1 (safeStorage, sandbox, escapeUrl), stabilità, indici SQL, singleton lazy |
| **[v1.6.x](changelogs/v1.6.1.md)** | — | OmniSync `.rtb` portabilità bot cross-machine |
| **[v1.5.x](changelogs/v1.5.4.md)** | — | Template Smart Chips, editor visivo |
| **[v1.4.x](changelogs/v1.4.x.md)** | — | Quiet Hours, notifiche native OS, job queue asincrona |
| **[v1.3.x](changelogs/v1.3.x.md)** | — | YouTube InnerTube zero-config, logging ibrido, backup DB |
| **[v1.2.x](changelogs/v1.2.x.md)** | — | i18n 8 lingue, Import/Export JSON, cifratura token |
| **[v1.1.x](changelogs/v1.1.x.md)** | — | Settings overhaul, poll interval configurabile, statistiche |
| **[v1.0.x](changelogs/v1.0.x.md)** | — | Release ufficiale v1.0.0 (Titan Glass UI), patch parser |
| **[Legacy / Pre-Release](changelogs/legacy-pre-v1.md)** | — | Build 0.x, alpha, beta — passaggio da Python a TypeScript/Electron |

---

*(C) 2026 Simone Pizzi per Runtime Radio*
