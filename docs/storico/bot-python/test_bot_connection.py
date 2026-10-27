#!/usr/bin/env python3
"""
Test di connessione per RuntimeRadioBot v2.0.0 "Connection"
Script per verificare che il bot sia configurato correttamente
Parte del sistema di anti-regressione v2.0.0
"""

import asyncio
import sys
import os

# Aggiungi la cartella src al path Python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from telegram import Bot
from config import BOT_TOKEN, CHANNEL_ID

async def test_bot_connection():
    """Test di connessione base del bot"""
    print("🔍 Test connessione RuntimeRadioBot v2.0.0 'Connection'...")
    print(f"📋 Token: {BOT_TOKEN[:10]}...{BOT_TOKEN[-10:]}")
    print(f"📺 Canale: {CHANNEL_ID}")
    print()
    
    try:
        # Inizializza bot
        bot = Bot(token=BOT_TOKEN)
        
        # Test 1: Verifica bot info
        print("🤖 Test 1: Informazioni bot...")
        bot_info = await bot.get_me()
        print(f"✅ Bot attivo: @{bot_info.username}")
        print(f"   Nome: {bot_info.first_name}")
        print(f"   ID: {bot_info.id}")
        print()
        
        # Test 2: Verifica accesso al canale
        print("📺 Test 2: Accesso al canale...")
        try:
            chat_info = await bot.get_chat(CHANNEL_ID)
            print(f"✅ Canale trovato: {chat_info.title}")
            print(f"   Tipo: {chat_info.type}")
            print(f"   Membri: {getattr(chat_info, 'member_count', 'N/A')}")
            print()
            
            # Test 3: Verifica permessi (invio messaggio di test)
            print("📤 Test 3: Invio messaggio di test...")
            test_message = (
                "🧪 **TEST CONNESSIONE**\n\n"
                "✅ RuntimeRadioBot è ora operativo!\n\n"
                "🔧 *Questo è un messaggio di test automatico*\n"
                "📡 Il bot è pronto per monitorare i feed RSS"
            )
            
            message = await bot.send_message(
                chat_id=CHANNEL_ID,
                text=test_message,
                parse_mode='Markdown'
            )
            
            print(f"✅ Messaggio inviato con successo!")
            print(f"   ID messaggio: {message.message_id}")
            print(f"   Data: {message.date}")
            print()
            
        except Exception as e:
            if "not a member" in str(e).lower() or "forbidden" in str(e).lower():
                print("❌ Bot non è amministratore del canale!")
                print("   Soluzione: Aggiungi @RuntimeRadioBot come admin del canale")
            else:
                print(f"❌ Errore accesso canale: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Errore connessione bot: {e}")
        return False
    
    print("🎉 TUTTI I TEST SUPERATI!")
    print("🚀 RuntimeRadioBot v2.0.0 'Connection' è operativo")
    print("✅ Sistema certificato per produzione")
    return True

if __name__ == "__main__":
    try:
        result = asyncio.run(test_bot_connection())
        if result:
            print("\n✅ Test completato con successo")
            print("💡 Puoi ora avviare il bot principale con: python main.py")
        else:
            print("\n❌ Test fallito - controlla la configurazione")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Test interrotto dall'utente")
    except Exception as e:
        print(f"\n💥 Errore critico: {e}")
        sys.exit(1)