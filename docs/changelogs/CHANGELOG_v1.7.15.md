# Changelog v1.7.15 (Titan Edition)

**Data di Rilascio:** 13 Aprile 2026

## 🛡️ Fix Sicurezza: Validazione strutturale file `.rtb` importati

### Problema (#10 del documento di analisi)

Le funzioni `importSingleBot` e `importConfig` in `manager.ts` accettavano e persistevano
i dati di un file `.rtb` senza alcuna validazione, bypassando completamente i validator
(`assertString`, `assertFeedType`, `validateFeedUrl`) già presenti in `ipc.ts` per il path
normale (creazione bot/feed da UI).

Un file `.rtb` malevolo o corrotto poteva:
- Inserire bot con `name` o `channelId` vuoti, causando comportamenti indefiniti nell'engine
- Inserire feed con `type` arbitrario, provocando crash nella logica di template selection
- Inserire URL di rete privata/loopback nei feed (bypass SSRF), aggirando `validateFeedUrl`
- Inserire `checkInterval` negativi o enormi, sfuggendo al clamp del check engine

### Fix applicato

**File:** `src/main/bot/manager.ts`

Aggiunto un layer di validazione dedicato all'import RTB, con le stesse regole degli
handler IPC:

```typescript
function validateRtbBot(bot: any): void { ... }
function validateRtbFeed(feed: any): void { ... }
```

- **`validateRtbBot`**: verifica che `name` e `channelId` siano stringhe non vuote,
  che `checkInterval` sia un intero 1–1440, che i campi orari siano in formato HH:MM
- **`validateRtbFeed`**: verifica che `name` sia non vuoto, che `type` sia uno tra
  `podcast|news|youtube`, e applica `validateFeedUrl` (anti-SSRF) per tutti i feed
  non-YouTube — esattamente come fa `add-feed` in `ipc.ts`

La validazione viene eseguita **prima** di aprire la transazione SQLite, quindi in caso
di errore nessun dato viene scritto nel database (fail-fast, nessuna scrittura parziale).

### Dettaglio tecnico

I validator sono stati implementati direttamente in `manager.ts` con prefisso `rtb`
(es. `rtbAssertString`) per evitare dipendenze circolari con `ipc.ts`. La logica è
identica a quella di `ipc.ts` ma con messaggi di errore che indicano la provenienza
dal file `.rtb`.

## 📦 Versione
- Versione aggiornata alla **v1.7.15** in `package.json`.

---

## 🔧 Fix Build: SyntaxError "Cannot use import statement outside a module"

### Problema

L'app installata crashava immediatamente all'avvio con:

```
SyntaxError: Cannot use import statement outside a module
  at C:\...\app.asar\dist-electron\main\index.cjs:8
  import require$$0$3, { app, BrowserWindow, safeStorage, ... } from "electron";
```

Il file `index.cjs` conteneva `import` ESM nonostante l'estensione `.cjs`.

### Diagnosi

Due tentativi falliti prima di identificare la causa radice:

**Tentativo 1 — `format: 'cjs'` in `rollupOptions.output`**
Aggiungere `format: 'cjs'` agli output di Rollup non ha prodotto effetto.
Causa: con `build.ssr: true` (Vite 5), il formato SSR di default è ESM
e sovrascrive `rollupOptions.output.format`.

**Tentativo 2 — Rimozione di `build.ssr: true`**
Senza SSR mode, Rollup avrebbe dovuto rispettare `format: 'cjs'`.
Causa: `vite-plugin-electron/dist/index.js` (riga 42) imposta internamente:
```js
formats: esmodule ? ["es"] : ["cjs"]
```
Siccome `package.json` ha `"type": "module"`, `esmodule = true` →
il plugin forzava `build.lib.formats: ["es"]`, che ha priorità maggiore
rispetto a `rollupOptions.output.format` in Vite. Il risultato era ancora ESM.

**Causa radice identificata:**
`vite.mergeConfig()` applica il config utente sopra il default del plugin.
L'unico modo per sovrascrivere `build.lib.formats` è impostarlo esplicitamente
nel config utente, non in `rollupOptions.output.format`.

### Fix applicato

**File:** `vite.config.ts`

```typescript
// main process vite config
build: {
    outDir: '...',
    lib: {
        formats: ['cjs'],   // ← override del default ["es"] del plugin
    },
    rollupOptions: {
        external: ['better-sqlite3', 'electron'],
        output: {
            format: 'cjs',
            entryFileNames: '[name].cjs',
        }
    }
}
```

Rimosso anche `build.ssr: true` e `ssr.noExternal: true` (non necessari:
in lib mode non-SSR, Rollup bundla tutti i deps tranne quelli in `external`).

### Risultato

Output bundle main process: `index.cjs` + `node-8pVU8xir.cjs`
Entrambi iniziano con `"use strict";var` — CJS puro, nessun `import` ESM.
Dimensione installer invariata: **85 MB**.
