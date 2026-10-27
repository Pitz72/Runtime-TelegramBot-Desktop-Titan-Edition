#!/usr/bin/env python3
"""
🌐 Web Control Interface per Bot Telegram RSS
Backend Flask per il controllo remoto del bot via interfaccia web

Autore: Assistant AI
Data: 2024
"""

import os
import sys
import json
import logging
import subprocess
from datetime import datetime
from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import paramiko
from functools import wraps
import hashlib
import secrets

# Configurazione logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Inizializzazione Flask
app = Flask(__name__)
app.secret_key = secrets.token_hex(32)
CORS(app)

# Configurazione (da modificare secondo le tue esigenze)
CONFIG = {
    'SSH_HOST': 'your-server.com',  # Indirizzo del tuo server LAMP
    'SSH_PORT': 22,
    'SSH_USERNAME': 'your-username',
    'SSH_PASSWORD': None,  # Usa None per chiave SSH
    'SSH_KEY_PATH': '~/.ssh/id_rsa',  # Percorso chiave SSH
    'BOT_PATH': '/path/to/your/bot',  # Percorso del bot sul server
    'BOT_SCRIPT': 'main.py',  # Nome dello script del bot
    'PYTHON_CMD': 'python3',  # Comando Python sul server
    'AUTH_ENABLED': True,  # Abilita autenticazione
    'AUTH_USERNAME': 'admin',  # Username per accesso
    'AUTH_PASSWORD_HASH': None  # Hash della password (verrà generato)
}

# Genera hash password se non presente
if CONFIG['AUTH_ENABLED'] and not CONFIG['AUTH_PASSWORD_HASH']:
    # Password di default: "<PASSWORD_PREDEFINITA>" - CAMBIALA!
    default_password = "<PASSWORD_PREDEFINITA>"
    CONFIG['AUTH_PASSWORD_HASH'] = hashlib.sha256(default_password.encode()).hexdigest()
    logger.warning("⚠️ Usando password di default! Cambiala in produzione!")

class SSHManager:
    """Gestisce le connessioni SSH al server"""
    
    def __init__(self):
        self.client = None
        
    def connect(self):
        """Stabilisce connessione SSH"""
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # Connessione con chiave SSH o password
            if CONFIG['SSH_PASSWORD']:
                self.client.connect(
                    hostname=CONFIG['SSH_HOST'],
                    port=CONFIG['SSH_PORT'],
                    username=CONFIG['SSH_USERNAME'],
                    password=CONFIG['SSH_PASSWORD'],
                    timeout=10
                )
            else:
                key_path = os.path.expanduser(CONFIG['SSH_KEY_PATH'])
                self.client.connect(
                    hostname=CONFIG['SSH_HOST'],
                    port=CONFIG['SSH_PORT'],
                    username=CONFIG['SSH_USERNAME'],
                    key_filename=key_path,
                    timeout=10
                )
            
            logger.info(f"✅ Connesso a {CONFIG['SSH_HOST']}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Errore connessione SSH: {e}")
            return False
    
    def execute_command(self, command):
        """Esegue comando sul server remoto"""
        try:
            if not self.client:
                if not self.connect():
                    return False, "Errore connessione SSH"
            
            stdin, stdout, stderr = self.client.exec_command(command)
            
            # Leggi output
            output = stdout.read().decode('utf-8').strip()
            error = stderr.read().decode('utf-8').strip()
            exit_code = stdout.channel.recv_exit_status()
            
            logger.info(f"Comando: {command}")
            logger.info(f"Exit code: {exit_code}")
            
            if exit_code == 0:
                return True, output
            else:
                return False, error or output
                
        except Exception as e:
            logger.error(f"❌ Errore esecuzione comando: {e}")
            return False, str(e)
    
    def disconnect(self):
        """Chiude connessione SSH"""
        if self.client:
            self.client.close()
            self.client = None

# Istanza SSH manager globale
ssh_manager = SSHManager()

