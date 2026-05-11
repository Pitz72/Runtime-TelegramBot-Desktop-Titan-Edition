# v2.0.2 — Fix auto-updater: nomi artifact senza spazi

**Data di rilascio:** 2026-05-11

## Overview

Hotfix per l'auto-updater OTA che restituiva 404 al download. Il problema era un mismatch tra il nome file nel `latest.yml` generato da electron-builder e il nome asset effettivamente salvato da GitHub Releases.

## Bug risolto

### Auto-updater 404 — mismatch nome file artifact

**Causa:** `electron-builder` usa `${productName}` nell'`artifactName`, che contiene spazi ("Runtime Telegram Bot Titan Edition"). Nella generazione del `latest.yml` li converte in trattini (`Runtime-Telegram-Bot-Titan-Edition-Setup-2.0.1.exe`), ma GitHub Releases li salva come asset con i punti (`Runtime.Telegram.Bot.Titan.Edition-Setup-2.0.1.exe`). electron-updater cerca il file con trattini → 404.

**Fix — `electron-builder.yml`:**
`artifactName` di Windows, Linux e macOS ora usa nomi hardcoded senza spazi:
- Windows: `RuntimeTelegramBot-TitanEdition-Setup-${version}.${ext}`
- Linux / macOS: `RuntimeTelegramBot-TitanEdition-${version}.${ext}`

Il `latest.yml` generato e il nome asset su GitHub coincidono esattamente → download OTA funzionante.

## File modificati

- `electron-builder.yml` — artifactName senza spazi su tutti e tre i target (win, linux, mac)
