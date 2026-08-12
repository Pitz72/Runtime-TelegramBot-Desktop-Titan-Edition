# ⚡ Runtime TelegramBot Desktop Titan Edition: Quick Start Guide

Benvenuto in **Runtime TelegramBot Desktop Titan Edition**. Questa guida rapida ti permetterà di configurare il tuo primo bot e iniziare a pubblicare contenuti sul tuo canale Telegram in meno di 3 minuti.

---

## 1. Preparazione: Ottieni il Token di Telegram
Prima di avviare Titan, devi creare un «Bot» su Telegram:
1. Apri Telegram e cerca l'utente **@BotFather** (ha la spunta blu).
2. Invia il comando `/newbot` e segui le istruzioni per dare un nome al tuo bot.
3. Alla fine, @BotFather ti restituirà un **Token API** (una lunga stringa tipo `123456789:ABCdefGHIjklMNOpqr...`). **Copialo e tienilo al sicuro.**
4. Aggiungi il bot appena creato al tuo Canale Telegram come **Amministratore** (deve avere il permesso di «Inviare Messaggi»).

## 2. Il Primo Avvio (Setup Wizard)
Avvia Runtime TelegramBot Desktop Titan Edition. Se è la prima volta, apparirà la procedura guidata in 4 passaggi:
*   **Nome Bot:** Scegli un nome per riconoscerlo (es. *Canale News*).
*   **Bot Token:** Incolla il Token fornito da @BotFather.
*   **Channel ID:** Inserisci il nome del tuo canale (es. `@ilmiocanale`). Se è un canale privato, inserisci l'ID numerico (es. `-100123456789`).
*   **Data di Partenza:** Scegli una data. Il bot **ignorerà** tutti gli articoli e i video pubblicati prima di questa data, evitando di inondare il tuo canale di vecchi contenuti.

## 3. Aggiungere le Fonti (Feed Manager)
Una volta entrato nella Dashboard:
1. Assicurati che il tuo bot sia selezionato nella colonna di sinistra.
2. Nel pannello **Sorgenti Feed**, clicca su **«+ Aggiungi Sorgente»**.
3. Inserisci il Nome (es. *Il mio Podcast*) e seleziona il **Tipo** (Podcast, News o YouTube).
4. Incolla l'URL:
   * Per News e Podcast: incolla l'URL del feed RSS.
   * Per YouTube: Puoi incollare direttamente l'URL del canale o l'handle (es. `@RuntimeRadio`). *Non servono API Key!*
5. Usa il pulsante **Testa (⚡)** per verificare che il link sia valido, poi clicca su **Salva**.

## 4. Personalizzare i Messaggi (I Template)
Vuoi che i tuoi post siano formattati in modo perfetto?
1. Clicca sull'icona **Impostazioni (⚙️)** nella colonna di sinistra.
2. Spostati sulla scheda **Template**.
3. Usa la comoda pulsantiera in alto per inserire le variabili automatiche come `{{title}}`, `{{link}}` o `{{summary}}`.
4. Puoi usare i tag HTML di base supportati da Telegram, ad esempio: `<b>Grassetto</b>`, `<i>Corsivo</i>`, o nascondere un link lungo dietro a un testo usando `<a href="{{link}}">Clicca qui</a>`.

## 5. Accensione (Ignition)
Hai inserito il token e aggiunto i feed? Sei pronto.
*   Clicca sul grande pulsante **Play (▶)** al centro della console.
*   L'anello inizierà a ruotare e il bot entrerà in funzione.
*   Nel pannello **System Logs** vedrai in tempo reale il bot che legge le tue fonti e pubblica i nuovi contenuti su Telegram!

---

### 💡 Consigli Utili & Troubleshooting
*   **Fasce di Silenzio:** Nelle impostazioni del bot puoi definire l'orario di attività. Se imposti dalle 08:00 alle 22:00, le notizie notturne non andranno perse, ma verranno messe in coda e pubblicate alle 08:00 del mattino!
*   **Errori YouTube:** Se ricevi errori «rossi» sui canali YouTube, niente panico. Google aggiorna spesso i suoi server. Spegni temporaneamente il feed YouTube dal bottoncino dedicato nell'interfaccia e attendi un nostro aggiornamento software.
*   **Cambio PC:** Devi spostare il bot su un altro computer? Non copiare i file! Usa la funzione **Esporta (.rtb)** nelle impostazioni. Questo genererà un file sicuro da importare nel nuovo PC, mantenendo le tue password crittografate.

---

**Runtime TelegramBot Desktop · Titan Edition** è software libero, rilasciato sotto licenza **MIT**: puoi usarlo, studiarlo, modificarlo e ridistribuirlo.

Gran parte del codice è stata scritta con modelli linguistici (Google Gemini, Anthropic Claude). Concezione, direzione progettuale e verifica sono di Simone Pizzi.

Per la trattazione completa usa il pulsante **Scarica Manuale (PDF)**.

Contatti: simonepizzi.runtimeradio.it/contatti
Donazione libera: paypal.me/runtimeradio
