# Piano di apertura del sorgente — checklist operativa

**Aperto:** 12 agosto 2026
**Obiettivo:** ritirare Titan dal mercato, spostare il progetto su `Pitz72` come repository pubblico sotto licenza MIT, con build automatiche per Windows e Linux.
**Stato:** **Fase 1 chiusa e pushata** (12/08). **FASE 2 COMPLETA** (13/08): 2-bis lingue, 2-ter revisione dei manuali IT ed EN, 2-quater revisione della documentazione utente. Nessuna riserva aperta, nessun residuo commerciale. **FASI 4.1 e 4.2 ESEGUITE** (13/08): la repo vive su `Pitz72`, è **pubblica**, con storia riscritta e ripulita. **FASE 3 CHIUSA** (13/08): link migrati, `MANUAL_BASE` non serve più i PDF con l'EULA, versione 2.1.8 con note di rilascio e changelog, CI che pubblica sulla repo stessa. **La release `v2.1.8` è pubblica**, e l'utente ci ha aggiornato sopra da un'installazione reale: l'auto-update funziona. **FASE 4.3 ESEGUITA** (13/08): matrice di build completa — Windows installer e portable, Linux AppImage/deb/rpm/pacman/tar.gz su **x64 e arm64** — collaudata su branch con **run verde su tutti e tre i runner**, e documentazione dell'auto-updater corretta perché la voce del piano era sbagliata. 🆕 **FASE 6 aperta**: quattro rifiniture della schermata iniziale segnalate dall'utente. ▶️ **Prossima sessione: FASE 6** (rifiniture, corta) **oppure FASE 5** (dismissione commerciale, sbloccata: `MANUAL_BASE` non punta più alla ponte). Questo file si aggiorna a ogni sessione e va spostato in `docs/storico/` quando tutte le voci sono chiuse.

> **Le fasi 4.1–4.2 sono state eseguite prima della 3.** Non è un'inversione: la Fase 3 lo prescrive da sempre nel suo primo rigo ⛔. La numerazione riflette l'importanza, non l'ordine di esecuzione.

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

- [x] ~~**Come spostare la repo su `Pitz72`**~~ — **sciolta il 13/08: repo nuova con push della storia.** La domanda dava per scontato un compromesso che non esisteva. Misurato prima di decidere: la repo di partenza era **privata, 0 stelle, 0 fork, 0 issue** (aperte o chiuse). Il trasferimento nativo esiste per preservare esattamente quelle cose, e il redirect di una repo privata non è mai stato visibile a nessuno. Non c'era nulla da perdere, e in cambio si è potuto scegliere *quale* storia pubblicare.
- [x] ~~**Nome della repo di destinazione**~~ — **sciolta il 13/08: invariato**, `Runtime-TelegramBot-Desktop-Titan-Edition`. Combacia col nome canonico del prodotto usato nei manuali e nel colophon dei 2 PDF appena committati, e non allunga la lista dei link da migrare in Fase 3.
- [x] ~~**Riscrivere la storia git**~~ — **sciolta ed eseguita il 13/08.** Era classificata «decisione da Fase 4» sul presupposto che riscrivere rompesse i cloni esistenti e i 40 tag. Con 0 fork su una repo privata mono-sviluppatore i cloni esistenti erano uno solo, e i tag si ricreano nel push. Vedi la Fase 4.1 qui sotto.
- [x] ~~**Dove vivono i 2 manuali PDF**~~ — **sciolta il 13/08: committati nella repo.** Pesano 9,0 MB l'uno invece dei 32 di prima, e tenerli versionati accanto ai sorgenti Typst evita che PDF e sorgente divergano. Nulla vieta di allegarli **anche** alla release.
- [x] ~~**Quanto tempo lasciare alla finestra di migrazione**~~ e ~~**se pubblicare una v2.1.8 anche sulla ponte**~~ — **entrambe sciolte il 13/08: nessuna finestra, nessuna release sulla ponte. Il traghetto non si fa.**

  Le due domande poggiavano su un presupposto mai verificato: che ci fosse qualcuno da traghettare. **Non c'è.** Dichiarazione dell'utente, che è l'unico a conoscere le vendite Gumroad: *nessuno ha mai comprato né installato il software, tranne lui.* I numeri della ponte concordano — una sola release, 3 download dell'`.exe`, 14 letture di `latest.yml` in cinque settimane, e **`latest-linux.yml` a zero**, cioè nessuna installazione Linux ha mai cercato un aggiornamento nella storia del prodotto.

  Il traghetto esisteva per non lasciare un cliente pagante bloccato alla 2.1.7. Senza clienti paganti è una macchina costruita per nessuno: si porta dietro un token da rigenerare, un passo di publish cross-organizzazione e una finestra di attesa prima di poter cancellare la ponte. Tutto per aggiornare il computer dell'autore, che può scaricare l'installer a mano.

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

