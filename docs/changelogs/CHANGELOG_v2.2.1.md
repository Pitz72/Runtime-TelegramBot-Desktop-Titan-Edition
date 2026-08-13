# v2.2.1 — Nel diario finivano errori che non erano errori

**Data di rilascio:** 2026-08-13

## Overview

Correzione singola. Il diario di scansione introdotto con la v2.2.0 marcava come **errore** alcune righe che non lo erano: bastava che il titolo di un video contenesse la parola «error» o «errori». Chi ha canali con titoli del genere vedeva comparire voci rosse a ogni giro di scansione, senza che nulla fosse andato storto.

Nessun cambiamento al motore, ai feed, al database o alla pubblicazione. Chi aggiorna non deve rifare nulla.

## La correzione

- **Il livello di una riga non si deduce più dalle parole del messaggio.** La funzione che assegna il livello cercava «Error», «error» e «Fallito» dentro tutto il testo — e diverse righe di diagnostica contengono il *titolo del contenuto*, che arriva dal feed. Due video di un canale reale, «97. Checked Errors» e «91. Digital transformation by trial and error», diventavano così due errori a ogni scansione. Ora contano solo i marcatori che il programma antepone da sé (❌, ⚠️, ✅) e mai il testo intorno.

- **Le righe di guasto che non hanno un marcatore ora dichiarano il proprio livello.** Sei segnalazioni del lettore YouTube — errore di scaricamento, nessun video restituito, data non interpretabile, identificativo fuori standard — avvisavano soltanto a parole. Togliendo la ricerca sulle parole sarebbero scivolate fra le righe informative e sarebbero sparite dal diario: cioè il difetto opposto, più grave. Ora ognuna dichiara se è un errore o un avviso, come già facevano gli eventi di scansione.

## Misura

Su una giornata di log reale, 2.657 righe: **da 11 righe marcate come errore a 1**. L'unico errore vero — un feed che non risponde entro trenta secondi — resta segnalato in rosso.

## Nota tecnica

`TitanLogger.log()` accetta ora come secondo argomento **o** un evento di scansione **o** un livello dichiarato, distinti per forma. Le chiamate esistenti continuano a funzionare invariate. È la stessa direzione presa dalla v2.2.0 con gli eventi del motore: dichiarare invece di dedurre — qui estesa alle righe che un evento non ce l'hanno.
