# 🏛️ Whitepaper: Architettura e Resilienza di un Sistema di Broadcast Automation
**Titolo:** *Runtime TelegramBot Titan Edition - Dalla riga di comando all'orchestrazione asincrona.*  
**Autore:** Simone Pizzi (Runtime Radio)  
**Revisione Architetturale:** v1.7.5 ("OmniSync")  
**Data:** Marzo 2026  

---

## 1. Abstract
Questo documento analizza l'evoluzione ingegneristica del progetto *Runtime TelegramBot*, tracciando la transizione da uno script procedurale in Python a una piattaforma desktop Enterprise basata su Node.js, Electron e React. Viene esaminata la risoluzione di complessi colli di bottiglia legati all'I/O di rete, ai rate-limit delle API di Telegram e all'estrazione di dati da ecosistemi chiusi (YouTube), culminando nell'architettura *Titan Edition*.

## 2. Il Contesto Storico e i Limiti del Modello Legacy
L'infrastruttura originale si basava su un bot Python operante via terminale. Sebbene funzionale per scenari a basso carico, il sistema presentava vulnerabilità strutturali intrinseche:
*   **Esecuzione Sincrona (Single-Thread):** L'attesa della risposta di rete (es. i timeout imposti dai `FloodWait` di Telegram) bloccava l'intero processo di recupero (fetching) degli altri feed.
*   **Data Integrity Fragile:** La mancanza di un database relazionale e la dipendenza da file JSON o strutture dati piatte esponevano il sistema al rischio di duplicazione dei post in scenari multi-canale.
*   **Barriera d'Ingresso (UX):** La configurazione richiedeva l'intervento manuale su codice o file di testo, rendendo impossibile la delega operativa a personale non tecnico.

La necessità di scalare verso infiniti canali e flussi di dati ha imposto un cambio di paradigma: la migrazione allo stack **Electron / React / SQLite**.

## 3. Il Motore Asincrono: Pattern Producer-Consumer
La sfida principale nell'automazione del broadcast è la disparità tra la velocità di lettura dei dati (alta) e la velocità di invio consentita dalle API di destinazione (bassa, per limitazioni anti-spam).

Nella versione v1.3.4 di Titan, il cuore del sistema (`engine.ts`) è stato riscritto implementando un'architettura **Producer-Consumer**.
1.  **Producer (Fetch Loop):** Analizza parallelamente le fonti RSS/YouTube, confronta i risultati con l'hash crittografico (MD5) degli elementi già processati in SQLite e, in caso di esito positivo, immette l'oggetto in una `PublishJob Queue` ospitata in RAM volatile.
2.  **Consumer (Publish Loop):** Evasione sequenziale della coda. Se l'API di Telegram restituisce un errore di rate-limiting (`429 Too Many Requests`), il Consumer sospende l'esecuzione in modo non bloccante (`abortable sleep`), senza interrompere il Producer. 

Questo disaccoppiamento garantisce un'efficienza totale della UI, prevenendo il *freeze* dell'interfaccia React e garantendo l'integrità del processo.

## 4. Il "Miracolo" YouTube: Euristiche e Scraping Zero-Config
L'integrazione di YouTube ha rappresentato la sfida tecnologica più complessa. L'approccio iniziale tramite feed XML/Atom pubblici si è rivelato inaffidabile a causa delle deprecazioni silenziose da parte di Google (errori HTTP 404 casuali). L'alternativa ufficiale (YouTube Data API v3) è stata scartata per non imporre all'utente la gravosa generazione di API Key e la gestione delle quote di fatturazione cloud.

La *Titan Edition* ha risolto il problema adottando il modulo `youtubei.js`, che esegue il reverse-engineering dell'interfaccia **InnerTube** (lo stesso client usato dalle app native di YouTube). 
Tuttavia, l'accesso diretto ai metadati ha esposto il sistema ai cosiddetti "Ghost Events" (video programmati o *Premiere* che risultano in cima ai feed pur non essendo visibili). È stato quindi sviluppato un **Filtro Euristico Anti-Premiere** che analizza proattivamente i flag booleani (`is_upcoming`, `is_premiere`) e i nodi testuali del JSON sorgente, scartando i dati non pronti e garantendo una purezza assoluta dell'informazione inviata a Telegram.

Di fronte alle continue mutazioni strutturali lato server da parte di Google, la v1.7.2 ha introdotto un protocollo di **Graceful Degradation**: il fallimento del modulo YouTube viene intercettato a basso livello e tradotto in un evento IPC (`youtube-api-error`), che informa visivamente l'utente tramite interfaccia, isolando l'errore ed evitando il crash del macro-processo.

## 5. Sicurezza dei Dati e Protocollo "OmniSync"
La transizione a un'architettura multi-tenant ha imposto la messa in sicurezza delle credenziali API (Bot Tokens).
In Titan Edition, i token non risiedono mai in chiaro all'interno del database `titan.db`. Il software implementa il modulo nativo **`safeStorage`** di Electron, che vincola la crittografia all'hardware della macchina ospite (tramite DPAPI su Windows o Keychain su macOS). Un database esfiltrato illecitamente risulta inerte su un hardware differente.

Per garantire comunque la mobilità e il lavoro in team, è stato inventato il formato file **`.rtb` (Runtime Telegram Bot)**. L'ecosistema *OmniSync* esporta i profili in questo formato sicuro: durante l'esportazione il token viene decifrato in RAM, salvato temporaneamente nel pacchetto `.rtb`, e al momento dell'importazione sulla nuova macchina viene **ri-criptato dinamicamente** sfruttando il nuovo hardware ID.

## 6. Sopravvivenza in Ambienti Headless: Anti-Ghosting
Progettata per operare anche su Virtual Private Server (VPS) economici, la piattaforma adotta difese pervenire la degradazione delle prestazioni:
*   **Hardware Acceleration Bypass:** Chiamando `app.disableHardwareAcceleration()` all'avvio, si evitano crash grafici silenti su sistemi privi di GPU dedicata.
*   **Safety Timeout & Global Catch:** Per evitare l'insorgenza di *Ghost Process* (istanze Node.js bloccate in RAM ma senza interfaccia grafica renderizzata), sono stati implementati timer di forcing per il metodo `show()` della UI e intercettatori di livello base (`uncaughtException`), che forzano la chiusura nativa (`app.exit(1)`) in caso di instabilità irrecuperabile.

## 7. Conclusioni
La *Runtime TelegramBot Titan Edition* dimostra come l'adozione di rigorosi pattern di ingegneria del software (Producer-Consumer, Hardware-Bound Encryption, Graceful Degradation) possa trasformare un tool di automazione di base in un ecosistema di classe Enterprise. La stabilità raggiunta con la versione 1.7.x fornisce basi solide non solo per il broadcasting su Telegram, ma come framework scalabile per qualsiasi futura integrazione di API esterne.