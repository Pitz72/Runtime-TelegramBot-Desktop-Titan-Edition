import React from 'react';
import { Plus, FileDown, Bot } from 'lucide-react';
import { BotConfig } from '../../../shared/types';
import { Button } from './ui/Button';
import { StatusDot } from './ui/Controls';
import { useTranslation } from '../locales/I18nContext';
import { cn } from '@/lib/utils';

interface Props {
    bots: BotConfig[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onCreate: () => void;
    onImport: () => void;
}

/** Il canale come lo scrive Telegram: @nome, oppure l'ID numerico così com'è. */
export function channelLabel(raw: string): string {
    const id = raw.trim().replace(/^https?:\/\//i, '').replace(/^t\.me\//i, '');
    if (/^-?\d+$/.test(id)) return id;
    return id.startsWith('@') ? id : `@${id}`;
}

/**
 * Elenco dei bot. Ogni voce è un pulsante vero (tastiera, lettore di schermo) e lo stato
 * «attivo/disattivato» è detto a parole, non solo dal colore del pallino.
 * Eliminare un bot sta nelle sue impostazioni: il cestino che compariva solo al passaggio
 * del mouse era invisibile alla tastiera e troppo vicino a un clic sbagliato.
 */
export function BotSidebar({ bots, selectedId, onSelect, onCreate, onImport }: Props) {
    const { t } = useTranslation();

    return (
        <nav aria-labelledby="bots-heading" className="flex w-64 shrink-0 flex-col border-r border-line bg-surface-1">
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
                <h2 id="bots-heading" className="eyebrow">{t('bots.title')}</h2>
                <span className="text-xs text-fg-3 tabular">{bots.length}</span>
            </div>

            <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
                {bots.map(bot => {
                    const selected = bot.id === selectedId;
                    return (
                        <li key={bot.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(bot.id)}
                                aria-current={selected ? 'page' : undefined}
                                className={cn(
                                    'group relative flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                                    selected ? 'bg-surface-4' : 'hover:bg-surface-3',
                                )}
                            >
                                {selected && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" />}
                                <StatusDot tone={bot.is_active ? 'success' : 'neutral'} className="mt-1.5" />
                                <span className="min-w-0 flex-1">
                                    <span className={cn('block truncate text-base font-medium', selected ? 'text-fg' : 'text-fg-2 group-hover:text-fg')}>
                                        {bot.name}
                                    </span>
                                    <span className="block truncate font-mono text-xs text-fg-3">{channelLabel(bot.channel_id)}</span>
                                    {!bot.is_active && <span className="mt-0.5 block text-xs text-fg-3">{t('bots.inactive')}</span>}
                                </span>
                            </button>
                        </li>
                    );
                })}

                {bots.length === 0 && (
                    <li className="px-3 py-8 text-center">
                        <Bot size={28} className="mx-auto mb-2 text-fg-3" aria-hidden="true" />
                        <p className="text-sm text-fg-3">{t('bots.empty')}</p>
                    </li>
                )}
            </ul>

            <div className="space-y-2 border-t border-line p-3">
                <Button variant="primary" icon={Plus} className="w-full" onClick={onCreate}>{t('bots.new')}</Button>
                <Button variant="ghost" icon={FileDown} size="sm" className="w-full" onClick={onImport}>{t('bots.import')}</Button>
            </div>
        </nav>
    );
}
