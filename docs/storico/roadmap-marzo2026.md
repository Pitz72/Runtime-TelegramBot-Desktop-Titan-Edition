# 🗺️ Roadmap Marzo 2026 — COMPLETATA ✅

> **Nota storica:** Questa roadmap è stata completata. Tutte le feature pianificate sono state implementate:
> - **Quiet Hours** → implementato in **v1.4.x**
> - **Template Smart Chips** → implementato in **v1.5.x**
> - **Test Vitest** → non implementato (bassa priorità, rimandato a sviluppi futuri)
>
> Il documento è conservato come riferimento storico del piano di sviluppo verso la Gold Release.

---

# Roadmap Attiva — Titan Desktop (Redatta a v1.4.0)

> Runtime TelegramBot Titan Edition — Piano di sviluppo verso la Gold Release
> Redatto: 26/02/2026

## Contesto Attuale

Con la release **v1.4.0**, il core engine di Titan Desktop ha raggiunto un livello di stabilità e maturità formidabile. La transizione da un'esecuzione sincrona a un'architettura **asincrona Producer-Consumer** (con Job Queue dedicata) ha eliminato l'UI freeze, rendendo l'intero sistema reattivo e ottimizzato per la gestione simultanea di molteplici bot e feed. Il sistema di storage è stato blindato, garantendo la totale sicurezza dei token utente.

---

## ✅ Obiettivi Raggiunti (Da non toccare)

- **Job Queue Asincrona:** Piena separazione tra fetch dei feed (Producer) e invio su Telegram (Consumer).
- **Stabilità e Debugging:** Implementati `ErrorBoundary` globali in React e sistema di Logging Ibrido (file persistenti + IPC batching anti-stuttering).
- **Gestione Dati Avanzata:** Passaggio al sistema di migrazioni deterministico `PRAGMA user_version` di SQLite, con auto-backup dei database in fase di boot.
- **Sicurezza:** Cifratura hardware (`safeStorage`) applicata con successo a tutti i Token Bot salvati su disco.
- **Esperienza Utente Nativizzata:** Supporto completo per le notifiche native OS per ogni invio completato con successo.
- **Integrazione YouTube Zero-Config:** Pieno successo nell'utilizzo di `youtubei.js` (InnerTube API) per lo scraping, garantendo pieno supporto senza richiedere chiavi API utente.

---

## 🚀 Prossimi Passi (Il percorso verso la Gold Release)

Le seguenti funzionalità rappresentano il blocco finale prima di considerare l'applicazione completa in ogni suo aspetto primario.

### 1. 🌙 Fasce Orarie di Silenzio ("Quiet Hours")
**Priorità:** 🔴 Alta
**Descrizione:** Implementare la possibilità per l'utente di definire un orario di "silenzio" in cui il bot non deve disturbare i follower.
**Specifiche:**
- Inserimento di due time picker nei settaggi bot: `send_from` (es. 08:00) e `send_until` (es. 22:00).
- Il motore continua a scansionare i feed (Producer), ma se l'orario attuale è fuori fascia, i post vengono parcheggiati in coda (Consumer pausato).
- Ripresa automatica dell'invio allo scattare dell'orario valido.

### 2. 📝 Template Messaggi Personalizzabili
**Priorità:** 🟡 Media
**Descrizione:** Abbandonare il formato HTML "hardcoded" (fisso) definito in `telegram.ts` e lasciare all'utente il controllo visivo dei post generati.
**Specifiche:**
- Aggiunta di un campo `message_template` dedicato nelle impostazioni di ogni feed.
- Supporto a variabili dinamiche interpolate dall'engine: `{{title}}`, `{{link}}`, `{{summary}}`, `{{image}}`, `{{date}}`, ecc.
- Gestione corretta dell'escaping HTML per prevenire errori Telegram (es. tag `<b>` o `<i>` sbilanciati dall'utente).

### 3. 🧪 Copertura di Test Automatizzati con Vitest
**Priorità:** 🟢 Bassa
**Descrizione:** Garantire stabilità a lungo termine prevenendo regressioni nel codice core.
**Specifiche:**
- Introduzione del framework Vitest.
- Mocking completo per `TelegramClient`, Database e parser esterni.
- Focalizzarsi prioritariamente sulle test suite per `manager.ts` (CRUD) e la parsing logic delle date in `parser.ts`.

---

## 🚫 Note Architetturali (Veto Strategico YouTube)

**YouTube API v3 Ufficiali: DEPRECATE E RIFIUTATE.**
Inizialmente la roadmap prevedeva la sostituzione dell'attuale scraping interno con la Google YouTube API v3 formale. Questa direzione è stata **ufficialmente bloccata e scartata** per i seguenti gravi motivi di User Experience:
- Costringerebbe l'utente finale e lo sviluppatore a generare e gestire un'API Key tramite la Google Cloud Console (innalzando esponenzialmente la barriera d'ingresso all'uso di Titan).
- Introdurrebbe stringenti limiti di quota giornalieri non controllabili passivamente.
L'attuale implementazione tramite il modulo `youtubei.js` (basato su InnerTube) simula esattamente il comportamento di un client web, scavalca ogni necessità di configurazione, e si è dimostrato lo **standard definitivo e superiore** per la fruizione del servizio in questa applicazione.

---

## 📊 Riepilogo Effort Stimato Residuo

| Priorità | Feature | Ore stimate |
|---|---|---|
| 🔴 Alta | Fasce Orarie Silenzio | ~3h |
| 🟡 Media | Template Messaggi | ~5h |
| 🟢 Bassa | Test Automatizzati (Vitest) | ~8h |
| **Totale stimato** | | **~16 ore residue** |
