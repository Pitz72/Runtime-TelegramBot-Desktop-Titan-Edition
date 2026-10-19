# ⚡ Runtime TelegramBot Desktop · Titan Edition: guida rapida

Benvenuto in **Runtime TelegramBot Desktop · Titan Edition**. Questa guida rapida ti porta dalla configurazione del primo bot alla prima pubblicazione sul tuo canale Telegram.

---

## 1. Preparazione: Ottieni il Token di Telegram
Prima di avviare Titan, devi creare un «Bot» su Telegram:
1. Apri Telegram e cerca l'utente **@BotFather** (ha la spunta blu).
2. Invia il comando `/newbot` e segui le istruzioni per dare un nome al tuo bot.
3. Alla fine, @BotFather ti restituirà un **Token API** (una lunga stringa tipo `123456789:ABCdefGHIjklMNOpqr...`). **Copialo e tienilo al sicuro.**
4. Aggiungi il bot appena creato al tuo Canale Telegram come **Amministratore** (deve avere il permesso di «Inviare Messaggi»).

## 2. Il Primo Avvio (Setup Wizard)
Avvia Titan. Se è la prima volta, apparirà la procedura guidata in quattro passaggi:
*   **Nome del bot:** Scegli un nome per riconoscerlo (es. «Canale News»).
*   **Token del bot:** Incolla il Token fornito da @BotFather.
*   **Canale di destinazione:** Inserisci il nome del tuo canale (es. `@ilmiocanale`). Se è un canale privato, inserisci l'ID numerico (es. `-100123456789`).
*   **Data di Partenza:** Scegli una data. Il bot **ignorerà** tutti gli articoli e i video pubblicati prima di questa data, evitando di inondare il tuo canale di vecchi contenuti.

## 3. Aggiungere le sorgenti
Una volta entrato nella Dashboard:
1. Seleziona il bot nell'elenco **Bot**, a sinistra.
2. Nel pannello **Sorgenti** clicca su **Aggiungi sorgente**.
3. Inserisci il nome (es. «Il mio podcast») e scegli il **Tipo**: Podcast, Articoli o YouTube.
4. Incolla l'indirizzo:
   * per articoli e podcast, l'URL del feed RSS;
   * per YouTube, l'indirizzo del canale o il suo handle (es. `@RuntimeRadio`). Non serve nessuna API key.
5. Premi **Prova** per verificare che l'indirizzo funzioni, poi **Aggiungi**.

Ogni sorgente ha accanto il suo interruttore (attiva o in pausa) e i pulsanti per modificarla o eliminarla.

## 4. Personalizzare i messaggi (i template)
1. Sotto il nome del bot clicca su **Impostazioni del bot**.
2. Apri la scheda **Messaggi**.
3. Con i pulsanti **Titolo**, **Nome sorgente**, **Link** e **Sommario** inserisci le variabili `{{title}}`, `{{feedName}}`, `{{link}}` e `{{summary}}`.
4. Puoi usare l'HTML di base che Telegram accetta, per esempio `<b>Grassetto</b>`, `<i>Corsivo</i>`, oppure nascondere un link lungo dietro un testo con `<a href="{{link}}">Clicca qui</a>`.
5. **Anteprima** mostra il messaggio con dati di esempio; sotto il campo, un controllo segnala subito i tag che Telegram rifiuterebbe.

## 5. Accensione
Inserito il token e aggiunte le sorgenti, resta solo da accendere.
*   Clicca su **Avvia il motore**, in alto a destra. Il motore è uno solo e lavora per tutti i bot attivi.
*   Accanto al pulsante vedi lo stato («Motore acceso») e l'ora del prossimo giro di controllo.
*   Nel pannello **Attività**, vista **Diario**, segui le scansioni, i contenuti trovati e quelli pubblicati. La vista **Console** mostra il log completo.

---

### 💡 Consigli utili e soluzione dei problemi
*   **Fascia oraria di pubblicazione:** in *Impostazioni del bot → Pianificazione* scegli quando il bot può pubblicare. Se imposti dalle 08:00 alle 22:00, le notizie della notte non vanno perse: restano in coda e partono alle 08:00.
*   **Errori YouTube:** se compaiono errori sui canali YouTube, di solito YouTube ha cambiato qualcosa nelle sue pagine. Metti in pausa quella sorgente con il suo interruttore e controlla se c'è un aggiornamento dell'applicazione.
*   **Cambio PC:** per spostare un bot su un altro computer non copiare i file: usa *Impostazioni del bot → Avanzate → Esporta*. Il file .rtb porta con sé sorgenti, filtri, template e fascia oraria. Il token no: è cifrato e legato al computer d'origine, quindi sul nuovo PC va reinserito a mano. Sul nuovo PC basta un doppio clic sul file .rtb per importarlo.
*   **Leggere meglio:** in *Impostazioni → Accessibilità* puoi ingrandire tutta l'interfaccia (anche con **Ctrl +** e **Ctrl −**, **Ctrl 0** per tornare al 100%) e ridurre animazioni ed effetti.

---

**Runtime TelegramBot Desktop · Titan Edition** è software libero, rilasciato sotto licenza **MIT**: puoi usarlo, studiarlo, modificarlo e ridistribuirlo.

Gran parte del codice è stata scritta con modelli linguistici (Google Gemini, Anthropic Claude). Concezione, direzione progettuale e verifica sono di Simone Pizzi.

Per la trattazione completa usa il pulsante **Manuale completo (PDF)**.

Contatti: simonepizzi.runtimeradio.it/contatti
Donazione libera: paypal.me/runtimeradio
