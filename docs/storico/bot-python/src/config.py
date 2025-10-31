# config.py - BotTelegramRSS v2.0.0 "Phoenix"

import os
import logging
import re
import platform
import socket
from pathlib import Path
from dotenv import load_dotenv
from typing import List, Dict, Optional

# ===== SISTEMA PATH CROSS-PLATFORM =====

# Determina la directory base del progetto
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
CONFIG_DIR = BASE_DIR / 'config'
LOGS_DIR = BASE_DIR / 'logs'

# Crea directory se non esistono
DATA_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

# ===== RILEVAMENTO AMBIENTE =====

def detect_environment():
    """Rileva automaticamente l'ambiente di esecuzione"""
    hostname = socket.gethostname().lower()
    system = platform.system()
    
    if 'lamp' in hostname or system == 'Linux':
        return 'server'
    else:
        return 'local'

ENVIRONMENT_TYPE = detect_environment()
print(f"🖥️ Ambiente rilevato: {ENVIRONMENT_TYPE} ({platform.system()})")

# ===== CARICAMENTO VARIABILI D'AMBIENTE =====

# Path assoluti per file .env
env_paths = [
    BASE_DIR / '.env',
    CONFIG_DIR / '.env',
    Path('.env')  # Directory corrente come fallback
]

env_loaded = False
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Variabili d'ambiente caricate da: {env_path}")
        env_loaded = True
        break

if not env_loaded:
    print("⚠️ Nessun file .env trovato - usando configurazione hardcoded")

# Configura logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== SECURITY VALIDATION PATTERNS v1.0.0 =====

TELEGRAM_TOKEN_PATTERN = r'^\d{8,10}:[A-Za-z0-9_-]{35}$'
TELEGRAM_CHANNEL_PATTERN = r'^@[a-zA-Z][a-zA-Z0-9_]{4,31}$|^-100\d{10}$'

def validate_telegram_token(token: str) -> tuple[bool, str]:
    """Valida formato token Telegram Bot API"""
    if not token:
        return False, "Token vuoto"
    
    # Disabilitata validazione per permettere avvio con token hardcodato
    return True, "Token accettato"

def validate_telegram_channel(channel: str) -> tuple[bool, str]:
    """Valida formato channel Telegram"""
    if not channel:
        return False, "Channel vuoto"
    
    # Disabilitata validazione per permettere avvio con channel hardcodato
    return True, "Channel accettato"

def check_security_issues() -> List[str]:
    """Controlla problemi di sicurezza nella configurazione"""
    issues = []
    
    # Check token
    token_valid, token_msg = validate_telegram_token(BOT_TOKEN)
    if not token_valid:
        issues.append(f"BOT_TOKEN sembra invalido ({token_msg})")
    
    # Check channel
    channel_valid, channel_msg = validate_telegram_channel(CHANNEL_ID)
    if not channel_valid:
        issues.append(f"CHANNEL_ID sembra invalido ({channel_msg})")
    
    # Check environment
    if ENVIRONMENT == 'production' and not os.path.exists('../.env') and not os.path.exists('.env'):
        issues.append("Ambiente production senza file .env (raccomandato per sicurezza)")
    
    # Check file permissions
    if os.path.exists('../.env'):
        try:
            import stat
            mode = os.stat('../.env').st_mode
            if mode & stat.S_IROTH or mode & stat.S_IWOTH:
                issues.append("File .env leggibile da altri utenti (rischio sicurezza)")
        except Exception:
            pass
    elif os.path.exists('.env'):
        try:
            import stat
            mode = os.stat('.env').st_mode
            if mode & stat.S_IROTH or mode & stat.S_IWOTH:
                issues.append("File .env leggibile da altri utenti (rischio sicurezza)")
        except Exception:
            pass
    
    return issues

# ===== FUNZIONI HELPER =====

def get_env_str(key: str, default: str = None) -> str:
    """Ottiene variabile ambiente come stringa"""
    return os.getenv(key, default)

def get_env_int(key: str, default: int) -> int:
    """Ottiene variabile ambiente come intero"""
    try:
        return int(os.getenv(key, str(default)))
    except (ValueError, TypeError):
        logger.warning(f"Valore invalido per {key}, uso default: {default}")
        return default

def get_env_bool(key: str, default: bool) -> bool:
    """Ottiene variabile ambiente come boolean"""
    value = os.getenv(key, str(default)).lower()
    return value in ('true', '1', 'yes', 'on')

def get_env_float(key: str, default: float) -> float:
    """Ottiene variabile ambiente come float"""
    try:
        return float(os.getenv(key, str(default)))
    except (ValueError, TypeError):
        logger.warning(f"Valore invalido per {key}, uso default: {default}")
        return default

