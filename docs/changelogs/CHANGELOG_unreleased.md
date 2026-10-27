# Non rilasciato — revisione del 27 ottobre 2026

Lavoro nato da un'analisi completa del codice della 2.4.1 e dagli appunti rimasti aperti dopo la 2.4. Diviso in blocchi; ogni blocco è un commit a sé.

## Blocco 1 — Dipendenze di esercizio e sicurezza

- **Electron 44.9.0 → 44.9.3.** La 44.9.0 aveva una vulnerabilità di livello alto ([GHSA-jr5w-w6x2-84p9](https://github.com/advisories/GHSA-jr5w-w6x2-84p9), certificati intermedi eMudhra compromessi). Conta più del solito: la build Windows non è firmata, e l'integrità degli aggiornamenti automatici dipende solo dalla connessione HTTPS verso GitHub.
- **electron-updater 6.8.9 → 6.8.11**, e correzioni di `npm audit` che non rompono nulla (`fast-uri`, `postcss-selector-parser`). Restano gli avvisi della sola catena di sviluppo (Vitest, Vite): non finiscono nell'installer e si chiudono con l'aggiornamento degli strumenti.
- **youtubei.js 17.0.1 → 17.2.0, con un adattamento senza il quale YouTube avrebbe smesso di pubblicare.** Dalla 17.2 la lista dei video di un canale contiene nodi `LockupView` invece di nodi `Video`: niente `title.text`, niente `published.text`. Presi così, tutti i video avevano data illeggibile, finivano sul ripiego dell'anno 2000 e venivano scartati dal filtro della data di partenza. Ora ogni elemento passa da `adaptLockupView` (in `rules.ts`, con 4 test); il ripescaggio dal memo, nato per la 17.0.1, resta come ultima risorsa. Verificato dal vivo con il vero `fetchYouTubeVideos` su un canale pubblico, per ID e per handle: 15 video con titolo e data veri.
- **Un titolo YouTube non può più diventare un oggetto.** Il ripiego `v.title?.text || v.title` usava l'oggetto Text quando il testo mancava.
- **I link aperti dall'interfaccia vanno nel browser solo se https**, come già faceva il canale IPC `open-external`. Il gestore delle finestre nuove lasciava passare anche http, e il commento diceva «stessa regola».

## Blocco 2 — Contenuti mai persi né ripubblicati

- **Importare un profilo `.rtb` non ripubblica più l'arretrato.** Il bot importato teneva la data di partenza del file ma non lo storico, che il profilo non porta: al primo giro mandava sul canale tutto ciò che i feed contenevano da quella data in poi. Sullo stesso computer il token si legge subito, quindi bastava reimportare un backup o fare doppio clic due volte sullo stesso file. Ora il bot importato **parte da adesso**. Vale per il singolo bot, per «tutti i bot» e per il doppio clic sul file.
- **Un profilo importato su un canale già servito resta spento.** Due bot attivi sullo stesso canale (anche scritto in forme diverse: `@Canale`, `t.me/canale`) pubblicherebbero ogni contenuto due volte. L'interfaccia lo dice con un avviso e indica quale bot pubblica già lì.
- **L'import di «tutti i bot» normalizza i valori** come quello del singolo bot: prima li validava e poi scriveva nel database quelli grezzi (un orario «25:99», un intervallo scritto come testo). Filtri, intervalli e digest dei feed fuori regola diventano «valore del bot» invece di arrivare tali e quali. Le due strade di import ora sono una funzione sola.
- **Un template con errori non si salva più.** L'editor segnava l'errore ma il salvataggio passava; poi Telegram rifiutava ogni messaggio, e il motore, per non ritentarlo all'infinito, segnava ciascun contenuto come pubblicato. Un `<b>` non chiuso bastava a perdere tutto ciò che usciva di quel tipo. Ora il salvataggio si ferma sulla scheda Messaggi e spiega perché.
- **E se Telegram rifiuta comunque un template personalizzato, il contenuto esce con il modello predefinito** invece di andare perso, e il diario dice di correggere il template. Lo stesso per il messaggio di avvio.
- **Spegnere il digest non fa più sparire i contenuti in coda.** Erano già segnati come pubblicati e il motore guardava solo i feed con il digest attivo: restavano in coda per sempre. Ora partono subito, in un ultimo digest.
- **Digest e messaggio di avvio rispettano le ore di silenzio.** Un digest giornaliero poteva arrivare alle tre di notte, e con l'avvio insieme al computer anche l'«Online».
- **Salvare le impostazioni non sposta più indietro la data di partenza.** Il modulo rimandava sempre la data come solo giorno, cioè mezzanotte UTC: una data con l'ora (bot importati, bot di versioni vecchie) tornava indietro fino a un giorno, e i contenuti di quella mezza giornata ancora nei feed partivano al giro dopo. Ora la data si manda solo se l'utente la cambia. Il campo legge anche il formato con lo spazio di SQLite, che prima restava vuoto.
- **I contenuti senza titolo non si bloccano più a vicenda.** Il segnaposto «No Title» entrava nella deduplica per titolo come un titolo vero: dopo il primo, ogni contenuto senza titolo dello stesso bot veniva scartato come già pubblicato. Succede con Mastodon e i microblog, dove nessun post ha titolo. Ora il titolo è l'inizio del testo (`itemTitle`), e un titolo vuoto non entra nella deduplica. Se un feed di questo tipo era già in uso, al primo giro possono uscire i post che erano rimasti bloccati, purché successivi alla data di partenza.
- **Niente più grassetti vuoti o buchi nei messaggi** quando un segnaposto non ha valore (`tidyMessage`).
- **I contenuti esclusi dal filtro per parole chiave si contano in una riga sola per feed**, invece di una riga per contenuto a ogni giro.

Verifica: 25 test nuovi (100 in tutto), tra cui l'import dei profili e il digest del motore su un database SQLite vero in una cartella temporanea. Nel banco di prova dell'interfaccia, un template con un tag non chiuso blocca il salvataggio; tornando al predefinito si salva.

## Blocco 3 — Rete robusta

È il lavoro concordato il 19/10 dopo che sette podcast erano andati in errore insieme (cinque timeout nello stesso secondo, due ECONNRESET) su feed che un minuto prima rispondevano in 6 secondi.

- **Un secondo tentativo sui feed.** Timeout, connessione caduta, DNS momentaneamente giù o server sovraccarico (5xx, 429): la lettura si ripete dopo 5 secondi. Se riesce, il diario lo dice con un avviso invece che con un errore. Un 404 o un XML rotto non si ritentano (`isTransientFetchError`).
- **Lo stesso feed si legge una volta per giro**, anche se lo usano più bot. Ognuno lo rileggeva per conto suo. La lettura condivisa vale solo per il giro in corso, quindi non serve mai un contenuto vecchio; ogni bot vede il contenuto con il nome che ha dato alla sua sorgente.
- **Al massimo tre letture parallele verso lo stesso server.** Le sei letture parallele restano, ma non più tutte verso Spreaker insieme.
- **Gli invii a Telegram hanno un tempo massimo di 45 secondi.** Telegraf ne aveva uno di 500: una connessione appesa (PC che si risveglia, Wi-Fi che cambia) teneva ferma per otto minuti a tentativo la coda di invio di tutti i bot. L'arresto del motore invece non interrompe una chiamata in volo: se il messaggio è già partito, l'esito va registrato, altrimenti al giro dopo uscirebbe due volte. Verificato con un server locale che non risponde: la richiesta si interrompe al tempo previsto ed è trattata come errore transitorio.
- **Controllo al risveglio.** Dopo una sospensione del computer, passati 30 secondi per dare tempo alla rete di tornare, Titan controlla tutte le sorgenti: prima il giro in calendario scattava subito al risveglio, spesso senza rete, e ogni sorgente aspettava il suo intervallo dopo l'errore. Se in quel momento un giro è in corso, riprova poco dopo.

Verifica: 9 test nuovi (109 in tutto) su ritentativi, lettura condivisa, tetto per server e tempo massimo degli invii.

## Blocco 4 — Dati, impostazioni e backup

- **Backup quotidiano del database.** Ogni giorno Titan salva da sé una copia del database nella cartella `backups` dei suoi dati e tiene le ultime sette. Prima l'unico backup automatico era quello che precede una migrazione dello schema: un disco che si rovina o un database danneggiato si portavano via bot, sorgenti e storico. Le copie si fanno con l'API di backup di SQLite, non copiando il file: con il WAL attivo il solo `titan.db` può non avere le ultime scritture. Nella scheda **Dati e backup** c'è una sezione nuova con il pulsante per aprire la cartella; per tornare a una copia si usa «Importa database».
- **Importare un database non può più lasciare Titan senza dati.** Se la sostituzione del file falliva (un antivirus che lo blocca, i permessi), il database attuale era già chiuso e ogni operazione falliva fino al riavvio. Ora il file scelto si copia prima accanto a `titan.db`, il database attuale si salva nella cartella dei backup, e se la sostituzione non riesce si riapre quello di prima. La copia del file scelto passa dall'API di backup: copiandolo e basta si perdevano le scritture ancora nel suo `-wal`. I `-wal` e `-shm` del database vecchio si tolgono prima della sostituzione, perché SQLite non provi ad applicarli a quello nuovo.
- **Il backup prima di una migrazione contiene davvero tutto**: prima della copia si fa il checkpoint del WAL. Dopo una chiusura non pulita, le ultime scritture stavano solo nel `-wal` e la copia del file principale non le aveva.
- **Le impostazioni non si perdono più.** Ogni punto che salvava (zoom, azione della X, avviso dell'area di notifica, novità della versione) leggeva, modificava e riscriveva il file per conto suo: due salvataggi vicini e l'ultimo cancellava il primo. Ora le modifiche passano in fila (`updateSettings`). La scrittura è atomica, da un file temporaneo: un'interruzione a metà lasciava un JSON troncato. E un file illeggibile non sparisce più in silenzio portandosi via l'avvio automatico del motore: si torna ai predefiniti, ma il file resta da parte e il motivo finisce nel log.
- **Gli errori fatali finiscono nel file di log**, scritti subito prima della chiusura. Prima andavano solo nella console, che nell'app installata nessuno vede. Anche gli errori non gestiti che non chiudono Titan ora restano nel diario.

Verifica: 7 test nuovi (116 in tutto) su impostazioni e backup, in cartelle temporanee.

## Blocco 5 — La lingua del motore

Chiude il problema noto registrato il 27/10: con l'interfaccia in inglese, parte del diario e la notifica di pubblicazione restavano in italiano.

- **Il diario parla la lingua dell'app.** Tutte le righe che il diario mostra, cioè avvisi ed errori del motore, dell'invio a Telegram e di YouTube, passano dai testi del main (`main/i18n.ts`), in italiano e in inglese. Anche gli errori che arrivano all'interfaccia: indirizzo di un feed non valido o verso una rete privata, profilo `.rtb` rotto, canale YouTube non trovato, database da importare non valido.
- **La notifica di sistema dice «Pubblicato: …» / «Published: …»** (prima «Inviato:» in ogni lingua).
- **La lingua si salva nelle impostazioni.** Il renderer la teneva solo nel suo `localStorage`, e il main la scopriva quando la finestra gliela comunicava: con il motore avviato insieme al computer, le prime righe e il menu dell'area di notifica uscivano nella lingua del sistema.
- **Modelli dei messaggi e digest nella lingua dell'app.** Con l'interfaccia in inglese i messaggi senza template dicono «Read the full article», «Listen to the episode», «Watch the video», e il digest «items», «Read», «… and N more». **In italiano non cambia un carattere**: un test confronta i modelli con quelli della 2.4.1.
- **L'interfaccia mostra i modelli predefiniti presi dal motore** (`get-default-templates`) invece di tenerne una copia propria in italiano, che con l'inglese non era più ciò che usciva sul canale. Il messaggio di avvio d'esempio porta il nome vero del bot.
- Le righe informative della console tecnica restano com'erano: sono diagnostica, non diario.

E un difetto dei test trovato strada facendo: con Electron 44.9.3 il pacchetto `electron`, importato fuori da Electron, scarica il binario se manca, e i test che importavano anche solo i testi del main restavano appesi. Ora i test usano un sostituto di Electron (`src/test-support/electron-stub.ts`, collegato in `vitest.config.ts`) e non dipendono più dal binario.

Verifica: 5 test nuovi (121 in tutto): stesse chiavi e stessi segnaposto in italiano e in inglese, modelli italiani identici alla 2.4.1, cambio di lingua.

## Blocco 6 — Stato delle sorgenti, code, storico, argomenti dei gruppi

Le quattro funzioni rimaste negli appunti della 2.4. Lo schema del database passa alla **v14** (con il solito backup automatico prima della migrazione).

- **Stato di ogni sorgente.** Sotto ogni sorgente attiva c'è l'esito dell'ultima lettura: «Letta il 27 ott, 11:46: 20 contenuti nel feed», oppure, in rosso, «Lettura non riuscita il …» con il motivo. Prima, per accorgersi che un feed non rispondeva più, bisognava cercarne il nome nel diario. L'elenco si aggiorna da solo a fine giro. Le sorgenti a riepilogo mostrano anche quanti contenuti aspettano il prossimo riepilogo.
- **Code visibili.** La finestra delle statistiche diventa **Attività del bot**, con tre schede. **In attesa** mostra cosa è stato trovato ma non è ancora uscito, e perché: in coda di invio adesso, rimandato dalle ore di silenzio, raccolto per il prossimo riepilogo. Ogni contenuto ha titolo, sorgente e ora.
- **Storico consultabile.** La scheda **Storico** elenca gli ultimi 100 contenuti registrati per il bot, dal più recente, con sorgente e ora. Comprende anche quelli raccolti per il riepilogo e quelli rifiutati da Telegram, perché anche quelli sono «già gestiti» e non ripartiranno.
- **Argomenti dei gruppi.** Nei gruppi Telegram con gli argomenti (forum) un bot può pubblicare in un argomento preciso invece che nel «Generale». Nelle impostazioni del bot c'è il campo **Argomento del gruppo**: il numero, oppure il link di un messaggio dell'argomento così come lo copia Telegram (`t.me/c/…/45`). **Prova il bot** controlla anche che il gruppo abbia gli argomenti attivi. L'argomento viaggia nei profili `.rtb`. Valgono per l'argomento anche il messaggio di avvio e i riepiloghi.

Verifica: 12 test nuovi (133 in tutto), tra cui la migrazione reale di un database costruito come quello della 2.4.1 alla v14, con i dati che restano al loro posto e il backup creato. Nel banco di prova: stato delle sorgenti (riuscita, errore, mai letta), le tre schede dell'attività, il campo dell'argomento con un valore sbagliato (errore annunciato) e con un link valido.

## Blocco 7 — Token con le API asincrone di safeStorage

Le API sincrone di `safeStorage` (`isEncryptionAvailable`, `encryptString`, `decryptString`) sono deprecate da Electron 45 e **spariscono nella 46**, insieme al backend sincrono di Chromium su cui poggiano ([breaking changes di Electron](https://www.electronjs.org/docs/latest/breaking-changes)). Titan le usava per ogni token, a ogni lettura di un bot. Senza questo passaggio, il primo aggiornamento a Electron 46 avrebbe reso illeggibili tutti i token.

- **I token si decifrano una volta, all'avvio**, con le API asincrone, e restano in memoria per il motore, che legge i bot a ogni giro in modo sincrono. A ogni salvataggio si cifrano di nuovo e la memoria si aggiorna. Prima ogni lettura di un bot rifaceva la decifratura.
- **Stesso portachiavi, stesso formato.** I token cifrati dalle versioni precedenti si leggono con le API nuove senza nessuna conversione. Quelli nei formati più vecchi (senza prefisso, delle versioni fino alla 1.10.1, o in chiaro, prima della 1.7.8) ora si riscrivono nel formato corrente subito all'avvio, invece che al primo salvataggio del bot. Lo stesso se il portachiavi segnala una chiave ruotata.
- Anche i token nei profili `.rtb` passano dalle API nuove, in esportazione e in importazione.
- Senza portachiavi (Linux senza `libsecret`) resta la chiave macchina, come prima.

Verifica: 8 test nuovi (141 in tutto) su un portachiavi simulato: andata e ritorno, formati vecchi riscritti all'avvio, token di un altro computer illeggibile senza errori, token aggiornato subito dopo il salvataggio, profilo `.rtb` esportato e reimportato con il token leggibile.

## Blocco 7 bis — Strumenti di sviluppo e CI

- **Vite 5 → 8** (Rolldown), **Vitest 3 → 5**, `@vitejs/plugin-react` 4 → 6, `vite-plugin-electron` 0.28 → 1.1. Chiude gli ultimi avvisi di `npm audit`, che erano tutti della catena di sviluppo: `tinypool` (critico), `@vitest/mocker`, `esbuild` del server di sviluppo. **`npm audit` ora dà zero vulnerabilità**, in esercizio e in sviluppo.
- **Una trappola evitata.** `vite-plugin-electron` 1.x impone al processo principale il nome `index.js`: con `"type": "module"` Node avrebbe letto come modulo ES un file CommonJS, e `package.json` avvia `index.cjs`. Titan non sarebbe partito. Il plugin `titan-main-cjs-only` ora impone anche il nome; il bundle esce di nuovo come `dist-electron/main/index.cjs`, CommonJS, con `electron` e `better-sqlite3` esterni. La configurazione usa le opzioni di Rolldown (`rolldownOptions`).
- **GitHub Actions alle versioni correnti**: `checkout` v7, `setup-node` v7, `cache` v6, `upload-artifact` v7, `download-artifact` v8, `action-gh-release` v3. Le v4 giravano su Node 20, deprecato, e GitHub le forzava su Node 24.
- **Tailwind resta alla 3.4**, di proposito. Non ha avvisi di sicurezza e la 3.4 è ancora mantenuta; il passaggio alla 4 cambia il modo di configurare i colori (dalla configurazione JS al CSS) e alcuni valori predefiniti (bordi, anelli di fuoco, ombre), cioè tocca ogni schermata di un'interfaccia appena verificata per il contrasto WCAG 2.2 AA. È un lavoro a sé, da fare con la sua verifica visiva.

Verifica sull'app vera, costruita con Vite 8 e avviata in Electron 44.9.3 con un profilo dati isolato (`TITAN_USER_DATA_DIR` in una cartella temporanea) e un bot finto con token inventato, pilotata via DevTools: database creato alla v14; token cifrato e decifrato dal portachiavi di Windows con le API asincrone, e di nuovo leggibile dopo un riavvio; argomento letto dal link `t.me/c/…/45/678`; due feed pubblici letti, con lo stato sotto le sorgenti; un 429 ritentato e poi registrato come errore tradotto; «Controlla adesso»; Telegram che rifiuta il token inventato, segnalato nel diario senza pubblicare nulla; backup quotidiano creato dopo un minuto.
