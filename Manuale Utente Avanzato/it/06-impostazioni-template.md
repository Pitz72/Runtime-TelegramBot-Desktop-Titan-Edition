## Capitolo 6: Impostazioni Avanzate e Template

Le impostazioni di ogni bot si aprono dall'icona a cursori (🎚️) accanto al suo nome, nella colonna di sinistra. La finestra ha due schede: **Generale** (i parametri del bot) e **Template** (l'aspetto dei messaggi).

### 6.1 Intervallo di controllo e notifiche
Nella scheda **Generale**, oltre ai dati che già conosci (Nome, Token, Channel ID, Data di Partenza), ci sono due regolazioni che decidono il comportamento del bot:

-   **Intervallo di controllo.** Uno slider da 1 a 120 minuti (di default 15) che stabilisce ogni quanto il bot va a controllare i feed. È il ritmo di base; se una singola sorgente ha bisogno di un passo diverso, glielo dai dal Feed Manager (Capitolo 5).
-   **Notifiche.** Un interruttore: quando è acceso, Titan fa comparire un avviso di sistema (una notifica del desktop) a ogni pubblicazione andata a buon fine. Se gestisci canali molto attivi e non vuoi essere avvisato a ogni post, spegnilo.

Accanto al campo Token, un'icona a forma di occhio ti permette di mostrarlo o nasconderlo mentre lo incolli.

![La scheda Generale delle impostazioni del bot: intervallo di controllo, notifiche e fasce orarie.](screenshots/04-bot-settings-general.png)

### 6.2 Fasce orarie di silenzio (Quiet Hours)
Giornali esteri e creatori internazionali pubblicano spesso nel cuore della notte, e una notifica push alle tre del mattino non fa piacere a nessuno. Le fasce orarie di silenzio servono proprio a questo.

Sempre nella scheda **Generale**, la sezione **Fascia Oraria Attiva** ha due campi: **Dalle** (es. 08:00) e **Alle** (es. 22:00). Di default la finestra va da 00:00 a 23:59, cioè nessun silenzio: sei tu a restringerla.

-   *Fuori dalla finestra.* Il motore non si ferma: continua a controllare feed RSS e YouTube tutta la notte, per non perdere nulla. Solo che, invece di inviare subito, mette da parte i contenuti in una coda d'attesa **persistente**, salvata su disco. Se anche spegni il computer, al riavvio la coda è ancora lì.
-   *Alla riapertura.* Appena l'orologio rientra nella fascia consentita, il bot smaltisce in ordine cronologico tutto ciò che ha accumulato, pubblicando un post ogni 3 secondi fino a esaurire la coda.

Così di notte il canale resta muto e il contenuto arriva la mattina, quando ha più probabilità di essere letto.

### 6.3 Editor template e Smart Chips
Di default Titan pubblica con un layout pulito ma standard. Se vuoi dare ai messaggi la tua linea editoriale (un'emoji come logo, i link disposti a modo tuo), apri la scheda **Template**.

Trovi quattro aree di testo separate, una per ogni formato: **Avvio**, **News**, **Podcast**, **YouTube**. Si scrivono nell'**HTML supportato da Telegram**: i tag utili sono `<b>` (grassetto), `<i>` (corsivo), `<code>` (monospazio) e `<a href="...">` (link).

![La scheda Template con l'editor, gli Smart Chips per le variabili e l'anteprima del messaggio.](screenshots/05-bot-settings-templates.png)

Sopra ogni area, i pulsanti **Smart Chips** inseriscono le variabili dinamiche, che il bot sostituirà con il dato reale al momento dell'invio:

-   `{{title}}`: il titolo dell'articolo o del video.
-   `{{feedName}}`: il nome che hai dato alla sorgente nel Feed Manager (per esempio *Rassegna Stampa*).
-   `{{link}}`: l'indirizzo dell'articolo.
-   `{{summary}}`: una breve anteprima del testo (al massimo 300 caratteri).

*Testo pulito.* Non preoccuparti di cosa arriva dai feed: Titan ripulisce il testo dai tag HTML della fonte (immagini, tabelle, paragrafi) e neutralizza i caratteri speciali prima dell'invio, così un articolo «sporco» non può mandare in errore il messaggio.

Due strumenti ti aiutano a non sbagliare:

-   **Anteprima.** Il pulsante a forma di occhio mostra come verrà il messaggio, con dati di esempio al posto delle variabili, senza uscire dall'editor.
-   **Validatore.** Mentre scrivi, Titan segnala in tempo reale i problemi: tag non bilanciati, variabili inesistenti, link non sicuri. Il bordo dell'area diventa rosso per gli errori, giallo per gli avvisi.

*Link puliti.* Telegram sa nascondere i link lunghi dentro il testo. Invece di «Clicca qui: {{link}}», scrivi `<a href="{{link}}">Leggi l'articolo</a>`: l'utente vedrà solo la frase blu cliccabile.

### 6.4 La Danger Zone: azzerare lo storico
In fondo alla scheda **Generale** c'è una sezione rossa, la *Danger Zone*. Il pulsante **Azzera Cronologia** è distruttivo: cancella la memoria del bot, cioè tutto ciò che ha già pubblicato.

-   *Quando serve.* Se hai cancellato per sbaglio molti messaggi dal canale e vuoi che il bot ripubblichi le ultime notizie per ricostruire la bacheca.
-   *Come usarlo senza disastri.* Se azzeri la cronologia e premi Play, il bot considera «nuovo» tutto quello che trova nei feed e lo invia in blocco, inondando il canale. Per evitarlo, dopo aver azzerato riporta la **Data di Partenza** (nella stessa scheda) alla data di oggi: così il bot dimentica il passato ma pubblica solo da oggi in avanti.

Azzerando lo storico, anche i contatori delle statistiche tornano a zero (Capitolo 3). Accanto alla Danger Zone trovi anche l'esportazione del bot in formato `.rtb`, che vediamo nel Capitolo 7.

---
