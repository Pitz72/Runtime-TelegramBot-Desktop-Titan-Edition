@echo off
echo.
echo 🤖 TELEGRAM RSS BOT - SETUP CONTROLLO REMOTO
echo =============================================
echo.

REM Controlla se Python è installato
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python non trovato! Installa Python 3.8+ da python.org
    pause
    exit /b 1
)

echo ✅ Python trovato
echo.

REM Installa le dipendenze
echo 📦 Installazione dipendenze...
pip install -r requirements_remote.txt

if errorlevel 1 (
    echo ❌ Errore installazione dipendenze
    pause
    exit /b 1
)

echo.
echo ✅ Setup completato!
echo.
echo 🚀 Avvio controllo remoto...
echo.

REM Avvia lo script di controllo remoto
python remote_control.py

pause