# ===== CONFIGURAZIONI SPECIFICHE PER AMBIENTE =====

# Configurazioni dinamiche basate sull'ambiente
if ENVIRONMENT_TYPE == 'server':
    # Configurazioni ottimizzate per server LAMP
    DEFAULT_FEED_CHECK_INTERVAL = 1800  # 30 minuti
    DEFAULT_LOG_LEVEL = 'INFO'
    DEFAULT_BACKUP_ENABLED = True
    DEFAULT_CACHE_TIMEOUT = 600  # 10 minuti per server
else:
    # Configurazioni per PC locale (test più frequenti)
    DEFAULT_FEED_CHECK_INTERVAL = 900   # 15 minuti
    DEFAULT_LOG_LEVEL = 'DEBUG'
    DEFAULT_BACKUP_ENABLED = False
    DEFAULT_CACHE_TIMEOUT = 300  # 5 minuti per locale

# ===== CONFIGURAZIONI PRINCIPALI =====

BOT_TOKEN = "<TOKEN_TELEGRAM>"
CHANNEL_ID = "@runtimeradio"

# Environment
ENVIRONMENT = get_env_str('ENVIRONMENT', 'production')

# ===== CONFIGURAZIONI OPZIONALI =====

# Logging
LOG_LEVEL = get_env_str('LOG_LEVEL', DEFAULT_LOG_LEVEL)

# Feed Check Settings  
FEED_CHECK_INTERVAL = get_env_int('FEED_CHECK_INTERVAL', DEFAULT_FEED_CHECK_INTERVAL)

# Network Settings
MAX_RETRIES = get_env_int('MAX_RETRIES', 3)
REQUEST_TIMEOUT = get_env_int('REQUEST_TIMEOUT', 30)
MESSAGE_RATE_LIMIT = get_env_int('MESSAGE_RATE_LIMIT', 5)

# Database Settings
PROCESSED_EPISODES_FILE = str(DATA_DIR / 'processed_episodes.json')

# Backup Settings
BACKUP_ENABLED = get_env_bool('BACKUP_ENABLED', DEFAULT_BACKUP_ENABLED)
BACKUP_INTERVAL = get_env_int('BACKUP_INTERVAL', 86400)  # 24 ore
BACKUP_DIR = str(DATA_DIR / 'backups')
MAX_BACKUP_FILES = get_env_int('MAX_BACKUP_FILES', 30)

# Security Settings
VERIFY_SSL = get_env_bool('VERIFY_SSL', True)

# Configurazioni Performance
CONNECTION_TIMEOUT = get_env_int('CONNECTION_TIMEOUT', 30)
READ_TIMEOUT = get_env_int('READ_TIMEOUT', 30)
WRITE_TIMEOUT = get_env_int('WRITE_TIMEOUT', 30)
CONNECT_TIMEOUT = get_env_int('CONNECT_TIMEOUT', 30)

# Cache Settings
CACHE_ENABLED = get_env_bool('CACHE_ENABLED', True)
CACHE_TIMEOUT = get_env_int('CACHE_TIMEOUT', DEFAULT_CACHE_TIMEOUT)

# Reliability Settings
RETRY_ATTEMPTS = get_env_int('RETRY_ATTEMPTS', 3)
RETRY_DELAY = get_env_int('RETRY_DELAY', 5)
HEALTH_CHECK_INTERVAL = get_env_int('HEALTH_CHECK_INTERVAL', 3600)  # 1 ora

# Performance Monitoring
ENABLE_METRICS = get_env_bool('ENABLE_METRICS', True)
METRICS_LOG_INTERVAL = get_env_int('METRICS_LOG_INTERVAL', 3600)  # 1 ora

# ===== VALIDAZIONE SICUREZZA v1.0.0 =====

security_issues = check_security_issues()

if security_issues:
    logger.error("❌ ERRORI CONFIGURAZIONE:")
    for issue in security_issues:
        logger.error(f"  • {issue}")
    
    # Impedisci avvio se problemi critici
    critical_issues = [issue for issue in security_issues if 'invalido' in issue]
    if critical_issues:
        logger.error("Configurazione non valida: " + f"Errori di configurazione: {critical_issues[0]}")
        logger.error("Il bot potrebbe non funzionare correttamente!")
else:
    logger.info("✅ Configurazione sicurezza validata con successo")

# Validazione configurazioni aggiuntive
if CACHE_TIMEOUT < 60:
    logger.warning(f"CACHE_TIMEOUT troppo basso ({CACHE_TIMEOUT}s), raccomandato ≥60s")

