# Changelog v1.8.5

**Data:** 16 Aprile 2026  
**Branch:** main  
**Tag:** v1.8.5

---

## Feature F3 — Dashboard multi-bot

### Analisi della situazione pre-F3

Prima di questa versione:
- **Log**: globali per tutti i bot (TitanLogger centralizzato), già mostrati con prefisso `[NomeBot]` — ✅ comportamento corretto
- **Stats**: già filtrate per `botId` tramite `getStats(botId)` — ✅ già multi-bot
- **Sidebar bot**: mostrava nome, channel_id e data di partenza, ma **nessun indicatore di stato attivo/disabilitato** — ❌
- **Console log**: nessun modo per filtrare e vedere solo i log del bot selezionato — ❌

### Interventi implementati

#### 1. Indicatori di stato nella sidebar (`BotSelector.tsx`)

Ogni bot nella sidebar mostra ora un **dot colorato** affiancato al nome:
- 🟢 **Verde** (`bg-green-500`) — bot abilitato (`is_active = true`)
- ⚫ **Grigio scuro** (`bg-neutral-700`) — bot disabilitato (`is_active = false`)

Il nome del bot disabilitato viene reso in `text-neutral-700` (grigio scuro) invece di `text-neutral-400`, per rendere immediatamente visibile la distinzione senza dover aprire le impostazioni del bot. Channel ID anch'esso attenuato.

Nessuna nuova chiamata IPC — il campo `is_active` è già presente nel `BotConfig` restituito da `getBots()`.

#### 2. Toggle filtro log nella console (`Dashboard.tsx`)

Nel header del pannello log è stato aggiunto un **segmented control** `[ALL BOTS] | [THIS BOT]`:

- **ALL BOTS** (default): mostra tutti i log di tutti i bot — comportamento invariato
- **THIS BOT**: filtra client-side i log che contengono `[NomeBot]` nel messaggio

Il filtro è:
- **Reset automatico** al cambio del bot selezionato (non rimane filtrato su un bot precedente)
- **Disabilitato** (greyed out) se nessun bot è selezionato
- **Zero overhead** backend: filtro puro `Array.filter()` in memoria sul renderer, nessuna nuova IPC call
- Quando il filtro è attivo e non ci sono log corrispondenti, lo stato vuoto mostra il nome del bot invece di "Awaiting ignition..."

#### 3. Localizzazione completa

Aggiunti in tutti e 8 i file locale:
- `logs.filterAll` — "All Bots" / "Tutti" / "Alle" / "Tous" / "Todos" / "Все" / "全部" ecc.
- `logs.filterBot` — "This Bot" / "Solo questo" / "Dieser Bot" / "Ce Bot" ecc.

---

## File modificati

| File | Modifica |
|------|----------|
| `src/renderer/src/components/BotSelector.tsx` | Dot stato `is_active`, nome grigiato se disabilitato |
| `src/renderer/src/components/Dashboard.tsx` | State `filterBySelectedBot`, `displayedLogs`, toggle segmentato nel header log |
| `src/renderer/src/locales/en.json` | `logs.filterAll`, `logs.filterBot` |
| `src/renderer/src/locales/it.json` | idem |
| `src/renderer/src/locales/de.json` | idem |
| `src/renderer/src/locales/fr.json` | idem |
| `src/renderer/src/locales/es.json` | idem |
| `src/renderer/src/locales/pt.json` | idem |
| `src/renderer/src/locales/ru.json` | idem |
| `src/renderer/src/locales/zh.json` | idem |
| `package.json` | Versione bump 1.8.4 → 1.8.5 |
