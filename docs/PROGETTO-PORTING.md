# Progetto Porting — Runtime TelegramBot macOS e Linux

> **⚠️ Documento storico — completato in v1.10.2**  
> Tutto il lavoro descritto qui è stato realizzato. Questo file conserva l'analisi tecnica originale come riferimento. Per lo stato attuale vedi [STATO-PROGETTO.md](STATO-PROGETTO.md).

**Stato:** ✅ Completato in v1.10.2 (Aprile 2026)  
**Documento originale redatto:** pre-v1.10.2  
**Aggiornamento stato:** 20 Aprile 2026

---

## Obiettivo

Distribuire Runtime TelegramBot anche su **Linux** (AppImage / .deb) e **macOS** (.dmg), mantenendo lo stesso codebase senza fork. La build avviene tramite **GitHub Actions** — nessuna macchina Mac o Linux necessaria in locale.

---

## Stato Attuale del Codebase

### Linux — già quasi pronto

Il `package.json` ha già la configurazione build Linux:

```json
"linux": {
    "maintainer": "Runtime Radio <info@runtimeradio.it>",
    "target": ["AppImage", "deb"],
    "category": "Utility"
}
```

Nessun target `mac` o `win` esplicito — electron-builder usa i default per la piattaforma corrente.

### macOS — manca solo la config build

Va aggiunta la sezione `mac` al `package.json`:

```json
"mac": {
    "target": ["dmg"],
    "category": "public.app-category.utilities",
    "hardenedRuntime": true,
    "gatekeeperAssess": false
}
```

---

## Il Problema safeStorage

`safeStorage` di Electron è **cross-platform by design**:

| Piattaforma | Backend usato | Funziona? |
|-------------|---------------|-----------|
| Windows | DPAPI (machine-bound) | ✅ |
| macOS | macOS Keychain | ✅ |
| Linux (con libsecret/kwallet) | GNOME Keyring / KWallet | ✅ |
| Linux (senza libsecret) | Fallback basic encryption | ⚠️ Token salvati senza cifratura forte |

**Conseguenza importante:** ogni installazione cifra i token con la chiave del proprio SO e della propria macchina. Un database `.db` di Windows **non è importabile** su macOS o Linux — i token risulterebbero illeggibili.

### Chi è impattato

| Scenario | Impatto |
|----------|---------|
| Nuovo utente installa su Linux/Mac | ✅ Nessun problema — crea i bot fresh |
| Utente Windows migra a Linux/Mac | ⚠️ Deve re-inserire i token Telegram dei bot |
| Backup `.rtb` (export singolo bot) | ⚠️ Non portabile cross-platform — token cifrato con chiave macchina |

### Soluzione per la migrazione

Quando l'utente importa un `.rtb` su una piattaforma diversa da quella di export, `safeStorage.decryptString()` fallisce silenziosamente (già gestito nel codice — restituisce stringa vuota). L'app mostra già il campo token vuoto in quel caso. **Non c'è crash**, ma l'utente deve re-inserire il token.

Da documentare chiaramente nel README e nella UI (messaggio informativo all'import).

---

## Firma del Codice

### Linux
**Non richiesta.** AppImage e .deb girano senza firma. Nessun blocco.

### macOS
- **Senza firma:** l'app si avvia con right-click → Apri (avviso Gatekeeper). Accettabile per distribuzione privata o beta.
- **Con firma + notarizzazione:** richiede Apple Developer Program ($99/anno). Indispensabile per distribuzione pubblica (nessun avviso Gatekeeper).
- **Stato attuale:** firma affidata a un collega con account Apple Developer. Da definire i dettagli operativi.

### Windows (attuale)
Già funzionante senza firma (warning SmartScreen accettabile).

---

## Build con GitHub Actions

GitHub Actions risolve il problema "non ho un Mac o Linux in locale". Ogni piattaforma viene compilata sul runner nativo corrispondente.

### Workflow proposto (`.github/workflows/build.yml`)

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: Builds/*.exe

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: linux-packages
          path: |
            Builds/*.AppImage
            Builds/*.deb

  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
        env:
          # Variabili per firma (opzionale — se non presenti, build non firmata)
          CSC_LINK: ${{ secrets.MAC_CERT }}
          CSC_KEY_PASSWORD: ${{ secrets.MAC_CERT_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
      - uses: actions/upload-artifact@v4
        with:
          name: mac-dmg
          path: Builds/*.dmg
```

Il workflow si attiva automaticamente al push di un tag `v*` (es. `v2.0.0`).  
Se le variabili di firma non sono configurate nei Secrets, la build Mac procede comunque — semplicemente non firmata.

---

## Lavoro Richiesto

| Task | Tempo stimato | Note |
|------|--------------|-------|
| Aggiungere sezione `mac` in `package.json` | 10 min | Banale |
| Creare `.github/workflows/build.yml` | 1 ora | Copiar-incollare workflow sopra + test |
| Test build Linux su GitHub Actions | 30 min | Verificare che `better-sqlite3` si ricompili |
| Test build macOS su GitHub Actions | 30 min | Prima build non firmata per verifica |
| Messaggio UI per import token cross-platform | 30 min | Informare l'utente che il token va re-inserito |
| Documentare limitazione safeStorage nel README | 20 min | |
| **TOTALE** | **~3 ore** | Esclusa gestione firma macOS con il collega |

---

## Decisione su macOS

macOS è **opzionale** nel processo. Se la firma con il collega si complica o tarda, si può procedere così:

1. **v2.x Linux first** — AppImage + deb, nessuna firma, tutto semplice.
2. **macOS after** — quando la firma è risolta, si aggiunge il target e si testa.

La build GitHub Actions è configurata in modo che macOS possa essere abilitato/disabilitato semplicemente aggiungendo o rimuovendo il job `build-mac` dal workflow.

---

## Roadmap (storico — tutto completato)

```
[✅ v1.10.2]  GitHub Actions CI/CD + build Linux (AppImage + deb) + crypto.ts cross-platform
[✅ v1.10.3]  #11 autoUpdater nativo → electron-updater + bridge repo
[✅ v1.10.4]  Gumroad launch Windows + Linux
[⏳ futuro]   Build macOS — in attesa firma dal collega
[⏳ futuro]   Runtime TelegramBot Server Mode (vedi PROGETTO-SERVER.md)
```

---

## Riferimenti

- `package.json` — sezione `"build"` (configurazione electron-builder)
- `src/main/bot/manager.ts` — uso di `safeStorage` (encrypt/decrypt token)
- `docs/PROGETTO-SERVER.md` — modalità headless/VPS (progetto separato)
