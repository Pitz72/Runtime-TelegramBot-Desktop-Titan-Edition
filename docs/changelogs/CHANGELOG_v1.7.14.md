# Changelog v1.7.14 (Titan Edition)

**Data di Rilascio:** 13 Aprile 2026

## 🐛 Fix Critici: Spam Continuo di Video YouTube (regressione da Gemini)

Questa release risolve una regressione introdotta da interventi esterni al codebase che aveva reso il bot inutilizzabile, causando invii ripetuti e incontrollati di video YouTube (e in alcuni casi articoli RSS) ad ogni ciclo di check.

---

### 1. Bug: `includes('or')` nel parser di date italiane YouTube

**File:** `src/main/bot/youtube.ts`

**Problema:** La condizione di rilevamento delle ore in italiano era:
```typescript
if (rawDateText.includes('hour') || rawDateText.includes('or')) ...
```
La stringa `'or'` è contenuta nelle parole italiane **"gi*or*no"** e **"gi*or*ni"** (giorni = days).  
Conseguenza: un video pubblicato "3 giorni fa" veniva parsato come "3 **ore** fa", risultando
recentissimo e bypassando il filtro `cutoffDate`. Ogni ciclo trovava questi video come "nuovi" e li reinviava.

**Fix:** Sostituito il check con le parole italiane corrette per "ora/ore":
```typescript
if (rawDateText.includes('hour') || rawDateText.includes('ora') || rawDateText.includes('ore')) ...
```

---

### 2. Bug: Fallback `videosTab.contents` produceva IDs YouTube instabili

**File:** `src/main/bot/youtube.ts`

**Problema:** Il codice usava:
```typescript
const videoList = videosTab?.videos || videosTab?.contents || [];
```
`videosTab.contents` può contenere oggetti non-video (RichItem, sezioni, shelf) dove `v.id`
**non è il videoId YouTube** ma un identificatore interno. Questo produceva URL malformati
(`https://www.youtube.com/watch?v=<wrong-id>`) e quindi MD5 diversi tra una sessione e l'altra.
Risultato: `isProcessed()` trovava MD5 diversi tra il primo invio e i cicli successivi → re-invio infinito.

**Fix:** Rimosso il fallback. Usato esclusivamente `videosTab.videos`:
```typescript
const videoList = videosTab?.videos || [];
```
Se la lista è vuota, la sessione viene resettata per il ciclo successivo (comportamento già presente).

---

### 3. Bug: Reset automatico della sessione Innertube ogni 30 minuti

**File:** `src/main/bot/youtube.ts`

**Problema:** Gemini aveva aggiunto un reset automatico della sessione Innertube ogni 30 minuti
(`SESSION_MAX_AGE_MS = 30 * 60 * 1000`). La nuova sessione post-reset poteva restituire
oggetti con struttura diversa, aggravando il bug #2 e causando inconsistenza negli ID generati.
Il codice originale (pre-Gemini) usava una sessione persistente per l'intera vita dell'app.

**Fix:** Rimosso il timer. La sessione è ora persistente come nel codice originale:
- Si crea una volta al primo accesso
- Si resetta **solo** se YouTube restituisce 0 video (possibile sessione stale) o in caso di errore

---

### 4. Miglioramento: Guardia su videoId vuoto

**File:** `src/main/bot/youtube.ts`

Aggiunto skip esplicito per oggetti senza videoId valido, con log diagnostico:
```typescript
if (!videoId) {
    TitanLogger.log(`[YouTube] Skipping item with no video ID (type: ${v.type || 'unknown'})`);
    continue;
}
```
Evita che URL malformati (`?v=`) vengano generati e inseriti in history con MD5 errato.

---

## 📦 Build e Versione
- Versione aggiornata alla **v1.7.14** in `package.json`.
