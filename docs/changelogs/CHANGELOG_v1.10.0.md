# Changelog v1.10.0

**Data:** 17 Aprile 2026  
**Branch:** main  
**Tag:** v1.10.0

---

## UI Overhaul — Obsidian Pulse V2 + Fix Contrasto e Colori Semantici

Questa versione è un rilascio puramente estetico/UX che non tocca la logica applicativa né lo schema del database. Tutti i bot, feed e configurazioni esistenti sono pienamente compatibili.

### v1.9.1 — Obsidian Pulse V2 Premium UI (inclusa in questa release)

**Design System**
- Nuova palette semantica completa: `background #12121f`, surface hierarchy in 6 livelli (`surface-container-lowest` → `surface-container-highest`), tre accenti (`primary` blu/`secondary` ciano/`tertiary` lavander)
- Typography: **Space Grotesk** per i titoli (font-headline), **Inter** per il corpo (font-body), **Fira Code** per le label terminale (font-machine)
- Google Fonts aggiornati in `index.html`: Space Grotesk 300–900 + Fira Code 700

**Nuove utility CSS**
- `.ghost-border` — bordi sempre rgba(66,71,84,0.15), mai opachi
- `.glass-panel` / `.glass-panel-elevated` — backdrop-blur 12/16px, sfondo semi-trasparente, ambient shadow
- `.text-micro` / `.text-nano` — label terminale Fira Code 11/9px uppercase tracking
- `.ignition-btn` — conic-gradient (blue→cyan→blue), hover glow, stato stop (red conic)
- `.ignition-ring` — anello rotante animato per stato running
- `.gradient-border-btn` — wrapper gradient 1px trick per pulsante new-bot
- `.nav-item` / `.nav-item-active` — sidebar navigation con border-left accent
- `.drop-glow-primary/secondary/error` — filter: drop-shadow per icone colorate
- `.tile-stripe-primary/secondary/tertiary` — striscia top assoluta per stat tile
- `.toast-stripe-*` — varianti toast per tipo (info/success/warning/error)
- `.scanline-bg` — overlay scanline lavender rgba(208,188,255,0.04)
- `.grid-dots` — sfondo puntinato per aree vuote

**Componenti aggiornati**
- `Dashboard.tsx` — header glass, stat tiles con glow numeri, ignition button con ring, log panel scanline
- `BotSelector.tsx` — nav-item-active, gradient-border-btn new-bot, Phosphor icons
- `BotSettingsModal.tsx` — glass-panel, BOT_ID hex header, ignition-btn save, danger zone
- `FeedManager.tsx` — ghost-border feed cards, toggle switch secondary, gradient-border-btn add
- `TemplateEditor.tsx` — ghost-border panel, chip insert, preview con Eye/EyeSlash
- `SystemSettingsModal.tsx` — glass-panel, tab navigation, flag selector
- `StatsModal.tsx` — stat tiles con tile-stripe, feed bars gradient
- `Toast.tsx` — glass-panel-elevated, stripe colorata con glow, micro-copy SYS_NOTIFY
- `ConfirmDialog.tsx` — glass-panel, WARN header, SEQ_ID micro-copy, drop-glow-error
- `ErrorBoundary.tsx` — ambient error halo, top stripe, ERR_CODE: 0xDEAD_BEEF
- `IntroScreen.tsx` — ambient halo + grid-dots, ignition-btn CTA
- `SetupWizard.tsx` — glass-panel wizard, progress stripe gradient, step counter

**Icon migration**
- Rimosso completamente `lucide-react` dall'intero progetto
- Installato `@phosphor-icons/react` v2.1.10
- Strategia peso: `duotone` per icone dati/funzionali, `bold` per navigazione/chiudi, `fill` per stati play/stop

---

### v1.10.0 — Fix Contrasto e Colori Semantici

**Nuovo token colore: `success` verde**
- Aggiunto `success: '#4ade80'` in `tailwind.config.js`
- Aggiunte utility: `.drop-glow-success`, `.text-glow-success`, `.glow-success`

**Correzioni semantiche colore**
- `ONLINE` badge in Dashboard: da ciano (`secondary`) a verde (`success`) — indica uno stato positivo
- `BOT ATTIVO — Attivo` toggle in BotSettingsModal: da ciano a verde
- `NOTIFICHE DESKTOP — Attivato` toggle in BotSettingsModal: da blu (`primary`) a verde
- Status dot del bot attivo in BotSelector: da ciano a verde
- Nome bot selezionato in BotSelector: da ciano a verde
- Check icon del bot selezionato: da ciano a verde con `drop-glow-success`
- `nav-item-active` in CSS: border-left e color aggiornati a `#4ade80`
- `.status-dot-active` in CSS: glow aggiornato da ciano a verde

**Fix contrasto label**
- `labelCls` in BotSettingsModal: da `text-outline-variant/60` a `text-outline-variant` (piena visibilità)
- Hint text: da `text-outline-variant/30` a `text-outline-variant/50` su tutte le label di aiuto

**Danger Zone più leggibile**
- Header "DANGER ZONE": da `text-error/50` a `text-error/80`
- Titolo "Clear Broadcast History": da `text-error/70` a `text-error` (pieno)
- Descrizione danger: da `text-error/40` a `text-error/60`
- Border danger card: da `border-error/10` a `border-error/15`
- Pulsante Elimina Bot nel footer: da `text-error/50` a `text-error/70`, aggiunto border hover

**Larghezza BotSettingsModal**
- Da `max-w-4xl` (896px) a `max-w-6xl` (1152px) per dare più respiro al layout a 2 colonne

---

## Note tecniche

- Nessuna modifica al database (schema rimane v10)
- Nessuna modifica agli IPC handler
- Nessuna modifica alla logica del bot engine
- TypeScript: zero errori (`tsc --noEmit` pulito)
- Build: `Runtime Telegram Bot Titan Edition Setup 1.10.0.exe`
