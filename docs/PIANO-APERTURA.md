# Piano di apertura del sorgente — checklist operativa

**Aperto:** 12 agosto 2026
**Obiettivo:** ritirare Titan dal mercato, spostare il progetto su `Pitz72` come repository pubblico sotto licenza MIT, con build automatiche per Windows e Linux.
**Stato:** **Fase 1 chiusa e pushata** (12/08). **FASE 2 COMPLETA** (13/08): 2-bis lingue, 2-ter revisione dei manuali IT ed EN, 2-quater revisione della documentazione utente. Nessuna riserva aperta, nessun residuo commerciale. Prossimo passo: le decisioni aperte qui sotto, che sbloccano la Fase 3. Questo file si aggiorna a ogni sessione e va spostato in `docs/storico/` quando tutte le voci sono chiuse.

> **Una fase per sessione.** Regola dell'utente, 13/08: ogni fase si esegue in una sola sessione, e se ne serve più d'una va bene. Due fasi nella stessa sessione, no.

> **Come si legge.** Le fasi sono in ordine di dipendenza, non di importanza: invertirle rompe qualcosa. Le voci marcate ⛔ sono blocchi veri — se le salti, un utente reale ne subisce le conseguenze.

---

## Decisioni già prese

| Decisione | Esito | Quando |
| :--- | :--- | :--- |
| Licenza | **MIT** | 12/08 |
| Correzioni al codice prima dell'apertura | **Tutte** | 12/08 |
| Riorganizzazione documentale | **Completa** | 12/08 |
| Credito LLM + paternità | **Sì**, in software e documentazione | 12/08 |
| Destinazione del repository | **`Pitz72`**, pubblico | 12/08 |
| Repository ponte delle release | **Traghetto per la migrazione, poi cancellata** | 12/08 |
| macOS | **Fuori.** Nessun installer ufficiale; chi vuole compila dal sorgente | 12/08 |
| Linux | Tutte le varianti sensate, **Fedora/rpm inclusa** | 12/08 |
| snap e flatpak | **Fuori** dal primo giro (store ed ecosistemi separati) | 12/08 |
| Donazioni e contatti | PayPal + pagina contatti, in app e nel README | 12/08 |

## Decisioni ancora aperte

- [ ] **Come spostare la repo su `Pitz72`**: trasferimento nativo GitHub (preserva storia, tag, issue, stelle e lascia un redirect) oppure repo nuova con push della storia (perde redirect, issue e stelle). *Serve prima della Fase 4.*
- [ ] **Nome della repo di destinazione**: mantenere `Runtime-TelegramBot-Desktop-Titan-Edition` o accorciarlo. Se cambia, cambiano tutti i link nella documentazione e in `docs.ts`.
- [x] ~~**Dove vivono i 2 manuali PDF**~~ — **sciolta il 13/08: committati nella repo.** Pesano 9,0 MB l'uno invece dei 32 di prima, e tenerli versionati accanto ai sorgenti Typst evita che PDF e sorgente divergano. Nulla vieta di allegarli **anche** alla release.
- [ ] **Quanto tempo lasciare alla finestra di migrazione** prima di cancellare la ponte.
- [ ] **Se pubblicare una v2.1.8 anche sulla ponte** con i soli fix, o aspettare di avere anche i manuali rifatti e fare una sola release.

---

## FASE 1 — Chiudere il lavoro già fatto ✅ CHIUSA

Committata il 12 agosto 2026. `npx tsc --noEmit`, `npx vite build` e `scripts/check-locales.mjs` passano puliti sul working tree finale, e nessuno dei tre commit lascia uno stato intermedio rotto (verificato: il commit 1 non referenzia chiavi o file introdotti dopo).

- [x] Rivedere il diff completo
- [x] `git rm --cached .claude/settings.local.json` — è tracciato ma già in `.gitignore`, e in una repo pubblica non ci deve stare (contenuto innocuo, solo permessi locali)
- [x] Commit 1 — correzioni di sicurezza e bug → `c4313f3`
- [x] Commit 2 — licenza MIT, riorganizzazione documentale, CI → `e0f8447`
- [x] Commit 3 — credito LLM, donazioni e contatti → `2e21e77`
- [x] Push su `origin/main` — 12/08, `a83fc4a..682a28a`

### Cosa contiene, per memoria

**Sicurezza e bug**
- `logger.ts` — redazione dei token dai log, dalla console e dai log esportati
- `index.ts` — istanza singola (due processi = doppie pubblicazioni sul canale), filtro di schema su `setWindowOpenHandler`
- `telegram.ts` + `engine.ts` — `escapeUrl()` blinda gli URL dei feed dentro gli `href`
- `parser.ts` — anti-SSRF esteso (IPv6, IP decimali/esadecimali, CGNAT, `.local`) + risoluzione DNS pre-fetch
- `BotSettingsModal.tsx` — il salvataggio non fallisce più in silenzio

