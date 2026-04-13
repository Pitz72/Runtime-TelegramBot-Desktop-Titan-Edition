# Changelog v1.7.12 (Titan Edition)

**Data di Rilascio:** 13 Aprile 2026

## 🛡️ Sicurezza: Abilitazione Sandbox

### 1. Fix Vulnerabilità XSS (Bug #2)
È stata risolta una vulnerabilità critica legata alla sicurezza del processo del renderer (sandbox disabilitato).

**Analisi del problema:**
Il parametro `sandbox: false` nel file `src/main/index.ts` permetteva teoricamente a qualsiasi script dannoso in un feed RSS di accedere liberamente alle API di Node.js e al filesystem nativo, mettendo a rischio il processo principale. 

**Interventi effettuati:**
- **Abilitazione Sandbox:** Impostato il parametro `sandbox: true` all'interno di `webPreferences` per il `BrowserWindow` principale. Questo confina il renderer e le sue esecuzioni in ambiente sicuro isolato al livello operativo, conformemente con le raccomandazioni moderne di Electron.
- Il file `src/preload/index.ts` continua a comunicare in modo sicuro sfruttando `contextBridge` e `ipcRenderer`, mantenendo integra l'operatività del software e neutralizzando i potenziali vettori d'attacco.

## 📦 Build e Versione
- Versione aggiornata alla **v1.7.12** in `package.json`.
