
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Dizionario locale di emergenza — non dipende dal Context React (che potrebbe essere crashato)
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

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        // Aggiorna lo stato in modo che il prossimo rendering mostri la UI di fallback.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // È possibile loggare l'errore in un servizio esterno qui
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const s = getErrorStrings();
            return (
                <div className="h-screen w-screen bg-dark-950 grid-dots flex items-center justify-center p-6 font-titan overflow-hidden">
                    <div className="max-w-2xl w-full bg-dark-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-2xl shadow-red-500/10 animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8 border-b border-red-500/20 pb-6">
                            <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/30">
                                <AlertTriangle size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                                    {s.title}
                                </h1>
                                <p className="text-red-500/60 text-xs font-bold uppercase tracking-widest mt-1">
                                    {s.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Error Content */}
                        <div className="mb-8">
                            <p className="text-titan-400/80 text-sm mb-3">
                                {s.body}
                            </p>

                            <div className="bg-black/40 rounded-lg p-4 border border-red-500/10 overflow-auto max-h-40 custom-scrollbar">
                                <code className="text-red-400 font-mono text-xs break-all leading-relaxed">
                                    {this.state.error?.name}: {this.state.error?.message}
                                </code>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <RefreshCw size={18} />
                                {s.reload}
                            </button>

                            <p className="text-center text-[10px] text-titan-500/40 uppercase tracking-widest font-bold mt-2">
                                {s.footer}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
