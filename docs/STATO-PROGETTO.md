# Titan Desktop — Stato del Progetto e Roadmap verso v2.0.0

**Versione corrente:** v1.10.1  
**Ultimo aggiornamento:** 18 Aprile 2026  
**Repository:** https://github.com/Pitz72/Runtime-TelegramBot-Desktop-Titan-Edition  
**Stack:** Electron 32.3.3 · React 18.3.1 · TypeScript 5.9.3 · better-sqlite3 · Telegraf · Vite 5.4.21 · TailwindCSS

---

## ✅ Completato — tutto il lavoro fatto fino a v1.8.5

### Sicurezza (P0 — Gravissime)
- ✅ **#1** Segreto crittografico hardcoded rimosso — `safeStorage` Electron per cifratura token `.rtb`, vincolati alla macchina *(v1.7.10)*
- ✅ **#2** `sandbox: false` nel renderer → `sandbox: true`, chiuso vettore RCE da XSS dei feed *(v1.7.12)*
- ✅ **#3** Escape delle URL nei messaggi Telegram — `escapeUrl()` separa `&` → `&amp;` in `{{link}}` e `item.image`; eliminato loop retry infinito *(v1.7.8)*
- ✅ **#4** Eliminazione bot con engine attivo — purge `publishQueue` + `removeClient()` + safety check pre-`DELETE` *(v1.7.13)*
- ✅ **#5** Dipendenze criticamente obsolete — Electron 28→32.3.3, Vite 4→5.4.21, TS 5.3→5.9.3, React 18.2→18.3.1, electron-builder 24→25.1.8 *(v1.7.14)*

### Stabilità e Architettura (P1 — Gravi)
- ✅ **#6** Items posposti durante quiet hours — analisi rivista: NON è un bug. `cutoffDate` è fisso, gli item vengono trovati al ciclo successivo. Nessun fix.
- ✅ **#7** Date YouTube stimate male — parser robusto multilingua ("ago"/"fa"). Fallback: data 1/1/2000 invece di "adesso" per bloccare spam *(v1.7.11)*
- ✅ **#8** Log IPC duplicati (`bot-log` + `bot-logs-batch`) — `TelegramClient.logToUI()` delega a `TitanLogger`, canale unico `bot-logs-batch` *(v1.7.8)*
- ✅ **#9** Token Telegram visibile in chiaro — campo `type="password"` + toggle Eye/EyeOff in `BotSettingsModal`, fisso `password` in `BotSelector` *(v1.7.8)*
- ✅ **#10** Nessuna validazione file `.rtb` importati — `validateRtbBot` + `validateRtbFeed` in `manager.ts`, stesse regole IPC, fail-fast prima della transazione SQLite *(v1.7.15)*
- ✅ **#12** Stringhe hardcoded non tradotte — `t('botSelector.successDelete')`, etichette status bot, aggiunte chiavi in tutti e 8 i file locale *(v1.7.8)*

### Fix Tecnici (P2 — Medie)
- ✅ **#13** Nessun indice SQL su `history` — `idx_history_bot_id` e `idx_history_bot_id_sent_at`; idempotenti, applicati a schema iniziale e migration v6 *(v1.7.16)*
- ✅ **#14** Singleton mutabile globale `botEngine` — sostituito con `getBotEngine()` lazy singleton; istanza creata al primo handler IPC *(v1.7.16)*
- ✅ **#15** `dynamic import('electron')` nel loop di publish — `Notification` importata staticamente in cima a `engine.ts`; rimosso `import('electron').then(...)` ad ogni item *(v1.7.16)*
- ✅ **#16** `db` variabile globale mutabile — `getDB()` lazy singleton in `schema.ts`; `manager.ts` e `ipc.ts` aggiornati; istanza creata dentro `initDB()` *(v1.8.1)*
- ✅ **#17** Nessun rate-limiting con molti feed — delay 1s inter-feed in `checkLoop()`; warning log se `publishQueue > 50`; feed disabilitati filtrati prima del loop *(v1.8.2)*
- ✅ **#18** `isActive` booleano vs intero inconsistente — `getBots()` e `getFeeds()` normalizzano 0/1 SQLite → `boolean` TypeScript con cast esplicito *(v1.8.1)*
- ✅ **#19** YouTube Innertube senza cache — cache in-memory 5min TTL, chiave = channel ID normalizzato; invalidazione su `resetYouTubeSession()` e `BotEngine.stop()` *(v1.8.2)*
- ✅ **#20** Backup creato prima delle migrazioni — backup condizionale `if (currentVersion < 6)`, eseguito solo quando ci sono migrazioni da applicare *(v1.8.1)*

