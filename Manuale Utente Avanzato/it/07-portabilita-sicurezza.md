## Capitolo 7: Portabilità e Sicurezza (L'Ecosistema OmniSync)

Titan tiene al sicuro il tuo lavoro e ti dà tre modi per salvarlo o spostarlo: il backup completo del database, il formato `.rtb` per un singolo bot e l'esportazione dell'intera configurazione. Vediamoli.

### 7.1 Backup completo del database
Clicca sull'icona a ingranaggio (⚙️) in alto a destra per aprire le **Impostazioni di Sistema**, poi vai nella scheda **Dati e Backup**.

Il pulsante **Esporta DB** crea un clone completo del database `titan.db`: dentro c'è tutto, i profili bot, i feed e l'intera memoria storica delle pubblicazioni. Con **Importa DB** selezioni un file salvato in precedenza e Titan si riavvia da solo, ripristinando la situazione esatta di quel momento.

![La scheda Dati e Backup: esportazione e importazione del database e della configurazione.](screenshots/09-system-backup.png)

È il metodo giusto per una copia di sicurezza completa, o per rimettere tutto in piedi dopo una reinstallazione sullo stesso computer.

*Dove vive il database.* Il file `titan.db` è conservato in una cartella di sistema, separata dal programma, così una reinstallazione non lo tocca. La trovi su Windows in `%APPDATA%\runtime-telegram-bot-titan-edition\`, su Linux in `~/.config/runtime-telegram-bot-titan-edition/`. Se un giorno il software non si avviasse, puoi copiare `titan.db` da lì a mano per metterlo al sicuro.

### 7.2 Il formato .rtb: spostare un bot in sicurezza
Per passare un singolo bot da un'installazione all'altra (per esempio a un collega in redazione) c'è **OmniSync**, il formato `.rtb` (Runtime Telegram Bot).

Nelle impostazioni del bot, nella sezione **Condivisione**, il tasto **Esporta** genera un file `.rtb`: una «cartuccia digitale» che contiene il nome del bot, tutti i suoi feed (con filtri, intervalli e digest) e i template, ma non lo storico dei messaggi già inviati. Chi lo riceve lo carica con il tasto **Importa** nella colonna dei bot, l'icona a freccia accanto al **+**.

E il token? Qui Titan fa una scelta di sicurezza precisa: il token viaggia nel file, ma cifrato e legato al computer che ha creato l'esportazione. Perciò:

-   **Sullo stesso computer** (per esempio dopo una reinstallazione) il token viene riletto e ripristinato senza che tu faccia nulla.
-   **Su un altro computer** il token, per sicurezza, non è decifrabile: arriva vuoto e va reinserito a mano, lo stesso che copi da BotFather. Tutto il resto (feed, template, impostazioni) è già al suo posto.

In pratica il `.rtb` sposta la configurazione in modo comodo, ma il segreto vero non si può rubare copiando un file: resta protetto dalla macchina che l'ha generato.

*Nota per Linux.* La cifratura del token si appoggia al portachiavi di sistema (GNOME Keyring, KWallet o un altro servizio Secret Service). Se la tua distribuzione non ne ha uno, Titan non si blocca: usa una cifratura interna, comunque legata alla macchina. Per attivare il portachiavi nativo, installa `libsecret`.

### 7.3 Esportare tutti i bot insieme (configurazione)
Se vuoi spostare non un bot ma l'intero assetto, torna nella scheda **Dati e Backup**: accanto al database trovi l'esportazione dell'intera **configurazione**, un unico file `.rtb`. Funziona come quello del singolo bot, ma comprende tutti i bot in una volta: porta con sé profili, feed e template di ognuno, sempre senza lo storico. Vale la stessa regola del token vista sopra: si ripristina da solo sullo stesso computer, altrove va reinserito.

---
