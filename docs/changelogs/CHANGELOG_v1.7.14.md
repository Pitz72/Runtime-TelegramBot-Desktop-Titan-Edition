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

---

## 🔒 Aggiornamento Dipendenze Critiche (post-release, stesso commit)

Risolto il problema P0 **#5 — Dipendenze criticamente obsolete**. Nessuna modifica al codice sorgente, solo aggiornamento `package.json` e `package-lock.json`. TypeScript typecheck: ✅ zero errori.

| Pacchetto | Da | A | Note |
|---|---|---|---|
| `electron` | `28.2.0` | `32.3.3` | Electron 28 era EOL con CVE noti. Electron 32 è LTS supportato. |
| `electron-builder` | `24.9.1` | `25.1.8` | Compatibilità con Electron 32, build pipeline aggiornata. |
| `vite` | `4.5.2` | `5.4.21` | Vite 4 aveva vulnerabilità directory traversal note. Vite 5 LTS. |
| `@vitejs/plugin-react` | `4.2.1` | `4.7.0` | Compatibile con Vite 5. |
| `vite-plugin-electron` | `0.15.4` | `0.28.8` | Versione Vite 4 → versione Vite 5 compatible. |
| `vite-plugin-electron-renderer` | `0.14.5` | `0.14.6` | Aggiornamento patch. |
| `typescript` | `5.3.3` | `5.9.3` | Ultimo TypeScript 5.x disponibile. |
| `@types/node` | `18.19.0` | `20.19.39` | Allineato a Node.js 20 LTS. |
| `@types/react` | `18.2.48` | `18.3.28` | Allineato a React 18.3.x. |
| `@types/react-dom` | `18.2.18` | `18.3.7` | Allineato a React 18.3.x. |
| `@types/better-sqlite3` | `7.6.9` | `7.6.13` | Aggiornamento patch tipi. |
| `react` | `18.2.0` | `18.3.1` | Latest React 18.x. |
| `react-dom` | `18.2.0` | `18.3.1` | Latest React 18.x. |

**Non aggiornato (richiede valutazione dedicata):**
- `rss-parser@3.13.0` — ultimo aggiornamento 2022, nessuna versione major alternativa attiva
- Electron 32 → 33+ — possibile in futuro, Electron 32 è comunque LTS supportato
