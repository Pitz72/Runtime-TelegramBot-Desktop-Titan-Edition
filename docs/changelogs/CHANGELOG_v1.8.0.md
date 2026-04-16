# Changelog v1.8.0

**Data rilascio:** 16 Aprile 2026  
**Versione precedente:** v1.7.16

---

## Nuova Funzionalità: Sistema di Verifica Intelligente dei Template

### Descrizione

Implementato un validatore in tempo reale integrato direttamente nell'editor dei template. Ad ogni modifica del testo, il validatore analizza il contenuto e segnala errori o avvertimenti prima del salvataggio.

### File coinvolti

- **`src/renderer/src/utils/templateValidator.ts`** ← nuovo file (logica di validazione)
- **`src/renderer/src/components/TemplateEditor.tsx`** ← aggiunto pannello di feedback
- **Tutti i file locale** (`it`, `en`, `de`, `es`, `fr`, `pt`, `ru`, `zh`) ← aggiunta chiave `validOk` e, per le lingue prive della sezione, aggiunta la sezione `templateEditor` completa

---

## Dettaglio tecnico

### `templateValidator.ts`

Funzione `validateTemplate(template: string, isStartup?: boolean): ValidationIssue[]` con tre livelli di severità:
- `error` — errori che causano sicuramente il fallimento del parsing Telegram
- `warning` — situazioni rischiose ma non necessariamente fatali
- `info` — note informative (template vuoto, chip nel messaggio di avvio)

**Controlli implementati:**

#### 1. Tag HTML non supportati → `error`
Telegram HTML mode accetta solo: `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<ins>`, `<s>`, `<strike>`, `<del>`, `<code>`, `<pre>`, `<a>`, `<tg-spoiler>`, `<tg-emoji>`, `<blockquote>`, `<span>`.

Qualsiasi altro tag (es. `<div>`, `<p>`, `<br>`, `<span style>`) genera un errore.

#### 2. Tag non bilanciati → `error`
Stack-based parsing: ogni tag aperto viene tracciato e verificato alla chiusura corrispondente.
- Tag aperto mai chiuso → `<b> was opened but never closed.`
- Tag di chiusura senza apertura → `</b> found without a matching opening tag.`
- Tag di chiusura errato → `</b> closes the wrong tag (expected </i>).`

#### 3. `<a>` senza `href` → `error`
Il tag `<a>` senza attributo `href` è invalido in Telegram HTML e provoca errore API.

#### 4. `<span>` senza `class="tg-spoiler"` → `warning`
Telegram accetta `<span>` solo nella forma `<span class="tg-spoiler">`. Uso generico segnalato come warning.

#### 5. `<tg-emoji>` senza `emoji-id` → `warning`
Attributo obbligatorio per l'emoji custom.

#### 6. `{{chip}}` sconosciuto → `warning`
Chip validi: `{{title}}`, `{{feedName}}`, `{{link}}`, `{{summary}}`. Qualsiasi altro chip (es. `{{titolo}}`, `{{url}}`) non viene sostituito a runtime.

#### 7. Chip pericoloso dentro `href` → `warning`
Pattern `<a href="{{title}}">` è rischioso: il titolo può contenere `&`, `<`, `>` che rompono l'URL. Solo `{{link}}` è safe in `href` (viene escaped con `escapeUrl()`).

#### 8. Template vuoto → `info`
Segnala che verrà usato il template predefinito interno.

#### 9. Chip nel template di avvio → `info`
Il template di avvio non sostituisce chip: `{{title}}` apparirà letteralmente nel messaggio.

---

### `TemplateEditor.tsx`

**Nuovo comportamento:**

- Il validatore viene chiamato con `useMemo` ad ogni cambiamento del valore (computazione sincrona, nessun debounce necessario).
- Il bordo della textarea cambia colore in base allo stato:
  - Default: `border-titan-500/10`
  - Warning presente: `border-yellow-500/30`
  - Errore presente: `border-red-500/40`
- Il pannello di feedback appare sotto la textarea solo quando il template non è vuoto:
  - Nessun problema → `✓ Template valido` in verde
  - Problemi → lista di messaggi con icona `✗` (errori), `⚠` (warning), `ℹ` (info) colorati di conseguenza

---

### Localizzazione

La chiave `templateEditor.validOk` è stata aggiunta a tutte e 9 le lingue supportate. Le 6 lingue prive della sezione `templateEditor` (de, es, fr, pt, ru, zh) hanno ricevuto la sezione completa con tutte le chiavi tradotte.

---

## 📦 Versione
- Versione aggiornata alla **v1.8.0** in `package.json`.
- Nessuna migrazione DB necessaria.
