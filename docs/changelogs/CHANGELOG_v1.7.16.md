# Changelog v1.7.16

**Data rilascio:** 13 Aprile 2026  
**Versione precedente:** v1.7.15

---

## Fix applicati in questa versione

### #13 — Indici SQL sulla tabella `history`

**File:** `src/main/database/schema.ts`

**Problema:** La tabella `history` non aveva indici espliciti. Tutte le query
di lookup venivano risolte con full table scan, con impatto crescente
all'aumentare dei feed e della cronologia inviata.

Query interessate:
- `isProcessed()` → `SELECT id FROM history WHERE bot_id = ? AND id = ?`
- Stats giornaliere → `SELECT COUNT(*) WHERE bot_id = ? AND sent_at >= date('now', 'start of day')`
- Stats settimanali → `SELECT COUNT(*) WHERE bot_id = ? AND sent_at >= date('now', '-7 days')`

**Fix:** Aggiunti due indici:

```sql
CREATE INDEX IF NOT EXISTS idx_history_bot_id ON history(bot_id);
CREATE INDEX IF NOT EXISTS idx_history_bot_id_sent_at ON history(bot_id, sent_at);
```

Entrambi sono `IF NOT EXISTS` (idempotenti). Aggiunti sia allo schema iniziale
(nuove installazioni → versione DB 6) che come migration v6 per i database
esistenti. La migration v6 viene eseguita automaticamente al primo avvio.

---

### #14 — Singleton mutabile globale `botEngine`

**File:** `src/main/bot/engine.ts`, `src/main/ipc.ts`

**Problema:** `export const botEngine = new BotEngine()` istanziava l'engine
al momento dell'`import` del modulo, prima ancora che l'app Electron fosse
pronta. Side-effect immediati all'avvio, impossibilità di reset in test.

**Fix:** Sostituito con un lazy singleton tramite funzione esportata:

```typescript
let _botEngine: BotEngine | null = null;
export function getBotEngine(): BotEngine {
    if (!_botEngine) _botEngine = new BotEngine();
    return _botEngine;
}
```

`ipc.ts` aggiornato: `import { getBotEngine }` e tutti i call-site
(`start`, `stop`, `removeClient`) ora chiamano `getBotEngine().metodo()`.
L'istanza viene creata solo al primo handler IPC, quando l'app è già pronta.

---

### #15 — `import('electron')` dinamico dentro il loop di publish

**File:** `src/main/bot/engine.ts`

**Problema:** Il metodo `processPublishQueue` eseguiva un `import('electron')`
dinamico asincrono ad ogni item inviato con successo, dentro il loop:

```typescript
// Prima — chiamato N volte per ogni ciclo di publish
import('electron').then(({ Notification }) => {
    if (Notification.isSupported()) {
        new Notification({ ... }).show();
    }
});
```

Questo causava N richieste di module resolution per ogni ciclo, con overhead
inutile e possibili race condition sul `.then()` non awaited.

**Fix:** `Notification` aggiunta all'import statico in cima al file,
dynamic import rimosso, guard semplificato:

```typescript
// engine.ts — import statico
import { app, BrowserWindow, Notification } from 'electron';

// nel loop — sincrono, zero overhead
if (bot.notifications_enabled && Notification.isSupported()) {
    new Notification({ title: `Titan: ${bot.name}`, body: `Inviato: ${item.title}` }).show();
}
```

---

## 📦 Versione
- Versione aggiornata alla **v1.7.16** in `package.json`.
- DB schema bumped a **v6** (migration automatica indici history).
