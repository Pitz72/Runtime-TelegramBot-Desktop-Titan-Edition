
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
                                    Critical System Error
                                </h1>
                                <p className="text-red-500/60 text-xs font-bold uppercase tracking-widest mt-1">
                                    Interface Termination Detected
                                </p>
                            </div>
                        </div>

                        {/* Error Content */}
                        <div className="mb-8">
                            <p className="text-titan-400/80 text-sm mb-3">
                                The interface module encountered a fatal error. Background processes (Bots) might still be operational, but the UI needs to be reloaded.
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
                                Reload Interface
                            </button>

                            <p className="text-center text-[10px] text-titan-500/40 uppercase tracking-widest font-bold mt-2">
                                Titan Desktop Safety Protocol Active
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
