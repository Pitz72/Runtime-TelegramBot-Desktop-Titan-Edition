# Changelog v1.7.13 (Titan Edition)

**Data di Rilascio:** 13 Aprile 2026

## 🛡️ Fix Critico: Crash su Eliminazione Bot

### 1. Messa in Sicurezza dell'Engine (Bug #4)
È stato risolto un problema di core logic (rischio di crash per Foreign Key Constraints e asincronia orfana) che si verificava eliminando un bot la cui coda o cui fetch interno non era ancora del tutto concluso.

**Analisi del problema:**
Cancellando un bot mentre l'engine era in esecuzione, il database effettuava correttamente l'operazione in CASCADE (eliminando feed e record di history). Tuttavia:
- Il `processFeed` in Node.js, una volta "risvegliato" da chiamate di rete asincrone (es. fetch da YouTube o podcast lenti), manteneva in scope il vecchio oggetto locale del bot, inserendo potenzialmente job orfani.
- La `publishQueue` non veniva adeguatamente liberata, permettendo all'engine di tentare un invio Telegram collegato ad un bot estinto.
- Se l'invio andava a buon fine, il programma andava in blocco nel tentativo di segnare l'elemento in cronologia, lanciando un errore SQlite a causa della chiave esterna inesistente (`FOREIGN KEY constraint failed`).

**Interventi effettuati:**
- **Purge Coda Immediato:** Nel momento in cui il bot viene cancellato via IPC dalla dashboard, l'engine ora esegue una bonifica immediata della sua `publishQueue`, invalidando ed espellendo i job pendenti relazionati (`botEngine.removeClient(botId)`).
- **Controllo di Sicurezza "Pre-Publish":** L'Engine esegue ora un rigoroso controllo `if(!BotManager.getBots().some(...))` un millisecondo prima di prelevare il job e tentare l'invio.
- **Controllo di Sicurezza "Post-Fetch":** Un identico blocco di ispezione è stato inserito prima di popolare la coda, in modo da intercettare cancellazioni utente avvenute durante la latenza di rete dei download asincroni dai feed.

## 📦 Build e Versione
- Versione aggiornata alla **v1.7.13** in `package.json`.
