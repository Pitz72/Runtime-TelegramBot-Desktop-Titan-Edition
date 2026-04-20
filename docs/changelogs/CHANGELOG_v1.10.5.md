# Changelog v1.10.5 — "IronShield" Security Patch

**Data:** 20 Aprile 2026  
**Tipo:** Hotfix Critico / Sicurezza  
**Piattaforma:** Windows, Linux, macOS  
**Stato:** Stabile (Produzione)

---

## 🛡️ Risoluzione Definitiva Bug Spamming (Triple-Lock Security)

Questa release introduce una revisione radicale della logica di filtraggio e deduplica del motore, resasi necessaria a seguito di malfunzionamenti nello scraping dei dati da YouTube (InnerTube) che causavano la pubblicazione di contenuti storici (anche di anni precedenti) in modo incontrollato.

### 1. Filtro Cutoff "Iper-Pessimista" (`engine.ts`)
Il motore di scansione è stato riprogettato per non fidarsi più dei dati esterni incompleti.
- **Blocco Fallback 2000:** Se un item restituisce la data di fallback `2000-01-01` (utilizzata quando lo scraping non riesce a determinare l'età di un video), il bot ora **scarta categoricamente** l'elemento invece di tentare la pubblicazione per eccesso di ottimismo.
- **Validità Temporale Rigida:** Introdotto un controllo numerico assoluto tra il timestamp del contenuto e la `start_date` del bot. Ogni discrepanza, valore nullo o incoerenza matematica nel database porta ora allo scarto immediato dell'item come misura di sicurezza preventiva.

### 2. Unificazione Memoria Anti-Spam (`manager.ts`)
Risolto un bug architetturale che frammentava la memoria del bot in silos isolati.
- **Deduplica Globale per Bot:** Il controllo sul `title_hash` è stato svincolato dal `feed_id`. Se un bot ha già inviato un contenuto con un determinato titolo (indipendentemente da quale feed provenga o se l'ID del feed è cambiato nel tempo), il sistema lo riconosce come duplicato e lo blocca.
- **Protezione Multi-Feed:** Questa modifica impedisce la ri-pubblicazione in caso di feed duplicati, sovrapposti o migrati male durante gli aggiornamenti di versione.

### 3. Ottimizzazione Database (`schema.ts`)
- **Indici Semplificati:** Rimosso il `feed_id` dall'indice `idx_history_title_dedup` per allineare le performance di ricerca alla nuova logica di deduplica globale.
- **Integrità Dati:** Rafforzati i controlli post-migrazione sulle colonne critiche del database per prevenire fallimenti silenziosi dei filtri temporali.

---

## 🛠️ Altri Miglioramenti
- **Logging Diagnostico:** Migliorata la chiarezza dei log quando un item viene scartato per data non valida o fallback di sicurezza.
- **Resilienza Multi-Bot:** Risolto un potenziale conflitto nella coda di invio globale che poteva causare scambi di identità nei log di invio tra bot diversi che monitorano feed simili.

---

*(C) 2026 Runtime Radio — Titan Desktop v1.10.5 "IronShield"*
