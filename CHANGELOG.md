# Runtime TelegramBot Titan Edition — Changelog

Questa è la storia delle versioni del progetto, suddivisa in blocchi di versione per maggiore consultabilità:

- [v2.1.9 (Corrente)](docs/changelogs/CHANGELOG_v2.1.9.md) — Sola interfaccia, nessun cambiamento al motore. Schermata iniziale: «Titan Edition» non si spezza più a metà, il credito agli LLM e alla direzione del progetto passa da 2,0:1 a 7,13:1 di contrasto, bandiere centrate, scritta decorativa `INIT_SEQ` rimossa. Impostazioni di Sistema: la scheda «Generale» va su due colonne e il modale non esce più dallo schermo; le tre schede hanno tutte la stessa misura.
- [v2.1.8 (Archivio)](docs/changelogs/CHANGELOG_v2.1.8.md) — **Prima release da progetto aperto.** Licenza MIT e sorgente pubblico su `Pitz72`. Audit di sicurezza: token redatti dai log, istanza singola, URL dei feed blindati negli `href`, anti-SSRF esteso con risoluzione DNS. Il campo della data si chiama «Data di Partenza» anche nelle impostazioni del bot. Lingue da otto a due (italiano e inglese). Manuali, guide e «leggimi» rivisti e ripuliti dai residui commerciali. Le release escono ora sulla repository del progetto, non più sulla ponte.
- [v2.1.7 (Archivio)](docs/changelogs/CHANGELOG_v2.1.7.md) — Rifiniture: nome prodotto uniforme «Runtime TelegramBot Desktop Titan Edition» ovunque (via «Titan Desktop»), icona nella barra applicazioni Windows (icona finestra .ico), schermata «Novità» affidabile anche aggiornando da versioni precedenti, banner aggiornato.
- [v2.1.6 (Archivio)](docs/changelogs/CHANGELOG_v2.1.6.md) — Documentazione in-app: guida rapida a schermo nella lingua corrente, download del manuale d'uso completo in PDF, e nuova schermata «Novità» al primo avvio dopo un aggiornamento. Consolidamento branding Titan. Rilascio commerciale v2.
- [v2.1.5 (Archivio)](docs/changelogs/CHANGELOG_v2.1.5.md) — Scansione RSS parallela (pool di concorrenza, Fix B), UX aggiornamenti ridisegnata con conferma download/riavvio, fix accavallamento righe log nella console.
- [v2.1.4 (Archivio)](docs/changelogs/CHANGELOG_v2.1.4.md) — Fix link Spreaker (deriva la pagina episodio dal guid api.spreaker.com), chiusura DB pulita su before-quit con checkpoint WAL (G3), HTML stripping robusto in cleanSummary (M6), perf: botExists() al posto di getBots().some() nei loop caldi (niente più decifratura di massa dei token).
- [v2.1.3 (Archivio)](docs/changelogs/CHANGELOG_v2.1.3.md) — Fix YouTube "0 video": YouTube serve le liste canale come nodi LockupView che youtubei.js 17.0.1 non parsa; aggiunto fallback di estrazione autocontenuto (logica PR upstream #1163, non ancora su npm). Non era antibot.
- [v2.1.2 (Archivio)](docs/changelogs/CHANGELOG_v2.1.2.md) — Rifiniture (criticità lievi): stat oggi/settimana sul giorno locale, ID log locali senza collisioni, stato motore sincronizzato al mount (get-bot-status), metadata package.json.
- [v2.1.1 (Archivio)](docs/changelogs/CHANGELOG_v2.1.1.md) — Robustezza (criticità medie): fix fuso orario su last_fetch_at/digest_last_sent, reset Innertube solo dopo 5 errori consecutivi, pruning history (cap 20k/bot), validazione IPC get-feeds/toggle-feed.
- [v2.1.0 (Archivio)](docs/changelogs/CHANGELOG_v2.1.0.md) — IronShield v2: deduplica per titolo scoped per content_type (video YouTube e articolo RSS omonimi non si bloccano più) — schema DB v12. + Validazione file in import-database. + Token illeggibili non più silenziosi.
- [v2.0.4 (Archivio)](docs/changelogs/CHANGELOG_v2.0.4.md) — Hardening stabilità: `unhandledRejection` non chiude più l'app + messa in sicurezza della catena async dell'engine (`.catch` su `processPublishQueue`/`checkLoop`, `try/catch` per-job).
- [v2.0.3 (Archivio)](docs/changelogs/CHANGELOG_v2.0.3.md) — Mitigazione rate-limit YouTube: stop reset Innertube su 0 risultati + backoff inter-feed 5s. Issue upstream LuanRT/YouTube.js#1166 chiusa server-side.
- [v2.0.2 (Archivio)](docs/changelogs/CHANGELOG_v2.0.2.md) — Fix auto-updater OTA: artifact name senza spazi — risolto 404 al download aggiornamento.
- [v2.0.1 (Archivio)](docs/changelogs/CHANGELOG_v2.0.1.md) — Hotfix: race condition drain+processFeed — doppio invio podcast al termine delle quiet hours.
- [v2.0.0 (Archivio)](docs/changelogs/CHANGELOG_v2.0.0.md) — "Titan Blue": redesign UI completo — palette pure blue (#3b82f6), deep black background (#050510), migrazione totale Phosphor Icons → Lucide React.
- [v1.10.11 (Archivio)](docs/changelogs/CHANGELOG_v1.10.11.md) — "CleanTube": rimosso locale forcing YouTube (gl/hl=en) che causava 0 item e session reset su diversi canali.
- [v1.10.10 (Archivio)](docs/changelogs/CHANGELOG_v1.10.10.md) — "LogVault + UpdateFix": auto-updater race condition fix, virtual scroll log panel, buffer 5000 entry (12-24h).
- [v1.10.9 (Archivio)](docs/changelogs/CHANGELOG_v1.10.9.md) — Hotfix: parser date YouTube abbreviate ("3mo ago", "1y ago") — v1.10.8 assegnava la data odierna a tutti gli item YouTube.
- [v1.10.8 (Archivio)](docs/changelogs/CHANGELOG_v1.10.8.md) — "Alignment": YouTube locale forcing (gl/hl='en'), audit documentazione completo, sincronizzazione docs/index.md e STATO-PROGETTO.md.
- [v1.10.7 (Archivio)](docs/changelogs/CHANGELOG_v1.10.7.md) — "SilentGuard": pending_queue persistente per quiet hours — item non persi più su feed con backlog corto. Schema DB v11.
- [v1.10.6 (Archivio)](docs/changelogs/CHANGELOG_v1.10.6.md) — "SteelCore" Quality Patch: bugfix digest (ordine operazioni), bugfix NaN bypass cutoff, fix UTC threshold anti-spam, warning start_date futura, consolidamento electron-builder.yml.
- [v1.10.5 (Archivio)](docs/changelogs/CHANGELOG_v1.10.5.md) — "IronShield" Security Patch: filtro cutoff iper-pessimista, deduplica globale title_hash per bot, ottimizzazione indici DB. Hotfix definitivo bug spamming YouTube.
- [v1.10.4 (Archivio)](docs/changelogs/CHANGELOG_v1.10.4.md) — Fix YouTube ID non deterministico via search-fallback (regressione intermittente post-500); CI cleanup: rimosso build-release.yml obsoleto.
- [v1.10.3 (Archivio)](docs/changelogs/CHANGELOG_v1.10.3.md) — #11 Auto-Updater nativo: `electron-updater` con bridge repo pubblico su `Ecosystem-Runtime`, download in background, banner install-ready, 8 lingue.
- [v1.10.2 (Archivio)](docs/changelogs/CHANGELOG_v1.10.2.md) — Compatibilità cross-platform macOS + Linux: crypto.ts wrapper (safeStorage + AES-256-GCM fallback), config build mac/linux, GitHub Actions CI/CD build automatica per tutti e tre i SO.
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

## Versione Attuale: v2.1.9

Per i dettagli dell'ultima versione, consulta [docs/changelogs/CHANGELOG_v2.1.9.md](docs/changelogs/CHANGELOG_v2.1.9.md).

## Storia dello sviluppo

Il quadro completo del lavoro fino alla serie 2.0 — feature F1-F9, Performance Mode, auto-updater — è in [docs/storico/STATO-PROGETTO.md](docs/storico/STATO-PROGETTO.md), documento d'epoca non più aggiornato.

Per la documentazione attuale: [docs/README.md](docs/README.md).
