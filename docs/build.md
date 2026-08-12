# Compilazione e pacchettizzazione

Come costruire gli installer per Windows e Linux, in locale o via CI. Le trappole non ovvie del progetto sono in [CONTRIBUTING.md](../CONTRIBUTING.md) — vale la pena leggerle prima.

Piattaforme con installer ufficiale: **Windows** e **Linux**.

Per **macOS** non esiste un installer ufficiale e la CI non lo produce. Non è un limite del codice — è cross-platform e su macOS compila e gira — ma distribuire un `.dmg` che non faccia comparire l'avviso di Gatekeeper richiede un certificato Apple a pagamento che il progetto non ha motivo di mantenere. Chi usa macOS può compilare dal sorgente: servono Node 20 e gli Xcode Command Line Tools, poi valgono gli stessi comandi descritti sotto. Il target `mac` va aggiunto a mano in `electron-builder.yml`, e l'app risultante andrà aperta la prima volta con tasto destro → *Apri*.

---

## Prerequisiti

**Node.js 20.** Non versioni successive: `better-sqlite3` non ha prebuild per Node 22/24, `node-gyp` fallisce e su Windows Visual Studio non viene rilevato. Il progetto ha già pagato questo errore una volta.

`better-sqlite3` è un modulo nativo e viene ricompilato per la versione di Electron in uso da `electron-builder install-app-deps`, che gira automaticamente come `postinstall`.

### Windows

Servono gli strumenti di compilazione C++: **Visual Studio Build Tools** con il workload *Desktop development with C++*, oppure Visual Studio Community con lo stesso workload. Python 3 è incluso nei Build Tools recenti; se manca, installarlo a parte.

### Linux

```bash
# Ubuntu / Debian
sudo apt update
sudo apt install -y build-essential python3 git libsecret-1-dev libfuse2 dpkg fakeroot

# Fedora
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y python3 git libsecret-devel fuse fuse-libs dpkg fakeroot

# Arch
sudo pacman -S --needed base-devel python git libsecret fuse2 dpkg fakeroot
```

`libsecret` serve al portachiavi di sistema usato per cifrare i token (senza, l'applicazione ricade sulla chiave macchina AES-256-GCM e funziona comunque). `libfuse2` serve a eseguire l'AppImage. `dpkg` e `fakeroot` servono solo a generare il `.deb`.

---

## Compilazione locale

```bash
npm install          # installa e ricompila i moduli nativi

npx tsc --noEmit     # type check, deve passare pulito
npx vite build       # bundle main + preload + renderer
npm run build        # tutto il precedente + installer via electron-builder
```

Gli installer finiscono in `Builds/`:

| Piattaforma | Artefatto |
| :--- | :--- |
| Windows | `RuntimeTelegramBot-TitanEdition-Setup-<versione>.exe` |
| Linux | `RuntimeTelegramBot-TitanEdition-<versione>.AppImage` e `.deb` |

`electron-builder` costruisce **solo per la piattaforma su cui gira**: non si producono `.exe` da Linux né viceversa. Per entrambe serve la CI, che usa un runner nativo per ciascuna.

> ⚠️ **`npm run dev` è rotto** e corrompe `dist-electron/main/index.cjs`. Riguarda solo il dev server, mai le build di release. Se capita, `npx vite build` rigenera un bundle valido. Spiegazione completa in [CONTRIBUTING.md](../CONTRIBUTING.md).

### Installare quello che hai costruito, su Linux

```bash
chmod +x Builds/RuntimeTelegramBot-TitanEdition-*.AppImage
./Builds/RuntimeTelegramBot-TitanEdition-*.AppImage

# oppure
sudo dpkg -i Builds/RuntimeTelegramBot-TitanEdition-*.deb
sudo dpkg -r runtime-telegram-bot-titan-edition   # per disinstallare
```

---

## Integrazione continua

`.github/workflows/build.yml` contiene due flussi.

**Verifica delle pull request** — automatica su ogni PR verso `main`: `npm ci`, `tsc --noEmit`, `vite build`. Serve a garantire che nessun contributo rompa la compilazione.

**Build e release** — solo manuale (`workflow_dispatch`), mai su push. Costruisce su runner nativi Ubuntu e Windows e, se `publish_release` è `true`, pubblica sulla repository ponte delle release.

```bash
gh workflow run build.yml -f publish_release=true
```

### Procedura di rilascio

1. Aggiornare `version` in `package.json`.
2. Aggiungere l'entry in `CHANGELOG.md` e il file in `docs/changelogs/`.
3. **Aggiungere l'entry della nuova versione in `src/renderer/src/lib/releaseNotes.ts`** — se manca, la schermata «Novità» mostra il testo generico invece dell'elenco delle modifiche.
4. `gh workflow run build.yml -f publish_release=true`.

Gli artefatti e il manifesto `latest.yml` finiscono su [`Ecosystem-Runtime/runtime-telegrambot-releases`](https://github.com/Ecosystem-Runtime/runtime-telegrambot-releases), da cui `electron-updater` scarica gli aggiornamenti (configurato in `electron-builder.yml`, sezione `publish`). La pubblicazione usa il secret `RELEASE_TOKEN`.

Gli installer **non sono firmati**: non esiste un certificato di code signing. Su Windows SmartScreen mostra un avviso alla prima esecuzione.

---

## Configurazione di packaging

In `electron-builder.yml`. Due cose da sapere:

- **`files` è un elenco chiuso.** `node_modules` è escluso in blocco tranne `better-sqlite3` e le sue dipendenze: tutto il resto (telegraf, rss-parser, youtubei.js, React…) è già impacchettato da Vite. È questa configurazione che tiene l'installer a ~80 MB invece di 1,5 GB. Se aggiungi una dipendenza con binari nativi, va aggiunta anche qui e in `asarUnpack`.
- **`productName` non si tocca.** Da lì deriva il percorso della cartella `userData` degli utenti — vedi [database.md](database.md).

---

## Problemi frequenti

**`better-sqlite3 was compiled against a different Node.js version`**
```bash
npm run rebuild      # electron-builder install-app-deps
```

**`gyp ERR! build error`** — mancano gli strumenti di compilazione. Su Windows: Visual Studio Build Tools con il workload C++. Su Linux: `build-essential` e `python3`. Poi `rm -rf node_modules && npm install`.

**`libnss3.so: cannot open shared object file`** (Linux)
```bash
sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libdrm2 libgtk-3-0 libgbm1 libasound2
```

**`libcrypt.so.1: cannot open shared object file`** (Linux moderni)
```bash
sudo apt install libcrypt1          # Ubuntu / Debian
sudo dnf install libxcrypt-compat   # Fedora
```

**L'AppImage non parte** — verificare `chmod +x` e installare `libfuse2`.

**Schermata bianca all'avvio** — provare con `--no-sandbox`. Se persiste, è probabile un problema di GPU: l'applicazione disabilita già l'accelerazione hardware, e il paracadute che forza la comparsa della finestra scatta dopo 10 secondi.

**`EACCES: permission denied` con npm** — non usare `sudo npm`. Correggere i permessi: `sudo chown -R $(whoami) ~/.npm`.
