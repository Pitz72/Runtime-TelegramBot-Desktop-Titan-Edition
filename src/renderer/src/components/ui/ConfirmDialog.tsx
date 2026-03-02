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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl"
                    >
                        {/* Header scarico */}
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                </div>
                                <h2 className="text-lg font-semibold text-white">{title}</h2>
                            </div>
                            <button
                                onClick={onCancel}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-6 py-6">
                            <p className="text-gray-300 whitespace-pre-wrap">{message}</p>
                        </div>

                        <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-end gap-3">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
