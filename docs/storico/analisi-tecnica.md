# 🔍 Analisi Tecnica — Titan Desktop v1.7.6

> Redatta: 27/03/2026 | Aggiornata: 27/03/2026 (v1.7.7 security patch)
> Scope: codice sorgente completo (`src/`), package.json, dipendenze
> Autore analisi: Claude Sonnet 4.6

---

## Riepilogo Esecutivo

Il progetto è **funzionalmente completo e stabile**. L'architettura Producer-Consumer è solida, il DB SQLite con migrazioni deterministiche è ben strutturato, e l'i18n a 8 lingue è implementata in modo coerente.

Sono stati identificati **3 problemi gravissimi** (sicurezza), **5 gravi** (stabilità operativa) e una serie di problemi medi/lievi che impattano manutenibilità e qualità del codice.

**✅ Con la v1.7.7 (27/03/2026) le 3 criticità gravissime sono state risolte.**

---

## ✅ GRAVISSIME — RISOLTE IN v1.7.7

### ~~[C1] Export token Telegram in chiaro~~ ✅ RISOLTO in v1.7.7
**File:** `src/main/bot/manager.ts` — `exportConfig()`, `exportSingleBot()`
~~**Problema:** Le funzioni decriptano il token tramite `safeStorage` e lo reincludono nel JSON dell'`.rtb` **in plaintext**.~~
**Fix applicato:** Il token viene ora cifrato con **AES-256-CBC + IV casuale** prima dell'export. Backward compatible con file `.rtb` precedenti.

### ~~[C2] SSRF via URL feed non validati~~ ✅ RISOLTO in v1.7.7
**File:** `src/main/bot/parser.ts`, `src/main/bot/youtube.ts`
~~**Problema:** `parseURL(url)` eseguiva richieste HTTP su qualsiasi URL senza validazione.~~
**Fix applicato:** Nuova funzione `validateFeedUrl()` in `parser.ts` — blocca schemi non HTTP/HTTPS e tutti gli indirizzi privati/loopback (RFC-1918, link-local, localhost). Applicata in `fetchFeed()`, `fetchYouTubeVideos()` e negli handler IPC `add-feed`/`update-feed`.

### ~~[C3] Nessuna validazione input negli handler IPC~~ ✅ RISOLTO in v1.7.7
**File:** `src/main/ipc.ts` — tutti i 20+ handler
~~**Problema:** I parametri dal renderer (es. `id`, `checkInterval`, `url`, `sendFrom`) arrivano direttamente al BotManager e al DB senza validazione.~~
**Fix applicato:** Helper `assertString()`, `assertPositiveInt()`, `assertCheckInterval()`, `assertTimeOrDefault()`, `assertFeedType()` applicati su tutti gli handler critici. `check_interval` limitato a 1–1440, `send_from`/`send_until` validati con regex `HH:MM`.

---

## 🟠 GRAVI

### [G1] Race condition nel logger
**File:** `src/main/logger.ts` (L.53–54)
`flushIpcBuffer()` svuota `this.ipcBuffer = []` **prima** di completare l'invio IPC. Se `BrowserWindow` è chiusa nel frattempo, i log vengono persi silenziosamente.

### [G2] Memory leak nei TelegramClient
**File:** `src/main/bot/engine.ts` (L.93–98)
`this.clients` accumula istanze senza cleanup automatico quando un bot viene aggiornato. `removeClient()` è invocato solo alla cancellazione del bot.

### [G3] Database non chiuso alla chiusura normale
**File:** `src/main/database/schema.ts`, `src/main/index.ts`
`db.close()` è chiamato solo prima di `app.relaunch()`. All'uscita normale (X button, Cmd+Q) il WAL potrebbe non essere flushato completamente su VPS instabili.

### [G4] Flag errore YouTube non resettabile
**File:** `src/main/bot/engine.ts` (L.217–224)
`hasNotifiedYoutubeError = true` viene impostato al primo errore e **mai azzerato**. Se InnerTube si rompe e poi si riprende, l'utente non riceve più notifiche di errore fino al riavvio.

