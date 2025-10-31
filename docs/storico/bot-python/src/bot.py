#!/usr/bin/env python3
"""
BotTelegramRSS v1.0.0 "Phoenix"
Bot Telegram RSS Feed Monitor con architettura multi-feed production-ready

Miglioramenti v1.0.0 "Phoenix":
- Refactoring completo architettura multi-feed
- Supporto simultaneo 30 feed RSS
- Template messaggio personalizzato italiano
- Data cutoff per evitare spam su cambio canale
- Pulizia codebase e rimozione dipendenze legacy
- Identificazione feed in ogni messaggio

Precedenti versioni:
- v0.8.2 "Fortress": Sicurezza hardened, validazioni avanzate
- v0.8.1 "Velocity": Performance boost, smart tag extraction
- v0.8.0 "Foundation": Refactoring architetturale base

Copyright (c) 2024-2025 - BotTelegramRSS
"""

import asyncio
import json
import logging
import os
import time
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import hashlib
import sys
import platform
import psutil
import threading
from functools import lru_cache

# Configurazione nest_asyncio solo per Windows
if platform.system() == 'Windows':
    try:
        import nest_asyncio
        nest_asyncio.apply()
        print("✅ nest_asyncio configurato per Windows")
    except ImportError:
        print("⚠️ ATTENZIONE: nest_asyncio non installato, potrebbero esserci problemi su Windows")
else:
    print(f"✅ Sistema {platform.system()} rilevato - nest_asyncio non necessario")

# Import dei moduli principali
import feedparser
from telegram.ext import Application, CommandHandler, ContextTypes
from telegram import Update
from telegram.error import NetworkError, TimedOut, InvalidToken, TelegramError
from telegram.constants import ParseMode

# Import configurazioni
from config import (
    BOT_TOKEN, CHANNEL_ID, FEED_CHECK_INTERVAL, PROCESSED_EPISODES_FILE,
    MAX_RETRIES, REQUEST_TIMEOUT, CACHE_TIMEOUT, CACHE_ENABLED,
    RETRY_ATTEMPTS, RETRY_DELAY, validate_telegram_token, validate_telegram_channel,
    PODCAST_FEEDS, ENVIRONMENT_TYPE, LOG_LEVEL, LOGS_DIR
)

# Import versione
from version import VERSION, VERSION_NAME, VERSION_BUILD, get_version

# ===== CONFIGURAZIONE LOGGING AVANZATA =====

def setup_logging():
    """Configura il logging con rotazione per server e console per locale"""
    import logging.handlers
    
    # Configura il logger principale
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, LOG_LEVEL.upper()))
    
    # Rimuovi handler esistenti
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Formato comune
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    if ENVIRONMENT_TYPE == 'server':
        # Server: log su file con rotazione
        log_file = LOGS_DIR / 'bot.log'
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        # Anche console per errori critici
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.ERROR)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        print(f"📝 Logging configurato per server: {log_file}")
    else:
        # Locale: solo console
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        print("📝 Logging configurato per ambiente locale")
    
    return logging.getLogger(__name__)

# Configura logging
logger = setup_logging()

# ===== DATA CUTOFF v1.0.0 =====

# Data di cutoff per processamento episodi - solo episodi da questa data in poi verranno processati
# MODIFICATO: Da domenica 1 settembre 2025 per uso locale
CUTOFF_DATE = datetime(2025, 9, 1, 0, 0, 0, 0)
logger.info(f"📅 Data cutoff episodi: {CUTOFF_DATE.strftime('%Y-%m-%d %H:%M:%S')}")  
logger.info("🔄 Verranno processati solo episodi pubblicati dal 1 settembre 2025 in poi")

def is_episode_after_cutoff(entry) -> bool:
    """
    Controlla se un episodio è stato pubblicato dopo la data di cutoff
    
    v1.0.0: Logica per processare solo episodi recenti mantenendo database consolidato
    """
    try:
        # Prova a estrarre la data di pubblicazione
        published_parsed = getattr(entry, 'published_parsed', None) or getattr(entry, 'updated_parsed', None)
        
        if published_parsed:
            episode_date = datetime(*published_parsed[:6])
            is_recent = episode_date >= CUTOFF_DATE
            
            if is_recent:
                logger.debug(f"✅ Episodio recente: {entry.title} ({episode_date.strftime('%Y-%m-%d %H:%M')})")
            else:
                logger.debug(f"⏸️ Episodio pre-cutoff: {entry.title} ({episode_date.strftime('%Y-%m-%d %H:%M')}) - saltato")
            
            return is_recent
        else:
            # Se non c'è data, processa per sicurezza
            logger.debug(f"⚠️ Data pubblicazione non trovata per: {entry.title} - processato per sicurezza")
            return True
            
    except Exception as e:
        # In caso di errore parsing data, processa per sicurezza
        logger.warning(f"⚠️ Errore parsing data per {getattr(entry, 'title', 'episodio sconosciuto')}: {e} - processato per sicurezza")
        return True

