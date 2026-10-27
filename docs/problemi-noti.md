# Problemi noti

Difetti conosciuti e **non ancora corretti**, con il punto esatto del codice dove stanno. Quando uno viene corretto si toglie da qui e finisce nel changelog della versione che lo chiude.

---

## Testi del motore non tradotti nell'interfaccia inglese

- **Versione:** 2.4.1
- **Scoperto:** 27/10/2026, catturando l'interfaccia inglese per il video «Titan — The story» (vetrina `npm run preview:ui`, dati finti).
- **Stato:** aperto. Titan è in pausa: il difetto è registrato per la prossima manutenzione, non corretto.

### Sintomo

Con l'interfaccia in inglese, alcune righe del diario e la notifica di pubblicazione restano in italiano:

| Dove | Testo che compare |
| :--- | :--- |
| `src/main/bot/telegram.ts:132` | `⚠️ Errore di rete verso Telegram (tentativo N/3): …` (riga del diario, livello `warn`) |
| `src/main/bot/engine.ts:678` | `⚠️ [bot] Telegram non raggiungibile: «…» non pubblicato, riproverò al prossimo giro. (…)` |
| `src/main/bot/engine.ts:167` | `👆 Controllo immediato richiesto: tutte le sorgenti attive, senza aspettare il loro intervallo.` |
| `src/main/bot/parser.ts:374` | `Fetch fallito: …` (messaggio d'errore che risale fino al diario) |
| `src/main/bot/engine.ts:656` | corpo della notifica di sistema: `Inviato: <titolo>` |

### Causa

Sono testi scritti direttamente nel main process, fuori da `src/renderer/src/locales/*.json`. Altre righe del diario escono già nella lingua scelta; queste no, perché il testo è fisso nel codice e il main non tiene conto della lingua dell'interfaccia.

### Correzione da fare

Portare questi testi nello stesso meccanismo con cui le altre righe del diario arrivano tradotte, oppure far conoscere al main la lingua attiva (serve anche per la notifica di sistema, che non passa dal renderer). Dopo la correzione, `check:locales` dovrebbe coprire anche queste chiavi.

### Non è un difetto

Nell'interfaccia inglese l'ora del prossimo giro è a 12 ore (`Next run at 09:13 AM`): è il comportamento voluto della localizzazione inglese.
