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
*   **Nome Bot:** Scegli un nome per riconoscerlo (es. «Canale News»).
*   **Bot Token:** Incolla il Token fornito da @BotFather.
*   **Channel ID:** Inserisci il nome del tuo canale (es. `@ilmiocanale`). Se è un canale privato, inserisci l'ID numerico (es. `-100123456789`).
*   **Data di Partenza:** Scegli una data. Il bot **ignorerà** tutti gli articoli e i video pubblicati prima di questa data, evitando di inondare il tuo canale di vecchi contenuti.

## 3. Aggiungere le Fonti (Feed Manager)
Una volta entrato nella Dashboard:
1. Assicurati che il tuo bot sia selezionato nella colonna di sinistra.
2. Nel pannello **Sorgenti Feed**, clicca su **Aggiungi**.
3. Inserisci il Nome (es. «Il mio Podcast») e seleziona il **Tipo** (Podcast, News o YouTube).
4. Incolla l'URL:
   * Per News e Podcast: incolla l'URL del feed RSS.
   * Per YouTube: puoi incollare direttamente l'URL del canale o l'handle (es. `@RuntimeRadio`). Non serve nessuna API Key.
5. Usa il pulsante **Testa (⚡)** per verificare che il link sia valido, poi clicca su **Salva**.

## 4. Personalizzare i Messaggi (I Template)
1. Clicca sull'icona a cursori (🎚️) accanto al nome del bot, nella colonna di sinistra.
2. Spostati sulla scheda **Template**.
3. Usa i pulsanti **Smart Chips** in alto per inserire le variabili come `{{title}}`, `{{link}}` o `{{summary}}`.
4. Puoi usare i tag HTML di base supportati da Telegram, ad esempio: `<b>Grassetto</b>`, `<i>Corsivo</i>`, o nascondere un link lungo dietro a un testo usando `<a href="{{link}}">Clicca qui</a>`.

## 5. Accensione (Ignition)
Inserito il token e aggiunte le sorgenti, resta solo da accendere.
*   Clicca sul grande pulsante **Play (▶)** al centro della console.
*   L'anello inizierà a ruotare e il bot entrerà in funzione.
*   Nel pannello **System Logs** vedrai in tempo reale il bot che legge le tue fonti e pubblica i nuovi contenuti su Telegram.

---

### 💡 Consigli Utili & Troubleshooting
*   **Fasce di Silenzio:** Nelle impostazioni del bot puoi definire l'orario di attività. Se imposti dalle 08:00 alle 22:00, le notizie notturne non vanno perse: restano in coda e vengono pubblicate alle 08:00.
*   **Errori YouTube:** se compaiono errori «rossi» sui canali YouTube, di solito Google ha cambiato il codice delle sue pagine. Metti in pausa quel feed dall'interruttore accanto alla sorgente e aspetta un aggiornamento dell'applicazione.
*   **Cambio PC:** per spostare un bot su un altro computer non copiare i file: usa **Esporta (.rtb)** nelle impostazioni del bot. Il file porta con sé sorgenti, filtri e template. Il token no: è cifrato e legato al computer d'origine, quindi sul nuovo PC va reinserito a mano.

---

**Runtime TelegramBot Desktop · Titan Edition** è software libero, rilasciato sotto licenza **MIT**: puoi usarlo, studiarlo, modificarlo e ridistribuirlo.

Gran parte del codice è stata scritta con modelli linguistici (Google Gemini, Anthropic Claude). Concezione, direzione progettuale e verifica sono di Simone Pizzi.

Per la trattazione completa usa il pulsante **Scarica Manuale (PDF)**.

Contatti: simonepizzi.runtimeradio.it/contatti
Donazione libera: paypal.me/runtimeradio