**Traduzioni** — 15 chiavi `updater.*` mancanti in DE/ES/FR/RU/ZH, più `botModal.errorSave`, `credits.*`, `support.*`. Rimossa la chiave morta `app.version`. Tutte e 8 le lingue a **237 chiavi identiche**, verificate da `scripts/check-locales.mjs` che gira anche in CI.

**Progetto** — `LICENSE` MIT (EULA archiviata), `CONTRIBUTING.md`, `SECURITY.md`, `docs/README.md`, `docs/database.md`, `docs/storico/`, `docs/idee/`, template issue, job CI `verify` su pull request, residui macOS rimossi da `electron-builder.yml` e `build/`.

---

## FASE 2 — Manuali e documentazione ✅ COMPLETA (12/08 il grosso, chiusa il 13/08)

✅ **La riserva è sciolta** dalle Fasi 2-bis, 2-ter e 2-quater (13/08). Il testo qui sotto resta come resoconto di quel che fu.

⚠️ **La riserva, com'era.** Le sezioni nuove (2.4, 2.5, 8.2, la voce «istanza singola» del cap. 9, i piedi delle 16 guide brevi) sono **testo scritto ex novo direttamente in 8 lingue**, non traduzioni di un originale già revisionato. **Non sono passate dal protocollo di revisione severa** usato a luglio (vedi `GitHub/ProtocolloManuale` e la memoria `sessione-2026-07-07-revisione-globale`). Meccanicamente i PDF sono corretti e verificati; la qualità della prosa in DE/RU/ZH/PT/ES/FR non è stata controllata da nessuno. **Prima di pubblicare gli 8 PDF serve una passata di revisione dedicata.**

La toolchain è installata e collaudata end-to-end: Typst 0.14.2, pandoc 3.9, PowerShell 7.6, Pillow 12.2.

### 2.1 — Vignette ✅

- [x] Ricampionare le 9 vignette a 2000px, qualità 82, progressive — **28,78 → 5,70 MB (−80%)**, 299 DPI a 170 mm di larghezza
- [x] Confronto a video di una pagina prima/dopo per ogni capitolo — confrontato il ritaglio al 100% contro l'originale ridotto a 2000px senza ricompressione, su tutte e 9. Indistinguibili, retini a mezzatinta compresi

Misurato su una copia: vignette **28,8 → 5,5 MB**, PDF italiano **32,0 → 8,8 MB**, tutti e 8 **258 → ~70 MB**. Confronto visivo già fatto su una pagina: indistinguibile. Sono illustrazioni al tratto, il caso in cui il JPEG rende meglio, e a 2000px su A4 si resta sopra i 300 DPI.

### 2.2 — Sorgenti dei manuali ✅

Il colophon conteneva l'EULA: tutti e 8 i PDF pubblicati dicevano «Tutti i diritti riservati» e vietavano la riproduzione. **Risolto.**

- [x] `strings.typ` × 8 lingue — `rights` → MIT; `repro` → riscritta per licenza libera; `credits` → più il credito LLM. Aggiunto «Desktop» anche in `trademark`
- [x] `lib/manuale-template.typ` — nome canonico «Runtime TelegramBot **Desktop** · Titan Edition» in **5** punti, non 4: copertina, frontespizio, colophon, titolo del documento PDF, intestazione corrente. Copertina 30 → 21 pt e frontespizio 30 → 26 pt, altrimenti il nome più lungo sfondava la pagina
- [x] `manuale.typ` — `VERSIONE` = `2.1.8`
- [x] ~~Capitolo 02 × 7 lingue~~ — **la voce era basata su una premessa sbagliata.** Il capitolo 02 documenta il *Setup Wizard* e riportava fedelmente la sua etichetta (`setup.step4Label`). L'incoerenza era **dentro l'applicazione**: il wizard diceva «Data di Partenza», le impostazioni bot «Data di Filtro (Cutoff)». Su decisione dell'utente si è unificato su **«Data di Partenza»**: cambiato `botModal.startDateLabel` nelle 8 lingue e allineati i capitoli 03/04/06 in tutte e 8. Il capitolo 02 non andava toccato
- [x] Contenuto mancante — scritto ex novo in 8 lingue: **§2.4** schermata di benvenuto (guida rapida, download PDF, donazione), **§2.5** schermata «Novità» dopo un aggiornamento, **§8.2** documentazione integrata nelle impostazioni. Performance Mode è slittata da 8.2 a 8.3. ⚠️ *Questa è la prosa non revisionata di cui sopra*
- [x] Riga sull'istanza singola nel capitolo 09 — aggiunta in tutte e 8 le lingue
- [x] Nessun capitolo dà per scontato un acquisto. Trovato e corretto un residuo: «Scarica il file fornito dal tuo amministratore» → «Scarica l'installer dalla pagina delle release del progetto. In alternativa puoi compilarlo tu dal codice sorgente»

