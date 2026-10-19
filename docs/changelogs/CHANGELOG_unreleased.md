# Non rilasciato — revisione tecnica, di sicurezza e di licenze

**Stato:** nel ramo `main`, non ancora pubblicato come release.

## Overview

Lettura integrale del codice (main process, preload, renderer, build, CI) con una domanda sola: cosa succede quando le cose vanno male. Ne sono uscite tre criticità gravissime, sei gravi, dieci medie e una manciata di lievi. Sono tutte corrette; quelle lievi che riguardano solo testi dell'interfaccia sono chiuse nella riprogettazione grafica che segue, dove quei componenti sono stati riscritti.

Ogni correzione al motore è stata provata su una build pacchettizzata, con un profilo dati separato, un bot finto e un feed pubblico: mai sui bot e sui dati veri.

## Gravissime

- **Runtime fuori supporto.** Titan girava su Electron 32, senza correzioni di sicurezza da oltre un anno: `npm audit` elencava una quarantina di vulnerabilità note di Chromium ed Electron, tra cui aggiramenti dell'isolamento del contesto e del sandbox. Ora **Electron 44.9**. Il passaggio era bloccato da `better-sqlite3`, che andava ricompilato con `node-gyp` per ogni versione: la **13** è un modulo N-API con i binari precompilati nel pacchetto, quindi niente più compilazione, né in locale né in CI. Aggiornati anche `electron-updater` (6.8.9, avviso di fuga di credenziali nei redirect) ed `electron-builder` (26). Dipendenze di produzione: **0 vulnerabilità**.
- **Contenuti persi per sempre dopo un breve blackout di Telegram.** Dopo tre tentativi a pochi secondi l'uno dall'altro, un contenuto non inviato veniva marcato come pubblicato «per evitare un loop infinito»: due minuti di Telegram irraggiungibile e l'episodio non arrivava mai sul canale. In più il riconoscimento degli errori di rete cercava `ETIMEOUT`, mentre il codice vero è `ETIMEDOUT`. Ora ogni errore viene classificato (`flood`, `transient`, `config`, `rejected`): un guasto di rete lascia il contenuto nel feed e lo ripropone al giro successivo; token o canale sbagliati fermano gli invii del bot senza marcare nulla, finché l'utente non corregge; solo un messaggio che Telegram rifiuta anche senza anteprima viene saltato, dicendolo.
- **Il renderer poteva parlare con qualunque canale IPC.** Il preload esponeva `window.electron`, cioè `ipcRenderer` intero: nessun componente lo usava. Insieme all'anteprima dei template, che metteva nel DOM l'HTML così com'era — anche quello di un profilo `.rtb` ricevuto da altri — e all'assenza di un blocco sulla navigazione della finestra, era una catena da chiudere. Tolto `window.electron`, l'anteprima passa da un sanificatore che tiene solo i tag di Telegram, la finestra non naviga verso altri indirizzi, `webview` e permessi del browser sono negati.

## Gravi

- **Cambiare token o canale a motore acceso non aveva effetto.** Il client Telegram era in cache per id del bot: i messaggi continuavano ad andare al canale vecchio fino al riavvio del motore. Ora il client si rinnova se token o canale cambiano, e la coda di invio rilegge la configurazione del bot al momento dell'invio.
- **Fermare e riavviare il motore durante una scansione** lasciava viva la vecchia catena di pianificazione accanto alla nuova: due scansioni e due consumatori della coda in parallelo. Ora ogni avvio apre una «generazione» e tutto ciò che appartiene a quella precedente si ferma da sé.
- **Una data di partenza illeggibile pubblicava l'intero arretrato.** `itemTime < NaN` è sempre falso: con una data rotta (per esempio da un `.rtb` modificato a mano) ogni contenuto del feed superava il filtro. Ora la data viene validata all'ingresso (IPC e import) e, se illeggibile, il bot viene sospeso con un errore che spiega cosa correggere.
- **Database illeggibile = processo fantasma.** Se `titan.db` non si apriva, l'eccezione arrivava prima della finestra: Titan restava un processo invisibile e il blocco di istanza singola impediva perfino di rilanciarlo. Ora compare un messaggio con il percorso del file e l'indicazione dei backup automatici.
- **Immagini dei feed in forma di oggetto.** rss-parser restituisce alcuni campi come oggetti o array; l'oggetto arrivava fino all'invio, dove `url.trim()` falliva. Ora si estrae solo un URL http(s) vero, qualunque forma abbia il campo.
- **Errori dell'interfaccia in silenzio.** Aggiungere un feed con un indirizzo rifiutato, creare un bot con un dato non valido, completare il wizard: l'errore restava una promise rifiutata nel vuoto e il modulo non diceva perché non salvava. Ora l'errore compare, con il messaggio scritto per l'utente.

