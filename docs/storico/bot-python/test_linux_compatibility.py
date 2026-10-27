#!/usr/bin/env python3
"""
Test di Compatibilità Linux - Bot Telegram RSS v2.0.0
Verifica tutte le funzionalità critiche prima del deployment
"""

import sys
import os
import platform
import importlib
import json
import tempfile
from pathlib import Path

def print_header(title):
    """Stampa header formattato"""
    print(f"\n{'='*60}")
    print(f"🔍 {title}")
    print('='*60)

def print_result(test_name, success, details=""):
    """Stampa risultato test"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"    {details}")

def test_python_version():
    """Test versione Python"""
    print_header("TEST VERSIONE PYTHON")
    
    version = sys.version_info
    required = (3, 8)
    
    success = version >= required
    details = f"Versione: {version.major}.{version.minor}.{version.micro}"
    if not success:
        details += f" (Richiesta: {required[0]}.{required[1]}+)"
    
    print_result("Versione Python", success, details)
    return success

def test_platform_detection():
    """Test rilevamento piattaforma"""
    print_header("TEST RILEVAMENTO PIATTAFORMA")
    
    try:
        system = platform.system()
        hostname = platform.node()
        
        print_result("Rilevamento OS", True, f"Sistema: {system}")
        print_result("Rilevamento Hostname", True, f"Hostname: {hostname}")
        
        # Test logica ambiente
        is_server = system == "Linux" and any(keyword in hostname.lower() 
                                            for keyword in ['server', 'lamp', 'web', 'host'])
        env_type = "server" if is_server else "local"
        
        print_result("Rilevamento Ambiente", True, f"Tipo: {env_type}")
        return True
        
    except Exception as e:
        print_result("Rilevamento Piattaforma", False, str(e))
        return False

def test_required_modules():
    """Test moduli richiesti"""
    print_header("TEST MODULI PYTHON")
    
    required_modules = [
        'asyncio',
        'json', 
        'logging',
        'os',
        'time',
        'sys',
        'platform',
        'pathlib',
        'threading',
        'functools'
    ]
    
    optional_modules = [
        'feedparser',
        'telegram',
        'psutil',
        'nest_asyncio'
    ]
    
    all_success = True
    
    # Test moduli richiesti
    for module in required_modules:
        try:
            importlib.import_module(module)
            print_result(f"Modulo {module}", True, "Built-in")
        except ImportError as e:
            print_result(f"Modulo {module}", False, str(e))
            all_success = False
    
    # Test moduli opzionali
    for module in optional_modules:
        try:
            importlib.import_module(module)
            print_result(f"Modulo {module}", True, "Installato")
        except ImportError:
            print_result(f"Modulo {module}", False, "Non installato (installare con pip)")
    
    return all_success

def test_nest_asyncio_logic():
    """Test logica nest_asyncio"""
    print_header("TEST LOGICA NEST_ASYNCIO")
    
    try:
        system = platform.system()
        
        if system == "Windows":
            try:
                import nest_asyncio
                nest_asyncio.apply()
                print_result("nest_asyncio Windows", True, "Applicato correttamente")
            except ImportError:
                print_result("nest_asyncio Windows", False, "Modulo non trovato")
                return False
        else:
            print_result("nest_asyncio Linux", True, "Saltato correttamente (non Windows)")
        
        return True
        
    except Exception as e:
        print_result("Logica nest_asyncio", False, str(e))
        return False

def test_path_system():
    """Test sistema path cross-platform"""
    print_header("TEST SISTEMA PATH")
    
    try:
        # Test pathlib
        from pathlib import Path
        
        # Test path base
        base_dir = Path(__file__).parent.absolute()
        print_result("Path base", True, f"Base: {base_dir}")
        
        # Test path relativi
        config_dir = base_dir / "config"
        data_dir = base_dir / "data"
        logs_dir = base_dir / "logs"
        
        print_result("Path config", True, f"Config: {config_dir}")
        print_result("Path data", True, f"Data: {data_dir}")
        print_result("Path logs", True, f"Logs: {logs_dir}")
        
        # Test creazione directory
        test_dir = base_dir / "test_temp"
        test_dir.mkdir(exist_ok=True)
        
        success = test_dir.exists()
        print_result("Creazione directory", success)
        
        if success:
            test_dir.rmdir()
        
        return True
        
    except Exception as e:
        print_result("Sistema Path", False, str(e))
        return False

def test_file_operations():
    """Test operazioni file"""
    print_header("TEST OPERAZIONI FILE")
    
    try:
        # Test scrittura/lettura JSON
        test_data = {
            "test": True,
            "timestamp": "2024-01-01T00:00:00",
            "episodes": ["ep1", "ep2"]
        }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(test_data, f, indent=2)
            temp_file = f.name
        
        # Test lettura
        with open(temp_file, 'r') as f:
            loaded_data = json.load(f)
        
        success = loaded_data == test_data
        print_result("Operazioni JSON", success)
        
        # Cleanup
        os.unlink(temp_file)
        
        return success
        
    except Exception as e:
        print_result("Operazioni File", False, str(e))
        return False

def test_logging_system():
    """Test sistema logging"""
    print_header("TEST SISTEMA LOGGING")
    
    try:
        import logging
        from logging.handlers import RotatingFileHandler
        
        # Test configurazione base
        logger = logging.getLogger('test_bot')
        logger.setLevel(logging.INFO)
        
        # Test handler console
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # Test formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(formatter)
        
        logger.addHandler(console_handler)
        
        print_result("Configurazione Logging", True)
        
        # Test RotatingFileHandler (per server)
        with tempfile.NamedTemporaryFile(suffix='.log', delete=False) as f:
            temp_log = f.name
        
        file_handler = RotatingFileHandler(
            temp_log,
            maxBytes=1024*1024,  # 1MB
            backupCount=5
        )
        file_handler.setFormatter(formatter)
        
        print_result("Rotating File Handler", True)
        
        # Test log message
        logger.info("Test message")
        print_result("Log Message", True)
        
        # Cleanup
        os.unlink(temp_log)
        
        return True
        
    except Exception as e:
        print_result("Sistema Logging", False, str(e))
        return False

def test_memory_monitoring():
    """Test monitoraggio memoria"""
    print_header("TEST MONITORAGGIO MEMORIA")
    
    try:
        import psutil
        
        # Test uso memoria
        memory = psutil.virtual_memory()
        print_result("Memoria totale", True, f"{memory.total / (1024**3):.1f} GB")
        print_result("Memoria disponibile", True, f"{memory.available / (1024**3):.1f} GB")
        print_result("Utilizzo memoria", True, f"{memory.percent}%")
        
        # Test processo corrente
        process = psutil.Process()
        process_memory = process.memory_info()
        print_result("Memoria processo", True, f"{process_memory.rss / (1024**2):.1f} MB")
        
        return True
        
    except ImportError:
        print_result("Monitoraggio Memoria", False, "psutil non installato")
        return False
    except Exception as e:
        print_result("Monitoraggio Memoria", False, str(e))
        return False

def main():
    """Esegue tutti i test"""
    print("🚀 Test di Compatibilità Linux - Bot Telegram RSS v2.0.0")
    print(f"Sistema: {platform.system()} {platform.release()}")
    print(f"Python: {sys.version}")
    
    tests = [
        test_python_version,
        test_platform_detection,
        test_required_modules,
        test_nest_asyncio_logic,
        test_path_system,
        test_file_operations,
        test_logging_system,
        test_memory_monitoring
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print_result(f"ERRORE in {test.__name__}", False, str(e))
            results.append(False)
    
    # Riepilogo finale
    print_header("RIEPILOGO FINALE")
    
    passed = sum(results)
    total = len(results)
    success_rate = (passed / total) * 100
    
    print(f"✅ Test superati: {passed}/{total}")
    print(f"📊 Tasso successo: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("\n🎉 SISTEMA PRONTO PER DEPLOYMENT!")
        print("   Tutti i test critici sono stati superati.")
    elif success_rate >= 70:
        print("\n⚠️  SISTEMA PARZIALMENTE PRONTO")
        print("   Alcuni test opzionali falliti, ma deployment possibile.")
    else:
        print("\n❌ SISTEMA NON PRONTO")
        print("   Risolvere i problemi prima del deployment.")
    
    return success_rate >= 70

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)