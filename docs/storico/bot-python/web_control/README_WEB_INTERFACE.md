# 🌐 Web Control Interface - Bot Telegram RSS

Interfaccia web moderna per il controllo remoto del Bot Telegram RSS su server LAMP.

## 📋 Descrizione

Questa interfaccia web ti permette di:
- ✅ **Avviare/Fermare** il bot da remoto
- 📊 **Monitorare lo stato** in tempo reale
- 📝 **Visualizzare i log** del bot
- 🔐 **Accesso sicuro** con autenticazione
- 🌐 **Interfaccia responsive** per desktop e mobile

## 🎯 Caratteristiche

### 🖥️ **Interfaccia Utente**
- Design moderno e responsive
- Aggiornamento stato automatico ogni 30 secondi
- Indicatori visivi dello stato del bot
- Messaggi di feedback per ogni operazione
- Compatibile con tutti i browser moderni

### 🔧 **Funzionalità Backend**
- Connessione SSH sicura al server
- Gestione processi bot (start/stop/status)
- API RESTful per tutte le operazioni
- Logging completo delle operazioni
- Gestione errori robusta

### 🔐 **Sicurezza**
- Autenticazione HTTP Basic
- Hash delle password con SHA-256
- Connessione SSH con chiave o password
- CORS configurato per sicurezza
- Validazione di tutti gli input

## 📦 Installazione

### 1. **Preparazione**
```bash
cd TELEGRAMBOT/web_control
```

### 2. **Installazione Automatica (Windows)**
```bash
setup_web_control.bat
```

### 3. **Installazione Manuale**
```bash
# Crea ambiente virtuale
python -m venv venv_web

# Attiva ambiente (Windows)
venv_web\Scripts\activate.bat

# Attiva ambiente (Linux/Mac)
source venv_web/bin/activate

# Installa dipendenze
pip install -r requirements_web.txt
```

## ⚙️ Configurazione

### 1. **Modifica web_config.json**
```json
{
    "SSH_HOST": "your-server.com",
    "SSH_PORT": 22,
    "SSH_USERNAME": "your-username",
    "SSH_PASSWORD": null,
    "SSH_KEY_PATH": "~/.ssh/id_rsa",
    "BOT_PATH": "/home/username/bot-telegram-rss",
    "BOT_SCRIPT": "main.py",
    "PYTHON_CMD": "python3",
    "AUTH_ENABLED": true,
    "AUTH_USERNAME": "admin"
}
```

### 2. **Parametri di Configurazione**

| Parametro | Descrizione | Esempio |
|-----------|-------------|---------|
| `SSH_HOST` | Indirizzo del server LAMP | `"192.168.1.100"` |
| `SSH_PORT` | Porta SSH (default 22) | `22` |
| `SSH_USERNAME` | Username SSH | `"ubuntu"` |
| `SSH_PASSWORD` | Password SSH (null per chiave) | `null` |
| `SSH_KEY_PATH` | Percorso chiave SSH | `"~/.ssh/id_rsa"` |
| `BOT_PATH` | Percorso bot sul server | `"/home/user/bot"` |
| `BOT_SCRIPT` | Nome script bot | `"main.py"` |
| `PYTHON_CMD` | Comando Python | `"python3"` |
| `AUTH_ENABLED` | Abilita autenticazione | `true` |
| `AUTH_USERNAME` | Username web | `"admin"` |

### 3. **Configurazione SSH**

#### **Opzione A: Chiave SSH (Raccomandato)**
```bash
# Genera chiave SSH se non presente
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copia chiave sul server
ssh-copy-id username@your-server.com
```

#### **Opzione B: Password SSH**
```json
{
    "SSH_PASSWORD": "your-ssh-password",
    "SSH_KEY_PATH": null
}
```

## 🚀 Utilizzo

### 1. **Avvio Server Web**
```bash
# Attiva ambiente virtuale
venv_web\Scripts\activate.bat  # Windows
source venv_web/bin/activate   # Linux/Mac

# Avvia server
python app.py
```

### 2. **Accesso Web**
- Apri browser su: **http://localhost:5000**
- Username: `admin` (configurabile)
- Password: `<PASSWORD_PREDEFINITA>` (CAMBIALA!)

### 3. **Operazioni Disponibili**

#### 🚀 **Avvia Bot**
- Clicca "Avvia Bot"
- Il sistema verificherà se il bot è già in esecuzione
- Avvierà il bot in background sul server

#### 🛑 **Ferma Bot**
- Clicca "Ferma Bot"
- Terminerà tutti i processi del bot
- Confermerà l'arresto