## Medie

- **Profilo `.rtb` singolo senza ore di silenzio:** importandolo, il bot tornava a pubblicare a qualunque ora.
- **Il log di un'app accesa per giorni** finiva tutto nel file del giorno di avvio; «Esporta log» salvava quel file invece di quello di oggi, e la pulizia dei log vecchi non girava mai. Ora il file segue la giornata. Le righe, scritte in parallelo, uscivano anche fuori ordine: ora passano in fila.
- **Doppio clic su un `.rtb`:** l'installer registra l'estensione, ma l'app ignorava il file. Ora chiede conferma, importa e aggiorna l'elenco.
- **Digest oltre il limite di Telegram:** venti titoli lunghi superavano i 4096 caratteri, l'invio veniva rifiutato e il digest restava bloccato per sempre. In più, oltre il ventesimo, i contenuti in coda sparivano senza essere mai pubblicati. Ora il messaggio ha un tetto e chi non ci sta aspetta il digest successivo.
- **Intervallo per feed più breve di quello del bot:** un feed a 5 minuti su un bot a 15 veniva letto comunque ogni 15. Ora il giro parte con la frequenza del feed più frequente.
- **Anti-SSRF aggirabile con IPv6:** `http://[::ffff:127.0.0.1]/` passava, perché il parser URL lo riscrive in forma esadecimale. Ora l'IPv6 si legge per valore (mapped, compatibile, NAT64, multicast). L'hanno trovato i test.
- **Avvio del motore lento a rispondere:** la chiamata aspettava la fine del primo giro, e l'interfaccia restava su «spento» anche un minuto. Ora risponde subito (6 ms misurati) e il giro corre in sottofondo.
- **Import di profili dalle impostazioni:** il messaggio chiedeva di ricaricare l'interfaccia a mano. Ora l'elenco si aggiorna da sé.
- **Dialoghi nativi solo in italiano** e, da Electron 43, sempre aperti su Download: ora seguono la lingua dell'interfaccia e ricordano l'ultima cartella.
- **Chiave `.machine-key` danneggiata:** bloccava la creazione e il salvataggio di ogni bot. Ora viene messa da parte e rigenerata.

## Lievi

- Più contenuti nuovi nello stesso giro uscivano sul canale dal più recente al più vecchio; ora in ordine cronologico, come già la coda delle ore di silenzio.
- La pagina non dichiarava la lingua (`<html lang>`), che i lettori di schermo usano per la pronuncia.
- `npm run dev` era rotto da sempre: `mergeConfig` di Vite concatena gli array e i formati del main diventavano `['es','cjs']`. In più lo sviluppo cercava `ELECTRON_RENDERER_URL`, variabile che il plugin non imposta. Ora funziona, con la ricarica a caldo.
- `dist-electron` accumulava i chunk delle build precedenti, e l'installer li impacchettava.
- Il CHANGELOG indicava come versione attuale la 2.1.9; `logger.ts` riesportava tipi da un percorso inesistente; due dipendenze non erano usate da nessuno (`@phosphor-icons/react`, `@electron-toolkit/preload`).

## Professionalità

- **Test automatici** (Vitest, 63 casi): regole del motore, anti-SSRF, escape, classificazione degli errori di Telegram, digest, sanificazione, validatore dei template. Le regole del motore vivono ora in `src/main/bot/rules.ts`, senza dipendenze da Electron, proprio per poterle provare.
- **Licenze di terze parti nell'installer:** Vite toglieva dal bundle gli avvisi di copyright che MIT, ISC, BSD e Apache chiedono di conservare. `scripts/third-party-notices.mjs` genera `resources/THIRD-PARTY-NOTICES.txt` a ogni build (55 pacchetti, tutti permissivi) e ferma la build se entra una licenza copyleft.
- **CI su Node 22 LTS** (Node 20 è fuori supporto da aprile 2026), con test e controllo delle licenze.
- **`TITAN_USER_DATA_DIR`:** profilo dati alternativo per provare una build senza toccare i bot veri.
- Finestra con misura minima (880×600), sotto la quale l'interfaccia sarebbe tagliata.