# ===== VALIDAZIONE SICUREZZA PRE-AVVIO v1.0.0 =====

def validate_security_config() -> bool:
    """Valida configurazione sicurezza prima dell'avvio"""
    logger.info("🔍 Validazione sicurezza configurazione...")
    
    # Validazione token
    token_valid, token_msg = validate_telegram_token(BOT_TOKEN)
    if not token_valid:
        logger.error(f"❌ Token invalido: {token_msg}")
        return False
    
    # Validazione channel
    channel_valid, channel_msg = validate_telegram_channel(CHANNEL_ID)
    if not channel_valid:
        logger.error(f"❌ Channel invalido: {channel_msg}")
        return False
    
    # Check file critici
    if not os.path.exists('processed_episodes.json'):
        logger.warning("⚠️ File processed_episodes.json non trovato, verrà creato")
        try:
            with open('processed_episodes.json', 'w') as f:
                json.dump({}, f)
            logger.info("✅ File processed_episodes.json creato")
        except Exception as e:
            logger.error(f"❌ Impossibile creare processed_episodes.json: {e}")
            return False
    
    # Check sicurezza file .env
    if os.path.exists('.env'):
        try:
            import stat
            mode = os.stat('.env').st_mode
            if mode & stat.S_IROTH or mode & stat.S_IWOTH:
                logger.warning("⚠️ File .env leggibile da altri utenti")
        except Exception:
            pass
    
    logger.info("✅ Validazione sicurezza completata")
    return True

# ===== CONFIGURAZIONI GLOBALI =====

# Cache per le richieste RSS
rss_cache = {}
performance_metrics = {
    'total_checks': 0,
    'successful_checks': 0,
    'failed_checks': 0,
    'messages_sent': 0,
    'cache_hits': 0,
    'start_time': time.time(),
    'memory_usage': 0,
    'database_size': 0
}

# Database lazy loading
_processed_episodes_cache = None
_cache_lock = threading.Lock()
_last_cache_update = 0
CACHE_REFRESH_INTERVAL = 300  # 5 minuti

# Monitoraggio memoria
def get_memory_usage() -> Dict[str, float]:
    """Ottiene informazioni sull'uso della memoria"""
    process = psutil.Process()
    memory_info = process.memory_info()
    return {
        'rss_mb': memory_info.rss / 1024 / 1024,  # Memoria fisica
        'vms_mb': memory_info.vms / 1024 / 1024,  # Memoria virtuale
        'percent': process.memory_percent()
    }

def log_memory_stats():
    """Log delle statistiche memoria"""
    try:
        memory = get_memory_usage()
        performance_metrics['memory_usage'] = memory['rss_mb']
        
        if ENVIRONMENT_TYPE == 'server':
            # Log dettagliato solo su server
            logger.info(f"💾 Memoria: {memory['rss_mb']:.1f}MB RSS, {memory['percent']:.1f}%")
            
            # Avviso se memoria alta
            if memory['rss_mb'] > 500:  # 500MB
                logger.warning(f"⚠️ Uso memoria elevato: {memory['rss_mb']:.1f}MB")
                
    except Exception as e:
        logger.error(f"❌ Errore monitoraggio memoria: {e}")

def cleanup_old_episodes(episodes: Dict[str, Any], days_to_keep: int = 30) -> Dict[str, Any]:
    """Rimuove episodi più vecchi di X giorni per liberare memoria"""
    cutoff_date = datetime.now() - timedelta(days=days_to_keep)
    cleaned_episodes = {}
    removed_count = 0
    
    for episode_id, episode_data in episodes.items():
        try:
            processed_at = datetime.fromisoformat(episode_data.get('processed_at', ''))
            if processed_at >= cutoff_date:
                cleaned_episodes[episode_id] = episode_data
            else:
                removed_count += 1
        except (ValueError, TypeError):
            # Mantieni episodi con date non valide per sicurezza
            cleaned_episodes[episode_id] = episode_data
    
    if removed_count > 0:
        logger.info(f"🧹 Cleanup: rimossi {removed_count} episodi vecchi (>{days_to_keep} giorni)")
    
    return cleaned_episodes

