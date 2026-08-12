# Audit completo pre-apertura del sorgente

**Data:** 12 agosto 2026
**Versione analizzata:** v2.1.7 (commit `a83fc4a`, branch `main`)
**Perimetro:** tutto `src/` (58 file, ~7.400 righe TS/TSX), `docs/`, configurazioni di build e CI, storia git (119 commit), cartella contenitore `BOT-TELEGRAM-RSS/`.
**Obiettivo:** stabilire cosa va sistemato prima di rendere pubblico il sorgente e ritirare il prodotto dal mercato.

---

## 0. Sintesi

Il codice è **maturo e in buono stato**. I fix storici dichiarati nelle sessioni precedenti risultano tutti effettivamente presenti nel sorgente (G1–G5, M6, IronShield v2, perf Fix A/B, chiusura DB pulita, hardening async dell'engine). Non è emersa alcuna criticità che comprometta i dati dell'utente o che esponga segreti.

**La storia git è pulita**: nessun token Telegram, nessun PAT GitHub, nessuna chiave privata, nessun `.env` o database mai committato in nessuno dei 119 commit. Il repository è pubblicabile senza riscrivere la storia.

Il conteggio delle criticità nuove trovate in questa passata:

| Livello | Numero | Note |
| :--- | :---: | :--- |
| Gravissime | **0** | una candidata da verificare (§1.0) |
| Gravi | **4** | tutte con fix contenuto, nessuna richiede rifattorizzazioni |
| Medie | **7** | |
| Lievi | **9** | in gran parte cosmetiche o di igiene repo |

Il grosso del lavoro reale non è nel codice ma **nella documentazione e nella licenza**: la `LICENSE.txt` attuale è un EULA proprietario che vieta esplicitamente la redistribuzione e il reverse engineering — è incompatibile con qualsiasi apertura del sorgente ed è il vero unico blocco.

---

## 1. Criticità

### 1.0 Candidata GRAVISSIMA — da verificare: token Telegram nei file di log

**Dove:** `src/main/bot/telegram.ts:102` → `src/main/logger.ts:76`

```ts
const errorMsg = e.response?.description || e.message || String(e);
...
this.logToUI(`⚠️ Network error (attempt ${attempt}/${maxRetries}): ${errorMsg}`);
```

Telegraf costruisce l'URL delle chiamate come `https://api.telegram.org/bot<TOKEN>/sendMessage`. Se in un errore di rete il messaggio dell'eccezione include l'URL — comportamento comune nelle librerie fetch di Node — allora il **token del bot in chiaro finisce**: nel file `userData/logs/titan-YYYY-MM-DD.log`, nella console visibile in Dashboard, e nel file esportato dal pulsante «Esporta log».

Conseguenza in ottica open source: un utente che allega il log a una issue pubblica pubblica anche il proprio token, cioè il pieno controllo del bot.

**Non ho potuto verificarlo** perché `node_modules` non è installata in locale, quindi non conosco il testo esatto degli errori di telegraf 4.15. Il fix però è a costo zero e va bene metterlo comunque, verificato o no — è una redazione difensiva di 4 righe in `logger.ts`:

```ts
/** Redazione: nessun token bot deve finire nei log, nemmeno di rimbalzo dagli errori di rete. */
function redact(s: string): string {
    return s.replace(/\b\d{8,10}:[A-Za-z0-9_-]{35}\b/g, 'bot<REDACTED>');
}
```
applicata a `message` in `Logger.log()`.

---

### 1.1 GRAVI

#### G-A — Nessun single-instance lock: due istanze = doppie pubblicazioni

**Dove:** `src/main/index.ts` (manca del tutto `app.requestSingleInstanceLock()`)

Niente impedisce di avviare due volte l'applicazione. Le due istanze aprono **lo stesso** `titan.db` e avviano **due engine indipendenti**. La deduplica non protegge: `markProcessed()` avviene solo *dopo* l'invio Telegram andato a buon fine, quindi entrambe le istanze possono superare `isProcessed()` sullo stesso item e inviarlo due volte sul canale. In più si aggiunge contesa WAL su SQLite.

È lo scenario di doppia pubblicazione più semplice rimasto, e su Windows è banale da innescare (doppio click sull'icona quando l'app è già in tray/minimizzata).

**Fix:** ~10 righe in `index.ts`, prima di `whenReady()`:

```ts
if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}
```

#### G-B — Injection HTML nei messaggi Telegram da URL del feed

**Dove:** `src/main/bot/telegram.ts:65-76,159-161` e `src/main/bot/engine.ts:601-603`

`escapeUrl()` codifica **solo** `&`. I template predefiniti inseriscono il link in un attributo delimitato da apici singoli:

```ts
"🎧 <a href='{{link}}'>Ascolta l'episodio</a>"
```

Un feed che espone un `<link>` contenente `'`, `<` o `>` esce dall'attributo e inietta HTML arbitrario nel messaggio pubblicato sul canale. Telegram non esegue script, ma accetta `<a href>`: il risultato pratico è che **il gestore di un feed può far comparire sul canale Telegram un link a un dominio diverso da quello che il titolo suggerisce** — phishing verso tutti gli iscritti. Stessa falla su `item.image` (l'hack dell'anteprima a riga 75) e sul link dentro il digest in `engine.ts:576`.

**Fix:** in `escapeUrl()` codificare anche `<`, `>`, `"` e `'`:

```ts
private escapeUrl(url: string): string {
    return url
        .replace(/&(?!amp;)/g, '&amp;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
```
Meglio ancora: validare che l'URL sia `http:`/`https:` prima di inserirlo, e scartare l'item altrimenti.

#### G-C — La validazione anti-SSRF si aggira con un redirect o con il DNS

**Dove:** `src/main/bot/parser.ts:8-31`

`validateFeedUrl()` controlla l'**hostname testuale** dell'URL inserito. Tre buchi:

1. **Redirect.** `rss-parser` segue i `3xx`. Un URL pubblico che risponde `302 Location: http://127.0.0.1:8080/` viene scaricato senza che la validazione venga riapplicata alla destinazione.
2. **DNS.** Un dominio pubblico che risolve a `127.0.0.1` o a un IP RFC-1918 passa il controllo: non c'è risoluzione né verifica dell'IP effettivo.
3. **Coperture mancanti** anche sul solo controllo testuale: IPv6 privati (`fc00::/7`, `fe80::/10`, `[::]`), forma decimale/ottale/esadecimale degli IPv4 (`http://2130706433/`), `*.local`, `metadata.google.internal`.

L'impatto è contenuto — serve che l'utente aggiunga volontariamente il feed, e l'esfiltrazione funziona solo se la pagina interna è RSS valido — ma su un progetto che sta per diventare pubblico è il tipo di cosa che vale la pena chiudere.

**Fix minimo:** aggiungere i pattern mancanti e impostare `maxRedirects: 0` in `new Parser({...})`, oppure fetchare a mano con `follow` manuale e ri-validare ogni hop.

#### G-D — Il salvataggio delle impostazioni bot fallisce in silenzio

**Dove:** `src/renderer/src/components/BotSettingsModal.tsx:43-65`

```ts
} catch (e) {
    console.error('Failed to save bot settings:', e);
}
```

Nessun toast, nessun messaggio: il modale resta aperto e all'utente sembra che il pulsante non funzioni. Non è teorico — è **esattamente** ciò che succede nello scenario già previsto dal codice: quando il token non è decifrabile su quella macchina (DB importato da un altro PC, keychain OS assente), `decryptToken()` restituisce `''`, il campo Token nel form è vuoto, e `assertString(token, 'token')` in `ipc.ts:174` lancia. L'utente si trova un bot che non pubblica, un log che dice «reinserisci il token», e un pulsante Salva che non reagisce.

**Fix:** aggiungere `error(...)` nel catch con il messaggio dell'eccezione, come già fatto in `handleExport` poche righe sotto.

---

### 1.2 MEDIE

| # | Dove | Problema | Effetto |
| :--- | :--- | :--- | :--- |
| M-A | `src/renderer/src/locales/{de,es,fr,ru,zh}.json` | Mancano **15 chiavi `updater.*`** presenti solo in it/en/pt | L'intero flusso di aggiornamento (UpdateModal + sezione Impostazioni) esce **in inglese** per 5 lingue su 8. Contraddice la dichiarazione «locale terminati in via definitiva» |
| M-B | `src/main/bot/youtube.ts:229-258` | Il parsing delle date YouTube riconosce solo inglese e italiano | Se InnerTube risponde in un'altra lingua (dipende dall'IP di uscita), tutte le date cadono sul fallback anno 2000 e **i video non vengono mai pubblicati**, silenziosamente |
| M-C | `src/main/bot/telegram.ts:83` | `sendMessage()` fa `this.aborted = false` a ogni chiamata | Annulla l'effetto di `abort()`: un client riutilizzato dopo lo stop riprende a inviare. Oggi è mascherato dal fatto che `stop()` svuota la Map dei client |
| M-D | `src/renderer/src/components/TemplateEditor.tsx:89` | `dangerouslySetInnerHTML` sull'anteprima del template | Un `.rtb` ricevuto da terzi può contenere HTML arbitrario nel template, che viene iniettato nel renderer all'apertura dell'anteprima. La CSP (`script-src 'self'`, `img-src 'self' data:`) blocca script e caricamenti remoti, quindi resta injection visiva — ma il renderer ha accesso pieno a `window.api` e non è il posto dove tenere una superficie del genere |
| M-E | `src/renderer/index.html:8-12` | I font sono caricati da `fonts.googleapis.com` | Un'app desktop locale contatta Google a ogni avvio (privacy, e in un progetto open source è la prima cosa che qualcuno segnala). Senza rete i font vanno in fallback. Da self-hostare |
| M-F | `src/main/index.ts:83-86` | `setWindowOpenHandler` chiama `shell.openExternal(details.url)` senza filtrare lo schema | Nessun controllo `https:`/`http:`, a differenza dell'handler IPC `open-external` che invece lo fa correttamente. Difesa in profondità mancante |
| M-G | `src/main/bot/manager.ts:370-380, 473-490` | Nell'import `.rtb`, per ogni feed disattivato si fa una `SELECT ... ORDER BY id DESC LIMIT 1` per ritrovare la riga appena inserita | È il vecchio M3 mai chiuso. Basterebbe far restituire `lastInsertRowid` da `addFeed()`. Nessun impatto funzionale, solo query inutili |