### Fix Lievi e Pulizia (P3)
- ✅ **#21** ErrorBoundary non tradotto — dizionario locale di emergenza a 8 lingue, indipendente da i18n Context *(v1.7.8)*
- ✅ **#22** `key={i}` instabile nei log — sostituito con `key={log.id}` (contatore monotono assegnato da `TitanLogger`) *(v1.8.3)*
- ✅ **#23** Nessun logging strutturato — `LogEntry { id, level, message }` in `shared/types.ts`; `TitanLogger` emette `LogEntry[]`; `detectLevel()` da emoji/keyword; Dashboard colora da `log.level` *(v1.8.3)*
- ✅ **#24** File di build log nella root — rimossi `build_log.txt`, `build_log_2.txt`, `build_log_3.txt` *(v1.8.3)*
- ✅ **#25** Doppia dichiarazione `build` in `package.json` — pattern `files`/`asarUnpack` consolidati nel campo `"build"`, `electron-builder.yml` allineato *(v1.7.8)*
- ✅ **#26** Due file LICENSE nella root — rimosso `LICENSE.txt` duplicato, mantenuto `LICENSE` *(v1.8.3)*

### Build
- ✅ **Build bloat** — installer da 1.5 GB → **80.9 MB** (-95%), asar da 1.5 GB → 17 MB (-99%). Fix: pattern `files` espliciti + `ssr.noExternal` (poi rimosso in v1.7.15 non necessario per lib mode) *(v1.7.8)*