## Rinviato, con motivo

- **`safeStorage` asincrono.** Electron 45 depreca l'API sincrona e la 46 la rimuove. Su Electron 44 funziona senza avvisi; la migrazione tocca la cifratura di tutti i token e va provata sui portachiavi Linux (GNOME, KDE) prima di pubblicarla. Annotata in CONTRIBUTING come condizione per salire alla 46.
- **Toolchain di sviluppo** (Vite 5, Tailwind 3): restano avvisi di `npm audit` che riguardano solo gli strumenti di build e il server di sviluppo, non l'app distribuita. Il passaggio a Vite 8 e Tailwind 4 è un lavoro a sé.

## Riprogettazione grafica e accessibilità

Interfaccia rifatta da capo su un design system blu («Titan Blue»): superfici blu notte, un solo accento blu, Inter e Fira Code inclusi nell'app (niente più Google Fonts a ogni avvio), corpo del testo a 14 px e nessun testo sotto i 12 (prima c'erano etichette a 9 px in maiuscoletto monospace).

- **Struttura più logica.** Il comando del motore sta nella barra in alto, con lo stato e l'ora del prossimo giro: il motore è uno solo per tutti i bot, e prima il pulsante sembrava accendere solo quello selezionato. A sinistra l'elenco dei bot, al centro l'intestazione del bot con le statistiche, sotto sorgenti e attività affiancate (o a schede, sotto i 1180 px).
- **Moduli in finestre proprie**: nuovo bot, nuova sorgente e impostazioni del bot (quattro schede: Generale, Pianificazione, Messaggi, Avanzate). Eliminare un bot sta nelle sue impostazioni, non più in un cestino che compariva solo al passaggio del mouse.
- **Accessibilità WCAG 2.2 AA**, autovalutata e documentata in [docs/accessibilita.md](../accessibilita.md): 0 violazioni axe-core su oltre venti stati dell'interfaccia, 65 coppie di colori misurate (`npm run check:contrast`, anche in CI), navigazione completa da tastiera con focus visibile, finestre di dialogo con trappola del focus ed Esc, ingrandimento dell'interfaccia dall'80 al 180% (anche Ctrl +/−/0) salvato tra un avvio e l'altro, riduzione delle animazioni, regole per il contrasto elevato di Windows.
- Testi dell'interfaccia riscritti in italiano e in inglese; `check:locales` ora verifica anche che ogni chiave usata nel codice esista. Corretti i testi fissi rimasti in italiano o in inglese (validatore dei template, «Fatto», «From:», segnaposto, «Feed rimosso»).
- Banco di prova `npm run preview:ui`: l'interfaccia vera nel browser con dati finti, per lavorare sul design senza Electron e senza toccare dati reali.

## Novità