---

### 1.3 LIEVI

1. `src/main/bot/engine.ts:105` — il messaggio di avvio inviato su Telegram dice ancora `Titan Desktop v…`, non il nome canonico «Runtime TelegramBot Desktop Titan Edition».
2. `src/renderer/src/locales/*.json:5` — chiave `app.version` ferma a `"v1.7.1"` in tutte e 8 le lingue. È **inutilizzata** (la versione reale viene da `getVersion()`), quindi è solo una chiave morta da rimuovere.
3. `src/main/index.ts:1` — `ipcMain` importato e mai usato.
4. `src/renderer/src/components/GuideModal.tsx:24` — i link markdown delle guide in-app sono resi come `<span>`: si vedono ma non sono cliccabili.
5. `src/renderer/src/components/Dashboard.tsx:36-52` — `useEffect` con dipendenze `[]` che cattura `t` e `error`: closure stantia sul messaggio di errore YouTube (resta nella lingua attiva al mount).
6. `src/renderer/src/components/Dashboard.tsx:117` — il filtro «solo questo bot» funziona per match testuale su `[NomeBot]` nel messaggio: due bot con nomi in prefisso l'uno dell'altro si confondono.
7. `electron-builder.yml:38-47` e `build/entitlements.mac.plist` — configurazione macOS ancora presente nonostante la rimozione definitiva del supporto Mac (06/07/2026). Idem `docs/build-mac.md`.
8. `README.md:9` — badge di versione fermo a `2.1.6` mentre il prodotto è alla `2.1.7`.
9. `package.json` — `"private": true`, nessun campo `license`, nessun campo `repository`, `description` ancora «Desktop Application for Runtime Radio Telegram Bot». Tutti da sistemare all'apertura.

