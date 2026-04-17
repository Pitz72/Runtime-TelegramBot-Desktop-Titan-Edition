import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Warning, ArrowsClockwise } from '@phosphor-icons/react';

const errorStrings: Record<string, { title: string; subtitle: string; body: string; reload: string; footer: string }> = {
    it: { title: 'Errore Critico di Sistema', subtitle: 'Arresto Interfaccia Rilevato', body: "L'interfaccia ha riscontrato un errore fatale. I processi in background (Bot) potrebbero essere ancora attivi, ma l'interfaccia deve essere ricaricata.", reload: 'Ricarica Interfaccia', footer: 'Protocollo di Sicurezza Titan Desktop Attivo' },
    en: { title: 'Critical System Error', subtitle: 'Interface Termination Detected', body: 'The interface module encountered a fatal error. Background processes (Bots) might still be operational, but the UI needs to be reloaded.', reload: 'Reload Interface', footer: 'Titan Desktop Safety Protocol Active' },
    fr: { title: 'Erreur Système Critique', subtitle: "Arrêt de l'Interface Détecté", body: "L'interface a rencontré une erreur fatale. Les processus en arrière-plan (Bots) peuvent encore fonctionner, mais l'interface doit être rechargée.", reload: "Recharger l'Interface", footer: 'Protocole de Sécurité Titan Desktop Actif' },
    de: { title: 'Kritischer Systemfehler', subtitle: 'Schnittstellenabschaltung Erkannt', body: 'Das Interface-Modul hat einen fatalen Fehler festgestellt. Hintergrundprozesse (Bots) könnten noch laufen, aber die Oberfläche muss neu geladen werden.', reload: 'Oberfläche Neu Laden', footer: 'Titan Desktop Sicherheitsprotokoll Aktiv' },
    es: { title: 'Error Crítico del Sistema', subtitle: 'Terminación de Interfaz Detectada', body: 'El módulo de interfaz encontró un error fatal. Los procesos en segundo plano (Bots) pueden seguir operativos, pero la interfaz necesita recargarse.', reload: 'Recargar Interfaz', footer: 'Protocolo de Seguridad Titan Desktop Activo' },
    pt: { title: 'Erro Crítico do Sistema', subtitle: 'Encerramento da Interface Detectado', body: 'O módulo de interface encontrou um erro fatal. Os processos em segundo plano (Bots) podem ainda estar operacionais, mas a interface precisa ser recarregada.', reload: 'Recarregar Interface', footer: 'Protocolo de Segurança Titan Desktop Ativo' },
    ru: { title: 'Критическая Ошибка Системы', subtitle: 'Обнаружено Завершение Интерфейса', body: 'Модуль интерфейса столкнулся с фатальной ошибкой. Фоновые процессы (Боты) могут продолжать работать, но интерфейс необходимо перезагрузить.', reload: 'Перезагрузить Интерфейс', footer: 'Протокол Безопасности Titan Desktop Активен' },
    zh: { title: '严重系统错误', subtitle: '检测到界面终止', body: '界面模块遇到了致命错误。后台进程（机器人）可能仍在运行，但界面需要重新加载。', reload: '重新加载界面', footer: 'Titan Desktop 安全协议已激活' },
};

function getErrorStrings() {
    try {
        const lang = localStorage.getItem('titan-lang') || 'en';
        return errorStrings[lang] || errorStrings.en;
    } catch {
        return errorStrings.en;
    }
}

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => { window.location.reload(); };

    render() {
        if (this.state.hasError) {
            const s = getErrorStrings();
            return (
                <div className="h-screen w-screen bg-background grid-dots flex items-center justify-center p-6 font-body overflow-hidden">
                    {/* Ambient halo */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[700px] h-[700px] rounded-full bg-error/5 blur-[120px]" />
                    </div>

                    <div className="max-w-2xl w-full glass-panel rounded-xl overflow-hidden animate-in fade-in zoom-in duration-300 relative"
                        style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,180,171,0.08)' }}
                    >
                        {/* Top accent stripe */}
                        <div className="h-0.5 w-full bg-gradient-to-r from-error via-error/60 to-transparent" />

                        {/* Header */}
                        <div className="flex items-center gap-4 p-8 border-b border-outline-variant/15">
                            <div className="w-14 h-14 rounded-xl bg-error-container/20 flex items-center justify-center text-error border border-error/20 drop-glow-error flex-shrink-0">
                                <Warning size={28} weight="duotone" />
                            </div>
                            <div>
                                <h1 className="font-headline text-2xl font-black text-on-surface uppercase tracking-tight">
                                    {s.title}
                                </h1>
                                <p className="text-micro text-error/60 mt-1">{s.subtitle}</p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-4">
                            <p className="text-sm text-on-surface-variant leading-relaxed">{s.body}</p>

                            <div className="bg-surface-container-lowest rounded-lg p-4 border border-error/10 overflow-auto max-h-40 scanline-bg">
                                <code className="text-error font-mono text-xs break-all leading-relaxed relative z-10 block">
                                    {this.state.error?.name}: {this.state.error?.message}
                                </code>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-8 pb-8 flex flex-col gap-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full bg-error/15 hover:bg-error/25 text-error border border-error/30 py-3 rounded-lg font-headline font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] drop-glow-error"
                            >
                                <ArrowsClockwise size={18} weight="bold" />
                                {s.reload}
                            </button>
                            <p className="text-center text-nano text-outline-variant/30 mt-1">{s.footer}</p>
                        </div>

                        {/* Micro-copy decorativo */}
                        <div className="absolute bottom-3 left-5 text-nano text-outline-variant/25 pointer-events-none">
                            ERR_CODE: 0xDEAD_BEEF · TITAN_SAFE
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
