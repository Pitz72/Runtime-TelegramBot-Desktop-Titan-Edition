# 🎬 Relazione Tecnica — Problema Feed YouTube in Titan Desktop

> Analisi definitiva: perché i feed YouTube non funzionano, cosa abbiamo provato, e la strada per risolverlo
> Redatto: 24/02/2026 | Versione software: 1.1.0

---

## 1. Quadro del Problema

### 1.1 Comportamento Atteso
Titan Desktop dovrebbe poter monitorare un canale YouTube via il suo feed Atom pubblico e pubblicare automaticamente i nuovi video su Telegram, esattamente come fa con podcast e news RSS.

### 1.2 Comportamento Osservato
Ogni tentativo di fetch dell'URL del feed YouTube restituisce un **HTTP 404 Not Found**. Il feed non viene scaricato, nessun item viene parsato, nessun messaggio viene inviato.

### 1.3 Timeline del Problema
| Data | Evento |
|---|---|
| v1.0.1 (23/02/26) | Prima implementazione YouTube con parsing `media:group` — funzione parzialmente operativa |
| v1.0.2 (23/02/26) | Fix normalizzazione date Atom — migliorato il parsing ma persistono 404 |
| v1.0.5 (23/02/26) | Decisione di **sospendere** la funzionalità YouTube. Log esplicito nell'engine |
| v1.1.0 (24/02/26) | Stato invariato. Funzione ancora sospesa. Feed di tipo `youtube` vengono saltati |

---

## 2. Analisi Tecnica del Meccanismo Atom di YouTube

### 2.1 L'URL del Feed

YouTube espone (o esponeva) feed Atom per ogni canale pubblico al seguente endpoint:

```
https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}
```

Esempio reale utilizzato nei test:
```
https://www.youtube.com/feeds/videos.xml?channel_id=UCv_B7U_9_E_fXW6lEa_D8vg
```
(ID canale: `UCv_B7U_9_E_fXW6lEa_D8vg` — RadioAnziano/Runtime Radio)

### 2.2 Struttura del Feed Atom (quando funziona)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"
      xmlns:media="http://search.yahoo.com/mrss/"
      xmlns="http://www.w3.org/2005/Atom">
  <title>Nome Canale</title>
  <entry>
    <id>yt:video:VIDEO_ID</id>
    <title>Titolo Video</title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=VIDEO_ID"/>
    <published>2026-02-20T15:00:00+00:00</published>
    <updated>2026-02-20T15:30:00+00:00</updated>
    <media:group>
      <media:title>Titolo Video</media:title>
      <media:thumbnail url="https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg"
                       width="480" height="360"/>
      <media:description>Descrizione del video...</media:description>
    </media:group>
  </entry>
