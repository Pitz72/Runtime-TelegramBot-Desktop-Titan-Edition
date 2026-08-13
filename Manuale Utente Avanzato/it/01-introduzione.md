## Capitolo 1: Introduzione e Concetti Base

### 1.1 Cos'è Titan Edition?
Benvenuto in **Runtime TelegramBot Titan Edition**. Non è un semplice «script» che copia e incolla link: è uno strumento di automazione editoriale che legge le tue sorgenti (feed RSS, podcast, canali YouTube) e pubblica i nuovi contenuti sul tuo canale Telegram senza che tu debba seguirle a mano.

È pensato per chi gestisce community, testate, stazioni radio o canali YouTube e ha bisogno di distribuire contenuti in modo tempestivo e continuo.

La differenza rispetto ai servizi cloud commerciali sta in dove gira. Quelli vivono su server altrui, spesso con un abbonamento mensile e un tetto ai messaggi che puoi inviare. Titan gira **in locale**, sul tuo computer o sul tuo server: i tuoi dati e le tue credenziali restano sulla tua macchina, non paghi un canone e nessun piano commerciale ti limita il numero di invii. Restano soltanto i normali limiti anti-spam di Telegram, che Titan gestisce da sé.

![La schermata di benvenuto che accoglie l'utente all'avvio di Titan Edition.](screenshots/01-intro-welcome.png)

### 1.2 Come lavora, sotto il cofano
Per usarlo al meglio basta afferrare due concetti su come Titan gestisce le informazioni.

-   **Motore asincrono (Producer-Consumer).** Titan tiene separate due attività: una scarica di continuo gli articoli dalle tue sorgenti, l'altra li formatta e li invia a Telegram. Così lo scaricamento non si ferma mai ad aspettare l'invio, e l'invio rispetta le pause che Telegram impone per non farti bloccare come spam, il cosiddetto *FloodWait*.
-   **Il database e la «memoria» del bot.** Ogni volta che pubblica un articolo o un video, Titan ne calcola un'impronta digitale (un hash MD5) e la registra nel suo database interno. È questa memoria che gli impedisce di ripubblicare due volte la stessa notizia, anche se spegni il computer per due giorni e lo riaccendi.

---