### [G5] Token in chiaro se `safeStorage` non disponibile
**File:** `src/main/bot/manager.ts` (L.8–23)
Se `safeStorage.isEncryptionAvailable()` restituisce `false` (alcuni VPS Linux headless), i token vengono restituiti senza cifratura e senza avvisare l'utente.

---

## 🟡 MEDIE

### ~~[M1] 4 dipendenze orfane in `package.json`~~ ✅ RISOLTO in v1.7.7
~~Mai importate in `src/`: `youtube-sr`, `yt-channel-info`, `ytpl`, `react-markdown`~~
**Fix applicato:** Rimosse tutte e 4 dal `package.json` in v1.7.7.

### [M2] `any` casting diffuso (30+ occorrenze)
Concentrato in `schema.ts` (pragma results), `manager.ts` (query results), `engine.ts`.
Annulla i benefici di TypeScript e rende difficile rilevare errori a compile-time.

### [M3] N+1 query nell'import config
**File:** `src/main/bot/manager.ts` — `importConfig()`
`SELECT id FROM feeds WHERE bot_id = ? ORDER BY id DESC LIMIT 1` è eseguita in loop per ogni feed importato. Con 50 feed: 50 query separate invece di 1.

### [M4] Abort non cancella richieste HTTP in corso
**File:** `src/main/bot/telegram.ts`, `engine.ts`
`abort()` imposta un flag ma non può interrompere un `await this.client.sendMessage(...)` già in corso. Nessun `AbortController` sulle chiamate Telegram.

### [M5] Pattern dialog duplicato 6+ volte
**File:** `src/main/ipc.ts`
Il blocco `dialog.showSaveDialog → writeFile → return { success, error }` è copiato identico per export-logs, export-database, export-config, export-single-bot. Refactoring in helper condiviso ridurrebbe ~60 righe.

### [M6] Regex HTML stripping incompleta
**File:** `src/main/bot/parser.ts` (L.49–56)
`/<[^>]*>?/gm` non gestisce `<![CDATA[...]]>`, commenti HTML `<!-- -->`, né `<script>` tag. Contenuto RSS con markup non standard non viene sanificato correttamente.

### [M7] Migrazioni legacy non atomiche
**File:** `src/main/database/schema.ts` — `runLegacyMigrations()`
I blocchi `try/catch` con `ALTER TABLE` singoli non hanno transazione globale. Disco pieno a metà migrazione → stato inconsistente senza rollback.

---

## ⚪ LIEVI

| ID | File | Descrizione |
|----|------|-------------|
| ~~L1~~ ✅ | `ipc.ts` | ~~Formato `HH:MM` per `send_from`/`send_until` non validato lato backend~~ — RISOLTO in v1.7.7 |
| L2 | `Dashboard.tsx` (L.55) | Stats polling ogni 30s hardcoded anche con engine fermo |
| L3 | `logger.ts` (L.26) | Batch interval 300ms fisso, non configurabile |
| L4 | vari | Logging inconsistente: mix italiano/inglese, emoji/testo tra moduli |
| L5 | `BotSelector.tsx` | Lista bot non virtualizzata — con molti bot ricrea tutto il DOM |
| L6 | `Dashboard.tsx` (L.268) | `setTimeout(3000)` hardcoded nello stop engine |
| L7 | generale | Zero unit/integration test su `manager.ts`, `parser.ts`, `engine.ts` |

---

## 💡 Aree di Miglioramento e Nuove Funzionalità

### Ad alto impatto utente

**Scheduler per-feed**
Ogni feed con il proprio `check_interval` indipendente da quello del bot. Un feed YouTube ogni 2h, breaking news ogni 5 min.

**Filtro keyword per feed**
Colonne `filter_include` / `filter_exclude` per feed: pubblica solo articoli che contengono certe parole chiave. Logica in `engine.ts` dopo il parsing.

**Anteprima messaggio prima dell'invio**
Bottone "Preview" nel FeedManager che mostra il messaggio Telegram renderizzato con il template attivo, prima dell'invio reale.

**Statistiche avanzate / grafici**
La tabella `history` ha già `sent_at`. Un `GROUP BY` per ora/giorno permette grafici di attività (post/giorno, per feed, per bot) con Recharts.

**Notifiche Telegram di sistema al proprietario**
Invio al bot owner di messaggi automatici quando il motore si avvia, si ferma o rileva errori critici — estensione del `template_startup` già implementato.

