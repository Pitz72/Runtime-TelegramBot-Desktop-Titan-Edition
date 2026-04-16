# Changelog v1.8.4

**Data:** 16 Aprile 2026  
**Branch:** main  
**Tag:** v1.8.4

---

## Feature F2 — Retry Queue per invii Telegram falliti

### Problema (precedente comportamento)

Quando Telegram restituiva un errore su un item (connessione, rate-limit, media non disponibile), `processPublishQueue()` loggava il fallimento e passava all'item successivo **senza** chiamare `BotManager.markProcessed()`. Di conseguenza:

- `isProcessed()` continuava a restituire `false` per quell'item
- Al ciclo di check successivo, l'item veniva ri-aggiunto alla coda
- Il ciclo si ripeteva **all'infinito** fino al riavvio dell'engine

### Soluzione implementata

**File:** `src/main/bot/engine.ts`

1. **`PublishJob` — campo `retryCount: number`**  
   Aggiunto al tipo `PublishJob` per tracciare il numero di tentativi già effettuati (0 = primo invio).

2. **`MAX_RETRIES = 3` — costante di modulo**  
   Numero massimo di tentativi prima di marcare l'item come definitivamente processato.

3. **`processFeed()` — inizializzazione coda**  
   Ogni nuovo item viene accodato con `retryCount: 0`.

4. **`processPublishQueue()` — logica retry con cap**  
   In caso di `success = false`:
   - Se `retryCount < MAX_RETRIES`: re-accoda il job con `retryCount + 1`, log `⚠️` con numero tentativo
   - Se `retryCount >= MAX_RETRIES`: chiama `BotManager.markProcessed()` per bloccare il loop, log `❌` definitivo

   ```
   Tentativo 1 → fallisce → riaccodato (retryCount=1)
   Tentativo 2 → fallisce → riaccodato (retryCount=2)
   Tentativo 3 → fallisce → riaccodato (retryCount=3)
   Tentativo 4 → fallisce → markProcessed(), loop interrotto
   ```

### Comportamento garantito

- **Errori temporanei** (connessione caduta, timeout): l'item viene ritentato fino a 3 volte prima di arrendersi.
- **Errori strutturali** (template malformato, media permanentemente non disponibile): dopo MAX_RETRIES tentativi, l'item è marcato come processato con flag `failed=1` implicito (non viene inviato, ma non blocca la coda).
- **Nessun loop infinito**: qualsiasi item che fallisce sistematicamente viene smaltito dopo al massimo 4 passaggi per la coda.

---

## File modificati

| File | Modifica |
|------|----------|
| `src/main/bot/engine.ts` | F2 Retry Queue: `retryCount`, `MAX_RETRIES`, logica re-accoda/markProcessed |
| `package.json` | Versione bump 1.8.3 → 1.8.4 |
