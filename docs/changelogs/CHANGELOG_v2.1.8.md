# v2.1.8 — Apertura del sorgente: licenza MIT, sicurezza, due lingue

**Data di rilascio:** 2026-08-13

## Overview

È la prima release da progetto aperto. Titan smette di essere un prodotto a pagamento e diventa software libero sotto licenza **MIT**: il codice sorgente è pubblico su [github.com/Pitz72/Runtime-TelegramBot-Desktop-Titan-Edition](https://github.com/Pitz72/Runtime-TelegramBot-Desktop-Titan-Edition), chiunque può leggerlo, modificarlo e ridistribuirlo.

Sotto il cambio di licenza c'è del lavoro vero, non solo un file `LICENSE` sostituito: un audit di sicurezza con cinque correzioni, il ritiro di sei lingue, e la riscrittura di manuali e guide.

## Sicurezza

- **I token dei bot vengono redatti dai log** — dal file, dalla console dell'applicazione e dai log esportati. Prima, allegare un log a una segnalazione di bug significava consegnare il token del proprio bot a chiunque lo leggesse.
- **Istanza singola.** Avviare l'applicazione due volte non apre più due motori sullo stesso database. Era una causa concreta di pubblicazioni doppie sul canale.
- **URL dei feed blindati negli `href`.** I caratteri che potrebbero chiudere l'attributo vengono percent-encodati: un feed non può più iniettare HTML nel messaggio pubblicato, né far annunciare un link e aprirne un altro.
- **Validazione anti-SSRF estesa** — IPv6 privati e link-local, IPv4 in forma decimale ed esadecimale, IPv4-mapped IPv6, intervallo CGNAT, domini `.local` e `.internal`. Aggiunta la risoluzione DNS prima del fetch, che blocca i domini pubblici puntati a indirizzi di rete privata.
- **Filtro di schema sui link esterni.** Il renderer apre nel browser di sistema solo `http` e `https`.

## Correzioni

- Il salvataggio delle impostazioni di un bot non fallisce più in silenzio: l'errore viene mostrato. Capitava quando il token non era decifrabile sulla macchina corrente.
- Il messaggio di avvio inviato su Telegram usa il nome corretto del prodotto.
- Completate le stringhe dell'interfaccia di aggiornamento che mancavano in cinque lingue su otto. Quelle lingue sono poi state ritirate (vedi sotto), ma la correzione resta nella storia del progetto.

## Il campo della data si chiama «Data di Partenza» ovunque

L'applicazione chiamava lo stesso campo in due modi: **«Data di Partenza»** nella procedura guidata e **«Data di Filtro (Cutoff)»** nelle impostazioni del bot. Era la stessa impostazione, con due nomi diversi a due schermate di distanza, e il manuale ne documentava uno solo.

Ora è **«Data di Partenza»** in tutte e due, in italiano e in inglese (`Start From Date`), e i capitoli 3, 4 e 6 del manuale sono allineati. Nessun comportamento cambia: cambia solo l'etichetta.

## Lingue: da otto a due

Titan parla ora **italiano e inglese**. Francese, tedesco, spagnolo, portoghese, russo e cinese sono usciti da interfaccia, guida in-app, guida rapida, file «leggimi» e manuale PDF.

Il motivo è la manutenzione. Sei lingue che nessuno nel progetto sa rileggere sono sei modi di pubblicare testo sbagliato senza accorgersene. Meglio due lingue verificate che otto di cui sei sulla fiducia.

- Chi aveva selezionato una delle sei lingue ritirate trova l'interfaccia **in inglese** al primo avvio, non in italiano, e la preferenza viene riscritta.
- La schermata iniziale mostra due bandiere invece di otto.

## Documentazione

- **Manuale Utente Avanzato** rivisto capitolo per capitolo in italiano e in inglese, con i dati verificati contro il codice. Corretto un errore di contenuto che stava nell'edizione inglese da un mese: l'esportazione globale produce un file `.rtb`, non JSON.
- **I due «leggimi» del pacchetto riscritti da zero.** Erano ancora quelli commerciali, aprivano con «Grazie per aver acquistato». Il vecchio testo dichiarava anche l'installer «SICURO al 100% e privo di malware»: un'affermazione che nessuno può garantire. Ora la nota su SmartScreen spiega che l'avviso riguarda il *certificato di firma*, non il contenuto, e indica la verifica vera — il sorgente è pubblico e compilabile.
- **Guide rapide e guide in-app**: corretti quattro errori di fatto, fra cui l'icona indicata per aprire le impostazioni del bot (è quella a cursori, non l'ingranaggio) e l'affermazione che il token dei bot sopravviva al trasferimento su un altro PC. Non sopravvive.
- Il colophon dei manuali PDF riportava l'EULA — «Tutti i diritti riservati», riproduzione vietata. Ora riporta la licenza MIT.

## Distribuzione

Le release escono **su questa stessa repository**. Fino alla 2.1.7 uscivano su una repository ponte separata, che serviva solo perché il sorgente era privato e l'auto-updater aveva bisogno di un posto pubblico da cui scaricare.

L'aggiornamento automatico funziona su **Windows** e sull'**AppImage**. Il pacchetto `.deb` non si auto-aggiorna: è un limite di `electron-updater`, non una dimenticanza.

## Progetto

- `LICENSE` **MIT** al posto dell'EULA proprietaria, archiviata in `docs/storico/`.
- Aggiunti `CONTRIBUTING.md`, `SECURITY.md`, i template delle issue e un controllo di parità delle traduzioni (`scripts/check-locales.mjs`), eseguito in CI su ogni pull request insieme a type check e build.
- `docs/` riorganizzata: il materiale concluso in `docs/storico/`, nuovo indice, nuova documentazione di database e di build.
- Credito al modello linguistico e paternità del progetto dichiarati nell'applicazione e nella documentazione.
- Rimossi i residui di configurazione macOS. Non esiste un installer ufficiale per macOS e non è previsto: chi lo usa compila dal sorgente.