### Ad alto impatto operativo

**Web UI per controllo remoto su VPS headless**
Server HTTP minimale (Fastify) nel main process per start/stop/status tramite browser, eredità spirituale della `web_control/` del bot Python legacy.

**Chiusura graceful del DB alla exit**
`app.on('before-quit', () => { botEngine.stop(); db.close(); })` in `index.ts`.

**Reset automatico flag YouTube error**
Azzerare `hasNotifiedYoutubeError` dopo N cicli di successo o dopo un intervallo configurabile.

---

## 🚫 Migrazione a Tauri — Decisione Architetturale

**Scelta: mantenere Electron a tempo indeterminato.**

L'analisi di fattibilità ha concluso che la migrazione è tecnicamente possibile ma con costo/beneficio sfavorevole per un progetto mono-sviluppatore a uso interno:

- Frontend React: migrazione a costo zero
- Backend Rust (engine, DB, Telegram): ~3–4 settimane di riscrittura completa
- `youtubei.js` (InnerTube): **nessun equivalente Rust maturo** — richiederebbe sidecar Node.js o reimplementazione custom (~2 settimane aggiuntive)
- Sforzo totale stimato: **6–10 settimane**

Il progetto è nato su Electron, il suo ciclo di vita continuerà su Electron.

---

## Indice Problemi per Priorità di Fix

| Stato | Priorità | ID | Descrizione | File |
|---|---|---|---|---|
| ✅ v1.7.7 | 🔴 Critico | C1 | ~~Token in chiaro nell'export `.rtb`~~ | `manager.ts` |
| ✅ v1.7.7 | 🔴 Critico | C2 | ~~SSRF via URL feed non validati~~ | `parser.ts`, `youtube.ts` |
| ✅ v1.7.7 | 🔴 Critico | C3 | ~~Nessuna validazione IPC input~~ | `ipc.ts` |
| ✅ v1.7.7 | 🟡 Backlog | M1 | ~~4 dipendenze orfane~~ | `package.json` |
| ✅ v1.7.7 | ⚪ Lieve | L1 | ~~Formato HH:MM non validato~~ | `ipc.ts` |
| 🟠 Aperto | 🟠 Grave | G1 | Race condition logger | `logger.ts` |
| 🟠 Aperto | 🟠 Grave | G2 | Memory leak TelegramClient | `engine.ts` |
| 🟠 Aperto | 🟠 Grave | G3 | DB non chiuso alla exit | `schema.ts`, `index.ts` |
| 🟠 Aperto | 🟠 Grave | G4 | Flag YouTube error non resettato | `engine.ts` |
| 🟠 Aperto | 🟠 Grave | G5 | Token in chiaro senza safeStorage | `manager.ts` |
| 🟡 Aperto | 🟡 Medio | M2 | `any` casting diffuso | vari |
| 🟡 Aperto | 🟡 Medio | M3 | N+1 query import config | `manager.ts` |
| 🟡 Aperto | 🟡 Medio | M4 | Abort non cancella HTTP | `telegram.ts` |
| 🟡 Aperto | 🟡 Medio | M5 | Pattern dialog duplicato | `ipc.ts` |
| 🟡 Aperto | 🟡 Medio | M6 | Regex HTML incompleta | `parser.ts` |
| 🟡 Aperto | 🟡 Medio | M7 | Migrazioni legacy non atomiche | `schema.ts` |
| ⚪ Aperto | ⚪ Lieve | L2 | Stats polling 30s hardcoded | `Dashboard.tsx` |
| ⚪ Aperto | ⚪ Lieve | L3 | Log batch interval 300ms fisso | `logger.ts` |
| ⚪ Aperto | ⚪ Lieve | L4 | Logging inconsistente | vari |
| ⚪ Aperto | ⚪ Lieve | L5 | BotSelector non virtualizzato | `BotSelector.tsx` |
| ⚪ Aperto | ⚪ Lieve | L6 | `setTimeout(3000)` hardcoded | `Dashboard.tsx` |
| ⚪ Aperto | ⚪ Lieve | L7 | Zero unit test | generale |

---

*(C) 2026 Runtime Radio — Documento interno, non distribuire*