⚠️ ~~Il piano prevedeva la nota «l'auto-update non vale per deb/rpm/pacman». Oggi `electron-builder.yml` produce **solo AppImage e deb**: rpm e pacman sono decisi ma non ancora configurati (Fase 3). I leggimi descrivono quel che si distribuisce davvero. **Vanno riaperti quando si aggiungono i target.**~~ — **riaperti e riscritti in Fase 4.3**, ora che i target ci sono tutti. E la nota prevista era comunque sbagliata: deb e rpm si aggiornano, chiedendo la password. Vedi la Fase 4.3.

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

### ~~La storia git resta com'è, ed è una scelta~~ — superata il 13/08

> Il testo originale diceva: *«I blob vecchi restano nel pack… Non fatto, di proposito. Rompe ogni clone esistente, invalida i 40 tag di release… È una decisione da Fase 4, non un ripensamento da fine sessione.»*
>
> **Era una decisione da Fase 4, e in Fase 4 è stata presa: la storia è stata riscritta.** Il ragionamento reggeva solo finché «rompe ogni clone esistente» significava qualcosa: con 0 fork su una repo privata, l'unico clone esistente era quello dell'autore. E scegliendo la repo nuova invece del trasferimento nativo, non è servito nessun force-push. Vedi Fase 4.1.
>
> Una cifra va corretta, perché era misurata male: il pack **locale** stava sui 250 MB, ma quello **del server** — l'unico che conta, perché è ciò che scarica chi clona — stava a 120,7 MB. Il locale era gonfiato da oggetti sciolti delle sessioni precedenti.

---

## FASE 3 — La build 2.1.8, la prima da progetto aperto ✅ ESEGUITA IL 13/08 (resta da lanciare la build)

> Si chiamava «*la build che fa da traghetto*». Il traghetto non c'è più: non aveva nessuno da traghettare. Quel che resta è una release normale sulla repo pubblica.

✅ **Il blocco è caduto il 13/08.** Diceva: *«va costruita solo dopo che la repo di destinazione esiste (Fase 4.1–4.2), perché il suo `app-update.yml` viene generato dalla configurazione di publish e deve già puntare alla destinazione nuova»*. La destinazione ora esiste ed è pubblica: **`https://github.com/Pitz72/Runtime-TelegramBot-Desktop-Titan-Edition`**. La fase è eseguibile per intero.

**Da sapere prima di cominciare**

✅ **Niente traghetto, quindi niente token.** Sciolta la decisione sulla ponte (vedi sopra), il passo «pubblicazione sulla vecchia repo ponte» sparisce, e con lui sparisce il `RELEASE_TOKEN`: serviva **solo** perché GitHub Actions scrivesse su una repo di un'altra organizzazione. La 2.1.8 esce sulla repo pubblica e basta, col `GITHUB_TOKEN` integrato. Nessun secret da creare, nessuna scadenza da ricordare.

