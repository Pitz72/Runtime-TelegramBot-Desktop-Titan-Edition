## Capitolo 2: Installazione e Primo Avvio

### 2.1 Requisiti di sistema
Titan Edition è leggero e funziona su Windows e Linux:

-   **Windows:** Windows 10 o superiore (64-bit).
-   **Linux:** Ubuntu 22.04+, Debian e derivate tramite pacchetto `.deb`; sulle altre distribuzioni usa il formato `.AppImage`, autosufficiente e senza installazione.

*Nota Linux:* su alcune versioni recenti di Ubuntu l'`.AppImage` ha bisogno del pacchetto `libfuse2`; se non parte, installalo (`sudo apt install libfuse2`) oppure usa il `.deb`.

*Nota per i server VPS:* Titan può girare anche su un Virtual Private Server privo di scheda video dedicata. Se all'avvio la grafica non compare, un meccanismo di sicurezza la forza dopo una decina di secondi (ne parliamo nel Capitolo 9).

### 2.2 Installazione
L'installazione è semplice.

1. Scarica il file fornito dal tuo amministratore o dalla pagina delle release ufficiale.
2. **Su Windows:** avvia il file `.exe` e segui le istruzioni a schermo. Il programma crea da solo un collegamento sul desktop.
3. **Su Linux:** con il pacchetto `.deb` fai doppio clic e lascia fare al gestore pacchetti; con l'`.AppImage` rendi il file eseguibile (clic destro → Proprietà → Permessi → Consenti l'esecuzione) e avvialo con un doppio clic.

A installazione fatta non dovrai più scaricare nulla a mano: Titan controlla da solo se esiste una versione più recente, la scarica in background e ti propone un pulsante per installarla al riavvio.

### 2.3 Il Setup Wizard (primo avvio)
Al primissimo avvio, dopo la sequenza animata di boot e la scelta della lingua, Titan ti accoglie con una procedura guidata (Setup Wizard) in quattro passaggi, per configurare subito la tua prima automazione.

1.  **Nome Bot:** un nome descrittivo che ti aiuti a riconoscere il profilo dentro l'interfaccia (es. «Bot Notizie Sportive»). Non sarà visibile ai tuoi utenti su Telegram.
2.  **Token Bot:** incolla qui il Token segreto generato da `@BotFather`. *(Come ottenerlo è spiegato nel Capitolo 4.2.)*
3.  **ID Canale (Channel ID):** il nome utente pubblico del canale preceduto dalla chiocciola (es. `@ilmiocanale`). Se il canale è privato, inserisci il suo identificativo numerico, che di solito comincia con il segno meno (es. `-100123456789`).
4.  **Data di Partenza (Start Date):** un parametro importante. Di default è la data di oggi: Titan leggerà comunque i tuoi feed, ma **ignorerà e scarterà** ogni notizia o video pubblicato prima di questa data. Serve a evitare che, al primo avvio, il bot inondi il canale di notizie vecchie di settimane.

Completati i quattro passaggi, clicca su **Lancia Titan**: ti ritroverai nella plancia di comando principale.

---
