# v2.1.3 — Fix YouTube "0 video": supporto formato LockupView

**Data di rilascio:** 2026-06-11

## Overview

Risolto il blocco "Raw videos count: 0" su tutti i canali YouTube attivo da metà maggio 2026. La diagnosi precedente (antibot/rate-limit server-side, v2.0.3) era diventata obsoleta: la causa reale è un **cambio di formato della risposta YouTube**, non un blocco.

## La causa reale

Da maggio 2026 YouTube serve le liste video dei canali come nodi **`LockupView`** (`contentType: LOCKUP_CONTENT_TYPE_VIDEO`) invece dei classici nodi `Video`. `youtubei.js 17.0.1` — ultima release npm, 16/03/2026 — non include i `LockupView` nel getter `videosTab.videos`, che quindi restituisce sempre un array vuoto. I dati arrivano correttamente: è il parser che li scartava in silenzio.

Conferma upstream: issue [LuanRT/YouTube.js#1181](https://github.com/LuanRT/YouTube.js/issues/1181) ("No videos returned for channels", 21/05/2026). Il maintainer conferma che il fix è nella PR [#1163](https://github.com/LuanRT/YouTube.js/pull/1163) (mergiata il 05/05/2026), **non ancora rilasciata su npm**.

## Il fix

Fallback autocontenuto in `src/main/bot/youtube.ts` — nessuna modifica alla dipendenza:

- Se `videosTab.videos` è vuoto, `extractLockupVideos()` estrae i nodi `LockupView` dal memo del feed (`videosTab.memo.get('LockupView')`).
- Filtra `content_type` `VIDEO`/`MOVIE`/`SHORT` e valida l'ID video (11 caratteri) — stessa logica del fix upstream.
- Adatta ogni lockup alla forma `Video` attesa dal loop di parsing esistente: titolo, testo data (dalle metadata rows, es. "2 giorni fa"), thumbnail, ID deterministico. Tutte le protezioni esistenti (anti-premiere, fallback data anno 2000, triple-lock cutoff in engine) restano attive invariate.
- Quando uscirà `youtubei.js` 17.1.0 con il fix ufficiale, il fallback smetterà semplicemente di attivarsi (si attiva solo su 0 risultati).

## Verifica

Test reale su canale `@RuntimeRadio` (script diagnostico `scripts/test-youtube-lockup.mjs`):

- Parser nativo 17.0.1: **0 video**
- Nodi `LockupView` nel memo: **30**
- Estratti dal fallback: **30**, con ID validi, titoli e date parsabili ("1 month ago")

## Note

- La mitigazione footprint v2.0.3/v2.1.1 (sessione Innertube persistente, backoff 5s, reset solo dopo 5 errori consecutivi) resta in vigore: riduce comunque il rischio di rate-limit reale.
- `getChannel()` diretto sugli `@handle` continua a fallire con HTTP 400 (fallback `yt.search()` funzionante). La cache persistente `@handle → UC...` resta pianificata per v2.2.0.

## File modificati

- `src/main/bot/youtube.ts` — helper `extractLockupVideos()` + fallback su 0 risultati.
- `scripts/test-youtube-lockup.mjs` — nuovo script diagnostico standalone.
- `package.json`, `CHANGELOG.md`, `docs/STATO-PROGETTO.md`.
