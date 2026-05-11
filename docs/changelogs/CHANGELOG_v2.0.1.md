# v2.0.1 — Hotfix: doppio invio al termine delle quiet hours

**Data di rilascio:** 2026-05-11

## Overview

Hotfix per race condition nella logica `drain + processFeed` che causava la pubblicazione doppia di item podcast al primo ciclo utile dopo la fine delle quiet hours. Confermato sul campo il 2026-05-11: episodi di TechnoPillz e Il Tiralinee inviati due volte sia su Runtime Radio (06:15) che su TechnoPillz Riot (06:32).

## Bug risolto

### Race condition drain + processFeed (doppio invio quiet hours)

**Causa:** In `checkLoop`, `drainPendingQueue()` gira prima del loop sui feed. Aggiunge gli item recuperati a `publishQueue` ma non li marca in `history` — `markProcessed()` avviene solo dentro `processPublishQueue()` dopo il send effettivo. Quando subito dopo `processFeed()` scansiona gli stessi feed RSS, trova quegli item ancora assenti da `history` → `isProcessed()` → `false` → li accoda una seconda volta. `processPublishQueue()` non aveva un guard anti-dedup → entrambe le copie venivano inviate.

**Quando si manifesta:** solo quando un item nuovo arriva durante le quiet hours. Al primo ciclo dopo la fine del silenzio drain e processFeed collidono sullo stesso item.

**Perché prevalentemente di lunedì:** i podcast TechnoPillz e Il Tiralinee escono la domenica sera / notte tra domenica e lunedì, esattamente dentro la finestra di silenzio.

**Fix — `src/main/bot/engine.ts`:**
- Aggiunto guard `isProcessed()` in `processPublishQueue()` prima di ogni invio. Se l'item è già stato marcato (dal job precedente della stessa coppia), il secondo job viene scartato con log `⏭️ Skip duplicato in coda`.

**Fix secondario — `src/main/bot/manager.ts` + `engine.ts`:**
- `addToPendingQueue()` ora restituisce `boolean` (`changes > 0`).
- Il log `🌙 salvato in coda persistente` viene stampato solo quando l'`INSERT` è effettivo. In precedenza il messaggio appariva ad ogni ciclo di quiet hours per lo stesso item (l'`INSERT OR IGNORE` rigettava silenziosamente ma il log veniva emesso ugualmente).

## File modificati

- `src/main/bot/engine.ts` — guard dedup in `processPublishQueue()`, log condizionale in `processFeed()`
- `src/main/bot/manager.ts` — `addToPendingQueue()` restituisce `boolean`