🔴 **Da fare per prima, perché è già in mano al pubblico.** La cartella `manuals/` della ponte contiene **gli 8 PDF vecchi da 33 MB col colophon EULA**, ed è pubblica. `MANUAL_BASE` punta lì, quindi oggi il pulsante «Scarica manuale» consegna un documento che dice «Tutti i diritti riservati» e vieta la riproduzione, per un progetto MIT. È lo stesso materiale che la Fase 4.1 ha appena cancellato dalla storia git — cancellarlo di là e lasciarlo servito di qua non ha senso.

- Il `git clone` del README **è già stato spostato** su `Pitz72` (commit `c4c1f4a`): era l'unico link che, su una pagina pubblica, dava errore a chi lo copiava. Tutti gli altri restano da migrare qui
- Il link alla **pagina delle release** punta ancora alla ponte: va spostato anche quello, perché la 2.1.8 non uscirà lì

- [x] `electron-builder.yml` → `publish` verso la repo nuova — `owner: Pitz72`, `repo: Runtime-TelegramBot-Desktop-Titan-Edition`. È da qui che electron-builder genera `app-update.yml` dentro l'installer
- [x] 🔴 **`src/renderer/src/lib/docs.ts` — `MANUAL_BASE`** oggi punta a `manuals/` sulla ponte, cioè ai PDF con l'EULA. Va spostato sulla repo pubblica — **fatto.** Ora punta a `raw/main/Manuale%20Utente%20Avanzato/typst/`. I due nomi di file in `MANUAL_FILES` combaciavano già con quelli committati, quindi è bastato cambiare la base. Riverificato prima di toccare il codice: **HTTP 200** su entrambi
- [x] ~~⛔ I 2 PDF (IT, EN) caricati nella nuova posizione **prima** che la 2.1.8 esca~~ — **già soddisfatto senza fare nulla.** I PDF sono committati nella repo dalla Fase 2-quinquies, e da quando la repo è pubblica sono raggiungibili in `raw`: verificato il 13/08, **HTTP 200** e peso giusto (9.395.852 e 9.392.133 byte). Non c'è niente da caricare da nessuna parte; basta che `MANUAL_BASE` diventi:
  `https://github.com/Pitz72/Runtime-TelegramBot-Desktop-Titan-Edition/raw/main/Manuale%20Utente%20Avanzato/typst/`
