# Documentazione — Runtime TelegramBot Desktop Titan Edition

Indice della documentazione del progetto.

> **Paternità.** Software e documentazione sono stati scritti facendo un uso massiccio di modelli linguistici — Google Gemini, dalla 2.5 alla 3.1, e Anthropic Claude, da Sonnet 4.6 a Opus 5. Il concetto, la visione, la direzione progettuale, la cura di ogni dettaglio e la caccia ai bug sono di **Simone Pizzi**, che ha progettato, diretto e verificato ogni parte del lavoro. Il resoconto completo è nel [README](../README.md#come-è-stato-scritto).

> **Nota sulle versioni.** Questo indice non riporta il numero di versione corrente né l'elenco delle release: la fonte unica è [`CHANGELOG.md`](../CHANGELOG.md) nella radice del repository. La versione effettiva è quella in `package.json`. Il vecchio indice duplicava la tabella dei changelog ed è rimasto indietro di quattordici release — non ripetiamo l'errore.

---

## Per chi usa l'applicazione

| | |
| :--- | :--- |
| [Manuale Utente Avanzato](../Manuale%20Utente%20Avanzato/) | 9 capitoli in italiano e inglese, con i PDF impaginati in `typst/`. Documento completo e definitivo. |
| [Guide rapide](guide/) | Guida di avvio rapido e file «leggimi» in italiano e inglese, distribuiti insieme agli installer. |
| [Guide in-app](../src/renderer/src/assets/guides/) | La guida consultabile dentro l'applicazione, in italiano e inglese. Documento più breve delle quick-start. |

## Per chi lavora sul codice

| | |
| :--- | :--- |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Come si compila, le trappole del progetto, cosa toccare e cosa no. **Da leggere prima di tutto il resto.** |
| [SECURITY.md](../SECURITY.md) | Modello di sicurezza, cifratura dei token, trattamento dei feed non attendibili, come segnalare vulnerabilità. |
| [architettura.md](architettura.md) | Whitepaper architetturale: modello producer-consumer, OmniSync, sicurezza. |
| [database.md](database.md) | Schema SQLite, catena delle migrazioni v1→v12, dove vivono i file. |
| [build.md](build.md) | Compilazione e pacchettizzazione per Windows e Linux, requisiti e CI. |
| [CHANGELOG.md](../CHANGELOG.md) | Storia delle versioni. I dettagli per release sono in [`changelogs/`](changelogs/). |

## Lavoro in corso

| | |
| :--- | :--- |
| [PIANO-APERTURA.md](PIANO-APERTURA.md) | Checklist operativa del passaggio a open source: cosa è fatto, cosa manca, in che ordine e perché quell'ordine. Da spostare in `storico/` a lavoro concluso. |

## Idee non realizzate

| | |
| :--- | :--- |
| [idee/modalita-server.md](idee/modalita-server.md) | Modalità headless su VPS con web UI o API REST. Analizzata, mai iniziata. È l'unico progetto formalizzato ancora aperto, e il candidato più naturale per un contributo esterno. |

## Archivio storico

La cartella [`storico/`](storico/) raccoglie tutto ciò che è concluso e **non viene più aggiornato**: analisi tecniche superate, relazioni su incidenti risolti, roadmap completate, progetti chiusi, l'EULA proprietaria pre-apertura e i manuali della serie 1.7.x.

La regola è semplice: se un documento sta in `storico/` è materiale d'epoca; se sta fuori, è attuale e mantenuto.
