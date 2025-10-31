#!/bin/bash

# ===== SCRIPT DI DEPLOYMENT PER SERVER LAMP =====
# Bot Telegram RSS - Deployment automatico su server Linux
# Versione: 2.0.0 - Ottimizzato per LAMP

set -e  # Ferma script in caso di errore

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurazione
BOT_USER="botuser"
BOT_DIR="/opt/bot-telegram-rss"
SERVICE_NAME="bot-telegram-rss"
PYTHON_VERSION="3.9"

echo -e "${BLUE}🚀 Bot Telegram RSS - Deployment Server LAMP${NC}"
echo -e "${BLUE}================================================${NC}"

# Funzione di log
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Controllo privilegi root
if [[ $EUID -ne 0 ]]; then
   error "Questo script deve essere eseguito come root"
   exit 1
fi

log "Inizio deployment su server LAMP..."

# 1. Aggiorna sistema
log "📦 Aggiornamento sistema..."
apt update && apt upgrade -y

# 2. Installa dipendenze Python
log "🐍 Installazione Python ${PYTHON_VERSION} e dipendenze..."
apt install -y python${PYTHON_VERSION} python${PYTHON_VERSION}-pip python${PYTHON_VERSION}-venv
apt install -y git curl wget htop logrotate

# 3. Crea utente dedicato
log "👤 Creazione utente dedicato ${BOT_USER}..."
if ! id "$BOT_USER" &>/dev/null; then
    useradd -r -s /bin/bash -d "$BOT_DIR" "$BOT_USER"
    log "Utente $BOT_USER creato"
else
    warn "Utente $BOT_USER già esistente"
fi

# 4. Crea directory e imposta permessi
log "📁 Creazione directory di lavoro..."
mkdir -p "$BOT_DIR"/{src,data,logs,backups}
chown -R "$BOT_USER:$BOT_USER" "$BOT_DIR"
chmod 755 "$BOT_DIR"

# 5. Copia file del bot
log "📋 Copia file del bot..."
if [ -d "./src" ]; then
    cp -r ./src/* "$BOT_DIR/src/"
    cp requirements.txt "$BOT_DIR/" 2>/dev/null || warn "requirements.txt non trovato"
    cp .env.example "$BOT_DIR/.env" 2>/dev/null || warn ".env.example non trovato"
    chown -R "$BOT_USER:$BOT_USER" "$BOT_DIR"
else
    error "Directory src non trovata. Esegui lo script dalla directory del progetto."
    exit 1
fi

# 6. Crea ambiente virtuale Python
log "🔧 Creazione ambiente virtuale Python..."
sudo -u "$BOT_USER" python${PYTHON_VERSION} -m venv "$BOT_DIR/venv"
sudo -u "$BOT_USER" "$BOT_DIR/venv/bin/pip" install --upgrade pip

# 7. Installa dipendenze Python
log "📚 Installazione dipendenze Python..."
if [ -f "$BOT_DIR/requirements.txt" ]; then
    sudo -u "$BOT_USER" "$BOT_DIR/venv/bin/pip" install -r "$BOT_DIR/requirements.txt"
else
    # Installa dipendenze base se requirements.txt non esiste
    sudo -u "$BOT_USER" "$BOT_DIR/venv/bin/pip" install python-telegram-bot feedparser python-dotenv psutil
fi

# 8. Configura logrotate
log "📝 Configurazione rotazione log..."
cat > /etc/logrotate.d/bot-telegram-rss << EOF
$BOT_DIR/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 $BOT_USER $BOT_USER
    postrotate
        systemctl reload $SERVICE_NAME || true
    endscript
}
EOF

# 9. Crea servizio systemd
log "⚙️  Creazione servizio systemd..."
cat > /etc/systemd/system/${SERVICE_NAME}.service << EOF
[Unit]
Description=Bot Telegram RSS
After=network.target
Wants=network.target

[Service]
Type=simple
User=$BOT_USER
Group=$BOT_USER
WorkingDirectory=$BOT_DIR/src
Environment=PATH=$BOT_DIR/venv/bin
ExecStart=$BOT_DIR/venv/bin/python bot.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bot-telegram-rss

# Limiti di sicurezza
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$BOT_DIR

[Install]
WantedBy=multi-user.target
EOF

# 10. Abilita e avvia servizio
log "🔄 Abilitazione servizio..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

# 11. Configura firewall (se ufw è installato)
if command -v ufw &> /dev/null; then
    log "🔥 Configurazione firewall..."
    ufw allow ssh
    ufw --force enable
fi

# 12. Crea script di monitoraggio
log "📊 Creazione script di monitoraggio..."
cat > "$BOT_DIR/monitor.sh" << 'EOF'
#!/bin/bash
# Script di monitoraggio Bot Telegram RSS

SERVICE_NAME="bot-telegram-rss"
LOG_FILE="/opt/bot-telegram-rss/logs/monitor.log"

# Controlla se il servizio è attivo
if ! systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "$(date): Servizio $SERVICE_NAME non attivo, riavvio..." >> "$LOG_FILE"
    systemctl restart "$SERVICE_NAME"
fi

# Controlla uso memoria
MEMORY_USAGE=$(ps -o pid,ppid,cmd,%mem --sort=-%mem -C python | grep bot.py | awk '{print $4}' | head -1)
if [ ! -z "$MEMORY_USAGE" ] && (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "$(date): Uso memoria elevato ($MEMORY_USAGE%), riavvio servizio..." >> "$LOG_FILE"
    systemctl restart "$SERVICE_NAME"
fi
EOF

chmod +x "$BOT_DIR/monitor.sh"
chown "$BOT_USER:$BOT_USER" "$BOT_DIR/monitor.sh"

# 13. Aggiungi cron per monitoraggio
log "⏰ Configurazione monitoraggio automatico..."
(crontab -u "$BOT_USER" -l 2>/dev/null; echo "*/5 * * * * $BOT_DIR/monitor.sh") | crontab -u "$BOT_USER" -

