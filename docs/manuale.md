# Manuale d'Uso Avanzato
### Runtime TelegramBot Titan Edition (v1.7.x)

---

## Capitolo 1: Introduzione e Concetti Base

### 1.1 Cos'è Titan Edition?
Benvenuto in **Runtime TelegramBot Titan Edition**. Questo software non è un semplice "script" che copia e incolla link, ma una piattaforma professionale di *Broadcast Automation*. È stato progettato per chi gestisce community, network editoriali, stazioni radio o canali YouTube e ha la necessità di distribuire contenuti in modo capillare, tempestivo e completamente automatizzato sulla piattaforma Telegram.

A differenza delle soluzioni Cloud commerciali (che spesso impongono abbonamenti mensili e limiti al numero di messaggi inviabili), Titan Edition viene eseguito **localmente** sul tuo computer o sul tuo server. Questo ti garantisce privacy assoluta, nessun limite di invio e il controllo totale sui tuoi dati.

### 1.2 L'ecosistema "Sotto il Cofano"
Per sfruttare al massimo Titan, è utile comprendere due concetti fondamentali su come il software gestisce le informazioni:
*   **Motore Asincrono (Producer-Consumer):** Titan non si blocca mai. Mentre il motore scarica silenziosamente centinaia di articoli dai tuoi feed RSS, un sistema separato si occupa di formattarli e inviarli a Telegram, rispettando i tempi di pausa richiesti da Telegram stessa per evitare di essere bloccati per "Spam" (il cosiddetto *FloodWait*).
*   **Il Database SQLite e la "Memoria" del Bot:** Ogni volta che Titan pubblica un articolo o un video, ne calcola l'"impronta digitale" (Hash MD5) e la salva in un database interno criptato. Grazie a questo sistema, Titan non pubblicherà mai due volte la stessa notizia, anche se spegni il computer per due giorni e lo riaccendi.

---

## Capitolo 2: Installazione e Primo Avvio

### 2.1 Requisiti di Sistema
Titan Edition è un software leggero ma estremamente potente. È progettato per funzionare sui tre principali Sistemi Operativi:
*   **Windows:** Windows 10 o superiore (64-bit).
*   **macOS:** macOS 11.0 (Big Sur) o superiore (Intel e Apple Silicon M1/M2/M3).
*   **Linux:** Ubuntu 22.04+, Debian, Fedora, Arch Linux (in formato `.AppImage` o `.deb`).

*Nota per server VPS:* Titan può essere installato su Virtual Private Server. Il software è dotato di sistemi "Anti-Ghosting" che prevengono crash grafici su macchine prive di scheda video dedicata.

