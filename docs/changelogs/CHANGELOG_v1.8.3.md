# CHANGELOG v1.8.3

**Data:** 16 Aprile 2026  
**Tipo:** Pulizia tecnica — Blocco B (Criticità Lievi)  
**Risolve:** Issue #22, #23, #24, #26 dal documento di analisi Gemini

---

## Fix applicati

### #22 — Sostituzione `key={i}` (indice) con ID stabili nei log

**File modificati:** `src/renderer/src/components/Dashboard.tsx`, `src/shared/types.ts`

**Problema:**  
I messaggi di log nella Dashboard erano renderizzati con `key={i}` (indice dell'array):
```jsx
{logs.map((log, i) => (
    <div key={i} ...>  {/* ⚠️ indice instabile */}
```
React usa la `key` per identificare gli elementi del DOM tra un re-render e l'altro. Con `key={i}`, l'aggiunta di un log in testa alla lista causa il ricalcolo e re-mount di tutti gli elementi (ogni elemento "sposta" il suo indice). Questo produce flickering visivo e prestazioni subottimali.

**Fix applicato:**  
Ogni `LogEntry` ha ora un campo `id: number` — contatore monotono crescente assegnato dal `TitanLogger` a livello di processo main. L'ID è stabile per tutta la vita dell'entry e non cambia quando nuovi log vengono aggiunti in testa.
```jsx
{logs.map((log) => (
    <div key={log.id} ...>  {/* ✅ ID stabile */}
```

---

### #23 — Logging strutturato

**File modificati:** `src/shared/types.ts`, `src/main/logger.ts`, `src/preload/index.ts`, `src/renderer/src/env.d.ts`, `src/renderer/src/components/Dashboard.tsx`

**Problema:**  
Il canale IPC `bot-logs-batch` trasmetteva `string[]` — array di stringhe formattate. Il renderer riceveva plain text e applicava la colorazione tramite string-sniffing fragile basato su emoji e keyword:
```typescript
log.includes("Error") || log.includes("❌") ? "text-red-400" : ...
```
Questo accoppiamento forte tra formato del messaggio e logica UI è fragile (un cambio di emoji rompe la colorazione) e non sfrutta la struttura semantica disponibile.

**Fix applicato:**

**Nuovo tipo `LogEntry` in `shared/types.ts`:**
```typescript
export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
    id: number;       // ID monotono stabile — fix #22
    level: LogLevel;  // Livello semantico — fix #23
    message: string;  // Testo formattato "[HH:MM:SS] ..."
}
```

**`TitanLogger` aggiornato (`logger.ts`):**
- `ipcBuffer` cambiato da `string[]` a `LogEntry[]`
- Contatore `_logId` monotono (module-level) per assegnare ID stabili
- Funzione `detectLevel(message)` rileva il livello dagli emoji/keyword nella stringa:
  - `❌`, `Error`, `Fallito`, `error` → `'error'`
  - `⚠️`, `SKIP`, `⏳` → `'warn'`
  - `✅`, `🆕`, `🚀`, `Found New Item` → `'success'`
  - tutto il resto → `'info'`

**Dashboard aggiornata:**
- Stato `logs: LogEntry[]` invece di `string[]`
- `onLogsBatch` riceve `LogEntry[]`
- Colorazione basata su `log.level` (switch pulito, non fragile):
  ```jsx
  log.level === 'error' ? "text-red-400"
  : log.level === 'success' ? "text-green-400"
  : log.level === 'warn' ? "text-yellow-500"
  : "text-blue-100"
  ```
- `addLocalLog` (log renderer-side) crea un `LogEntry` con `id: Date.now()` e rileva il livello dagli emoji con la stessa logica
- `handleExportLog` serializza `LogEntry[]` → `string[]` via `logs.map(l => l.message)` prima di passare all'IPC `export-logs` (che accetta ancora `string[]`)

---

### #24 — Rimozione file di build log dalla root

**File rimossi:** `build_log.txt`, `build_log_2.txt`, `build_log_3.txt`

**Problema:**  
Tre file di log accumulati durante sessioni di debug della build erano rimasti nella root del progetto. Non erano tracciati da git (già in `.gitignore`) ma inquinavano la directory di lavoro.

**Fix applicato:** File eliminati dal filesystem.

---

### #26 — Rimozione file LICENSE duplicato

**File rimosso:** `LICENSE.txt`

**Problema:**  
La root conteneva due file di licenza: `LICENSE` (senza estensione, standard GitHub) e `LICENSE.txt` (duplicato). Il contenuto era identico.

**Fix applicato:** Rimosso `LICENSE.txt`. Mantenuto `LICENSE` (riconosciuto automaticamente da GitHub).

---

## Riepilogo tecnico

| Fix | File | Tipo |
|-----|------|------|
| #22 key stabile | `Dashboard.tsx`, `types.ts` | Qualità React |
| #23 LogEntry strutturato | `types.ts`, `logger.ts`, `preload/index.ts`, `env.d.ts`, `Dashboard.tsx` | Architettura |
| #24 build log rimossi | root | Pulizia |
| #26 LICENSE.txt rimosso | root | Pulizia |

---

## Note

- Il Blocco B è ora completato al 100% (lievi #22-26 risolti)
- Il prossimo step è il Blocco C (feature F2-F10) e infine #11 `autoUpdater` nativo prima di v2.0.0
