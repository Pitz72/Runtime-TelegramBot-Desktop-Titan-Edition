# 🚀 Guida Avvio Locale - Bot Telegram RSS

## 📋 Prerequisiti

### 1. Python
- **Versione richiesta:** Python 3.8 o superiore
- **Verifica installazione:** Apri PowerShell e digita:
  ```powershell
  python --version
  ```
- Se non installato, scarica da: https://www.python.org/downloads/

### 2. Token Bot Telegram
- Contatta **@BotFather** su Telegram
- Crea un nuovo bot con `/newbot`
- Salva il token ricevuto (formato: `123456789:ABCdefGHIjklMNOpqrSTUvwxyz`)

### 3. Canale Telegram
- Crea un canale Telegram pubblico
- Aggiungi il bot come amministratore
- Annota il nome del canale (es: `@mio_canale`)

---

## 🛠️ Configurazione Iniziale

### 1. Apri PowerShell
```powershell
# Naviga nella cartella del progetto
cd "C:\Users\Utente\Documents\SVILUPPO\UTILITY\BOT-TELEGRAM-RSS\TELEGRAMBOT"
```

### 2. Installa le dipendenze
```powershell
# Installa i pacchetti Python necessari
pip install -r requirements.txt
```

### 3. Configura le variabili d'ambiente
```powershell
# Copia il file di esempio
copy config\env.example .env

# Modifica il file .env con Notepad
notepad .env
```

### 4. Modifica il file .env
Inserisci i tuoi dati nel file `.env`:
```env
# Token del tuo bot (OBBLIGATORIO)
BOT_TOKEN=il_tuo_token_qui

# Nome del tuo canale (OBBLIGATORIO)
CHANNEL_ID=@il_tuo_canale

# Altre configurazioni (opzionali)
ENVIRONMENT=production
LOG_LEVEL=INFO
FEED_CHECK_INTERVAL=1800
```

---

## ▶️ Avvio dello Script

### Metodo 1: Avvio Normale
```powershell
# Dalla cartella TELEGRAMBOT
python main.py
```

### Metodo 2: Avvio con Log Dettagliati
```powershell
# Per vedere più informazioni di debug
python main.py 2>&1 | Tee-Object -FilePath "logs\bot.log"
```

### Metodo 3: Test Connessione (Raccomandato per la prima volta)
```powershell
# Testa la connessione prima dell'avvio completo
python test_bot_connection.py
```

---

## 📊 Monitoraggio

### Verifica Stato Bot
- Il bot invierà un messaggio di attivazione al canale
- Controlla i log nel terminale per eventuali errori
- I file di log sono salvati in `logs/`

### Comandi Bot Disponibili
- `/start` - Informazioni sul bot
- `/status` - Stato operativo e statistiche

### File Importanti
- `processed_episodes.json` - Database episodi già processati
- `logs/` - Directory con i file di log
- `.env` - Configurazioni personali (NON condividere)

---

## 🔧 Risoluzione Problemi

### Errore: "ModuleNotFoundError"
```powershell
# Reinstalla le dipendenze
pip install --upgrade -r requirements.txt
```

### Errore: "Invalid token"
- Verifica il token nel file `.env`
- Assicurati che non ci siano spazi extra
- Richiedi un nuovo token da @BotFather se necessario

### Errore: "Chat not found"
- Verifica il nome del canale nel file `.env`
- Assicurati che il bot sia amministratore del canale
- Il canale deve essere pubblico o il bot deve essere membro

### Bot non trova nuovi episodi
- Il bot processa solo episodi dal **1 settembre 2025** in poi
- Controlla che i feed RSS siano accessibili
- Verifica i log per errori di connessione

---

## 🛑 Arresto del Bot

```powershell
# Nel terminale dove è in esecuzione il bot
Ctrl + C
```

---

## 📝 Note Importanti

1. **Sicurezza:** Non condividere mai il file `.env` o il token del bot
2. **Backup:** Il file `processed_episodes.json` contiene lo storico - fai backup regolari
3. **Rate Limiting:** Il bot rispetta i limiti di Telegram (max 30 messaggi/minuto)
4. **Monitoraggio:** Controlla periodicamente i log per eventuali errori
5. **Aggiornamenti:** I feed RSS vengono controllati ogni 30 minuti

---

## 🆘 Supporto

Se riscontri problemi:
1. Controlla i log in `logs/`
2. Verifica la configurazione in `.env`
3. Testa la connessione con `python test_bot_connection.py`
4. Assicurati che Python e le dipendenze siano aggiornate

**Versione Bot:** 2.0.0 "Connection"
**Data Cutoff:** 1 settembre 2025
**Feed Monitorati:** 32 feed RSS Runtime Radio