# ===== FUNZIONI MODULI v0.8.1 MANTENUTE =====

def escape_markdown_v2(text: str) -> str:
    """Escapes characters for Telegram MarkdownV2."""
    if not isinstance(text, str):
        return ''
    escape_chars = r'_*[]()~`>#+-=|{}.!'
    return ''.join(f'\\{char}' if char in escape_chars else char for char in text)

def extract_tags_from_entry(entry) -> List[str]:
    """
    Estrae tag reali dai feed RSS
    
    v0.8.1: Implementa estrazione intelligente tag da iTunes keywords
    """
    tags = []
    
    # Estrazione da iTunes keywords (Spreaker)
    if hasattr(entry, 'itunes_keywords') and entry.itunes_keywords:
        itunes_tags = [tag.strip() for tag in entry.itunes_keywords.split(',')]
        tags.extend([tag for tag in itunes_tags if tag and len(tag) > 2])
    
    # Fallback da tags standard
    if hasattr(entry, 'tags') and entry.tags:
        for tag in entry.tags:
            if hasattr(tag, 'term') and tag.term:
                tags.append(tag.term.strip())
    
    # Fallback da categorie
    if not tags and hasattr(entry, 'category') and entry.category:
        tags.append(entry.category.strip())
    
    # Cleanup e validazione
    cleaned_tags = []
    for tag in tags[:5]:  # Max 5 tag
        if tag and len(tag) > 2 and len(tag) < 30:
            cleaned_tags.append(tag)
    
    return cleaned_tags

# NOTA SULLA FORMATTAZIONE MARKDOWNV2:
# Telegram usa la modalità di parsing MarkdownV2, che è molto stretta.
# Caratteri speciali come '#' per gli hashtag devono essere escapati con un
# backslash ('\\') per essere visualizzati correttamente come testo.
# La funzione seguente si occupa di questo per i tag.
def format_tags_for_message(tags: List[str]) -> str:

    """
    Formatta tag per messaggio Telegram
    
    v0.8.1: Implementa formattazione ottimizzata tag
    """
    if not tags:
        return "\\#podcast \\#spreaker"  # Fallback
    
    formatted_tags = []
    
    for tag in tags[:4]:  # Max 4 tag per evitare overflow
        # Rimuovi spazi e caratteri speciali
        clean_tag = ''.join(c for c in tag if c.isalnum() or c in '_')
        
        if clean_tag and len(clean_tag) > 2:
            formatted_tags.append(f"\\#{clean_tag}")
    
    # Aggiungi tag base se non presenti
    result = ' '.join(formatted_tags)
    if '\\#podcast' not in result.lower():
        result += ' \\#podcast'
    if '\\#spreaker' not in result.lower():
        result += ' \\#spreaker'
    
    return result

def create_improved_message(title: str, link: str, summary: str, tags: List[str]) -> str:
    """
    Crea messaggio con template v0.8.1 ottimizzato
    
    v0.8.1: Template performante con link puliti e tag reali
    """
    # Pulisci titolo da caratteri HTML
    clean_title_no_html = title.replace('&amp;', '&').replace('&quot;', '"').replace('&#039;', "'")
    clean_title = escape_markdown_v2(clean_title_no_html)

    # Formatta tag
    formatted_tags = format_tags_for_message(tags)
    
    # Crea summary ottimizzato
    if summary and len(summary) > 100:
        summary = summary[:97] + "..."
    
    escaped_summary = escape_markdown_v2(summary)

    # Template v0.8.1 - link pulito senza ripetizione titolo
    message = f"🎙️ **{clean_title}**\n\n"
    
    if escaped_summary:
        message += f"{escaped_summary}\n\n"
    
    message += f"🔗 [Ascolta episodio]({link})\n\n"
    message += f"{formatted_tags}"
    
    return message

def create_improved_message_with_feed(feed_name: str, title: str, link: str, summary: str, tags: List[str]) -> str:
    """
    Crea messaggio con nome feed incluso
    
    v1.0.0: Template personalizzato con formato naturale italiano
    """
    # Pulisci titolo da caratteri HTML
    clean_title_no_html = title.replace('&amp;', '&').replace('&quot;', '"').replace('&#039;', "'")
    clean_title = escape_markdown_v2(clean_title_no_html)
    escaped_feed_name = escape_markdown_v2(feed_name)

    # Formatta tag
    formatted_tags = format_tags_for_message(tags)
    
    # Crea summary ottimizzato
    if summary and len(summary) > 100:
        summary = summary[:97] + "..."
    
    escaped_summary = escape_markdown_v2(summary)

    # Template v1.0.0 - formato naturale italiano
    message = f"È uscito un nuovo episodio di {escaped_feed_name}\n"
    message += f"Ascolta **{clean_title}**\n\n"
    
    if escaped_summary:
        message += f"{escaped_summary}\n\n"
    
    message += f"🔗 [Ascolta qui]({link})\n\n"
    message += f"{formatted_tags}"
    
    return message