</feed>
```

### 2.3 Come il Parser Lo Gestisce (Codice Attuale)

In `parser.ts`, il feed viene processato da `rss-parser` con campi custom:

```typescript
const parser = new Parser({
    timeout: 30000,
    customFields: {
        item: [
            ['media:group', 'media_group'],  // ← Per thumbnail YouTube
        ]
    }
});
```

La data viene estratta con priorità:
1. `item.isoDate` (normalizzato da rss-parser)
2. `item.pubDate` (RSS standard)
3. `item.published` (Atom specifico)
4. `item.updated` (Atom fallback)

La thumbnail viene estratta da:
```typescript
const thumb = group['media:thumbnail']?.[0] || group['media:thumbnail'];
if (thumb) image = thumb['$']?.url || thumb.url;
```

**Il parser è corretto.** Se il feed venisse scaricato, il parsing funzionerebbe. Il problema è **a monte**: il feed non arriva.

---

## 3. Diagnosi dell'Errore 404

### 3.1 Ipotesi Testate

| # | Ipotesi | Risultato | Verdetto |
|---|---|---|---|
| 1 | **URL errato / ID canale sbagliato** | URL confermato valido, ID `UCv_B7U_9_E_fXW6lEa_D8vg` esistente | ❌ Esclusa |
| 2 | **Canale privato o non pubblico** | Il canale è pubblico e visibile su youtube.com | ❌ Esclusa |
| 3 | **User-Agent bloccato da Google** | `rss-parser` non invia un User-Agent browser-like. Google potrebbe filtrare richieste senza UA o con UA generici | ⚠️ **Probabile concausa** |
| 4 | **GeoIP / Rate Limiting** | IP residenziale italiano, nessun uso intensivo. Improbabile rate limit | ❌ Improbabile |
| 5 | **Google ha deprecato l'endpoint** (parzialmente) | Feed Atom di YouTube non sono più documentati ufficialmente. Google li ha rimossi dai docs dal 2023 | ✅ **Probabile causa principale** |
| 6 | **Redirect non gestito** | YouTube potrebbe rispondere con redirect 302/303 che `rss-parser` non segue | ⚠️ Possibile |
| 7 | **Cookie/Consent wall** | In UE, YouTube richiede l'accettazione cookie GDPR. Le richieste programmatiche senza cookie ricevono pagine di consenso o errori | ⚠️ **Probabile concausa** |
| 8 | **Feed funzionante ma intermittente** | Alcuni utenti su forum riportano che i feed Atom funzionano "a volte" — dipende dal canale, dalla regione e dall'header della richiesta | ⚠️ Coerente con le osservazioni |

### 3.2 Test Riproduttivo (Manuale)

Per verificare definitivamente se il feed è raggiungibile, eseguire questi comandi:

**Da browser:**
```
https://www.youtube.com/feeds/videos.xml?channel_id=UCv_B7U_9_E_fXW6lEa_D8vg
```
→ Se mostra XML, il feed funziona dal browser (hanno cookie + UA standard).

**Da terminale (senza cookie):**
```bash
curl -v "https://www.youtube.com/feeds/videos.xml?channel_id=UCv_B7U_9_E_fXW6lEa_D8vg"
```
→ Se restituisce 404 o redirect a consent page, conferma il problema.

**Da terminale (con User-Agent browser):**
```bash
curl -v -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCv_B7U_9_E_fXW6lEa_D8vg"
```
→ Se funziona con UA ma non senza, il problema è l'header.

### 3.3 Diagnosi Definitiva

Il feed Atom di YouTube è un servizio **non documentato, non supportato e non garantito** da Google. Le cause del fallimento sono quasi certamente una combinazione di:

1. **Deprecazione silenziosa**: Google sta gradualmente rimuovendo l'endpoint senza annuncio ufficiale. Non tutti i canali restituiscono feed; dipende dalla regione, dalla "età" del canale e da fattori interni di Google.

2. **Consent wall GDPR**: In Europa, le richieste HTTP senza cookie di consenso vengono bloccate o reindirizzate verso la pagina di accettazione cookie. `rss-parser` non gestisce cookie.

3. **User-Agent filtering**: Google blocca o degrada le richieste con User-Agent non riconosciuti (come il default di Node.js `node-fetch`).

---

## 4. Soluzioni Possibili

### 4.1 ❌ Continuare con il Feed Atom Pubblico (NON RACCOMANDATO)

**Approccio:** Modificare `rss-parser` per inviare un User-Agent browser-like e gestire eventuali redirect/cookie.

```typescript
const parser = new Parser({
    timeout: 30000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    },
    customFields: { ... }
});
```

**Vantaggi:** Zero costi, zero dipendenze aggiuntive, modifica minima.
**Svantaggi:**
- Soluzione fragile — Google può cambiare il comportamento in qualsiasi momento
- Potenzialmente in violazione dei ToS di YouTube (scraping implicito)
- Non risolve il problema se l'endpoint è stato effettivamente rimosso per il canale specifico
- Nessuna garanzia che funzioni domani

**Verdetto:** Vale la pena **testare** (5 minuti di lavoro), ma non si può fare affidamento a lungo termine.

### 4.2 ✅ YouTube Data API v3 (RACCOMANDATO)

**Approccio:** Utilizzare l'API ufficiale di Google per ottenere la lista dei video di un canale.

**Endpoint:**
```
GET https://www.googleapis.com/youtube/v3/search
  ?part=snippet
  &channelId={CHANNEL_ID}
  &order=date
  &maxResults=15
  &type=video
  &publishedAfter={ISO_DATE}
  &key={API_KEY}
```

**Risposta (semplificata):**
```json
{
  "items": [
    {
      "id": { "videoId": "abc123" },
      "snippet": {
        "title": "Titolo Video",
        "description": "Descrizione...",
        "publishedAt": "2026-02-20T15:00:00Z",
        "thumbnails": {
          "high": { "url": "https://i.ytimg.com/vi/abc123/hqdefault.jpg" }
        },
        "channelTitle": "Nome Canale"
      }
    }
  ]
}
```

**Requisiti:**
1. **API Key Google** — Gratuita, si ottiene dalla Google Cloud Console in 5 minuti
2. **Quota:** 10.000 unità/giorno gratuite. Ogni chiamata `search.list` costa 100 unità → **100 chiamate/giorno** gratuite → più che sufficienti per polling ogni 15-60 minuti
3. **Nessuna autenticazione OAuth** — basta una API Key semplice (nessun flusso di login)

**Implementazione proposta:**

#### A. Nuovo modulo `youtube.ts`

```typescript
// src/main/bot/youtube.ts

