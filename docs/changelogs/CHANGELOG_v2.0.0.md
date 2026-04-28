# v2.0.0 — "Titan Blue"

**Data di rilascio:** 2026-04-28

## Overview

Redesign visivo completo dell'interfaccia. La palette Obsidian Pulse V2 (lavanda/viola) viene sostituita dal sistema cromatico **Titan Blue**: pure blue su deep black. Migrazione totale da Phosphor Icons a Lucide React.

## Cambiamenti

### Design System
- Palette colori: sfondo da `#12121f` a `#050510`, accent da lavanda ad azzurro puro `#3b82f6`
- Token `outline-variant`: da grigio `#424754` a blu `#3b82f6` — tutti i bordi diventano automaticamente blue-tinted
- Token `primary`: da `#adc6ff` a `#93c5fd` (azzurro più puro)
- `.ghost-border`, `.glass-panel`, `.panel-border`, `.grid-dots`: border rgba aggiornati al registro blu
- `.nav-item-active`: bordo sinistro da verde a blu (selezione bot = blu, bot in run = punto verde invariato)

### Icone
- Migrazione completa `@phosphor-icons/react` → `lucide-react` (già in package.json)
- Rimossi tutti i prop `weight=` non supportati da Lucide
- Mapping icone: Warning→AlertTriangle, ArrowsClockwise→RefreshCw, WarningCircle→AlertCircle, CheckCircle→CheckCircle2, EyeSlash→EyeOff, FloppyDisk→Save, CaretRight→ChevronRight, TrendUp→TrendingUp, RssSimple→Rss, Lightning→Zap, FileJs→FileCode, SquaresFour→LayoutTemplate, Funnel→Filter, CircleNotch→Loader2, Trash→Trash2, FileArrowDown→FileDown, PencilSimple→Pencil, UploadSimple→Upload, DownloadSimple→Download, ChartBar→BarChart3, Stop→Square (fill="white")

### Componenti aggiornati
- `Dashboard.tsx`, `BotSelector.tsx`, `FeedManager.tsx`, `BotSettingsModal.tsx`
- `TemplateEditor.tsx`, `SystemSettingsModal.tsx`, `StatsModal.tsx`
- `IntroScreen.tsx`, `SetupWizard.tsx`, `ErrorBoundary.tsx`
- `ui/Toast.tsx`, `ui/ConfirmDialog.tsx`
- `tailwind.config.js`, `src/renderer/src/index.css`