- [x] `package.json` — `homepage`, `repository`, `bugs` verso la destinazione nuova
- [x] `src/renderer/src/lib/links.ts` — `SOURCE_URL` aggiornato
- [x] Tutti i link nella documentazione che puntano a `Ecosystem-Runtime` — `README.md` (pagina delle release), `CONTRIBUTING.md`, `docs/build.md` e i 2 «leggimi». **Gli archivi non sono stati toccati**, per la stessa regola della Fase 2-bis: `docs/storico/` e `docs/changelogs/` registrano che *all'epoca* la ponte esisteva, ed è vero
- [x] `version` a `2.1.8` in `package.json` — e in `package-lock.json`, nel badge del `README` e nel segnaposto di `bug_report.yml`
- [x] ⛔ **Entry `2.1.8` in `src/renderer/src/lib/releaseNotes.ts`** — se manca, la schermata «Novità» mostra il testo generico invece dell'elenco. **Fatta**, cinque voci per lingua
- [x] `CHANGELOG.md` — la sezione «Non ancora rilasciato» diventa `v2.1.8`, più `docs/changelogs/CHANGELOG_v2.1.8.md`. **Da citare fra le novità: il campo della data ora si chiama «Data di Partenza» anche nelle impostazioni del bot** (prima era «Data di Filtro (Cutoff)»). La motivazione originale — «è una stringa visibile che cambia sotto agli occhi degli utenti esistenti» — non regge più, visto che utenti esistenti non ce ne sono; ma va scritta lo stesso, perché è la prima release pubblica e il changelog è documentazione, non un avviso. **Fatto**, ha un paragrafo suo
- [x] ~~I 2 PDF vanno ricompilati, perché `strings.typ` è cambiato con la Fase 2-bis~~ — **non serve, verificato il 13/08.** I PDF in `HEAD` sono stati committati (`f26acac`) *dopo* l'ultima modifica a `strings.typ` (`026f67f`), quindi la incorporano già, e `manuale.typ` è già su `VERSIONE = "2.1.8"`. Si ricompilano **solo se** la versione che si rilascia non è la 2.1.8, con `pwsh typst/build.ps1 -All`
- [x] ~~Build e **pubblicazione sulla vecchia repo ponte** (serve il secret `RELEASE_TOKEN`)~~ — **cancellato il 13/08.** Non ci sono installazioni esistenti da raggiungere. La release va sulla repo pubblica e basta
- [x] **`build.yml` riscritto per la repo pubblica.** Il passo `Publish release to bridge repo` non esiste più: niente `repository:`, niente `secrets.RELEASE_TOKEN`. Al suo posto `Publish release`, col `GITHUB_TOKEN` integrato e `permissions: contents: write` sul job — senza quel permesso il token è di sola lettura e la pubblicazione fallirebbe a build finita. Nel repository non resta un solo riferimento vivo a `RELEASE_TOKEN`
- [x] ▶️ **Lanciare la build e pubblicare la release** — **fatta il 13/08**, `gh workflow run build.yml -f publish_release=true`. [Run 31671220306](https://github.com/Pitz72/Runtime-TelegramBot-Desktop-Titan-Edition/actions/runs/31671220306): **success**. La release `v2.1.8` è pubblica e non è una bozza, con 5 asset — `Setup-2.1.8.exe` (83,8 MB), `2.1.8.AppImage` (114,1 MB), `2.1.8.deb` (78,8 MB), `latest.yml` e `latest-linux.yml`

  ✅ **Il `GITHUB_TOKEN` con `permissions: contents: write` funziona anche con il default della repo su `read`.** Era il dubbio con cui si è entrati nel passo: il timore era che il permesso del job non potesse superare l'impostazione della repository, e che la pubblicazione fallisse *a build finita*. Non è così — l'impostazione è un default, non un tetto. Il default resta `read`, che è il minimo privilegio giusto

  ✅ **La build resta manuale, come richiesto dall'utente.** Verificato: `build.yml` non ha nessun trigger su `push`, quindi sui commit non parte niente. Su `pull_request` gira solo `verify`, che non produce installer e non pubblica. Build e release girano solo su `workflow_dispatch`

### Fatto in Fase 3, per memoria

Verifiche superate sul working tree finale: `npx tsc --noEmit`, `npx vite build`, `node scripts/check-locales.mjs` (237 chiavi × 2). In più `build.yml` ed `electron-builder.yml` sono stati riletti con un parser YAML, non solo a occhio.

**Il corpo della release è stato corretto mentre lo si spostava.** Il vecchio testo prometteva: *«The app updates automatically — existing users will be notified in-app.»* Falso per il `.deb`, che non si auto-aggiorna: è un limite di `electron-updater`. Su una release pubblica quella riga sarebbe stata il primo malinteso ad arrivare nelle issue. Ora la distinzione fra Windows/AppImage e `.deb` è scritta nel corpo. La voce corrispondente resta aperta in Fase 4.3, che riguarda la documentazione.

> ⚠️ **Corretto in Fase 4.3:** «il `.deb`, che non si auto-aggiorna» **era sbagliato**, e la correzione è arrivata leggendo il codice invece che ricordandolo. Con `electron-updater` 6.8 il `.deb` si aggiorna, chiedendo la password di amministratore. Il testo della release e la documentazione dicono ora la cosa giusta.

⚠️ **Il banner in `branding/` è ancora quello della v2.1.7**, e `build-banner.py` ha `VERSION = "2.1.7"`. Non è referenziato dal `README` né dall'applicazione, quindi non si vede da nessuna parte: è rimasto indietro di proposito, per non rigenerare un asset grafico dentro una fase che non lo prevedeva.

⚠️ **`.secrets/RELEASE_TOKEN.txt` è ancora sul disco.** È morto (HTTP 401) e non serve più a niente. L'audit del 12/08 diceva di toglierlo dal disco quando il flusso di release fosse cambiato: il flusso è cambiato adesso. Non è stato cancellato in questa sessione perché cancellare file di credenziali non è un passo da infilare di straforo in fondo a una fase.

---

## FASE 4 — GitHub

### 4.1 Trasferimento ✅ ESEGUITA IL 13/08

**Destinazione:** `https://github.com/Pitz72/Runtime-TelegramBot-Desktop-Titan-Edition`

- [x] Metodo: **repo nuova con push della storia** (vedi decisioni sciolte)
- [x] **Backup completo prima di toccare qualsiasi cosa** — `git clone --mirror` in `_backup-git-2026-08-13.git`, fuori dalla cartella del progetto: 129 commit, 40 tag, entrambi i branch, 121 MB. Non va cancellato finché la Fase 5 non è chiusa
- [x] **Storia riscritta** con `git filter-repo`, su una *copia* del backup
- [x] Spostata la repo su `Pitz72` e verificata con un clone pulito
- [x] ~~Decidere che fare del branch `claude/heuristic-swanson-148248`~~ — **cancellato, e la decisione l'hanno presa i fatti:** `git rev-list --count main..claude/heuristic-swanson-148248` dà **0**. Il branch era interamente contenuto in `main`, quindi non conteneva una riga di lavoro che non fosse già pubblicata. Non è stato portato sulla repo nuova; resta nel backup e nella vecchia repo
- [x] Verificato che i **40 tag** siano arrivati, e che ognuno risolva a un commit valido
- [x] ~~Riconfigurare `RELEASE_TOKEN`~~ — **non serve più, e comunque quello vecchio è morto.** Il token in `.secrets/RELEASE_TOKEN.txt` è stato verificato contro `api.github.com`: **HTTP 401** anche su `/rate_limit`, quindi scaduto o revocato (è un fine-grained `github_pat_`, e i fine-grained scadono; per questo non compariva nell'elenco dei token *classici*). Non è stato installato: un secret morto è peggio di un secret assente, perché il workflow fallirebbe a build finita invece che subito. **Poi la decisione sulla ponte ha tolto il problema alla radice**: senza release cross-organizzazione, il `GITHUB_TOKEN` integrato basta

#### Cosa è stato tolto dalla storia

Il primo tentativo ha sbagliato bersaglio e va ricordato, perché l'errore è ripetibile. Filtrare per **percorso** (`docs/storico/manuali-v1.7/`) sembrava funzionare, ma quei PDF erano stati *spostati* lì da `docs/guide/`: i blob sopravvivevano intatti sotto il percorso di partenza. Un secondo inciampo: `git ls-tree` **mette fra virgolette i percorsi non-ASCII**, quindi un test su `.pdf` in coda al nome falliva su tutti i file con `—`, cirillico o CJK — otto manuali su otto. Il filtro definitivo lavora sull'**identità del blob**, che nessun rinomino può cambiare.

| Cosa | Blob | Peso non compresso |
| :--- | ---: | ---: |
| PDF da 32 MB col colophon EULA (8 lingue × 2 versioni) | 16 | 512,6 MB |
| Manuali v1.7 (8 lingue) | 8 | 18,2 MB |
| Whitepaper commerciali | 4 | 0,5 MB |
| **Totale** | **28** | **532,2 MB** |

**Risultato: il pack che scarica chi clona passa da 120,7 a 50,5 MB.**

#### Verifiche fatte, tutte superate

- **`HEAD` è identico all'originale**: stessi 249 file, **stessi blob SHA**, confrontati uno per uno contro `fd17433`. Non è cambiato un byte di ciò che si vede oggi nella repo
- **129 commit**, con autori, date e messaggi identici; **40 tag**, tutti risolvibili
- `git fsck --strict` pulito
- Nella storia sopravvivono **2 soli PDF**: i due manuali attuali da 9,0 MB
- **Clone pulito da GitHub** riscaricato da zero e riconfrontato col backup: identico
- La **vecchia repo su `Ecosystem-Runtime` è intatta e ancora privata**. È la seconda rete di sicurezza dopo il backup locale

### 4.2 Pubblicazione ✅ ESEGUITA IL 13/08

- [x] Repository **pubblico**
- [x] Descrizione, sito, e 8 argomenti: `telegram-bot`, `rss`, `electron`, `youtube`, `automation`, `typescript`, `react`, `open-source`
- [x] GitHub riconosce la licenza: **MIT**
- [x] Issue abilitate; i due template (`bug_report.yml`, `feature_request.yml`) sono al loro posto
- [x] **Nessun workflow è partito con la pubblicazione**: `build.yml` è `workflow_dispatch` e basta, quindi non c'è stato nessun tentativo di release con un secret assente
- [x] Verifica finale dei segreti, **rifatta su tutti e 129 i commit della storia riscritta** (non sui 119 del 12/08): 1073 blob di testo analizzati contro token Telegram, `ghp_`, `github_pat_`, `gho_`, `ghs_`, `AKIA`, chiavi PEM, `sk-`, `xox*`, `AIza`. **Zero riscontri.** Nessun `.env`, `.db`, `.pem` o file di credenziali è mai stato tracciato

### 4.3 CI — matrice di build completa ✅ ESEGUITA IL 13/08

Collaudata su un branch (`ci/build-matrix`) con due build di prova a `publish_release=false`, prima di toccare `main`. **Seconda run verde su tutti e tre i runner**, 12 artefatti.

- [x] Windows x64 — NSIS installer + portable
- [x] Linux x64 — AppImage, deb, **rpm**, pacman, tar.gz
- [x] Linux arm64 — runner `ubuntu-24.04-arm`, gratuito sulle repo pubbliche. ~~La parte delicata è `better-sqlite3` compilato per arm64~~ — **non lo è stata:** `@electron/rebuild` ha trovato il prebuild (`preparing`/`finished` in un decimo di secondo, `buildFromSource=false`). Nessuna compilazione, nessun intoppo
- [x] Publish verso la repo stessa con `GITHUB_TOKEN` — già fatto in Fase 3, invariato
- [x] Mantenere Node 20 — invariato, con la nota del perché in cima al workflow
- [x] Mantenere il job `verify` su pull request — invariato
- [x] Nessun target macOS
- [x] **La build resta manuale.** Nessun trigger su `push`, come da regola dell'utente: verificato di nuovo dopo la riscrittura

**Il nome degli artefatti Linux ora contiene `${arch}`.** Senza, x64 e arm64 produrrebbero file omonimi che si sovrascrivono a vicenda nel momento in cui il job di release li raccoglie in una cartella sola. I nomi veri, misurati sulla run: `-x86_64.AppImage` e `-arm64.AppImage`, `-amd64.deb` e `-arm64.deb`, `-x86_64.rpm` e `-aarch64.rpm`, `-x64.tar.gz` e `-arm64.tar.gz`. La mappatura arch→nome la decide electron-builder per estensione, e non è uniforme.

#### Due cose imparate, che si sarebbero pagate in produzione

🔧 **fpm.** deb, rpm e pacman li impacchetta fpm, e quello che electron-builder scarica da sé è **fermo alla 1.9.3** ed esiste **solo per x86_64**: non conosce il formato `pacman` (aggiunto in fpm 1.11) e su arm64 non esiste proprio. La CI installa un fpm di sistema e lo impone con `USE_SYSTEM_FPM`, su entrambi i runner.

🔧 **bsdtar.** Con il fpm giusto, la prima run è comunque caduta sull'ultimo target: `pacman`, `exit code 127` su `bsdtar -czf .MTREE`. fpm si appoggia a `bsdtar` per il manifesto del pacchetto Arch, e sui runner Ubuntu `bsdtar` non c'è: sta in `libarchive-tools`. Tutto il resto — AppImage, tar.gz, deb, rpm, su **entrambe** le architetture — era già passato al primo colpo.

#### Verifiche sugli artefatti, non solo sul log

I 12 file sono stati scaricati e aperti, non contati da lontano.

- **Il `.pacman` dichiara l'architettura giusta.** Il dubbio era fondato: electron-builder passa a fpm `--architecture amd64` anche per il target pacman, e Arch vuole `x86_64`. Il `.PKGINFO` estratto dice però `arch = x86_64` sul pacchetto x64 e `arch = aarch64` su quello arm64: **è il fpm di sistema a normalizzare**, quindi installarlo non serviva solo a poter costruire il formato, serviva anche a costruirlo bene
- **`latest.yml` elenca il solo `Setup-2.1.8.exe`**, non il portable: l'auto-update non può proporre un file che non si sa installare
- **`latest-linux.yml` e `latest-linux-arm64.yml` elencano AppImage, deb e rpm** ciascuno con la propria architettura, e non si sovrascrivono a vicenda perché il nome del manifesto arm64 è diverso
- Il `.blockmap` separato esiste per l'installer Windows; per l'AppImage no, perché lì la mappa è dentro il file — infatti `blockMapSize` è nel manifesto

#### ⚠️ L'auto-updater: la voce del piano era sbagliata

La voce diceva: *«Documentare che l'auto-updater funziona solo su Windows e AppImage. `deb`, `rpm` e `pacman` non si auto-aggiornano: è un limite di electron-updater.»* **Era vera per le versioni vecchie di electron-updater, non per la 6.8 che il progetto usa.** Verificato leggendo il codice in `node_modules`, non a memoria:

- `FpmTarget.supportsAutoUpdate()` ritorna vero per **deb e rpm**, e per quei due scrive `app-update.yml` e un file `package-type` dentro il pacchetto;
- `electron-updater/out/main.js` legge `package-type` e istanzia `DebUpdater` o `RpmUpdater`, che scaricano il pacchetto nuovo e lo installano da root, chiedendo la password con `pkexec`, `gksudo` o `sudo`;
- **la prova sta già nella release 2.1.8 pubblicata**: il suo `latest-linux.yml` elenca il `.deb` accanto all'`.AppImage`. Il meccanismo è acceso da prima di questa fase.

Quindi la documentazione dice ora ciò che è vero: installer Windows e AppImage si sostituiscono da soli; **deb e rpm si aggiornano ma chiedono la password di amministratore**, ed è una funzione recente e meno collaudata; **portable, pacman e tar.gz non si aggiornano da soli**. Il portable non compare nemmeno in `latest.yml` — `NsisTarget` scrive le informazioni di aggiornamento solo se il target non è portable (`isWriteUpdateInfo: !this.isPortable`), e la run lo conferma: `latest.yml` elenca il solo `Setup-2.1.8.exe`.

Aggiornati: `README.md`, `docs/build.md`, i 2 «leggimi», il corpo della release in `build.yml` e il **capitolo 2 del Manuale Utente Avanzato** in italiano e inglese, con i 2 PDF ricompilati (33 pagine ciascuno come prima, colophon MIT, versione 2.1.8). Il manuale conosceva due formati su cinque e una sola architettura, e prometteva «non dovrai più scaricare nulla a mano»: falso per portable, pacman e tar.gz.

---

## FASE 5 — Dismissione della fase commerciale

- [ ] **Gumroad** — rimuovere il prodotto da `pizzisimone.gumroad.com/l/telegrambot`
- [ ] **Sito Ecosystem** (`GitHub/SITI-WEB/ECOSYSTEM`) — sostituire acquisto e prezzo con il link alla repo pubblica; sistemare la landing di Titan, `products-manifest.json`, i locale it/en e l'URL offuscato in base64 del manuale
- [ ] Verificare che nessun materiale promozionale prometta ancora un prodotto a pagamento
- [ ] **Cancellare `Ecosystem-Runtime/runtime-telegrambot-releases`.** Nessuna finestra da aspettare
  > Il ⛔ originale diceva: *«Solo dopo la finestra di migrazione. Chi non ha aperto l'app in quella finestra resta alla 2.1.7 per sempre: dopo la cancellazione non esiste redirect per gli asset di release.»* Vero in generale, vuoto in questo caso: non esiste nessun «chi». L'unica installazione al mondo è quella dell'autore, che scarica l'installer a mano.
  >
  > 🔴 **C'è però un motivo per farlo presto invece che tardi.** La cartella `manuals/` di quella repo serve pubblicamente **gli 8 PDF vecchi da 33 MB col colophon EULA** — «Tutti i diritti riservati», riproduzione vietata. Finché sta su, il progetto MIT ha un suo documento ufficiale scaricabile che dice il contrario. Va fatto **subito dopo** aver spostato `MANUAL_BASE` in Fase 3, non alla fine di tutto.

---

## FASE 6 — Rifiniture della schermata iniziale

Segnalate dall'utente il 13 agosto 2026, subito dopo aver aggiornato alla 2.1.8 scaricata da GitHub. Sono tutte estetiche e stanno tutte in `src/renderer/src/components/IntroScreen.tsx`: **nessuna è bloccante**, ma sono la prima cosa che vede chi apre il programma, e ora il programma lo può aprire chiunque.

Il giudizio dell'utente sul resto della schermata è: **va bene così.** Non c'è mandato per ridisegnarla.

- [ ] **1. «Titan Edition» va portato a capo.** Oggi ([riga 47](../src/renderer/src/components/IntroScreen.tsx)) il titolo è un unico `<h1>` in cui `{t('app.title')}` e lo `<span>` «Titan Edition» stanno sulla stessa riga, quindi il testo va a capo dove capita: nella schermata dell'utente si spezza dopo «Titan», lasciando «Edition» orfano sulla seconda riga. Il nome canonico è composto di due parti, e la seconda deve stare sotto la prima per intero. Serve anche `text-center` sull'`h1`: il centraggio di adesso viene dal genitore, e appena il titolo va su due righe salta

- [ ] **2. Il credito LLM è illeggibile.** «Sviluppato con l'ausilio di LLM · concezione e direzione di Simone Pizzi» ([riga 55](../src/renderer/src/components/IntroScreen.tsx)) è `text-nano` a `text-outline-variant/35`: dimensione minima e 35% di opacità su fondo scuro. È blu su blu. È anche la riga di paternità del progetto, cioè una delle cose che l'apertura del sorgente doveva rendere esplicite — nasconderla è il contrario di quel che serve. Alzare opacità e corpo

- [ ] **3. Le bandiere non sono centrate — ed è un residuo delle otto lingue.** Il contenitore ([riga 84](../src/renderer/src/components/IntroScreen.tsx)) è `grid grid-cols-4`: era pensato per otto bandiere su due file da quattro. Con due lingue restano incollate a sinistra, e il vuoto a destra lascia intendere che *prima ci fosse dell'altro* — che è esattamente quel che è successo, ma non è quel che deve trasparire. Passare a un layout centrato sul numero reale di lingue, non su quattro colonne fisse

- [ ] **4. `INIT_SEQ · TITAN_DESKTOP_RUNTIME` — a che serve?** ([riga 152](../src/renderer/src/components/IntroScreen.tsx)) A niente: è decorazione, un vezzo da finto terminale rimasto dal design «Titan Glass» delle origini, scritto a `text-outline-variant/25`. Non è una chiave di traduzione, non è uno stato, non è diagnostica. **Proposta: toglierla.** Se invece piace come firma grafica, va deciso che è quello e basta

---

## Verifiche di chiusura

- [ ] Installare l'ultimo installer su una macchina pulita e verificare: primo avvio, creazione di un bot, pubblicazione reale su un canale
- [x] ~~Verificare l'aggiornamento automatico da 2.1.7 a 2.1.8 su un'installazione reale — è il punto che, se sbagliato, non si può correggere a posteriori~~ — **verificato il 13/08 dall'utente, su installazione reale.** Ha aggiornato dalla release appena pubblicata su GitHub, e la schermata «Novità» è comparsa con l'elenco della 2.1.8. Il punto più delicato dell'apertura è passato, ed è passato al primo colpo
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
