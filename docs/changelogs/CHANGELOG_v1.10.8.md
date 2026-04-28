# Changelog v1.10.8 — "Alignment"

**Data:** 28 Aprile 2026  
**Tipo:** Fix + Documentazione  
**Piattaforma:** Windows, Linux, macOS  
**Stato:** Stabile (Produzione)

---

## Contesto

Questa versione chiude la sessione di lavoro che ha introdotto v1.10.6 "SteelCore" e v1.10.7 "SilentGuard". Comprende un fix al codice e un audit completo della documentazione che era rimasta parzialmente desincronizzata rispetto alle versioni precedenti.

---

## Fix: YouTube Locale Forcing

**File:** `src/main/bot/youtube.ts`

`Innertube.create()` veniva chiamato senza parametri di localizzazione. Su macchine con sistema operativo in lingua diversa dall'italiano o dall'inglese (tedesco, spagnolo, francese, ecc.), YouTube InnerTube restituiva le date in formato localizzato — es. `"vor 3 Stunden"`, `"hace 2 días"` — che il parser di date non riconosceva. Il risultato era il fallback silenzioso alla data `2000-01-01`, che attivava erroneamente il filtro cutoff IronShield e scartava item validi.

```typescript
// PRIMA
youtube = await Innertube.create();

// DOPO
youtube = await Innertube.create({ gl: 'US', hl: 'en' });
```

Con `gl: 'US', hl: 'en'` le risposte InnerTube sono sempre in inglese, indipendentemente dalla lingua del sistema operativo. Il comportamento diventa deterministico su tutte le piattaforme.

---

## Audit Documentazione

Durante la sessione di lavoro è emersa una desincronizzazione storica tra la documentazione e la realtà del progetto. I file erano stati aggiornati in fasi successive senza un passaggio finale di allineamento.

### Problemi corretti

**`docs/index.md`**
- La riga "Versione corrente" puntava a v1.10.3 (non aggiornata da oltre un mese).
- Nella tabella storico mancavano interamente le righe per v1.10.3, v1.10.4, v1.10.5, v1.10.6, v1.10.7.
- Aggiunta entry per tutte le versioni mancanti. Versione corrente aggiornata a v1.10.8.

**`CHANGELOG.md`** (root)
- La sezione "Versione Attuale" indicava v1.10.6 mentre l'indice in cima mostrava già v1.10.7 come corrente.
- Inconsistenza interna corretta. Aggiunta voce v1.10.8 come corrente.

**`docs/STATO-PROGETTO.md`**
- La riga "Versione corrente" in testa al documento non era allineata con l'ordine di esecuzione aggiornato.
- Corretta la sezione Gumroad con la versione attuale.
- Aggiunta la voce v1.10.8 nell'ordine di esecuzione.

---

## File Modificati

- `src/main/bot/youtube.ts` — `Innertube.create({ gl: 'US', hl: 'en' })`
- `package.json` — versione 1.10.7 → 1.10.8
- `CHANGELOG.md` — voce v1.10.8, "Versione Attuale" allineata
- `docs/index.md` — versione corrente + righe storico v1.10.3–v1.10.8
- `docs/STATO-PROGETTO.md` — versione corrente, Gumroad section, ordine esecuzione
- `docs/changelogs/CHANGELOG_v1.10.8.md` — questo file

---

*(C) 2026 Runtime Radio — Titan Desktop v1.10.8 "Alignment"*
