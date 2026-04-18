# Changelog — v1.10.2

**Data:** 18 Aprile 2026  
**Tipo:** Compatibilità cross-platform — macOS e Linux  
**Branch:** main

---

## Novità

### Compatibilità 100% macOS e Linux

Runtime TelegramBot è ora compatibile con macOS e Linux oltre che Windows, senza alcuna riduzione di funzionalità. Le build per tutte e tre le piattaforme vengono prodotte automaticamente tramite GitHub Actions.

---

### 1. Encryption cross-platform — `src/main/crypto.ts`

Il punto critico del porting era la gestione dei token Telegram cifrati in database. La v1.7.8 aveva introdotto `safeStorage` di Electron (OS keychain) come meccanismo di cifratura, ma questo creava un problema su Linux senza libsecret/kwallet: `safeStorage.isEncryptionAvailable()` restituisce `false` e i token venivano salvati in chiaro.

**Soluzione:** nuovo modulo `src/main/crypto.ts` con strategia a due livelli:

1. **Livello primario — `safeStorage` (OS keychain):** usato quando disponibile. Output prefissato `ss:` per disambiguazione.
   - Windows → DPAPI
   - macOS → macOS Keychain
   - Linux (con libsecret/GNOME Keyring/KWallet) → sistema nativo

2. **Livello fallback — AES-256-GCM con machine key:** usato quando `safeStorage` non è disponibile (es. Linux minimal/headless). La chiave è un buffer random di 32 byte generato al primo avvio e salvato in `userData/.machine-key` con permessi `0o600`. Output prefissato `mk:`.

**Retrocompatibilità garantita:** `decryptToken()` gestisce tutti i formati storici:
- `ss:...` → formato nuovo safeStorage (v1.10.2+)
- `mk:...` → formato nuovo machine-key (v1.10.2+)
- base64 senza prefisso → legacy safeStorage (v1.7.8–v1.10.1), decrittografato on-the-fly
- testo plain → pre-v1.7.8, restituito as-is

I token nel DB vengono migrati al nuovo formato al prossimo `createBot`/`updateBot`.

**Nota sulla portabilità dei token:** i token rimangono macchina-specifici su tutte le piattaforme. Chi migra il database da Windows a macOS/Linux dovrà re-inserire i token bot (la UI mostra già il campo vuoto in quel caso, senza crash).

---

### 2. Build macOS — `package.json` + `build/entitlements.mac.plist`

Aggiunta configurazione electron-builder per macOS:
- Target: `dmg`
- `hardenedRuntime: true` (prerequisito per notarizzazione Apple)
- `gatekeeperAssess: false` (permette build non firmate per testing)
- File entitlements per JIT e network access

La build macOS funziona **senza firma** (mostra avviso Gatekeeper, superabile con right-click → Apri). Con firma Apple Developer i secret GitHub (`MAC_CERT`, `APPLE_ID`, ecc.) abilitano la notarizzazione completa.

---

### 3. GitHub Actions CI/CD — `.github/workflows/build.yml`

Workflow automatico che compila per tutte e tre le piattaforme su runner nativi:

| Job | Runner | Output |
|-----|--------|--------|
| `build-windows` | `windows-latest` | `.exe` (NSIS installer) |
| `build-linux` | `ubuntu-latest` | `.AppImage` + `.deb` |
| `build-mac` | `macos-latest` | `.dmg` |
| `release` | `ubuntu-latest` | GitHub Release con tutti gli artifact |

Il workflow si attiva su:
- Push di tag `v*` (es. `v2.0.0`) → build + GitHub Release automatica
- `workflow_dispatch` → build manuale da GitHub UI

La build macOS usa i secret GitHub per la firma opzionale — se non configurati, produce una build non firmata senza errori.

---

## File Modificati

| File | Tipo | Descrizione |
|------|------|-------------|
| `src/main/crypto.ts` | Nuovo | Wrapper encryption cross-platform (safeStorage + AES-256-GCM fallback) |
| `src/main/bot/manager.ts` | Main | Usa `encryptToken`/`decryptToken` dal wrapper invece di `safeStorage` diretto per i token DB |
| `package.json` | Config | Aggiunta sezione `mac` e `win` esplicita; bump a `1.10.2` |
| `build/entitlements.mac.plist` | Nuovo | Entitlements macOS per hardenedRuntime |
| `.github/workflows/build.yml` | Nuovo | CI/CD multi-platform con GitHub Actions |
| `docs/PROGETTO-SERVER.md` | Docs | Decisione ufficiale: server mode rimandato a tempo indeterminato |

---

## Note Operative

### Linux — dipendenze sistema

Su alcune distribuzioni Linux minimal potrebbe essere necessario installare `libsecret`:
```bash
# Debian/Ubuntu
sudo apt-get install libsecret-1-0

# Fedora/RHEL
sudo dnf install libsecret
```
Se `libsecret` non è disponibile, l'app funziona ugualmente con il fallback AES-256-GCM.

### macOS — prima installazione

Senza firma Apple Developer, al primo avvio comparirà l'avviso di Gatekeeper:
```
"Runtime Telegram Bot Titan Edition" non può essere aperto perché proviene da uno sviluppatore non identificato.
```
Soluzione: tasto destro sull'app → Apri → Apri.

---

## Ordine di esecuzione verso v2.0.0

```
[FATTO] Tutti i fix e feature F1-F9                                        ✅
[FATTO] Performance Mode UI                              ← v1.10.1          ✅
[FATTO] Compatibilità cross-platform macOS + Linux       ← v1.10.2          ✅
──────────────────────────────────────────────────────────────────────────
[LAST]  #11 autoUpdater nativo (electron-updater + GitHub Releases)  →  v2.0.0
```
