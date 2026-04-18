# Changelog — v1.10.3

**Data:** 18 Aprile 2026
**Tipo:** Feature — Auto-Updater nativo

---

## #11 — electron-updater: aggiornamento automatico nativo

Sostituisce il vecchio sistema di update check (fetch su `titan-version.json`) con `electron-updater`, la libreria standard dell'ecosistema Electron per aggiornamenti OTA firmati.

### Come funziona

1. All'avvio in produzione, l'app verifica automaticamente la presenza di nuove versioni sul **bridge repo** pubblico (`Ecosystem-Runtime/runtime-telegrambot-releases`) via GitHub Releases.
2. Se esiste una versione più recente, il download parte in background. Una notifica toast avvisa l'utente: *"Download aggiornamento v{{version}} in corso..."*
3. A download completato, compare un **banner persistente** in fondo alla dashboard: *"v{{version}} pronto — Riavvia per installare"* con il pulsante **Riavvia e installa**.
4. Al click, l'app si chiude e l'installer viene eseguito silenziosamente; l'app riparte con la versione aggiornata.

### File modificati

| File | Modifica |
|------|----------|
| `src/main/index.ts` | `mainWindow` sollevato a scope di modulo; setup `autoUpdater` con eventi `update-available` / `update-downloaded` → `webContents.send()` |
| `src/main/ipc.ts` | Import statico `electron-updater`; `check-for-updates` ora chiama `autoUpdater.checkForUpdates()`; aggiunto handler `install-update` → `quitAndInstall()` |
| `src/preload/index.ts` | Aggiunti `installUpdate`, `onUpdateAvailable`, `onUpdateDownloaded` al bridge IPC |
| `src/renderer/src/env.d.ts` | Aggiornati tipi `TitanAPI` |
| `src/renderer/src/components/Dashboard.tsx` | Rimossa logica poll manuale; registrati listener eventi; banner update-ready con pulsante install |
| `src/renderer/src/locales/*.json` | Aggiornato blocco `updater` in 8 lingue: `downloading`, `ready`, `install` |
| `electron-builder.yml` | Aggiunta sezione `publish` → `Ecosystem-Runtime/runtime-telegrambot-releases` |
| `package.json` | Aggiunta dipendenza `electron-updater ^6.x`; version `1.10.3` |

### Note tecniche

- `electron-updater` è bundlato inline da Vite (puro JS, nessuna dipendenza nativa).
- `autoInstallOnAppQuit: false` — l'installazione avviene solo su richiesta esplicita dell'utente.
- In modalità `dev` il check non parte (guard `!is.dev`).
- La verifica firma avviene automaticamente tramite il blocco firma di electron-builder (codesign Windows/macOS).

---

*Per la lista completa delle versioni consulta [CHANGELOG.md](../../CHANGELOG.md).*