> **Attenzione da non sbagliare in fase di pulizia:** `productName: Runtime Telegram Bot Titan Edition` in `electron-builder.yml` **non va toccato** anche se non coincide con il nome canonico. Da quella stringa deriva il nome della cartella `userData` (`runtime-telegram-bot-titan-edition`) dove vivono `titan.db`, `.machine-key` e `titan-settings.json`: cambiarla significa che ogni utente esistente perde bot, feed, storico e token al primo avvio della versione nuova.

---

## 2. Feature e miglioramenti

### 2.1 Necessari prima di pubblicare il sorgente

1. **Sostituire la licenza.** `LICENSE.txt` è un EULA proprietario che al punto 2 vieta «distribuire, condividere, sub-licenziare» e «fare reverse engineering o estrarre il codice sorgente». Pubblicare il sorgente lasciando quel file è una contraddizione che rende la posizione legale del progetto indefinita per chiunque lo scarichi. Va sostituito con una licenza OSI (MIT, Apache-2.0 o GPL-3.0) e il vecchio EULA va archiviato come documento storico, non cancellato.
2. **Redazione dei token nei log** (§1.0) — pubblicare significa invitare la gente ad aprire issue con i log allegati.
3. **`SECURITY.md`** con l'indirizzo a cui segnalare vulnerabilità in privato. Senza, le segnalazioni arrivano come issue pubbliche.
4. **Bonificare i riferimenti commerciali** nel repo: `docs/gumroad-description.md` e `branding/gumroad-page.md` descrivono un prodotto a pagamento che non esisterà più.

