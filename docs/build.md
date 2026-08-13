# Compilazione e pacchettizzazione

Come costruire gli installer per Windows e Linux, in locale o via CI. Le trappole non ovvie del progetto sono in [CONTRIBUTING.md](../CONTRIBUTING.md) — vale la pena leggerle prima.

Piattaforme con installer ufficiale: **Windows x64** e **Linux x64 e arm64**.

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
sudo apt install -y build-essential python3 git libsecret-1-dev libfuse2 dpkg fakeroot rpm zstd libarchive-tools

# Fedora
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y python3 git libsecret-devel fuse fuse-libs dpkg fakeroot rpm-build zstd bsdtar

# Arch
sudo pacman -S --needed base-devel python git libsecret fuse2 dpkg fakeroot rpm-tools zstd libarchive
```

`libsecret` serve al portachiavi di sistema usato per cifrare i token (senza, l'applicazione ricade sulla chiave macchina AES-256-GCM e funziona comunque). `libfuse2` serve a eseguire l'AppImage. `dpkg`, `fakeroot`, `rpm` e `zstd` servono solo a generare i pacchetti: `.deb`, `.rpm` e `.pacman`.

`libarchive-tools` porta **`bsdtar`**, che fpm invoca per costruire il `.MTREE` del pacchetto `pacman`. Senza, e solo su quel target, la build muore con `exit code 127` — cioè comando non trovato. È stato il solo intoppo della matrice al primo collaudo.

#### fpm, e perché ne serve uno di sistema

I tre pacchetti li impacchetta [fpm](https://github.com/jordansissel/fpm). Quello che `electron-builder` scarica da sé è fermo alla **1.9.3** ed esiste **solo per x86_64**: non sa produrre `pacman` — il formato è stato aggiunto in fpm 1.11 — e su arm64 non esiste proprio. Per costruire tutti i target serve un fpm di sistema, e va imposto con una variabile d'ambiente:

```bash
sudo apt install -y ruby ruby-dev      # o l'equivalente della tua distribuzione
sudo gem install --no-document fpm

USE_SYSTEM_FPM=true npx electron-builder --linux
```

Senza `USE_SYSTEM_FPM`, `electron-builder` continua a usare il proprio binario e il target `pacman` fallisce. È lo stesso motivo per cui la CI installa fpm su entrambi i runner Linux.

---

## Compilazione locale

```bash
npm install          # installa e ricompila i moduli nativi

npx tsc --noEmit     # type check, deve passare pulito
npx vite build       # bundle main + preload + renderer
npm run build        # tutto il precedente + installer via electron-builder
```

Gli installer finiscono in `Builds/`. Tutti i nomi cominciano con `RuntimeTelegramBot-TitanEdition-`:

| Piattaforma | Artefatto | Si auto-aggiorna |
| :--- | :--- | :--- |
| Windows | `Setup-<versione>.exe` — installer NSIS | sì |
| Windows | `Portable-<versione>.exe` — eseguibile unico | no |
| Linux | `<versione>-<arch>.AppImage` | sì |
| Linux | `<versione>-amd64.deb` / `-arm64.deb` | sì, con password di amministratore |
| Linux | `<versione>-x86_64.rpm` / `-aarch64.rpm` | sì, con password di amministratore |
| Linux | `<versione>-<arch>.pacman` | no |
| Linux | `<versione>-<arch>.tar.gz` | no |

`electron-builder` costruisce **solo per la piattaforma su cui gira**: non si producono `.exe` da Linux né viceversa. Per entrambe serve la CI, che usa un runner nativo per ciascuna.

**L'architettura non è dichiarata in `electron-builder.yml`**, si passa sulla riga di comando (`--x64`, `--arm64`), perché ogni architettura si compila sul proprio runner. Per questo `linux.artifactName` contiene `${arch}`: senza, x64 e arm64 produrrebbero file omonimi che si sovrascrivono a vicenda quando la release li raccoglie insieme.

### Auto-aggiornamento, per formato

`electron-updater` riconosce il formato da cui è stata installata l'applicazione leggendo il file `package-type` che `electron-builder` scrive dentro il pacchetto. Da lì sceglie come aggiornarsi:

- **installer Windows e AppImage** — scaricano e si sostituiscono da soli, senza privilegi;
- **`.deb` e `.rpm`** — scaricano il nuovo pacchetto e lo installano **da root**, chiedendo la password con `pkexec` o `sudo`. È una funzione recente di `electron-updater` e meno collaudata delle altre due: se non va a buon fine, il pacchetto si installa a mano;
- **portable, `.pacman` e `.tar.gz`** — non si aggiornano da soli. Il portable non compare nemmeno in `latest.yml` (`electron-builder` non scrive informazioni di aggiornamento per quel target), e per `pacman` non viene scritto `package-type`.

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

**Build e release** — solo manuale (`workflow_dispatch`), mai su push. Costruisce su tre runner nativi — Ubuntu x64, Ubuntu arm64 (`ubuntu-24.04-arm`, gratuito sulle repository pubbliche) e Windows — e, se `publish_release` è `true`, pubblica la release sulla repository stessa.

I due job Linux girano con `fail-fast: false`: se un'architettura non compila, l'altra arriva in fondo lo stesso e si vede esattamente che cosa è rotto. La release, però, ha entrambi fra i `needs`, quindi non esce se anche uno solo dei job fallisce: meglio nessuna release che una a metà.

```bash
gh workflow run build.yml -f publish_release=true
```

### Procedura di rilascio

1. Aggiornare `version` in `package.json`.
2. Aggiungere l'entry in `CHANGELOG.md` e il file in `docs/changelogs/`.
3. **Aggiungere l'entry della nuova versione in `src/renderer/src/lib/releaseNotes.ts`** — se manca, la schermata «Novità» mostra il testo generico invece dell'elenco delle modifiche.
4. `gh workflow run build.yml -f publish_release=true`.

Gli artefatti e il manifesto `latest.yml` finiscono nelle [release di questa stessa repository](https://github.com/Pitz72/Runtime-TelegramBot-Desktop-Titan-Edition/releases), da cui `electron-updater` scarica gli aggiornamenti (configurato in `electron-builder.yml`, sezione `publish`). La pubblicazione usa il `GITHUB_TOKEN` che GitHub Actions genera da sé: non serve nessun secret da configurare a mano.

Fino alla v2.1.7 le release uscivano su una repository ponte separata, perché il sorgente era privato e serviva un posto pubblico da cui scaricare gli aggiornamenti. Aperto il sorgente, la ponte non ha più ragione di esistere.

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
