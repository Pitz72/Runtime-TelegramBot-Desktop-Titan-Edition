import React from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { useTranslation } from '../locales/I18nContext';
import { notesFor } from '../lib/releaseNotes';

interface Props {
    version: string;
    onClose: () => void;
}

/** Novità della versione, al primo avvio dopo un aggiornamento automatico. */
export function WhatsNewModal({ version, onClose }: Props) {
    const { locale, t } = useTranslation();
    const highlights = notesFor(version, locale);

    return (
        <Dialog
            open
            onClose={onClose}
            icon={Sparkles}
            title={t('whatsNew.title')}
            description={t('whatsNew.subtitle').replace('{{version}}', version)}
            size="md"
            footer={<Button variant="primary" iconRight={ArrowRight} onClick={onClose} data-autofocus>{t('whatsNew.cta')}</Button>}
        >
            {highlights ? (
                <ul className="space-y-3">
                    {highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-3 rounded-md border border-line bg-surface-2 p-3.5">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-4 text-accent" aria-hidden="true">
                                <Check size={14} />
                            </span>
                            <span className="text-base text-fg-2">{h}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-base text-fg-2">{t('whatsNew.fallback')}</p>
            )}
        </Dialog>
    );
}