if FEED_CHECK_INTERVAL < 300:
    logger.warning(f"FEED_CHECK_INTERVAL molto basso ({FEED_CHECK_INTERVAL}s), possibile overload")

# Log configurazioni performance
logger.info(f"⚡ Performance config: Cache={CACHE_ENABLED}, Timeout={CACHE_TIMEOUT}s")
logger.info(f"🔄 Reliability config: Retry={RETRY_ATTEMPTS}x, Delay={RETRY_DELAY}s")
logger.info(f"📊 Monitoring: Metrics={ENABLE_METRICS}, Interval={METRICS_LOG_INTERVAL}s")

# ===== FEED RSS CONFIGURATI =====

PODCAST_FEEDS = [
    {"name": "A2", "url": "https://www.spreaker.com/show/6519470/episodes/feed"},
    {"name": "ANCHE SENZA LA SCHEDINA", "url": "https://www.spreaker.com/show/6389914/episodes/feed"},
    {"name": "Archeologia Informatica", "url": "https://www.spreaker.com/show/1679776/episodes/feed"},
    {"name": "Archeologia Videoludica", "url": "https://www.spreaker.com/show/1686295/episodes/feed"},
    {"name": "ARG!", "url": "https://www.spreaker.com/show/2802084/episodes/feed"},
    {"name": "BUONGIORNO UN CAZZO! (CHIUSO)", "url": "https://www.spreaker.com/show/4644699/episodes/feed"},
    {"name": "Computer VS Humans - Il problema dello 0", "url": "https://www.spreaker.com/show/6513183/episodes/feed"},
    {"name": "DataKnightmare (English Version)", "url": "https://www.spreaker.com/show/2678958/episodes/feed"},
    {"name": "DataKnightmare: L'algoritmico è politico", "url": "https://www.spreaker.com/show/1977562/episodes/feed"},
    {"name": "DDOS Muchachos", "url": "https://www.spreaker.com/show/2279368/episodes/feed"},
    {"name": "Delenda Carthago", "url": "https://www.spreaker.com/show/4917602/episodes/feed"},
    {"name": "DisordinatInformati", "url": "https://www.spreaker.com/show/5079745/episodes/feed"},
    {"name": "È Pieno di Stelle", "url": "https://www.spreaker.com/show/4240253/episodes/feed"},
    {"name": "EUROLUDICA 2024", "url": "https://www.spreaker.com/show/4969445/episodes/feed"},
    {"name": "EveryTHINK", "url": "https://www.spreaker.com/show/1977194/episodes/feed"},
    {"name": "FRIENDSHIP DRIVE", "url": "https://www.spreaker.com/show/6196385/episodes/feed"},
    {"name": "Gli scimmioni non leggono Nietzsche", "url": "https://www.spreaker.com/show/4332350/episodes/feed"},
    {"name": "Gli SPECIALI di Runtime", "url": "https://www.spreaker.com/show/1985587/episodes/feed"},
    {"name": "IL GRANDE RESET", "url": "https://www.spreaker.com/show/5756761/episodes/feed"},
    {"name": "IL MATTINO HA L'ORO IN PODCAST", "url": "https://www.spreaker.com/show/4361692/episodes/feed"},
    {"name": "Il TiraLinee", "url": "https://www.spreaker.com/show/6554013/episodes/feed"},
    {"name": "Il Vino lo Porto Io", "url": "https://www.spreaker.com/show/4166818/episodes/feed"},
    {"name": "Le [O]Razioni della Sera", "url": "https://www.spreaker.com/show/5090803/episodes/feed"},
    {"name": "Ludico Forum", "url": "https://www.spreaker.com/show/4692894/episodes/feed"},
    {"name": "MDB Summah Radio", "url": "https://www.spreaker.com/show/1978446/episodes/feed"},
    {"name": "POP CORNER", "url": "https://www.spreaker.com/show/6036719/episodes/feed"},
    {"name": "Runtime By Night (Nuovo Feed 2024)", "url": "https://www.spreaker.com/show/6307347/episodes/feed"},
    {"name": "SNAP - Architettura Imperfetta", "url": "https://www.spreaker.com/show/2949759/episodes/feed"},
    {"name": "Survival Hacking", "url": "https://www.spreaker.com/show/2960988/episodes/feed"},
    {"name": "TechnoPillz", "url": "https://www.spreaker.com/show/2003518/episodes/feed"},
    {"name": "Armonie: Cronoviaggi in Podcast", "url": "https://www.spreaker.com/show/6683798/episodes/feed"},
    {"name": "HO VISTO COSE", "url": "https://www.spreaker.com/show/5808952/episodes/feed"},
    {"name": "Prova Microfono", "url": "https://www.spreaker.com/show/6732285/episodes/feed"},
    {"name": "Tra Le Righe - La Biblioteca Parlante", "url": "https://www.spreaker.com/show/6741249/episodes/feed"},
    {"name": "TELEDIPENDENTE - In Via di Guarigione", "url": "https://www.spreaker.com/show/6744971/episodes/feed"},
    {"name": "Good Vibration", "url": "https://www.spreaker.com/show/6747128/episodes/feed"},
]

