## Capitolo 5: Il Feed Manager (Le Sorgenti)

### 5.1 Aggiungere e testare una sorgente
Il Feed Manager (il pannello sotto la lista dei bot) è la «dieta» del tuo bot: qui inserisci gli indirizzi web (URL) da cui Titan andrà a pescare i contenuti.

Per aggiungere una sorgente:

1. Seleziona il bot a cui vuoi assegnarla.
2. Clicca su **Aggiungi**.
3. Dai un **Nome** alla fonte: è il testo che potrai stampare in cima ai messaggi come firma della notizia (è il campo `{{feedName}}` dei template, Capitolo 6).
4. Scegli il **Tipo**:
    -   **Podcast:** per i flussi audio (MP3). Titan prova a recuperare l'immagine di copertina, spesso nascosta nei tag *iTunes* usati da servizi come Spreaker o AzuraCast.
    -   **News:** per i classici articoli di blog, siti di informazione o giornali.
5. Incolla l'URL del feed (di solito un indirizzo che termina in `.xml` o `.rss`).

Prima di salvare puoi usare il pulsante **Testa (⚡)**: fa una chiamata reale al link e ti dice subito se risponde. Se il feed è valido, un avviso verde riporta quante notizie ha trovato; se qualcosa non va (sito offline, link errato), l'avviso è rosso. Il test è solo una verifica: non ti obbliga a nulla, puoi salvare comunque, ma è il modo più rapido per non inserire un indirizzo sbagliato.

![Il modulo di inserimento di una nuova sorgente, con nome, tipo, URL e il pulsante di test.](screenshots/06-feed-form.png)

Ogni sorgente nella lista ha un interruttore per attivarla o metterla in pausa senza cancellarla, e le icone per modificarla o eliminarla.

![La lista delle sorgenti: tipo, badge dei filtri attivi e interruttore per ciascun feed.](screenshots/13-feed-list.png)

Se una sorgente smette di rispondere (per esempio un errore 404), te ne accorgi: nei System Logs compare una riga rossa con il nome del feed. E se ti stai chiedendo quante sorgenti puoi aggiungere, non c'è un tetto fisso: tieni però presente che il motore le controlla a rotazione, quindi con molte decine di feed (o molti bot) il giro completo di controllo si allunga.

### 5.2 La gestione nativa di YouTube
Di solito integrare YouTube in un sistema di automazione è una scocciatura: richiede un account sviluppatore su Google Cloud e una chiave API, con relativi costi e limiti. Titan salta tutto questo grazie a *InnerTube*, un motore che legge le pagine di YouTube come farebbe un browser, senza nessuna chiave.

1.  Nel modulo **Aggiungi** scegli il tipo **YouTube (Video)**.
2.  Nel campo URL non servono codici strani né feed XML: incolla l'handle del canale (la chiocciola sotto il nome dello YouTuber, per esempio `@RuntimeRadio`) oppure l'indirizzo completo del canale copiato dal browser.

Al resto pensa Titan. C'è però un accorgimento utile: il **filtro anti-premiere**. Quando uno YouTuber programma una diretta o un video «in uscita tra due giorni», YouTube lo mostra comunque in cima alla lista. Un bot ingenuo manderebbe subito la notifica, e chi clicca finisce su un video non ancora disponibile. Titan invece controlla lo stato del video: se è segnato come *upcoming* o *premiere*, lo scarta e lo pubblica solo quando diventa davvero visibile.

### 5.3 Opzioni avanzate del feed
Quando aggiungi o modifichi una sorgente, sotto ai campi principali trovi tre regolazioni facoltative. Puoi ignorarle (con i valori predefiniti il feed funziona) oppure usarle per un controllo più fine.

-   **Filtro per parole chiave.** Due campi, «includi» ed «escludi», con le parole separate da virgola. Se riempi «includi», Titan pubblica solo i contenuti in cui compare almeno una di quelle parole, nel titolo o nel testo; se riempi «escludi», scarta quelli che ne contengono anche una sola. Un badge ambra sulla sorgente segnala che il filtro è attivo.
-   **Intervallo personalizzato.** Di norma ogni feed segue il ritmo di controllo del bot. Qui puoi darne uno tutto suo, da 5 minuti a 24 ore: comodo per controllare più spesso un sito molto attivo, o più di rado uno lento. Un badge indica l'intervallo impostato.
-   **Digest.** Invece di pubblicare ogni contenuto appena esce, Titan può accumularli e mandarli insieme in un unico messaggio riepilogativo, a cadenza fissa (1 ora, 6, 12, 24 ore o 7 giorni). Il riepilogo elenca i titoli con il link «Leggi», fino a 20 contenuti per messaggio. Utile per le fonti prolisse, che altrimenti inonderebbero il canale. Un badge viola segnala il digest attivo.

### 5.4 Importare più feed insieme (OPML)
Se hai già una lista di feed in un lettore RSS, non devi reinserirli a mano. Il pulsante **OPML**, in alto nel Feed Manager, importa in blocco tutte le sorgenti contenute in un file `.opml` standard, il formato con cui i lettori RSS esportano le loro liste. Al termine Titan ti dice quanti feed ha aggiunto.

---
