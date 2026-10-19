# v2.4.1 — i canali YouTube si trovano al primo colpo

**Rilasciata:** 19 ottobre 2026.

## Il problema

Nel diario, a ogni giro e per ogni sorgente YouTube, comparivano avvisi come:

> [YouTube] Direct getChannel failed for "@NomeCanale", trying search...

Succedeva da tempo; dalla 2.2.1 si vedeva nel diario, perché da allora le righe di YouTube dichiarano il loro livello invece di farselo indovinare.

## La causa

Titan passava l'handle del canale («@NomeCanale») a `getChannel` di youtubei.js, che accetta **solo l'ID del canale** («UC…»). YouTube rispondeva **400** ogni volta, e Titan ripiegava su una ricerca per nome prendendo il **primo risultato**. I video arrivavano lo stesso, ma:

- ogni canale costava due richieste in più a ogni giro (la chiamata destinata a fallire e la ricerca), proprio il tipo di traffico che l'antibot di YouTube punisce rallentando le risposte;
- la ricerca poteva restituire per primo un canale omonimo;
- un indirizzo come `youtube.com/@canale/videos` diventava «videos».

Verificato su un canale pubblico: `getChannel('@YouTube')` → 400; la pagina del canale (`resolveURL`) → l'ID esatto.

## La correzione

- **L'handle si traduce dalla pagina del canale** (`resolveURL`), che risponde con l'ID esatto, e l'ID **resta in memoria** per la sessione: dal secondo giro Titan va dritto al canale.
- **Gli indirizzi si leggono per quello che sono** (`youtubeChannelRef` in `rules.ts`): ID «UC…», `/channel/UC…`, `@handle` anche con `/videos` o parametri, i vecchi `/c/` e `/user/`, e un handle scritto senza chiocciola.
- **La ricerca resta l'ultima risorsa** e sceglie il canale con lo stesso handle o lo stesso nome (`pickYouTubeChannel`). Se nessuno corrisponde usa il primo, ma lo dice nel diario e suggerisce di scrivere l'indirizzo completo.
- Nessun cambiamento allo storico, alla deduplica o ai contenuti già pubblicati: cambia solo il modo di trovare il canale.

## Verifica

- 8 test nuovi (71 in tutto) sulle forme degli indirizzi e sulla scelta del risultato.
- Prova dal vivo su canali pubblici, in Electron con un profilo dati separato: `@YouTube`, `youtube.com/@YouTube/videos`, `YouTube`, `youtube.com/channel/UC…` e il nome «YouTube Creators» trovano tutti il canale giusto, senza nessun avviso nel diario.
