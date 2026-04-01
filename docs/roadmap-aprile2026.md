# Analisi Tecnica e Prossimi Step (01 Aprile 2026)

Durante l'assistenza odierna sono state identificate delle criticità nel motore di invio e nella gestione dei template, che andranno risolte nelle prossime release.

## 🐛 Bug Identificati

### 1. Mancato Escape delle URL (telegram.ts)
- **Problema**: I campi `{{link}}` e `item.image` (nel `previewHack`) vengono inseriti nei tag HTML senza codifica. Se la URL contiene un carattere `&` (comune in WordPress e podcast), Telegram fallisce il parsing dell'entità HTML.
- **Sintomo**: Il bot tenta l'invio 5 volte ( timeout di ~30s) e poi logga "Send failed", entrando in un loop infinito di tentativi ad ogni scansione del feed.
- **Soluzione**: Applicare `this.escape()` anche a `item.link` e `item.image` prima della sostituzione nel template.

### 2. Log "Ciechi" nell'Interfaccia
- **Problema**: Gli errori dettagliati di Telegram (es. `Bad Request: can't parse entities`) vengono inviati su un canale IPC (`bot-log`) che il frontend (`Dashboard.tsx`) attualmente ignora. L'utente vede solo un generico "Send failed" dai log dell'engine.
- **Soluzione**: Aggiungere un listener nel frontend per mostrare i log tecnici del client Telegram nella console di sistema.

---

## 🚀 Nuove Funzionalità Proposte

### Sistema di Verifica Intelligente dei Template
Implementare un validatore in tempo reale (nel componente `TemplateEditor.tsx` o `BotSettingsModal.tsx`) che:
- Verifichi che tutti i tag HTML siano chiusi correttamente (es. evitare errori come `<\a>`).
- Verifichi l'uso di soli tag supportati da Telegram (b, i, u, code, pre, a).
- Avvisi l'utente se i segnaposto (Smart Chips) sono inseriti in posizioni che potrebbero rompere la sintassi (es. dentro un attributo senza escape).

---

## ⚡ Ottimizzazioni UI e Prestazioni

### Risoluzione Issue Lag (Ambienti 4K / GPU Legacy)
L'interfaccia "Titan Glass" può risultare pesante su risoluzioni elevate (4K) o macchine con accelerazione hardware instabile (es. GPU AMD con driver obsoleti).
- **Soluzione Proposta**: Implementare una "Performance Mode" (Toggle nelle impostazioni) che:
    - Disabiliti le animazioni scanline (`scanline-sweep`) e i gradienti conici rotanti.
    - Rimpiazzi i blur pesanti (`backdrop-blur`) con colori solidi semi-trasparenti più leggeri.
    - Riduca l'uso di `box-shadow` animate per limitare i ricalcoli del compositore della GPU.
- **Tecnico**: Utilizzare la proprietà CSS `will-change` per ottimizzare i layer di animazione rimasti attivi.

---
*Note registrate il 01/04/2026 per la pianificazione della v1.7.8+*
