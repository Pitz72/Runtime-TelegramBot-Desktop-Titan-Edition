# v2.3.0 — Una lente di ricerca per ogni canale

**Data di rilascio:** 2026-09-08

## Overview

Il pannello **Sorgenti Feed** guadagna un campo di ricerca. Serve a chi ha canali affollati: passata una certa quantità di feed, l'elenco si scorre e basta, e ritrovare una sorgente per modificarla o spegnerla diventa un lavoro di pazienza.

La ricerca è locale al canale selezionato — è il canale, non il programma, ad avere troppa roba dentro — e nessun feed viene toccato: si filtra ciò che è a schermo, il resto resta esattamente dov'era. Chi aggiorna non deve rifare nulla.

## La ricerca

- **Il campo compare sotto l'intestazione del pannello**, e solo se il canale ha almeno una sorgente: su un canale vuoto sarebbe una casella da riempire senza niente da cercare.

- **Si cerca su nome, indirizzo, tipo e parole del filtro.** Non solo sul nome: un feed lo si ricorda spesso per il dominio da cui arriva, o per la parola chiave con cui lo si era filtrato, e limitare la ricerca al nome avrebbe lasciato fuori proprio i casi in cui serve. Scrivendo `youtube` escono tutte le sorgenti di quel tipo, scrivendo un pezzo di dominio escono quelle che vengono da lì.

- **Più parole valgono come una condizione sola.** `tech news` mostra le sorgenti che contengono entrambi i termini, non quelle che ne contengono almeno uno: su un elenco lungo la seconda parola serve a restringere, e un'unione avrebbe allargato il risultato invece di stringerlo.

- **Il contatore accanto al campo dice quanti feed su quanti.** Un elenco filtrato e un canale con poche sorgenti hanno lo stesso aspetto: senza il conto non si distingue una ricerca troppo stretta da un canale quasi vuoto.

- **Si azzera con la ✕ o con `Esc`**, e cambiando canale la ricerca si azzera da sé: la lente appartiene al canale che si sta guardando, e trascinarne il testo sul canale successivo avrebbe mostrato un elenco misteriosamente corto.

- **Quando nessuna sorgente corrisponde, il pannello lo dice** con un messaggio suo, distinto da quello del canale senza feed, e offre il ritorno all'elenco completo. Sono due situazioni diverse e portano a due gesti diversi: aggiungere una sorgente, o correggere la ricerca.

- **Il modulo di aggiunta e modifica resta fuori dal filtro.** Sta sopra l'elenco e non si chiude mentre si cerca: si può cercare un feed mentre se ne sta compilando un altro.

## Nota tecnica

Il filtro vive nel componente e lavora sull'elenco già caricato in memoria: nessuna interrogazione nuova al database, nessuna chiamata IPC, nessuna modifica allo schema. Le voci del testo sono in italiano e in inglese come tutto il resto dell'interfaccia.
