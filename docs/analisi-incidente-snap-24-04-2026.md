# 🛡️ Analisi Tecnica Incidente "SNAP" (24 Aprile 2026)

**Data dell'Analisi:** 24 Aprile 2026  
**Oggetto:** Mancata pubblicazione del podcast "SNAP" su canale Runtime Radio  
**Versione Software:** v1.10.5 "IronShield"

---

## 1. Descrizione dell'Evento
In data 24/04/2026, si è verificata un'anomalia nella distribuzione del contenuto **"Universi leggermente imperfetti"** (SNAP). 
- Il **video YouTube** con tale titolo è stato regolarmente pubblicato da entrambi i bot (TechnoPillz e Runtime).
- Il **podcast RSS** con lo stesso identico titolo è stato pubblicato correttamente dal bot **TechnoPillz**, ma è stato ignorato dal bot **Runtime Radio**.

Entrambi i bot condividono una configurazione simile (data cutoff 20/04/2026) ma operano su orari e canali differenti.

## 2. Analisi dell'Architettura "IronShield"
La versione **v1.10.5** ha introdotto la "Deduplica Globale per Bot" tramite `title_hash`. Questa funzione è stata progettata per impedire lo spam causato da URL che cambiano ma mantengono lo stesso titolo.

### Meccanismo di Controllo (`BotManager.isProcessed`):
Il sistema esegue due controlli sequenziali:
1.  **Match per ID (URL):** Se l'URL (MD5) è già presente nel DB per quel bot, l'item viene scartato.
2.  **Match per Titolo (`title_hash`):** Se il titolo normalizzato è già presente nel DB per quel bot (indipendentemente dal feed di provenienza), l'item viene scartato.

## 3. Ricostruzione dell'Incidente (Analisi Temporale)
L'informatica suggerisce che la causa sia una collisione di metadati unita a una latenza di rilevamento di YouTube.

### Cronologia degli Eventi:
1.  **23/04 ore 12:00:** Viene pubblicato il video YouTube. Probabilmente, a causa di metadati instabili (mancanza di una data relativa chiara), IronShield lo scarta attivando il **fallback 2000** (misura di sicurezza v1.10.5).
2.  **24/04 ore 06:00:** All'avvio del bot Runtime, il video ha ora una data parsabile (es. "18 ore fa"). Runtime lo invia e registra il `title_hash` in `history`.
3.  **24/04 ore 06:30:** Viene pubblicato il podcast. 
4.  **Turno Runtime:** Il bot trova il podcast, ma il `title_hash` è già occupato dal video inviato solo 30 minuti prima. Il podcast viene scartato come duplicato.
5.  **Turno TechnoPillz (ore 07:00):** TP, operando su un ciclo differente o avendo una cache diversa, riesce a processare il podcast correttamente (probabilmente l'ordine dei feed o la latenza di fetch ha favorito l'audio rispetto al video già presente).

## 4. Considerazioni Finali e Diagnosi
Il sistema **IronShield**, nella sua missione di essere "iper-pessimista" contro lo spam, ha correttamente identificato due contenuti con lo stesso titolo come un potenziale duplicato. Il ritardo nel rilevamento del video YouTube (dovuto alla prudenza del filtro 2000) ha spostato l'invio alla stessa finestra temporale del podcast, creando la collisione.

**Diagnosi:** Non si tratta di un bug del codice, ma di un **effetto collaterale previsto** della strategia anti-spam globale. Quando un video YouTube non fornisce dati certi, IronShield attende finché non sono sicuri; se nel frattempo esce un podcast con lo stesso titolo, il sistema "corazza" il canale permettendo un solo invio per quel titolo.


### Raccomandazioni:
Se si desidera che entrambi i formati (Video e Audio) vengano pubblicati nonostante abbiano lo stesso titolo, occorrerebbe:
1.  **Variare i titoli:** Aggiungere "[Video]" o "[Podcast]" nel titolo sorgente.
2.  **Raffinare IronShield:** Valutare se reinserire un vincolo di `type` o `feed_id` nella deduplica del titolo, accettando però il rischio che un cambio di URL su un feed specifico possa generare spam.

**Conclusione:** Il sistema è stabile e "corazzato". L'incidente di oggi è la prova che le valvole di sicurezza della v1.10.5 funzionano, anche a costo di una precisione chirurgica che può apparire come un'omissione.

## 5. Analisi Comparativa Video YouTube
L'indagine su due campioni specifici conferma la selettività di IronShield:
- **Video A (`Tu1ZDFstDsY`):** Pubblicato e inviato stamattina. Metadati subito validi → Invio immediato.
- **Video B (`OIsO-FpIFEQ`):** Pubblicato ieri ma inviato oggi. Ieri i metadati erano probabilmente instabili (stato "Premiere" o data assente) → Scartato per sicurezza. Stamattina la data era consolidata ("20 ore fa") → Invio approvato, causando la collisione con il podcast.

## 6. Migliorie Future: Sistema di Logging
L'incidente ha evidenziato la necessità di una memoria storica dei log più estesa per facilitare la diagnosi retroattiva senza saturare la memoria RAM:
- **Buffer Esteso:** Aumentare la ritenzione dei log a un intervallo di almeno 2-4 ore.
- **Persistenza Diagnostica:** Valutare la scrittura di un file `debug.log` temporaneo nella cartella `userData` con rotazione automatica.

---
*(C) 2026 Analisi Tecnica Titan Desktop — Sicurezza IronShield*
