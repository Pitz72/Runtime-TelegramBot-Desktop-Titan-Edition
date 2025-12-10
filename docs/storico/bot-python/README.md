# 🤖 Bot Telegram RSS v2.0.3

**Bot Telegram per monitoraggio feed RSS - Production Ready**
*Versione 2.0.3 "Phantom"*

**Bot Telegram per monitoraggio feed RSS - Script Python locale**

## 🚀 **SETUP RAPIDO**

### **1. Installa dipendenze**
```bash
pip install -r requirements.txt
```

### **2. Configura il bot**
Copia `config/env.example` in `.env` e inserisci:
```env
BOT_TOKEN=il_tuo_token_bot
CHANNEL_ID=@il_tuo_canale
```

### **3. Avvia il bot**
```bash
python main.py
```

## 📋 **REQUISITI**
- Python 3.8+
- Token bot Telegram (da @BotFather)
- Canale Telegram dove pubblicare

## 🔧 **CONFIGURAZIONE FEED**
I feed RSS sono configurati direttamente nel file `src/config.py` nella lista `PODCAST_FEEDS`.

---

*Script semplice per uso personale locale*

---

## 📚 DOCUMENTAZIONE

Per dettagli completi su modifiche e versioni, consultare:
- [CHANGELOG.md](CHANGELOG.md) - Storico modifiche
- `docs/` - Documentazione tecnica e logs

## ⚠️ **STATO PROGETTO & NOTE IMPORTANTI**

### **1. Sicurezza e Credenziali**
> **NOTA BENE**: La presenza di token o credenziali *hardcoded* nel codice **NON è un problema di sicurezza** in questo contesto. Il bot risiede ed è eseguito esclusivamente su una macchina privata gestita localmente dall'utente. Non è previsto il deployment su server pubblici o cloud condivisi.

### **2. Anteprime Immagini**
La questione delle anteprime delle immagini nei messaggi Telegram **sembra essere risolta**. Tuttavia, la situazione va **monitorata** nel tempo per assicurarsi che Telegram continui a generare correttamente le preview dai metadati dei feed.

### **3. Interfaccia Web**
Il modulo `web_control` (Interfaccia Web) è da considerarsi un **PROGETTO ABBANDONATO**. 
- Non deve essere utilizzato o considerato per lo sviluppo futuro.
- Fare riferimento solo agli script Python locali per la gestione del bot.