- **Avvio silenzioso, bot per bot.** Ci sono chat e canali che non gradiscono il messaggio «🟢 … Online» a ogni avvio del motore. Finora l'unico modo per evitarlo era un trucco: spegnere il bot, avviare il motore e riaccenderlo dopo un po'. Ora c'è un interruttore in *Impostazioni del bot → Generale → Avvio silenzioso*: quel bot parte e lavora come gli altri, ma senza annunciarsi. Il log lo dice («🤫 Avvio silenzioso: nessun messaggio nel canale»), l'intestazione del bot lo mostra, e nella scheda Messaggi il modello di avvio avverte che non verrà inviato. L'impostazione viaggia nei profili `.rtb`. Schema del database **v13**, con backup automatico prima della migrazione; chi aggiorna continua a ricevere l'annuncio finché non lo spegne. La regola sta in `rules.ts` (`startupMessage`) ed è coperta da test.
- **Schermata d'ingresso animata.** Il logo entra a fuoco dentro un'orbita in prospettiva che si disegna, passa dietro la piastrella e davanti; un satellite la percorre per un giro e un quarto lasciando una scia e si ferma accanto al logo, poi un riflesso attraversa la piastrella. Il titolo sale parola per parola, «Titan Edition» si stringe da una spaziatura larga, il resto arriva in sequenza. Tutto finisce in meno di quattro secondi e poi resta fermo (WCAG 2.2.2: niente movimento infinito accanto ai controlli). Con «Riduci effetti» o la preferenza del sistema la schermata compare già composta: l'app aspetta di conoscere la preferenza salvata prima di disegnarla, altrimenti l'animazione sarebbe potuta partire e restare a metà.
- **Firma Runtime Utilities.** Titan è un software di Simone Pizzi per **Runtime Utilities**, non più «per Runtime Radio»: il marchio vettoriale ufficiale compare in fondo alla schermata d'ingresso (i cursori del mixer scivolano al loro posto) e nella scheda Informazioni, monocromatico e nel colore del tema, così regge anche il contrasto elevato di Windows. Aggiornati copyright, LICENSE, README, «leggimi» e il maintainer dei pacchetti Linux. I file originali del marchio sono in `branding/runtime-utilities/`.
- La schermata d'ingresso, quando non entrava nella finestra (finestra piccola o interfaccia ingrandita), tagliava la parte alta senza poterci tornare: il contenuto era centrato con `items-center` dentro un contenitore che scorre. Ora è centrato quando c'è spazio e scorre dall'inizio quando non c'è.
- **Chiudere la finestra non ferma più i bot senza dirlo.** Fino alla 2.3 la X chiudeva Titan, motore compreso: un clic distratto e tutti i canali smettevano di pubblicare. Ora, a motore acceso, Titan chiede se continuare nell'area di notifica o chiudere, e può ricordare la risposta. In *Impostazioni → Generale → Avvio e chiusura* si sceglie cosa fa la X (chiedere, area di notifica, chiudere), si fa partire Titan **con il computer** (nell'area di notifica, senza finestra; su Windows con il registro di avvio, su Linux con lo standard XDG `~/.config/autostart`) e si fa partire **il motore da solo all'apertura**: insieme, Titan riprende a pubblicare dopo ogni riavvio senza che nessuno apra la finestra. L'icona nell'area di notifica mostra lo stato e ha i comandi essenziali (apri, avvia/ferma, controlla adesso, esci); rilanciare Titan riporta la finestra. Un aggiornamento da installare chiude comunque l'app senza domande.
- **Prova il bot.** Un pulsante, nelle impostazioni del bot, nella creazione di un bot nuovo e al terzo passo della procedura guidata, chiede a Telegram se il token è valido, se la destinazione esiste e se il bot può pubblicarci (in un canale serve un amministratore con il permesso «Pubblica messaggi»). Non scrive nulla nel canale. Usa i valori del modulo, quindi si prova prima di salvare. Prima questi errori si scoprivano solo avviando il motore e leggendo il diario. Il token non compare mai nei messaggi d'errore. Le regole sui permessi stanno in `rules.ts` (`postingRight`), con i test.
- **Controlla adesso.** Un giro immediato su tutte le sorgenti attive, anche quelle con l'intervallo non ancora scaduto, dalla barra in alto o dall'area di notifica; poi il calendario riparte da lì. Non apre mai un secondo giro accanto a uno in corso (avvio compreso): in quel caso lo dice. Prima l'unico modo era fermare e riavviare il motore, che rimandava i messaggi di avvio.
- **Pubblicazione senza suono.** Per bot, in *Pianificazione*: con il suono (come prima), sempre senza suono, o senza suono in una fascia oraria che può scavalcare la mezzanotte. Gli iscritti ricevono i messaggi come sempre, ma il telefono non suona (`disable_notification` di Telegram). Vale per contenuti, riepiloghi e messaggio di avvio. Stesse colonne della migrazione v13, che non era ancora stata rilasciata; viaggia nei profili `.rtb`.
- **Il diario recupera ciò che è successo prima di lui.** Con il motore avviato all'apertura, o al lavoro mentre la finestra era chiusa, le righe arrivavano prima che il diario esistesse e restavano solo nel file. Ora il main conserva le ultime 2000 righe e il diario le riprende quando si apre, con l'ora del prossimo giro giusta.
- La procedura guidata del primo avvio aveva lo stesso difetto di scorrimento della schermata d'ingresso (parte alta irraggiungibile a finestra bassa): corretto.
- Banco di prova: `?reduce` apre l'interfaccia con le animazioni ridotte, `?autostart` con il motore già acceso all'apertura; «Prova il bot» ha esiti finti pilotabili dal nome (`bad` nel token, `missing` o `member` nel canale).