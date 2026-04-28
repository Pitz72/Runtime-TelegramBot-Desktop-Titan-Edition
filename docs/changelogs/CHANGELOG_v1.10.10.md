# Changelog v1.10.10 — "LogVault + UpdateFix"

**Data:** 28 Aprile 2026  
**Tipo:** Feature + Bugfix  
**Piattaforma:** Windows, Linux, macOS  
**Stato:** Stabile (Produzione)

---

## Fix: Auto-Updater race condition

**File:** `src/main/index.ts`

`autoUpdater.checkForUpdates()` veniva chiamato nel processo main immediatamente all'avvio dell'app, prima che il renderer avesse montato il componente React e registrato i listener `onUpdateAvailable`/`onUpdateDownloaded`. Il messaggio IPC `update-available` arrivava su `webContents.send()` ma non c'era nessun ascoltatore → notifica persa silenziosamente.

La soluzione: rimosso il check dal main process. Il renderer già chiama `window.api.checkForUpdates()` nel suo `useEffect` al mount — in quel momento i listener sono già registrati e il messaggio viene ricevuto correttamente.

---

## Feature: Virtual Scroll + Log Buffer 5000 righe

**File:** `src/renderer/src/components/Dashboard.tsx`

Il pannello log era limitato a 300 entry renderizzate come nodi DOM semplici. Con sessioni lunghe (12-24h) e molti feed attivi, questo limitava la visibilità storica.

### Cosa cambia

- **Buffer esteso:** da 300 → **5000 entry** mantenute in memoria (`~3-5 MB` per sessioni molto attive)
- **Virtual scroll** via `@tanstack/react-virtual`: il DOM contiene solo le righe visibili (~20-30) + un buffer overscan di 15. Scrollare 5000 righe è fluido come scrollare 50
- **Nuovo pacchetto:** `@tanstack/react-virtual ^3.13.x` aggiunto alle dipendenze

### Comportamento

Il log mantiene l'ordine attuale (più recente in cima). Le entry più vecchie si trovano scrollando verso il basso. Il comportamento visivo è identico a prima, la differenza è nella quantità di storia disponibile.

---

## File Modificati

- `src/main/index.ts` — rimosso `autoUpdater.checkForUpdates()` dal main process
- `src/renderer/src/components/Dashboard.tsx` — virtual scroll, buffer 5000
- `package.json` — aggiunto `@tanstack/react-virtual`, versione → 1.10.10
- Documentazione: `CHANGELOG.md`, `docs/index.md`, `docs/STATO-PROGETTO.md`

---

*(C) 2026 Runtime Radio — Titan Desktop v1.10.10 "LogVault + UpdateFix"*