### 2.3 — Guide brevi ✅ (completata il 13/08)

- [x] 8 guide in-app — `src/renderer/src/assets/guides/guide-*.md`
- [x] 8 guide rapide — `docs/guide/quick-start-guide-*.md`
- [x] **I 2 leggimi (`LEGGIMI_PER_PRIMO.txt`, `READ_ME_FIRST.txt`) riscritti da zero il 13/08.** Gli altri 6 non esistono più. Voce originale, per memoria: ⛔ **NON FATTI.** Sono ancora quelli del pacchetto commerciale e cominciano con «Grazie per aver acquistato». **Da riscrivere da zero**: la bozza preparata il 12/08 non è stata applicata ed è andata persa con la sessione. Sono l'ultimo residuo esplicito della fase di vendita. Cosa devono contenere: licenza MIT e sorgente pubblico, istruzioni di installazione per Windows/Linux (macOS solo da sorgente), avviso SmartScreen riformulato senza «sicuro al 100%», nota che l'auto-update non vale per deb/rpm/pacman, rimando alla guida in-app e al manuale PDF, credito LLM e paternità, contatti e donazione. UTF-8 senza BOM, terminazioni CRLF
- [x] Nelle 16 fatte: piede con licenza MIT, credito LLM e paternità, contatti e donazione; tolto il rimando al «Manuale d'Uso **Pro**»; allineata l'etichetta della data di partenza

### 2.4 — Compilazione e verifica ✅

- [x] `pwsh typst/build.ps1 -All` — 8 PDF su 8, nessun errore. **Rifatto il 13/08 dopo le Fasi 2-bis e 2-ter: 2 PDF su 2, 33 pagine ciascuno**
- [x] Verifica programmatica: nessuna formula di riserva dei diritti, nome prodotto canonico, versione 2.1.8, licenza MIT citata, credito LLM presente. **Tutti superati**, sia sugli 8 del 12/08 sia sui 2 del 13/08
- [x] Verifica a video di copertina, frontespizio e colophon per tutte e 8 le lingue, più una pagina con vignetta. Il nome più lungo entra ovunque
- **Peso: 258 → 72,4 MB** (9,0 MB a lingua, 9,4 per il cinese)

⚠️ **Gli 8 PDF ricompilati non furono committati** il 12/08, di proposito: andavano rifatti dopo la revisione della prosa, e committarli due volte avrebbe lasciato 144 MB nella storia. ✅ **Chiuso il 13/08**: fatta la revisione e ridotte le lingue a due, i 2 PDF definitivi sono in `HEAD` (vedi Fase 2-quinquies). Si rigenerano in qualsiasi momento con `pwsh typst/build.ps1 -All`.

#### Difetti tipografici visti e non corretti

- **PT**: nel colophon, «modificá-los» spezzato a fine riga produce un doppio trattino («modificá-» + «-los»). Va sistemato a mano nel testo o disattivando la sillabazione su quel blocco
- **PT e RU**: il titolo nel colophon va a capo con sillabazione («Avan-çado», «поль-зователя»). Tollerabile, ma non elegante
- Colonna giustificata stretta: la sillabazione è aggressiva in italiano («per inte-ro», «copy-right»). Preesistente, accentuata dal testo più lungo

---

## FASE 2-BIS — Da otto lingue a due ✅ ESEGUITA IL 13/08

**Decisione dell'utente del 13 agosto 2026: il progetto è in italiano e inglese e basta.** L'italiano è la sorgente, l'inglese la traduzione. Francese, tedesco, spagnolo, portoghese, russo e cinese escono dal software, dalla documentazione e dai manuali.

Questa fase **scioglie la riserva della Fase 2**: la prosa nuova non revisionata stava in sei lingue che nessuno nel progetto può rileggere. Ritirandole, l'unica prosa nuova da revisionare è quella italiana e inglese, che è verificabile.

**Cancellati**
- [x] `Manuale Utente Avanzato/{fr,de,es,pt,ru,zh}/` — 54 capitoli
- [x] I 6 PDF corrispondenti in `typst/`
- [x] `src/renderer/src/locales/{fr,de,es,pt,ru,zh}.json`
- [x] `src/renderer/src/assets/guides/guide-{fr,de,es,pt,ru,zh}.md`
- [x] `docs/guide/quick-start-guide-{fr,de,es,pt,ru,zh}.md` e i 6 «leggimi» `.txt`

