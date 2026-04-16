import React, { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal, Hash, Check, Trash2, FileDown } from 'lucide-react';
import { BotConfig } from '../../../shared/types';
import { useToast } from './ui/Toast';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useTranslation } from '../locales/I18nContext';

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

    useEffect(() => {
        loadBots();
    }, []);

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
        setNewBot({
            name: '',
            token: '',
            channel_id: '',
            startDate: new Date().toISOString().split('T')[0]
        });
        await loadBots();
        // Select the newly created bot
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
                // Select the newly imported bot
                const updatedBots = await window.api.getBots();
                const imported = updatedBots.find((b: BotConfig) => b.id === res.botId);
                if (imported) {
                    onSelect(imported);
                }
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
        <div className="w-72 bg-dark-950 border-r border-titan-500/10 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-titan-500/10 flex justify-between items-center bg-dark-900/50">
                <span className="text-[10px] font-bold text-titan-500/50 uppercase tracking-[0.2em]">{t('botSelector.title')}</span>
                <div className="flex bg-dark-950 rounded border border-titan-500/10 p-0.5 shadow-inner">
                    <button
                        onClick={onEdit}
                        disabled={!currentBotId}
                        className="p-1.5 rounded-sm hover:bg-titan-500/10 text-neutral-600 hover:text-titan-400 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-600"
                        title={t('botModal.editTitle') || 'Modifica Bot'}
                    >
                        <SlidersHorizontal size={14} />
                    </button>
                    <div className="w-px bg-titan-500/10 mx-0.5 h-6 self-center"></div>
                    <button
                        onClick={handleImport}
                        className="p-1.5 rounded-sm hover:bg-titan-500/10 text-neutral-600 hover:text-titan-400 transition-all"
                        title={t('botSelector.importTitle') as string}
                    >
                        <FileDown size={14} />
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1.5 rounded-sm hover:bg-titan-500/10 text-neutral-600 hover:text-titan-400 transition-all"
                        title={t('botSelector.newBot')}
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto">
                {isCreating && (
                    <div className="p-3 m-3 bg-dark-900 rounded-lg border border-titan-500/20 animate-in fade-in slide-in-from-top-2">
                        <input
                            type="text"
                            placeholder={t('botModal.namePlaceholder')}
                            className="w-full bg-dark-950 text-sm text-white mb-2 p-2 rounded border border-titan-500/10 focus:border-titan-500/40 outline-none"
                            value={newBot.name}
                            onChange={e => setNewBot({ ...newBot, name: e.target.value })}
                            autoFocus
                        />
                        <input
                            type="password"
                            placeholder={t('botModal.tokenPlaceholder')}
                            className="w-full bg-dark-950 text-xs text-neutral-400 mb-2 p-2 rounded border border-titan-500/10 focus:border-titan-500/40 outline-none font-mono"
                            value={newBot.token}
                            onChange={e => setNewBot({ ...newBot, token: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder={t('botModal.channelPlaceholder')}
                            className="w-full bg-dark-950 text-xs text-neutral-400 mb-3 p-2 rounded border border-titan-500/10 focus:border-titan-500/40 outline-none font-mono"
                            value={newBot.channel_id}
                            onChange={e => setNewBot({ ...newBot, channel_id: e.target.value })}
                        />
                        <div className="mb-4">
                            <label className="text-[10px] text-titan-500/40 uppercase font-bold block mb-1 tracking-wider">{t('botModal.startDateLabel')}</label>
                            <input
                                type="date"
                                className="w-full bg-dark-950 text-xs text-titan-400 p-2 rounded border border-titan-500/10 focus:border-titan-500/40 outline-none [color-scheme:dark]"
                                value={newBot.startDate}
                                onChange={e => setNewBot({ ...newBot, startDate: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreate}
                                className="flex-1 bg-titan-500/15 hover:bg-titan-500/25 text-titan-400 text-xs py-1.5 rounded border border-titan-500/20 transition-all"
                            >
                                {t('botModal.save')}
                            </button>
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-500 text-xs py-1.5 rounded transition-all"
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
                        className={`group p-3 cursor-pointer transition-all relative ${currentBotId === bot.id
                            ? 'bg-titan-500/5 border-l-2 border-titan-500'
                            : 'border-l-2 border-transparent hover:bg-white/[0.02] hover:border-titan-500/30'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                {/* Nome + status dot — F3 indicatori sidebar */}
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-px ${bot.is_active ? 'bg-green-500' : 'bg-neutral-700'}`}
                                        title={bot.is_active ? 'Attivo' : 'Disabilitato'}
                                    />
                                    <h3 className={`font-medium text-sm truncate ${
                                        currentBotId === bot.id ? 'text-titan-300'
                                        : bot.is_active ? 'text-neutral-400'
                                        : 'text-neutral-700'
                                    }`}>{bot.name}</h3>
                                </div>
                                <div className="flex flex-col gap-0.5 mt-1 pl-3">
                                    <p className={`text-[10px] font-mono flex items-center gap-1 truncate ${bot.is_active ? 'text-neutral-700' : 'text-neutral-800'}`}>
                                        <Hash size={9} />
                                        {bot.channel_id}
                                    </p>
                                    <p className="text-[9px] text-titan-500/30 font-bold uppercase tracking-tighter">
                                        From: {bot.start_date.split('T')[0]}
                                    </p>
                                </div>
                            </div>
                            {currentBotId === bot.id && (
                                <Check size={14} className="text-titan-500 flex-shrink-0" />
                            )}
                            <button
                                onClick={(e) => handleDelete(e, bot.id)}
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 text-neutral-700 transition-all"
                            >
                                <Trash2 size={14} />
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
                onCancel={() => {
                    setDeleteConfirmOpen(false);
                    setBotToDelete(null);
                }}
            />
        </div>
    );
}