def require_auth(f):
    """Decorator per autenticazione"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not CONFIG['AUTH_ENABLED']:
            return f(*args, **kwargs)
        
        # Verifica header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Basic '):
            return jsonify({'error': 'Autenticazione richiesta'}), 401
        
        try:
            import base64
            credentials = base64.b64decode(auth_header[6:]).decode('utf-8')
            username, password = credentials.split(':', 1)
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            if username == CONFIG['AUTH_USERNAME'] and password_hash == CONFIG['AUTH_PASSWORD_HASH']:
                return f(*args, **kwargs)
            else:
                return jsonify({'error': 'Credenziali non valide'}), 401
                
        except Exception as e:
            logger.error(f"Errore autenticazione: {e}")
            return jsonify({'error': 'Errore autenticazione'}), 401
    
    return decorated_function

@app.route('/')
def index():
    """Serve la pagina principale"""
    return send_from_directory('.', 'index.html')

@app.route('/api/status')
@require_auth
def get_bot_status():
    """Verifica stato del bot"""
    try:
        # Comando per verificare se il bot è in esecuzione
        check_cmd = f"cd {CONFIG['BOT_PATH']} && pgrep -f '{CONFIG['BOT_SCRIPT']}'"
        
        success, output = ssh_manager.execute_command(check_cmd)
        
        if success and output:
            # Bot in esecuzione
            pid = output.strip().split('\n')[0] if output else None
            return jsonify({
                'running': True,
                'pid': pid,
                'message': 'Bot in esecuzione',
                'timestamp': datetime.now().isoformat()
            })
        else:
            # Bot non in esecuzione
            return jsonify({
                'running': False,
                'pid': None,
                'message': 'Bot non in esecuzione',
                'timestamp': datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"Errore verifica stato: {e}")
        return jsonify({
            'error': f'Errore verifica stato: {str(e)}',
            'running': False
        }), 500

@app.route('/api/start', methods=['POST'])
@require_auth
def start_bot():
    """Avvia il bot"""
    try:
        # Prima verifica se è già in esecuzione
        check_cmd = f"cd {CONFIG['BOT_PATH']} && pgrep -f '{CONFIG['BOT_SCRIPT']}'"
        success, output = ssh_manager.execute_command(check_cmd)
        
        if success and output:
            return jsonify({
                'error': 'Bot già in esecuzione',
                'pid': output.strip()
            }), 400
        
        # Avvia il bot in background
        start_cmd = f"cd {CONFIG['BOT_PATH']} && nohup {CONFIG['PYTHON_CMD']} {CONFIG['BOT_SCRIPT']} > bot.log 2>&1 & echo $!"
        
        success, output = ssh_manager.execute_command(start_cmd)
        
        if success:
            pid = output.strip() if output else None
            logger.info(f"✅ Bot avviato con PID: {pid}")
            return jsonify({
                'message': 'Bot avviato con successo',
                'pid': pid,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'error': f'Errore avvio bot: {output}'
            }), 500
            
    except Exception as e:
        logger.error(f"Errore avvio bot: {e}")
        return jsonify({
            'error': f'Errore avvio bot: {str(e)}'
        }), 500

@app.route('/api/stop', methods=['POST'])
@require_auth
def stop_bot():
    """Ferma il bot"""
    try:
        # Trova e termina il processo del bot
        stop_cmd = f"cd {CONFIG['BOT_PATH']} && pkill -f '{CONFIG['BOT_SCRIPT']}'"
        
        success, output = ssh_manager.execute_command(stop_cmd)
        
        # pkill restituisce 0 se ha trovato e terminato processi
        # Verifica che il bot sia effettivamente fermato
        check_cmd = f"cd {CONFIG['BOT_PATH']} && pgrep -f '{CONFIG['BOT_SCRIPT']}'"
        check_success, check_output = ssh_manager.execute_command(check_cmd)
        
        if not check_success or not check_output:
            logger.info("✅ Bot fermato con successo")
            return jsonify({
                'message': 'Bot fermato con successo',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'error': 'Bot ancora in esecuzione dopo il comando di stop'
            }), 500
            
    except Exception as e:
        logger.error(f"Errore stop bot: {e}")
        return jsonify({
            'error': f'Errore stop bot: {str(e)}'
        }), 500

@app.route('/api/logs')
@require_auth
def get_logs():
    """Recupera i log del bot"""
    try:
        logs_cmd = f"cd {CONFIG['BOT_PATH']} && tail -n 50 bot.log"
        
        success, output = ssh_manager.execute_command(logs_cmd)
        
        if success:
            return jsonify({
                'logs': output,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'error': f'Errore recupero log: {output}'
            }), 500
            
    except Exception as e:
        logger.error(f"Errore recupero log: {e}")
        return jsonify({
            'error': f'Errore recupero log: {str(e)}'
        }), 500

@app.route('/api/config', methods=['GET'])
@require_auth
def get_config():
    """Restituisce configurazione (senza dati sensibili)"""
    safe_config = {
        'ssh_host': CONFIG['SSH_HOST'],
        'ssh_port': CONFIG['SSH_PORT'],
        'ssh_username': CONFIG['SSH_USERNAME'],
        'bot_path': CONFIG['BOT_PATH'],
        'auth_enabled': CONFIG['AUTH_ENABLED']
    }
    return jsonify(safe_config)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint non trovato'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Errore interno del server'}), 500

def load_config_from_file():
    """Carica configurazione da file se presente"""
    config_file = 'web_config.json'
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r') as f:
                file_config = json.load(f)
                CONFIG.update(file_config)
                logger.info("✅ Configurazione caricata da file")
        except Exception as e:
            logger.error(f"❌ Errore caricamento config: {e}")

def create_default_config():
    """Crea file di configurazione di esempio"""
    config_file = 'web_config.json'
    if not os.path.exists(config_file):
        example_config = {
            "SSH_HOST": "your-server.com",
            "SSH_PORT": 22,
            "SSH_USERNAME": "your-username",
            "SSH_PASSWORD": null,
            "SSH_KEY_PATH": "~/.ssh/id_rsa",
            "BOT_PATH": "/path/to/your/bot",
            "BOT_SCRIPT": "main.py",
            "PYTHON_CMD": "python3",
            "AUTH_ENABLED": true,
            "AUTH_USERNAME": "admin"
        }
        
        try:
            with open(config_file, 'w') as f:
                json.dump(example_config, f, indent=4)
            logger.info(f"✅ Creato file configurazione: {config_file}")
        except Exception as e:
            logger.error(f"❌ Errore creazione config: {e}")

if __name__ == '__main__':
    print("🌐 Avvio Web Control Interface per Bot Telegram RSS")
    print("=" * 60)
    
    # Carica configurazione
    load_config_from_file()
    create_default_config()
    
    # Informazioni di avvio
    print(f"🔧 Server SSH: {CONFIG['SSH_HOST']}:{CONFIG['SSH_PORT']}")
    print(f"📁 Percorso Bot: {CONFIG['BOT_PATH']}")
    print(f"🔐 Autenticazione: {'Abilitata' if CONFIG['AUTH_ENABLED'] else 'Disabilitata'}")
    
    if CONFIG['AUTH_ENABLED']:
        print(f"👤 Username: {CONFIG['AUTH_USERNAME']}")
        print("🔑 Password di default: <PASSWORD_PREDEFINITA> (CAMBIALA!)")
    
    print("=" * 60)
    print("🚀 Server avviato su http://localhost:5000")
    print("📱 Apri il browser e vai su http://localhost:5000")
    print("⚠️  IMPORTANTE: Modifica web_config.json con i tuoi dati!")
    print("=" * 60)
    
    try:
        app.run(
            host='0.0.0.0',  # Accessibile da qualsiasi IP
            port=5000,
            debug=False,  # Disabilita debug in produzione
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Server fermato dall'utente")
    except Exception as e:
        print(f"❌ Errore avvio server: {e}")
    finally:
        ssh_manager.disconnect()
        print("👋 Arrivederci!")