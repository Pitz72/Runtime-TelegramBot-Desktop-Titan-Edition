@echo off
echo ========================================
echo 🌐 Setup Web Control Interface
echo Bot Telegram RSS - Controllo Remoto
echo ========================================
echo.

REM Verifica Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python non trovato! Installa Python 3.8+ prima di continuare.
    echo 📥 Scarica da: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python trovato
echo.

REM Crea ambiente virtuale se non esiste
if not exist "venv_web" (
    echo 📦 Creazione ambiente virtuale...
    python -m venv venv_web
    if errorlevel 1 (
        echo ❌ Errore nella creazione dell'ambiente virtuale
        pause
        exit /b 1
    )
    echo ✅ Ambiente virtuale creato
) else (
    echo ✅ Ambiente virtuale già presente
)

echo.

REM Attiva ambiente virtuale
echo 🔄 Attivazione ambiente virtuale...
call venv_web\Scripts\activate.bat

REM Aggiorna pip
echo 📦 Aggiornamento pip...
python -m pip install --upgrade pip

REM Installa dipendenze
echo 📦 Installazione dipendenze...
pip install -r requirements_web.txt
if errorlevel 1 (
    echo ❌ Errore nell'installazione delle dipendenze
    echo 💡 Prova a eseguire manualmente: pip install -r requirements_web.txt
    pause
    exit /b 1
)

echo.
echo ✅ Installazione completata!
echo.
echo ========================================
echo 🔧 CONFIGURAZIONE NECESSARIA
echo ========================================
echo.
echo 1. Modifica il file 'web_config.json' con i dati del tuo server:
echo    - SSH_HOST: indirizzo del tuo server LAMP
echo    - SSH_USERNAME: nome utente SSH
echo    - BOT_PATH: percorso del bot sul server
echo.
echo 2. Configura l'autenticazione SSH:
echo    - Usa chiave SSH (raccomandato) o password
echo    - Percorso chiave: SSH_KEY_PATH
echo.
echo 3. Personalizza username/password per l'accesso web
echo.
echo ========================================
echo 🚀 AVVIO INTERFACCIA WEB
echo ========================================
echo.

set /p start_now="Vuoi avviare l'interfaccia web ora? (s/n): "
if /i "%start_now%"=="s" (
    echo.
    echo 🌐 Avvio server web su http://localhost:5000
    echo 📱 Apri il browser e vai su http://localhost:5000
    echo 🛑 Premi Ctrl+C per fermare il server
    echo.
    python app.py
) else (
    echo.
    echo 💡 Per avviare l'interfaccia web in futuro:
    echo    1. Attiva l'ambiente: venv_web\Scripts\activate.bat
    echo    2. Avvia il server: python app.py
    echo.
)

echo.
echo 👋 Setup completato!
pause