**Codice**
- [x] `I18nContext.tsx` — due sole traduzioni. Chi aveva salvato una lingua ritirata viene portato **in inglese**, non in italiano, e la preferenza morta viene riscritta
- [x] `IntroScreen.tsx` — `flagsList` a due voci; `ui/Flags.tsx` — via i 6 componenti bandiera inutilizzati
- [x] `lib/docs.ts` — `GUIDES` e `MANUAL_FILES` a due voci
- [x] `lib/releaseNotes.ts` — via i blocchi delle 6 lingue da `2.1.6` e `2.1.7`: `Record<Language, …>` non compilava più
- [x] `ErrorBoundary.tsx` — il dizionario d'emergenza scende a due voci
- [x] `scripts/check-locales.mjs` — `LANGS = ['it','en']`

**Manuale (toolchain Typst)**
- [x] `lib/strings.typ` — da 8 blocchi a 2 (161 → 53 righe)
- [x] `build.ps1` — `$FileNames` e il ciclo `-All` a due lingue
- [x] `build-typst.py` — via l'hack delle virgolette tedesche e le etichette dei callout nelle 6 lingue
- [x] `lib/manuale-template.typ` — via la catena di font CJK, che serviva solo all'edizione cinese

**Documentazione**
- [x] `README.md` (badge, sezione «Lingue», albero, tabella), `CONTRIBUTING.md` (sezione «Traduzioni» riscritta, nuove lingue messe fuori perimetro), `docs/README.md`, `CHANGELOG.md`
- [x] Le quattro frasi nei manuali IT/EN che dicevano «otto bandiere» / «tra otto disponibili», le due nelle guide rapide e le due nei «leggimi»

**Non toccati di proposito:** `docs/changelogs/` e `docs/storico/`. Sono archivi: registrano che *all'epoca* le lingue erano otto, ed è vero. Riscriverli sarebbe falsificare la storia del progetto.

**Verifiche** — `npx tsc --noEmit`, `npx vite build`, `node scripts/check-locales.mjs` (237 chiavi × 2) e `pwsh typst/build.ps1 -All` passano tutti puliti. I due PDF sono stati ricompilati: 33 pagine, 9,4 MB ciascuno, colophon MIT, versione 2.1.8, nessuna formula di riserva dei diritti.

✅ **I 2 PDF sono stati committati il 13/08** (vedi Fase 2-quinquies), una volta sola come previsto, sciolta la decisione sulla loro collocazione. In `HEAD` non ci sono più i vecchi da 32 MB col colophon EULA.

---

## FASE 2-TER — Revisione severa dei manuali ✅ ESEGUITA IL 13/08

Prima l'italiano, poi l'inglese con l'italiano come riferimento assoluto di traduzione. **Scioglie la riserva della Fase 2 su entrambe le lingue.**

### Italiano

Pipeline di [[manuale-registro-stile]]: `prosa-italiana` → `humanizer` come passata finale. Nove capitoli, 5022 parole.

**Stato di partenza, misurato** — la disciplina di luglio aveva tenuto: 0 avverbi in *-mente*, 2 soli trattini lunghi, 0 `...` al posto di `…`, caporali coerenti.

**Verifica dei fatti contro il codice** (una revisione severa controlla anche i numeri). Tutti confermati: digest 60/360/720/1440/10080 min = «1 ora, 6, 12, 24 ore o 7 giorni»; `slice(0, 20)` = «fino a 20 contenuti»; `INTERVAL_PRESETS` 5→1440 = «da 5 minuti a 24 ore»; slider bot `min=1 max=120`; `summary` tagliato a 300 caratteri; pausa di 3 s fra gli invii; statistiche ogni 30 s. Tutte le etichette citate combaciano con `it.json`.

**Corretto — prosa e lessico**
- «L'installazione è semplice» → tolta: annuncia invece di fare, e l'elenco sotto lo dimostra
- «Titan Edition è leggero» → «gira su»: claim non sostenuto in un capitolo di requisiti che non dà cifre
- «un parametro importante» e «ignorerà **e scarterà**» → tolti: valutazione vuota e dittologia
- «Non è un'etichetta qualsiasi: è…» → parallelismo negativo tolto (ne resta uno solo, in apertura di manuale, dove lavora)
- «funziona **benissimo**», «è **potente** e distruttivo», «riassunto **essenziale**» → intensificatori vuoti
- «Vediamoli.» → signposting tolto
- «schermata a tutto campo» → «a piena pagina»: *a tutto campo* in italiano non vuol dire *a schermo intero*
- «con il collegamento alla donazione e a quello dei contatti» → accordo rotto, riscritto
- Doppio due punti nella stessa frase (cap. 4.3), «ti accoglie» ripetuto, «Cloud» maiuscolo
- L'unica coppia di trattini lunghi del manuale, sciolta senza perdere il senso