### 2.2 Essenziali perché il progetto sia usabile da altri

5. **`CONTRIBUTING.md`** — come si builda, come si testa, com'è organizzato `src/`, quali sono le regole non ovvie (e sono parecchie: il bug di `npm run dev` che corrompe `dist-electron`, il divieto di toccare `productName`, l'obbligo di aggiungere l'entry in `releaseNotes.ts` prima di ogni build).
6. **Una CI che valida le pull request.** Oggi `build.yml` parte solo su `workflow_dispatch`. Serve almeno un job su `pull_request` che faccia `npm ci && npx tsc --noEmit && npx vite build`: senza, ogni contributo esterno arriva non verificato.
7. **Zero test, zero framework di test.** Vitest era in roadmap a febbraio 2026 ed è stato accantonato. Da mono-sviluppatore era una scelta difendibile; su un progetto pubblico è il primo ostacolo per chi vuole contribuire. Non serve coprire tutto: le funzioni pure e ad alto rischio sono poche e sono le più delicate del progetto — `parseUtcTimestamp`, `isFeedDue`, `passesKeywordFilter`, `cleanSummary`, `validateFeedUrl`, `normalizeChannelId`, `validateTemplate`, il parser delle date YouTube.
8. **Nessun linter né formatter** (niente ESLint, niente Prettier). Su un repo pubblico serve per non trasformare ogni PR in una discussione sullo stile.
9. **Template di issue e PR** in `.github/`.

### 2.3 Auspicabili

10. **Alleggerire il repository.** Il pack git è **232 MB**, quasi interamente gli 8 manuali PDF da 32 MB ciascuno versionati in `Manuale Utente Avanzato/typst/`. Ogni futura rigenerazione ne aggiunge altri 256 MB alla storia, per sempre. Da valutare: spostarli su release asset o Git LFS. (Non è bloccante: nessun file supera il limite GitHub di 100 MB.)
11. **Scansione parallela anche tra bot.** Il Fix B ha parallelizzato i feed RSS *dentro* un bot; il ciclo resta seriale *tra* bot. Con molti bot il tempo di ciclo è ancora la somma.
12. **Nessuna cancellazione della history dalla UI** se non azzerandola tutta per bot: manca un «rimuovi questo item dallo storico» per ri-pubblicare un singolo contenuto.
13. **Notifiche OS una per item inviato**: con un backlog corposo diventa una raffica. Meglio una notifica riepilogativa a fine ciclo.
14. **Self-hosting dei font** (vedi M-E) — chiude anche la dipendenza di rete all'avvio.

---

## 3. Stato della documentazione

### 3.1 Cosa è terminato e non va toccato

- **8 manuali utente avanzati** (9 capitoli ciascuno) + 8 PDF compilati — chiusi in via definitiva il 07/07/2026.
- **8 guide rapide + 8 leggimi** in `docs/guide/` e **8 guide in-app** in `src/renderer/src/assets/guides/` — chiuse il 07/07/2026.
- **Changelog per versione** in `docs/changelogs/` (48 file) — storico, completo fino alla v2.1.7.

