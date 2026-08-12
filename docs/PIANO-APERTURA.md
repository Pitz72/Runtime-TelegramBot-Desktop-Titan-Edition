# Piano di apertura del sorgente — checklist operativa

**Aperto:** 12 agosto 2026
**Obiettivo:** ritirare Titan dal mercato, spostare il progetto su `Pitz72` come repository pubblico sotto licenza MIT, con build automatiche per Windows e Linux.
**Stato:** in corso. Questo file si aggiorna a ogni sessione e va spostato in `docs/storico/` quando tutte le voci sono chiuse.

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
- [ ] **Dove vivono gli 8 manuali PDF** dopo la migrazione: committati nella repo (come oggi sulla ponte) oppure come allegati di una release. Incide sul peso del repository.
- [ ] **Quanto tempo lasciare alla finestra di migrazione** prima di cancellare la ponte.
- [ ] **Se pubblicare una v2.1.8 anche sulla ponte** con i soli fix, o aspettare di avere anche i manuali rifatti e fare una sola release.

---

## FASE 1 — Chiudere il lavoro già fatto

Tutto quanto segue è **già scritto e verificato nel working tree**, ma non committato. `npx tsc --noEmit`, `npx vite build` e `scripts/check-locales.mjs` passano puliti.

- [ ] Rivedere il diff completo
- [ ] `git rm --cached .claude/settings.local.json` — è tracciato ma già in `.gitignore`, e in una repo pubblica non ci deve stare (contenuto innocuo, solo permessi locali)
- [ ] Commit 1 — correzioni di sicurezza e bug
- [ ] Commit 2 — licenza MIT, riorganizzazione documentale, CI
- [ ] Commit 3 — credito LLM, donazioni e contatti
- [ ] Push su `origin/main`

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

## FASE 2 — Manuali e documentazione (sessione dedicata)

La toolchain è installata e collaudata end-to-end: Typst 0.14.2, pandoc 3.9, PowerShell 7.6, Pillow 12.2. Il manuale italiano è già stato ricompilato con successo e i capitoli si rigenerano identici.

### 2.1 — Vignette (fa da sola quasi tutto il lavoro sul peso)

- [ ] Ricampionare le 9 vignette a 2000px, qualità 82, progressive
- [ ] Confronto a video di una pagina prima/dopo per ogni capitolo

Misurato su una copia: vignette **28,8 → 5,5 MB**, PDF italiano **32,0 → 8,8 MB**, tutti e 8 **258 → ~70 MB**. Confronto visivo già fatto su una pagina: indistinguibile. Sono illustrazioni al tratto, il caso in cui il JPEG rende meglio, e a 2000px su A4 si resta sopra i 300 DPI.

### 2.2 — Sorgenti dei manuali

⛔ **`typst/lib/strings.typ` — il colophon contiene l'EULA.** Tutti e 8 i PDF oggi pubblicati dicono «Tutti i diritti riservati» e «Nessuna parte di questo documento può essere riprodotta, distribuita o trasmessa senza il previo consenso scritto dell'autore». È lo stesso problema del vecchio `LICENSE.txt`, in forma di manuale: non si può aprire il progetto lasciandoli in circolazione.

- [ ] `strings.typ` × 8 lingue — `rights` → MIT; `repro` → riscritta per licenza libera; `credits` → più il credito LLM
- [ ] `lib/manuale-template.typ` — nome canonico «Runtime TelegramBot **Desktop** · Titan Edition» (4 occorrenze, oggi senza «Desktop»)
- [ ] `manuale.typ` — `VERSIONE` da `2.1.5` alla versione che si rilascia
- [ ] Capitolo 02 × 7 lingue — «Data di Partenza (Start Date)» → l'etichetta reale dell'app, «Data di Filtro (Cutoff)» e corrispettivi. L'inglese è già corretto
- [ ] Contenuto mancante: guida rapida in-app, download del manuale PDF e schermata «Novità» (funzioni della 2.1.6) **non sono documentate da nessuna parte nel manuale**. Va scritto ex novo in 8 lingue — è l'unica parte non meccanica di tutta la fase
- [ ] Valutare una riga sull'istanza singola nel capitolo 09 (troubleshooting)
- [ ] Verificare che nessun capitolo dia per scontata l'esistenza di un acquisto o di una licenza commerciale (una prima passata dice di no: i sorgenti non contengono riferimenti a licenza, prezzo o Gumroad)

### 2.3 — Guide brevi (24 file markdown, nessuna ricompilazione)

- [ ] 8 guide in-app — `src/renderer/src/assets/guides/guide-*.md`
- [ ] 8 guide rapide — `docs/guide/quick-start-guide-*.md`
- [ ] 8 leggimi — `docs/guide/*.txt`
- [ ] In ciascuna: riga di credito LLM/paternità, licenza MIT, contatti e donazione. Rimuovere ogni residuo di inquadramento commerciale

### 2.4 — Compilazione e verifica

- [ ] `pwsh typst/build.ps1 -All`
- [ ] Verifica programmatica su tutti e 8 i PDF: assenza di «riservati» e delle formule di divieto, nome prodotto corretto, versione giusta, credito LLM presente, licenza MIT citata
- [ ] Verifica **a video** di copertina, frontespizio e colophon per ognuna delle 8 lingue, più una pagina con vignetta

---

## FASE 3 — La build 2.1.8, che fa da traghetto

⛔ **Va costruita solo dopo che la repo di destinazione esiste** (Fase 4.1–4.2), perché il suo `app-update.yml` viene generato dalla configurazione di publish e deve già puntare alla destinazione nuova.

- [ ] `electron-builder.yml` → `publish` verso la repo nuova
- [ ] ⛔ **`src/renderer/src/lib/docs.ts` — `MANUAL_BASE`** oggi è un URL fisso alla ponte. Se non lo sposti, il pulsante «Scarica manuale» si rompe anche per chi *ha* aggiornato, nel momento in cui cancelli la ponte
- [ ] ⛔ Gli 8 PDF caricati nella nuova posizione **prima** che la 2.1.8 esca, altrimenti il punto sopra punta nel vuoto
- [ ] `package.json` — `homepage`, `repository`, `bugs` verso la destinazione nuova
- [ ] `src/renderer/src/lib/links.ts` — `SOURCE_URL` aggiornato
- [ ] Tutti i link nella documentazione che puntano a `Ecosystem-Runtime`
- [ ] `version` a `2.1.8` in `package.json`
- [ ] ⛔ **Entry `2.1.8` in `src/renderer/src/lib/releaseNotes.ts`** — se manca, la schermata «Novità» mostra il testo generico invece dell'elenco
- [ ] `CHANGELOG.md` — la sezione «Non ancora rilasciato» diventa `v2.1.8`, più `docs/changelogs/CHANGELOG_v2.1.8.md`
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
- **`productName` non si tocca mai.** Da quella stringa deriva la cartella `userData`: cambiarla azzera bot, feed, storico e token di ogni utente esistente. Scritto in `CONTRIBUTING.md` e in `docs/database.md`
