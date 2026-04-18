# Changelog — v1.10.4

**Data:** 18 Aprile 2026
**Tipo:** Bugfix — YouTube ID instabile + CI cleanup

---

## Fix: video ID YouTube non deterministico (regressione intermittente)

### Causa radice

Quando YouTube restituisce un errore HTTP 500 su un feed, `resetYouTubeSession()` azzera la sessione Innertube. Il feed successivo crea una nuova istanza. Se il canale non è risolvibile direttamente per handle (`getChannel()` fallisce), si attiva il **fallback via search**: il canale viene trovato tramite `yt.search()` → `yt.getChannel(searchResult.id)`. In questo percorso, gli oggetti video in `videosTab.videos` restituiscono `v.id` in un formato non standard (renderer ID invece del puro video ID a 11 caratteri). Il MD5 calcolato sull'URL diverge da quello già in `history` → `isProcessed()` non trova il match → i video vengono rispediti come nuovi.

**Perché intermittente:** accade solo quando YouTube risponde con 500 (evento non deterministico), non ad ogni ciclo.

**Perché apparentemente solo su un bot:** il primo bot che fetcha il canale colpisce il bug (cache MISS, nuova sessione). Il secondo bot usa la cache (stessi item, stesso problema latente), ma spesso l'utente stoppa il bot prima che la coda venga smaltita.

### Fix (youtube.ts)

L'ID viene ora estratto dal **thumbnail URL** (`/vi/{VIDEO_ID}/hqdefault.jpg`), sempre nella forma canonica a 11 caratteri indipendentemente dal percorso di risoluzione del canale:

```typescript
const thumbMatch = thumbUrl.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
if (thumbMatch) videoId = thumbMatch[1];
else if (v.video_id && /^[a-zA-Z0-9_-]{11}$/.test(v.video_id)) videoId = v.video_id;
else if (v.id && /^[a-zA-Z0-9_-]{11}$/.test(v.id)) videoId = v.id;
```

Fallback grezzo solo se nessuno dei tre produce un ID valido (con log di warning).

### Bonus diagnostico

- Log per ogni item: `[YouTube] Item: "titolo" | dateText: "2 anni fa" | date: 2024-04-18`
- Warning se la data non è parsabile: `WARN: data non parsabile → fallback 2000`
- Contatore `alreadyProcessedCount` nei log del feed: `No updates for X (N already processed)`

---

## CI: rimosso build-release.yml obsoleto

Eliminato `.github/workflows/build-release.yml` — file residuo del periodo precedente con Node 18, build command manuale, nessun publish alla bridge repo, release bloccata da tag push. Rimane solo `build.yml` (Node 20, Linux-only, publish su `runtime-telegrambot-releases`).

---

*Per la lista completa delle versioni consulta [CHANGELOG.md](../../CHANGELOG.md).*
