# 🐧 Istruzioni Compilazione — Linux

## Runtime TelegramBot Titan Edition v1.0.0

Questa guida spiega come compilare l'applicazione desktop su Linux
e generare i pacchetti `.AppImage` e `.deb` pronti per l'installazione.

Testata su: **Ubuntu 22.04+**, **Debian 12+**, **Fedora 38+**, **Arch Linux**.

---

## Prerequisiti

### 1. Strumenti di compilazione essenziali

**Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install -y build-essential python3 git
```

**Fedora:**

```bash
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y python3 git
```

**Arch Linux:**

```bash
sudo pacman -S --needed base-devel python git
```

Questi pacchetti includono `gcc`, `g++`, `make` e i compilatori necessari
per i moduli nativi come `better-sqlite3`.

### 2. Node.js (versione 18 o superiore)

**Opzione A — NodeSource (raccomandata per Ubuntu/Debian):**

```bash
# Installa Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifica
node --version   # Deve mostrare v20.x.x o superiore
npm --version    # Deve mostrare v9.x.x o superiore
```

**Opzione B — Fedora:**

```bash
sudo dnf install -y nodejs
```

**Opzione C — Arch Linux:**

```bash
sudo pacman -S nodejs npm
```

**Opzione D — nvm (funziona su qualsiasi distro):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 3. Dipendenze per Electron e pacchettizzazione

**Ubuntu / Debian:**

```bash
sudo apt install -y dpkg fakeroot rpm
```

**Fedora:**

```bash
sudo dnf install -y dpkg fakeroot rpm-build
```

**Arch Linux:**

```bash
sudo pacman -S dpkg fakeroot
yay -S rpm-tools   # Se vuoi anche il pacchetto .rpm
```

> **Nota:** `dpkg` e `fakeroot` servono per generare il `.deb`.
> Se ti interessa solo l'`.AppImage`, non sono strettamente necessari.

---

## Compilazione

### Step 1 — Apri il Terminale

Apri il tuo emulatore di terminale preferito (GNOME Terminal, Konsole,
Alacritty, Tilix, etc.).

### Step 2 — Naviga nella cartella del progetto

Assicurati di trovarti nella cartella principale `TITAN_DESKTOP`.

### Step 3 — Installa le dipendenze

```bash
npm install
```

⏱️ Richiede qualche minuto.

### Step 3.1 — Ricompila i moduli nativi (IMPORTANTE)

Per evitare l'errore `NODE_MODULE_VERSION` con `better-sqlite3`, esegui:

```bash
npm run rebuild
```

Questo adatta il database alla versione di Electron in uso.

> **Se ricevi errori su better-sqlite3 o node-gyp:**
>
> ```bash
> # Assicurati di avere i tool di compilazione
> sudo apt install -y build-essential python3  # Ubuntu/Debian
> # Poi ritenta
> npm install --build-from-source
> npm run rebuild
> ```

### Step 4 — Compila il progetto

```bash
npm run build
```

⏱️ Richiede 2-5 minuti. Il comando esegue in sequenza:
1. **tsc** — Compila TypeScript in JavaScript
2. **vite build** — Crea il bundle del frontend React
3. **electron-builder** — Pacchettizza in `.AppImage` e `.deb`

### Step 5 — Trova i file generati

Al termine, i pacchetti si trovano nella cartella `Builds/`:

```bash
ls -la Builds/
```

Dovresti vedere:

```
Runtime Telegram Bot Titan Edition-1.0.0.AppImage
Runtime Telegram Bot Titan Edition-1.0.0.deb
```

---

## Installazione

### AppImage (universale — funziona su qualsiasi distro)

```bash
# Rendi eseguibile
chmod +x "Builds/Runtime Telegram Bot Titan Edition-1.0.0.AppImage"

# Esegui
./Builds/"Runtime Telegram Bot Titan Edition-1.0.0.AppImage"
```

> **Tip:** Puoi spostare l'AppImage nella cartella `~/Applicazioni/` o
> `/opt/` per averla sempre disponibile.

### .deb (Ubuntu / Debian)

```bash
sudo dpkg -i "Builds/Runtime Telegram Bot Titan Edition-1.0.0.deb"
```

L'app sarà disponibile nel menu delle applicazioni.

Per disinstallare:

```bash
sudo dpkg -r runtime-telegram-bot-titan-edition
```

---

## Modalità Sviluppo (opzionale)

Se vuoi eseguire l'app in modalità sviluppo con hot-reload:

```bash
npm run dev
```

L'app si aprirà automaticamente e si aggiornerà ad ogni modifica del codice.

---

## Troubleshooting

### Errore: "libcrypt.so.1: cannot open shared object file"

Sulle distribuzioni Linux moderne (Ubuntu 22.04+, Fedora 30+), `libcrypt.so.1` potrebbe non essere installata di default:

```bash
# Ubuntu / Debian / Linux Mint:
sudo apt update && sudo apt install libcrypt1

# Fedora / RHEL / CentOS:
sudo dnf install libxcrypt-compat

# Arch Linux:
sudo pacman -S libxcrypt-compat
```

### Errore: "gyp ERR! build error" o "make: *** Error"

```bash
# Assicurati di avere i tool di compilazione
sudo apt install -y build-essential python3   # Ubuntu/Debian
sudo dnf groupinstall -y "Development Tools"  # Fedora

# Pulisci e reinstalla
rm -rf node_modules
npm install
```

### Errore: "EACCES: permission denied"

```bash
# Non usare sudo con npm! Correggi i permessi:
sudo chown -R $(whoami) ~/.npm
npm install
```

### Errore: "libnss3.so: cannot open shared object file"

Electron richiede alcune librerie di sistema:

```bash
# Ubuntu/Debian
sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libdrm2 libgtk-3-0 libgbm1 libasound2

# Fedora
sudo dnf install -y nss atk at-spi2-atk cups-libs libdrm gtk3 \
  mesa-libgbm alsa-lib
```

### Errore: "better-sqlite3 was compiled against a different Node.js version"

```bash
# Ricompila i moduli nativi per Electron
npx electron-rebuild
npm run build
```

### L'AppImage non si avvia

```bash
# Verifica che sia eseguibile
chmod +x *.AppImage

# Se FUSE non è installato (necessario per AppImage)
# Ubuntu 22.04+:
sudo apt install -y libfuse2

# Fedora:
sudo dnf install -y fuse fuse-libs
```

### Schermo bianco all'avvio

```bash
# Prova con il flag --no-sandbox
./Runtime*.AppImage --no-sandbox

# Oppure avvia in modalità sviluppo per debug
npm run dev
```

---

## Struttura del Progetto

Vedi il [README.md](../README.md) principale per la struttura aggiornata del progetto.

---

## Riepilogo Comandi

| Azione | Comando |
|---|---|
| Installa dipendenze | `npm install` |
| Compila + crea .AppImage/.deb | `npm run build` |
| Avvio sviluppo | `npm run dev` |
| Solo type-check | `npx tsc --noEmit` |

---

## Note Importanti

- **Il database** viene creato automaticamente al primo avvio in
  `~/.config/Runtime Telegram Bot Titan Edition/titan.db`
- **Nessun dato viene inviato** a server esterni oltre alle API Telegram
- **I token** dei bot sono salvati localmente nel database SQLite
- Se hai dubbi, contatta Simone Pizzi

---

*Runtime TelegramBot Titan Edition v1.1.0 — © 2026 Simone Pizzi per Runtime Radio*
