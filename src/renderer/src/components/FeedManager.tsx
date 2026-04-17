import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Rss, FileText, Globe, Play, Edit2, Zap, Loader2, Filter, Clock } from 'lucide-react';
import { FeedConfig } from '../../../shared/types';
import { useToast } from './ui/Toast';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useTranslation } from '../locales/I18nContext';

interface Props {
    botId: number;
}

// --- F4: keyword filter helpers ---

function buildKeywordFilter(include: string, exclude: string): string | null {
    const inc = include.split(',').map(s => s.trim()).filter(Boolean);
    const exc = exclude.split(',').map(s => s.trim()).filter(Boolean);
    if (inc.length === 0 && exc.length === 0) return null;
    return JSON.stringify({ include: inc, exclude: exc });
}

function parseKeywordFilter(raw: string | null): { include: string; exclude: string } {
    if (!raw) return { include: '', exclude: '' };
    try {
        const { include = [], exclude = [] } = JSON.parse(raw) as { include?: string[]; exclude?: string[] };
        return { include: include.join(', '), exclude: exclude.join(', ') };
    } catch {
        return { include: '', exclude: '' };
    }
}

// --- F5: interval presets ---

const INTERVAL_PRESETS = [null, 5, 15, 30, 60, 120, 240, 480, 1440] as const;

