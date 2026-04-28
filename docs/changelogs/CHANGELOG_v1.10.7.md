# Changelog v1.10.7 — "SilentGuard" Quiet Hours Persistence

**Data:** 28 Aprile 2026  
**Tipo:** Feature — Affidabilità pubblicazione  
**Piattaforma:** Windows, Linux, macOS  
**Stato:** Stabile (Produzione)

---

## Il Problema

Quando il bot rilevava contenuti nuovi durante le ore di silenzio (quiet hours), li saltava con `continue` senza salvare nulla. Se il feed aveva un backlog corto (es. mostra solo gli ultimi 5 articoli e nel frattempo ne arrivano altri), l'item scompariva dal feed prima che le quiet hours terminassero. Risultato: contenuto **perso silenziosamente**, senza errori né log di allarme.

Per un software il cui scopo principale è pubblicare contenuti in modo affidabile, questo era un punto critico.

---

## La Soluzione: `pending_queue` persistente

Introdotta una nuova tabella SQLite `pending_queue` che funge da **coda persistente per gli item in attesa delle quiet hours**. Sopravvive ai riavvii del bot e dell'applicazione.

### Flusso aggiornato

**Durante le quiet hours** — quando un item supera tutti i controlli (Triple-Lock cutoff, isProcessed, keyword filter) ma le ore di invio non sono consentite:
```
PRIMA: item.continue → perso se il feed scola il backlog
DOPO:  BotManager.addToPendingQueue() → salvato nel DB, recuperato alla riapertura
```

**All'inizio di ogni ciclo** — per ogni bot attivo, prima di scansionare i feed:
1. Controlla se le quiet hours sono terminate (`isTimeAllowed`)
2. Se sì, recupera tutti gli item dalla `pending_queue` ordinati per data
3. Per ogni item: verifica che il feed esista ancora, verifica `isProcessed` (safety), sposta in `publishQueue`
4. Il flusso normale di invio con retry gestisce il resto

**Gestione degli edge case:**
- Feed eliminato mentre un item era in coda → rimosso silenziosamente
- Item già processato da un altro path → rimosso senza re-invio
- Quiet hours rientrano a metà drenaggio → loop interrotto, item rimanenti restano in coda
- Riavvio app durante il drenaggio → item non in history + non in publishQueue → al ciclo successivo ripassa `isProcessed → false` → re-accodato in `pending_queue`

---

## Dettagli Tecnici

### Schema DB — versione v11

```sql
CREATE TABLE pending_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bot_id INTEGER NOT NULL,
    feed_id INTEGER NOT NULL,
    item_id TEXT NOT NULL,
    item_title TEXT,
    item_link TEXT NOT NULL,
    item_summary TEXT,
    item_image TEXT,
    item_date DATETIME NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bot_id, item_id),
    FOREIGN KEY(bot_id) REFERENCES bots(id) ON DELETE CASCADE,
    FOREIGN KEY(feed_id) REFERENCES feeds(id) ON DELETE CASCADE
);
```

`UNIQUE(bot_id, item_id)` garantisce che lo stesso item non venga accodato due volte per lo stesso bot, anche se è presente in più feed. `ON DELETE CASCADE` su entrambe le FK: eliminare un bot o un feed pulisce automaticamente la coda.

### File modificati
- `src/main/database/schema.ts` — tabella `pending_queue`, migration v11, safety check
- `src/main/bot/manager.ts` — `addToPendingQueue`, `getPendingQueue`, `removePendingItem`
- `src/main/bot/engine.ts` — `drainPendingQueue` (nuovo metodo), hook in `checkLoop`, sostituzione `continue` in `processFeed`, contatore `deferredCount` nel log

---

*(C) 2026 Runtime Radio — Titan Desktop v1.10.7 "SilentGuard"*
