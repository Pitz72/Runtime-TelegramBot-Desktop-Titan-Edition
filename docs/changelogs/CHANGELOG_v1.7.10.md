# Changelog v1.7.10 (Titan Edition)

**Data di Rilascio:** 13 Aprile 2026

## 🔒 Sicurezza: Risoluzione Criticità Gravissime (P0)

### 1. Rimozione Segreto Crittografico Hardcoded (`RTB_SECRET`)
È stata risolta una grave vulnerabilità di sicurezza (P0) identificata nel modulo di esportazione dei bot (file `.rtb`). Nelle versioni precedenti (v1.7.7-v1.7.9), la cifratura del token del bot all'interno dei file di esportazione dipendeva da una chiave AES-256 hardcoded in chiaro all'interno del codice sorgente (`RTB_SECRET`). Questo difetto rendeva i file `.rtb` decifrabili da chiunque possedesse una copia dell'eseguibile o accesso al repository GitHub.

**Dettagli del Fix (Microscopico e Scientifico):**
- L'intera logica di esportazione/importazione basata su `crypto.createCipheriv` e il segreto `RTB_SECRET` statico è stata completamente sradicata dal file `src/main/bot/manager.ts`.
- È stata adottata l'API nativa `safeStorage` di Electron per la cifratura sicura del token in fase di esportazione.
- `safeStorage` si appoggia direttamente alle keychain di sistema dell'OS (es. Credential Manager su macOS, DPAPI su Windows, libsecret/KWallet su Linux).
- I file `.rtb` esportati a partire dalla versione 1.7.10 sono ora intrinsecamente vincolati alla specifica macchina in uso, impedendo a malintenzionati di estrarre il token anche in caso di furto o intercettazione del file `.rtb`.

**Retrocompatibilità e mitigazione file compromessi:**
- L'importazione di file `.rtb` vecchi, generati con la vulnerabile versione 1.7.7, viene intercettata, bloccata (restituendo stringa vuota per il token) e forzata affinché il bot venga ricreato ma col campo token da reinserire manualmente dall'utente, garantendo un "secure fallback" per i file legacy.

## 📦 Dipendenze
- La versione del pacchetto all'interno di `package.json` e `package-lock.json` è stata correttamente aggiornata alla **v1.7.10**.

## 📋 Note Operative per gli Sviluppatori
- Il documento tecnico di analisi delle criticità (`analisi_criticita_titan.resolved.md.resolved`) è stato aggiornato. La vulnerabilità n.1 è stata marcata come `✅ RISOLTO`.
- Non è più possibile trasferire "agilmente" e ad occhi chiusi i file `.rtb` da una postazione all'altra se questi contengono il token del bot in formato cifrato `ss` (Safe Storage), aumentando lo standard di sicurezza a livello enterprise.
