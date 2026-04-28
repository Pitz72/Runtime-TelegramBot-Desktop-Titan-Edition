# Changelog v1.10.9 — "QuickFix: YouTube Date Parser"

**Data:** 28 Aprile 2026  
**Tipo:** Hotfix critico  
**Piattaforma:** Windows, Linux, macOS  
**Stato:** Stabile (Produzione)

---

## Il Problema

In v1.10.8 "Alignment" è stato introdotto il locale forcing di InnerTube (`gl: 'US', hl: 'en'`). Questa modifica ha cambiato il formato delle date restituite dall'API YouTube da forme full-word (es. `"3 mesi fa"` con OS italiano) alle forme abbreviate standard InnerTube in inglese (es. `"3mo ago"`, `"1y ago"`, `"22h ago"`).

Il parser di date in `youtube.ts` cercava corrispondenze full-word (`includes('month')`, `includes('year')`, `includes('hour')`, ecc.) che non matchano le abbreviazioni. Di conseguenza:

- `date = new Date()` veniva creato all'inizio del blocco
- Nessun ramo `else if` lo modificava (nessuna corrispondenza trovata)
- **Tutte le date YouTube venivano impostate alla data odierna**

Effetti osservati nel log del 28 Aprile 2026:
- Ogni item YouTube mostrava `date: 2026-04-28` indipendentemente da `dateText` ("3y ago", "1mo ago", ecc.)
- Tutti gli item passavano il filtro cutoff (data oggi ≥ start_date oggi)
- Centinaia di item venivano inseriti nella `pending_queue` invece di essere scartati per data vecchia

---

## Il Fix

Aggiunto un pre-check regex per le forme abbreviate InnerTube prima della catena `else if` full-word esistente.

```typescript
// Forme abbreviate InnerTube con hl:'en' (es. "3mo ago", "1y ago", "22h ago").
// La regex deve testare 'mo' prima di 'm' per evitare match parziali.
const abbrev = rawDateText.match(/(\d+)(mo|min|y|w|h|d|m|s)\s*ago/i);
if (abbrev) {
    const n = parseInt(abbrev[1]);
    const u = abbrev[2].toLowerCase();
    if (u === 'y') date.setFullYear(date.getFullYear() - n);
    else if (u === 'mo') date.setMonth(date.getMonth() - n);
    else if (u === 'w') date.setDate(date.getDate() - n * 7);
    else if (u === 'd') date.setDate(date.getDate() - n);
    else if (u === 'h') date.setHours(date.getHours() - n);
    else if (u === 'm' || u === 'min') date.setMinutes(date.getMinutes() - n);
    else if (u === 's') date.setSeconds(date.getSeconds() - n);
} else {
    // Forme full-word (retrocompatibilità: "3 months ago", "2 giorni fa", ecc.)
    ...
}
```

La catena full-word rimane invariata per retrocompatibilità con eventuali altre sorgenti.

---

## File Modificati

- `src/main/bot/youtube.ts` — regex abbreviata InnerTube nel parser date
- `package.json` — versione 1.10.8 → 1.10.9
- Documentazione: `CHANGELOG.md`, `docs/index.md`, `docs/STATO-PROGETTO.md`

---

*(C) 2026 Runtime Radio — Titan Desktop v1.10.9*