# 14. Crea script di backup
log "💾 Creazione script di backup..."
cat > "$BOT_DIR/backup.sh" << EOF
#!/bin/bash
# Script di backup automatico

BACKUP_DIR="$BOT_DIR/backups"
DATE=\$(date +%Y%m%d_%H%M%S)

# Backup database
if [ -f "$BOT_DIR/data/processed_episodes.json" ]; then
    cp "$BOT_DIR/data/processed_episodes.json" "\$BACKUP_DIR/processed_episodes_\$DATE.json"
    
    # Mantieni solo gli ultimi 7 backup
    find "\$BACKUP_DIR" -name "processed_episodes_*.json" -type f -mtime +7 -delete
fi

# Backup configurazione
cp "$BOT_DIR/.env" "\$BACKUP_DIR/env_\$DATE.backup" 2>/dev/null || true
EOF

chmod +x "$BOT_DIR/backup.sh"
chown "$BOT_USER:$BOT_USER" "$BOT_DIR/backup.sh"

# Aggiungi backup giornaliero
(crontab -u "$BOT_USER" -l 2>/dev/null; echo "0 2 * * * $BOT_DIR/backup.sh") | crontab -u "$BOT_USER" -

log "✅ Deployment completato!"
echo
echo -e "${BLUE}📋 PROSSIMI PASSI:${NC}"
echo -e "1. Modifica il file ${YELLOW}$BOT_DIR/.env${NC} con i tuoi token"
echo -e "2. Avvia il servizio: ${GREEN}systemctl start $SERVICE_NAME${NC}"
echo -e "3. Controlla i log: ${GREEN}journalctl -u $SERVICE_NAME -f${NC}"
echo -e "4. Verifica stato: ${GREEN}systemctl status $SERVICE_NAME${NC}"
echo
echo -e "${BLUE}📊 COMANDI UTILI:${NC}"
echo -e "• Riavvia: ${GREEN}systemctl restart $SERVICE_NAME${NC}"
echo -e "• Ferma: ${GREEN}systemctl stop $SERVICE_NAME${NC}"
echo -e "• Log: ${GREEN}tail -f $BOT_DIR/logs/bot.log${NC}"
echo -e "• Monitor: ${GREEN}$BOT_DIR/monitor.sh${NC}"
echo
echo -e "${GREEN}🎉 Bot pronto per il deployment su server LAMP!${NC}"