#### 🔄 **Aggiorna Stato**
- Clicca "Aggiorna Stato"
- Verifica stato corrente del bot
- Mostra PID se in esecuzione

## 📱 Interfaccia Web

### 🎨 **Design**
- **Header**: Titolo e descrizione
- **Status Card**: Stato attuale del bot con indicatore colorato
- **Controlli**: Bottoni per start/stop/status
- **Messaggi**: Feedback delle operazioni
- **Footer**: Informazioni di sicurezza

### 🔄 **Aggiornamento Automatico**
- Stato verificato ogni 30 secondi
- Indicatori visivi in tempo reale
- Timestamp ultimo aggiornamento

### 📱 **Responsive Design**
- Ottimizzato per desktop, tablet e mobile
- Bottoni touch-friendly
- Layout adattivo

## 🔧 API Endpoints

### **GET /api/status**
Verifica stato del bot
```json
{
    "running": true,
    "pid": "12345",
    "message": "Bot in esecuzione",
    "timestamp": "2024-01-01T12:00:00"
}
```

### **POST /api/start**
Avvia il bot
```json
{
    "message": "Bot avviato con successo",
    "pid": "12345",
    "timestamp": "2024-01-01T12:00:00"
}
```

### **POST /api/stop**
Ferma il bot
```json
{
    "message": "Bot fermato con successo",
    "timestamp": "2024-01-01T12:00:00"
}
```

### **GET /api/logs**
Recupera log del bot
```json
{
    "logs": "Log content...",
    "timestamp": "2024-01-01T12:00:00"
}
```

## 🔐 Sicurezza

### **Autenticazione**
- HTTP Basic Authentication
- Password hashate con SHA-256
- Sessioni sicure

### **Connessione SSH**
- Chiavi SSH raccomandate
- Timeout connessione configurabile
- Gestione errori sicura

### **Best Practices**
1. **Cambia password di default**
2. **Usa chiavi SSH invece di password**
3. **Limita accesso per IP se possibile**
4. **Monitora log di accesso**
5. **Aggiorna regolarmente le dipendenze**

## 🛠️ Troubleshooting

### **Errore Connessione SSH**
```
❌ Errore connessione SSH: Authentication failed
```
**Soluzione:**
- Verifica credenziali SSH
- Controlla percorso chiave SSH
- Testa connessione manuale: `ssh username@server`

### **Bot Non Si Avvia**
```
❌ Errore avvio bot: Permission denied
```
**Soluzione:**
- Verifica permessi directory bot
- Controlla percorso Python sul server
- Verifica dipendenze bot installate

### **Errore Autenticazione Web**
```
❌ Credenziali non valide
```
**Soluzione:**
- Verifica username/password
- Controlla configurazione AUTH_*
- Resetta password se necessario

### **Porta Già in Uso**
```
❌ Address already in use
```
**Soluzione:**
- Cambia porta in app.py: `app.run(port=5001)`
- Termina processo esistente: `lsof -ti:5000 | xargs kill`

## 📁 Struttura File

```
web_control/
├── index.html              # Interfaccia web
├── app.py                  # Backend Flask
├── web_config.json         # Configurazione
├── requirements_web.txt    # Dipendenze Python
├── setup_web_control.bat   # Script installazione
├── README_WEB_INTERFACE.md # Documentazione
└── venv_web/               # Ambiente virtuale (creato)
```

## 🔄 Aggiornamenti

### **Aggiornare Dipendenze**
```bash
pip install --upgrade -r requirements_web.txt
```

### **Backup Configurazione**
```bash
cp web_config.json web_config.json.backup
```

## 📞 Supporto

### **Log di Debug**
I log del server web sono visibili nella console dove hai avviato `python app.py`.

### **Test Connessione**
```python
# Test rapido connessione SSH
python -c "
import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('your-server.com', username='your-user', key_filename='~/.ssh/id_rsa')
print('✅ Connessione SSH OK')
client.close()
"
```

### **Verifica Stato Bot Manuale**
```bash
ssh username@server "cd /path/to/bot && pgrep -f main.py"
```

## 🎉 Conclusione

L'interfaccia web ti offre un controllo completo e sicuro del tuo Bot Telegram RSS da qualsiasi dispositivo con browser. 

**Caratteristiche principali:**
- ✅ Controllo remoto completo
- 🔐 Sicurezza integrata
- 📱 Design responsive
- 🔄 Monitoraggio in tempo reale
- 🛠️ Facile configurazione

**Buon controllo del tuo bot!** 🤖🚀