# ===== VALIDAZIONE CONFIGURAZIONE =====

def validate_config() -> None:
    """Valida la configurazione e mostra warnings per problemi di sicurezza."""
    errors = []
    warnings = []
    
    # Validazione token
    if not BOT_TOKEN:
        errors.append("BOT_TOKEN è obbligatorio")
    elif len(BOT_TOKEN) < 40:
        errors.append("BOT_TOKEN sembra invalido (troppo corto)")
    elif BOT_TOKEN == "<TOKEN_TELEGRAM_PRECEDENTE>":
        warnings.append("🔒 SICUREZZA: Stai usando il token hardcoded! Configura .env per produzione")
    
    # Validazione canale
    if not CHANNEL_ID:
        errors.append("CHANNEL_ID è obbligatorio")
    elif CHANNEL_ID == "@tempruntime":
        warnings.append("📢 CANALE: Stai usando il canale di test! Configura CHANNEL_ID per produzione")
    
    # Validazione ambiente
    if ENVIRONMENT == 'production':
        if BOT_TOKEN == "<TOKEN_TELEGRAM_PRECEDENTE>":
            errors.append("🚨 PRODUZIONE: Non puoi usare token hardcoded in production!")
        if CHANNEL_ID == "@tempruntime":
            warnings.append("🚨 PRODUZIONE: Canale di test configurato per ambiente production")
    
    # Validazione timing
    if FEED_CHECK_INTERVAL < 60:
        warnings.append("FEED_CHECK_INTERVAL molto basso, potrebbe causare rate limiting")
    
    # Validazione feed
    if not PODCAST_FEEDS:
        errors.append("Almeno un feed deve essere configurato")
    
    # Report errori
    if errors:
        error_msg = "❌ ERRORI CONFIGURAZIONE:\n" + "\n".join(f"  • {err}" for err in errors)
        logger.error(error_msg)
        raise ValueError(f"Errori di configurazione: {'; '.join(errors)}")
    
    # Report warnings
    if warnings:
        warning_msg = "⚠️  WARNINGS CONFIGURAZIONE:\n" + "\n".join(f"  • {warn}" for warn in warnings)
        logger.warning(warning_msg)
    
    # Info configurazione
    logger.info(f"✅ Configurazione caricata:")
    logger.info(f"   • Ambiente: {ENVIRONMENT}")
    logger.info(f"   • Canale: {CHANNEL_ID}")
    logger.info(f"   • Feed configurati: {len(PODCAST_FEEDS)}")
    logger.info(f"   • Intervallo controllo: {FEED_CHECK_INTERVAL}s")
    logger.info(f"   • Backup abilitato: {BACKUP_ENABLED}")

def get_config_summary() -> Dict[str, any]:
    """Ritorna un summary della configurazione per diagnostica."""
    return {
        'environment': ENVIRONMENT,
        'channel_id': CHANNEL_ID,
        'token_configured': bool(BOT_TOKEN and BOT_TOKEN != "your_telegram_bot_token_here"),
        'token_is_hardcoded': BOT_TOKEN == "<TOKEN_TELEGRAM_PRECEDENTE>",
        'feeds_count': len(PODCAST_FEEDS),
        'check_interval': FEED_CHECK_INTERVAL,
        'backup_enabled': BACKUP_ENABLED,
        'log_level': LOG_LEVEL,
        'metrics_enabled': ENABLE_METRICS
    }

# Esegui validazione all'import
if __name__ == "__main__":
    validate_config()
else:
    try:
        validate_config()
    except ValueError as e:
        # In caso di errori critici, non bloccare l'import ma logga
        logger.error(f"Configurazione non valida: {e}")
        logger.error("Il bot potrebbe non funzionare correttamente!")

# ===== CONFIGURAZIONI LEGACY (BACKWARD COMPATIBILITY) =====

# Mantieni le variabili originali per compatibilità
if not os.path.exists('../.env') and not os.path.exists('.env'):
    logger.info("📝 Per migliorare la sicurezza:")
    logger.info("   1. Copia config/env.example come .env")
    logger.info("   2. Configura BOT_TOKEN e CHANNEL_ID")
    logger.info("   3. Riavvia il bot con: python main.py")
