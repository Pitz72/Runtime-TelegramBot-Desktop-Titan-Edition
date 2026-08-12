# Contribuire a Runtime TelegramBot Desktop — Titan Edition

Grazie per l'interesse. Il progetto è nato come applicazione commerciale a sviluppatore singolo ed è stato aperto nell'agosto 2026: il codice è maturo e in produzione, quindi la barra per le modifiche al motore è deliberatamente alta, mentre traduzioni, documentazione, test e correzioni puntuali sono benvenuti.

*Read this in English? The codebase comments and this guide are in Italian; issues and pull requests in English are perfectly welcome.*

---

## Come è stato scritto questo codice

Vale la pena saperlo prima di leggerlo, perché spiega diverse cose che altrimenti sorprendono.

Il codice è stato scritto facendo un **uso massiccio di modelli linguistici**: Google **Gemini**, dalla 2.5 alla 3.1, e Anthropic **Claude**, da Sonnet 4.6 a Opus 5. Gran parte di ciò che leggi l'hanno prodotta loro.

Il concetto, la visione, la direzione progettuale, la definizione di ogni dettaglio funzionale e la caccia ai bug sono di **Simone Pizzi**, che ha progettato, diretto e verificato ogni parte del programma. I modelli hanno scritto il codice; le decisioni sono state tutte sue.

Tre conseguenze pratiche per chi contribuisce:

1. **I commenti spiegano il *perché*, non il *cosa*.** Sono lunghi, discorsivi e spesso citano l'incidente concreto che ha portato a scrivere quella riga in quel modo (`// NON usare includes('or') — "or" è contenuto in "giorno"`). Non sono rumore: sono la memoria del progetto, e sono la ragione per cui è ancora manutenibile. Se aggiungi codice, adotta lo stesso registro.
2. **Le stranezze apparenti di solito non lo sono.** Il fallback all'anno 2000 sulle date YouTube, il throttle di 5 secondi tra un canale e l'altro, i tre `try/catch` annidati nel consumer della coda: ognuna di queste cose è la cicatrice di un bug reale, spesso costato settimane. Prima di semplificare, cerca il commento o il changelog che la spiega.
3. **Il codice è stato generato, ma non è stato accettato a scatola chiusa.** Ogni comportamento è stato verificato sul campo su canali Telegram veri, con feed veri. Una pull request che "sembra giusta" ma non è stata provata contro un feed reale è difficile da accettare — dillo esplicitamente se non hai potuto testarla.

---

## Ambiente di sviluppo

Serve **Node.js 20** (non 22, non 24 — vedi sotto) e gli strumenti di compilazione nativi della propria piattaforma, perché `better-sqlite3` viene ricompilato in fase di installazione.

```bash
git clone https://github.com/Ecosystem-Runtime/Runtime-TelegramBot-Desktop-Titan-Edition.git
cd Runtime-TelegramBot-Desktop-Titan-Edition
npm install
```

