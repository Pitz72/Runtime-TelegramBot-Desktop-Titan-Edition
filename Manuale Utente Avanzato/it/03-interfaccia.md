## Capitolo 3: L'Interfaccia Utente (Dashboard)

### 3.1 Anatomia della console
Finito il Setup Wizard, e a ogni avvio successivo, ti accoglie la plancia di comando di Titan: un'interfaccia dall'aspetto vetrato, divisa a metà (il layout 50/50).

-   **Metà sinistra (configurazione).** Ospita il **Bot Selector** (la barra laterale da cui scorri e selezioni il profilo bot da visualizzare) e il **Feed Manager**, cioè la lista delle sorgenti associate al bot selezionato. È qui che dici al software cosa deve cercare.
-   **Metà destra (operatività).** La zona di esecuzione: il pulsante **Ignition** (il grande tasto Play centrale che accende e spegne il motore), i contatori degli invii e la console nera dei **System Logs**, che riga per riga mostra cosa sta facendo il bot in tempo reale.

In cima alla metà destra, una barra mostra il logo, il nome e la versione installata; sulla destra trovi l'indicatore **online/offline** (quando un bot è selezionato) e l'icona a ingranaggio che apre le Impostazioni di Sistema (Capitoli 7 e 8).

![La plancia di comando a motore acceso: bot a sinistra, sorgenti al centro, esecuzione e log a destra.](screenshots/03-dashboard-online.png)

*Suggerimento.* Una volta premuto Play non conta quale bot stai guardando: a motore acceso Titan lavora in background su **tutti** i bot attivi insieme. La selezione a sinistra serve solo a te, per consultare la configurazione di quel profilo.

### 3.2 Il pannello «System Logs»
La console dei log, in basso a destra, è lo specchio diretto del motore asincrono. Resta in inglese anche quando l'interfaccia è in un'altra lingua: così i messaggi restano uno standard tecnico universale, comodo quando devi chiedere assistenza.

![La console dei System Logs mostra in tempo reale, riga per riga, cosa sta facendo il motore.](screenshots/14-log-console.png)

I messaggi sono codificati a colori per una lettura rapida:

-   🟢 **Verde (`Sent` / `Found New Item`):** un nuovo elemento è stato trovato e inviato a Telegram.
-   🟡 **Giallo/arancione (`Skipped` / `FloodWait`):** il motore ha ignorato un elemento (per esempio perché precedente alla *Start Date*) oppure Telegram ha chiesto una pausa anti-spam, che il bot gestisce da solo.
-   🔴 **Rosso (`Error` / `Failed`):** un errore critico, come una connessione interrotta, un Token API errato o un cambiamento nei server di YouTube.
-   ⚪ **Grigio/bianco (`Fetching` / `No updates`):** normale amministrazione. Il bot sta leggendo la sorgente ma non ha trovato nulla di nuovo dall'ultimo controllo.

La barra in cima al pannello offre tre comandi:

-   **ALL BOTS / THIS BOT:** filtra il flusso mostrando tutti i bot oppure solo quello selezionato, comodo quando ne hai molti attivi insieme.
-   **Esporta:** salva l'intero tracciato in un file `.txt`, indispensabile se devi passarlo a un tecnico per un controllo.
-   **Pulisci:** svuota la vista dei log. Non tocca lo storico degli invii, solo ciò che vedi a schermo.

### 3.3 Capire le statistiche
Ai lati del pulsante di accensione l'interfaccia mostra tre numeri: **Oggi (Today)**, **7 giorni (Week)** e **Totale (Total)**. Si aggiornano da soli ogni 30 secondi mentre il motore gira e contano solo i **messaggi andati a buon fine** sul bot selezionato.

Accanto al Totale c'è un'icona a grafico: aprila per il pannello di dettaglio. Oltre agli stessi tre numeri, ti mostra la ripartizione **per singola sorgente**: quale feed ha prodotto quanti invii, dal più attivo in giù. Così vedi a colpo d'occhio quali fonti alimentano davvero il canale.

![Il pannello di dettaglio delle statistiche, con la ripartizione degli invii per singola sorgente.](screenshots/07-stats-modal.png)

*Nota.* Se usi il tasto **Azzera Cronologia** (Clear History) nelle impostazioni del bot, anche questi contatori tornano a zero: lo storico degli invii viene cancellato.

---
