# Changelog v1.7.11 (Titan Edition)

**Data di Rilascio:** 13 Aprile 2026

## 🛡️ Fix Critico YouTube: Protezione Anti-Spam

### 1. Risoluzione Stima Date YouTube (Bug #7)
È stato corretto un comportamento critico nel modulo YouTube che causava la pubblicazione massiva di video arretrati ignorando il filtro `cutoffDate`.

**Analisi del problema:**
Il sistema precedente utilizzava un parser ottimista che, in caso di mancato riconoscimento della data (ad esempio con formati localizzati in italiano come "ore fa"), assegnava al video la data corrente (`new Date()`). Questo faceva apparire ogni video vecchio come "appena pubblicato", innescando l'invio a raffica verso Telegram.

**Interventi effettuati:**
- **Parser Multilingua:** Aggiunto il supporto esplicito per le date relative in lingua italiana (riconoscimento di `fa`, `ore`, `giorni`, `mesi`, `anni`, ecc.).
- **Inversione Fallback di Sicurezza:** Modificata la logica di gestione degli errori. Se il sistema non è in grado di decifrare la data di pubblicazione, ora assegna forzatamente il **1° Gennaio 2000**. Questo garantisce che i video con data incerta vengano sempre considerati "vecchi" e filtrati correttamente, proteggendo i canali Telegram dallo spam.
- **Unificazione Variabili:** Ottimizzazione del codice interno per la gestione della stringa di data grezza (`rawDateText`).

## 📦 Build e Versione
- Versione aggiornata alla **v1.7.11** in `package.json`.
- Build di produzione verificata e generata con successo.

## 📋 Note per l'utente
Se il bot ha già inviato messaggi duplicati prima di questo aggiornamento, si consiglia di svuotare la cronologia del bot (Clear History) dalla dashboard dopo aver installato la v1.7.11 per ripartire da uno stato pulito.
