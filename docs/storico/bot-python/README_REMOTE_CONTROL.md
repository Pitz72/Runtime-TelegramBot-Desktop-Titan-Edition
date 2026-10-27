# 🤖 Telegram RSS Bot - Controllo Remoto

## 📋 Descrizione

Script Python per controllare il **Telegram RSS Bot** installato su un server LAMP da remoto tramite connessione SSH sicura.

## ✨ Funzionalità

### 🎛️ Controllo Bot
- ✅ **Start/Stop/Restart** del bot
- 📊 **Monitoraggio status** in tempo reale
- 🔄 **Riavvio automatico** in caso di problemi

### 📋 Monitoraggio
- 📈 **Statistiche sistema** (CPU, Memoria, Uptime)
- 📝 **Visualizzazione log** in tempo reale
- 🔍 **Status servizio SystemD**

### 🔧 Gestione
- ⚙️ **Configurazione server** persistente
- 🔐 **Connessione SSH sicura**
- 💾 **Salvataggio impostazioni**

## 🚀 Installazione e Uso

### 1. Setup Iniziale

#### Windows:
```batch
# Doppio click su:
setup_remote_control.bat
```

#### Linux/Mac:
```bash
# Installa dipendenze
pip install -r requirements_remote.txt

# Avvia controllo remoto
python remote_control.py
```

### 2. Prima Configurazione

Al primo avvio, inserisci i dati del tuo server LAMP:

```
🔧 CONFIGURAZIONE SERVER LAMP
🌐 Hostname/IP del server: 192.168.1.100
👤 Username SSH: telegrambot
🔐 Password SSH: [inserisci password]
🚪 Porta SSH [22]: 22
📁 Path bot sul server [/home/telegrambot/bot]: /home/telegrambot/bot
⚙️ Nome servizio [telegram-rss-bot]: telegram-rss-bot
```

### 3. Menu Principale

```
🤖 TELEGRAM RSS BOT - CONTROLLO REMOTO

COMANDI DISPONIBILI:
  1. 📊 Status del bot
  2. 🚀 Avvia bot
  3. 🛑 Ferma bot  
  4. 🔄 Riavvia bot
  5. 📋 Mostra log (ultimi 50)
  6. 📺 Monitora log in tempo reale
  7. 🔧 Configura server
  8. 🔌 Riconnetti SSH
  0. ❌ Esci
```

## 🎯 Uso da Riga di Comando

### Comandi Rapidi

```bash
# Mostra status
python remote_control.py --command status

# Avvia bot
python remote_control.py --command start

# Ferma bot
python remote_control.py --command stop

# Riavvia bot
python remote_control.py --command restart

# Mostra ultimi 100 log
python remote_control.py --command logs --lines 100
```

### Configurazione Personalizzata

```bash
# Usa file config personalizzato
python remote_control.py --config my_server.json
```

## 📊 Monitoraggio Status

Lo script mostra informazioni dettagliate:

```
📊 STATUS BOT TELEGRAM RSS
┏━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━┓
┃ Parametro       ┃ Valore                  ┃  Status  ┃
┡━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━┩
│ Servizio SystemD│ telegram-rss-bot        │ 🟢 ATTIVO │
│ Processo Python │ main.py                 │ 🟢 RUNNING│
│ Uptime          │ 2025-01-27 08:30:15     │    ⏰    │
│ Uso CPU         │ 2.1%                    │    💻    │
│ Uso Memoria     │ 1.8%                    │    🧠    │
└─────────────────┴─────────────────────────┴──────────┘
```

## 🔐 Sicurezza

### Configurazione SSH
- ✅ **AutoAddPolicy** per host keys
- 🔐 **Password authentication** sicura
- ⏱️ **Timeout connessione** configurabile

### Gestione Credenziali
- 💾 **Password NON salvata** su disco
- 🔒 **Configurazione locale** protetta
- 🚫 **Nessun log delle credenziali**

## 📁 File Generati

```
TELEGRAMBOT/
├── remote_control.py           # Script principale
├── requirements_remote.txt     # Dipendenze
├── setup_remote_control.bat    # Setup Windows
├── server_config.json         # Config server (auto-generato)
└── README_REMOTE_CONTROL.md    # Questa documentazione
```

## 🛠️ Risoluzione Problemi

### Errore Connessione SSH
```
❌ Errore connessione SSH: [Errno 111] Connection refused
```
**Soluzione:**
- Verifica IP/hostname del server
- Controlla che SSH sia attivo: `sudo systemctl status ssh`
- Verifica porta SSH: `sudo netstat -tlnp | grep :22`

### Errore Permessi Sudo
```
❌ Errore avvio bot: sudo: no tty present and no askpass program specified
```
**Soluzione:**
- Aggiungi utente al gruppo sudo senza password per systemctl:
```bash
sudo visudo
# Aggiungi: telegrambot ALL=(ALL) NOPASSWD: /bin/systemctl
```

### Bot Non Risponde
```
🔴 INATTIVO - 🔴 STOPPED
```
**Soluzione:**
1. Controlla log: Opzione `5` o `6`
2. Verifica configurazione bot
3. Riavvia servizio: Opzione `4`

## 🔄 Aggiornamenti

### Aggiorna Script
```bash
# Scarica nuova versione
git pull origin main

# Reinstalla dipendenze
pip install -r requirements_remote.txt --upgrade
```

### Aggiorna Bot sul Server
```bash
# Tramite controllo remoto:
# 1. Ferma bot (opzione 3)
# 2. SSH manuale per aggiornare codice
# 3. Riavvia bot (opzione 2)
```

## 📞 Supporto

Per problemi o suggerimenti:
- 📧 Controlla i log del bot
- 🔍 Verifica configurazione server
- 🚀 Usa modalità debug: `python remote_control.py --debug`

---

**🤖 Telegram RSS Bot Remote Control v1.0.0**  
*Controllo remoto semplice e sicuro per il tuo bot Telegram RSS*