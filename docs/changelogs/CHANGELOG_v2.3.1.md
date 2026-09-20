# v2.3.1 — Un podcast che non cambia mai indirizzo non è un podcast fermo

**Data di rilascio:** 2026-09-20

## Overview

Correzione singola, al cuore della deduplica. Alcuni generatori RSS scrivono in ogni `<item>` il link della **pagina dello show** invece di quello dell'episodio: tutte le puntate arrivano con lo stesso indirizzo. Titan ricavava l'identificativo di un contenuto dal solo link, quindi dopo la prima pubblicazione ogni puntata successiva di quello show veniva riconosciuta come «già inviata» e scartata in silenzio — nei log una riga `already processed`, sul canale niente.

Non è un caso di laboratorio: è capitato in produzione a due show, uno fermo da una settimana e uno da cinque giorni, senza che nulla segnalasse un guasto.

## La correzione

- **L'identificativo si ricava dal `<guid>` quando il `<link>` non distingue le puntate.** Il `<guid>` è il campo che lo standard RSS destina proprio a questo, ed è univoco anche negli show che riusano un solo link. Per i feed Atom vale allo stesso modo l'`<id>`.

- **Solo dove il link è effettivamente duplicato dentro lo stesso feed.** È la parte che conta. Cambiare in blocco il modo di calcolare gli identificativi avrebbe reso inservibile tutto lo storico già scritto, e il primo giro di scansione avrebbe riversato in canale contenuti vecchi di mesi. Il conteggio dei link duplicati si fa feed per feed: dove ogni puntata ha già il suo indirizzo — cioè la quasi totalità — l'identificativo resta identico a prima e lo storico continua a valere.

- **La rete di sicurezza sul titolo resta il secondo controllo.** Per gli item che cambiano identificativo, il confronto sul titolo normalizzato impedisce comunque il reinvio di qualcosa che è già passato.

## Misura

Simulazione su tutti i feed RSS attivi di quattro canali reali, confrontando comportamento precedente e successivo contro lo storico di pubblicazione: **un solo contenuto in più**, la puntata che era rimasta bloccata. Nessun reinvio altrove.

## Nota tecnica

La disambiguazione vive in `fetchFeed()` (`src/main/bot/parser.ts`), dopo la costruzione della lista e prima dell'ordinamento: si contano i link, e agli item il cui link compare più di una volta si riassegna l'ID come MD5 del `<guid>`. `isProcessed()` e lo schema del database non cambiano. Il lettore YouTube segue un'altra strada e non è toccato.
