# 🚀 Deployment Guide - Bot Telegram RSS v2.0.0

## 📋 Guida Completa per Server LAMP

Questa guida ti aiuterà a deployare il Bot Telegram RSS su un server LAMP Linux con tutte le ottimizzazioni implementate.

## 🔧 Prerequisiti

- Server Linux (Ubuntu 20.04+ / Debian 11+ / CentOS 8+)
- Accesso root o sudo
- Connessione internet
- Token Bot Telegram
- ID Canale Telegram

## ⚡ Deployment Automatico

### 1. Preparazione File

```bash
# Carica i file del progetto sul server
scp -r ./TELEGRAMBOT/ user@server:/tmp/bot-telegram-rss/
```

### 2. Esecuzione Script

```bash
# Connettiti al server
ssh user@server

# Vai nella directory del progetto
cd /tmp/bot-telegram-rss

# Rendi eseguibile lo script
chmod +x deploy_server.sh

# Esegui il deployment (come root)
sudo ./deploy_server.sh
```

## 🔧 Configurazione Manuale

### 1. Configurazione Token

```bash
# Modifica il file di configurazione
sudo nano /opt/bot-telegram-rss/.env

# Aggiungi i tuoi dati:
BOT_TOKEN=your_telegram_bot_token_here
CHANNEL_ID=@your_channel_name
```

### 2. Avvio Servizio

```bash
# Avvia il bot
sudo systemctl start bot-telegram-rss

# Verifica stato
sudo systemctl status bot-telegram-rss

# Abilita avvio automatico
sudo systemctl enable bot-telegram-rss
```

## 📊 Monitoraggio e Gestione

### Comandi Utili

```bash
# Visualizza log in tempo reale
sudo journalctl -u bot-telegram-rss -f

# Riavvia servizio
sudo systemctl restart bot-telegram-rss

# Ferma servizio
sudo systemctl stop bot-telegram-rss

# Controlla uso risorse
htop
```

### Log Files

- **Sistema**: `/var/log/syslog`
- **Bot**: `/opt/bot-telegram-rss/logs/bot.log`
- **Monitor**: `/opt/bot-telegram-rss/logs/monitor.log`

## 🔍 Troubleshooting

### Problemi Comuni

#### 1. Bot non si avvia
```bash
# Controlla log errori
sudo journalctl -u bot-telegram-rss --no-pager

# Verifica configurazione
sudo -u botuser /opt/bot-telegram-rss/venv/bin/python /opt/bot-telegram-rss/src/bot.py
```

#### 2. Errori di memoria
```bash
# Controlla uso memoria
free -h
ps aux | grep python

# Riavvia se necessario
sudo systemctl restart bot-telegram-rss
```

#### 3. Problemi di rete
```bash
# Testa connettività
curl -I https://api.telegram.org
ping google.com

# Controlla firewall
sudo ufw status
```

## 📈 Ottimizzazioni Implementate

### ✅ Compatibilità Linux
- ✅ `nest_asyncio` condizionale per Windows
- ✅ Path cross-platform con `pathlib`
- ✅ Rilevamento automatico ambiente

### ✅ Performance
- ✅ Lazy loading database con cache
- ✅ Monitoraggio memoria automatico
- ✅ Cleanup automatico ogni 15 minuti
- ✅ Rotazione log automatica

### ✅ Affidabilità
- ✅ Salvataggio atomico database
- ✅ Backup automatico giornaliero
- ✅ Monitoraggio servizio ogni 5 minuti
- ✅ Riavvio automatico in caso di problemi

## 🔧 Configurazioni Avanzate

### Modifica Intervalli

Modifica `/opt/bot-telegram-rss/src/config.py`:

```python
# Intervallo controllo feed (secondi)
FEED_CHECK_INTERVAL = 1800  # 30 minuti

# Timeout cache (secondi)  
CACHE_TIMEOUT = 3600  # 1 ora
```

### Personalizza Log Level

```bash
# Modifica .env
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
```

## 📊 Metriche e Monitoraggio

### Comando Status Bot

Invia `/status` al bot per vedere:
- Uptime
- Controlli eseguiti
- Tasso di successo
- Uso memoria
- Dimensione database

### Script di Monitoraggio

```bash
# Esegui manualmente
sudo -u botuser /opt/bot-telegram-rss/monitor.sh

# Visualizza log monitoraggio
tail -f /opt/bot-telegram-rss/logs/monitor.log
```

## 🔄 Aggiornamenti

### Aggiornamento Codice

```bash
# Ferma servizio
sudo systemctl stop bot-telegram-rss

# Backup configurazione
sudo cp /opt/bot-telegram-rss/.env /tmp/bot-env-backup

# Aggiorna file
sudo cp -r ./src/* /opt/bot-telegram-rss/src/

# Ripristina configurazione
sudo cp /tmp/bot-env-backup /opt/bot-telegram-rss/.env

# Riavvia servizio
sudo systemctl start bot-telegram-rss
```

## 🆘 Supporto

### File di Log Importanti

1. **Errori sistema**: `journalctl -u bot-telegram-rss`
2. **Log applicazione**: `/opt/bot-telegram-rss/logs/bot.log`
3. **Monitoraggio**: `/opt/bot-telegram-rss/logs/monitor.log`

### Comandi Diagnostici

```bash
# Stato completo sistema
sudo systemctl status bot-telegram-rss
sudo journalctl -u bot-telegram-rss --no-pager -n 50

# Test manuale
sudo -u botuser /opt/bot-telegram-rss/venv/bin/python /opt/bot-telegram-rss/src/bot.py

# Verifica dipendenze
sudo -u botuser /opt/bot-telegram-rss/venv/bin/pip list
```

---

## 🎉 Deployment Completato!

Il tuo Bot Telegram RSS è ora ottimizzato per server LAMP con:

- ✅ **Compatibilità Linux completa**
- ✅ **Monitoraggio memoria automatico**
- ✅ **Cleanup e backup automatici**
- ✅ **Rotazione log configurata**
- ✅ **Riavvio automatico in caso di problemi**
- ✅ **Performance ottimizzate per long-running**

Il bot è pronto per gestire 30+ feed RSS in modo affidabile e automatico! 🚀