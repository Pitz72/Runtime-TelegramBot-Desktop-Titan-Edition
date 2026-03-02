# Runtime TelegramBot Titan Edition — Changelog

---

# v1.4.1 (2026-02-17)

### 🚨 Critical Fixes
- **Spam su Feed Condivisi**: Corretto bug critico nella tabella `history` del database. La PRIMARY KEY era solo su `id` (hash MD5 del link), impedendo a due bot diversi di tracciare separatamente lo stesso item. Se Bot A e Bot B condividevano un feed, Bot B reinviava gli stessi episodi ad ogni ciclo all'infinito.

### Come funzionava il bug

```
1. TechnoPillz processa episodio "Ep.08" → INSERT (id='hash', bot_id=1) → ✅ OK
2. Runtime processa lo stesso "Ep.08" → INSERT (id='hash', bot_id=2) → ❌ IGNORATO (PK 'hash' già esiste!)
3. Ciclo successivo: isProcessed(bot_id=2, 'hash') → NON TROVATO (esisteva solo con bot_id=1)
4. Runtime lo reinvia → SPAM infinito
```

### Fix Applicata
- La PRIMARY KEY è ora composita: `PRIMARY KEY (id, bot_id)`, permettendo a ogni bot di tracciare i propri item indipendentemente.
- **Migrazione automatica**: Al primo avvio con v1.4.1, il database esistente viene aggiornato automaticamente preservando tutti i dati.

### 🔧 Database Migrations
- Migrazione tabella `history`: da `id TEXT PRIMARY KEY` a `PRIMARY KEY (id, bot_id)`
- Migrazione tabella `feeds`: aggiunto `'youtube'` al CHECK constraint del tipo

---

# v1.4.0 (2026-02-17)

### 🌟 New Features
- **Supporto Feed YouTube**: Aggiunta la possibilità di inserire feed YouTube (Atom/RSS) come sorgente. I feed YouTube vengono visualizzati con icona rossa e badge YOUTUBE nella lista feed.
- **Nuovo Tipo "YouTube (Video adapter)"**: Nel dropdown di selezione tipo, è ora disponibile l'opzione "YouTube" che formatta i messaggi con emoji 🎬 e link "Guarda il video".
- **Formato Messaggio Video**: I nuovi video vengono pubblicati con un formato dedicato: emoji 🎬, nome del canale in grassetto, titolo in grassetto e link diretto ▶️.

### Uso
Per aggiungere un feed YouTube, usa l'URL del feed Atom del canale:
```
https://www.youtube.com/feeds/videos.xml?channel_id=ID_DEL_CANALE
```
Seleziona "YouTube (Video adapter)" come tipo di feed.

---

# v1.3.0 (2026-02-17)

### 🌟 New Features
- **Log Unificato Multi-Canale**: Il pannello log è ora globale e mostra l'attività di TUTTI i canali contemporaneamente. Non viene più azzerato quando si naviga tra i profili bot.
- **Tag per Canale**: Ogni messaggio di log è prefissato con il nome del bot/canale tra parentesi quadre (es. `[TechnoPillz]`, `[Runtime Radio]`) per distinguere l'attività di ciascun canale.
- **Header Aggiornato**: Il pannello log ora mostra "SYSTEM LOGS // ALL CHANNELS" invece del nome del singolo bot selezionato.

### 🐛 Bug Fixes
- **Log Persistente**: I log non vengono più cancellati quando si cambia la selezione del bot nella sidebar. Il bottone "Clear" è ancora disponibile per svuotare manualmente.
- **Messaggi Italianizzati**: I messaggi di log dell'engine sono ora in italiano (Fetching, Inviato, Nessuna novità, etc.).

---

# v1.2.1 (2026-02-17)

### 🐛 Bug Fixes
- **Navigazione Multi-Bot**: Rimosso il blocco che impediva di navigare tra i profili bot mentre l'engine era in esecuzione. La selezione nella sidebar è solo per visualizzazione e configurazione — l'engine lavora su tutti i bot attivi indipendentemente da quale è selezionato nell'interfaccia.

---

# v1.2.0 (2026-02-17)

### 🐛 Bug Fixes
- **Creazione Bot dalla Dashboard**: Corretto il bug che impediva di creare un nuovo bot dalla sidebar. L'handler IPC `create-bot` non riconosceva il campo `channel_id` (snake_case) inviato dal `BotSelector`, aspettandosi `channelId` (camelCase). Ora accetta entrambi i formati.

