# CHANGELOG v1.8.2

**Data:** 16 Aprile 2026  
**Tipo:** Fix tecnici (P2 — Medio)  
**Risolve:** Issue #17 e #19 dal documento di analisi Gemini

---

## Fix applicati

### #17 — Rate-limiting per bot con molti feed

**File modificati:** `src/main/bot/engine.ts`

**Problema:**  
In `checkLoop()`, i feed di un bot venivano fetchati in rapida successione senza alcun ritardo. Un bot con 10+ feed effettuava 10+ richieste HTTP consecutive in pochi secondi verso lo stesso server RSS (es. Feedburner, WordPress, Anchor), rischiando di:
- Ricevere errori `429 Too Many Requests` o blocchi temporanei dall'host RSS
- Generare pattern di traffico anomali potenzialmente interpretati come scraping

**Fix applicato:**  
- Nel loop dei feed attivi, aggiunta una pausa di **1 secondo** tra un fetch e il successivo (salta l'ultima iterazione per non ritardare inutilmente la fine del ciclo)
- Ottimizzazione minore: i feed disabilitati vengono ora filtrati prima di entrare nel loop, con log aggregato `N feed disabilitati, saltati`
- Aggiunto **warning log** se la coda di invio (`publishQueue`) supera 50 item — segnale che l'engine sta accumulando un backlog anomalo

```typescript
// Rate-limiting inter-feed: pausa tra un fetch e il successivo
if (i < activeFeeds.length - 1 && this.isRunning) {
    await new Promise(resolve => setTimeout(resolve, 1000));
}

// Warning: coda troppo grande
if (this.publishQueue.length > 50) {
    TitanLogger.log(`⚠️ Coda di invio grande: ${this.publishQueue.length} item in attesa.`);
}
```

**Nota:** Il ritardo di 3 secondi tra messaggi inviati a Telegram (`processPublishQueue`) era già presente. Questo fix agisce sul lato **fetch** (RSS/YouTube), non sul lato Telegram.

---

### #19 — Cache/throttle per YouTube Innertube

**File modificati:** `src/main/bot/youtube.ts`, `src/main/bot/engine.ts`

**Problema:**  
`fetchYouTubeVideos()` effettuava una chiamata Innertube per ogni invocazione, senza alcun meccanismo di caching. Due scenari critici:
1. **Multi-bot sullo stesso canale:** se 3 bot monitorano lo stesso canale YouTube, il canale viene fetchato 3 volte per ciclo — spreco di connessioni Innertube e rischio di rate-limit da YouTube
2. **Check interval breve:** con `check_interval = 1` minuto, lo stesso canale viene fetchato ogni minuto indipendentemente da quante volte è già stato consultato

**Fix applicato:**

Cache in-memory con TTL di **5 minuti**, chiave = channel ID/handle normalizzato:

```typescript
const YOUTUBE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minuti
const youtubeCache = new Map<string, YouTubeCacheEntry>();
```

All'inizio di `fetchYouTubeVideos()`:
```typescript
const cacheKey = normalizeChannelKey(channelIdOrHandle);
const cached = youtubeCache.get(cacheKey);
if (cached && (Date.now() - cached.fetchedAt) < YOUTUBE_CACHE_TTL_MS) {
    TitanLogger.log(`[YouTube] Cache HIT per "${cacheKey}" (età: ${age}s)`);
    return cached.items;
}
```

Al termine del fetch riuscito:
```typescript
youtubeCache.set(cacheKey, { items, fetchedAt: Date.now() });
```

**Invalidazione cache:**
- `resetYouTubeSession()` chiama ora `clearYouTubeCache()` (reset combinato sessione + cache)
- `BotEngine.stop()` chiama `clearYouTubeCache()` per garantire dati freschi al prossimo avvio

**Funzione pubblica `clearYouTubeCache()`** esportata per future integrazioni (es. pulsante "Reset Cache" in UI).

---

## Riepilogo tecnico

| Fix | File | Tipo |
|-----|------|------|
| #17 inter-feed delay 1s | `engine.ts` | Comportamento |
| #17 queue warning >50 | `engine.ts` | Monitoraggio |
| #19 cache YouTube 5min TTL | `youtube.ts` | Prestazioni |
| #19 invalidazione cache su stop/reset | `engine.ts`, `youtube.ts` | Correttezza |

---

## Note operative

- La cache YouTube ha un TTL fisso di 5 minuti. Con `check_interval` ≥ 5 min (configurazione tipica), la cache è scaduta prima del ciclo successivo → zero fetch mancati, ma protezione efficace per intervalli brevi
- Il delay inter-feed di 1s allunga il tempo totale di un ciclo di check. Un bot con 20 feed impiegherà ~20s extra per il fetch. Questo è trascurabile rispetto all'intervallo di check (15+ minuti)
- Il delay Telegram di 3s tra invii (già esistente) rimane invariato — garantisce ~20 messaggi/minuto per canale, entro i limiti Telegram