### Feature
- ✅ **F1** Validatore Intelligente dei Template — `templateValidator.ts` con 9 check: tag non supportati, tag non bilanciati, `<a>` senza `href`, chip sconosciuti, chip pericolosi in `href`, template vuoto, chip nel messaggio di avvio. Feedback real-time in `TemplateEditor.tsx` (bordo colorato + pannello messaggi). Localizzazione completa per 9 lingue. *(v1.8.0)*
- ✅ **F2** Retry Queue per invii falliti — `PublishJob.retryCount`, `MAX_RETRIES = 3`. Su `success = false`: re-accoda con `retryCount + 1` (log `⚠️`); a esaurimento: `markProcessed()` per spezzare loop infinito (log `❌`). *(v1.8.4)*
- ✅ **F3** Dashboard multi-bot — Dot stato `is_active` per ogni bot nella sidebar (verde/grigio, nome attenuato se disabilitato). Toggle `ALL BOTS / THIS BOT` nel header del log: filtra client-side per `[NomeBot]`, reset automatico al cambio bot, i18n 8 lingue. *(v1.8.5)*
- ✅ **#27** Bug critico anti-spam — doppio check `isProcessed()`: MD5 link (primario) + MD5 titolo normalizzato per stesso feed (safety net). Schema v7 con `title_hash TEXT`, backfill automatico, indice `idx_history_title_dedup`. Zero spam su cambio URL publisher. *(v1.8.6)*
- ✅ **F4** Filtro keyword sui feed — `keyword_filter TEXT` (JSON) nella tabella `feeds`. `passesKeywordFilter()` in `engine.ts`: filtra per include/exclude case-insensitive su titolo+summary prima dell'accodamento. UI in FeedManager con bordi colorati (verde=include, rosso=exclude) e badge ambra `filtro attivo`. Schema v8, migration automatica, export/import .rtb incluso. 8 lingue. *(v1.8.8)*
- ✅ **F5** Scheduler per-feed — `check_interval INTEGER` e `last_fetch_at DATETIME` nella tabella `feeds`. `isFeedDue()` in `engine.ts` skippa i feed il cui ultimo fetch è più recente dell'intervallo individuale. `BotManager.updateFeedLastFetch()` aggiornato dopo ogni fetch. UI in FeedManager con select preset (null/5/15/30/60/120/240/480/1440 min) e badge cyan con intervallo custom. Schema v9, migration automatica, export/import .rtb incluso. 8 lingue. *(v1.8.8)*
- ✅ **F6** Statistiche/Analytics dettagliate — `BotManager.getDetailedStats()` con breakdown per feed. IPC `get-detailed-stats`. `StatsModal.tsx`: 3 contatori (oggi/7gg/totale) + barre per feed ordinate per volume. Accessibile dal click sull'icona BarChart3 nella dashboard. 8 lingue. *(v1.9.0)*
- ✅ **F7** Preview Template — Bottone "Anteprima" in ogni `TemplateEditor` (solo se template non vuoto). Renderizza inline con dati campione sostituiti (titolo, feedName, link, summary). Client-side, nessun IPC aggiuntivo. 8 lingue. *(v1.9.0)*
- ✅ **F8** Import OPML — Bottone OPML in `FeedManager`. IPC `import-opml(botId)`: dialog file → parser regex OPML → `addFeed` per ogni `<outline xmlUrl>` valido (tipo=news, validazione anti-SSRF). Nessuna dipendenza esterna. 8 lingue. *(v1.9.0)*
- ✅ **F9** Digest Mode — `digest_interval INTEGER` e `digest_last_sent DATETIME` su feeds. Tabella `digest_queue` (UNIQUE bot+feed+item). In `processFeed`: se feed ha digest_interval, item va in digest_queue + `markProcessed` invece di publish_queue. `processDigests()` in engine: invia digest scaduti (header + lista numerata, max 20 item), aggiorna `digest_last_sent`, svuota coda. Schema v10, migration e safety check. UI: select preset (1h/6h/12h/24h/7gg) + badge viola. Export/import .rtb. 8 lingue. *(v1.9.0)*
- ✅ **UI v1.9.1** Obsidian Pulse V2 overhaul — Phosphor Icons (zero Lucide), Space Grotesk + Fira Code, palette semantica MD3, glass-panel/ghost-border/ignition-btn utilities, micro-copy decorativo, ambient halos. *(v1.9.1)*
- ✅ **UI v1.10.0** Fix contrasto e colori semantici — token `success` verde (#4ade80), stato ONLINE/Attivo/Attivato in verde, DANGER ZONE in rosso pieno, label contrasto aumentato, BotSettingsModal allargato a max-w-6xl. *(v1.10.0)*
- ✅ **Performance Mode UI** — Toggle "Performance Mode" nelle Impostazioni di Sistema. Disabilita scanline overlay, backdrop-blur (sostituito con sfondo solido), glow/box-shadow/text-shadow luminosi, animazioni ignition-pulse e ignition-ring. Persistente in `titan-settings.json` in userData. Localizzato in 8 lingue. Effettivo immediatamente senza riavvio. *(v1.10.1)*

---

## ❌ Cancellato — Feature F10

F10 non è mai stata definita concretamente — era un placeholder. **Cancellata.**  
L'idea di modalità server/headless è stata separata in [`docs/PROGETTO-SERVER.md`](PROGETTO-SERVER.md) come progetto post-v2.0.0.

---

## 🟠 Aperto — #11 autoUpdater nativo (ULTIMO step prima di v2.0.0)

**Questo è l'ultimo intervento prima del rilascio ufficiale della v2.0.0.**  
Viene implementato solo dopo che tutti i punti precedenti (F4-F9 + Performance Mode) sono completati e verificati.

**Problema attuale:** l'auto-updater è un semplice fetch di un JSON con comparazione di stringhe di versione. Non c'è download automatico, nessuna verifica firma, nessuna progress bar. L'utente deve scaricare manualmente l'installer.

**Soluzione pianificata:**
- Pacchetto: `electron-updater` (incluso in `electron-builder`)
- Provider: **GitHub Releases** — zero infrastruttura aggiuntiva, coincide con la repo pubblica
- Funzionalità: download automatico in background, verifica firma, progress bar, notifica "Riavvia per aggiornare"
- Il file `electron-builder.yml` va configurato con la sezione `publish`

---

## Ordine di esecuzione verso v2.0.0

**Documenti di progetto post-v2.0.0:**
- [`docs/PROGETTO-PORTING.md`](PROGETTO-PORTING.md) — build Linux + macOS via GitHub Actions
- [`docs/PROGETTO-SERVER.md`](PROGETTO-SERVER.md) — modalità headless/VPS (post-porting)

```
[FATTO] Blocco A — Fix P2 (medie):      #13 #14 #15 #16 #17 #18 #19 #20  ✅
[FATTO] Blocco B — Fix P3 (lievi):      #21 #22 #23 #24 #25 #26          ✅
[FATTO] Feature F1 — Validatore Template                                   ✅
[FATTO] Feature F2 — Retry Queue (MAX_RETRIES=3, markProcessed)            ✅
[FATTO] Feature F3 — Dashboard multi-bot (dot sidebar, toggle log ALL/BOT) ✅
──────────────────────────────────────────────────────────────────────────
[FATTO] Feature F4 — Filtro keyword sui feed                                ✅
[FATTO] Feature F5 — Scheduler per-feed (intervallo individuale)            ✅
──────────────────────────────────────────────────────────────────────────
[FATTO] Feature F6 — Statistiche/Analytics dettagliate per feed             ✅
[FATTO] Feature F7 — Preview Template inline con dati campione              ✅
[FATTO] Feature F8 — Import OPML (bulk import feed da file standard)        ✅
[FATTO] Feature F9 — Digest Mode (accumula item, invia un messaggio)        ✅
──────────────────────────────────────────────────────────────────────────
[FATTO] Performance Mode UI (toggle Impostazioni Sistema, 8 lingue)         ✅  ← v1.10.1
[CANC]  Feature F10 — mai definita, cancellata                              ❌
──────────────────────────────────────────────────────────────────────────
[LAST]  #11 autoUpdater nativo (electron-updater + GitHub Releases)  →  v2.0.0
```
