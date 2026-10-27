# Il bot Python da cui è nato Titan

**Materiale d'epoca, non mantenuto.** Questa cartella conserva il bot Telegram RSS a riga di comando che Titan ha sostituito. È qui per la storia: non va avviato, non riceve correzioni e non fa parte dell'applicazione.

## Che cos'era

Uno script Python che leggeva i feed RSS dei podcast di [Runtime Radio](https://runtimeradio.com) e pubblicava ogni episodio nuovo su **un solo canale Telegram**, `@runtimeradio`. I feed erano molti: 30 a giugno 2025, 36 a fine ottobre, 37 a dicembre, tutti scritti a mano nella lista `PODCAST_FEEDS` di [`src/config.py`](src/config.py).

Girava sul PC di Simone, in una finestra di PowerShell, con `python main.py` dalla cartella del bot. Controllava i feed ogni 15 minuti e scartava gli episodi usciti prima del 1° settembre 2025. Per non ripubblicare niente due volte, teneva gli episodi già inviati in un file JSON. Il messaggio sul canale cominciava con «È uscito un nuovo episodio di…».

Le librerie erano [python-telegram-bot](https://python-telegram-bot.org/) e [feedparser](https://feedparser.readthedocs.io/), su Python 3.12.

## Periodo e versioni

Le date affidabili sono quelle dei file e del database degli episodi. Quelle scritte dentro i file spesso non tornano: `version.py` dà alla v2.0.0 la data del 19/01/2025, il `CHANGELOG.md` la mette nel 2024.

| Versione | Quando | Cosa |
|---|---|---|
| v0.8.0 «Foundation» · v0.8.1 «Velocity» · v0.8.2 «Fortress» | fino al 14/06/2025 | Prime versioni: il 14/06 la v0.8.2 leggeva già 30 feed. Il `.gitignore` di questa cartella è della v0.8.1. |
| v1.0.0 «Phoenix» | 14/06/2025, sera | Secondo le sue note: gestione dei feed rifatta da capo, nome del podcast in ogni messaggio, data di cutoff. |
| v2.0.0 «Connection» | dal 23/07/2025 | Test di connessione al canale. Dal 27/09: `main.py` come punto d'avvio, codice in `src/`, script per un server LAMP e un'interfaccia web, poi accantonati. |
| v2.0.1 «Polyglot» | 08/12/2025 | Feed Azuracast, immagini dei podcast, pulizia dell'HTML nei testi. |
| v2.0.2 «Connection» · v2.0.3 «Phantom» | 10/12/2025 | Documentazione riordinata; corretto un `u200b` che compariva nei messaggi. |

Dopo la v2.0.3 ci fu ancora almeno una versione Python, la v3.2 «Titan Ironclad», che non è in questa cartella. Il 10 febbraio 2026 la riscrittura in TypeScript ed Electron diventò Titan (v1.0.0-alpha «Genesis», in [`docs/changelogs/legacy-pre-v1.md`](../../changelogs/legacy-pre-v1.md)). La storia git di Titan comincia il 2 marzo 2026 con la v1.7.5.

## Da dove arriva

Il codice Python non era mai entrato nella storia git di Titan. Viveva in una cartella separata del disco di sviluppo, cancellata nella pulizia di luglio 2026 dopo che Simone ne aveva salvato una copia sul suo Drive criptato. Il 27/10/2026 quella copia, un archivio chiamato «OLD TELEGRAMBOT», è stata ripescata e rimessa qui.

Dentro c'erano due stati del bot, e ognuno è diventato un commit con la sua data vera:

| Commit | Data | Stato |
|---|---|---|
| `14b441d` | 31/10/2025, 01:26 | v2.0.0, dall'archivio `BOT-TELEGRAM-RSS.7z` che Simone aveva compresso quel giorno alle 21:50 |
| `1a22942` | 10/12/2025, 09:05 | v2.0.3, lo stato finale |

Sono due istantanee, non la storia dello sviluppo: nessuno dei due archivi conteneva una cartella `.git`. I due commit stanno su un ramo a parte, fuso in `main` col commit `ec5d689`, così l'era Python risulta antenata di Titan senza che nessun commit esistente sia stato riscritto. Per vedere cosa è cambiato fra i due stati: `git diff 14b441d 1a22942`.

## Cosa è stato tolto, e perché

| Tolto | Perché |
|---|---|
| `web_control/venv_web/` (861 file) | Un ambiente virtuale Python: librerie di terzi, non codice del bot. |
| `src/__pycache__/` | File compilati, e contenevano il token del bot. |
| `processed_episodes.json`, `data/processed_episodes.json` (1,6 MB) | I dati veri: titoli e indirizzi di quasi 4000 episodi pubblicati. |
| `processed_episodes.json.backup`, `aggiorna_dati_demo.py.backup` | Copie di riserva, una di dati e una di uno script per i dati di prova dell'interfaccia web. |
| `BOT-TELEGRAM-RSS.7z` | L'archivio del 31/10/2025: il suo contenuto è il primo commit. |
| `logs/`, `src/templates/`, `data/` | Cartelle vuote, che git non registra. |

E cosa è stato **mascherato**, in entrambe le versioni:

| Segnaposto | Dove | Al posto di |
|---|---|---|
| `<TOKEN_TELEGRAM>` | `src/config.py` | Il token del bot, scritto nel codice. |
| `<TOKEN_TELEGRAM_PRECEDENTE>` | `src/config.py` | Un token più vecchio, usato nei confronti per riconoscere la configurazione di prova. |
| `<PASSWORD_PREDEFINITA>` | `web_control/app.py`, `web_control/README_WEB_INTERFACE.md` | La password predefinita dell'interfaccia web. |

Il bot teneva il token nel codice per scelta, e il suo [`README.md`](README.md) lo spiega: girava solo su una macchina privata. Qui non poteva restare. Con i segnaposto il codice non parte, ed è giusto così.

## Come orientarsi

| File | Cosa contiene |
|---|---|
| [`main.py`](main.py) | Il punto d'avvio: `python main.py`. |
| [`src/bot.py`](src/bot.py) | Tutto il lavoro: lettura dei feed, filtro di cutoff, messaggi, invio, comandi `/start` e `/status`. |
| [`src/config.py`](src/config.py) | Canale, elenco dei feed, intervalli, controlli di sicurezza. |
| [`src/version.py`](src/version.py) | Numero di versione e note di rilascio. |
| [`README.md`](README.md) | Il README del bot alla v2.0.3. |
| [`README(1).md`](README(1).md), [`README_AVVIO_LOCALE.md`](README_AVVIO_LOCALE.md) | Il README della cartella che conteneva il bot e la guida all'avvio su Windows. Nell'archivio del 31/10/2025 stavano un livello più su. |
| [`CHANGELOG.md`](CHANGELOG.md), [`docs/log/`](docs/log/) | Storia delle versioni e note delle sessioni di dicembre 2025. |
| `deploy_server.sh`, `remote_control.py`, `web_control/` | Installazione su un server Linux, controllo remoto via SSH e un'interfaccia web, preparati a settembre 2025 e poi lasciati da parte. Il README della v2.0.3 dice che il bot gira solo in locale e dichiara abbandonata l'interfaccia web. |

Il `.gitignore` e il `.gitattributes` di questa cartella sono quelli del bot e valgono solo qui dentro.