Su Linux serve anche `libsecret-1-dev` (per il keychain OS) e `libfuse2` (per costruire l'AppImage):

```bash
sudo apt-get install -y libsecret-1-dev libfuse2
```

### Verificare una modifica

```bash
npx tsc --noEmit    # type check — deve passare pulito
npx vite build      # build dei bundle main/preload/renderer
npm run build       # build completa + installer via electron-builder
```

---

## Trappole del progetto — leggere prima di toccare il codice

Sono comportamenti non ovvi, tutti verificati sul campo. Ignorarli fa perdere ore.

### `npm run dev` corrompe `dist-electron/`

Il dev server di `vite-plugin-electron` costruisce il main process **due volte**; la seconda passata, in watch mode, perde `lib.formats: ['cjs']` ed emette ESM dentro un file `.cjs`. Con `"type": "module"` in `package.json` Node lo carica come CommonJS e l'app muore con `SyntaxError: Cannot use import statement outside a module`.

- Il bug riguarda **solo** il dev server: `npm run build` e `npx vite build` producono CJS corretto, e gli installer non ne sono mai stati affetti.
- Se capita: rigenerare con `npx vite build` ripristina un `dist-electron/main/index.cjs` valido.
- Riconoscerlo: il file corrotto **non** è minificato e contiene `import`; quello buono è minificato e inizia con `"use strict"` + `require`.
- Il fix "definitivo" via `watch.exclude` in `vite.config.ts` è già stato tentato tre volte senza successo. Non ritentarlo senza una diagnosi nuova.

Per lavorare, il ciclo consigliato è `npx vite build` + avvio dell'app, non il dev server.

### `productName` non si tocca

In `electron-builder.yml`, `productName: Runtime Telegram Bot Titan Edition` **non coincide** con il nome commerciale del prodotto, e va bene così. Da quella stringa Electron deriva il percorso della cartella `userData`:

- Windows — `%APPDATA%\runtime-telegram-bot-titan-edition\`
- Linux — `~/.config/runtime-telegram-bot-titan-edition/`

Lì dentro vivono `titan.db`, `.machine-key` e `titan-settings.json`. Cambiare `productName` significa che ogni utente esistente, al primo avvio della versione nuova, trova l'applicazione vuota: niente bot, niente feed, niente storico, token persi. Non è recuperabile dall'interfaccia.

### `releaseNotes.ts` prima di ogni build

`src/renderer/src/lib/releaseNotes.ts` deve contenere l'entry della versione che si sta costruendo. Se manca, la schermata «Novità» mostrata dopo l'aggiornamento cade sul testo generico invece dell'elenco delle modifiche.

### Node 20, non oltre

Il tentativo di portare la CI a Node 24 ha rotto la build Windows: `better-sqlite3` non ha prebuild per quella versione, `node-gyp` va in errore e Visual Studio non viene rilevato sul runner. Il warning «Node 20 deprecato» che compare nelle GitHub Actions riguarda il runtime delle *action* (checkout, setup-node, cache), lo gestisce GitHub e **non** si risolve cambiando `node-version`.

### Le migrazioni del database sono il codice più pericoloso

`src/main/database/schema.ts` applica le migrazioni per `PRAGMA user_version`, dalla v1 alla v12, su database reali con anni di storico. Ogni migrazione è seguita da un *safety check* che verifica fisicamente l'esistenza delle colonne. Prima di modificare qualcosa lì:

- fare sempre un backup di `titan.db` e provare la migrazione su una copia;
- non riordinare né rinumerare i blocchi esistenti — si aggiunge in coda;
- le migrazioni legacy per-statement non sono transazionali: è una scelta consapevole, il safety check post-migrazione è la rete.

### Traduzioni: tutte e otto o nessuna

Le lingue supportate sono **8** (it, en, fr, de, es, pt, ru, zh) e i file in `src/renderer/src/locales/` devono avere **le stesse identiche chiavi**. `I18nContext` fa fallback sull'inglese per le chiavi mancanti, quindi una dimenticanza non rompe l'interfaccia — la lascia semplicemente in inglese, in silenzio, e passa inosservata a lungo.

Convenzioni consolidate, da rispettare:
- **pt** è portoghese europeo (pt-PT): *ficheiro*, *aplicação*, *ecrã*, *guardar*, *definições*, *transferir*.
- **en** è inglese britannico.
- La terminologia dell'interfaccia è allineata ai manuali: il campo data si chiama «Data di Filtro (Cutoff)» nelle impostazioni bot e «Data di Inizio» nel wizard iniziale — sono due cose diverse e non vanno uniformate.

Controllo di parità delle chiavi:

```bash
node -e "const l=['it','en','fr','de','es','pt','ru','zh'].map(x=>[x,require('./src/renderer/src/locales/'+x+'.json')]);const f=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'?f(v,p+k+'.'):[p+k]);const base=f(l[0][1]);for(const [n,d] of l){const k=f(d);console.log(n,k.length,base.filter(x=>!k.includes(x)))}"
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
- Miglioramenti alle traduzioni da parte di madrelingua.
- Documentazione tecnica.

**Da concordare prima in una issue**
- Modifiche a `engine.ts`, `schema.ts` e `crypto.ts`.
- Nuove dipendenze: il progetto ne ha volutamente poche, e il bundle finale pesa ~80 MB anche grazie a questo.
- Cambi all'interfaccia: la grafica «Titan Blue» è una scelta autoriale, non un default in attesa di essere migliorato.

**Fuori perimetro**
- Migrazione a un altro framework (Tauri è stato valutato e scartato: il backend andrebbe riscritto in Rust e `youtubei.js` non ha equivalenti maturi).
- **Installer ufficiali per macOS.** Il codice è cross-platform e su macOS compila e gira; quello che non c'è è la *distribuzione*, perché un `.dmg` senza avviso di Gatekeeper richiede un certificato Apple a pagamento che il progetto non ha motivo di mantenere. Chi usa macOS compila dal sorgente (servono Node 20 e Xcode Command Line Tools). Le pull request che aggiungono un target macOS alla CI non verranno accolte; quelle che correggono un bug che si manifesta *anche* su macOS, sì.
- Telemetria, analytics, servizi cloud: l'applicazione funziona in locale e ci resta.

---

## Pull request

1. Un ramo per argomento, partendo da `main`.
2. `npx tsc --noEmit` deve passare pulito.
3. Descrivere **cosa** cambia e **perché**; se è un bugfix, come riprodurlo.
4. Commenti e messaggi di commit in italiano o inglese, indifferentemente. I commenti nel codice spiegano il *perché* di una scelta, non il *cosa* fa la riga — è lo stile del progetto, e vale la pena mantenerlo.
5. Le modifiche all'interfaccia vanno accompagnate dalle chiavi in tutte e 8 le lingue (l'inglese come minimo; il resto si può chiedere in issue).

## Sicurezza

Le vulnerabilità **non** vanno segnalate come issue pubbliche: vedi [SECURITY.md](SECURITY.md).
