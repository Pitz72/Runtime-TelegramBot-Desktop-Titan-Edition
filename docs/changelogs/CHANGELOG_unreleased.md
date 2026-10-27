# Non rilasciato — revisione del 27 ottobre 2026

Lavoro nato da un'analisi completa del codice della 2.4.1 e dagli appunti rimasti aperti dopo la 2.4. Diviso in blocchi; ogni blocco è un commit a sé.

## Blocco 1 — Dipendenze di esercizio e sicurezza

- **Electron 44.9.0 → 44.9.3.** La 44.9.0 aveva una vulnerabilità di livello alto ([GHSA-jr5w-w6x2-84p9](https://github.com/advisories/GHSA-jr5w-w6x2-84p9), certificati intermedi eMudhra compromessi). Conta più del solito: la build Windows non è firmata, e l'integrità degli aggiornamenti automatici dipende solo dalla connessione HTTPS verso GitHub.
- **electron-updater 6.8.9 → 6.8.11**, e correzioni di `npm audit` che non rompono nulla (`fast-uri`, `postcss-selector-parser`). Restano gli avvisi della sola catena di sviluppo (Vitest, Vite): non finiscono nell'installer e si chiudono con l'aggiornamento degli strumenti.
- **youtubei.js 17.0.1 → 17.2.0, con un adattamento senza il quale YouTube avrebbe smesso di pubblicare.** Dalla 17.2 la lista dei video di un canale contiene nodi `LockupView` invece di nodi `Video`: niente `title.text`, niente `published.text`. Presi così, tutti i video avevano data illeggibile, finivano sul ripiego dell'anno 2000 e venivano scartati dal filtro della data di partenza. Ora ogni elemento passa da `adaptLockupView` (in `rules.ts`, con 4 test); il ripescaggio dal memo, nato per la 17.0.1, resta come ultima risorsa. Verificato dal vivo con il vero `fetchYouTubeVideos` su un canale pubblico, per ID e per handle: 15 video con titolo e data veri.
- **Un titolo YouTube non può più diventare un oggetto.** Il ripiego `v.title?.text || v.title` usava l'oggetto Text quando il testo mancava.
- **I link aperti dall'interfaccia vanno nel browser solo se https**, come già faceva il canale IPC `open-external`. Il gestore delle finestre nuove lasciava passare anche http, e il commento diceva «stessa regola».
