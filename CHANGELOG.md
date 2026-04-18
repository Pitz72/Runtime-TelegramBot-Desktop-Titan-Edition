# Runtime TelegramBot Titan Edition — Changelog

Questa è la storia delle versioni del progetto, suddivisa in blocchi di versione per maggiore consultabilità:

- [v1.10.2 (Corrente)](docs/changelogs/CHANGELOG_v1.10.2.md) — Compatibilità cross-platform macOS + Linux: crypto.ts wrapper (safeStorage + AES-256-GCM fallback), config build mac/linux, GitHub Actions CI/CD build automatica per tutti e tre i SO.
- [v1.10.1 (Archivio)](docs/changelogs/CHANGELOG_v1.10.1.md) — Performance Mode UI: toggle per disabilitare scanline, backdrop-blur, glow e animazioni GPU-heavy. Persistente in `titan-settings.json`. 8 lingue.
- [v1.10.0 (Archivio)](docs/changelogs/CHANGELOG_v1.10.0.md) — Fix contrasto e colori semantici: token success verde (#4ade80), DANGER ZONE rosso pieno, label contrasto, BotSettingsModal max-w-6xl.
- [v1.9.x (Archivio)](docs/changelogs/CHANGELOG_v1.9.0.md) — v1.9.0: F6 Stats Analytics + F7 Preview Template + F8 OPML Import + F9 Digest Mode (schema v10). v1.9.1: Obsidian Pulse V2 overhaul (Phosphor Icons, Space Grotesk, palette MD3).
- [v1.8.x (Archivio)](docs/changelogs/CHANGELOG_v1.8.8.md) — v1.8.8. F4: Filtro keyword per feed. F5: Scheduler per-feed. Schema v8+v9. v1.8.6: Bug fix critico #27 anti-spam.
- [v1.7.x (Archivio)](docs/changelogs/CHANGELOG_v1.7.16.md) — v1.7.14–v1.7.16. Fix tecnici: indici SQL su history, singleton botEngine lazy, rimosso import dinamico electron nel loop di publish.
- [v1.6.x (Archivio)](docs/changelogs/v1.6.1.md) — v1.6.0–v1.6.1: OmniSync `.rtb` (portabilità bot cross-machine) e fix stabilità.
- [v1.5.x (Archivio)](docs/changelogs/v1.5.4.md) — v1.5.0–v1.5.4: Template messaggi personalizzabili con Smart Chips, editor visivo integrato.
- [v1.4.x (Archivio)](docs/changelogs/v1.4.x.md) — v1.4.0–v1.4.2: Quiet Hours, notifiche native OS, job queue asincrona.
- [v1.3.x (Archivio)](docs/changelogs/v1.3.x.md) — v1.3.0–v1.3.5: Integrazione YouTube InnerTube zero-config, logging ibrido, backup DB, Error Boundaries.
- [v1.2.x (Archivio)](docs/changelogs/v1.2.x.md) — v1.2.x: Internazionalizzazione i18n a 8 lingue, Import/Export JSON, cifratura token, Custom Toasts.
- [v1.1.x (Archivio)](docs/changelogs/v1.1.x.md) — Major Feature Release: settings overhaul, poll interval configurabile, statistiche.
- [v1.0.x (Release Iniziali)](docs/changelogs/v1.0.x.md) — Release ufficiale v1.0.0 (Titan Glass UI) e patch correttive del parser.
- [Legacy / Pre-Release (Alpha, Beta)](docs/changelogs/legacy-pre-v1.md) — Cronologia pre-release: build 0.x, alpha, beta e cicli numerici primordiali precedenti alla v1.

## Versione Attuale: v1.10.2

Per i dettagli dell'ultima versione, consulta [docs/changelogs/CHANGELOG_v1.10.2.md](docs/changelogs/CHANGELOG_v1.10.2.md).

## Stato progetto e roadmap verso v2.0.0

Consulta [docs/STATO-PROGETTO.md](docs/STATO-PROGETTO.md) per il quadro completo: tutto il completato, le feature aperte F3-F10, la Performance Mode e #11 autoUpdater (ultimo step prima di v2.0.0).