### 2.2 Installazione
L'installazione è un processo "Plug & Play". 
1. Scarica l'eseguibile fornito dal tuo amministratore o dalla pagina delle release ufficiale.
2. **Su Windows:** Avvia il file `.exe` e segui le istruzioni a schermo. Il programma creerà automaticamente un collegamento sul desktop.
3. **Su macOS:** Apri il file `.dmg` e trascina l'icona dell'applicazione nella cartella *Applicazioni*. Al primo avvio, se il sistema lo richiede, vai in *Impostazioni di Sistema -> Privacy e Sicurezza* e clicca su "Apri comunque".
4. **Su Linux:** Rendi eseguibile il file `.AppImage` (clic destro -> Proprietà -> Permessi -> Consenti l'esecuzione) e avvialo con un doppio clic.

### 2.3 Il Setup Wizard (Primo Avvio)
Al primissimo avvio, dopo la sequenza animata di boot e la selezione della tua lingua preferita, Titan ti presenterà una procedura guidata (Setup Wizard) in 4 passaggi per configurare immediatamente la tua prima automazione.

1.  **Nome Bot:** Inserisci un nome puramente descrittivo che ti aiuterà a riconoscere questo profilo all'interno dell'interfaccia (es. "Bot Notizie Sportive"). Questo nome non sarà visibile ai tuoi utenti su Telegram.
2.  **Token Bot:** Incolla qui il Token segreto generato da `@BotFather`. *(Per scoprire come ottenere questo token, consulta il Capitolo 4.2).*
3.  **ID Canale (Channel ID):** Inserisci il nome utente pubblico del tuo canale Telegram preceduto dalla chiocciola (es. `@ilmiocanale`). Se il canale è privato, dovrai inserire il suo identificativo numerico (che inizia solitamente con il segno meno, es. `-100123456789`).
4.  **Data di Partenza (Start Date):** Questo è un parametro di sicurezza cruciale. Di default è impostato sulla data odierna. Titan leggerà i tuoi feed, ma **ignorerà e scarterà** automaticamente qualsiasi notizia o video pubblicato prima di questa data. Questa funzione evita che, al primo avvio, il bot inondi il tuo canale con notizie vecchie di settimane.

Una volta completati questi 4 passaggi, clicca su **Lancia Titan**. Sarai catapultato nella plancia di comando principale.

---

## Capitolo 3: L'Interfaccia Utente (Dashboard)

### 3.1 Anatomia della Console
Una volta completato il Setup Wizard o dopo aver avviato l'applicazione, verrai accolto dalla *Titan Glass Interface*, una plancia di comando progettata per gestire carichi di lavoro complessi mantenendo un layout pulito e razionale. L'interfaccia è divisa in due macro-aree principali (il layout 50/50):

*   **L'Emisfero Sinistro (Configurazione):** Quest'area ospita il "Bot Selector" (la barra laterale che ti permette di scorrere e selezionare quale profilo bot vuoi visualizzare) e il "Feed Manager", ovvero la lista delle sorgenti di informazione associate al bot attualmente selezionato. È in questa zona che tu, come operatore, istruisci il software su cosa deve cercare.
*   **L'Emisfero Destro (Operatività):** Questa è la zona di esecuzione. Contiene il pulsante di "Ignition" (il grande tasto Play centrale che accende e spegne il motore), i contatori statistici degli invii e la grande console testuale nera ("System Logs") che mostra, riga per riga, cosa sta facendo il bot in tempo reale.

*Suggerimento di Utilizzo:* Non devi preoccuparti di quale bot stai visualizzando a schermo se hai già premuto il tasto Play. Quando il motore è acceso, Titan lavora in background su **tutti** i bot attivi contemporaneamente. La selezione nella colonna di sinistra serve solo a te per consultare le configurazioni specifiche di quel particolare profilo.

### 3.2 Il Pannello "System Logs"
La console dei Log (situata in basso a destra) è lo specchio diretto del motore asincrono. Abbiamo scelto di mantenere questa sezione in lingua inglese (indipendentemente dalla lingua dell'interfaccia scelta) per garantire uno standard tecnico universale in caso di richiesta di assistenza.

I messaggi all'interno del Log sono codificati a colori per una lettura rapida:
*   🟢 **Verde (`Sent` / `Found New Item`):** Indica che un nuovo articolo è stato trovato e inviato con successo a Telegram.
*   🟡 **Giallo/Arancione (`Skipped` / `FloodWait`):** Il motore ha deciso di ignorare un elemento (ad esempio perché precedente alla *Start Date* impostata) oppure Telegram ha richiesto al bot di fare una pausa per evitare lo spam. Il bot gestisce queste pause automaticamente.
*   🔴 **Rosso (`Error` / `Failed`):** Si è verificato un errore critico, come una connessione internet interrotta, un Token API errato o un cambiamento strutturale nei server di YouTube.
*   🔵 **Azzurro/Bianco (`Fetching` / `No updates`):** Operazioni di normale amministrazione. Il bot sta leggendo la sorgente ma non ha trovato nulla di nuovo da pubblicare rispetto al suo ultimo controllo.

Nella barra superiore del pannello Log, troverai un pulsante **"Esporta"**. Questa funzione ti permette di salvare l'intero tracciato testuale in un file `.txt` sul tuo computer, un'operazione indispensabile se devi fornire queste informazioni a un tecnico per un controllo (Troubleshooting).

### 3.3 Comprendere le Statistiche
Ai lati del pulsante di accensione centrale, l'interfaccia visualizza tre grandi numeri: **Oggi (Today)**, **7 Giorni (Week)** e **Totale (Total)**. 
Queste metriche, che si aggiornano dinamicamente ogni 30 secondi mentre il motore è in esecuzione, indicano esclusivamente il numero di **messaggi andati a buon fine** e pubblicati su Telegram per il bot attualmente selezionato. 
*Nota Tecnica:* Se per qualche motivo decidi di usare il tasto "Azzera Cronologia" (Clear History) nelle impostazioni del bot, anche questi contatori torneranno inesorabilmente a zero, poiché il database degli invii verrà cancellato.

---

## Capitolo 4: Gestione dei Bot e dei Canali

### 4.1 Creare Bot Multipli (Architettura Multi-Tenant)
La potenza di *Runtime TelegramBot Titan Edition* risiede nella sua architettura multi-canale. Supponiamo che tu gestisca una radio: potresti volere un canale Telegram dedicato alle notizie scritte (News), uno dedicato alle puntate in audio (Podcast), e magari un terzo canale dedicato al dietro le quinte (YouTube). 

Invece di installare il programma tre volte, puoi gestire tutto dalla stessa finestra.
Nella barra in alto a sinistra (sopra la lista dei tuoi bot), trovi l'icona **"+" (Nuovo Bot)**. Cliccandola, si aprirà un modulo di inserimento veloce. Dovrai fornire nuovamente un Nome, un Token, un Channel ID e una Data di Partenza. 
Non appena salverai, un nuovo profilo indipendente apparirà nella lista. Ogni profilo agirà in totale isolamento: potrai assegnargli feed diversi, orari diversi e template visivi separati. Quando premerai il pulsante Play generale, Titan orchesterrà entrambi i bot simultaneamente.

### 4.2 Recuperare il Token da @BotFather
Il *Bot Token* è la "chiave di casa" che permette al tuo software di interfacciarsi con i server di Telegram. Per ottenerne uno nuovo, devi usare il tuo smartphone o l'app desktop di Telegram:
1. Nella barra di ricerca globale di Telegram, digita `BotFather`. Fai molta attenzione ad aprire il profilo ufficiale, che è sempre contrassegnato da una spunta blu di verifica.
2. Premi il tasto **Avvia** in basso, e digita il comando `/newbot`.
3. BotFather ti chiederà prima di scegliere un "Nome" (quello che leggeranno gli utenti) e poi uno "Username" (che deve essere unico al mondo e terminare obbligatoriamente con la parola *bot*, ad esempio `miaradio_news_bot`).
4. Se il nome è disponibile, BotFather ti risponderà con un messaggio di congratulazioni contenente una lunga stringa alfanumerica sotto la dicitura *Use this token to access the HTTP API*.
5. Seleziona e copia questa stringa. Questo è il token che dovrai incollare all'interno di Titan Edition.

**Importante:** Non condividere mai questo Token con nessuno. Titan Edition lo protegge salvandolo nel suo database in forma crittografata, legandolo all'hardware del tuo computer, in modo che nessuno possa rubarlo nemmeno accedendo ai file del tuo PC.

### 4.3 Trovare il Channel ID corretto
Affinché il bot possa pubblicare i messaggi, deve sapere *dove* mandarli. Questo parametro è il **Channel ID**. 
*   **Per i Canali Pubblici:** È il metodo più semplice. Se il tuo canale ha un link condivisibile del tipo `t.me/miocanale`, il tuo Channel ID sarà semplicemente `@miocanale`. Titan è intelligente: anche se scrivi per sbaglio l'intero link HTTP, il software lo "pulirà" e lo normalizzerà automaticamente, estraendo solo la porzione necessaria.
*   **Per i Canali Privati:** I canali privati non hanno un link nominale, ma sono identificati da una lunga stringa numerica univoca assegnata dai server di Telegram (spesso inizia con il segno meno, ad esempio `-1002345678912`). Puoi reperire questo ID inoltrando un messaggio del tuo canale a speciali bot di servizio gratuiti su Telegram (come `@getidsbot`), che ti risponderanno stampando il codice numerico esatto della tua chat.

*Regola d'Oro:* Dopo aver creato il canale e ottenuto l'ID, ricordati sempre di andare nelle impostazioni del tuo canale Telegram, cliccare su "Amministratori", cercare il nome del tuo bot e aggiungerlo alla lista. Se il bot non è Amministratore, non avrà i permessi fisici per incollare il testo nella chat e l'engine di Titan ti restituirà un errore di tipo *Fatal Telegram Error*.

---

## Capitolo 5: Il Feed Manager (Le Sorgenti)

### 5.1 Aggiungere e Testare un Feed RSS (Podcast/News)
Il Feed Manager (il pannello sotto la lista dei Bot) è la "dieta" del tuo Bot. Qui inserisci gli indirizzi web (URL) da cui Titan andrà a pescare le notizie. 

Per aggiungere un nuovo flusso:
1. Assicurati di aver selezionato il bot corretto a cui vuoi assegnare la fonte.
2. Clicca su **Aggiungi Sorgente**.
3. Inserisci un **Nome**. Questo nome è fondamentale, perché potrai stamparlo automaticamente in cima ai tuoi messaggi su Telegram come "Firma" della notizia.
4. Seleziona il **Tipo**:
    *   **Podcast:** Scegli questa opzione se il link porta a file audio (MP3). Titan cercherà di estrarre l'immagine di copertina (spesso nascosta nei tag *iTunes* tipici dei servizi come Spreaker o AzuraCast).
    *   **News:** Scegli questa opzione per i classici articoli di blog, siti di informazione o giornali.
5. Incolla l'URL del feed (solitamente un file che termina in `.xml` o `.rss`).

Prima di salvare alla cieca, Titan ti mette a disposizione il prezioso pulsante **Testa (⚡)**. Cliccandolo, l'engine eseguirà una chiamata HTTP in tempo reale al link fornito, simulando la lettura del server. Se il link è corretto e il file è formattato adeguatamente, riceverai un avviso verde con il numero esatto di notizie estratte. Se c'è un errore (es. sito offline o link errato), un avviso rosso ti impedirà di inserire un dato corrotto nel database.

### 5.2 La Gestione Nativa di YouTube
Integrare i video di YouTube nei sistemi di automazione è notoriamente un processo frustrante, che solitamente richiede la registrazione di account sviluppatore su Google Cloud e l'immissione di chiavi API soggette a pagamenti e limitazioni. 

In *Titan Edition*, questo ostacolo è stato completamente abbattuto grazie all'integrazione di un motore di *scraping* diretto (InnerTube) che simula la normale navigazione umana.
Questo approccio, definito "Zero-Config", ti permette di aggiungere un canale YouTube con una facilità disarmante.

1.  Nel pannello Aggiungi Sorgente, seleziona il tipo **YouTube (Video)**.
2.  Nel campo URL, non devi inserire strani codici identificativi o feed XML. Ti basta incollare l'**Handle** del canale, ovvero la chiocciola che vedi sotto il nome dello YouTuber (es. `@RuntimeRadio`), oppure copiare e incollare l'indirizzo web intero del canale direttamente dalla barra di ricerca del tuo browser.

Il software farà il resto in completa autonomia. Inoltre, per evitare "falsi allarmi", il motore video di Titan è dotato di un esclusivo **Filtro Anti-Premiere**. Se lo YouTuber programma una diretta o imposta un video come "In Uscita tra 2 giorni", YouTube lo spinge in cima alla lista. Se un bot classico leggesse quel feed, invierebbe subito la notifica su Telegram, portando l'utente a cliccare su un video non ancora disponibile. L'Intelligenza Artificiale di Titan, invece, riconosce lo stato "programmato" del video e lo ignora attivamente, mettendolo in coda solo nel momento esatto in cui diventa effettivamente pubblico e riproducibile per l'audience.

---

## Capitolo 6: Impostazioni Avanzate e Template

### 6.1 Fasce Orarie di Silenzio (Quiet Hours)
Non tutto il traffico web viaggia in orario d'ufficio. Spesso, giornali esteri o creatori di contenuti internazionali pubblicano video e notizie nel cuore della notte. Ricevere una notifica push da Telegram alle tre del mattino non è mai piacevole per il tuo pubblico.
Per risolvere questo problema, Titan Edition è dotato della funzione "Fasce Orarie di Silenzio".

Accedendo alle Impostazioni del Bot (cliccando sull'icona a forma di cursore accanto al nome del bot nella barra laterale), troverai la sezione **Fascia Oraria Attiva**. 
Qui puoi definire due parametri: **Dalle** (es. 08:00) e **Alle** (es. 22:00). 
*   *Cosa succede fuori da questo orario?* Il motore di Titan non si ferma mai: continuerà silenziosamente a pattugliare i tuoi feed RSS e YouTube durante tutta la notte per non farsi sfuggire nulla. Tuttavia, anziché inviare immediatamente il contenuto a Telegram, lo parcheggerà in una speciale "Coda di Attesa" (Queue) in memoria. 
*   *Il risveglio:* Non appena l'orologio del computer scatterà sulle 08:00, il bot si risveglierà e inizierà a smaltire ordinatamente tutta la coda accumulata nella notte, pubblicando un post ogni 3 secondi fino a completo smaltimento.

Questa funzionalità garantisce che le tue automazioni rispettino il riposo dei tuoi utenti, massimizzando al contempo le probabilità che il tuo contenuto venga letto la mattina seguente.

### 6.2 Editor Template e "Smart Chips" (Formattazione HTML)
Di default, Titan pubblica i post con un layout pulito ma standard. Se desideri uniformare le comunicazioni alla linea editoriale del tuo brand (aggiungendo il tuo logo in emoji, o cambiando la disposizione dei link), puoi utilizzare l'**Editor Template**.

Nelle Impostazioni del Bot, seleziona la scheda in alto "Template". Ti si presenteranno quattro aree di testo separate, una per ogni tipo di formato gestito dal software (Avvio, News, Podcast, YouTube). L'editor di Titan utilizza il linguaggio **HTML nativo di Telegram**.

Per facilitare l'immissione dei dati dinamici, sopra l'area di testo troverai dei piccoli pulsanti chiamati **Smart Chips**. Cliccandoli, inserirai nel testo delle speciali variabili racchiuse da doppie parentesi graffe. Quando il bot invierà il messaggio, sostituirà queste "etichette" con il dato reale scaricato dal sito web:
*   `{{title}}` : Verrà sostituito con il titolo esatto dell'articolo o del video.
*   `{{feedName}}` : Stamperà il "Nome Sorgente" che hai assegnato al feed nel Feed Manager (es. *Rassegna Stampa*).
*   `{{link}}` : Stampa l'URL nudo e crudo dell'articolo.
*   `{{summary}}` : Inserisce una breve anteprima del testo (massimo 300 caratteri), utile per dare al lettore un assaggio del contenuto.

*Tip per i Power User (Link Puliti):* Telegram permette di nascondere gli antiestetici link lunghissimi all'interno del testo. Invece di scrivere "Clicca qui: {{link}}", prova a scrivere la formula HTML: `<a href="{{link}}">Clicca qui per leggere l'articolo</a>`. Su Telegram, l'utente vedrà solo la frase blu cliccabile. Puoi inoltre usare il tag `<b>` per il grassetto (es. `<b>{{title}}</b>`) o `<i>` per il corsivo.

### 6.3 La "Danger Zone": Azzerare lo Storico (Clear History)
In fondo alle impostazioni generali del Bot troverai una sezione evidenziata di rosso, definita *Danger Zone*. Il pulsante **Azzera Cronologia** è uno strumento tanto potente quanto distruttivo. 

Come spiegato nell'introduzione, Titan si affida al suo database interno per ricordare cosa ha già pubblicato in passato, evitando così di rispedire vecchie notizie a ogni riavvio.
Cliccando questo pulsante, tu cancellerai letteralmente la memoria del Bot. L'engine dimenticherà tutto ciò che è transitato fino a quel momento.
*   *Quando usarlo?* È molto utile se, per sbaglio, hai cancellato molti messaggi dal canale Telegram e vuoi forzare il bot a ri-pubblicare le ultime notizie per ricostruire la bacheca.
*   *Come usarlo in sicurezza?* **Attenzione:** Se clicchi su Azzera Cronologia e premi Play, il bot invierà istantaneamente **tutti** gli articoli presenti nei tuoi feed, inondando il canale di spam. Per evitarlo, dopo aver azzerato la memoria, **ricordati sempre di aggiornare la "Data di Filtro (Cutoff)"** (nella stessa schermata) alla data odierna. Così facendo, costringerai il bot a dimenticare il passato, ma a leggere solo i post pubblicati da oggi in poi.

---

## Capitolo 7: Portabilità e Sicurezza (L'Ecosistema OmniSync)

### 7.1 Gestione Globale: Il Backup del Database
Che tu stia formattando il PC o semplicemente creando copie di sicurezza mensili, Titan ti offre strumenti professionali per preservare il tuo lavoro.
Cliccando sull'icona dell'Ingranaggio (⚙️) in alto a destra, entrerai nelle **Impostazioni di Sistema e Database**.

Spostandoti sulla scheda **Dati e Backup**, il pulsante **Esporta DB** creerà un clone perfetto dell'intero archivio `titan.db`. Questo file contiene tutto: tutti i profili bot, tutti i feed inseriti e l'intera memoria storica delle pubblicazioni. Se un giorno reinstallerai il software, ti basterà usare il pulsante "Importa DB" e selezionare questo file: Titan si riavvierà automaticamente ripristinando la situazione esatta del giorno in cui hai salvato.

### 7.2 Il Formato .rtb: Condividere Bot in Sicurezza
Titan Edition applica una cifratura di livello militare ai Token dei tuoi Bot (la tecnologia `safeStorage`). Questo significa che la chiave segreta viene criptata usando un codice hardware univoco del *tuo* computer. Se copi e incolli brutalmente il file del database su un altro PC, il programma lo riterrà corrotto, perché non riuscirà a decifrare le password usando l'hardware della nuova macchina.

Come si fa, allora, a passare un profilo Bot a un collega in redazione?
Abbiamo creato l'ecosistema **OmniSync**. Nelle impostazioni del singolo Bot (Danger Zone -> Condivisione), troverai il tasto **Esporta**. 
Questo pulsante genera un file speciale con estensione **`.rtb`** (Runtime Telegram Bot). È una "cartuccia digitale" che contiene il nome del bot, tutti i tuoi feed e le impostazioni dei template, ma spogliata dallo storico dei messaggi inviati.
Durante l'esportazione, Titan sblocca temporaneamente il tuo Token e lo impacchetta nel file `.rtb`. Inviando questo file al tuo collega, lui non dovrà fare altro che cliccare sull'icona "Importa" (la freccia verso il basso vicino al pulsante + Nuovo Bot) e selezionarlo.
L'Intelligenza di Titan leggerà la cartuccia, capirà che si trova su un nuovo computer, e re-cripterà immediatamente il Token basandosi sul nuovo hardware. Il risultato? Una migrazione dati fluida, istantanea e a prova di hacker.

---

## Capitolo 8: Troubleshooting (Risoluzione Problemi)

*   **Problema: Lo schermo del programma è bianco all'avvio.**
    *   *Soluzione:* È estremamente raro nelle versioni moderne, ma può succedere su VPS o computer privi di scheda grafica aggiornata. Prova ad attendere 15 secondi (Titan ha un paracadute di sicurezza che dovrebbe forzare l'apparizione della grafica). Se non funziona, reinstalla l'applicazione sopra quella vecchia. Non perderai alcun dato (il database è conservato in un'area sicura separata dal programma).
*   **Problema: Ho aggiunto un feed YouTube ma ottengo il messaggio "Fallito: Cannot read properties..." nei log.**
    *   *Soluzione:* La connessione tra Titan e YouTube ("InnerTube") è organica e non ufficiale. A volte Google modifica il codice delle sue pagine web rompendo il nostro sistema di lettura (Graceful Degradation). Nel log vedrai l'errore, mentre la Dashboard ti avviserà con una notifica *Toast*. Spegni temporaneamente il canale YouTube incriminato e attendi che il team di Runtime Radio rilasci un aggiornamento software che risolverà il problema alla radice. Le tue News e i tuoi Podcast continueranno a funzionare normalmente.
*   **Problema: Il Bot riporta "Error: Bad Request: chat not found".**
    *   *Soluzione:* Hai inserito un *Channel ID* errato, oppure hai dimenticato il passaggio più importante: non hai inserito il tuo bot tra gli **Amministratori** del Canale Telegram. Aggiungilo, assegnagli il permesso "Invia Messaggi" e l'errore sparirà.
*   **Problema: Il Bot invia le notizie, ma non carica la grande anteprima dell'immagine su Telegram, inserendo solo un quadratino piccolo di fianco al testo.**
    *   *Soluzione:* Questo è il comportamento naturale di Telegram se la fonte RSS originale non contiene un'immagine grande e definita, ma solo una piccola miniatura. Titan cerca in tutti i modi di trovare l'immagine alla risoluzione più alta (fino a scavare all'interno del testo dell'articolo), ma se la fonte originale è sprovvista di tag adeguati, Telegram ripiegherà sul formato "small thumbnail". Per correggere questo comportamento, è necessario intervenire sul sito web sorgente, non sul bot.
