# 🍎 Istruzioni Compilazione — macOS

## Runtime TelegramBot Titan Edition v1.0.0

Questa guida spiega come compilare l'applicazione desktop sul tuo Mac
e generare il file `.dmg` pronto per l'installazione.

---

## Prerequisiti

### 1. Xcode Command Line Tools

Apri **Terminale** ed esegui:

```bash
xcode-select --install
```

Segui il dialogo di installazione. Questo installa `git`, `make`, `clang` e
i compilatori necessari per i moduli nativi (come `better-sqlite3`).

> **Nota:** Non serve installare Xcode completo, bastano i Command Line Tools.

### 2. Node.js (versione 18 o superiore)

**Opzione A — Installer ufficiale (più semplice):**

1. Vai su [https://nodejs.org](https://nodejs.org)
2. Scarica la versione **LTS** (≥ 18)
3. Installa il `.pkg`
4. Verifica nel terminale:

```bash
node --version   # Deve mostrare v18.x.x o superiore
npm --version    # Deve mostrare v9.x.x o superiore
```

**Opzione B — Con Homebrew (se hai già Homebrew installato):**

```bash
brew install node@20
```

### 3. Python (necessario per compilare better-sqlite3)

macOS include già Python 3. Verifica:

```bash
python3 --version
```

Se non è installato:

```bash
brew install python3
```

---

## Compilazione

### Step 1 — Apri il Terminale

Apri l'app **Terminale** (la trovi in Applicazioni → Utility → Terminale,
oppure cerca "Terminal" con Spotlight premendo `⌘ + Spazio`).

### Step 2 — Naviga nella cartella del progetto

Assicurati di trovarti nella cartella principale `TITAN_DESKTOP`.

### Step 3 — Installa le dipendenze

```bash
npm install
```

⏱️ Questo richiederà qualche minuto.

### Step 3.1 — Ricompila i moduli nativi (IMPORTANTE)

Per assicurare che `better-sqlite3` funzioni con Electron:

```bash
npm run rebuild
```

> **Se ricevi errori su better-sqlite3:**
> Assicurati che Xcode Command Line Tools siano installati (Step 1 dei Prerequisiti).
> Se il problema persiste:
> ```bash
> npm install --build-from-source
> npm run rebuild
> ```

### Step 4 — Compila il progetto

```bash
npm run build
```

⏱️ Questo richiederà 2-5 minuti. Il comando esegue in sequenza:
1. **tsc** — Compila TypeScript in JavaScript
2. **vite build** — Crea il bundle del frontend React
3. **electron-builder** — Pacchettizza tutto in un `.dmg`

### Step 5 — Trova il file generato

Al termine, il file `.dmg` si troverà nella cartella `Builds/`:

```bash
ls -la Builds/
```

Dovresti vedere:

```
Runtime Telegram Bot Titan Edition-1.0.0.dmg
```

---

## Installazione dell'app compilata

1. Fai doppio click sul file `.dmg`
2. Si apre una finestra con l'icona dell'app
3. Trascina l'app nella cartella **Applicazioni**
4. Chiudi il `.dmg` (click destro → "Espelli")
5. Apri l'app dalla cartella Applicazioni

> **⚠️ Primo avvio — Gatekeeper:**
> macOS potrebbe bloccare l'app perché non è firmata con un certificato Apple.
> Per aprirla:
> 1. Vai in **Impostazioni di Sistema → Privacy e Sicurezza**
> 2. Scorri fino a trovare il messaggio su "Runtime Telegram Bot Titan Edition"
> 3. Clicca **"Apri comunque"**
>
> In alternativa, click destro sull'app → **"Apri"** → conferma.

---

## Modalità Sviluppo (opzionale)

Se vuoi eseguire l'app in modalità sviluppo con hot-reload:

```bash
npm run dev
```

L'app si aprirà automaticamente e si aggiornerà ad ogni modifica del codice.

---

## Troubleshooting

### Errore: "gyp ERR! build error"

```bash
# Reinstalla i Command Line Tools
sudo rm -rf /Library/Developer/CommandLineTools
xcode-select --install
# Poi ritenta
npm install
```

### Errore: "Node Sass / node-gyp"

```bash
# Pulisci la cache e reinstalla
rm -rf node_modules
npm cache clean --force
npm install
```

### Errore: "better-sqlite3 was compiled against a different Node.js version"

```bash
# Ricompila i moduli nativi per la versione corretta di Electron
npx electron-rebuild
npm run build
```

### L'app si apre ma resta bianco

```bash
# Prova in modalità sviluppo per vedere errori nella console
npm run dev
# Apri la DevTools: Menu → View → Toggle Developer Tools
```

### Errore permessi durante npm install

```bash
# Non usare sudo con npm! Correggi i permessi:
sudo chown -R $(whoami) ~/.npm
npm install
```

---

## Struttura del Progetto

Vedi il [README.md](../README.md) principale per la struttura aggiornata del progetto.

---

## Riepilogo Comandi

| Azione | Comando |
|---|---|
| Installa dipendenze | `npm install` |
| Compila + crea .dmg | `npm run build` |
| Avvio sviluppo | `npm run dev` |
| Solo type-check | `npx tsc --noEmit` |

---

## Note Importanti

- **Il database** viene creato automaticamente al primo avvio in
  `~/Library/Application Support/Runtime Telegram Bot Titan Edition/titan.db`
- **Nessun dato viene inviato** a server esterni oltre alle API Telegram
- **I token** dei bot sono salvati localmente nel database SQLite
- Se hai dubbi, contatta Simone Pizzi

---

*Runtime TelegramBot Titan Edition v1.0.0 — © 2026 Simone Pizzi per Runtime Radio*
