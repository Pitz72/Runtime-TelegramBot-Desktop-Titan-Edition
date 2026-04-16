# 🔬 Analisi Tecnica — Runtime TelegramBot Desktop Titan Edition v1.7.7 → v1.7.8

**Data analisi:** 12 Aprile 2026  
**Analista:** Antigravity Audit Engine  
**Scope:** Intero codebase (`src/main`, `src/preload`, `src/renderer`, `src/shared`, config files)  
**Ultimo aggiornamento:** 16 Aprile 2026 — v1.8.2 rilasciata con fix #17 rate-limiting feed e #19 cache YouTube Innertube

---

## Sommario Rapido

| Severità | Totale | Risolti | Aperti |
|---|---|---|---|
| 🔴 **Gravissime** | 5 | ✅ 5 (v1.7.8–v1.7.14) | — |
| 🟠 **Gravi** | 7 | ✅ 4 (+ 1 non-bug) | 🟠 2 |
| 🟡 **Medie** | 8 | ✅ 8 (v1.7.16–v1.8.2) | — |
| 🟢 **Lievi** | 6 | ✅ 2 | 🟢 4 |
| 🔵 **Feature mancanti** | 10 | ✅ 1 (v1.8.0) | 🔵 9 |
| 📦 **Build** | 1 | ✅ 1 | — |

---

## 🔴 Criticità GRAVISSIME (P0 — Da risolvere immediatamente)

### 1. ~~🔐 Segreto crittografico hardcoded nel sorgente~~ — ✅ RISOLTO in v1.7.10

> **Fix applicato:** Rimosso il segreto `RTB_SECRET` hardcoded. L'esportazione e l'importazione dei file `.rtb` utilizzano ora l'API nativa `safeStorage` di Electron, che cifra i token sfruttando il Keyring/Keychain del sistema operativo. I file esportati sono ora vincolati alla macchina corrente garantendo l'impossibilità di decifrarne il contenuto in caso di furto. Inserito anche un meccanismo per svuotare il campo token nel caso di importazioni legacy vulnerabili (v1.7.7).

---

### 2. ~~🔓 `sandbox: false` nel renderer~~ — ✅ RISOLTO in v1.7.12

> **Fix applicato:** Impostato `sandbox: true` in `src/main/index.ts`. Rinforzata la sicurezza chiudendo un potenziale vettore RCE da attacchi XSS dei feed.

```typescript
webPreferences: {
    preload: join(__dirname, '../preload/index.cjs'),
    sandbox: false  // ⚠️ — era così prima del fix
}
```

> **Nota:** Con `sandbox: false`, qualsiasi vulnerabilità XSS nel renderer (es. da un feed RSS malevolo che inietta contenuto nel DOM) potrebbe ottenere accesso completo al filesystem e al processo Node.js. Electron raccomanda esplicitamente `sandbox: true` dalla v20+.

**Impatto:** Remote Code Execution se un feed RSS contiene payload malevolo.

---

### 3. ~~💣 Mancato escape delle URL nei messaggi Telegram~~ — ✅ RISOLTO in v1.7.8

> **Fix applicato:** Introdotta `escapeUrl()` che codifica `&` → `&amp;` nelle URL (campi `{{link}}` e `item.image`). Separata dalla funzione `escape()` generica per gestire correttamente gli attributi `href`. Il loop di retry infinito è stato eliminato.

---

### 4. ~~🗑️ Eliminazione bot senza CASCADE nella history durante engine attivo~~ — ✅ RISOLTO in v1.7.13

```typescript
ipcMain.handle('delete-bot', (_, id) => {
    botEngine.removeClient(botId);
    return BotManager.deleteBot(botId);
});
```

La query `DELETE FROM bots WHERE id = ?` si affida a `ON DELETE CASCADE` per eliminare feeds e history. Ma:
- La coda di publish (`publishQueue`) potrebbe ancora contenere job riferiti al bot eliminato
- La `checkLoop()` in esecuzione potrebbe stare iterando proprio su quel bot
- Nessun lock o check `isRunning` viene fatto prima dell'eliminazione

> **Nota:** Eliminare un bot mentre l'engine è attivo può causare crash o invocazioni di metodi su oggetti inesistenti nel ciclo `processPublishQueue`.

**Soluzione applicata:** Fermare l'engine, purge della coda e invalidazione del client prima della `DELETE`.

---

### 5. ~~📦 Dipendenze criticamente obsolete~~ — ✅ RISOLTO in v1.7.14

> **Fix applicato:** Aggiornate tutte le dipendenze critiche. Build verificata con Electron 32.3.3 + Vite 5.4.21, TypeScript zero errori.

