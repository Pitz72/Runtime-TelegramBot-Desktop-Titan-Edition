# Runtime TelegramBot Desktop · Titan Edition — Guida rapida

Benvenuto in **Runtime TelegramBot Desktop · Titan Edition**. Questa guida ti permette di configurare il tuo primo bot e iniziare a pubblicare contenuti sul tuo canale Telegram in pochi minuti.

---

## 1. Ottieni il Token di Telegram

Prima di avviare l'app, devi creare un bot su Telegram:

1. Apri Telegram e cerca **@BotFather** (ha la spunta blu).
2. Invia il comando `/newbot` e segui le istruzioni per assegnare un nome al bot.
3. @BotFather ti restituirà un **Token API** (es. `123456789:ABCdefGHIjklMNOpqr...`). Copialo.
4. Aggiungi il bot al tuo canale Telegram come **Amministratore** con il permesso di inviare messaggi.

---

## 2. Primo Avvio — Configurazione Bot

Al primo avvio, clicca il **+** in cima alla colonna dei bot e compila i campi:

- **Nome** — un nome per riconoscere il bot nell'interfaccia (es. *Canale News*).
- **Token** — il Token API fornito da @BotFather.
- **Channel ID** — il nome del canale (es. `@ilmiocanale`) o l'ID numerico per i canali privati (es. `-100123456789`).
- **Data di Partenza** — il bot ignorerà tutti i contenuti pubblicati prima di questa data. Utile per evitare di inondare il canale con vecchi articoli.

---

## 3. Aggiungere Feed (Feed Manager)

Seleziona il bot a sinistra, poi nel pannello **Sorgenti Feed** clicca **Aggiungi**:

1. Assegna un **Nome** descrittivo al feed.
2. Seleziona il **Tipo**: News, Podcast o YouTube.
3. Incolla l'**URL**:
   - News / Podcast: URL del feed RSS.
   - YouTube: URL del canale o handle (es. `@RuntimeRadio`). *Nessuna API Key richiesta.*
4. Usa **Testa (⚡)** per verificare la validità del link, poi **Salva**.

### Opzioni avanzate per feed

- **Filtro per parole chiave** — pubblica solo gli articoli che contengono certe parole, o scarta quelli che ne contengono altre. Un badge ambra segnala il filtro attivo.
- **Intervallo personalizzato** — dà a questa sorgente un ritmo di controllo tutto suo (da 5 minuti a 24 ore), staccato da quello del bot.
- **Digest** — invece di pubblicare ogni articolo appena esce, accumula i contenuti (1 ora, 6, 12, 24 ore o 7 giorni) e li manda in un unico messaggio riepilogativo, fino a 20 per volta. Un badge viola segnala il digest attivo.
- **Import OPML** — importa in blocco tutte le sorgenti contenute in un file `.opml`, con il pulsante OPML in cima al Feed Manager.

---

## 4. Personalizzare i Messaggi (Template)

Vai nelle impostazioni del bot → scheda **Template**:

- Usa i **Smart Chips** per inserire variabili dinamiche: `{{title}}`, `{{link}}`, `{{summary}}`, `{{feedName}}`, ecc.
- Sono disponibili quattro template separati: Avvio, News, Podcast, YouTube.
- Il **Validatore** segnala in tempo reale eventuali errori (tag non bilanciati, chip sconosciuti, link non sicuri).
- Il pulsante **Anteprima** mostra come apparirà il messaggio con dati campione, senza uscire dall'editor.

Tag HTML supportati da Telegram: `<b>`, `<i>`, `<code>`, `<a href="...">`.

---

## 5. Avvio — Ignition

Quando il bot è configurato e i feed sono stati aggiunti:

- Clicca il pulsante **Play (▶)** nella console.
- L'anello di stato inizierà a ruotare e il bot entrerà in funzione.
- Nel pannello **System Logs** vedrai in tempo reale il fetch dei feed e la pubblicazione su Telegram.

Per monitorare più bot contemporaneamente, usa il toggle **ALL BOTS / THIS BOT** nel log.

---

## 6. Statistiche

Clicca l'icona a grafico accanto al **Totale** per aprire **Statistiche Dettagliate**:

- Contatori articoli pubblicati: oggi / ultimi 7 giorni / totale.
- Breakdown per feed, ordinato per volume di pubblicazione.

---

## Impostazioni di Sistema

Accessibili dall'icona ingranaggio in alto a destra:

- **Generale** — lingua dell'interfaccia, verifica aggiornamenti, documentazione, crediti e donazione.
- **Dati e Backup** — esportazione e ripristino del database.
- **Performance** — spegne gli effetti grafici più pesanti (scanline, sfocature, bagliori, animazioni). Utile su macchine lente; ha effetto subito, senza riavviare.

Intervallo di controllo e fasce orarie di silenzio non stanno qui: sono impostazioni del singolo bot, alla scheda **Generale** delle sue impostazioni.

---

## Portabilità — File .rtb

Per spostare un bot su un altro computer senza perdere la configurazione:

1. Nelle impostazioni del bot → **Esporta (.rtb)**.
2. Trasferisci il file sul nuovo PC.
3. Nel nuovo PC → **Importa (.rtb)** e reinserisci il token a mano: per sicurezza il token è legato al computer che ha creato l'esportazione e altrove non è decifrabile. Tutto il resto arriva già configurato.

---

## Troubleshooting

- **Errori YouTube** — Google aggiorna periodicamente i propri server. Se compaiono errori rossi sui feed YouTube, disabilita temporaneamente il feed e attendi un aggiornamento dell'app.
- **Token non valido** — Verifica che il bot sia stato aggiunto al canale come amministratore con il permesso di inviare messaggi.
- **Linux senza libsecret** — L'app funziona normalmente usando il fallback AES-256-GCM. Per il keychain nativo installa: `sudo apt-get install libsecret-1-0`.

---

**Runtime TelegramBot Desktop · Titan Edition** è software libero, rilasciato sotto licenza **MIT**: puoi usarlo, studiarlo, modificarlo e ridistribuirlo.

Gran parte del codice è stata scritta con modelli linguistici (Google Gemini, Anthropic Claude). Concezione, direzione progettuale e verifica sono di Simone Pizzi.

Per la trattazione completa consulta il **Manuale Utente Avanzato** in PDF, disponibile in italiano e in inglese.

Contatti: simonepizzi.runtimeradio.it/contatti
Donazione libera: paypal.me/runtimeradio