def create_legacy_message(title: str, link: str, summary: str) -> str:
    """
    Crea messaggio con template legacy per backward compatibility
    
    v0.8.1: Mantiene compatibilità con versioni precedenti
    """
    # Pulisci titolo
    clean_title_no_html = title.replace('&amp;', '&').replace('&quot;', '"').replace('&#039;', "'")
    clean_title = escape_markdown_v2(clean_title_no_html)

    # Template legacy
    message = f"🎙️ **{clean_title}**\n\n"
    
    if summary and len(summary) > 100:
        summary = summary[:97] + "..."
    
    escaped_summary = escape_markdown_v2(summary)

    if escaped_summary:
        message += f"{escaped_summary}\n\n"
    
    message += f"🔗 [Ascolta qui: {clean_title}]({link})\n\n"
    message += "#podcast #spreaker"
    
    return message

# ===== FUNZIONI CORE =====

async def get_all_feeds_episodes() -> List[Tuple[str, feedparser.FeedParserDict]]:
    """Ottiene episodi da tutti i feed configurati"""
    global performance_metrics
    
    all_episodes = []
    
    logger.info(f"🔄 Controllo {len(PODCAST_FEEDS)} feed RSS...")
    
    for feed_info in PODCAST_FEEDS:
        feed_name = feed_info['name']
        feed_url = feed_info['url']
        
        try:
            logger.info(f"📡 Scaricamento {feed_name}...")
            feed = feedparser.parse(feed_url)
            
            if feed.bozo:
                logger.warning(f"⚠️ {feed_name}: Feed con errori: {feed.bozo_exception}")
            
            if hasattr(feed, 'entries') and feed.entries:
                for entry in feed.entries:
                    all_episodes.append((feed_name, entry))
                logger.debug(f"✅ {feed_name}: {len(feed.entries)} episodi")
            else:
                logger.warning(f"⚠️ {feed_name}: Nessun episodio trovato")
                
        except Exception as e:
            logger.error(f"❌ {feed_name}: Errore scaricamento: {e}")
            performance_metrics['failed_checks'] += 1
            continue
    
    performance_metrics['successful_checks'] += 1
    logger.info(f"✅ Totale episodi raccolti: {len(all_episodes)}")
    return all_episodes