export function FeedManager({ botId }: Props) {
    const { t } = useTranslation();
    const [feeds, setFeeds] = useState<FeedConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingFeed, setEditingFeed] = useState<FeedConfig | null>(null);
    const [newFeed, setNewFeed] = useState({ name: '', url: '', type: 'podcast' as 'podcast' | 'news' | 'youtube', filterInclude: '', filterExclude: '' });
    const [testing, setTesting] = useState<number | 'new' | null>(null);
    const [testResult, setTestResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);

    // F4 state
    const [newFilterInclude, setNewFilterInclude] = useState('');
    const [newFilterExclude, setNewFilterExclude] = useState('');
    const [editFilterInclude, setEditFilterInclude] = useState('');
    const [editFilterExclude, setEditFilterExclude] = useState('');

    // F5 state
    const [newCheckInterval, setNewCheckInterval] = useState<number | null>(null);
    const [editCheckInterval, setEditCheckInterval] = useState<number | null>(null);

    const { toast } = useToast();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [feedToDelete, setFeedToDelete] = useState<number | null>(null);

    useEffect(() => {
        if (botId) loadFeeds();
    }, [botId]);

    const loadFeeds = async () => {
        setLoading(true);
        const loaded = await window.api.getFeeds(botId);
        setFeeds(loaded);
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!newFeed.name || !newFeed.url) return;
        const keywordFilter = buildKeywordFilter(newFilterInclude, newFilterExclude);
        await window.api.addFeed({ ...newFeed, botId, keywordFilter, checkInterval: newCheckInterval });
        setIsAdding(false);
        setNewFeed({ name: '', url: '', type: 'podcast' });
        setNewFilterInclude('');
        setNewFilterExclude('');
        setNewCheckInterval(null);
        setTestResult(null);
        toast(t('feedManager.successAdd') as string, 'success');
        loadFeeds();
    };

    const handleUpdate = async () => {
        if (!editingFeed || !editingFeed.name || !editingFeed.url) return;
        const keywordFilter = buildKeywordFilter(editFilterInclude, editFilterExclude);
        await window.api.updateFeed({
            id: editingFeed.id,
            name: editingFeed.name,
            url: editingFeed.url,
            type: editingFeed.type,
            keywordFilter,
            checkInterval: editCheckInterval,
        });
        setEditingFeed(null);
        setEditFilterInclude('');
        setEditFilterExclude('');
        setEditCheckInterval(null);
        setTestResult(null);
        toast(t('feedManager.successUpdate') as string, 'success');
        loadFeeds();
    };

    const startEdit = (feed: FeedConfig) => {
        setEditingFeed({ ...feed });
        const parsed = parseKeywordFilter(feed.keyword_filter);
        setEditFilterInclude(parsed.include);
        setEditFilterExclude(parsed.exclude);
        setEditCheckInterval(feed.check_interval ?? null);
        setIsAdding(false);
        setTestResult(null);
    };

    const handleDelete = (id: number) => {
        setFeedToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (feedToDelete) {
            await window.api.deleteFeed(feedToDelete);
            toast(t('feedManager.successDelete') as string, 'success');
            loadFeeds();
        }
        setDeleteConfirmOpen(false);
        setFeedToDelete(null);
    };

    const toggleFeed = async (id: number, current: boolean) => {
        await window.api.toggleFeed(id, !current);
        loadFeeds();
    };

    const handleTestFeed = async (url: string, feedId: number | 'new') => {
        if (!url.trim()) return;
        setTesting(feedId);
        setTestResult(null);
        try {
            const result = await window.api.testFeed({
                url,
                type: (editingFeed ? editingFeed.type : newFeed.type)
            });
            setTestResult(result);
        } catch {
            setTestResult({ success: false, error: t('feedManager.testErrorFallback') as string });
        } finally {
            setTesting(null);
        }
    };

    const typeConfig = {
        podcast: { icon: Rss, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        youtube: { icon: Play, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        news: { icon: FileText, color: 'text-titan-400', bg: 'bg-titan-500/10', border: 'border-titan-500/20' },
    };

    const intervalLabel = (v: number | null) => {
        if (v === null) return t('feedManager.intervalDefault') as string;
        if (v < 60) return `${v} min`;
        return `${v / 60}h`;
    };

    return (
        <div className="flex-1 bg-dark-900/30 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-titan-500/10 flex justify-between items-center bg-dark-900/50">
                <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">{t('feedManager.title')}</h2>
                    <p className="text-[10px] text-titan-500/30 tracking-wider">{t('feedManager.subtitle')}</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setEditingFeed(null); setTestResult(null); }}
                    className="bg-titan-500/15 hover:bg-titan-500/25 text-titan-400 px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all border border-titan-500/20 hover:border-titan-500/40"
                >
                    <Plus size={14} />
                    {t('feedManager.addSource')}
                </button>
            </div>

            {/* Scrollable Feed List */}
            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                {(isAdding || editingFeed) && (
                    <div className="bg-dark-950 border border-titan-500/20 rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-top-2 shadow-2xl shadow-black/50">
                        {/* Name + Type */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-[10px] text-titan-500/40 mb-1 uppercase tracking-wider font-bold">{t('feedManager.sourceName')}</label>
                                <input
                                    type="text"
                                    className="w-full bg-dark-900 border border-titan-500/10 rounded-lg p-2 text-white text-sm focus:border-titan-500/40 outline-none"
                                    placeholder={t('feedManager.namePlaceholder') as string}
                                    value={editingFeed ? editingFeed.name : newFeed.name}
                                    onChange={e => editingFeed
                                        ? setEditingFeed({ ...editingFeed, name: e.target.value })
                                        : setNewFeed({ ...newFeed, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-titan-500/40 mb-1 uppercase tracking-wider font-bold">{t('feedManager.sourceType')}</label>
                                <select
                                    className="w-full bg-dark-900 border border-titan-500/10 rounded-lg p-2 text-white text-sm focus:border-titan-500/40 outline-none appearance-none"
                                    value={editingFeed ? editingFeed.type : newFeed.type}
                                    onChange={e => editingFeed
                                        ? setEditingFeed({ ...editingFeed, type: e.target.value as any })
                                        : setNewFeed({ ...newFeed, type: e.target.value as any })}
                                >
                                    <option value="podcast">{t('feedManager.typePodcast')}</option>
                                    <option value="news">{t('feedManager.typeNews')}</option>
                                    <option value="youtube">{t('feedManager.typeYoutube')}</option>
                                </select>
                            </div>
                        </div>

                        {/* URL + Test */}
                        <div className="mb-3">
                            <label className="block text-[10px] text-titan-500/40 mb-1 uppercase tracking-wider font-bold">{t('feedManager.feedUrl')}</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-dark-900 border border-titan-500/10 rounded-lg p-2 text-white text-sm font-mono focus:border-titan-500/40 outline-none"
                                    placeholder="https://..."
                                    value={editingFeed ? editingFeed.url : newFeed.url}
                                    onChange={e => editingFeed
                                        ? setEditingFeed({ ...editingFeed, url: e.target.value })
                                        : setNewFeed({ ...newFeed, url: e.target.value })}
                                />
                                <button
                                    onClick={() => handleTestFeed(
                                        editingFeed ? editingFeed.url : newFeed.url,
                                        editingFeed ? editingFeed.id : 'new'
                                    )}
                                    disabled={testing !== null}
                                    className="bg-titan-500/10 hover:bg-titan-500/20 text-titan-400 px-3 rounded-lg text-xs font-bold transition-all border border-titan-500/20 flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                                    title={t('feedManager.testTitle') as string}
                                >
                                    {testing !== null ? (
                                        <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                        <Zap size={13} />
                                    )}
                                    {t('feedManager.testBtn')}
                                </button>
                            </div>
                            {testResult && (
                                <div className={`mt-2 text-[11px] px-3 py-1.5 rounded-lg border ${testResult.success
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}>
                                    {testResult.success
                                        ? (t('feedManager.testSuccess') as string).replace('%d', testResult.count?.toString() || '0')
                                        : (t('feedManager.testError') as string).replace('%s', testResult.error || '')
                                    }
                                </div>
                            )}
                        </div>

                        {/* F5: Check Interval */}
                        <div className="mb-3">
                            <label className="block text-[10px] text-titan-500/40 mb-1 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                <Clock size={10} />
                                {t('feedManager.intervalLabel')}
                            </label>
                            <select
                                className="w-full bg-dark-900 border border-titan-500/10 rounded-lg p-2 text-white text-sm focus:border-titan-500/40 outline-none appearance-none"
                                value={editingFeed ? (editCheckInterval ?? '') : (newCheckInterval ?? '')}
                                onChange={e => {
                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                    editingFeed ? setEditCheckInterval(val) : setNewCheckInterval(val);
                                }}
                            >
                                {INTERVAL_PRESETS.map(v => (
                                    <option key={v ?? 'default'} value={v ?? ''}>
                                        {intervalLabel(v)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* F4: Keyword Filter */}
                        <div className="mb-4">
                            <label className="block text-[10px] text-titan-500/40 mb-1 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                <Filter size={10} />
                                {t('feedManager.filterLabel')}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[9px] text-green-500/50 mb-1 uppercase tracking-wider">{t('feedManager.filterInclude')}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-dark-900 border border-green-500/20 rounded-lg p-2 text-white text-xs focus:border-green-500/50 outline-none"
                                        placeholder={t('feedManager.filterPlaceholder') as string}
                                        value={editingFeed ? editFilterInclude : newFilterInclude}
                                        onChange={e => editingFeed ? setEditFilterInclude(e.target.value) : setNewFilterInclude(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] text-red-500/50 mb-1 uppercase tracking-wider">{t('feedManager.filterExclude')}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-dark-900 border border-red-500/20 rounded-lg p-2 text-white text-xs focus:border-red-500/50 outline-none"
                                        placeholder={t('feedManager.filterPlaceholder') as string}
                                        value={editingFeed ? editFilterExclude : newFilterExclude}
                                        onChange={e => editingFeed ? setEditFilterExclude(e.target.value) : setNewFilterExclude(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingFeed(null);
                                    setTestResult(null);
                                    setNewFilterInclude('');
                                    setNewFilterExclude('');
                                    setEditFilterInclude('');
                                    setEditFilterExclude('');
                                    setNewCheckInterval(null);
                                    setEditCheckInterval(null);
                                }}
                                className="text-neutral-500 text-xs hover:text-white px-3 py-1.5 transition-colors"
                            >
                                {t('botModal.cancel')}
                            </button>
                            <button
                                onClick={editingFeed ? handleUpdate : handleAdd}
                                className="bg-titan-500/15 text-titan-400 hover:bg-titan-500/25 border border-titan-500/20 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                            >
                                {editingFeed ? t('feedManager.updateFeed') : t('feedManager.saveFeed')}
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {feeds.map(feed => {
                        const cfg = typeConfig[feed.type] || typeConfig.news;
                        const Icon = cfg.icon;
                        const isEditing = editingFeed?.id === feed.id;
                        const hasFilter = !!feed.keyword_filter;
                        const hasCustomInterval = feed.check_interval !== null && feed.check_interval !== undefined;
                        return (
                            <div key={feed.id} className={`group bg-white/[0.01] border ${isEditing ? 'border-titan-500/40 bg-titan-500/5' : 'border-titan-500/5'} rounded-xl p-3 flex items-center gap-3 hover:border-titan-500/15 transition-all`}>
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg} ${cfg.color} flex-shrink-0`}>
                                    <Icon size={18} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-white text-sm truncate">{feed.name}</h3>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${cfg.border} ${cfg.color} flex-shrink-0`}>
                                            {feed.type.toUpperCase()}
                                        </span>
                                        {hasFilter && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30 text-amber-400 flex-shrink-0 flex items-center gap-0.5">
                                                <Filter size={8} />
                                                {t('feedManager.filterActive')}
                                            </span>
                                        )}
                                        {hasCustomInterval && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-400 flex-shrink-0 flex items-center gap-0.5">
                                                <Clock size={8} />
                                                {intervalLabel(feed.check_interval)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 mt-0.5 truncate font-mono">
                                        <Globe size={9} />
                                        {feed.url}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(feed)} className="p-1.5 text-neutral-700 hover:text-titan-400 transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(feed.id)} className="p-1.5 text-neutral-700 hover:text-red-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer ml-1">
                                        <input type="checkbox" className="sr-only peer" checked={!!feed.is_active} onChange={() => toggleFeed(feed.id, !!feed.is_active)} />
                                        <div className="w-8 h-4 bg-dark-950 peer-focus:outline-none border border-titan-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-neutral-600 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-titan-500/20 peer-checked:after:bg-titan-500"></div>
                                    </label>
                                </div>
                            </div>
                        );
                    })}

                    {feeds.length === 0 && !loading && (
                        <div className="text-center py-12 text-neutral-700">
                            <Rss size={40} className="mx-auto mb-3 opacity-10" />
                            <p className="text-sm">{t('feedManager.noFeeds')}</p>
                            <p className="text-xs text-neutral-800">{t('feedManager.addPrompt')}</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                title={t('feedManager.deleteTitle') as string}
                message={t('feedManager.deletePrompt') as string}
                confirmText={t('feedManager.deleteConfirm') as string}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setDeleteConfirmOpen(false);
                    setFeedToDelete(null);
                }}
            />
        </div>
    );
}
