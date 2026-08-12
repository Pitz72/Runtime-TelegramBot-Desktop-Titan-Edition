## Capitolo 2: Installazione e Primo Avvio

### 2.1 Requisiti di sistema
Titan Edition è leggero e funziona su Windows e Linux:

-   **Windows:** Windows 10 o superiore (64-bit).
-   **Linux:** Ubuntu 22.04+, Debian e derivate tramite pacchetto `.deb`; sulle altre distribuzioni usa il formato `.AppImage`, autosufficiente e senza installazione.

*Nota Linux:* su alcune versioni recenti di Ubuntu l'`.AppImage` ha bisogno del pacchetto `libfuse2`; se non parte, installalo (`sudo apt install libfuse2`) oppure usa il `.deb`.

*Nota per i server VPS:* Titan può girare anche su un Virtual Private Server privo di scheda video dedicata. Se all'avvio la grafica non compare, un meccanismo di sicurezza la forza dopo una decina di secondi (ne parliamo nel Capitolo 9).

### 2.2 Installazione
L'installazione è semplice.

1. Scarica l'installer dalla pagina delle release del progetto. In alternativa puoi compilarlo tu dal codice sorgente.
2. **Su Windows:** avvia il file `.exe` e segui le istruzioni a schermo. Il programma crea da solo un collegamento sul desktop.
3. **Su Linux:** con il pacchetto `.deb` fai doppio clic e lascia fare al gestore pacchetti; con l'`.AppImage` rendi il file eseguibile (clic destro → Proprietà → Permessi → Consenti l'esecuzione) e avvialo con un doppio clic.

A installazione fatta non dovrai più scaricare nulla a mano: Titan controlla da solo se esiste una versione più recente e, quando la trova, te lo segnala con una schermata dedicata che ti chiede se scaricarla e, a download concluso, se riavviare per installarla.

![L'avviso di aggiornamento disponibile: Titan chiede conferma prima di scaricare e prima di riavviare.](screenshots/11-update-available.png)

### 2.3 Il Setup Wizard (primo avvio)
Al primissimo avvio, dopo la sequenza animata di boot e la scelta della lingua, Titan ti accoglie con una procedura guidata (Setup Wizard) in quattro passaggi, per configurare subito la tua prima automazione.

![Il Setup Wizard guida la configurazione del primo bot in quattro passaggi.](screenshots/02-setup-wizard.png)

1.  **Nome Bot:** un nome descrittivo che ti aiuti a riconoscere il profilo dentro l'interfaccia (es. «Bot Notizie Sportive»). Non sarà visibile ai tuoi utenti su Telegram.
2.  **Token Bot:** incolla qui il Token segreto generato da `@BotFather`. *(Come ottenerlo è spiegato nel Capitolo 4.2.)*
3.  **ID Canale (Channel ID):** il nome utente pubblico del canale preceduto dalla chiocciola (es. `@ilmiocanale`). Se il canale è privato, inserisci il suo identificativo numerico, che di solito comincia con il segno meno (es. `-100123456789`).
4.  **Data di Partenza (Start Date):** un parametro importante. Di default è la data di oggi: Titan leggerà comunque i tuoi feed, ma **ignorerà e scarterà** ogni notizia o video pubblicato prima di questa data. Serve a evitare che, al primo avvio, il bot inondi il canale di notizie vecchie di settimane.

Completati i quattro passaggi, clicca su **Lancia Titan**: ti ritroverai nella plancia di comando principale.

### 2.4 La schermata di benvenuto: lingua, guida e manuale
La schermata con le otto bandiere non è solo del primo avvio: torna a ogni accensione, e da lì scegli la lingua dell'interfaccia, che cambia all'istante. Il tasto **Lancia Titan** ti porta dentro.

Sotto quel tasto ci sono tre scorciatoie:

-   **Guida Rapida** apre a schermo un riassunto di poche pagine, nella lingua scelta: come ottenere il token da @BotFather, i quattro passaggi del wizard, come aggiungere una sorgente, come personalizzare i messaggi e come accendere il motore. È pensata per chi vuole partire subito, senza leggere questo manuale.
-   **Scarica Manuale (PDF)** apre nel browser di sistema il manuale completo — quello che stai leggendo — nella tua lingua. Il file non è dentro l'applicazione: viene prelevato dalla rete al momento, quindi serve una connessione attiva.
-   **Sostieni il progetto** apre la pagina per una donazione libera. Titan è gratuito e a sorgente aperto: la donazione è facoltativa e non sblocca nulla.

Le due voci di documentazione le ritrovi anche nelle Impostazioni di Sistema, alla scheda **Generale** (Capitolo 8.2).

### 2.5 Dopo un aggiornamento: la schermata «Novità»
Quando Titan si è aggiornato, al primo avvio della nuova versione compare una schermata a tutto campo che elenca che cosa è cambiato: correzioni, funzioni nuove, comportamenti modificati. Il numero di versione è in evidenza, l'elenco è nella tua lingua, e il tasto **Continua** la chiude.

Compare una volta sola per versione: chiusa quella, non la rivedi finché non arriva l'aggiornamento successivo. Se una versione non porta un elenco proprio, al suo posto trovi una riga generica che segnala correzioni e miglioramenti di stabilità.

---
