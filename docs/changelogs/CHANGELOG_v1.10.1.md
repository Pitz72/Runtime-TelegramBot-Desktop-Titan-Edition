# Changelog — v1.10.1

**Data:** 18 Aprile 2026  
**Tipo:** Feature — Performance Mode UI  
**Branch:** main  

---

## Novità

### Performance Mode — Toggle nelle Impostazioni di Sistema

Aggiunto un nuovo tab **"Performance"** nelle Impostazioni di Sistema (`Gear → Performance`) che consente di disabilitare gli effetti grafici GPU-intensivi di Obsidian Pulse V2.

**Problema:** L'interfaccia "Titan Glass" può risultare pesante su risoluzioni 4K o macchine con GPU legacy (AMD con driver obsoleti), causando stuttering nelle animazioni e framerate ridotto.

**Soluzione:** Toggle persistente che applica la classe `performance-mode` al `<body>` e disabilita via CSS `!important`:

- Overlay scanline fosforescente (`.scanline-bg::before` / `::after`)
- Effetto vetro backdrop-blur su `.glass-panel` e `.glass-panel-elevated` (sostituito con sfondo solido semi-trasparente)
- Animazioni `.ignition-btn.active` (ignition-pulse) e `.ignition-ring` (ignition-spin)
- Tutti i glow: `.glow-*`, `.drop-glow-*`, `.text-glow*`, `.status-dot-*`
- Box-shadow luminosi su `.panel-border-active`

**Caratteristiche:**

- **Effettivo immediatamente** — nessun riavvio richiesto, la classe viene applicata a runtime
- **Persistente** — salvato in `titan-settings.json` in userData, viene letto e applicato all'avvio dell'app
- **Localizzato in 8 lingue** — it, en, de, es, fr, pt, ru, zh (con tabBackup aggiunto anche nelle lingue che ne erano prive)
- **Zero impatto sulle funzionalità** — non tocca logica di business, solo CSS overrides

---

## File Modificati

| File | Tipo | Descrizione |
|------|------|-------------|
| `src/main/ipc.ts` | Main | Helpers `readSettings`/`writeSettings` + handlers `get-performance-mode` / `set-performance-mode` |
| `src/preload/index.ts` | Preload | Espone `getPerformanceMode()` e `setPerformanceMode()` al renderer |
| `src/renderer/src/env.d.ts` | Types | Aggiunge i due metodi alla `TitanAPI` interface |
| `src/renderer/src/index.css` | CSS | Blocco `body.performance-mode` con overrides `!important` |
| `src/renderer/src/App.tsx` | Renderer | Legge performance mode all'avvio e applica `document.body.classList` |
| `src/renderer/src/components/SystemSettingsModal.tsx` | UI | Nuovo tab "Performance" con toggle e lista effetti disabilitati |
| `src/renderer/src/locales/*.json` | i18n | Aggiunta sezione `perfSection` + `tabPerformance` + `tabBackup` (dove mancante) in 8 lingue |
| `package.json` | Config | Versione bumped a `1.10.1` |

---

## Architettura della Persistenza

Viene utilizzato un file JSON dedicato `titan-settings.json` nella directory userData di Electron (`AppData/Roaming/titan-desktop/`), separato dal database SQLite, per gestire le preferenze di sistema non legate ai bot:

```json
{
  "performanceMode": false
}
```

Questo approccio è extensible: future preferenze di sistema (es. tema, densità UI) possono essere aggiunte allo stesso file senza schema migration.

---

## Ordine di esecuzione verso v2.0.0

```
[FATTO] Blocco A — Fix P2                                              ✅
[FATTO] Blocco B — Fix P3                                              ✅
[FATTO] Feature F1-F9                                                  ✅
[FATTO] UI v1.9.1 Obsidian Pulse V2                                    ✅
[FATTO] UI v1.10.0 Fix contrasto semantico                             ✅
[FATTO] Performance Mode UI (toggle 4K/GPU legacy)  ← v1.10.1          ✅
──────────────────────────────────────────────────────────────────────
[LAST]  #11 autoUpdater nativo (electron-updater + GitHub Releases) → v2.0.0
```
