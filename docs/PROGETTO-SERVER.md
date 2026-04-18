# Progetto Server — Runtime TelegramBot Headless Mode

**Stato:** Idea documentata — non pianificata per v2.0.0  
**Origine:** `docs/analisi-tecnica.md` — sezione "Ad alto impatto operativo"  
**Aggiornamento:** 18 Aprile 2026

---

## Idea

Una modalità di esecuzione headless (senza GUI Electron) che permetta di far girare il bot su un **VPS Linux** o qualsiasi server senza display. Il processo sarebbe controllato tramite una **mini Web UI** o **REST API** accessibile via browser locale, in continuità con la `web_control/` del bot Python originale da cui Runtime TelegramBot discende.

```
# Scenario d'uso immaginato:
node titanbot-server.js --db /data/titan.db --port 3000

# Da browser o curl:
GET  http://localhost:3000/api/bots
POST http://localhost:3000/api/engine/start
GET  http://localhost:3000/api/logs
```

---

## Analisi Tecnica (Aprile 2026)

### Cosa funzionerebbe già

Il core bot è già ragionevolmente disaccoppiato da Electron:

| Componente | Stato headless | Note |
|------------|---------------|------|
| `BotEngine` | ✅ Quasi pronto | 3 ref a Electron da rimuovere |
| `BotManager` | ⚠️ Problema token | `safeStorage` è Electron-only |
| `TelegramClient` | ✅ Puro Node.js | Zero dipendenze Electron |
| `Database` (SQLite) | ✅ Quasi pronto | Path via `app.getPath()` da parametrizzare |
| `Logger` | ✅ Quasi pronto | IPC flush da rimuovere |
| `IPC layer` | ❌ Va riscritto | Da sostituire con REST API (~2-3h) |

**Riuso stimato: ~70% della logica business.**

### Il problema principale: safeStorage

I token Telegram sono cifrati in DB tramite `safeStorage` di Electron, che usa il keychain del SO (DPAPI su Windows, Keychain su macOS, libsecret su Linux). La chiave è **vincolata alla macchina**. Un database esportato da un'installazione desktop non è importabile direttamente in un server — i token risulterebbero illeggibili.

Soluzione: per la modalità server, sostituire `safeStorage` con `node:crypto` + chiave derivata da env var (`TITAN_SECRET_KEY`). Questo richiede un **passo di migrazione** per chi volesse portare la propria config dal desktop al server.

### Stima lavoro MVP

| Fase | Lavoro | Tempo |
|------|--------|-------|
| Astrarre Electron da engine/manager/db/logger | Minimal | ~50 min |
| REST API (replica handler IPC) | Nuovo | ~2-3 ore |
| CLI entry point (`--db`, `--port`, `--headless`) | Nuovo | ~1 ora |
| Gestione token (node:crypto + migrazione) | Nuovo | ~1 ora |
| **TOTALE MVP** | | **~5-6 ore** |

---

## Perché Non è Pianificato per v2.0.0

1. **Non è un fix né una feature del desktop** — è un prodotto separato con un pubblico diverso (utenti VPS vs utenti desktop).
2. **Il problema `safeStorage`** introduce incompatibilità di database tra le due versioni che richiedono documentazione e tooling aggiuntivo.
3. **L'obiettivo di v2.0.0** è chiudere il ciclo del desktop con `#11 autoUpdater` e rilascio ufficiale. Il server mode è lavoro post-v2.0.0.
4. **Prerequisito implicito**: prima di una modalità server, è più sensato verificare il porting cross-platform del desktop stesso (macOS/Linux), che è un prerequisito naturale per la build headless su Linux.

---

## Roadmap Possibile (Post-v2.0.0)

```
[v2.0.0]  #11 autoUpdater nativo → rilascio ufficiale desktop
[v2.1.0?] Porting macOS/Linux del desktop (prerequisito naturale)
[v3.0.0?] Runtime TelegramBot Server — modalità headless + REST API
```

---

## Riferimenti

- `docs/analisi-tecnica.md` — sezione "Ad alto impatto operativo"
- `src/main/bot/engine.ts` — BotEngine (core da astrarre)
- `src/main/bot/manager.ts` — BotManager + safeStorage
- `src/main/ipc.ts` — handler IPC da replicare come REST
