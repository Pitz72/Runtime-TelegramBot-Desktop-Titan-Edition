import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title = "Conferma operazione",
    message,
    confirmText = "Conferma",
    cancelText = "Annulla",
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Scrim */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 16, transition: { duration: 0.15 } }}
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="relative w-full max-w-md glass-panel rounded-xl overflow-hidden"
                        style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 15px rgba(255,180,171,0.08)' }}
                    >
                        {/* Header */}
                        <div className="flex items-start gap-4 p-6 border-b border-outline-variant/15">
                            <div className="flex-shrink-0 p-2 rounded-lg bg-error-container/20 text-error">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1 pt-0.5">
                                <h2 className="font-headline font-bold text-lg text-on-surface uppercase tracking-tight">
                                    {title}
                                </h2>
                                <p className="text-micro text-error/70 mt-1">WARN: IRREVERSIBLE_ACTION</p>
                            </div>
                            <button
                                onClick={onCancel}
                                className="p-1 text-outline-variant hover:text-on-surface hover:bg-surface-container-highest/50 rounded transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                                {message}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant/15 bg-surface-container-low/50">
                            <button
                                onClick={onCancel}
                                className="px-5 py-2 rounded text-sm font-body text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/20 transition-all duration-200"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-6 py-2 rounded text-sm font-headline font-bold bg-error text-background hover:bg-error-container hover:text-error drop-glow-error transition-all duration-200 active:scale-95"
                            >
                                {confirmText}
                            </button>
                        </div>

                        {/* Micro-copy decorativo — angolo inferiore sinistro */}
                        <div className="absolute bottom-2 left-4 text-nano text-outline-variant/30 pointer-events-none">
                            SEQ_ID: 0x{Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
