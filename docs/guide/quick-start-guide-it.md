# Runtime TelegramBot — Quick Start Guide

Benvenuto in **Runtime TelegramBot** (Titan Edition). Questa guida ti permette di configurare il tuo primo bot e iniziare a pubblicare contenuti sul tuo canale Telegram in pochi minuti.

---

## 1. Ottieni il Token di Telegram

Prima di avviare l'app, devi creare un bot su Telegram:

1. Apri Telegram e cerca **@BotFather** (ha la spunta blu).
2. Invia il comando `/newbot` e segui le istruzioni per assegnare un nome al bot.
3. @BotFather ti restituirà un **Token API** (es. `123456789:ABCdefGHIjklMNOpqr...`). Copialo.
4. Aggiungi il bot al tuo canale Telegram come **Amministratore** con il permesso di inviare messaggi.

---

## 2. Primo Avvio — Configurazione Bot

Al primo avvio, clicca **"+ Nuovo Bot"** e compila i campi:

- **Nome** — un nome per riconoscere il bot nell'interfaccia (es. *Canale News*).
- **Token** — il Token API fornito da @BotFather.
- **Channel ID** — il nome del canale (es. `@ilmiocanale`) o l'ID numerico per i canali privati (es. `-100123456789`).
- **Data di Partenza** — il bot ignorerà tutti i contenuti pubblicati prima di questa data. Utile per evitare di inondare il canale con vecchi articoli.

---

## 3. Aggiungere Feed (Feed Manager)

Nella dashboard del bot, clicca **"+ Aggiungi Feed"**:

1. Assegna un **Nome** descrittivo al feed.
2. Seleziona il **Tipo**: News, Podcast o YouTube.
3. Incolla l'**URL**:
   - News / Podcast: URL del feed RSS.
   - YouTube: URL del canale o handle (es. `@RuntimeRadio`). *Nessuna API Key richiesta.*
4. Usa **Testa (⚡)** per verificare la validità del link, poi **Salva**.

### Opzioni avanzate per feed

- **Filtro Keyword (F4)** — Filtra gli articoli per parole chiave da includere o escludere. Attivabile nelle impostazioni del feed. Un badge ambra indica il filtro attivo.
- **Intervallo Personalizzato (F5)** — Imposta un intervallo di fetch individuale per il feed (da 5 minuti a 24 ore), indipendente dall'intervallo globale del bot.
- **Digest Mode (F9)** — Invece di pubblicare ogni articolo singolarmente, accumula i contenuti per un intervallo configurabile (1h, 6h, 12h, 24h, 7gg) e li invia in un unico messaggio riepilogativo. Un badge viola indica la modalità attiva.
- **Import OPML (F8)** — Importa più feed contemporaneamente da un file `.opml` standard tramite il pulsante OPML nel Feed Manager.

---

## 4. Personalizzare i Messaggi (Template)

Vai nelle impostazioni del bot → scheda **Template**:

- Usa i **Smart Chips** per inserire variabili dinamiche: `{{title}}`, `{{link}}`, `{{summary}}`, `{{feedName}}`, ecc.
- Sono disponibili 4 template separati: Avvio, News, Podcast, YouTube.
- Il **Validatore** segnala in tempo reale eventuali errori (tag non bilanciati, chip sconosciuti, link non sicuri).
- Il pulsante **Anteprima (F7)** mostra come apparirà il messaggio con dati campione, senza uscire dall'editor.

Tag HTML supportati da Telegram: `<b>`, `<i>`, `<code>`, `<a href="...">`.

---

## 5. Avvio — Ignition

Quando il bot è configurato e i feed sono stati aggiunti:

- Clicca il pulsante **Play (▶)** nella console.
- L'anello di stato inizierà a ruotare e il bot entrerà in funzione.
- Nel pannello **System Logs** vedrai in tempo reale il fetch dei feed e la pubblicazione su Telegram.

Per monitorare più bot contemporaneamente, usa il toggle **ALL BOTS / THIS BOT** nel log.

---

## 6. Statistiche (F6)

Clicca l'icona **Analytics (📊)** nella dashboard per vedere:

- Contatori articoli pubblicati: oggi / ultimi 7 giorni / totale.
- Breakdown per feed, ordinato per volume di pubblicazione.

---

## Impostazioni di Sistema

Accessibili dall'icona ingranaggio in alto a destra:

- **Generale** — intervallo di check globale, quiet hours, lingua.
- **Backup** — esportazione e ripristino del database.
- **Performance Mode** — disabilita effetti GPU-heavy (scanline, blur, glow, animazioni). Utile su macchine con hardware limitato. Efficace immediatamente senza riavvio.

---

## Portabilità — File .rtb

Per spostare un bot su un altro computer senza perdere la configurazione:

1. Nelle impostazioni del bot → **Esporta (.rtb)**.
2. Trasferisci il file sul nuovo PC.
3. Nel nuovo PC → **Importa (.rtb)** e reinserisci il token (i token sono macchina-specifici per sicurezza).

---

## Troubleshooting

- **Errori YouTube** — Google aggiorna periodicamente i propri server. Se compaiono errori rossi sui feed YouTube, disabilita temporaneamente il feed e attendi un aggiornamento dell'app.
- **Token non valido** — Verifica che il bot sia stato aggiunto al canale come amministratore con il permesso di inviare messaggi.
- **Linux senza libsecret** — L'app funziona normalmente usando il fallback AES-256-GCM. Per il keychain nativo installa: `sudo apt-get install libsecret-1-0`.
- **macOS — avviso Gatekeeper** — Al primo avvio: tasto destro sull'app → Apri → Apri.

---

*Per la guida completa consulta il Manuale d'Uso disponibile in formato PDF.*
