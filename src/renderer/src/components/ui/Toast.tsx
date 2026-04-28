import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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

const typeConfig = {
    success: {
        icon: CheckCircle2,
        iconColor:   'text-secondary',
        stripeClass: 'toast-stripe-success',
        titleColor:  'text-secondary',
        dropGlow:    'drop-glow-secondary',
    },
    error: {
        icon: AlertCircle,
        iconColor:   'text-error',
        stripeClass: 'toast-stripe-error',
        titleColor:  'text-error',
        dropGlow:    'drop-glow-error',
    },
    warning: {
        icon: AlertTriangle,
        iconColor:   'text-tertiary',
        stripeClass: 'toast-stripe-warning',
        titleColor:  'text-tertiary',
        dropGlow:    '',
    },
    info: {
        icon: Info,
        iconColor:   'text-primary',
        stripeClass: 'toast-stripe-info',
        titleColor:  'text-primary',
        dropGlow:    'drop-glow-primary',
    },
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (message: string, type: ToastType = 'info', title?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, title }]);
        setTimeout(() => removeToast(id), 4500);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider
            value={{
                toast: addToast,
                success: (msg, title) => addToast(msg, 'success', title),
                error: (msg, title) => addToast(msg, 'error', title)
            }}
        >
            {children}

            <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => {
                        const cfg = typeConfig[t.type];
                        const Icon = cfg.icon;
                        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        return (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.18 } }}
                                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                                className="pointer-events-auto w-80 flex overflow-hidden rounded-xl ghost-border glass-panel-elevated relative"
                            >
                                {/* Colored left stripe with glow */}
                                <div className={cn('w-1 flex-shrink-0 self-stretch', cfg.stripeClass)} />

                                <div className="flex items-start gap-3 p-4 flex-1 min-w-0 pr-8">
                                    <Icon
                                        size={20}
                                        className={cn('flex-shrink-0 mt-0.5', cfg.iconColor, cfg.dropGlow)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        {t.title && (
                                            <p className={cn('font-headline text-sm font-bold mb-0.5', cfg.titleColor)}>
                                                {t.title}
                                            </p>
                                        )}
                                        <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                                            {t.message}
                                        </p>
                                        {/* Micro-copy footer — terminal instrumentation */}
                                        <p className="text-nano text-outline-variant/40 mt-2 border-t border-outline-variant/10 pt-1.5">
                                            SYS_NOTIFY · {ts}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeToast(t.id)}
                                    className="absolute top-3 right-3 p-1 rounded text-outline-variant hover:text-on-surface hover:bg-surface-container-highest/60 transition-colors"
                                >
                                    <X size={13} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
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
