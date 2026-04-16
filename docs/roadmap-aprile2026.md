# Analisi Tecnica e Prossimi Step (01 Aprile 2026)

Durante l'assistenza odierna sono state identificate delle criticità nel motore di invio e nella gestione dei template, che andranno risolte nelle prossime release.

## 🐛 Bug Identificati

### 1. ~~Mancato Escape delle URL (telegram.ts)~~ ✅ RISOLTO in v1.7.8
- **Problema**: I campi `{{link}}` e `item.image` (nel `previewHack`) vengono inseriti nei tag HTML senza codifica. Se la URL contiene un carattere `&` (comune in WordPress e podcast), Telegram fallisce il parsing dell'entità HTML.
- **Sintomo**: Il bot tenta l'invio 5 volte ( timeout di ~30s) e poi logga "Send failed", entrando in un loop infinito di tentativi ad ogni scansione del feed.
- **Soluzione applicata**: Introdotta `escapeUrl()` separata dall'escape generico, applicata a `item.link` e `item.image`.

### 2. ~~Log "Ciechi" nell'Interfaccia~~ ✅ RISOLTO in v1.7.8
- **Problema**: Gli errori dettagliati di Telegram (es. `Bad Request: can't parse entities`) vengono inviati su un canale IPC (`bot-log`) che il frontend (`Dashboard.tsx`) attualmente ignora. L'utente vede solo un generico "Send failed" dai log dell'engine.
- **Soluzione applicata**: `TelegramClient.logToUI()` ora delega a `TitanLogger.log()`, unificando tutti i log su un unico canale `bot-logs-batch`.

---

## 🚀 Nuove Funzionalità Proposte

### ~~Sistema di Verifica Intelligente dei Template~~ ✅ IMPLEMENTATO in v1.8.0
~~Implementare un validatore in tempo reale (nel componente `TemplateEditor.tsx` o `BotSettingsModal.tsx`) che:~~
~~- Verifichi che tutti i tag HTML siano chiusi correttamente (es. evitare errori come `<\a>`).~~
~~- Verifichi l'uso di soli tag supportati da Telegram (b, i, u, code, pre, a).~~
~~- Avvisi l'utente se i segnaposto (Smart Chips) sono inseriti in posizioni che potrebbero rompere la sintassi (es. dentro un attributo senza escape).~~

> **Implementato in v1.8.0 (16 Aprile 2026):** Validatore sincrono `templateValidator.ts` integrato nel `TemplateEditor.tsx` con feedback real-time. 9 tipi di check: tag non supportati, tag non bilanciati, `<a>` senza `href`, chip sconosciuti, chip pericolosi in `href`, template vuoto, chip nel messaggio di avvio. Bordo textarea colorato in base allo stato. Localizzazione completa (9 lingue). Vedere `docs/changelogs/CHANGELOG_v1.8.0.md`.

---

## ⚡ Ottimizzazioni UI e Prestazioni

### Risoluzione Issue Lag (Ambienti 4K / GPU Legacy)
L'interfaccia "Titan Glass" può risultare pesante su risoluzioni elevate (4K) o macchine con accelerazione hardware instabile (es. GPU AMD con driver obsoleti).
- **Soluzione Proposta**: Implementare una "Performance Mode" (Toggle nelle impostazioni) che:
    - Disabiliti le animazioni scanline (`scanline-sweep`) e i gradienti conici rotanti.
    - Rimpiazzi i blur pesanti (`backdrop-blur`) con colori solidi semi-trasparenti più leggeri.
    - Riduca l'uso di `box-shadow` animate per limitare i ricalcoli del compositore della GPU.
- **Tecnico**: Utilizzare la proprietà CSS `will-change` per ottimizzare i layer di animazione rimasti attivi.

---

## 📦 Build Bloat — ✅ RISOLTO in v1.7.8
- **Problema**: L'installer Windows era cresciuto da ~94 MB (v1.7.6) a 1.5 GB a causa dell'inclusione non necessaria dell'intero `node_modules` nell'asar (SSR mode externalizzava tutto + config electron-builder duplicata con precedenza errata).
- **Soluzione applicata**: `ssr.noExternal: true` in `vite.config.ts` + pattern `files` espliciti in `package.json`. Installer ridotto a **80.9 MB**.

---

## 🗺️ Roadmap verso v2.0.0 (annotazione 13 Aprile 2026)

Tutti i punti aperti nel documento di analisi Gemini verranno risolti prima del rilascio della **v2.0.0**.
L'ordine di priorità previsto è:

### Blocco A — Fix tecnici (P2, medie)
- **#13** Aggiungere indici SQL sulla tabella `history`
- **#18** Normalizzare `isActive` booleano vs intero
- **#20** Spostare il backup **dopo** le migrazioni
- **#16** Rimuovere `db` come variabile globale mutabile
- ~~**#14** Rimuovere singleton mutabile globale `botEngine`~~ ✅ FATTO v1.7.16
- ~~**#15** Eliminare `dynamic import('electron')` dentro loop~~ ✅ FATTO v1.7.16
- **#17** Implementare rate-limiting per bot con molti feed
- **#19** Aggiungere cache/throttle a YouTube Innertube

### Blocco B — Lievi e UI
- **#22** Sostituire `key={i}` (indice) con ID stabili nei log
- **#23** Introdurre logging strutturato
- **#24** Rimuovere/spostare i file di build log dalla root
- **#26** Rimuovere il file LICENSE duplicato dalla root
- ~~**F1 — Validatore Intelligente dei Template**~~ ✅ FATTO v1.8.0
- **F2–F10** Feature rimanenti (retry queue, dashboard multi-bot, filtro keyword, scheduler per-feed, ecc.)

### Blocco C — Feature grandi
- Feature F2–F10 del documento Gemini (validatore template già fatto)

### 🔴 Ultimo punto prima del rilascio v2.0.0
> **#11 — `autoUpdater` nativo (electron-updater + GitHub Releases)**
>
> Questo sarà il **LAST** intervento prima del rilascio ufficiale della **v2.0.0**.
> Verrà implementato solo dopo che tutti i punti precedenti (fix, ottimizzazioni e feature)
> saranno completati e verificati. L'obiettivo è garantire che la prima versione major
> disponga già di un sistema di aggiornamento automatico nativo e firmato.

---
*Note registrate il 01/04/2026, aggiornate il 12/04/2026 con le risoluzioni della v1.7.8*
*Roadmap v2.0.0 annotata il 13/04/2026*
*Aggiornata il 16/04/2026 — v1.8.0: F1 Validatore Template implementato. #13/#14/#15 risolti in v1.7.16.*
