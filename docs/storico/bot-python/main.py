#!/usr/bin/env python3
"""
BotTelegramRSS v2.0.3 "Phantom" - Main Launcher
Launcher principale per avviare il bot dalla nuova struttura src/

Usage:
    python main.py
"""

import sys
import os

# Aggiungi la cartella src al path Python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Import e avvio del bot
from bot import main
import asyncio

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("🛑 Bot fermato dall'utente")
    except RuntimeError as re:
        if "Cannot close a running event loop" in str(re):
            print("⚠️ Event loop già chiuso - terminazione normale")
        else:
            print(f"❌ Errore RuntimeError: {re}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Errore critico: {e}")
        sys.exit(1)