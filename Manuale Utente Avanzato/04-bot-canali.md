## Capitolo 4: Gestione dei Bot e dei Canali

### 4.1 Creare più bot
Titan è multi-canale: puoi gestire più bot dalla stessa finestra, ognuno con il suo canale. Metti che gestisci una radio: ti serve un canale Telegram per le notizie scritte (News), uno per le puntate audio (Podcast) e magari un terzo per il dietro le quinte (YouTube). Non devi installare il programma tre volte.

In cima alla colonna dei bot, a destra, c'è un gruppetto di comandi. Il **+** apre un modulo veloce: inserisci Nome, Token, Channel ID e Data di Partenza, salvi, e il nuovo profilo compare nella lista. Accanto al **+** trovi anche il tasto per **importare** un bot da un file `.rtb` (Capitolo 7) e quello a cursori (🎚️) per aprirne le **impostazioni** (Capitolo 6).

Ogni profilo vive per conto suo: feed, orari e template sono separati. Quando premi Play, Titan orchestra tutti i bot attivi in un unico ciclo di lavoro, servendoli a rotazione.

### 4.2 Recuperare il Token da @BotFather
Il **Bot Token** è la «chiave di casa» che permette al software di parlare con i server di Telegram. Per ottenerne uno ti serve Telegram, da smartphone o da computer:

1. Nella ricerca di Telegram digita `BotFather` e apri il profilo ufficiale, riconoscibile dalla spunta blu di verifica.
2. Premi **Avvia** e manda il comando `/newbot`.
3. BotFather ti chiede prima un «Nome» (quello che leggeranno gli utenti), poi uno «Username» univoco, che deve finire con la parola *bot* (per esempio `miaradio_news_bot`).
4. Se l'username è libero, BotFather risponde con un messaggio di congratulazioni che contiene una lunga stringa alfanumerica, sotto la dicitura *Use this token to access the HTTP API*.
5. Copia quella stringa: è il token da incollare in Titan.

**Importante.** Non condividere mai il Token. Titan lo salva cifrato, legandolo a questo computer tramite il portachiavi del sistema operativo: così, anche copiando i file del programma su un'altra macchina, il token resta illeggibile. Per spostarlo davvero su un altro PC c'è il formato `.rtb`, spiegato nel Capitolo 7.

### 4.3 Trovare il Channel ID corretto
Per pubblicare, il bot deve sapere *dove* mandare i messaggi: è il **Channel ID**.

-   **Canali pubblici.** È il caso più semplice. Se il canale ha un link tipo `t.me/miocanale`, il Channel ID è `@miocanale`. Non serve nemmeno essere precisi: Titan ripulisce da solo quello che incolli: toglie il prefisso `https://` e `t.me/`, e aggiunge la chiocciola se manca. Così `https://t.me/miocanale`, `t.me/miocanale` e `miocanale` finiscono tutti come `@miocanale`.
-   **Canali privati.** Non hanno un nome pubblico: sono identificati da una stringa numerica assegnata da Telegram, che di solito comincia con il segno meno (per esempio `-1002345678912`). Per ricavarla, inoltra un messaggio del canale a un bot di servizio gratuito come `@getidsbot`, che ti risponde con il codice numerico esatto della chat. Questo numero va incollato così com'è.

*Regola d'oro.* Creato il canale e ottenuto l'ID, e **prima di avviare il bot**, entra nelle impostazioni del canale Telegram, apri **Amministratori**, cerca il tuo bot e aggiungilo con il permesso di inviare messaggi. Se il bot non è amministratore (o l'ID è sbagliato) non ha modo di scrivere nel canale: nei log comparirà un errore rosso di Telegram (li vediamo nel Capitolo 9) e nulla verrà pubblicato.

---
