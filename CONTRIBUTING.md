# Contribuire a Runtime TelegramBot Desktop — Titan Edition

Grazie per l'interesse. Il progetto è nato come applicazione commerciale a sviluppatore singolo ed è stato aperto nell'agosto 2026: il codice è maturo e in produzione, quindi la barra per le modifiche al motore è deliberatamente alta, mentre traduzioni, documentazione, test e correzioni puntuali sono benvenuti.

*Read this in English? The codebase comments and this guide are in Italian; issues and pull requests in English are perfectly welcome.*

---

## Come è stato scritto questo codice

Vale la pena saperlo prima di leggerlo, perché spiega diverse cose che altrimenti sorprendono.

Il codice è stato scritto facendo un **uso massiccio di modelli linguistici**: Google **Gemini**, dalla 2.5 alla 3.1, e Anthropic **Claude**, da Sonnet 4.6 a Opus 5.5. Gran parte di ciò che leggi l'hanno prodotta loro.

Il concetto, la visione, la direzione progettuale, la definizione di ogni dettaglio funzionale e la caccia ai bug sono di **Simone Pizzi**, che ha progettato, diretto e verificato ogni parte del programma. I modelli hanno scritto il codice; le decisioni sono state tutte sue.

Tre conseguenze pratiche per chi contribuisce:

1. **I commenti spiegano il *perché*, non il *cosa*.** Sono lunghi, discorsivi e spesso citano l'incidente concreto che ha portato a scrivere quella riga in quel modo (`// NON usare includes('or') — "or" è contenuto in "giorno"`). Non sono rumore: sono la memoria del progetto, e sono la ragione per cui è ancora manutenibile. Se aggiungi codice, adotta lo stesso registro.
2. **Le stranezze apparenti di solito non lo sono.** Il fallback all'anno 2000 sulle date YouTube, il throttle di 5 secondi tra un canale e l'altro, i tre `try/catch` annidati nel consumer della coda: ognuna di queste cose è la cicatrice di un bug reale, spesso costato settimane. Prima di semplificare, cerca il commento o il changelog che la spiega.
3. **Il codice è stato generato, ma non è stato accettato a scatola chiusa.** Ogni comportamento è stato verificato sul campo su canali Telegram veri, con feed veri. Una pull request che "sembra giusta" ma non è stata provata contro un feed reale è difficile da accettare — dillo esplicitamente se non hai potuto testarla.

---

## Ambiente di sviluppo

Serve **Node.js 22 LTS** o successivo. Non servono più compilatori C++: `better-sqlite3` 13 è un modulo N-API con i binari precompilati per Windows x64 e Linux x64/arm64 dentro il pacchetto, e non si ricompila né per Node né per Electron.

```bash
git clone https://github.com/Pitz72/Runtime-TelegramBot-Desktop-Titan-Edition.git
cd Runtime-TelegramBot-Desktop-Titan-Edition
npm install
```

