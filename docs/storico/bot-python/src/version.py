#!/usr/bin/env python3
"""
Version information for BotTelegramRSS
"""

# Versione principale
VERSION = "2.0.3"
VERSION_NAME = "Phantom"
VERSION_BUILD = "20251210b"

# Informazioni versione
VERSION_INFO = {
    "version": VERSION,
    "name": VERSION_NAME,
    "build": VERSION_BUILD,
    "release_date": "2025-12-10",
    "codename": "Phoenix - Multi-Feed Production Release",
    "description": "Hotfix per glitch grafico nel messaggio Telegram",
    "changelog": [
        "🐛 FIX: Corretto glitch 'u200b' visibile nei messaggi (zero-width space escape)",
        "📚 DOCS: Sincronizzazione completa versione e documentazione (v2.0.2)",
        "🔊 AZURACAST: Supporto completo feed Azuracast e fallback immagini (v2.0.1)",
        "🔥 REFACTORING COMPLETO: Architettura multi-feed da zero (v2.0.0)",
        "📡 MULTI-FEED: Supporto per 30+ feed RSS simultanei",
        "🧹 PULIZIA CODEBASE: Rimossi file obsoleti e codice legacy",
        "📝 TEMPLATE PERSONALIZZATO: Formato messaggio italiano naturale",
        "📅 DATA CUTOFF: Evita spam su cambio canale con logica temporale",
        "⚡ PERFORMANCE: Rate limiting ottimizzato per multi-feed",
        "🔒 SICUREZZA: Mantenute tutte le protezioni"
    ]
}

# Compatibilità
MIN_PYTHON_VERSION = "3.8"
REQUIRED_DEPENDENCIES = [
    "python-telegram-bot>=20.0",
    "feedparser>=6.0",
    "nest-asyncio>=1.5",
    "python-dotenv>=1.0"
]

# Security Notes v1.0.0
SECURITY_NOTES = {
    "token_protection": "Token protetti da .gitignore, nessun hardcoding",
    "file_protection": "File sensibili esclusi da versioning",
    "config_validation": "Validazione automatica configurazione",
    "backup_security": "Backup database senza esposizione credenziali"
}

def get_version():
    """Ritorna la versione completa"""
    return f"{VERSION} '{VERSION_NAME}' (build {VERSION_BUILD})"

def get_version_info():
    """Ritorna informazioni complete della versione"""
    return VERSION_INFO

def get_security_info():
    """Ritorna informazioni sicurezza versione"""
    return SECURITY_NOTES

if __name__ == "__main__":
    print(f"BotTelegramRSS {get_version()}")
    print(f"Release: {VERSION_INFO['release_date']}")
    print(f"Codename: {VERSION_INFO['codename']}")
    print("\nChangelog:")
    for change in VERSION_INFO['changelog']:
        print(f"  • {change}")
    print(f"\nSecurity Level: HARDENED (v{VERSION})")
    print("✅ Production Ready - Secure & Stable")