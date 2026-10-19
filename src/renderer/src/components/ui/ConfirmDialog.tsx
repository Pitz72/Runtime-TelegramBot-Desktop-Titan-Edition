import React, { useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { useTranslation } from '@/locales/I18nContext';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    /** Azione distruttiva: pulsante rosso e focus iniziale su «Annulla» */
    destructive?: boolean;
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Conferma di un'azione. È un `alertdialog`: il lettore di schermo legge subito titolo
 * e messaggio. Per le azioni distruttive il focus parte da «Annulla», così un Invio
 * di troppo non cancella niente.
 */
export function ConfirmDialog({ isOpen, title, message, confirmText, cancelText, destructive = true, busy, onConfirm, onCancel }: ConfirmDialogProps) {
    const { t } = useTranslation();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const confirmRef = useRef<HTMLButtonElement>(null);

    return (
        <Dialog
            open={isOpen}
            onClose={onCancel}
            role="alertdialog"
            size="sm"
            icon={AlertTriangle}
            tone={destructive ? 'danger' : 'accent'}
            title={title}
            description={message}
            initialFocusRef={destructive ? cancelRef : confirmRef}
            footer={
                <>
                    <Button ref={cancelRef} variant="ghost" onClick={onCancel}>{cancelText ?? t('common.cancel')}</Button>
                    <Button ref={confirmRef} variant={destructive ? 'danger' : 'primary'} loading={busy} onClick={onConfirm}>{confirmText}</Button>
                </>
            }
        />
    );
}
