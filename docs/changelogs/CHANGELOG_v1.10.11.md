# Changelog v1.10.11 — "CleanTube"

**Data:** 28 Aprile 2026  
**Tipo:** Bugfix  
**Piattaforma:** Windows, Linux, macOS  
**Stato:** Stabile (Produzione)

---

## Fix: Rimosso locale forcing YouTube (gl/hl=en)

**File:** `src/main/bot/youtube.ts`

### Problema

In v1.10.8 era stato introdotto `Innertube.create({ gl: 'US', hl: 'en' } as any)` con l'intenzione di stabilizzare il formato delle date restituite dall'API. I parametri `gl` e `hl` non esistono nel tipo `SessionOptions` di youtubei.js v17 — il cast `as any` bypassava silenziosamente TypeScript.

L'effetto osservato nel log del 28 Apr 2026: diversi canali restituivano **0 item** con session reset forzato:
- `@ArcheologiaInformatica` → 0 items → session reset
- `@MagnetarMan` → 0 items → session reset
- `@fokewulf` → 0 items → session reset
- `@architecday` → 0 items → session reset

### Fix

```typescript
// DA (problematico):
youtube = await Innertube.create({ gl: 'US', hl: 'en' } as any);

// A (corretto):
youtube = await Innertube.create();
```

### Perché è sicuro

Il parser date di v1.10.9 gestisce già tutti i formati senza forzare il locale:
- Forme abbreviate: `3mo ago`, `1y ago`, `22h ago`, `2w ago`, `7d ago`
- Forme full-word inglesi: `3 months ago`, `1 year ago`
- Forme italiane: `3 mesi fa`, `1 anno fa`

---

## File Modificati

- `src/main/bot/youtube.ts` — rimosso `{ gl: 'US', hl: 'en' } as any` da `Innertube.create()`
- `package.json` — versione → 1.10.11
- Documentazione: `CHANGELOG.md`, `docs/STATO-PROGETTO.md`

---

*(C) 2026 Runtime Radio — Titan Desktop v1.10.11 "CleanTube"*