---

# Titan Desktop - Changelog

## [v1.0.0-beta] "Glass Evolution" - 2026-02-11

### 🛠 Critical Fixes (Build Pipeline)
*   **Automated ESM/CJS Resolution**:
    *   Risolto il conflitto critico tra Vite (che compila in ESM o CJS in base alla config) ed Electron (che richiede CJS per il main process in questo setup).
    *   Implementato uno script automatico in `package.json` che rinomina post-build il file del preload in `.cjs`.
    *   **Risultato**: Eliminata definitivamente la "schermata bianca" all'avvio. La build `npm run build` ora produce un eseguibile funzionante al 100%.
*   **Path Correction**:
    *   Corretti i percorsi di caricamento file in `src/main/index.ts` per puntare correttamente a `index.cjs` (preload) e `../dist/index.html` (renderer).
*   **Dependency Cleanup**:
    *   Pulizia profonda di `node_modules` e allineamento versioni pacchetti.

### 🎨 UI/UX Redesign - "Titan Glass"
Aggiornamento completo dell'interfaccia grafica per un profilo professionale e moderno.

*   **Design System & Typography**:
    *   Abbandonato il font monospaziato ubiquo. Introdotto **Inter** (Google Fonts) come font primario per la UI.
    *   Il font monospaziato (**Fira Code**) è stato mantenuto esclusivamente per i pannelli di log e codice.
*   **Glassmorphism**:
    *   Nuovo header semitrasparente con effetto `backdrop-blur`.
    *   Schede e pannelli con bordi sottili (`white/10`) e sfondi traslucidi.
    *   Effetti di "glow" (bagliore) e ombreggiature profonde colorate.
*   **Titan Color Palette**:
    *   Definita una palette proprietaria basata su tonalità Ciano/Smeraldo (`titan-500`) su sfondo ultra-dark.
    *   Migliorato il contrasto e la leggibilità generale.
*   **Nuova Dashboard**:
    *   Layout riorganizzato con sidebar laterale "Glass".
    *   Animazioni di stato (Online/Offline) pulsanti.
    *   Pulsante di avvio ridisegnato con effetto neon/glow.
*   **Nuovo Setup Wizard**:
    *   Introdotta un'esperienza di setup immersiva a step.
    *   Input fields moderni con focus state animati.

### ⚙️ Configuration
*   **TailwindCSS**: Implementata configurazione completa `tailwind.config.js` con estensione temi custom.
*   **PostCSS**: Configurato per il processing dei nuovi stili.
*   **Branding & Credits**:
    *   Aggiornato nome prodotto a **RUNTIME TELEGRAM BOT TITAN EDITION**.
    *   Aggiunti credits "Sviluppato con l'ausilio di Gemini 3.0".
    *   Migliorata leggibilità input fields (fix contrasto).
    *   Placeholder input aggiornati con esempi più chiari.
*   **Security**:
    *   Aggiornata Content Security Policy (CSP) per permettere il caricamento sicuro di Google Fonts.

---

# Titan Desktop - Changelog

## [v1.0.0-alpha] "Genesis" - 2026-02-10

### 🚀 Initial Release
Primo rilascio dell'applicazione desktop standalone **Titan Desktop**.
Il progetto è una riscrittura completa del bot originale in **TypeScript/Electron**, mantenendo la logica "Titan" ma offrendo una GUI moderna.

### ✨ Features
*   **Architecture**:
    *   Progetto **Electron + Vite + React** separato dal codice Python originale.
    *   Logica Bot riscritta nativamente in **TypeScript** (No Python dependency).
    *   Database **SQLite** integrato (via `better-sqlite3`).

*   **User Interface**:
    *   **Setup Wizard**: Procedura guidata al primo avvio per configurare Token e Canale.
    *   **Dashboard**: Interfaccia di controllo con pulsante Start/Stop e log in tempo reale.
    *   **Cyberpunk UI**: Stile grafico scuro con accenti ciano/neon.

*   **Core Logic**:
    *   Porting della logica RSS Parser (supporto immagini, enclosure, etc.).
    *   Client Telegram integrato via `telegraf`.
    *   Gestione intelligente dei feed (deduping, date check).

### 🔧 Tech Stack
*   Electron 28
*   React 18
*   TypeScript 5
*   TailwindCSS

---