Su Linux servono `libsecret-1-dev` (per il keychain OS) e `libfuse2` (per costruire l'AppImage):

```bash
sudo apt-get install -y libsecret-1-dev libfuse2
```

### Verificare una modifica

```bash
npx tsc --noEmit    # type check — deve passare pulito
npm test            # test unitari (vitest) — devono passare tutti
npm run dev         # app in sviluppo con ricarica a caldo dell'interfaccia
npx vite build      # build dei bundle main/preload/renderer
npm run build       # build completa + licenze di terze parti + installer
```

I test coprono le regole che decidono **cosa** si pubblica e **come** si reagisce a un errore: data di partenza, ore di silenzio, intervalli, filtri, escape di testo e link, classificazione degli errori di Telegram, difesa anti-SSRF, sanificazione dell'anteprima dei template. Stanno accanto al codice (`*.test.ts`); le regole del motore vivono in `src/main/bot/rules.ts` proprio perché si possano provare senza avviare Electron.

### Provare l'app senza toccare i propri dati

`TITAN_USER_DATA_DIR` sposta database, log e impostazioni in un'altra cartella, con un proprio blocco di istanza singola. Così una build di prova gira accanto al Titan che sta pubblicando, senza leggerne né modificarne i dati:

```bash
TITAN_USER_DATA_DIR=/tmp/titan-prova npm run dev
```

Per un collaudo vero del motore conviene un bot finto (token inventato) e un feed pubblico: Telegram risponde `Unauthorized`, e il motore deve lasciare i contenuti in attesa senza marcarli come pubblicati.

---

## Trappole del progetto — leggere prima di toccare il codice

Sono comportamenti non ovvi, tutti verificati sul campo. Ignorarli fa perdere ore.

### `lib.formats` del main: un solo formato, imposto da un plugin

Fino alla 2.3 `npm run dev` emetteva ESM dentro `dist-electron/main/index.cjs` e l'app moriva con `Cannot use import statement outside a module`. La diagnosi giusta, trovata nella 2.4: `vite-plugin-electron` imposta `lib.formats: ['es']` quando `package.json` ha `"type": "module"`, e `mergeConfig` di Vite **concatena** gli array — il nostro `['cjs']` diventava `['es', 'cjs']`, cioè due build dello stesso file. In build vinceva per caso la seconda; in watch no. Per questo i tre tentativi con `watch.exclude` non avevano mai funzionato.

Ora un piccolo plugin nella configurazione del main (`titan-main-cjs-only` in `vite.config.ts`) impone un solo formato sulla configurazione già fusa. **Non** rimettere `lib.formats` nell'oggetto `vite.build`: verrebbe concatenato di nuovo.

In sviluppo l'interfaccia arriva dal server di Vite (`VITE_DEV_SERVER_URL`, la variabile che il plugin imposta davvero; la 2.3 cercava `ELECTRON_RENDERER_URL`, che non esiste, e caricava la build vecchia).

### `productName` non si tocca

In `electron-builder.yml`, `productName: Runtime Telegram Bot Titan Edition` **non coincide** con il nome commerciale del prodotto, e va bene così. Da quella stringa Electron deriva il percorso della cartella `userData`:

- Windows — `%APPDATA%\runtime-telegram-bot-titan-edition\`
- Linux — `~/.config/runtime-telegram-bot-titan-edition/`

Lì dentro vivono `titan.db`, `.machine-key` e `titan-settings.json`. Cambiare `productName` significa che ogni utente esistente, al primo avvio della versione nuova, trova l'applicazione vuota: niente bot, niente feed, niente storico, token persi. Non è recuperabile dall'interfaccia.

### `releaseNotes.ts` prima di ogni build

`src/renderer/src/lib/releaseNotes.ts` deve contenere l'entry della versione che si sta costruendo. Se manca, la schermata «Novità» mostrata dopo l'aggiornamento cade sul testo generico invece dell'elenco delle modifiche.

### Electron e moduli nativi

Il progetto segue le versioni di Electron **supportate** (le ultime tre maggiori): una versione fuori supporto non riceve più le correzioni di sicurezza di Chromium, e un'app che legge contenuti dalla rete non se lo può permettere. La 2.3 girava ancora su Electron 32, fuori supporto da oltre un anno; la 2.4 è passata alla 44.

Quello che rendeva l'aggiornamento rischioso era `better-sqlite3`, che andava ricompilato con `node-gyp` per ogni versione di Electron e per ogni Node della CI (da qui il vecchio vincolo «Node 20, non oltre»). Dalla 13 è un modulo N-API: l'ABI è stabile, i binari sono nel pacchetto, `npmRebuild` è disattivato in `electron-builder.yml` e non serve più nessun compilatore. Se un giorno entra un'altra dipendenza nativa, deve essere N-API o il problema torna.

⚠️ **`safeStorage` sincrono ha i giorni contati.** Electron 45 depreca `encryptString`/`decryptString`/`isEncryptionAvailable` e Electron 46 li rimuove: prima di salire alla 46, `src/main/crypto.ts` e l'export dei profili in `manager.ts` vanno portati alle versioni `…Async`. Electron garantisce che i dati cifrati con l'API sincrona si decifrano con quella asincrona, ma su Linux i portachiavi cambiano: va provato su GNOME e KDE prima di pubblicare.

### Le migrazioni del database sono il codice più pericoloso

`src/main/database/schema.ts` applica le migrazioni per `PRAGMA user_version`, dalla v1 alla v12, su database reali con anni di storico. Ogni migrazione è seguita da un *safety check* che verifica fisicamente l'esistenza delle colonne. Prima di modificare qualcosa lì:

- fare sempre un backup di `titan.db` e provare la migrazione su una copia;
- non riordinare né rinumerare i blocchi esistenti — si aggiunge in coda;
- le migrazioni legacy per-statement non sono transazionali: è una scelta consapevole, il safety check post-migrazione è la rete.

### Traduzioni: due lingue, entrambe o nessuna

Le lingue del progetto sono **due**: l'italiano è la sorgente, l'inglese la traduzione. I due file in `src/renderer/src/locales/` devono avere **le stesse identiche chiavi**. `I18nContext` fa fallback sull'inglese per le chiavi mancanti, quindi una dimenticanza non rompe l'interfaccia — la lascia semplicemente nell'altra lingua, in silenzio, e passa inosservata a lungo.

Fino alla 2.1.7 le lingue erano otto. Francese, tedesco, spagnolo, portoghese, russo e cinese sono state ritirate con la 2.1.8, insieme ai rispettivi manuali e guide. **Le pull request che le reintroducono non vengono accettate**: la ragione non è tecnica ma di manutenzione — sei lingue che nessuno può rileggere sono sei modi di pubblicare testo sbagliato senza accorgersene.

Convenzioni consolidate, da rispettare:
- **en** è inglese britannico.
- La terminologia dell'interfaccia è allineata ai manuali: il campo data si chiama **«Data di Partenza»** sia nelle impostazioni bot (`botModal.startDateLabel`) sia nel wizard iniziale (`setup.step4Label`). Erano due nomi diversi per la stessa cosa fino alla 2.1.8, che li ha unificati.

Controllo di parità delle chiavi:

```bash
node scripts/check-locales.mjs
```

---

## Struttura

```
src/
├── main/                  # processo principale Electron
│   ├── index.ts           # ciclo di vita app, finestra, auto-updater, istanza singola
│   ├── ipc.ts             # tutti gli handler IPC + validazione degli input
│   ├── crypto.ts          # cifratura token: safeStorage → AES-256-GCM machine-key
│   ├── logger.ts          # log su file + batch verso il renderer, redazione token
│   ├── database/schema.ts # schema SQLite e catena delle migrazioni (v1→v12)
│   └── bot/
│       ├── engine.ts      # ciclo di polling, coda di pubblicazione, digest, quiet hours
│       ├── manager.ts     # CRUD bot/feed, storico, import/export .rtb
│       ├── parser.ts      # RSS/Atom, pulizia HTML, validazione anti-SSRF
│       ├── telegram.ts    # invio messaggi, retry, FloodWait
│       └── youtube.ts     # canali YouTube via InnerTube (nessuna API key)
├── preload/index.ts       # bridge contextBridge — l'unica superficie main↔renderer
├── renderer/src/          # interfaccia React
└── shared/types.ts        # tipi condivisi tra i due processi
```

Il modello è **producer-consumer**: `checkLoop()` scarica i feed e accoda i job, `processPublishQueue()` li consuma e invia su Telegram. I due lati non si aspettano a vicenda.

---

## Cosa è utile e cosa no

**Contributi benvenuti**
- Correzioni di bug con una descrizione di come riprodurli.
- Test: non esistono, e le funzioni pure ad alto rischio sono poche e ben identificate — `parseUtcTimestamp`, `isFeedDue`, `passesKeywordFilter`, `cleanSummary`, `validateFeedUrl`, `normalizeChannelId`, `validateTemplate`, il parser delle date YouTube.
- Il parser delle date YouTube riconosce oggi solo inglese e italiano: estenderlo ad altre lingue è un contributo autocontenuto e di valore reale (se InnerTube risponde in un'altra lingua, i video smettono di essere pubblicati senza segnalare nulla).
- Miglioramenti alla traduzione inglese da parte di madrelingua.
- Documentazione tecnica.

**Da concordare prima in una issue**
- Modifiche a `engine.ts`, `schema.ts` e `crypto.ts`.
- Nuove dipendenze: il progetto ne ha volutamente poche, e il bundle finale pesa ~80 MB anche grazie a questo.
- Cambi all'interfaccia: la grafica «Titan Blue» è una scelta autoriale, non un default in attesa di essere migliorato.

**Fuori perimetro**
- **Nuove lingue.** Il progetto è in italiano e inglese e ci resta: vedi «Traduzioni» qui sopra.
- Migrazione a un altro framework (Tauri è stato valutato e scartato: il backend andrebbe riscritto in Rust e `youtubei.js` non ha equivalenti maturi).
- **Installer ufficiali per macOS.** Il codice è cross-platform e su macOS compila e gira; quello che non c'è è la *distribuzione*, perché un `.dmg` senza avviso di Gatekeeper richiede un certificato Apple a pagamento che il progetto non ha motivo di mantenere. Chi usa macOS compila dal sorgente (servono Node 22 e Xcode Command Line Tools). Le pull request che aggiungono un target macOS alla CI non verranno accolte; quelle che correggono un bug che si manifesta *anche* su macOS, sì.
- Telemetria, analytics, servizi cloud: l'applicazione funziona in locale e ci resta.

---

## Pull request

1. Un ramo per argomento, partendo da `main`.
2. `npx tsc --noEmit` deve passare pulito.
3. Descrivere **cosa** cambia e **perché**; se è un bugfix, come riprodurlo.
4. Commenti e messaggi di commit in italiano o inglese, indifferentemente. I commenti nel codice spiegano il *perché* di una scelta, non il *cosa* fa la riga — è lo stile del progetto, e vale la pena mantenerlo.
5. Le modifiche all'interfaccia vanno accompagnate dalle chiavi in italiano e in inglese, e `node scripts/check-locales.mjs` deve passare pulito.

## Sicurezza

Le vulnerabilità **non** vanno segnalate come issue pubbliche: vedi [SECURITY.md](SECURITY.md).