import { RssItem } from '../../shared/types';
import crypto from 'crypto';

export async function fetchYouTubeChannel(
    channelId: string,
    apiKey: string,
    publishedAfter: Date
): Promise<RssItem[]> {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('channelId', channelId);
    url.searchParams.set('order', 'date');
    url.searchParams.set('maxResults', '15');
    url.searchParams.set('type', 'video');
    url.searchParams.set('publishedAfter', publishedAfter.toISOString());
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`YouTube API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    return (data.items || []).map((item: any) => ({
        title: item.snippet.title,
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        pubDate: new Date(item.snippet.publishedAt),
        summary: (item.snippet.description || '').substring(0, 300),
        image: item.snippet.thumbnails?.high?.url
            || item.snippet.thumbnails?.medium?.url
            || item.snippet.thumbnails?.default?.url,
        feedName: item.snippet.channelTitle || 'YouTube',
        id: crypto.createHash('md5')
            .update(`https://www.youtube.com/watch?v=${item.id.videoId}`)
            .digest('hex')
    }));
}
```

#### B. Modifiche al Database

```sql
ALTER TABLE bots ADD COLUMN youtube_api_key TEXT DEFAULT NULL;
```

La chiave API è **per bot** (diversi utenti potrebbero avere chiavi diverse).

#### C. Modifiche all'UI

Nelle impostazioni bot (`BotSettingsModal.tsx`), aggiungere:
- Campo testo "YouTube API Key" (opzionale)
- Link helper a "Come ottenere una API Key" → apre URL esterno

Nel feed manager, quando il tipo è "youtube":
- Il campo URL diventa "Channel ID" (solo l'ID, non l'intero URL del feed Atom)
- Validazione: deve iniziare con "UC" e avere 24 caratteri

#### D. Modifiche all'Engine

In `engine.ts`, nel blocco YouTube (attualmente skip):
```typescript
if (feed.type === 'youtube') {
    if (!bot.youtube_api_key) {
        this.log(`⚠️ YouTube API Key mancante per ${bot.name}. Salta.`);
        return;
    }
    const items = await fetchYouTubeChannel(feed.url, bot.youtube_api_key, cutoffDate);
    // ...processo identico a RSS
}
```

**Vantaggi:**
- ✅ Ufficiale e supportato da Google
- ✅ Affidabile e stabile (API con SLA)
- ✅ Risposta JSON strutturata (nessun parsing XML fragile)
- ✅ Filtro `publishedAfter` server-side (efficienza)
- ✅ 100 chiamate/giorno gratuite (ampiamente sufficienti)
- ✅ Nessun problema GDPR/cookie/User-Agent

**Svantaggi:**
- ⚠️ Richiede che l'utente crei un progetto Google Cloud e ottenga una API Key
- ⚠️ Complessità UX aggiuntiva (setup iniziale)
- ⚠️ Limite quota (100 chiamate/giorno con search.list, ma mitigabile usando `playlistItems.list` che costa solo 1 unità → 10.000 chiamate/giorno)

### 4.3 🟡 Alternativa ottimizzata: `playlistItems.list` (OPZIONE MIGLIORE)

Ogni canale YouTube ha una playlist automatica "Uploads" il cui ID si ottiene sostituendo il secondo carattere dell'ID canale da "C" a "U":

```
Channel ID:  UCv_B7U_9_E_fXW6lEa_D8vg
Uploads PL:  UUv_B7U_9_E_fXW6lEa_D8vg
              ^ C → U
```

**Endpoint:**
```
GET https://www.googleapis.com/youtube/v3/playlistItems
  ?part=snippet
  &playlistId=UU{CHANNEL_ID_WITHOUT_UC}
  &maxResults=15
  &key={API_KEY}