| Pacchetto | Da | A |
|---|---|---|
| `electron` | `28.2.0` | `32.3.3` (LTS, CVE EOL risolti) |
| `vite` | `4.5.2` | `5.4.21` (fix dir traversal CVE) |
| `electron-builder` | `24.9.1` | `25.1.8` |
| `vite-plugin-electron` | `0.15.4` | `0.28.8` |
| `typescript` | `5.3.3` | `5.9.3` |
| `@types/node` | `18.19.0` | `20.19.39` |
| `react` / `react-dom` | `18.2.0` | `18.3.1` |

**Non aggiornato:** `rss-parser@3.13.0` (nessuna alternativa attiva) e Electron 32→33+ (valutazione futura).

---

## 🟠 Criticità GRAVI (P1 — Da risolvere entro la prossima release)

### 6. ~~Items "posposti" durante le quiet hours vengono persi~~ — ✅ ANALISI RIVISTA: NON È UN BUG

> **Analisi approfondita (13 Aprile 2026):** Il comportamento descritto come bug è in realtà corretto. L'analisi originale era basata su un'assunzione errata.
>
> `cutoffDate = new Date(bot.start_date)` è una **data fissa** impostata dall'utente, non una finestra rolling. Un item pubblicato durante le quiet hours ha `pubDate > start_date` e NON è in history → al ciclo successivo (fuori dalle quiet hours) viene regolarmente trovato, accodato e inviato. Non esiste perdita.
>
> L'unico scenario teorico di perdita sarebbe un canale YouTube che pubblica >15 video durante le quiet hours (spingendo item fuori dalla finestra di fetch). Questo è praticamente impossibile.
>
> **Nessun fix necessario. Nessun bump di versione.**

---

### 7. ~~Stima approssimativa delle date YouTube~~ — ✅ RISOLTO in v1.7.11

> **Fix applicato:** Implementato un parser robusto e multilingua per le date relative di YouTube (supporto "ago" e "fa"). È stato invertito il meccanismo di fallback: se la data non è decifrabile, il sistema ora assegna il 1° Gennaio 2000 (passato remoto) invece di "adesso". Questa misura di sicurezza impedisce lo spam massivo di vecchi video in caso di errore di parsing o cambio formato dell'API YouTube.

---

### 8. ~~Log IPC duplicati: `bot-log` e `bot-logs-batch`~~ — ✅ RISOLTO in v1.7.8

> **Fix applicato:** `TelegramClient.logToUI()` ora delega a `TitanLogger.log()` (canale unificato `bot-logs-batch`). Rimossa dipendenza diretta da `BrowserWindow`. Tutti i log del client Telegram — inclusi errori di rete, FloodWait e retry — sono ora visibili nel terminale della Dashboard.

---

### 9. ~~Token Telegram visibile in chiaro nell'interfaccia~~ — ✅ RISOLTO in v1.7.8

> **Fix applicato:** Il campo token è ora `type="password"` in entrambi i componenti (`BotSettingsModal.tsx` e `BotSelector.tsx`). In `BotSettingsModal` è stato aggiunto un toggle visibilità con icona Eye/EyeOff. Il token nel form di creazione rapida del `BotSelector` è fisso `password`.

---

### 10. ~~Nessuna validazione del file `.rtb` importato~~ — ✅ RISOLTO in v1.7.15

> **Fix applicato:** Aggiunto layer di validazione `validateRtbBot` + `validateRtbFeed` in `manager.ts`, con le stesse regole degli handler IPC. Validazione eseguita prima di aprire la transazione SQLite (fail-fast). Controlli applicati: `name`/`channelId` non vuoti, `checkInterval` 1–1440, formato orari HH:MM, `type` in `podcast|news|youtube`, `validateFeedUrl` anti-SSRF per feed non-YouTube.

---

### 11. Assenza di `autoUpdater` nativo — 🟠 APERTO