### 3.2 Incoerenze e cose rimaste in sospeso

| Documento | Problema |
| :--- | :--- |
| `docs/index.md` | Dichiara «Versione corrente: v1.10.9». La tabella dei changelog si ferma alla v1.10.10: **mancano tutte le 14 release della serie 2.x**. È l'indice della documentazione, ed è il documento più fuori asse di tutti |
| `docs/STATO-PROGETTO.md` | «Versione corrente v2.1.3 — 11 giugno 2026». Descrive come «prossimo step: repo bridge + Gumroad» una fase conclusa da un mese e mezzo |
| `README.md` (progetto) | Badge v2.1.6 (app: 2.1.7); struttura repo elencata senza `branding/` e `Manuale Utente Avanzato/`; chiusura «Tutti i diritti riservati» da riscrivere all'apertura |
| `README.md` (contenitore `BOT-TELEGRAM-RSS/`) | Fermo alla **v1.7.6**, elenca macOS tra le piattaforme, punta a cartelle che non esistono più. È il più stantio del lotto |
| `docs/STATO-PROGETTO.md` §26 | Dice «rimosso `LICENSE.txt` duplicato, mantenuto `LICENSE`». Nel repo oggi esiste `LICENSE.txt` e **non** esiste `LICENSE`: la nota è falsa |
| `Manuale Utente Avanzato/*/02-installazione.md` | In tutte e 8 le lingue usa ancora «Data di Partenza (Start Date)» mentre i capitoli 03/04/06 e l'app usano «Data di Filtro (Cutoff)». Incoerenza interna nota e rinviata |
| Manuali PDF | I sorgenti typst dicono «Runtime TelegramBot Titan Edition», senza «Desktop»: non allineati al nome canonico deciso il 07/07 |
| `docs/build-mac.md` | Documenta una piattaforma rimossa definitivamente |
| `docs/gumroad-description.md` | Ferma alla v2.0.3, descrive un prodotto commerciale in dismissione |
| `docs/manuale.md` | Vecchio manuale monolitico v1.7.x, superato dalla cartella `Manuale Utente Avanzato/` |
| `docs/guide/*.pdf` (12 file) | Manuali e whitepaper «Versione 1.7.x» superati dai PDF nuovi in `Manuale Utente Avanzato/typst/` |

### 3.3 Roadmap e progetti aperti

Ho letto tutti i documenti di progetto. **Non esiste alcuna roadmap attiva.** Lo stato reale:

- `docs/roadmap-marzo2026.md` — **completata**, tranne «Test Vitest → non implementato, rimandato». È l'unico impegno mai preso e mai chiuso (vedi §2.2 punto 7).
- `docs/PROGETTO-PORTING.md` — completato in v1.10.2 (e in parte annullato: macOS rimosso).
- `docs/PROGETTO-IRONSHIELD-V2.md` — implementato in v2.1.0, schema DB v12.
- `docs/PROGETTO-SERVER.md` (modalità headless/VPS) — **rimandato a tempo indeterminato**. È l'unica idea di sviluppo mai formalizzata e mai realizzata. In ottica open source è anche la più interessante da lasciare scritta: è esattamente il tipo di lavoro che un contributore esterno potrebbe voler prendere in carico.
- `docs/analisi-tecnica.md`, `docs/debug-definitivo.md`, `docs/analisi-incidente-snap-24-04-2026.md`, `docs/relazione-youtube.md` — tutti storici e chiusi.

---

## 4. Igiene del repository e della cartella di lavoro

**Nel repo git (`TITAN_DESKTOP/Runtime TelegramBot Desktop Titan Edition/`):**
- `aaaaaaaaaaaaaaaaaaa/` — cartella non tracciata con 14 screenshot, un banner, un `.ico` e uno zip. Non è in `.gitignore`: se qualcuno fa `git add -A` finisce dentro. Da eliminare o rinominare.
- `titan-log-2026-05-11.txt` — log in root, ignorato da git ma inutile.
- `.secrets/RELEASE_TOKEN.txt` — correttamente ignorato, **mai** committato, ma va tolto dal disco quando il flusso di release cambia.
- `docs/design/` — mockup `.jsx`/`.html` di interfacce mai spedite. Storici.

