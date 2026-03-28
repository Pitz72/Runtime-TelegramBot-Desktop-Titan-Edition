<div align="center">
  <img src="src/renderer/src/assets/logo.png" alt="Titan Logo" width="120" />
  
  # 🤖 Runtime TelegramBot Titan Edition
  
  **La Piattaforma Definitiva per l'Automazione Multi-Canale RSS & YouTube su Telegram**

  ![Version](https://img.shields.io/badge/Version-1.7.7-3b82f6?style=for-the-badge)
  ![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20macOS%20%7C%20Linux-emerald?style=for-the-badge)
  ![Stack](https://img.shields.io/badge/Stack-Electron%20%7C%20React%20%7C%20SQLite-475569?style=for-the-badge)
  ![Lang](https://img.shields.io/badge/Languages-8%20Supported-purple?style=for-the-badge)

  *Da un semplice script Python a un ecosistema Desktop Enterprise per il Broadcast Management.*
</div>

---

## 📋 Panoramica del Progetto

**Runtime TelegramBot Titan Edition** è una potente applicazione desktop cross-platform progettata per monitorare feed RSS, Podcast e canali YouTube, pubblicando automaticamente i nuovi contenuti su infiniti canali Telegram. 

Nata per superare i limiti strutturali e operativi di un precedente bot Python basato su terminale, la *Titan Edition* offre una moderna interfaccia grafica "Sci-Fi" (Titan Glass UI), un'architettura di elaborazione asincrona e standard di sicurezza hardware-bound per la protezione delle credenziali.

## ✨ Funzionalità Core (Features)

*   🚀 **Gestione Multi-Canale e Multi-Bot:** Orchestrazione simultanea di infiniti bot Telegram in un'unica interfaccia. Nessuna collisione dati grazie a chiavi primarie composite.
*   🎬 **Motore YouTube "Zero-Config":** Scraping nativo tramite interfaccia InnerTube (`youtubei.js`). **Nessuna API Key di Google Cloud richiesta.** Include un filtro euristico *Anti-Premiere* per evitare lo spam di video programmati ma non ancora pubblicati.
*   🔒 **OmniSync & Sicurezza Hardware:** I token dei bot sono salvati su SQLite in formato crittografato tramite la tecnologia `safeStorage` dell'OS. Il formato proprietario **`.rtb`** permette di esportare/importare configurazioni bot tra PC diversi gestendo la ri-cifratura in totale sicurezza.
*   ⚙️ **Architettura Producer-Consumer:** Il download dei feed e l'invio su Telegram viaggiano su binari separati. Questo azzera i freeze dell'interfaccia e gestisce in modo fluido i *FloodWait* e i rate-limits delle API di Telegram.
*   🌙 **Fasce Orarie di Silenzio (Quiet Hours):** Possibilità di definire orari di pausa per le notifiche. L'app continua ad accumulare le notizie in background, smaltendole automaticamente al termine della fascia di silenzio.
*   📝 **Template "Smart Chips":** Editor visivo integrato per formattare in HTML i messaggi Telegram con inserimento dinamico delle variabili (`{{title}}`, `{{link}}`, `{{summary}}`, ecc.). Supporta **4 template separati** per tipo di contenuto: Avvio (startup), News, Podcast, YouTube.
*   🌍 **I18n Globale:** Interfaccia tradotta nativamente in 8 lingue, mentre il core engine mantiene log di sistema standardizzati in puro inglese tecnico per il debug internazionale.
*   🔔 **Auto-Updater:** Notifica Toast discreta nella Dashboard se è disponibile una versione più recente, interrogando `ecosystem.runtimeradio.com`. Nessun aggiornamento automatico forzato.

---

## 🏗️ Stack Tecnologico

Il progetto è costruito sui framework e le librerie più robuste del panorama Node.js moderno:

| Livello | Tecnologia / Libreria |
| :--- | :--- |
| **Framework Base** | Electron 28 + Node.js 18+ |
| **Frontend** | React 18 + Vite 4 |
| **Styling & UI** | Tailwind CSS 3.4 + Framer Motion |
| **Database** | SQLite via `better-sqlite3` (Modalità WAL, user_version migrations) |
| **Telegram API** | `telegraf` v4.15 |
| **Scraping** | `rss-parser` + `youtubei.js` (InnerTube) |
| **Build & Deploy** | `electron-builder` (NSIS, DMG, AppImage) |

---

## 🚀 Installazione e Utilizzo

### A. Utenti Finali (Produzione)
Il software è compilato per essere autonomo e non richiede l'installazione di runtime esterni.
1. Naviga nella cartella `Builds/` della release.
2. Esegui l'installer corrispondente al tuo Sistema Operativo:
   * **Windows:** `.exe` (NSIS Installer)
   * **macOS:** `.dmg` — **Apple Silicon (M1/M2/M3/M4) only**. Al primo avvio seguire: *Impostazioni di Sistema → Privacy e Sicurezza → Apri comunque* (app non firmata).
   * **Linux:** `.AppImage` o `.deb` (x64)

### B. Sviluppatori (Sorgente)
Per clonare e lavorare sulla codebase:

```bash
# 1. Naviga nella root di sviluppo
cd TITAN_DESKTOP

# 2. Installa le dipendenze (assicurati di avere Node.js >= 18 e gli strumenti di compilazione nativi)
npm install

# 3. Compila il modulo nativo better-sqlite3 per l'ambiente Electron
npm run rebuild

# 4. Avvia il server di sviluppo con Hot-Reload (HMR)
npm run dev

# 5. Compila per la produzione (genera gli eseguibili in /Builds)
npm run build
```
*(Per la risoluzione dei problemi di compilazione `better-sqlite3` su Linux/Mac, consulta la cartella `docs/`).*

---

## 🛡️ Gestione del Ciclo di Vita e Anti-Ghosting

Titan Edition è progettata per girare 24/7 su VPS (Virtual Private Server) o Macchine Virtuali. Include difese ambientali native:
*   **Disattivazione Hardware Acceleration:** Previene crash "silenti" della GPU su sistemi headless.
*   **Safety Fallback (Error Boundary):** Intercetta `uncaughtException` e `unhandledRejection` mostrando dialog di sistema e chiudendo il task per prevenire i *Ghost Process* (processi zombie che saturano la RAM in background).
*   **Graceful Degradation:** Se le API di terze parti (come YouTube) cambiano radicalmente la loro struttura, il motore notifica l'errore all'interfaccia (via IPC) senza interrompere la gestione degli altri feed RSS/Podcast.

---

## 📂 Struttura della Repository

Per mantenere la massima agilità, la root del progetto è divisa in tre poli logici:

```text
BOT-TELEGRAM-RSS/
├── TITAN_DESKTOP/         # 💻 Sviluppo attivo. Contiene tutto l'ambiente Electron/React.
│   ├── src/main/          # Core Engine, SQLite, IPC, Wrapper Telegram
│   ├── src/renderer/      # Dashboard React, Componenti UI, Sistema i18n
│   ├── src/shared/        # Tipi e interfacce condivise
│   └── Builds/            # Output finali pronti per l'installazione (.exe, .dmg)
├── ARCHIVIO_LEGACY/       # 🏛️ Cold Storage. Script Python pregressi e vecchie branch.
└── docs/                  # 📚 Documentazione tecnica, guide e Changelog completi.
```

---

## 🌐 Lingue Supportate

L'interfaccia utente (UI) supporta il cambio rapido della lingua senza necessità di riavvio:
🇮🇹 Italiano | 🇬🇧 English | 🇫🇷 Français | 🇩🇪 Deutsch | 🇪🇸 Español | 🇵🇹 Português | 🇷🇺 Русский | 🇨🇳 中文

---

## 👤 Crediti e Licenza

Sviluppato da **Simone Pizzi** per **Runtime Radio**.  
Progettazione architetturale, algoritmi e refactoring realizzati con l'ausilio di **Gemini**.

*Copyright © 2026 Runtime Radio. Tutti i diritti riservati.*
`