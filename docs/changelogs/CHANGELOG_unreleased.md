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

- **Test automatici** (Vitest, 51 casi): regole del motore, anti-SSRF, escape, classificazione degli errori di Telegram, digest, sanificazione, validatore dei template. Le regole del motore vivono ora in `src/main/bot/rules.ts`, senza dipendenze da Electron, proprio per poterle provare.
- **Licenze di terze parti nell'installer:** Vite toglieva dal bundle gli avvisi di copyright che MIT, ISC, BSD e Apache chiedono di conservare. `scripts/third-party-notices.mjs` genera `resources/THIRD-PARTY-NOTICES.txt` a ogni build (55 pacchetti, tutti permissivi) e ferma la build se entra una licenza copyleft.
- **CI su Node 22 LTS** (Node 20 è fuori supporto da aprile 2026), con test e controllo delle licenze.
- **`TITAN_USER_DATA_DIR`:** profilo dati alternativo per provare una build senza toccare i bot veri.
- Finestra con misura minima (880×600), sotto la quale l'interfaccia sarebbe tagliata.

## Rinviato, con motivo

- **`safeStorage` asincrono.** Electron 45 depreca l'API sincrona e la 46 la rimuove. Su Electron 44 funziona senza avvisi; la migrazione tocca la cifratura di tutti i token e va provata sui portachiavi Linux (GNOME, KDE) prima di pubblicarla. Annotata in CONTRIBUTING come condizione per salire alla 46.
- **Toolchain di sviluppo** (Vite 5, Tailwind 3): restano avvisi di `npm audit` che riguardano solo gli strumenti di build e il server di sviluppo, non l'app distribuita. Il passaggio a Vite 8 e Tailwind 4 è un lavoro a sé.
