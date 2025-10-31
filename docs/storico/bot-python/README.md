# 🤖 Bot Telegram RSS

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