**Nella cartella contenitore (fuori da git):**
- `Bot Telegram Desktop Titan-handoff.zip` (6,6 MB), `_handoff_analysis/`, `titan-intro-video/` (con `node_modules/` dentro). Materiale di lavoro esterno al prodotto.

**Storia git:** verificata pulita. Nessun match su pattern token Telegram (`\d{8,10}:[A-Za-z0-9_-]{35}`), `ghp_`, `github_pat_`, `gho_`, `AKIA`, chiavi private PEM, `sk-`. Nessun `.env`, `.db` o file di credenziali mai tracciato.

---

## 5. Riorganizzazione proposta della documentazione

Struttura obiettivo, pensata per un repository pubblico dove la prima domanda di chi arriva è «che cos'è, come lo installo, come contribuisco»:

```
/
├── README.md                 ← riscritto per pubblico OSS (badge 2.1.7, licenza, no claim commerciali)
├── LICENSE                   ← nuova licenza OSI
├── CHANGELOG.md              ← invariato (già ottimo)
├── CONTRIBUTING.md           ← nuovo
├── SECURITY.md               ← nuovo
├── .github/
│   ├── workflows/build.yml   ← + job di verifica su pull_request
│   └── ISSUE_TEMPLATE/       ← nuovo
├── docs/
│   ├── README.md             ← ex index.md, riscritto e allineato alla 2.x
│   ├── architettura.md       ← ex whitepaper_titan_architecture.md
│   ├── build.md              ← ex build-linux.md, fuso e ripulito da macOS
│   ├── database.md           ← nuovo: schema v12 e catena delle migrazioni (oggi non documentata)
│   ├── idee/
│   │   └── modalita-server.md    ← ex PROGETTO-SERVER.md, l'unico progetto aperto
│   ├── changelogs/           ← invariato
│   ├── guide/                ← invariato (8+8 file chiusi) ma senza i PDF v1.7.x
│   └── storico/              ← tutto ciò che è concluso e non va più aggiornato
│       ├── AUDIT-2026-08-12-pre-opensource.md   (questo file)
│       ├── analisi-tecnica.md
│       ├── analisi-incidente-snap.md
│       ├── debug-definitivo.md
│       ├── relazione-youtube.md
│       ├── roadmap-marzo2026.md
│       ├── PROGETTO-PORTING.md
│       ├── PROGETTO-IRONSHIELD-V2.md
│       ├── STATO-PROGETTO.md
│       ├── manuale-v1.7.md
│       ├── gumroad-description.md
│       ├── EULA-v1-proprietaria.txt
│       ├── manutenzione-archivio.md
│       └── design/
└── Manuale Utente Avanzato/  ← invariato (chiuso)
```

Criterio: **una sola cartella `storico/`** dove finisce tutto ciò che è concluso, così che ogni documento fuori da lì sia per definizione attuale e mantenuto. Nessun documento viene cancellato — la memoria storica del progetto è uno dei suoi pregi.

---

## 6. Checklist per l'apertura del repository

- [ ] Scegliere la licenza OSI e sostituire `LICENSE.txt` (archiviando l'EULA)
- [ ] Applicare la redazione dei token nel logger (§1.0)
- [ ] Applicare i 4 fix gravi (§1.1) — circa 40 righe in tutto
- [ ] Completare le 15 chiavi `updater.*` in de/es/fr/ru/zh (§M-A)
- [ ] Riorganizzare `docs/` secondo §5
- [ ] Riscrivere README (progetto + contenitore) e `docs/README.md`
- [ ] Scrivere `CONTRIBUTING.md` e `SECURITY.md`
- [ ] Aggiungere il job CI su `pull_request`
- [ ] Sistemare `package.json` (`license`, `repository`, `description`, `private`)
- [ ] Rimuovere i residui macOS da `electron-builder.yml` e `build/`
- [ ] Eliminare `aaaaaaaaaaaaaaaaaaa/` e `titan-log-2026-05-11.txt`
- [ ] Rendere pubblico il repository su GitHub
- [ ] Rimuovere il prodotto da Gumroad
- [ ] Aggiornare il sito Ecosystem (link Gumroad → repo GitHub)

Le ultime tre voci escono dal perimetro di questo audit e vanno fatte per ultime, in quest'ordine.
