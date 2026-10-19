import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Testi propri e non dal contesto i18n: questa schermata deve funzionare anche quando è
// proprio il resto dell'interfaccia a essersi rotto.
const errorStrings: Record<string, { title: string; body: string; reload: string; details: string }> = {
    it: {
        title: 'L’interfaccia si è interrotta',
        body: 'Si è verificato un errore imprevisto nell’interfaccia. Il motore dei bot, se era acceso, continua a lavorare in sottofondo: basta ricaricare la finestra.',
        reload: 'Ricarica l’interfaccia',
        details: 'Dettagli tecnici',
    },
    en: {
        title: 'The interface has stopped',
        body: 'An unexpected error occurred in the interface. The bot engine, if it was running, keeps working in the background: reloading the window is enough.',
        reload: 'Reload the interface',
        details: 'Technical details',
    },
};

function getErrorStrings() {
    try {
        const lang = localStorage.getItem('titan-lang') || 'it';
        return errorStrings[lang] || errorStrings.en;
    } catch {
        return errorStrings.it;
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
        if (!this.state.hasError) return this.props.children;
        const s = getErrorStrings();
        return (
            <main className="flex h-screen items-center justify-center bg-canvas p-6">
                <div role="alert" className="w-full max-w-xl rounded-xl border border-line bg-surface-1 p-8 shadow-overlay">
                    <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-danger" aria-hidden="true">
                            <AlertTriangle size={22} />
                        </span>
                        <div>
                            <h1 className="text-xl font-semibold text-fg">{s.title}</h1>
                            <p className="mt-2 text-base text-fg-2">{s.body}</p>
                        </div>
                    </div>
                    <details className="mt-5 rounded-md border border-line bg-surface-2 p-3">
                        <summary className="cursor-pointer text-sm font-medium text-fg-2">{s.details}</summary>
                        <code className="mt-2 block select-text whitespace-pre-wrap break-words font-mono text-xs text-danger">
                            {this.state.error?.name}: {this.state.error?.message}
                        </code>
                    </details>
                    <button
                        type="button"
                        onClick={this.handleReset}
                        autoFocus
                        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-primary font-medium text-on-primary hover:bg-primary-hover"
                    >
                        <RefreshCw size={18} aria-hidden="true" />
                        {s.reload}
                    </button>
                </div>
            </main>
        );
    }
}
