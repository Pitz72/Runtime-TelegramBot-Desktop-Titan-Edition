# 🧹 Guida alla Manutenzione e Archiviazione

Questa guida documenta le policy ufficiali per mantenere pulito lo spazio di lavoro della repository di `BOT-TELEGRAM-RSS` e descrive il processo corretto per archiviare o rimuovere file e cartelle obsoleti.

---

## 1. Architettura della Repository

La cartella radice del progetto è strutturata per minimizzare la confusione tra il codice in sviluppo attivo e i vecchi esperimenti isolati:

- **`TITAN_DESKTOP/`** → L'unica cartella in cui avviene lo sviluppo attivo (app in Electron/React/TypeScript). Contiene i sorgenti attuali, le configurazioni, i doc e gli output builder.
- **`ARCHIVIO_LEGACY/`** → La "cassaforte" storica. Contiene vecchie versioni del bot in Python (`TELEGRAMBOT`), salvataggi manuali, cloni di vecchi sorgenti (come `Sorgente-Mac` e `Sorgente-Linux`) e script legacy. **Questa cartella NON deve essere utilizzata per lo sviluppo attivo**, ma solo per consultazione.

---

## 2. Policy di Archiviazione

Quando un componente, uno script o un modulo non è più necessario ma se ne vuole conservare la traccia storica:
1. **Vietato lasciarlo in root o in TITAN_DESKTOP.**
2. Spostare l'intera directory/file all'interno di `ARCHIVIO_LEGACY/`.
3. Assicurarsi di rimuovere le dipendenze pacchettizzate prima dello spostamento (vedi sotto "Pulizia dello Spazio").

---

## 3. Pulizia dello Spazio (De-crufting)

Per evitare che la repository si gonfi di GB occupando spazio inutile, specialmente in vista di caricamenti e clonazioni in Git, è necessario applicare periodicamente queste procedure di pulizia profonda, specialmente sui file archiviati.

### 🗑️ Cosa NON archiviare (e rimuovere in modo sicuro)
Prima di chiudere un ciclo di sviluppo importante o spostare qualcosa nell'archivio, esegui quest'operazione di pulizia:

1. **Cartelle virtuali `node_modules`**
   - Rimuovile da qualsiasi progetto mandato in archivio. Il codice resta, ma è inutile salvare moduli npm di migliaia di file che possono essere riprodotti con un `npm install` in caso di recupero.
   - Nessuna cartella archiviata in `ARCHIVIO_LEGACY` deve contenere `node_modules`.

2. **File di Cache Python (`__pycache__`)**
   - Gli script Python legacy generano file bytecode (`.pyc` dentro `__pycache__`). Usa la funzione cerca dell'OS o PowerShell per individuare le cartelle `__pycache__` negli archivi e cancellale massivamente.

3. **Ambienti Virtuali Python (`venv`, `.venv`)**
   - Assolutamente non vanno storicizzati, pesano centinaia di MB e le versioni compilate di `pip`/`certifi` diventano inutili. Cancella le directory virutali in modo definitivo prima di archiviare un bot Python in disuso. È sufficiente salvare il file `requirements.txt`.

4. **Cartelle di Cache Build (Electron / Vite)**
   - In `TITAN_DESKTOP`, Electron Builder genera e accumula cache di decompressione come le cartelle `win-unpacked` e file mappe `*.blockmap` all'interno della cartella `Builds/`. 
   - Le cartelle `Builds/win-unpacked` e `.vite` (nella cartella sorgente) possono essere eliminate tranquillamente; verranno rigenerate pulite alla successiva esecuzione di svilluppo/build.
   - **Salva solo le release eseguibili stabili** (`.exe`, `.dmg`, `.AppImage`) scartando i vecchi setup se non più necessari. Archivi come `Builds.zip` all'interno della cartella di output devono essere rimossi.

---

## 4. Comandi Rapidi di Pulizia (PowerShell)

Un utile set di comandi che puoi eseguire nella directory principale `BOT-TELEGRAM-RSS` in PowerShell per applicare le norme di pulizia descritte:

**Rimozione rapida di pycache e folder virtuali in Archivio:**
```powershell
Get-ChildItem -Path 'ARCHIVIO_LEGACY' -Include '__pycache__', 'venv_web', '.venv', 'venv' -Recurse -Directory -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
```

**Rimozione rapida di node_modules sfuggiti in Archivio:**
```powershell
Get-ChildItem -Path 'ARCHIVIO_LEGACY' -Include 'node_modules', '.vite' -Recurse -Directory -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
```

**Pulizia cache Electron Builder in Titan (mantiene gli .exe):**
```powershell
Remove-Item -Path 'TITAN_DESKTOP\Builds\win-unpacked', 'TITAN_DESKTOP\Builds\*.blockmap' -Recurse -Force -ErrorAction SilentlyContinue
```

---

*La corretta osservanza di queste norme garantisce performance elevate negli editor di codice, minor spreco di RAM da parte dei watcher automatici e caricamenti fulminei dei rami repo.*
