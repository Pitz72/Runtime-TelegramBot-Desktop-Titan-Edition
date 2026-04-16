# CHANGELOG v1.8.1

**Data:** 16 Aprile 2026  
**Tipo:** Fix tecnici (P2 — Medio)  
**Risolve:** Issue #16, #18, #20 dal documento di analisi Gemini  
**Nota:** Issue #13 (indici SQL su `history`) era già risolta in v1.7.16 — confermata assente qui.

---

## Fix applicati

### #16 — Rimozione di `db` come variabile globale mutabile

**File modificati:** `src/main/database/schema.ts`, `src/main/bot/manager.ts`, `src/main/ipc.ts`

**Problema:**  
`const db = new Database(dbPath)` era dichiarata a livello di modulo in `schema.ts`, eseguita all'importazione del modulo prima che `app.getPath('userData')` fosse disponibile. Questo causava un crash immediato dell'applicazione.

**Fix applicato:**  
- Rimossa la dichiarazione top-level `const db = new Database(dbPath)` da `schema.ts`
- Introdotta variabile privata `let _db: Database.Database | null = null`
- Aggiunta funzione pubblica `export function getDB()` che lancia un errore esplicito se chiamata prima di `initDB()`
- Dentro `initDB()`: `_db = new Database(dbPath)` + alias locale `const db = _db`
- `manager.ts`: sostituito `import { db }` con `import { getDB }` + lazy accessor `const db = () => getDB()`; tutti i `db.prepare(` → `db().prepare(`, `db.transaction(` → `db().transaction(`
- `ipc.ts`: sostituito `import { db, initDB }` con `import { getDB, initDB }`; `db.backup()` → `getDB().backup()`; `db.close()` → `getDB().close()`

---

### #18 — Normalizzazione `isActive` booleano vs intero

**File modificati:** `src/main/bot/manager.ts`

**Problema:**  
SQLite non ha un tipo `BOOLEAN` nativo — memorizza i valori come interi `0` e `1`. Le colonne `is_active` e `notifications_enabled` della tabella `bots`, e `is_active` della tabella `feeds`, venivano restituite come `number` (0 o 1) invece di `boolean`. Il tipo TypeScript `BotConfig` dichiarava queste colonne come `boolean`, creando un disallineamento silenzioso tra tipo dichiarato e valore reale.

**Fix applicato:**  
Nel metodo `getBots()`, il mapping ritorna ora:
```typescript
return {
    ...bot,
    token,
    is_active: bot.is_active === 1,
    notifications_enabled: bot.notifications_enabled === 1,
};
```
Nel metodo `getFeeds()`, aggiunto mapping esplicito:
```typescript
const rows = db().prepare(...).all(botId) as any[];
return rows.map(f => ({ ...f, is_active: f.is_active === 1 })) as FeedConfig[];
```
I valori `0/1` di SQLite vengono convertiti in `false/true` TypeScript prima di essere esposti al resto dell'applicazione.

---

### #20 — Backup creato PRIMA delle migrazioni (posizionamento corretto)

**File modificati:** `src/main/database/schema.ts`

**Problema:**  
Il backup automatico del database veniva creato incondizionatamente ad ogni avvio dell'applicazione, anche quando il database era già aggiornato (nessuna migrazione necessaria). Questo causava la creazione di decine di backup inutili nel `userData`, consumando spazio disco e rendendo difficile identificare i backup effettivamente legati a migrazioni.

**Fix applicato:**  
Il blocco di backup è ora condizionale: viene eseguito solo se `currentVersion < 6` (ossia solo quando ci sono migrazioni da applicare). Il backup rimane posizionato PRIMA dell'esecuzione delle migrazioni (semantica corretta per il ripristino). Su installazioni aggiornate (versione DB = 6), non viene creato alcun backup.

```typescript
// Prima: backup incondizionale ad ogni avvio
if (!isNewInstall && fs.existsSync(dbPath)) { /* backup */ }

// Dopo: backup solo se servono migrazioni
if (currentVersion < 6) { /* backup pre-migrazione */ }
```

---

## Riepilogo tecnico

| Fix | File | Tipo |
|-----|------|------|
| #16 lazy DB init | `schema.ts`, `manager.ts`, `ipc.ts` | Architetturale |
| #18 boolean normalization | `manager.ts` | Correttezza tipo |
| #20 backup condizionale | `schema.ts` | Comportamento |

---

## Note su #13

L'issue #13 (indici SQL su tabella `history`) era già stata risolta nella v1.7.16 tramite:
- Schema base: `CREATE INDEX IF NOT EXISTS idx_history_bot_id` e `idx_history_bot_id_sent_at`
- Migration v6: stessi indici per database esistenti

Non era necessario alcun intervento aggiuntivo in questa release.
