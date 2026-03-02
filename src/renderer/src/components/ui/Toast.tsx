import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
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

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (message: string, type: ToastType = 'info', title?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, title }]);

        // Auto remove after 4s
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
            case 'info': return <Info className="w-5 h-5 text-blue-400" />;
        }
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

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto w-80 flex items-start p-4 rounded-xl border border-white/10 bg-[#161b22]/90 backdrop-blur-md shadow-2xl overflow-hidden relative"
                        >
                            {/* Type colored left border */}
                            <div className={cn(
                                "absolute left-0 top-0 bottom-0 w-1",
                                t.type === 'success' && "bg-emerald-500",
                                t.type === 'error' && "bg-red-500",
                                t.type === 'warning' && "bg-amber-500",
                                t.type === 'info' && "bg-blue-500"
                            )} />

                            <div className="flex-shrink-0 mr-3 mt-0.5">
                                {getIcon(t.type)}
                            </div>

                            <div className="flex-1 min-w-0 pr-4">
                                {t.title && <h4 className="text-sm font-semibold text-gray-200">{t.title}</h4>}
                                <p className="text-sm text-gray-400 mt-0.5 whitespace-pre-wrap">{t.message}</p>
                            </div>

                            <button
                                onClick={() => removeToast(t.id)}
                                className="absolute top-3 right-3 p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
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
