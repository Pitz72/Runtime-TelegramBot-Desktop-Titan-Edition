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
