# v2.2.0 — Il pannello dei log diventa un diario

**Data di rilascio:** 2026-08-13

## Overview

Il pannello in fondo alla Dashboard smette di essere uno scorrimento di righe tecniche e diventa un **diario di scansione**: racconta cosa sta facendo il programma, non cosa scrive il programma.

La console di prima non è sparita. Le due viste convivono dietro un interruttore nell'intestazione del pannello — *Diario* e *Console* — e il diario è quello predefinito. Nessun cambiamento al motore di pubblicazione, ai feed o al database: chi aggiorna non deve rifare nulla e non perde nulla.

## Diario di scansione

- **Il motore dichiara i suoi eventi invece di lasciarli indovinare.** Prima il livello di una riga si deduceva dal testo, emoji compresi. Ora il motore emette nove tipi di evento espliciti — inizio e fine scansione, sorgente in lettura, elemento trovato, pubblicazione riuscita o fallita, e così via — e il livello arriva da una tabella, non da un'ipotesi.
- **A schermo restano solo gli eventi che contano, più tutto ciò che è andato storto.** Su una scansione reale: 28 righe emesse, 16 nel diario. Le righe senza evento entrano comunque se sono errori o avvisi — 52 delle 62 chiamate al registro sono diagnostica sparsa, e filtrarle per assenza di evento avrebbe nascosto proprio quelle.
- **Una riga di attività nomina la sorgente in lettura e si riscrive sul posto.** Durante una scansione lunga il pannello non sembra più fermo: si vede quale feed sta leggendo in questo momento, senza che quella riga si accumuli nello storico.
- **Registro visivo coerente**, con le transizioni affidate a Framer Motion — libreria già presente, nessuna dipendenza nuova.

## Esportazione dei log

- **L'esportazione legge il file di log della giornata, non più l'array in memoria.** Prima portava con sé solo ciò che era stato prodotto a pannello aperto: chiudere e riaprire la finestra svuotava l'esportazione. Ora esce l'intera giornata, indipendentemente da cosa c'è a schermo.

## Leggibilità

- **L'indirizzo del canale, nella scelta del bot, torna leggibile.** Girava in Inter 12px invece che in Fira Code 9px maiuscoletto, e nel colore sbagliato: 2,6:1 di contrasto. Corpo e colore sono stati sistemati insieme — rimettere solo il corpo avrebbe riportato la riga a 9px lasciandola illeggibile, cioè peggio di prima.
- **La data subito sotto non è più invisibile.** Stava a 1,65:1. Fa parte dello stesso blocco di due righe: lasciarne una leggibile e l'altra no le avrebbe spezzate in due.
- **Il livello «riuscito» era dipinto in ciano.** Refuso, non scelta: ora è verde come gli altri livelli positivi.

## Nota tecnica

Diario e console leggono **lo stesso** flusso e **lo stesso** array in memoria: il diario non è un secondo archivio, è un secondo modo di disegnare quello che c'è già. `LogEntry` ha guadagnato un campo `event` facoltativo e `TitanLogger.log()` un secondo argomento, anch'esso facoltativo — le chiamate esistenti continuano a funzionare invariate.
