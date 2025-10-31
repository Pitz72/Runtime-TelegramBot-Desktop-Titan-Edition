# Bot Telegram RSS per Podcast

🤖 Un bot Telegram avanzato per il monitoraggio automatico di feed RSS di podcast con notifiche intelligenti e gestione degli episodi.

## 📋 Caratteristiche

- **Monitoraggio automatico** di feed RSS di podcast
- **Notifiche intelligenti** su Telegram per nuovi episodi
- **Gestione avanzata degli errori** con retry automatico
- **Template personalizzabili** per i messaggi
- **Prevenzione duplicati** con tracking degli episodi processati
- **Supporto anteprime link** con controllo granulare
- **Logging dettagliato** per debugging e monitoraggio
- **Gestione robusta dell'event loop** per stabilità su Windows

## 🚀 Installazione

### Prerequisiti

- Python 3.8 o superiore
- Un bot Telegram (ottenibile da [@BotFather](https://t.me/BotFather))
- Feed RSS valido del podcast da monitorare

### Setup

1. **Clona il repository**
   ```bash
   git clone <url-repository>
   cd BOT-TELEGRAM-RSS
   ```

2. **Installa le dipendenze**
   ```bash
   cd TELEGRAMBOT
   pip install -r requirements.txt
   ```

3. **Configura le variabili d'ambiente**
   ```bash
   cp config/env.example .env
   ```
   
   Modifica il file `.env` con i tuoi dati:
   ```env
   TELEGRAM_BOT_TOKEN=il_tuo_token_bot
   TELEGRAM_CHAT_ID=il_tuo_chat_id
   RSS_FEED_URL=url_del_feed_rss
   CHECK_INTERVAL=300
   ```

4. **Test della connessione**
   ```bash
   python test_bot_connection.py
   ```

## 🔧 Configurazione

### Variabili d'ambiente

| Variabile | Descrizione | Default |
|-----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Token del bot Telegram | Obbligatorio |
| `TELEGRAM_CHAT_ID` | ID del chat/canale di destinazione | Obbligatorio |
| `RSS_FEED_URL` | URL del feed RSS da monitorare | Obbligatorio |
| `CHECK_INTERVAL` | Intervallo di controllo in secondi | 300 |
| `MAX_RETRIES` | Numero massimo di retry per errori | 3 |
| `RETRY_DELAY` | Delay tra i retry in secondi | 5 |

### Personalizzazione Template

I template dei messaggi sono configurabili nel file `src/bot.py`:

- `create_improved_message_with_feed()` - Template completo con info feed
- `create_improved_message()` - Template semplificato
- `create_legacy_message()` - Template di fallback

## 🏃‍♂️ Utilizzo

### Avvio del bot

```bash
# Dalla directory TELEGRAMBOT
python main.py
```

### Avvio come servizio (Windows)

```bash
# Installa come servizio Windows
sc create TelegramRSSBot binPath="python C:\path\to\main.py"
sc start TelegramRSSBot
```

### Avvio con Docker (opzionale)

```dockerfile
# Dockerfile di esempio
FROM python:3.9-slim
WORKDIR /app
COPY TELEGRAMBOT/ .
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
```

## 📁 Struttura del Progetto

```
BOT-TELEGRAM-RSS/
├── README.md                    # Questo file
├── README_AVVIO_LOCALE.md      # Guida avvio locale
└── TELEGRAMBOT/
    ├── main.py                  # Entry point principale
    ├── requirements.txt         # Dipendenze Python
    ├── test_bot_connection.py   # Test connessione
    ├── config/
    │   └── env.example         # Template variabili d'ambiente
    ├── src/
    │   ├── bot.py              # Logica principale del bot
    │   ├── config.py           # Gestione configurazione
    │   └── version.py          # Informazioni versione
    ├── data/
    │   └── processed_episodes.json  # Cache episodi processati
    └── logs/                   # Directory log (auto-creata)
```

## 🔍 Funzionalità Avanzate

### Gestione degli Errori

- **Retry automatico** per errori di rete temporanei
- **Gestione timeout** con backoff esponenziale
- **Logging dettagliato** di tutti gli errori
- **Graceful shutdown** con cleanup delle risorse

### Prevenzione Duplicati

- **Tracking persistente** degli episodi già processati
- **Confronto intelligente** basato su URL e timestamp
- **Pulizia automatica** dei dati obsoleti

### Compatibilità Windows

- **nest_asyncio** per compatibilità event loop
- **Gestione robusta** delle eccezioni di sistema
- **Supporto PowerShell** per automazione

## 🐛 Troubleshooting

### Problemi Comuni

**Bot non risponde**
```bash
# Verifica token e connessione
python test_bot_connection.py
```

**Errori event loop**
- Il bot include fix automatici per Windows
- Verifica che non ci siano altri processi Python in conflitto

**Anteprime link mancanti**
- Problema lato feed RSS (meta tag Open Graph)
- Usa `@WebPageBot` su Telegram per forzare aggiornamento cache

**Episodi duplicati**
- Verifica integrità file `processed_episodes.json`
- Elimina il file per reset completo (perderai lo storico)

### Log e Debug

```bash
# Abilita logging dettagliato
export LOG_LEVEL=DEBUG
python main.py
```

I log sono salvati in `logs/` con rotazione automatica.

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/nuova-funzionalita`)
3. Commit delle modifiche (`git commit -am 'Aggiunge nuova funzionalità'`)
4. Push del branch (`git push origin feature/nuova-funzionalita`)
5. Apri una Pull Request

## 📝 Changelog

### v1.0.0 (Latest)
- ✅ Risolto errore "Cannot close a running event loop"
- ✅ Migliorata gestione errori di timeout e rete
- ✅ Aggiunto cleanup automatico delle risorse
- ✅ Ottimizzata compatibilità Windows

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 🆘 Supporto

Per problemi, bug report o richieste di funzionalità:

- Apri un [Issue](../../issues) su GitHub
- Consulta la [documentazione](../../wiki)
- Controlla i [problemi noti](../../issues?q=is%3Aissue+is%3Aopen+label%3Abug)

---

**Sviluppato con ❤️ per la comunità dei podcast italiani**