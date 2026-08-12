## Capitolo 9: Troubleshooting (Risoluzione Problemi)

Qui trovi i problemi più comuni e come uscirne, nel formato problema e soluzione.

**La finestra è bianca all'avvio.**
Capita di rado, e quasi solo su macchine virtuali o computer senza scheda grafica aggiornata. Aspetta una decina di secondi: Titan ha un paracadute che, se l'interfaccia non compare da sola, la forza comunque. Se resta bianca, reinstalla l'applicazione sopra quella vecchia: non perdi alcun dato, perché il database è conservato in una cartella di sistema separata dal programma (il percorso esatto è nel Capitolo 7).

**Ho aggiunto un feed YouTube e nei log leggo «Cannot read properties…».**
Il collegamento tra Titan e YouTube (*InnerTube*) non è ufficiale: legge le pagine come farebbe un browser. Ogni tanto Google cambia il codice delle sue pagine e manda in tilt questa lettura. Nel log compare l'errore e la dashboard te lo segnala con una notifica. Nel frattempo disattiva il canale YouTube incriminato e aspetta un aggiornamento: Titan si aggiorna da solo (Capitolo 2) e di solito il problema si risolve alla radice. Le tue News e i tuoi Podcast, intanto, continuano a funzionare senza problemi.

**Il bot segnala «Bad Request: chat not found».**
Il Channel ID è sbagliato, oppure, più spesso, hai dimenticato di aggiungere il bot tra gli **Amministratori** del canale. Rimedia: aprilo nelle impostazioni del canale Telegram, aggiungi il bot come amministratore e dagli il permesso di inviare messaggi. L'errore sparisce (vedi anche il Capitolo 4).

**Faccio doppio clic sull'icona e non si apre una seconda finestra: torna in primo piano quella che c'era già.**
È voluto. Titan ammette una sola istanza per volta: se il programma è già in esecuzione, il secondo avvio non apre nulla e si limita a riportare davanti la finestra esistente, ripristinandola se era ridotta a icona. La ragione è concreta: due istanze aprirebbero lo stesso database e farebbero girare due motori indipendenti sugli stessi feed, con il risultato di pubblicare due volte lo stesso contenuto sul canale.

**Il bot pubblica le notizie ma l'immagine appare come un quadratino piccolo invece che come anteprima grande.**
È il comportamento normale di Telegram quando la fonte RSS non contiene un'immagine grande, ma solo una miniatura. Titan cerca l'immagine alla risoluzione più alta che riesce a trovare, arrivando a scavare nel testo dell'articolo, ma se la sorgente non ne ha una adeguata, Telegram ripiega sulla miniatura. Per correggerlo bisogna intervenire sul sito che pubblica il feed, non sul bot.

---
