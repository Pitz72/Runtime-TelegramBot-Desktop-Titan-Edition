<div align="center">
  <img src="src/renderer/src/assets/logo.png" alt="Runtime TelegramBot Logo" width="120" />
  
  # Runtime TelegramBot
  ### Titan Edition
  
  **La Piattaforma Definitiva per l'Automazione Multi-Canale RSS & YouTube su Telegram**

  ![Version](https://img.shields.io/badge/Version-2.1.1-3b82f6?style=for-the-badge)
  ![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20macOS%20%7C%20Linux-emerald?style=for-the-badge)
  ![Stack](https://img.shields.io/badge/Stack-Electron%20%7C%20React%20%7C%20SQLite-475569?style=for-the-badge)
  ![Lang](https://img.shields.io/badge/Languages-8%20Supported-purple?style=for-the-badge)

  *Da un semplice script Python a un ecosistema Desktop Enterprise per il Broadcast Management.*
</div>

---

## Panoramica del Progetto

**Runtime TelegramBot** (Titan Edition) è un'applicazione desktop cross-platform progettata per monitorare feed RSS, Podcast e canali YouTube, pubblicando automaticamente i nuovi contenuti su canali Telegram. Supporta la gestione simultanea di più bot e più canali da un'unica interfaccia.

Il progetto nasce per superare i limiti di un precedente bot Python da terminale, offrendo un'interfaccia grafica moderna (Titan Blue), un'architettura asincrona robusta e standard di sicurezza hardware-bound per la protezione delle credenziali.

---

## Funzionalità

### Core
- **Gestione Multi-Bot e Multi-Canale** — Orchestrazione simultanea di infiniti bot Telegram. Dashboard con toggle `ALL BOTS / THIS BOT` per il log in tempo reale.
- **Motore YouTube Zero-Config** — Scraping nativo via InnerTube. Nessuna API Key di Google Cloud richiesta. Cache 5 minuti, filtro Anti-Premiere integrato.
- **Sicurezza Hardware-Bound** — Token cifrati in SQLite con strategia a due livelli: `safeStorage` OS (primario) + AES-256-GCM machine-key (fallback). Portabilità sicura via formato `.rtb`.
- **Architettura Producer-Consumer** — Fetch feed e invio Telegram su binari separati. Gestione fluida di FloodWait e rate-limit.
- **Quiet Hours** — Fasce orarie di silenzio configurabili per bot. I contenuti si accumulano e vengono smaltiti alla ripresa.
- **Template Smart Chips** — Editor visivo per formattare i messaggi Telegram con variabili dinamiche (`{{title}}`, `{{link}}`, `{{summary}}`, ecc.). 4 template separati: Avvio, News, Podcast, YouTube.
- **Validatore Template** — 9 controlli in tempo reale: tag non bilanciati, chip sconosciuti, href non sicuri, template vuoto, ecc.
- **Retry Queue** — Invii falliti riaccodati automaticamente fino a 3 tentativi prima di essere scartati.

### Feature Avanzate
- **F4 — Filtro Keyword** — Filtra gli articoli per parole chiave include/exclude per ogni singolo feed. Badge ambra "filtro attivo" visibile nella UI.
- **F5 — Scheduler Per-Feed** — Intervallo di fetch individuale per ogni feed (5 min → 24 h). Indipendente dall'intervallo globale del bot.
- **F6 — Statistiche & Analytics** — Contatori oggi/7gg/totale con breakdown per feed ordinato per volume.
- **F7 — Preview Template** — Anteprima inline del template con dati campione, senza uscire dall'editor.
- **F8 — Import OPML** — Importazione bulk di feed da file OPML standard. Nessuna dipendenza esterna, validazione anti-SSRF.
- **F9 — Digest Mode** — Accumula gli articoli di un feed per un intervallo configurabile (1h → 7gg) e li invia in un unico messaggio riepilogativo.
- **Performance Mode** — Disabilita effetti GPU-heavy (scanline, backdrop-blur, glow, animazioni). Persistente, efficace senza riavvio.
- **Auto-Updater nativo** — Verifica nuove versioni all'avvio via GitHub Releases, scarica in background e installa su richiesta con un click.

### Internazionalizzazione
Interfaccia tradotta in 8 lingue con cambio istantaneo:
🇮🇹 Italiano | 🇬🇧 English | 🇫🇷 Français | 🇩🇪 Deutsch | 🇪🇸 Español | 🇵🇹 Português | 🇷🇺 Русский | 🇨🇳 中文

---

## Stack Tecnologico

| Livello | Tecnologia |
| :--- | :--- |
| **Framework** | Electron 32.3.3 + Node.js 20+ |
| **Frontend** | React 18.3.1 + Vite 5.4.21 |
| **Styling** | TailwindCSS + Lucide React + Space Grotesk |
| **Database** | SQLite via `better-sqlite3` (WAL mode, schema v11) |
| **Telegram** | Telegraf v4 |
| **Build** | electron-builder 25 (NSIS, DMG, AppImage/deb) |
| **CI/CD** | GitHub Actions (Windows, macOS, Linux) |

---

## Installazione

### Utenti Finali

Scarica l'installer dalla [pagina Releases](https://github.com/Ecosystem-Runtime/runtime-telegrambot-releases/releases/latest) e lancia l'eseguibile per il tuo sistema operativo:

- **Windows** — `.exe` (NSIS Installer)
- **macOS** — `.dmg`. Al primo avvio: tasto destro → Apri (app non firmata, avviso Gatekeeper normale).
- **Linux** — `.AppImage` (eseguibile diretto) o `.deb` (Ubuntu/Debian). Potrebbe essere necessario `libsecret-1-0`.

### Sviluppatori

```bash
# Clona la repository
git clone https://github.com/Ecosystem-Runtime/Runtime-TelegramBot-Desktop-Titan-Edition.git
cd Runtime-TelegramBot-Desktop-Titan-Edition

# Installa le dipendenze
npm install

# Avvia in modalità sviluppo (HMR attivo)
npm run dev

# Build produzione
npm run build
```

---

## Struttura della Repository

```
Runtime-TelegramBot-Desktop-Titan-Edition/
├── src/
│   ├── main/          # Core Engine, SQLite, IPC, Encryption, BotEngine
│   ├── renderer/      # Dashboard React, componenti UI, i18n, guide
│   ├── preload/       # Bridge IPC sicuro
│   └── shared/        # Tipi TypeScript condivisi
├── docs/              # Documentazione tecnica, guide, changelog
├── build/             # Configurazione build (entitlements macOS)
├── .github/workflows/ # CI/CD GitHub Actions
└── builds/            # Output installer (generati da npm run build)
```

---

## Sicurezza — Gestione Token

I token Telegram sono cifrati nel database SQLite con una strategia a due livelli:

1. **safeStorage** (primario) — usa il keychain nativo dell'OS (DPAPI su Windows, macOS Keychain, libsecret su Linux). Output prefissato `ss:`.
2. **AES-256-GCM** (fallback) — usato su Linux senza libsecret. La chiave è un buffer random 32-byte generato al primo avvio e salvato in `userData/.machine-key`. Output prefissato `mk:`.

I token sono macchina-specifici: chi migra il database tra macchine diverse dovrà re-inserirli.

---

## Crediti e Licenza

Sviluppato da **Simone Pizzi** per **[Runtime Radio](https://runtimeradio.com)**.  
Progettazione architetturale e sviluppo realizzati con l'ausilio di **Claude** (Anthropic).

*Copyright © 2026 Runtime Radio. Tutti i diritti riservati.*
