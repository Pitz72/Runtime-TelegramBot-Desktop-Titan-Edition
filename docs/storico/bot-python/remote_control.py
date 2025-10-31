#!/usr/bin/env python3
"""
🤖 TELEGRAM RSS BOT - CONTROLLO REMOTO v1.0.0
===============================================
Script per controllare il bot Telegram RSS sul server LAMP da remoto.

Funzionalità:
- ✅ Connessione SSH sicura al server
- 🚀 Start/Stop/Restart del bot
- 📊 Monitoraggio status e logs
- 🔧 Gestione configurazioni
- 📈 Statistiche in tempo reale

Autore: AI Assistant
Data: 2025-01-27
"""

import os
import sys
import time
import json
import getpass
import argparse
from datetime import datetime
from typing import Optional, Dict, List
import subprocess

try:
    import paramiko
    from paramiko import SSHClient, AutoAddPolicy
except ImportError:
    print("❌ ERRORE: Installa paramiko con: pip install paramiko")
    sys.exit(1)

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich.live import Live
    from rich.text import Text
except ImportError:
    print("❌ ERRORE: Installa rich con: pip install rich")
    sys.exit(1)

class TelegramBotRemoteControl:
    """Classe principale per il controllo remoto del bot Telegram RSS"""
    
    def __init__(self):
        self.console = Console()
        self.ssh_client = None
        self.server_config = {
            'hostname': '',
            'username': '',
            'password': '',
            'port': 22,
            'bot_path': '/home/telegrambot/bot',
            'service_name': 'telegram-rss-bot'
        }
        
    def load_server_config(self, config_file: str = 'server_config.json') -> bool:
        """Carica la configurazione del server da file JSON"""
        try:
            if os.path.exists(config_file):
                with open(config_file, 'r', encoding='utf-8') as f:
                    self.server_config.update(json.load(f))
                return True
        except Exception as e:
            self.console.print(f"⚠️ Errore caricamento config: {e}", style="yellow")
        return False
    
    def save_server_config(self, config_file: str = 'server_config.json'):
        """Salva la configurazione del server su file JSON"""
        try:
            with open(config_file, 'w', encoding='utf-8') as f:
                # Non salvare la password per sicurezza
                config_to_save = self.server_config.copy()
                config_to_save['password'] = ''
                json.dump(config_to_save, f, indent=2, ensure_ascii=False)
            self.console.print("✅ Configurazione salvata", style="green")
        except Exception as e:
            self.console.print(f"❌ Errore salvataggio config: {e}", style="red")
    
    def setup_server_config(self):
        """Configura i parametri di connessione al server"""
        self.console.print("\n🔧 [bold blue]CONFIGURAZIONE SERVER LAMP[/bold blue]")
        
        self.server_config['hostname'] = self.console.input("🌐 Hostname/IP del server: ") or self.server_config['hostname']
        self.server_config['username'] = self.console.input("👤 Username SSH: ") or self.server_config['username']
        self.server_config['password'] = getpass.getpass("🔐 Password SSH: ")
        
        port_input = self.console.input(f"🚪 Porta SSH [{self.server_config['port']}]: ")
        if port_input:
            self.server_config['port'] = int(port_input)
        
        bot_path = self.console.input(f"📁 Path bot sul server [{self.server_config['bot_path']}]: ")
        if bot_path:
            self.server_config['bot_path'] = bot_path
        
        service_name = self.console.input(f"⚙️ Nome servizio [{self.server_config['service_name']}]: ")
        if service_name:
            self.server_config['service_name'] = service_name
        
        self.save_server_config()
    
    def connect_ssh(self) -> bool:
        """Stabilisce connessione SSH al server"""
        try:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=self.console
            ) as progress:
                task = progress.add_task("🔌 Connessione al server...", total=None)
                
                self.ssh_client = SSHClient()
                self.ssh_client.set_missing_host_key_policy(AutoAddPolicy())
                
                self.ssh_client.connect(
                    hostname=self.server_config['hostname'],
                    username=self.server_config['username'],
                    password=self.server_config['password'],
                    port=self.server_config['port'],
                    timeout=10
                )
                
                progress.update(task, description="✅ Connesso!")
                time.sleep(0.5)
            
            self.console.print(f"✅ Connesso a {self.server_config['hostname']}", style="green")
            return True
            
        except Exception as e:
            self.console.print(f"❌ Errore connessione SSH: {e}", style="red")
            return False
    
    def disconnect_ssh(self):
        """Chiude la connessione SSH"""
        if self.ssh_client:
            self.ssh_client.close()
            self.ssh_client = None
            self.console.print("🔌 Connessione SSH chiusa", style="yellow")
    
    def execute_command(self, command: str) -> tuple[str, str, int]:
        """Esegue un comando sul server remoto"""
        if not self.ssh_client:
            return "", "Nessuna connessione SSH attiva", 1
        
        try:
            stdin, stdout, stderr = self.ssh_client.exec_command(command)
            exit_code = stdout.channel.recv_exit_status()
            
            output = stdout.read().decode('utf-8').strip()
            error = stderr.read().decode('utf-8').strip()
            
            return output, error, exit_code
            
        except Exception as e:
            return "", str(e), 1
    
    def get_bot_status(self) -> Dict:
        """Ottiene lo status del bot sul server"""
        status_info = {
            'service_active': False,
            'process_running': False,
            'uptime': 'N/A',
            'memory_usage': 'N/A',
            'cpu_usage': 'N/A',
            'last_log_entries': []
        }
        
        # Controlla status del servizio systemd
        output, error, code = self.execute_command(f"systemctl is-active {self.server_config['service_name']}")
        status_info['service_active'] = (code == 0 and output.strip() == 'active')
        
        # Controlla processo Python
        output, error, code = self.execute_command("pgrep -f 'python.*main.py'")
        status_info['process_running'] = (code == 0 and output.strip())
        
        # Ottieni uptime del servizio
        if status_info['service_active']:
            output, error, code = self.execute_command(f"systemctl show {self.server_config['service_name']} --property=ActiveEnterTimestamp")
            if code == 0 and output:
                status_info['uptime'] = output.split('=')[1] if '=' in output else 'N/A'
        
        # Ottieni uso memoria e CPU
        if status_info['process_running']:
            output, error, code = self.execute_command("ps aux | grep 'python.*main.py' | grep -v grep | awk '{print $3,$4}'")
            if code == 0 and output:
                parts = output.strip().split()
                if len(parts) >= 2:
                    status_info['cpu_usage'] = f"{parts[0]}%"
                    status_info['memory_usage'] = f"{parts[1]}%"
        
        # Ottieni ultimi log entries
        log_path = f"{self.server_config['bot_path']}/logs/bot.log"
        output, error, code = self.execute_command(f"tail -10 {log_path} 2>/dev/null || echo 'Log non disponibile'")
        if code == 0:
            status_info['last_log_entries'] = output.split('\n')[-5:] if output else []
        
        return status_info
    
    def start_bot(self) -> bool:
        """Avvia il bot sul server"""
        self.console.print("🚀 Avvio del bot...", style="blue")
        
        output, error, code = self.execute_command(f"sudo systemctl start {self.server_config['service_name']}")
        
        if code == 0:
            self.console.print("✅ Bot avviato con successo!", style="green")
            time.sleep(2)  # Attendi che il servizio si stabilizzi
            return True
        else:
            self.console.print(f"❌ Errore avvio bot: {error}", style="red")
            return False
    
    def stop_bot(self) -> bool:
        """Ferma il bot sul server"""
        self.console.print("🛑 Arresto del bot...", style="yellow")
        
        output, error, code = self.execute_command(f"sudo systemctl stop {self.server_config['service_name']}")
        
        if code == 0:
            self.console.print("✅ Bot fermato con successo!", style="green")
            return True
        else:
            self.console.print(f"❌ Errore arresto bot: {error}", style="red")
            return False
    
    def restart_bot(self) -> bool:
        """Riavvia il bot sul server"""
        self.console.print("🔄 Riavvio del bot...", style="blue")
        
        output, error, code = self.execute_command(f"sudo systemctl restart {self.server_config['service_name']}")
        
        if code == 0:
            self.console.print("✅ Bot riavviato con successo!", style="green")
            time.sleep(3)  # Attendi che il servizio si stabilizzi
            return True
        else:
            self.console.print(f"❌ Errore riavvio bot: {error}", style="red")
            return False
    
    def show_status(self):
        """Mostra lo status dettagliato del bot"""
        status = self.get_bot_status()
        
        # Crea tabella status
        table = Table(title="📊 STATUS BOT TELEGRAM RSS", show_header=True, header_style="bold magenta")
        table.add_column("Parametro", style="cyan", no_wrap=True)
        table.add_column("Valore", style="white")
        table.add_column("Status", justify="center")
        
        # Status servizio
        service_status = "🟢 ATTIVO" if status['service_active'] else "🔴 INATTIVO"
        table.add_row("Servizio SystemD", self.server_config['service_name'], service_status)
        
        # Status processo
        process_status = "🟢 RUNNING" if status['process_running'] else "🔴 STOPPED"
        table.add_row("Processo Python", "main.py", process_status)
        
        # Uptime
        table.add_row("Uptime", status['uptime'], "⏰")
        
        # Risorse
        table.add_row("Uso CPU", status['cpu_usage'], "💻")
        table.add_row("Uso Memoria", status['memory_usage'], "🧠")
        
        self.console.print(table)
        
        # Mostra ultimi log
        if status['last_log_entries']:
            self.console.print("\n📋 [bold blue]ULTIMI LOG ENTRIES:[/bold blue]")
            for entry in status['last_log_entries']:
                if entry.strip():
                    self.console.print(f"  {entry}", style="dim")
    
    def show_logs(self, lines: int = 50, follow: bool = False):
        """Mostra i log del bot"""
        log_path = f"{self.server_config['bot_path']}/logs/bot.log"
        
        if follow:
            self.console.print(f"📋 [bold blue]LOG IN TEMPO REALE[/bold blue] (Ctrl+C per uscire)")
            self.console.print(f"File: {log_path}\n")
            
            try:
                # Usa tail -f per seguire i log in tempo reale
                command = f"tail -f {log_path}"
                stdin, stdout, stderr = self.ssh_client.exec_command(command)
                
                while True:
                    line = stdout.readline()
                    if not line:
                        break
                    self.console.print(line.rstrip(), style="dim")
                    
            except KeyboardInterrupt:
                self.console.print("\n🛑 Monitoraggio log interrotto", style="yellow")
            except Exception as e:
                self.console.print(f"❌ Errore lettura log: {e}", style="red")
        else:
            self.console.print(f"📋 [bold blue]ULTIMI {lines} LOG ENTRIES:[/bold blue]")
            output, error, code = self.execute_command(f"tail -{lines} {log_path}")
            
            if code == 0 and output:
                for line in output.split('\n'):
                    if line.strip():
                        self.console.print(line, style="dim")
            else:
                self.console.print("❌ Impossibile leggere i log", style="red")
    
    def show_menu(self):
        """Mostra il menu principale"""
        menu_panel = Panel.fit(
            """
🤖 [bold blue]TELEGRAM RSS BOT - CONTROLLO REMOTO[/bold blue]

[bold green]COMANDI DISPONIBILI:[/bold green]
  [cyan]1.[/cyan] 📊 Status del bot
  [cyan]2.[/cyan] 🚀 Avvia bot
  [cyan]3.[/cyan] 🛑 Ferma bot  
  [cyan]4.[/cyan] 🔄 Riavvia bot
  [cyan]5.[/cyan] 📋 Mostra log (ultimi 50)
  [cyan]6.[/cyan] 📺 Monitora log in tempo reale
  [cyan]7.[/cyan] 🔧 Configura server
  [cyan]8.[/cyan] 🔌 Riconnetti SSH
  [cyan]0.[/cyan] ❌ Esci

[dim]Server: {hostname}[/dim]
            """.format(hostname=self.server_config.get('hostname', 'Non configurato')),
            title="🎛️ MENU PRINCIPALE",
            border_style="blue"
        )
        
        self.console.print(menu_panel)
    
    def run_interactive(self):
        """Esegue il controllo remoto in modalità interattiva"""
        self.console.print("\n🤖 [bold blue]TELEGRAM RSS BOT - CONTROLLO REMOTO v1.0.0[/bold blue]\n")
        
        # Carica configurazione esistente
        if not self.load_server_config():
            self.console.print("⚙️ Prima configurazione necessaria", style="yellow")
            self.setup_server_config()
        
        # Connetti al server
        if not self.connect_ssh():
            self.console.print("❌ Impossibile connettersi al server", style="red")
            return
        
        try:
            while True:
                self.show_menu()
                
                try:
                    choice = self.console.input("\n🎯 Scegli un'opzione: ").strip()
                except KeyboardInterrupt:
                    break
                
                if choice == '1':
                    self.show_status()
                elif choice == '2':
                    self.start_bot()
                elif choice == '3':
                    self.stop_bot()
                elif choice == '4':
                    self.restart_bot()
                elif choice == '5':
                    self.show_logs(50, False)
                elif choice == '6':
                    self.show_logs(follow=True)
                elif choice == '7':
                    self.setup_server_config()
                    self.disconnect_ssh()
                    if not self.connect_ssh():
                        break
                elif choice == '8':
                    self.disconnect_ssh()
                    if not self.connect_ssh():
                        break
                elif choice == '0':
                    break
                else:
                    self.console.print("❌ Opzione non valida", style="red")
                
                if choice != '6':  # Non fare pausa dopo il monitoraggio log
                    self.console.input("\n⏸️ Premi INVIO per continuare...")
                    
        except KeyboardInterrupt:
            pass
        finally:
            self.disconnect_ssh()
            self.console.print("\n👋 Arrivederci!", style="green")

def main():
    """Funzione principale"""
    parser = argparse.ArgumentParser(description='Controllo remoto Telegram RSS Bot')
    parser.add_argument('--config', help='File di configurazione server', default='server_config.json')
    parser.add_argument('--command', choices=['status', 'start', 'stop', 'restart', 'logs'], help='Comando da eseguire')
    parser.add_argument('--lines', type=int, default=50, help='Numero di righe log da mostrare')
    
    args = parser.parse_args()
    
    controller = TelegramBotRemoteControl()
    
    if args.command:
        # Modalità comando singolo
        if not controller.load_server_config(args.config):
            print("❌ Configurazione server non trovata. Usa modalità interattiva.")
            return
        
        if not controller.connect_ssh():
            print("❌ Impossibile connettersi al server")
            return
        
        try:
            if args.command == 'status':
                controller.show_status()
            elif args.command == 'start':
                controller.start_bot()
            elif args.command == 'stop':
                controller.stop_bot()
            elif args.command == 'restart':
                controller.restart_bot()
            elif args.command == 'logs':
                controller.show_logs(args.lines, False)
        finally:
            controller.disconnect_ssh()
    else:
        # Modalità interattiva
        controller.run_interactive()

if __name__ == "__main__":
    main()