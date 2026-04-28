# Changelog v1.10.6 — "SteelCore" Quality & Robustness Patch

**Data:** 28 Aprile 2026  
**Tipo:** Bugfix / Robustezza Interna  
**Piattaforma:** Windows, Linux, macOS  
**Stato:** Stabile (Produzione)

---

## Contesto

Sessione di audit approfondito post-lancio: lettura completa della codebase, verifica della sincronizzazione documentazione/codice e analisi critica della pipeline anti-spam IronShield (v1.10.5). Tutti i fix sono il risultato di questa revisione.

---

## 🐛 Bugfix

### 1. Digest Mode: ordine operazioni corretto (`engine.ts`)
**Il problema:** `updateFeedDigestLastSent()` veniva chiamato **prima** di `sendMessage()`. In caso di fallimento Telegram, il timer veniva comunque avanzato (es. +6 ore) ma la coda non veniva svuotata. Al ciclo successivo, gli stessi item venivano re-inviati insieme ai nuovi, generando un digest doppio o incompleto.

**Il fix:** `updateFeedDigestLastSent()` viene ora chiamato **solo dopo** conferma del successo dell'invio. La coda vuota avanza comunque il timer (comportamento invariato). In caso di failure Telegram il timer non avanza e il digest viene riprovato al ciclo successivo.

---

### 2. Parser RSS: date malformate bypassavano i Lock cutoff (`parser.ts` + `engine.ts`)
**Il problema:** `new Date("stringa_invalida")` restituisce un oggetto `Date` con `getTime() === NaN`. In JavaScript `NaN <= x` e `NaN < x` sono sempre `false`, quindi un item con data non parsabile superava silenziosamente sia il Lock 1 (cutoff 2000) che il Lock 2 (cutoff start_date) in `engine.ts`.

**Il fix (doppia linea di difesa):**
- `parseDate()` in `parser.ts` ora valida `!isNaN(d.getTime())` su tutti e 4 i path principali (`isoDate`, `pubDate`, `published`, `updated`) prima di restituire la data. Se invalida, torna `null` e l'item viene scartato dal parser stesso.
- Lock 1 in `engine.ts` aggiornato a `isNaN(itemTime) || itemTime <= ...` come protezione residuale indipendente dal parser.

---

### 3. Schema DB: safety check usava definizione indice obsoleta (`schema.ts`)
**Il problema:** Il safety check post-migrazione ricreava `idx_history_title_dedup` includendo `feed_id` — la definizione pre-IronShield. Un DB corrotto che passava da questo path finiva con l'indice vecchio, vanificando la deduplica globale di v1.10.5.

**Il fix:** Il safety check ora crea l'indice su `(bot_id, title_hash)` — coerente con la migration v7 e la logica IronShield.

---

## 🛡️ Robustezza

### 4. Threshold anti-spam 2000: allineamento UTC (`engine.ts` + `youtube.ts`)
La costante hardcoded `946681200000` in `engine.ts` e il fallback `new Date(2000, 0, 1)` in `youtube.ts` erano entrambi dipendenti dal timezone del sistema operativo. Su macchine in timezone diverso da UTC+1, il valore prodotto dal fallback non corrispondeva esattamente alla soglia, creando un margine di errore di alcune ore.

**Il fix:** Entrambi usano ora `Date.UTC(2000, 0, 1)` — valore fisso `946684800000` indipendente dal timezone. Fallback e threshold sono garantiti identici su qualsiasi sistema.

### 5. Warning `start_date` nel futuro (`engine.ts`)
Se la `start_date` di un bot era impostata nel futuro, il bot girava silenziosamente pubblicando zero item senza alcuna spiegazione visibile. Il log ora avvisa esplicitamente ad ogni fetch con un messaggio `⚠️ ATTENZIONE: la start_date del bot è nel futuro`.

### 6. Log MAX_RETRIES più chiaro (`engine.ts`)
Il messaggio di log per item definitivamente non inviati dopo 3 tentativi ora specifica esplicitamente "Contenuto NON inviato al canale" e suggerisce di verificare la connessione Telegram — distinguendo chiaramente la perdita di contenuto da un normale skip per deduplica.

---

## 📚 Documentazione e Configurazione

### 7. `electron-builder.yml` — unica fonte di verità
La configurazione build era duplicata e parzialmente incoerente tra `electron-builder.yml` e il campo `build` di `package.json`. Tutti i parametri sono stati consolidati in `electron-builder.yml` (aggiunta `fileAssociations` per `.rtb`, icone per tutte le piattaforme, parametri firma macOS, maintainer Linux). La chiave `build` è stata rimossa da `package.json`.

### 8. Commenti stantii in `manager.ts`
Due commenti su `encryptTokenForExport` descrivevano il metodo come "AES-256-CBC cifrato" — tecnicamente errato: il metodo usa `safeStorage.encryptString`. Corretti in "safeStorage cifrato".

### 9. Log inizializzazione DB (`schema.ts`)
Il messaggio di log per nuove installazioni dichiarava "Database inizializzato alla v9" mentre il `user_version` veniva impostato a `10`. Corretto.

### 10. Sincronizzazione documentazione
Aggiornati `STATO-PROGETTO.md`, `CHANGELOG.md`, `docs/index.md` e `docs/PROGETTO-PORTING.md` per riflettere lo stato reale del progetto (versione, issue chiuse, storico release completo, doc porting marcata come completata).

---

*(C) 2026 Runtime Radio — Titan Desktop v1.10.6 "SteelCore"*
