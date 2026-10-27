# Changelog - BotTelegramRSS

## [v2.0.3] "Phantom" - 2025-12-10
*Hotfix Release*

- **Fix Grafico**: Risolto bug che mostrava `u200b` nei messaggi Telegram. Escaping corretto del carattere invisible zero-width space.

## [v2.0.2] "Connection" - 2025-12-10
*Patch Release*

- **Documentazione**: Sincronizzazione completa tra codice e documentazione.
- **Versioning**: `src/version.py` è ora l'unica fonte di verità (SSOT).
- **Cleanup**: Rimozione file temporanei (`FIX_NOTES.md`) e consolidamento log.

## [v2.0.1] "Polyglot" - 2025-12-08
*Feature Release*

- **Azuracast**: Aggiunto supporto per feed RSS generati da Azuracast.
- **Fix Immagini**: Migliore estrazione immagini da tag `itunes:image` e fallback.
- **Preview**: Implementato hack per forzare l'anteprima immagini nei messaggi Telegram.

## [v2.0.0] "Phoenix" - 2024-10-31
*Major Release*

### 🔥 Refactoring Architetturale
- Riscrittura completa per supportare multi-feed reale.
- Supporto fino a 30 feed RSS simultanei.
- Rimozione logica legacy e dipendenze non necessarie.

### 📝 Messaggistica
- Nuovo template messaggio ottimizzato per l'italiano.
- I messaggi ora includono il nome del feed di provenienza.
- Pulizia automatica tag HTML dai testi.

### 🛡️ Features Avanzate
- **Data Cutoff**: I feed processano solo episodi successivi al 1 Settembre 2025.
- **Logging**: Sistema di logging avanzato con rotazione (su server).
- **Rate Limiting**: Ottimizzato per evitare flood verso Telegram API.

## Versioni Precedenti
- **v0.8.2 "Fortress"**: Focus su sicurezza e validazione input.
- **v0.8.1 "Velocity"**: Miglioramenti performance ed estrazione tag.
- **v0.8.0 "Foundation"**: Prima versione stabile architettura base.
