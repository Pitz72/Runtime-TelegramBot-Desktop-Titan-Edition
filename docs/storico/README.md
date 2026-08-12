# Archivio storico

**Niente in questa cartella viene più aggiornato.** Sono documenti d'epoca: descrivono lo stato del progetto nel momento in cui furono scritti, e vengono conservati perché la storia di come Titan è arrivato dov'è ha valore — soprattutto le cronache dei bug, che spiegano *perché* certe parti del codice sono scritte in un modo che altrimenti sembrerebbe eccessivo.

Se cerchi lo stato attuale, il punto di partenza è [`docs/README.md`](../README.md).

## Analisi tecniche e cronache di bug

| Documento | Cosa racconta |
| :--- | :--- |
| [AUDIT-2026-08-12-pre-opensource.md](AUDIT-2026-08-12-pre-opensource.md) | Revisione completa di codice e documentazione prima dell'apertura del sorgente (v2.1.7, agosto 2026). Elenca criticità, feature mancanti e il piano di riorganizzazione da cui deriva la struttura attuale di `docs/`. |
| [analisi-tecnica.md](analisi-tecnica.md) | Report di criticità P0–P3 sulla v1.7.6. Tutti gli issue elencati sono stati poi chiusi. |
| [debug-definitivo.md](debug-definitivo.md) | La caccia al bug dello spamming multi-bot, culminata in IronShield (v1.10.5). Spiega perché il filtro di cutoff è così pessimista. |
| [analisi-incidente-snap.md](analisi-incidente-snap.md) | L'incidente del 24 aprile 2026: un podcast non pubblicato perché un video YouTube omonimo aveva già occupato il `title_hash`. È il caso che ha generato IronShield v2. |
| [relazione-youtube.md](relazione-youtube.md) | Perché YouTube passa da feed Atom a InnerTube e non alla Data API v3. |

## Progetti conclusi

| Documento | Esito |
| :--- | :--- |
| [roadmap-marzo2026.md](roadmap-marzo2026.md) | Completata, tranne i test Vitest — mai scritti. |
| [PROGETTO-PORTING.md](PROGETTO-PORTING.md) | Completato nella v1.10.2. Il ramo macOS è stato poi annullato. |
| [PROGETTO-IRONSHIELD-V2.md](PROGETTO-IRONSHIELD-V2.md) | Implementato nella v2.1.0, schema DB v12. |
| [STATO-PROGETTO.md](STATO-PROGETTO.md) | Quadro del lavoro fino alla v2.1.3. Superato dal `CHANGELOG.md`. |
| [build-mac.md](build-mac.md) | Compilazione per macOS, piattaforma rimossa nel luglio 2026. |
| [manutenzione-archivio.md](manutenzione-archivio.md) | Vecchie regole di pulizia della cartella di lavoro, riferite a una struttura che non esiste più. |

## Documentazione superata

| Documento | Sostituito da |
| :--- | :--- |
| [manuale-v1.7.md](manuale-v1.7.md) | La cartella [`Manuale Utente Avanzato/`](../../Manuale%20Utente%20Avanzato/), riscritta e tradotta in 8 lingue |
| [manuali-v1.7/](manuali-v1.7/) | Gli stessi manuali in PDF, versione 1.7.x, più i whitepaper commerciali |
| [design/](design/) | Mockup di interfacce mai spedite |

## Fase commerciale

| Documento | Cos'era |
| :--- | :--- |
| [EULA-v1-proprietaria.txt](EULA-v1-proprietaria.txt) | La licenza proprietaria in vigore fino all'agosto 2026. **Non si applica più**: il progetto è ora sotto [licenza MIT](../../LICENSE). |
| [gumroad-description.md](gumroad-description.md) | Il testo della scheda prodotto su Gumroad, ferma alla v2.0.3. |