> **Nota roadmap (13 Aprile 2026):** Questo punto sarà l'**ULTIMO** intervento prima del rilascio della **v2.0.0**.
> Verrà implementato solo dopo che tutti i punti aperti (fix #13–#20, lievi #22–#26, feature F1–F10)
> saranno completati e verificati. È il punto di chiusura del percorso verso la prima versione major.

L'auto-updater attuale è un semplice fetch di un JSON con comparazione stringhe di versione. Non c'è download automatico, né verifica firma, né progress bar. L'utente deve scaricare manualmente l'installer.

**Soluzione pianificata:** `electron-updater` (pacchetto `electron-builder`) con provider GitHub Releases.
Il server di aggiornamento coincide con la repo pubblica — zero infrastruttura aggiuntiva.

---

### 12. ~~`deleteBot` nel BotSelector non è tradotto~~ — ✅ RISOLTO in v1.7.8

> **Fix applicato:** La stringa hardcoded `'Profilo Bot eliminato'` è stata sostituita con `t('botSelector.successDelete')`. Chiave aggiunta a tutti gli 8 file locale. Anche le etichette "Active"/"Disabled"/"Enabled" in `BotSettingsModal` sono ora tradotte (`statusActive`, `statusDisabled`, `statusEnabled`).

---

## 🟡 Criticità MEDIE (P2 — Da pianificare) — Tutte APERTE

### ~~13. Nessun indice SQL sulla tabella `history`~~ — ✅ RISOLTO in v1.7.16

> **Fix applicato:** Aggiunti `idx_history_bot_id` e `idx_history_bot_id_sent_at` in `schema.ts`. Coprono `isProcessed()` e tutte le query COUNT stats. Idempotenti (`IF NOT EXISTS`), applicati sia allo schema iniziale (DB v6) che come migration v6 automatica per i DB esistenti.

### ~~14. Singleton mutabile globale per `botEngine`~~ — ✅ RISOLTO in v1.7.16

> **Fix applicato:** `new BotEngine()` non viene più eseguito all'import del modulo. Sostituito con `getBotEngine()` (lazy singleton). `ipc.ts` aggiornato a importare `getBotEngine` e chiamarla in tutti e 4 i call-site. L'istanza viene creata solo al primo handler IPC, dopo che l'app è pronta.

### ~~15. `dynamic import('electron')` dentro un loop~~ — ✅ RISOLTO in v1.7.16

> **Fix applicato:** `Notification` aggiunta all'import statico in cima a `engine.ts`. Rimosso il `import('electron').then(...)` asincrono eseguito ad ogni item inviato nel loop `processPublishQueue`. Guard semplificato in `if (bot.notifications_enabled && Notification.isSupported())`.

### ~~16. `db` esportato come variabile globale mutabile~~ — ✅ RISOLTO in v1.8.1

> **Fix applicato:** Rimossa la variabile globale `db` istanziata a livello di modulo. Introdotto lazy singleton via `export function getDB()` e `let _db: Database.Database | null = null`. L'istanza viene creata solo dentro `initDB()`, dopo che `app.getPath('userData')` è disponibile. `manager.ts` e `ipc.ts` aggiornati a usare `getDB()`.

### ~~17. Nessuna gestione del rate-limiting per bot con molti feed~~ — ✅ RISOLTO in v1.8.2

> **Fix applicato:** Aggiunto delay di 1 secondo tra il fetch di feed consecutivi in `checkLoop()` (salta l'ultimo). I feed disabilitati vengono ora filtrati prima del loop con log aggregato. Aggiunto warning log se la `publishQueue` supera 50 item. Il delay Telegram di 3s tra messaggi inviati era già presente.

### ~~18. `isActive` booleano vs intero inconsistente~~ — ✅ RISOLTO in v1.8.1

> **Fix applicato:** `getBots()` normalizza esplicitamente `is_active === 1` e `notifications_enabled === 1` in `boolean` prima di restituire i dati. `getFeeds()` applica lo stesso mapping su `is_active`. Il tipo TypeScript `BotConfig` è ora allineato con i valori reali restituiti.

### ~~19. YouTube Innertube: nessun cache/throttle~~ — ✅ RISOLTO in v1.8.2

> **Fix applicato:** Introdotta cache in-memory con TTL di 5 minuti in `youtube.ts`, chiave = channel ID/handle normalizzato. Quando più bot monitorano lo stesso canale, il fetch viene eseguito una sola volta per ciclo. Invalida automaticamente su `resetYouTubeSession()` e `BotEngine.stop()`. Esportata `clearYouTubeCache()` per usi futuri.

### ~~20. Backup creato **prima** delle migrazioni~~ — ✅ RISOLTO in v1.8.1

> **Fix applicato:** Il blocco di backup è ora condizionale (`if (currentVersion < 6)`). Viene eseguito solo quando ci sono migrazioni da applicare, e rimane posizionato prima delle migrazioni (semantica corretta per il ripristino). Su database già aggiornati (v6), nessun backup viene creato.

*(Dettagli completi: vedere documento originale Gemini)*

---

## 🟢 Criticità LIEVI (P3 — Nice to fix)

### 21. ~~ErrorBoundary non tradotto~~ — ✅ RISOLTO in v1.7.8

> **Fix applicato:** L'ErrorBoundary ora utilizza un dizionario locale di emergenza a 8 lingue (IT, EN, FR, DE, ES, PT, RU, ZH), indipendente dal Context React, per garantire il funzionamento anche quando il sistema i18n è in stato di errore. Tradotti titolo, sottotitolo, descrizione, pulsante e footer.

---

### 22. Uso di `key={i}` (indice) per i log — 🟢 APERTO
### 23. Nessun logging strutturato — 🟢 APERTO
### 24. File di build log nella root del progetto — 🟢 APERTO

### 25. ~~Doppia dichiarazione `build` in `package.json`~~ — ✅ RISOLTO in v1.7.8

> **Fix applicato:** I pattern `files` e `asarUnpack` sono stati consolidati nel campo `"build"` del `package.json` (che ha precedenza). L'`electron-builder.yml` è stato allineato per coerenza.

---

### 26. Due file LICENSE nella root — 🟢 APERTO

---

## 📦 Ottimizzazione Build — ✅ RISOLTO in v1.7.8

> **Fix applicato:** L'installer era cresciuto da ~94 MB a 1.5 GB a causa del bundling errato. Risolto con `ssr.noExternal: true` in `vite.config.ts` e pattern `files` espliciti in `package.json`. Risultato: **80.9 MB** (-95%).

| Metrica | Pre-fix | Post-fix | Riduzione |
|---|---|---|---|
| Installer `.exe` | 1,505 MB | **80.9 MB** | **-95%** |
| Archivio `.asar` | 1,502 MB | **17 MB** | **-99%** |
| File nell'asar | 6,317 | **66** | **-99%** |

> **Nota v1.7.15:** La configurazione `ssr.noExternal: true` è stata successivamente rimossa (non necessaria in lib mode non-SSR). Vedere `docs/changelogs/CHANGELOG_v1.7.15.md` per i dettagli sul fix ESM/CJS.

---

## 🔵 Funzionalità consigliate — 1 COMPLETATA, 9 APERTE

### ~~F1 — Validatore Intelligente dei Template~~ ✅ IMPLEMENTATO in v1.8.0

> **Implementato il 16/04/2026:** Nuovo file `src/renderer/src/utils/templateValidator.ts` con funzione `validateTemplate()`. Integrato in `TemplateEditor.tsx` con feedback visivo real-time (bordo colorato + pannello messaggi). 9 tipi di check: tag HTML non supportati da Telegram, tag non bilanciati, `<a>` senza `href`, chip sconosciuti, chip pericolosi in `href`, template vuoto, chip nel messaggio di avvio. Localizzazione completata per tutte e 9 le lingue (de/es/fr/pt/ru/zh avevano la sezione `templateEditor` mancante, ora aggiunta).

*(F2–F10 invariate — vedere documento originale Gemini per i dettagli)*

---

## Riepilogo Azioni Raccomandate

### Sprint v1.7.8 — ✅ COMPLETATO
1. ✅ Fix escape URL nei template Telegram (bug #3)
2. ✅ Unificare i canali di log IPC (bug #8)
3. ✅ Mascherare token con `type="password"` (bug #9)
4. ✅ Tradurre stringhe hardcoded (bug #12, #21)
5. ✅ Fix build bloat installer (da 1.5 GB a 80.9 MB)
6. ✅ Consolidamento config electron-builder (bug #25)

### Release successiva (v1.8.0 e seguenti)
7. ✅ Rimuovere segreto hardcoded e usare `safeStorage` per export (bug #1) — *RISOLTO v1.7.10*
8. ✅ Abilitare `sandbox: true` nel renderer (bug #2) — *RISOLTO v1.7.12*
9. ✅ Validare struttura file `.rtb` importati (bug #10) — *RISOLTO v1.7.15*
10. ✅ Aggiungere indice SQL alla history (bug #13) — *RISOLTO v1.7.16*
11. ✅ Eliminare singleton `botEngine` (bug #14) — *RISOLTO v1.7.16*
12. ✅ Eliminare `dynamic import('electron')` in loop (bug #15) — *RISOLTO v1.7.16*
13. ✅ Normalizzare `isActive` booleano vs intero (bug #18) — *RISOLTO v1.8.1*
14. ✅ Spostare backup dopo le migrazioni (bug #20) — *RISOLTO v1.8.1*
15. ✅ Rimuovere `db` globale mutabile (bug #16) — *RISOLTO v1.8.1*
16. ✅ Implementare rate-limiting (bug #17) — *RISOLTO v1.8.2*
17. ✅ Aggiungere cache/throttle YouTube Innertube (bug #19) — *RISOLTO v1.8.2*

### ~~F1 — Validatore Intelligente dei Template~~ ✅ FATTO v1.8.0

### Funzionalità (F2–F10) e lievi (#22–#26)
*(Da pianificare nel percorso verso v2.0.0)*

### 🔴 Ultimo punto prima di v2.0.0
- **#11** `autoUpdater` nativo — `electron-updater` + GitHub Releases provider
