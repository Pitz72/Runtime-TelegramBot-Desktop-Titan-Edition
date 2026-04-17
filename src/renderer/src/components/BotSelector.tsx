import React, { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal, Hash, Check, Trash, FileArrowDown } from '@phosphor-icons/react';
import { BotConfig } from '../../../shared/types';
import { useToast } from './ui/Toast';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useTranslation } from '../locales/I18nContext';
import { cn } from '@/lib/utils';

interface Props {
    onSelect: (bot: BotConfig) => void;
    currentBotId?: number;
    onEdit?: () => void;
}

export function BotSelector({ onSelect, currentBotId, onEdit }: Props) {
    const { t } = useTranslation();
    const [bots, setBots] = useState<BotConfig[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newBot, setNewBot] = useState({
        name: '',
        token: '',
        channel_id: '',
        startDate: new Date().toISOString().split('T')[0]
    });

    const { toast } = useToast();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [botToDelete, setBotToDelete] = useState<number | null>(null);

    useEffect(() => { loadBots(); }, []);

    const loadBots = async () => {
        const loadedBots = await window.api.getBots();
        setBots(loadedBots);
        if (loadedBots.length > 0 && !currentBotId) {
            onSelect(loadedBots[0]);
        }
    };

    const handleCreate = async () => {
        if (!newBot.name || !newBot.token || !newBot.channel_id) return;
        const id = await window.api.createBot({
            name: newBot.name,
            token: newBot.token,
            channelId: newBot.channel_id,
            startDate: newBot.startDate
        });
        setIsCreating(false);
        setNewBot({ name: '', token: '', channel_id: '', startDate: new Date().toISOString().split('T')[0] });
        await loadBots();
        const updatedBots = await window.api.getBots();
        const created = updatedBots.find((b: BotConfig) => b.id === id);
        if (created) {
            toast(t('botSelector.successCreate') as string, 'success');
            onSelect(created);
        }
    };

    const handleImport = async () => {
        try {
            const res = await window.api.importSingleBot();
            if (res.success && res.botId) {
                toast(t('botSelector.successImport') as string, 'success');
                await loadBots();
                const updatedBots = await window.api.getBots();
                const imported = updatedBots.find((b: BotConfig) => b.id === res.botId);
                if (imported) onSelect(imported);
            } else if (!res.success && res.error) {
                toast(`${t('botSelector.errorImport')} ${res.error}`, 'error');
            }
        } catch (e: any) {
            toast(`${t('botSelector.errorImport')} ${e.message || String(e)}`, 'error');
        }
    };

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setBotToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (botToDelete) {
            await window.api.deleteBot(botToDelete);
            toast(t('botSelector.successDelete') as string, 'success');
            await loadBots();
        }
        setDeleteConfirmOpen(false);
        setBotToDelete(null);
    };

    return (
        <div className="w-72 bg-surface-container-low border-r border-outline-variant/15 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-lowest/60">
                <span className="text-micro text-outline-variant/60">{t('botSelector.title')}</span>
                <div className="flex bg-surface-container-lowest rounded border border-outline-variant/10 p-0.5">
                    <button
                        onClick={onEdit}
                        disabled={!currentBotId}
                        className="p-1.5 rounded-sm hover:bg-primary/10 text-outline-variant hover:text-primary transition-all disabled:opacity-25 disabled:hover:bg-transparent"
                        title={t('botModal.editTitle') || 'Modifica Bot'}
                    >
                        <SlidersHorizontal size={13} weight="bold" />
                    </button>
                    <div className="w-px bg-outline-variant/15 mx-0.5 h-5 self-center" />
                    <button
                        onClick={handleImport}
                        className="p-1.5 rounded-sm hover:bg-primary/10 text-outline-variant hover:text-primary transition-all"
                        title={t('botSelector.importTitle') as string}
                    >
                        <FileArrowDown size={13} weight="duotone" />
                    </button>
                    {/* Gradient-border new bot button */}
                    <div className="gradient-border-btn ml-0.5">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-2 py-1.5 flex items-center gap-1 text-nano font-bold text-on-surface"
                            title={t('botSelector.newBot')}
                        >
                            <Plus size={12} weight="bold" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto">
                {isCreating && (
                    <div className="p-3 m-3 bg-surface-container rounded-lg ghost-border animate-in fade-in slide-in-from-top-2 shadow-xl">
                        <input
                            type="text"
                            placeholder={t('botModal.namePlaceholder')}
                            className="w-full bg-surface-container-lowest text-sm text-on-surface mb-2 p-2 rounded border border-outline-variant/20 focus:border-primary/50 outline-none transition-colors"
                            value={newBot.name}
                            onChange={e => setNewBot({ ...newBot, name: e.target.value })}
                            autoFocus
                        />
                        <input
                            type="password"
                            placeholder={t('botModal.tokenPlaceholder')}
                            className="w-full bg-surface-container-lowest text-xs text-on-surface-variant mb-2 p-2 rounded border border-outline-variant/20 focus:border-primary/50 outline-none font-mono transition-colors"
                            value={newBot.token}
                            onChange={e => setNewBot({ ...newBot, token: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder={t('botModal.channelPlaceholder')}
                            className="w-full bg-surface-container-lowest text-xs text-on-surface-variant mb-3 p-2 rounded border border-outline-variant/20 focus:border-primary/50 outline-none font-mono transition-colors"
                            value={newBot.channel_id}
                            onChange={e => setNewBot({ ...newBot, channel_id: e.target.value })}
                        />
                        <div className="mb-4">
                            <label className="input-label">{t('botModal.startDateLabel')}</label>
                            <input
                                type="date"
                                className="w-full bg-surface-container-lowest text-xs text-primary p-2 rounded border border-outline-variant/20 focus:border-primary/50 outline-none [color-scheme:dark] transition-colors"
                                value={newBot.startDate}
                                onChange={e => setNewBot({ ...newBot, startDate: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreate}
                                className="flex-1 bg-primary/15 hover:bg-primary/25 text-primary text-xs py-1.5 rounded border border-primary/25 transition-all"
                            >
                                {t('botModal.save')}
                            </button>
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs py-1.5 rounded transition-all"
                            >
                                {t('botModal.cancel')}
                            </button>
                        </div>
                    </div>
                )}

                {bots.map(bot => (
                    <div
                        key={bot.id}
                        onClick={() => onSelect(bot)}
                        className={cn(
                            "group p-3 cursor-pointer transition-all relative nav-item",
                            currentBotId === bot.id ? "nav-item-active" : ""
                        )}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    {/* Status dot */}
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-px transition-all",
                                        bot.is_active
                                            ? "bg-secondary status-dot-active"
                                            : "bg-outline-variant/40"
                                    )} />
                                    <h3 className={cn(
                                        "font-body font-semibold text-sm truncate transition-colors",
                                        currentBotId === bot.id
                                            ? "text-secondary"
                                            : bot.is_active
                                            ? "text-on-surface-variant"
                                            : "text-outline-variant/50"
                                    )}>{bot.name}</h3>
                                </div>
                                <div className="flex flex-col gap-0.5 mt-1 pl-3">
                                    <p className={cn(
                                        "text-nano font-mono flex items-center gap-1 truncate",
                                        bot.is_active ? "text-outline-variant/60" : "text-outline-variant/30"
                                    )}>
                                        <Hash size={9} weight="bold" />
                                        {bot.channel_id}
                                    </p>
                                    <p className="text-nano text-primary/25">
                                        From: {bot.start_date.split('T')[0]}
                                    </p>
                                </div>
                            </div>
                            {currentBotId === bot.id && (
                                <Check size={14} weight="bold" className="text-secondary flex-shrink-0 drop-glow-secondary" />
                            )}
                            <button
                                onClick={(e) => handleDelete(e, bot.id)}
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 hover:text-error text-outline-variant/40 transition-all"
                            >
                                <Trash size={13} weight="duotone" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                title={t('botModal.deleteTitle')}
                message={t('botModal.deletePrompt')}
                confirmText={t('botModal.confirmDelete')}
                onConfirm={confirmDelete}
                onCancel={() => { setDeleteConfirmOpen(false); setBotToDelete(null); }}
            />
        </div>
    );
}