**Corretto — titoli inflazionati** (toccano l'indice; rispecchiati anche in inglese, vedi sotto)
- Cap. 7 «Portabilità e Sicurezza **(L'Ecosistema OmniSync)**» → «Portabilità e Sicurezza». *OmniSync* non esiste nel software, è vocabolario solo documentale, e il capitolo descrive tre meccanismi, non un ecosistema. Il nome resta dov'è definito, in 7.2
- §1.2 «L'ecosistema «sotto il cofano»» → «Come lavora, sotto il cofano»

**Corretto — tipografia del template** (bug vero, non di prosa)
`lib/strings.typ`: `rule-label` e `repro` avevano apostrofi **dritti**. Sono stringhe letterali Typst, quindi lo smartquote non le tocca e finivano dritte nel PDF («REGOLA D'ORO», «L'unico obbligo»). L'apostrofo curvo va scritto a mano nel sorgente. Corretto sul blocco `it`.

**Non toccato, di proposito:** le liste `- **Etichetta.** spiegazione`, i grassetti sulle etichette d'interfaccia e le emoji dei colori di log. Sono convenzioni da manuale di riferimento: la regola humanizer che le vieta è tarata su saggistica e blog, e appiattirle toglierebbe la scansionabilità che il registro chiede.

**Verificato sul PDF, non sui `.md`** (lezione di luglio). 33 pagine, 9,4 MB: 112 apostrofi curvi, 1 dritto e 4 virgolette dritte, tutti dentro campioni di codice. 1 trattino lungo, nel separatore del colophon. 0 avverbi in *-mente*. Colophon MIT, versione 2.1.8, nessuna formula di riserva dei diritti.

### Inglese

Stessa cura, con l'italiano come riferimento assoluto. Baseline anch'essa buona: **zero grafie americane** (l'inglese è britannico), zero lessico-LLM, zero filler, zero copula evitata.

**Bug di contenuto, il più grave della sessione.** §7.3 diceva che l'esportazione globale è **«in JSON format»**. Il codice salva `titan-bots-backup-*.rtb` ([ipc.ts:394](../src/main/ipc.ts)). L'errore era stato corretto sull'italiano a luglio e **mai riportato sull'inglese**: è rimasto sbagliato per un mese in tutti i PDF pubblicati.

**Divergenze strutturali dall'italiano, tutte sanate**
- Cap. 2: l'immagine del Setup Wizard era **orfana in fondo al capitolo**, dopo la §2.5. Riportata sotto il titolo 2.3, dove serve
- Cap. 3: l'immagine della console log stava in coda alla §3.2. Spostata prima dell'elenco dei colori, accanto a ciò che descrive
- §8.1: i due paragrafi erano in ordine invertito rispetto all'italiano
- Nessun file inglese aveva il separatore `---` di fine capitolo

**Prosa** — rispecchiate tutte le correzioni italiane: «is lightweight», «Installation is straightforward», «an important setting», «ignore **and** discard», «It is more than a label: it is…», «works **fine**», «**powerful** and destructive», «**essential** summary», «Let's look at them», «Cloud» maiuscolo, l'accordo rotto in §8.2, i due titoli inflazionati (cap. 7 e §1.2) e la coppia di trattini lunghi. In più, specifici dell'inglese: un terzo trattino lungo in §7.1 e la coda in *-ing* di §4.3 («cleans up whatever you paste, **stripping**… and **adding**…»), riscritta con i due punti come in italiano.

**Fedeltà verificata a macchina:** confronto blocco per blocco fra i nove capitoli italiani e inglesi — titoli, paragrafi, immagini, elenchi puntati e numerati con il conteggio delle voci. **Le nove sequenze combaciano una a una.**

**Verificato sul PDF:** 33 pagine, come l'italiano. 23 coppie di virgolette curve bilanciate, 33 apostrofi curvi, **zero apostrofi dritti**; le 4 virgolette dritte residue stanno nei campioni di codice. 1 trattino lungo, nel separatore del colophon. Nessuna grafia americana. Colophon MIT, versione 2.1.8, nessuna riserva dei diritti.

### Stato

Entrambi i PDF sono stati ricompilati e **committati il 13/08** (Fase 2-quinquies): 9,0 MB l'uno, al posto dei 32 col colophon EULA.

---

## FASE 2-QUATER — Revisione della documentazione utente ✅ ESEGUITA IL 13/08

Sei file, due lingue: i 2 «leggimi» del pacchetto, le 2 guide rapide di `docs/guide/` e le 2 guide in-app. Riferimento: il Manuale Utente Avanzato, appena revisionato. **Chiude la voce 2.3 e con essa la Fase 2.**

### I 2 «leggimi» — riscritti da zero

Erano ancora quelli del pacchetto commerciale. Cominciavano con «Grazie per aver acquistato Runtime TelegramBot Titan Edition. Hai appena sbloccato l'automazione multi-canale definitiva». Rifatti su tutti i punti previsti:

- Licenza MIT e URL del sorgente pubblico
- Installazione Windows (.exe), Linux (.deb e .AppImage, con la nota su `libfuse2`), macOS **solo da sorgente** e senza installer previsto
- **SmartScreen riformulato.** Il vecchio testo diceva «Il file che hai scaricato è SICURO al 100% e privo di malware»: un'affermazione che chi la scrive non può garantire e che chi la legge non ha modo di verificare. Ora spiega che l'avviso riguarda il *certificato di firma*, non il contenuto, e indica la via di verifica vera: il sorgente è pubblico e compilabile
- **Aggiornamento automatico:** vale per Windows e `.AppImage`, **non per il `.deb`**. Corretta anche la descrizione del flusso: il vecchio testo parlava di un «Toast», ma dalla 2.1.5 è una schermata dedicata che chiede conferma prima di scaricare e prima di riavviare
- Rimando alla guida in-app e al manuale PDF, con la precisazione che il PDF non è nell'installazione ma viene preso dalla rete
- Credito LLM e paternità, contatti, donazione, «Titan è gratuito e resta gratuito»
- 109 righe ciascuno, **UTF-8 senza BOM, CRLF puro** (verificato: 109 CRLF, 0 LF isolati)

⚠️ Il piano prevedeva la nota «l'auto-update non vale per deb/rpm/pacman». Oggi `electron-builder.yml` produce **solo AppImage e deb**: rpm e pacman sono decisi ma non ancora configurati (Fase 3). I leggimi descrivono quel che si distribuisce davvero. **Vanno riaperti quando si aggiungono i target.**

### Le 4 guide rapide — errori di fatto trovati

- **Impostazioni di Sistema, in entrambe le quick-start:** dicevano «Generale — intervallo di check globale, quiet hours, lingua». Falso: intervallo di controllo e fasce di silenzio sono impostazioni **del singolo bot**. Riscritte con il contenuto reale della scheda, più una riga che dice dove stanno davvero
- **Guide in-app, §4:** «Clicca sull'icona **Impostazioni (⚙️)**» per aprire le impostazioni del bot. Falso: l'ingranaggio apre le impostazioni **di sistema**; quelle del bot stanno sull'icona a cursori (🎚️)
- **Guide in-app, «Cambio PC»:** «un file sicuro da importare nel nuovo PC, mantenendo le tue password crittografate». Falso e fuorviante: il token **non** sopravvive al trasferimento, ed è il punto centrale del capitolo 7.2. Riscritto
- Etichette stantie: «+ Aggiungi Feed» e «+ Aggiungi Sorgente» → **Aggiungi**; «Analytics (📊)» → l'icona a grafico che apre **Statistiche Dettagliate**; «Backup» → **Dati e Backup**; «Digest Mode / Filtro Keyword / Intervallo Personalizzato» → i nomi usati dal manuale

### Le 4 guide rapide — prosa

Tolto il residuo di voce commerciale: «in meno di 3 minuti», «Vuoi che i tuoi post siano formattati in modo perfetto?», «Sei pronto.», «la comoda pulsantiera», «niente panico», «attendi un **nostro** aggiornamento software» (non c'è più un «noi» commerciale: il sorgente è pubblico). **Da 4 punti esclamativi per lingua a zero.** Nome del prodotto uniformato alla forma canonica nei titoli. Grafie americane corrette: *Customizing*, *recognize*, *center*.

**Corsivo nelle guide in-app.** Il parser di `GuideModal.tsx` gestisce `**grassetto**`, `` `codice` `` e i link, **ma non il corsivo**: tre passaggi per lingua uscivano a schermo con gli asterischi in chiaro (`*Canale News*`). Risolti dal lato testo — caporali in italiano, virgolette in inglese — senza toccare il codice. Verificato: zero corsivi residui.

**Verifiche:** `npx tsc --noEmit`, `npx vite build` e `check-locales` puliti dopo le modifiche.

---

## FASE 2-QUINQUIES — Peso del repository ✅ ESEGUITA IL 13/08

Domanda dell'utente: perché i PDF non erano ancora committati, e se i vecchi occupano spazio perché non toglierli.

**La prima risposta è che la regola era scaduta.** Il piano diceva di non committare i PDF *perché andavano rifatti dopo la revisione della prosa*. Finita la revisione, quel motivo non esisteva più: restava solo la decisione aperta sulla loro collocazione, ora sciolta.

**Misurato prima di toccare.** `HEAD` pesava **95,8 MB su 261 file**, così ripartiti:

| | |
| :--- | :--- |
| 64,0 MB | i **due vecchi PDF IT/EN da 32 MB**, quelli col colophon EULA |
| 18,6 MB | `docs/storico/manuali-v1.7/` — 8 manuali v1.7 + 4 whitepaper commerciali |
| 5,7 MB | le vignette, che servono: sono sorgenti del manuale |

**Fatto**
- [x] Committati i 2 PDF nuovi: **64,0 → 18,0 MB**. Colophon MIT, 33 pagine, revisionati
- [x] Rimossa `docs/storico/manuali-v1.7/` — **18,6 MB** di rendering di un testo che resta per intero in `docs/storico/manuale-v1.7.md`, che è la memoria vera. Sei delle otto lingue non esistono più nel progetto. `docs/storico/README.md` spiega cosa c'era e come ripescarlo dalla storia

**Risultato: `HEAD` da 95,8 a 30,9 MB, −65 MB.**

### La storia git resta com'è, ed è una scelta

I blob vecchi restano nel pack: `.git` sta sui 250 MB, di cui ~69 MB di PDF (i due da 31,5 MB — IT e RU — pesano da soli 63). Ripulirli davvero vuol dire riscrivere la storia con `git filter-repo` e **fare force-push**, il che cambia lo SHA di tutti i 123 commit.

**Non fatto, di proposito.** Chi clona scarica comunque il pack intero, quindi il beneficio è reale, ma il prezzo lo è altrettanto: rompe ogni clone esistente, invalida i 40 tag di release, e va deciso **prima** di scegliere come spostare la repo su `Pitz72` (il trasferimento nativo preserva la storia — quella che c'è). È una decisione da Fase 4, non un ripensamento da fine sessione.

---

## FASE 3 — La build 2.1.8, che fa da traghetto

⛔ **Va costruita solo dopo che la repo di destinazione esiste** (Fase 4.1–4.2), perché il suo `app-update.yml` viene generato dalla configurazione di publish e deve già puntare alla destinazione nuova.

- [ ] `electron-builder.yml` → `publish` verso la repo nuova
- [ ] ⛔ **`src/renderer/src/lib/docs.ts` — `MANUAL_BASE`** oggi è un URL fisso alla ponte. Se non lo sposti, il pulsante «Scarica manuale» si rompe anche per chi *ha* aggiornato, nel momento in cui cancelli la ponte
- [ ] ⛔ I 2 PDF (IT, EN) caricati nella nuova posizione **prima** che la 2.1.8 esca, altrimenti il punto sopra punta nel vuoto
- [ ] `package.json` — `homepage`, `repository`, `bugs` verso la destinazione nuova
- [ ] `src/renderer/src/lib/links.ts` — `SOURCE_URL` aggiornato
- [ ] Tutti i link nella documentazione che puntano a `Ecosystem-Runtime`
- [ ] `version` a `2.1.8` in `package.json`
- [ ] ⛔ **Entry `2.1.8` in `src/renderer/src/lib/releaseNotes.ts`** — se manca, la schermata «Novità» mostra il testo generico invece dell'elenco
- [ ] `CHANGELOG.md` — la sezione «Non ancora rilasciato» diventa `v2.1.8`, più `docs/changelogs/CHANGELOG_v2.1.8.md`. **Da citare fra le novità: il campo della data ora si chiama «Data di Partenza» anche nelle impostazioni del bot** (prima era «Data di Filtro (Cutoff)»); è una stringa visibile che cambia sotto agli occhi degli utenti esistenti
- [ ] I manuali sono già impostati sulla versione **2.1.8**: se la versione che si rilascia cambia, `typst/manuale.typ` va aggiornato. In ogni caso i 2 PDF vanno ricompilati, perché `strings.typ` è cambiato con la Fase 2-bis
- [ ] Build e **pubblicazione sulla vecchia repo ponte** (serve il secret `RELEASE_TOKEN` riconfigurato sulla repo nuova): è lì che le installazioni esistenti vanno a cercare l'aggiornamento

---

## FASE 4 — GitHub

### 4.1 Trasferimento
- [ ] Decidere il metodo (vedi decisioni aperte)
- [ ] Spostare la repo su `Pitz72`
- [ ] Riconfigurare i secret di Actions: **non si trasferiscono**. Serve solo `RELEASE_TOKEN`, e solo per la release-traghetto; dopo si usa il `GITHUB_TOKEN` integrato
- [ ] Decidere che fare del branch `claude/heuristic-swanson-148248` (lavoro antibot YouTube della 2.0.3): tenere o cancellare
- [ ] Verificare che i 40 tag siano arrivati

### 4.2 Pubblicazione
- [ ] Rendere il repository **pubblico**
- [ ] Descrizione, argomenti (`telegram-bot`, `rss`, `electron`, `youtube`, `automation`), sito
- [ ] Verificare che GitHub riconosca la licenza MIT
- [ ] Abilitare le issue e verificare che i template compaiano
- [ ] Verifica finale: nessun segreto nella storia. **Già eseguita il 12/08 su tutti e 119 i commit** — token Telegram, `ghp_`, `github_pat_`, `gho_`, `AKIA`, chiavi PEM, `sk-`: zero riscontri. Nessun `.env`, `.db` o file di credenziali mai tracciato. Da ripetere solo se nel frattempo si committa altro

### 4.3 CI — matrice di build completa
- [ ] Windows x64 — NSIS installer + portable
- [ ] Linux x64 — AppImage, deb, **rpm**, pacman, tar.gz (installare `rpm` e `fakeroot` sul runner)
- [ ] Linux arm64 — runner arm64, gratuiti sulle repo pubbliche. La parte delicata è `better-sqlite3` compilato per arm64
- [ ] Publish verso la repo stessa con `GITHUB_TOKEN`
- [ ] Mantenere Node 20: `better-sqlite3` non ha prebuild per 22/24 e la build Windows si rompe. È già successo
- [ ] Mantenere il job `verify` su pull request
- [ ] ⚠️ **Documentare che l'auto-updater funziona solo su Windows e AppImage.** `deb`, `rpm` e `pacman` non si auto-aggiornano: è un limite di electron-updater. Senza dirlo, è il primo malinteso che arriverà nelle issue
- [ ] Nessun target macOS

---

## FASE 5 — Dismissione della fase commerciale

- [ ] **Gumroad** — rimuovere il prodotto da `pizzisimone.gumroad.com/l/telegrambot`
- [ ] **Sito Ecosystem** (`GitHub/SITI-WEB/ECOSYSTEM`) — sostituire acquisto e prezzo con il link alla repo pubblica; sistemare la landing di Titan, `products-manifest.json`, i locale it/en e l'URL offuscato in base64 del manuale
- [ ] Verificare che nessun materiale promozionale prometta ancora un prodotto a pagamento
- [ ] ⛔ **Solo dopo la finestra di migrazione: cancellare `Ecosystem-Runtime/runtime-telegrambot-releases`.** Chi non ha aperto l'app in quella finestra resta alla 2.1.7 per sempre: dopo la cancellazione non esiste redirect per gli asset di release

---

## Verifiche di chiusura

- [ ] Installare l'ultimo installer su una macchina pulita e verificare: primo avvio, creazione di un bot, pubblicazione reale su un canale
- [ ] Verificare l'aggiornamento automatico da 2.1.7 a 2.1.8 su un'installazione reale — è il punto che, se sbagliato, non si può correggere a posteriori
- [ ] Verificare che il pulsante «Scarica manuale» funzioni **dopo** la cancellazione della ponte
- [ ] Verificare i pulsanti di donazione e contatti dalla schermata iniziale e dalle impostazioni
- [ ] Clone pulito della repo pubblica → `npm install` → `npm run build`: deve funzionare senza nulla di locale
- [ ] Spostare questo file in `docs/storico/`

---

## Cose note e volutamente non fatte

Documentate nell'audit del 12/08 (`docs/storico/AUDIT-2026-08-12-pre-opensource.md`), classificate come medie o lievi. Nessuna è bloccante; sono qui perché non vadano perse.

- **Zero test.** È l'unico impegno della roadmap di marzo mai chiuso. Indicato in `CONTRIBUTING.md` come il contributo più utile, con l'elenco delle funzioni pure da cui partire
- **Font caricati da Google CDN** — l'applicazione contatta Google a ogni avvio. Da self-hostare
- **Parser delle date YouTube solo EN/IT** — se InnerTube risponde in un'altra lingua i video smettono di essere pubblicati, in silenzio. Segnalato come contributo autocontenuto
- **`dangerouslySetInnerHTML` nell'anteprima dei template** — mitigato dalla CSP, ma resta una superficie
- **`sendMessage` azzera `aborted` a ogni chiamata** — oggi mascherato dal fatto che `stop()` svuota la mappa dei client
- **N+1 nell'import `.rtb`** — una `SELECT` per ogni feed disattivato, invece di usare `lastInsertRowid`
- **Redirect HTTP non ri-validati anti-SSRF** — scelta deliberata: bloccarli romperebbe i feed che fanno `http`→`https`. Dichiarato in `SECURITY.md`
- **Scansione ancora seriale tra bot** — parallela solo sui feed RSS dentro lo stesso bot
- **Il parser markdown di `GuideModal.tsx` non gestisce il corsivo `*testo*`** — mostra gli asterischi letteralmente. Nelle guide in-app ci sono 4 righe per lingua che ne fanno uso (es. «(es. *Canale News*)»), quindi l'utente vede gli asterischi a schermo. Lo stesso parser rende i link `[testo](url)` come testo non cliccabile, scartando l'indirizzo: per questo il piede delle guide in-app riporta gli URL in chiaro. Trovato il 12/08, non corretto
- **`productName` non si tocca mai.** Da quella stringa deriva la cartella `userData`: cambiarla azzera bot, feed, storico e token di ogni utente esistente. Scritto in `CONTRIBUTING.md` e in `docs/database.md`
