import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/locales/I18nContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: string;
    title?: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType, title?: string) => void;
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const STYLE = {
    success: { icon: CheckCircle2, color: 'text-success', bar: 'bg-success' },
    error: { icon: AlertCircle, color: 'text-danger', bar: 'bg-danger' },
    warning: { icon: AlertTriangle, color: 'text-warning', bar: 'bg-warning' },
    info: { icon: Info, color: 'text-accent', bar: 'bg-accent' },
};

/**
 * Tempi di lettura: gli errori restano il doppio. Il conto alla rovescia si ferma finché
 * il puntatore o il focus sono sulla notifica (WCAG 2.2.1, tempi regolabili).
 */
const DURATION: Record<ToastType, number> = { success: 6000, info: 6000, warning: 9000, error: 12000 };

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: (id: string) => void }) {
    const { t } = useTranslation();
    const s = STYLE[toast.type];
    const Icon = s.icon;
    const [paused, setPaused] = useState(false);
    const remaining = useRef(DURATION[toast.type]);
    const startedAt = useRef(Date.now());

    useEffect(() => {
        if (paused) return;
        startedAt.current = Date.now();
        const timer = setTimeout(() => onClose(toast.id), remaining.current);
        return () => {
            clearTimeout(timer);
            remaining.current -= Date.now() - startedAt.current;
        };
    }, [paused, toast.id, onClose]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
            transition={{ duration: 0.2 }}
            // Gli errori interrompono il lettore di schermo; il resto aspetta il suo turno.
            role={toast.type === 'error' ? 'alert' : 'status'}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className="pointer-events-auto relative flex w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-line bg-surface-2 shadow-overlay"
        >
            <span className={cn('w-1 shrink-0', s.bar)} aria-hidden="true" />
            <div className="flex min-w-0 flex-1 items-start gap-3 py-3 pl-3 pr-11">
                <Icon size={18} className={cn('mt-0.5 shrink-0', s.color)} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                    {toast.title && <p className={cn('text-base font-semibold', s.color)}>{toast.title}</p>}
                    <p className="whitespace-pre-wrap break-words text-sm text-fg-2">{toast.message}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={() => onClose(toast.id)}
                aria-label={t('common.dismissNotification')}
                title={t('common.dismissNotification')}
                className="absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded text-fg-3 hover:bg-surface-3 hover:text-fg"
            >
                <X size={15} aria-hidden="true" />
            </button>
        </motion.div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
        const id = Math.random().toString(36).slice(2, 9);
        // Al massimo quattro alla volta: oltre, le più vecchie lasciano il posto.
        setToasts(prev => [...prev.slice(-3), { id, message, type, title }]);
    }, []);

    const value = React.useMemo<ToastContextType>(() => ({
        toast: addToast,
        success: (msg, title) => addToast(msg, 'success', title),
        error: (msg, title) => addToast(msg, 'error', title),
    }), [addToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Fuori da #root: quando una finestra di dialogo rende inerte l'app, le
                notifiche devono restare annunciate e chiudibili. */}
            {createPortal(
                <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2" aria-live="polite">
                    <AnimatePresence initial={false}>
                        {toasts.map(t => <ToastItem key={t.id} toast={t} onClose={removeToast} />)}
                    </AnimatePresence>
                </div>,
                document.body,
            )}
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