def load_processed_episodes() -> Dict[str, Any]:
    """Carica episodi processati dal file JSON con lazy loading e cache"""
    global _processed_episodes_cache, _last_cache_update
    
    current_time = time.time()
    
    # Usa cache se valida
    with _cache_lock:
        if (_processed_episodes_cache is not None and 
            current_time - _last_cache_update < CACHE_REFRESH_INTERVAL):
            return _processed_episodes_cache.copy()
    
    try:
        if os.path.exists(PROCESSED_EPISODES_FILE):
            # Ottieni dimensione file per metriche
            file_size = os.path.getsize(PROCESSED_EPISODES_FILE) / 1024 / 1024  # MB
            performance_metrics['database_size'] = file_size
            
            if file_size > 10:  # File > 10MB
                logger.warning(f"⚠️ Database grande: {file_size:.1f}MB - considera cleanup")
            
            with open(PROCESSED_EPISODES_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                if isinstance(data, dict):
                    # Cleanup automatico se su server e file grande
                    if ENVIRONMENT_TYPE == 'server' and file_size > 5:
                        data = cleanup_old_episodes(data, days_to_keep=30)
                    
                    # Aggiorna cache
                    with _cache_lock:
                        _processed_episodes_cache = data.copy()
                        _last_cache_update = current_time
                    
                    logger.info(f"📄 Database caricato: {len(data)} episodi ({file_size:.1f}MB)")
                    return data
                else:
                    logger.warning("⚠️ Formato file processed_episodes.json non valido, inizializzo vuoto")
                    return {}
        else:
            logger.info("📄 File processed_episodes.json non trovato, inizializzo vuoto")
            return {}
            
    except Exception as e:
        logger.error(f"❌ Errore caricamento file processed_episodes.json: {e}")
        return {}

def save_processed_episodes(episodes: Dict[str, Any]) -> bool:
    """Salva episodi processati nel file JSON con backup incrementale"""
    global _processed_episodes_cache, _last_cache_update
    
    try:
        # Backup del file esistente se su server
        if ENVIRONMENT_TYPE == 'server' and os.path.exists(PROCESSED_EPISODES_FILE):
            backup_path = f"{PROCESSED_EPISODES_FILE}.backup"
            try:
                import shutil
                shutil.copy2(PROCESSED_EPISODES_FILE, backup_path)
            except Exception as e:
                logger.warning(f"⚠️ Impossibile creare backup: {e}")
        
        # Salva con scrittura atomica
        temp_file = f"{PROCESSED_EPISODES_FILE}.tmp"
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(episodes, f, ensure_ascii=False, indent=2)
        
        # Sposta file temporaneo su quello finale (operazione atomica)
        if os.path.exists(PROCESSED_EPISODES_FILE):
            os.remove(PROCESSED_EPISODES_FILE)
        os.rename(temp_file, PROCESSED_EPISODES_FILE)
        
        # Aggiorna cache
        with _cache_lock:
            _processed_episodes_cache = episodes.copy()
            _last_cache_update = time.time()
        
        # Log memoria dopo salvataggio
        log_memory_stats()
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Errore salvataggio file processed_episodes.json: {e}")
        # Rimuovi file temporaneo se esiste
        temp_file = f"{PROCESSED_EPISODES_FILE}.tmp"
        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except:
                pass
        return False

def get_episode_id(entry) -> str:
    """Genera ID univoco per episodio"""
    # Usa link come ID primario
    if hasattr(entry, 'link') and entry.link:
        return hashlib.md5(entry.link.encode()).hexdigest()
    
    # Fallback su titolo + data
    if hasattr(entry, 'title') and entry.title:
        title_date = f"{entry.title}_{getattr(entry, 'published', '')}"
        return hashlib.md5(title_date.encode()).hexdigest()
    
    # Fallback su timestamp
    return hashlib.md5(str(time.time()).encode()).hexdigest()

async def send_telegram_message_with_retry(application: Application, message: str, max_retries: int = RETRY_ATTEMPTS) -> bool:
    """Invia messaggio Telegram con retry automatico"""
    for attempt in range(max_retries):
        try:
            await application.bot.send_message(
                chat_id=CHANNEL_ID,
                text=message,
                parse_mode=ParseMode.MARKDOWN_V2,
                disable_web_page_preview=False
            )
            performance_metrics['messages_sent'] += 1
            logger.info(f"✅ Messaggio inviato con successo (tentativo {attempt + 1})")
            return True
            
        except TimedOut:
            logger.warning(f"⏱️ Timeout invio messaggio (tentativo {attempt + 1}/{max_retries})")
            if attempt < max_retries - 1:
                await asyncio.sleep(RETRY_DELAY * (attempt + 1))
                
        except NetworkError as e:
            logger.warning(f"🌐 Errore rete (tentativo {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(RETRY_DELAY * (attempt + 1))
                
        except TelegramError as e:
            logger.error(f"❌ Errore Telegram: {e}")
            if "retry after" in str(e).lower():
                # Rate limiting
                retry_after = 60  # Default
                await asyncio.sleep(retry_after)
                continue
            else:
                break
                
        except Exception as e:
            logger.error(f"❌ Errore inaspettato invio messaggio: {e}")
            break
    
    logger.error(f"❌ Impossibile inviare messaggio dopo {max_retries} tentativi")
    return False

async def check_new_episodes() -> None:
    """Controlla nuovi episodi da tutti i feed e li invia"""
    logger.info("🔍 Controllo nuovi episodi da tutti i feed...")
    performance_metrics['total_checks'] += 1
    
    try:
        # Ottieni episodi da tutti i feed con retry per errori di rete
        max_retries = 2
        retry_count = 0
        all_episodes = None
        
        while retry_count <= max_retries and all_episodes is None:
            try:
                all_episodes = await get_all_feeds_episodes()
                break
            except (TimedOut, NetworkError, ConnectionError) as e:
                retry_count += 1
                if retry_count <= max_retries:
                    logger.warning(f"⚠️ Errore rete durante controllo feed (tentativo {retry_count}/{max_retries + 1}): {e}")
                    await asyncio.sleep(5 * retry_count)  # Backoff progressivo
                else:
                    logger.error(f"❌ Impossibile ottenere feed dopo {max_retries + 1} tentativi: {e}")
                    performance_metrics['failed_checks'] += 1
                    return
            except Exception as e:
                logger.error(f"❌ Errore imprevisto durante controllo feed: {e}")
                performance_metrics['failed_checks'] += 1
                return
        
        if not all_episodes:
            logger.warning("⚠️ Nessun episodio trovato in tutti i feed")
            return
        
        # Carica episodi processati
        processed_episodes = load_processed_episodes()
        new_episodes_count = 0
        
        # Controlla ogni episodio
        for feed_name, entry in all_episodes:
            logger.info(f"Processing entry '{entry.title}' from feed '{feed_name}'")
            # Controllo 1: Solo episodi pubblicati da oggi
            if not is_episode_after_cutoff(entry):
                continue
            
            episode_id = get_episode_id(entry)
            
            # Controllo 2: Episodi non già processati
            if episode_id not in processed_episodes:
                # Nuovo episodio trovato
                logger.info(f"🆕 Nuovo episodio da {feed_name}: {entry.title}")
                
                # Estrai informazioni
                title = entry.title
                link = entry.link
                summary = getattr(entry, 'summary', '')
                tags = extract_tags_from_entry(entry)
                
                # Crea messaggio con nome feed
                try:
                    message = create_improved_message_with_feed(feed_name, title, link, summary, tags)
                except Exception as e:
                    logger.warning(f"⚠️ Errore template migliorato, uso standard: {e}")
                    message = create_improved_message(title, link, summary, tags)
                
                # Invia messaggio
                if await send_telegram_message_with_retry(application, message):
                    # Marca come processato
                    processed_episodes[episode_id] = {
                        'title': title,
                        'link': link,
                        'feed_name': feed_name,
                        'processed_at': datetime.now().isoformat(),
                        'tags': tags,
                        'version': f"{VERSION}"
                    }
                    new_episodes_count += 1
                    logger.info(f"✅ Episodio processato: {title}")
                else:
                    logger.error(f"❌ Impossibile inviare episodio: {title}")
                
                # Pausa tra messaggi per rate limiting
                await asyncio.sleep(2)  # Aumentato per evitare flood
        
        # Salva episodi processati
        if new_episodes_count > 0:
            if save_processed_episodes(processed_episodes):
                logger.info(f"✅ {new_episodes_count} nuovi episodi processati e salvati")
            else:
                logger.error("❌ Errore salvataggio episodi processati")
        else:
            logger.info("ℹ️ Nessun nuovo episodio trovato")
            
    except Exception as e:
        logger.error(f"❌ Errore controllo episodi: {e}")
        performance_metrics['failed_checks'] += 1

# ===== GESTORI COMANDI =====

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Gestore comando /start"""
    await update.message.reply_text(
        f"🤖 **BotTelegramRSS {get_version()}**\n\n"
        f"Bot attivo e in monitoraggio!\n"
        f"📡 Feed monitorati: {len(PODCAST_FEEDS)}\n"
        f"⏰ Controllo ogni {FEED_CHECK_INTERVAL//60} minuti\n"
        f"🔒 Livello sicurezza: HARDENED\n\n"
        f"🏗️ Architettura: Multi-Feed Production-Ready\n"
        f"✅ Status: Operativo"
    )

async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Gestore comando /status con monitoraggio memoria"""
    uptime = time.time() - performance_metrics['start_time']
    uptime_hours = uptime / 3600
    
    success_rate = 0
    if performance_metrics['total_checks'] > 0:
        success_rate = (performance_metrics['successful_checks'] / performance_metrics['total_checks']) * 100
    
    # Ottieni statistiche memoria
    memory = get_memory_usage()
    
    status_message = (
        f"📊 **Status BotTelegramRSS {VERSION}**\n\n"
        f"⏰ Uptime: {uptime_hours:.1f} ore\n"
        f"🔍 Controlli totali: {performance_metrics['total_checks']}\n"
        f"✅ Controlli riusciti: {performance_metrics['successful_checks']}\n"
        f"❌ Controlli falliti: {performance_metrics['failed_checks']}\n"
        f"📈 Tasso successo: {success_rate:.1f}%\n"
        f"📤 Messaggi inviati: {performance_metrics['messages_sent']}\n"
        f"📦 Cache hits: {performance_metrics['cache_hits']}\n\n"
        f"💾 **Memoria:**\n"
        f"   • RSS: {memory['rss_mb']:.1f}MB\n"
        f"   • Utilizzo: {memory['percent']:.1f}%\n"
        f"   • Database: {performance_metrics['database_size']:.1f}MB\n\n"
        f"🌍 Ambiente: {ENVIRONMENT_TYPE.upper()}\n"
        f"🔒 Sicurezza: HARDENED\n"
        f"⚡ Performance: OTTIMIZZATE"
    )
    
    await update.message.reply_text(status_message)

# ===== TASK AUTOMATICI =====

async def periodic_cleanup():
    """Task di cleanup automatico per memoria e cache"""
    try:
        # Log memoria
        log_memory_stats()
        
        # Cleanup cache RSS se troppo grande
        if len(rss_cache) > 100:
            # Mantieni solo gli ultimi 50 elementi
            sorted_cache = sorted(rss_cache.items(), key=lambda x: x[1].get('timestamp', 0))
            rss_cache.clear()
            for key, value in sorted_cache[-50:]:
                rss_cache[key] = value
            logger.info("🧹 Cache RSS pulita (mantenuti ultimi 50 elementi)")
        
        # Forza refresh cache database se necessario
        global _last_cache_update
        if time.time() - _last_cache_update > CACHE_REFRESH_INTERVAL * 2:
            with _cache_lock:
                global _processed_episodes_cache
                _processed_episodes_cache = None
            logger.info("🔄 Cache database invalidata per refresh")
            
    except Exception as e:
        logger.error(f"❌ Errore cleanup automatico: {e}")

async def periodic_memory_check():
    """Controllo periodico memoria con avvisi"""
    try:
        memory = get_memory_usage()
        
        # Avviso se memoria molto alta (solo su server)
        if ENVIRONMENT_TYPE == 'server' and memory['rss_mb'] > 1000:  # 1GB
            logger.warning(f"🚨 MEMORIA CRITICA: {memory['rss_mb']:.1f}MB - Riavvio consigliato")
            
            # Forza cleanup aggressivo
            global _processed_episodes_cache
            with _cache_lock:
                _processed_episodes_cache = None
            rss_cache.clear()
            
            logger.info("🧹 Cleanup aggressivo eseguito per memoria critica")
            
    except Exception as e:
        logger.error(f"❌ Errore controllo memoria: {e}")

# ===== FUNZIONE PRINCIPALE =====

async def main():
    """Funzione principale del bot"""
    # Validazione sicurezza pre-avvio
    if not validate_security_config():
        logger.error("❌ Validazione sicurezza fallita, bot non avviato")
        sys.exit(1)
    
    logger.info(f"🚀 BotTelegramRSS {get_version()} in avvio...")
    logger.info(f"📦 Codename: {VERSION_NAME} - Telegram Integration Established")
    
    # Crea applicazione con gestione errori di rete migliorata
    global application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Flag per tracciare se l'inizializzazione è riuscita
    initialization_successful = False
    
    try:
        # Aggiungi gestori comandi
        application.add_handler(CommandHandler("start", start_command))
        application.add_handler(CommandHandler("status", status_command))
        
        # Tenta inizializzazione con retry per problemi di rete
        max_init_retries = 3
        init_retry_count = 0
        
        while init_retry_count < max_init_retries and not initialization_successful:
            try:
                # Test connessione con getMe()
                bot_info = await application.bot.get_me()
                logger.info(f"✅ Connessione Telegram stabilita - Bot: @{bot_info.username}")
                initialization_successful = True
                
                # Invia messaggio di attivazione solo se connessione OK
                activation_message = (
                    "🤖 **Runtime Radio Automatic Bot Attivato**\n\n"
                    "Sarà mia responsabilità tenervi aggiornati sulle "
                    "produzioni dei nostri podcast.\n\n"
                    "📡 Monitoraggio attivo su 30 feed RSS\n"
                    "⏰ Controlli ogni 30 minuti\n"
                    "🎯 Canale: @runtimeradio\n\n"
                    "✅ Sistema operativo e pronto!"
                )
                
                await application.bot.send_message(
                    chat_id=CHANNEL_ID,
                    text=activation_message,
                    parse_mode='Markdown'
                )
                logger.info("✅ Messaggio di attivazione inviato")
                
            except (TimedOut, NetworkError, ConnectionError) as e:
                init_retry_count += 1
                logger.warning(f"⚠️ Tentativo {init_retry_count}/{max_init_retries} - Errore connessione: {e}")
                if init_retry_count < max_init_retries:
                    logger.info(f"🔄 Nuovo tentativo tra 5 secondi...")
                    await asyncio.sleep(5)
                else:
                    logger.warning("⚠️ Impossibile stabilire connessione iniziale, bot continuerà in modalità offline")
                    logger.info("📡 Il bot tenterà di riconnettersi durante il funzionamento")
            except Exception as e:
                logger.warning(f"⚠️ Errore durante inizializzazione: {e}")
                break
        
        # Aggiungi job per controllo episodi
        job_queue = application.job_queue
        job_queue.run_repeating(
            lambda context: asyncio.create_task(check_new_episodes()),
            interval=FEED_CHECK_INTERVAL,
            first=10  # Primo controllo dopo 10 secondi
        )
        
        # Aggiungi job per cleanup automatico (ogni 15 minuti)
        job_queue.run_repeating(
            lambda context: asyncio.create_task(periodic_cleanup()),
            interval=900,  # 15 minuti
            first=300  # Primo cleanup dopo 5 minuti
        )
        
        # Aggiungi job per controllo memoria (ogni 30 minuti, solo su server)
        if ENVIRONMENT_TYPE == 'server':
            job_queue.run_repeating(
                lambda context: asyncio.create_task(periodic_memory_check()),
                interval=1800,  # 30 minuti
                first=600  # Primo controllo dopo 10 minuti
            )
        
        logger.info(f"Bot avviato e job schedulato ogni {FEED_CHECK_INTERVAL}s ({FEED_CHECK_INTERVAL//60} min)")
        logger.info("🧹 Cleanup automatico attivato (ogni 15 min)")
        if ENVIRONMENT_TYPE == 'server':
            logger.info("💾 Monitoraggio memoria attivato (ogni 30 min)")
        logger.info("Il primo controllo avverrà tra 10 secondi...")
        
        # Messaggio di stato connessione
        if initialization_successful:
            logger.info("🌐 Bot avviato con connessione Telegram attiva")
        else:
            logger.warning("📡 Bot avviato in modalità offline - tenterà riconnessione automatica")
    
        # Avvia bot con gestione errori di rete migliorata
        try:
            await application.run_polling(
                # Configurazioni per gestire meglio i problemi di rete
                drop_pending_updates=True
            )
        except (TimedOut, NetworkError, ConnectionError) as e:
            logger.warning(f"⚠️ Errore di connessione durante polling: {e}")
            logger.info("🔄 Tentativo di riavvio automatico...")
            # Riprova con configurazione base
            await asyncio.sleep(10)
            await application.run_polling(drop_pending_updates=True)
    
    except KeyboardInterrupt:
        logger.info("🛑 Bot fermato dall'utente")
    except (TimedOut, NetworkError) as e:
        logger.warning(f"⚠️ Errore di rete/timeout: {e}")
        logger.info("🔄 Il bot continuerà a funzionare, errore temporaneo")
        # Non fare raise per errori di rete temporanei
    except TelegramError as e:
        logger.error(f"❌ Errore Telegram: {e}")
        if "unauthorized" in str(e).lower():
            logger.error("🔑 Token non valido o bot non autorizzato")
            raise
        else:
            logger.warning("⚠️ Errore Telegram temporaneo, il bot continuerà")
    except Exception as e:
        logger.error(f"❌ Errore critico durante l'esecuzione: {e}")
        raise
    finally:
        # Cleanup risorse con gestione sicura dell'event loop
        logger.info("🧹 Pulizia risorse in corso...")
        try:
            if application:
                # Gestione sicura dello shutdown per evitare errori event loop
                try:
                    # Controlla se l'event loop è ancora attivo
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        await application.shutdown()
                        logger.info("✅ Applicazione chiusa correttamente")
                    else:
                        logger.info("⚠️ Event loop già chiuso, skip shutdown")
                except RuntimeError as re:
                    if "cannot be called from a running event loop" in str(re) or "Cannot close a running event loop" in str(re):
                        logger.info("⚠️ Event loop in stato inconsistente, terminazione forzata")
                        # Terminazione forzata senza await per evitare conflitti
                        try:
                            application.stop()
                        except:
                            pass
                    else:
                        logger.warning(f"⚠️ Errore RuntimeError durante shutdown: {re}")
                except Exception as shutdown_error:
                    logger.warning(f"⚠️ Errore generico durante shutdown: {shutdown_error}")
        except Exception as e:
            logger.warning(f"⚠️ Errore durante cleanup finale: {e}")
        logger.info("👋 Bot terminato")

# Rimosso blocco if __name__ == "__main__" duplicato per evitare conflitti event loop
# Il bot viene avviato tramite main.py che chiama asyncio.run(main())
