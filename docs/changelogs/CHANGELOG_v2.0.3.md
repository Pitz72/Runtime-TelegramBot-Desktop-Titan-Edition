# v2.0.3 — Mitigazione rate-limit antibot YouTube

**Data di rilascio:** 2026-05-18

## Overview

Da diversi giorni i feed YouTube tornano sistematicamente 0 video su tutti i canali monitorati. La diagnosi (log `titan-log-2026-05-18.txt`: 270 fetch / 0 video) e le issue upstream di `youtubei.js` indicano che si tratta di rate-limiting/antibot **lato server YouTube**, non di un bug della libreria.

Riferimenti upstream:
- [LuanRT/YouTube.js#1158](https://github.com/LuanRT/YouTube.js/issues/1158) — chiusa 2026-04-17. Pattern identico al nostro. Conclusione dell'autore: *"insufficient time between requests"*.
- [LuanRT/YouTube.js#1166](https://github.com/LuanRT/YouTube.js/issues/1166) — chiusa 2026-05-14 dal maintainer LuanRT: *"there is no way to fix it, as it's a server side thing"*.

Versione `youtubei.js` (`^17.0.1`, rilasciata 2026-03-16): già l'ultima disponibile su npm. Nessuna patch upstream in arrivo.

Questa release **non risolve** la causa server-side, ma rimuove due comportamenti del nostro codice che la stavano attivamente amplificando.

## Bug mitigati

### 1. Reset Innertube su 0 risultati → amplifica il blocco

**Causa:** `fetchYouTubeVideos()` chiamava `resetYouTubeSession()` ogni volta che `videoList.length === 0`, distruggendo l'istanza Innertube. Il canale successivo creava una nuova istanza, che YouTube trattava comunque come bloccata (issue #1158 conferma: una volta che il client è marcato, le nuove istanze nascono già limitate). Risultato osservato nel log: 270 cicli `Innertube.create()` → `0 video` → reset, in catena.

**Fix — `src/main/bot/youtube.ts`:**
Su `videoList.length === 0` la sessione viene **mantenuta viva**. Il warning resta nel log, ma il prossimo poll riprova con la stessa istanza, riducendo drasticamente il numero di handshake verso Innertube.

### 2. Burst ravvicinati di fetch YouTube → trigger antibot

**Causa:** lo scheduler usava una pausa inter-feed fissa di 1 s (introdotta in fix #17 per evitare burst RSS). Per i feed YouTube questa finestra è troppo stretta: i log mostrano 10 canali YT consecutivi in ~19 s, esattamente il pattern che YouTube penalizza.

**Fix — `src/main/bot/engine.ts`:**
La pausa inter-feed diventa **5 s** quando il feed corrente *o* quello successivo è di tipo `youtube`. I feed RSS continuano a usare 1 s. La logica salta comunque la pausa sull'ultimo feed del ciclo.

## Cosa NON cambia (per ora)

- Resta `youtubei.js ^17.0.1` (ultima disponibile).
- Resta il fallback `yt.search(targetId, { type: 'channel' })` quando `getChannel` diretto fallisce — è l'endpoint protagonista delle issue upstream, ma rimuoverlo richiede caching persistente `handle → ChannelID UC...` in DB. Pianificato per **v2.1.0**.

## File modificati

- `src/main/bot/youtube.ts` — rimosso `resetYouTubeSession()` su 0 risultati (lasciato solo nel catch finale per errori reali).
- `src/main/bot/engine.ts` — pausa inter-feed dinamica: 5 s se coinvolge YouTube, 1 s altrimenti.
- `package.json` — bump 2.0.2 → 2.0.3.
- `README.md` — badge versione.
- `CHANGELOG.md` — entry v2.0.3.

## Riferimenti

- Relazione architetturale YouTube: [docs/relazione-youtube.md](../relazione-youtube.md) (motivazioni della scelta Innertube vs Atom/API v3).
- Log diagnostico: `titan-log-2026-05-18.txt`.
