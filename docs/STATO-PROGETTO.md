# Titan Desktop — Stato del Progetto e Roadmap verso v2.0.0

**Versione corrente:** v1.8.3  
**Ultimo aggiornamento:** 16 Aprile 2026  
**Repository:** https://github.com/Pitz72/Runtime-TelegramBot-Desktop-Titan-Edition  
**Stack:** Electron 32.3.3 · React 18.3.1 · TypeScript 5.9.3 · better-sqlite3 · Telegraf · Vite 5.4.21 · TailwindCSS

---

## ✅ Completato — tutto il lavoro fatto fino a v1.8.3

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

---

## 🔵 Aperto — Feature F2-F10

> **Nota:** I dettagli di F2-F10 provengono dall'analisi originale Gemini. Le descrizioni di F5-F10 non sono presenti nei documenti del repo e vanno definite prima di procedere.

### F2 — Retry Queue per invii falliti
Quando Telegram restituisce un errore su un item, il job viene scartato e l'item non viene marcato come `isProcessed`. Al ciclo successivo viene reinserito in coda e ritentato — portenzialmente all'infinito se l'errore è strutturale (es. template malformato, media non disponibile).  
**Soluzione proposta:** coda di retry con backoff esponenziale e numero massimo di tentativi (es. 3). Dopo N fallimenti, marcare l'item come processato con flag `failed=1` per evitare spam, e loggare l'errore con priorità `error`.

### F3 — Dashboard multi-bot (vista aggregata)
Attualmente la Dashboard mostra log e stats di un solo bot alla volta (quello selezionato). Con più bot attivi, non è possibile monitorare lo stato globale dell'engine.  
**Soluzione proposta:** vista aggregata nella console che mostri log di tutti i bot attivi con prefisso `[NomeBot]` (già presente nei log di `TitanLogger`), e indicatori di stato per ciascun bot nella sidebar.

### F4 — Filtro keyword sui feed
Possibilità di configurare per ogni feed una lista di parole chiave (includi/escludi). Un item viene accodato solo se il titolo o il summary soddisfa il filtro.  
**Soluzione proposta:** campo `keyword_filter TEXT` nella tabella `feeds` (JSON array), valutato in `processFeed()` prima dell'aggiunta alla `publishQueue`.

### F5 — Scheduler per-feed (intervallo individuale)
Attualmente il `check_interval` è a livello di bot e si applica a tutti i feed del bot. Feed con contenuto raro (es. YouTube mensile) vengono fetchati con la stessa frequenza di feed quotidiani.  
**Soluzione proposta:** colonna `check_interval INTEGER` nella tabella `feeds`, con fallback al valore del bot se `NULL`. `checkLoop()` skippa i feed il cui ultimo fetch è più recente del loro intervallo individuale.

### F6-F10 — Da definire
Le feature F6-F10 dell'analisi originale Gemini non sono documentate nel repo. **Vanno recuperate e aggiunte qui prima di procedere con il Blocco C.**

---

## ⚡ Aperto — Ottimizzazione UI (Performance Mode)

Segnalazione presente nella roadmap originale, mai numerata formalmente.

L'interfaccia "Titan Glass" può risultare pesante su risoluzioni 4K o macchine con GPU legacy (es. AMD con driver obsoleti).  
**Soluzione proposta:** Toggle "Performance Mode" nelle impostazioni di sistema che:
- Disabiliti le animazioni scanline (`scanline-sweep`) e i gradienti conici rotanti
- Sostituisca i `backdrop-blur` pesanti con colori solidi semi-trasparenti
- Riduca `box-shadow` animate per limitare i ricalcoli del compositore GPU
- Utilizzi `will-change` per ottimizzare i layer di animazione residui

---

## 🟠 Aperto — #11 autoUpdater nativo (ULTIMO step prima di v2.0.0)

**Questo è l'ultimo intervento prima del rilascio ufficiale della v2.0.0.**  
Viene implementato solo dopo che tutti i punti precedenti (F2-F10 + Performance Mode) sono completati e verificati.

**Problema attuale:** l'auto-updater è un semplice fetch di un JSON con comparazione di stringhe di versione. Non c'è download automatico, nessuna verifica firma, nessuna progress bar. L'utente deve scaricare manualmente l'installer.

**Soluzione pianificata:**
- Pacchetto: `electron-updater` (incluso in `electron-builder`)
- Provider: **GitHub Releases** — zero infrastruttura aggiuntiva, coincide con la repo pubblica
- Funzionalità: download automatico in background, verifica firma, progress bar, notifica "Riavvia per aggiornare"
- Il file `electron-builder.yml` va configurato con la sezione `publish`

---

## Ordine di esecuzione verso v2.0.0

```
[FATTO] Blocco A — Fix P2 (medie):      #13 #14 #15 #16 #17 #18 #19 #20  ✅
[FATTO] Blocco B — Fix P3 (lievi):      #21 #22 #23 #24 #25 #26          ✅
[FATTO] Feature F1 — Validatore Template                                   ✅
──────────────────────────────────────────────────────────────────────────
[TODO]  Blocco C — Feature:             F2 Retry Queue
                                        F3 Dashboard multi-bot
                                        F4 Filtro keyword
                                        F5 Scheduler per-feed
                                        F6-F10 (da definire)
[TODO]  Performance Mode (UI 4K/GPU)
──────────────────────────────────────────────────────────────────────────
[LAST]  #11 autoUpdater nativo (electron-updater + GitHub Releases)  →  v2.0.0
```