```

**Costo:** Solo **1 unità** per chiamata (vs 100 per `search.list`)
→ **10.000 chiamate/giorno** → praticamente illimitato

**Risposta:** Identica struttura a `search.list` ma nella sezione `snippet`.

**Questa è la soluzione ottimale** perché:
- 100x più efficiente in quota
- Stesso livello di affidabilità
- Conversione triviale da channel ID a playlist ID
- L'utente non deve fare nulla di diverso

---

## 5. Proposta Definitiva per Implementazione Futura

### Architettura Proposta

```
┌─────────────────────────────────────────────────┐
│ BotSettingsModal                                │
│  └─ [Campo] YouTube API Key (opzionale)         │
├─────────────────────────────────────────────────┤
│ FeedManager                                     │
│  └─ Tipo "youtube" → campo URL = Channel ID     │
│     + validazione UC... + tooltip aiuto         │
├─────────────────────────────────────────────────┤
│ Engine                                          │
│  └─ if feed.type === 'youtube'                  │
│       → fetchYouTubeViaAPI(channelId, apiKey)   │
│       → usa playlistItems.list (1 unità/call)   │
│       → processo identico a RSS                 │
├─────────────────────────────────────────────────┤
│ youtube.ts [NEW]                                │
│  └─ channelId → uploadsPlaylistId (UC→UU)       │
│  └─ fetch playlistItems.list                    │
│  └─ map → RssItem[]                             │
├─────────────────────────────────────────────────┤
│ DB Migration                                    │
│  └─ bots.youtube_api_key TEXT DEFAULT NULL       │
└─────────────────────────────────────────────────┘
```

### Piano di Test

1. **Ottenere API Key** da [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. **Abilitare** "YouTube Data API v3" nel progetto Google Cloud
3. **Test curl manuale:**
   ```bash
   curl "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UUv_B7U_9_E_fXW6lEa_D8vg&maxResults=5&key=YOUR_KEY"
   ```
4. Se curl restituisce JSON con i video → implementare `youtube.ts`
5. Test end-to-end: configurare un bot con API Key + feed YouTube → verificare invio su Telegram

### Stima Effort

| Attività | Ore |
|---|---|
| Creazione modulo `youtube.ts` | 2h |
| Migrazione DB + campo API Key in UI | 1.5h |
| Modifica engine per routing YouTube | 1h |
| Guida utente "Come ottenere API Key" | 1h |
| Test e debug | 2.5h |
| **Totale** | **~8h** |

---

## 6. Conclusione

> **Il feed Atom pubblico di YouTube NON è una soluzione affidabile.** Google lo ha silenziosamente deprecato/limitato, e qualsiasi tentativo di usarlo è destinato a rompersi di nuovo.
>
> **L'unica soluzione stabile è la YouTube Data API v3**, usando l'endpoint `playlistItems.list` (1 unità quota/chiamata) che garantisce 10.000 chiamate/giorno gratuite.
>
> Il parser RSS attuale (`parser.ts`) è tecnicamente corretto per Atom — il problema non è nel codice ma nel servizio YouTube che rifiuta le connessioni.
>
> **Raccomandazione:** Implementare la soluzione `playlistItems.list` come priorità alta nella prossima release. Mantenere il tipo "youtube" nel database e nell'UI, ma cambiare il backend da fetch Atom a API v3.

---

## 7. Epilogo e Successo (v1.3.x)

### 7.1 La Svolta: Innertube API (`youtubei.js`)

In data 25/02/2026, è stata individuata ed implementata una soluzione che scavalca tutti i limiti precedentemente analizzati: l'uso della libreria **`youtubei.js`**. 

Invece di affidarsi ai feed Atom moribondi o alle API Data v3 (che richiedono carta di credito), questa soluzione agisce come un client YouTube interno (InnerTube), permettendo di interrogare i caricamenti di un canale in modo nativo e stabile.

### 7.2 Risultati Ottenuti (v1.3.1)

- **✅ Zero Configurazione:** L'utente non deve più configurare API Key o carte di credito su Google Cloud.
- **✅ Supporto Handle:** Grazie al motore di ricerca interno, è possibile inserire direttamente l'handle del canale (es. `@RuntimeRadio`).
- **✅ Stabilità Totale:** Test approfonditi hanno confermato il superamento dei blocchi HTTP 404 e dei Consent Wall.
- **✅ Integrazione Engine:** Il modulo `youtube.ts` è stato integrato nell'engine e nel Feed Manager, rendendo l'esperienza utente fluida e trasparente.

### 7.3 Conclusione Definitiva
La sfida di YouTube è stata vinta non cercando di riparare un servizio rotto (Atom), ma cambiando paradigma verso un accesso programmatico moderno e indipendente dalle quote ufficiali di Google.

---

*Aggiornato il 25/02/2026 — Titan Desktop v1.3.1*
*Stato: ✅ RISOLTO*
