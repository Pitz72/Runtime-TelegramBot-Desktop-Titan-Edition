import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Rss, FileText, Globe, Play,
    Pencil, Zap, Loader2, Filter, Clock,
    Upload, BookOpen
} from 'lucide-react';
import { FeedConfig } from '../../../shared/types';
import { useToast } from './ui/Toast';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useTranslation } from '../locales/I18nContext';

interface Props { botId: number; }

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
    } catch { return { include: '', exclude: '' }; }
}

const INTERVAL_PRESETS = [null, 5, 15, 30, 60, 120, 240, 480, 1440] as const;

export function FeedManager({ botId }: Props) {
    const { t } = useTranslation();
    const [feeds, setFeeds] = useState<FeedConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingFeed, setEditingFeed] = useState<FeedConfig | null>(null);
    const [newFeed, setNewFeed] = useState({ name: '', url: '', type: 'podcast' as 'podcast' | 'news' | 'youtube' });
    const [testing, setTesting] = useState<number | 'new' | null>(null);
    const [testResult, setTestResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);
    const [newFilterInclude, setNewFilterInclude] = useState('');
    const [newFilterExclude, setNewFilterExclude] = useState('');
    const [editFilterInclude, setEditFilterInclude] = useState('');
    const [editFilterExclude, setEditFilterExclude] = useState('');
    const [newCheckInterval, setNewCheckInterval] = useState<number | null>(null);
    const [editCheckInterval, setEditCheckInterval] = useState<number | null>(null);
    const [newDigestInterval, setNewDigestInterval] = useState<number | null>(null);
    const [editDigestInterval, setEditDigestInterval] = useState<number | null>(null);
    const [importingOpml, setImportingOpml] = useState(false);
    const { toast } = useToast();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [feedToDelete, setFeedToDelete] = useState<number | null>(null);

    useEffect(() => { if (botId) loadFeeds(); }, [botId]);

    const loadFeeds = async () => {
        setLoading(true);
        const loaded = await window.api.getFeeds(botId);
        setFeeds(loaded);
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!newFeed.name || !newFeed.url) return;
        const keywordFilter = buildKeywordFilter(newFilterInclude, newFilterExclude);
        await window.api.addFeed({ ...newFeed, botId, keywordFilter, checkInterval: newCheckInterval, digestInterval: newDigestInterval });
        setIsAdding(false);
        setNewFeed({ name: '', url: '', type: 'podcast' });
        setNewFilterInclude(''); setNewFilterExclude('');
        setNewCheckInterval(null); setNewDigestInterval(null); setTestResult(null);
        toast(t('feedManager.successAdd') as string, 'success');
        loadFeeds();
    };

    const handleImportOpml = async () => {
        setImportingOpml(true);
        try {
            const res = await window.api.importOpml(botId);
            if (res.success && res.count > 0) {
                toast((t('feedManager.opmlSuccess') as string).replace('%d', String(res.count)), 'success');
                loadFeeds();
            } else if (res.success && res.count === 0) {
                toast(t('feedManager.opmlEmpty') as string, 'info');
            } else if (res.error) {
                toast(`${t('feedManager.opmlError') as string} ${res.error}`, 'error');
            }
        } catch {
            toast(t('feedManager.opmlError') as string, 'error');
        } finally {
            setImportingOpml(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingFeed || !editingFeed.name || !editingFeed.url) return;
        const keywordFilter = buildKeywordFilter(editFilterInclude, editFilterExclude);
        await window.api.updateFeed({ id: editingFeed.id, name: editingFeed.name, url: editingFeed.url, type: editingFeed.type, keywordFilter, checkInterval: editCheckInterval, digestInterval: editDigestInterval });
        setEditingFeed(null);
        setEditFilterInclude(''); setEditFilterExclude('');
        setEditCheckInterval(null); setEditDigestInterval(null); setTestResult(null);
        toast(t('feedManager.successUpdate') as string, 'success');
        loadFeeds();
    };

    const startEdit = (feed: FeedConfig) => {
        setEditingFeed({ ...feed });
        const parsed = parseKeywordFilter(feed.keyword_filter);
        setEditFilterInclude(parsed.include); setEditFilterExclude(parsed.exclude);
        setEditCheckInterval(feed.check_interval ?? null);
        setEditDigestInterval(feed.digest_interval ?? null);
        setIsAdding(false); setTestResult(null);
    };

    const handleDelete = (id: number) => { setFeedToDelete(id); setDeleteConfirmOpen(true); };

    const confirmDelete = async () => {
        if (feedToDelete) {
            await window.api.deleteFeed(feedToDelete);
            toast(t('feedManager.successDelete') as string, 'success');
            loadFeeds();
        }
        setDeleteConfirmOpen(false); setFeedToDelete(null);
    };

    const toggleFeed = async (id: number, current: boolean) => {
        await window.api.toggleFeed(id, !current);
        loadFeeds();
    };

    const handleTestFeed = async (url: string, feedId: number | 'new') => {
        if (!url.trim()) return;
        setTesting(feedId); setTestResult(null);
        try {
            const result = await window.api.testFeed({ url, type: (editingFeed ? editingFeed.type : newFeed.type) });
            setTestResult(result);
        } catch {
            setTestResult({ success: false, error: t('feedManager.testErrorFallback') as string });
        } finally {
            setTesting(null);
        }
    };

    const typeConfig = {
        podcast: { icon: Rss,      color: 'text-tertiary',  bg: 'bg-tertiary/10',   border: 'border-tertiary/20' },
        youtube: { icon: Play,     color: 'text-error',     bg: 'bg-error/10',       border: 'border-error/20'    },
        news:    { icon: FileText, color: 'text-primary',   bg: 'bg-primary/10',     border: 'border-primary/20'  },
    };

    const intervalLabel = (v: number | null) => {
        if (v === null) return t('feedManager.intervalDefault') as string;
        if (v < 60) return `${v} min`;
        return `${v / 60}h`;
    };

    const inputCls = "w-full bg-surface-container border border-outline-variant/15 rounded-lg p-2 text-on-surface text-sm focus:border-primary/40 outline-none transition-colors";
    const labelCls = "block text-micro text-outline-variant/50 mb-1.5";

    const cancelForm = () => {
        setIsAdding(false); setEditingFeed(null); setTestResult(null);
        setNewFilterInclude(''); setNewFilterExclude('');
        setEditFilterInclude(''); setEditFilterExclude('');
        setNewCheckInterval(null); setEditCheckInterval(null);
        setNewDigestInterval(null); setEditDigestInterval(null);
    };

    return (
        <div className="flex-1 bg-surface-container-lowest flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
                <div>
                    <h2 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wide">{t('feedManager.title')}</h2>
                    <p className="text-nano text-outline-variant/40 mt-0.5">{t('feedManager.subtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleImportOpml}
                        disabled={importingOpml}
                        className="ghost-border bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-lg text-nano font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                        title={t('feedManager.importOpml') as string}
                    >
                        {importingOpml
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Upload size={12} />
                        }
                        OPML
                    </button>
                    <button
                        onClick={() => { setIsAdding(true); setEditingFeed(null); setTestResult(null); }}
                        className="gradient-border-btn"
                    >
                        <div className="px-3 py-1.5 flex items-center gap-1.5 text-nano font-bold text-on-surface rounded-sm">
                            <Plus size={13} />
                            {t('feedManager.addSource')}
                        </div>
                    </button>
                </div>
            </div>

            {/* Scrollable list */}
            <div className="p-4 overflow-y-auto flex-1">
                {(isAdding || editingFeed) && (
                    <div className="glass-panel rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-top-2">
                        {/* Name + Type */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className={labelCls}>{t('feedManager.sourceName')}</label>
                                <input type="text" className={inputCls}
                                    placeholder={t('feedManager.namePlaceholder') as string}
                                    value={editingFeed ? editingFeed.name : newFeed.name}
                                    onChange={e => editingFeed ? setEditingFeed({ ...editingFeed, name: e.target.value }) : setNewFeed({ ...newFeed, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>{t('feedManager.sourceType')}</label>
                                <select className={inputCls + " appearance-none"}
                                    value={editingFeed ? editingFeed.type : newFeed.type}
                                    onChange={e => editingFeed ? setEditingFeed({ ...editingFeed, type: e.target.value as any }) : setNewFeed({ ...newFeed, type: e.target.value as any })}
                                >
                                    <option value="podcast">{t('feedManager.typePodcast')}</option>
                                    <option value="news">{t('feedManager.typeNews')}</option>
                                    <option value="youtube">{t('feedManager.typeYoutube')}</option>
                                </select>
                            </div>
                        </div>

                        {/* URL + Test */}
                        <div className="mb-3">
                            <label className={labelCls}>{t('feedManager.feedUrl')}</label>
                            <div className="flex gap-2">
                                <input type="text" className={inputCls + " font-mono flex-1"}
                                    placeholder="https://..."
                                    value={editingFeed ? editingFeed.url : newFeed.url}
                                    onChange={e => editingFeed ? setEditingFeed({ ...editingFeed, url: e.target.value }) : setNewFeed({ ...newFeed, url: e.target.value })}
                                />
                                <button
                                    onClick={() => handleTestFeed(editingFeed ? editingFeed.url : newFeed.url, editingFeed ? editingFeed.id : 'new')}
                                    disabled={testing !== null}
                                    className="bg-primary/10 hover:bg-primary/20 text-primary px-3 rounded-lg text-xs font-bold transition-all border border-primary/20 flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                                    title={t('feedManager.testTitle') as string}
                                >
                                    {testing !== null ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                                    {t('feedManager.testBtn')}
                                </button>
                            </div>
                            {testResult && (
                                <div className={`mt-2 text-nano px-3 py-1.5 rounded-lg border ${
                                    testResult.success ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-error/10 border-error/20 text-error'
                                }`}>
                                    {testResult.success
                                        ? (t('feedManager.testSuccess') as string).replace('%d', testResult.count?.toString() || '0')
                                        : (t('feedManager.testError') as string).replace('%s', testResult.error || '')
                                    }
                                </div>
                            )}
                        </div>

                        {/* Interval */}
                        <div className="mb-3">
                            <label className={labelCls + " flex items-center gap-1.5"}>
                                <Clock size={10} />
                                {t('feedManager.intervalLabel')}
                            </label>
                            <select className={inputCls + " appearance-none"}
                                value={editingFeed ? (editCheckInterval ?? '') : (newCheckInterval ?? '')}
                                onChange={e => { const val = e.target.value === '' ? null : Number(e.target.value); editingFeed ? setEditCheckInterval(val) : setNewCheckInterval(val); }}
                            >
                                {INTERVAL_PRESETS.map(v => <option key={v ?? 'default'} value={v ?? ''}>{intervalLabel(v)}</option>)}
                            </select>
                        </div>

                        {/* Keyword Filter */}
                        <div className="mb-3">
                            <label className={labelCls + " flex items-center gap-1.5"}>
                                <Filter size={10} />
                                {t('feedManager.filterLabel')}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-nano text-secondary/50 mb-1 block">{t('feedManager.filterInclude')}</label>
                                    <input type="text" className="w-full bg-surface-container border border-secondary/20 rounded-lg p-2 text-on-surface text-xs focus:border-secondary/50 outline-none transition-colors"
                                        placeholder={t('feedManager.filterPlaceholder') as string}
                                        value={editingFeed ? editFilterInclude : newFilterInclude}
                                        onChange={e => editingFeed ? setEditFilterInclude(e.target.value) : setNewFilterInclude(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-nano text-error/50 mb-1 block">{t('feedManager.filterExclude')}</label>
                                    <input type="text" className="w-full bg-surface-container border border-error/20 rounded-lg p-2 text-on-surface text-xs focus:border-error/50 outline-none transition-colors"
                                        placeholder={t('feedManager.filterPlaceholder') as string}
                                        value={editingFeed ? editFilterExclude : newFilterExclude}
                                        onChange={e => editingFeed ? setEditFilterExclude(e.target.value) : setNewFilterExclude(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Digest Mode */}
                        <div className="mb-4">
                            <label className={labelCls + " flex items-center gap-1.5"}>
                                <BookOpen size={10} />
                                {t('feedManager.digestLabel')}
                            </label>
                            <select className={inputCls + " appearance-none"}
                                value={editingFeed ? (editDigestInterval ?? '') : (newDigestInterval ?? '')}
                                onChange={e => { const val = e.target.value === '' ? null : Number(e.target.value); editingFeed ? setEditDigestInterval(val) : setNewDigestInterval(val); }}
                            >
                                <option value="">{t('feedManager.digestDefault') as string}</option>
                                <option value="60">{t('feedManager.digest60') as string}</option>
                                <option value="360">{t('feedManager.digest360') as string}</option>
                                <option value="720">{t('feedManager.digest720') as string}</option>
                                <option value="1440">{t('feedManager.digest1440') as string}</option>
                                <option value="10080">{t('feedManager.digest10080') as string}</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={cancelForm} className="text-on-surface-variant text-xs hover:text-on-surface px-3 py-1.5 transition-colors">
                                {t('botModal.cancel')}
                            </button>
                            <button
                                onClick={editingFeed ? handleUpdate : handleAdd}
                                className="bg-primary/15 text-primary hover:bg-primary/25 border border-primary/25 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
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
                        const hasDigest = feed.digest_interval !== null && feed.digest_interval !== undefined;

                        return (
                            <div key={feed.id} className={`group ghost-border rounded-xl p-3 flex items-center gap-3 transition-all ${
                                isEditing
                                    ? 'border-primary/30 bg-primary/5'
                                    : 'bg-background/80 hover:bg-surface-container-lowest hover:border-outline-variant/20'
                            }`}>
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${cfg.bg} ${cfg.color} ${cfg.border} flex-shrink-0`}>
                                    <Icon size={16} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <h3 className="font-semibold text-on-surface text-sm truncate">{feed.name}</h3>
                                        <span className={`text-nano px-1.5 py-0.5 rounded border ${cfg.border} ${cfg.color} flex-shrink-0`}>
                                            {feed.type.toUpperCase()}
                                        </span>
                                        {hasFilter && (
                                            <span className="text-nano px-1.5 py-0.5 rounded border border-tertiary/30 text-tertiary flex-shrink-0 flex items-center gap-0.5">
                                                <Filter size={8} />
                                                {t('feedManager.filterActive')}
                                            </span>
                                        )}
                                        {hasCustomInterval && (
                                            <span className="text-nano px-1.5 py-0.5 rounded border border-secondary/30 text-secondary flex-shrink-0 flex items-center gap-0.5">
                                                <Clock size={8} />
                                                {intervalLabel(feed.check_interval)}
                                            </span>
                                        )}
                                        {hasDigest && (
                                            <span className="text-nano px-1.5 py-0.5 rounded border border-tertiary-container/40 text-tertiary-container flex-shrink-0 flex items-center gap-0.5">
                                                <BookOpen size={8} />
                                                {t('feedManager.digestBadge')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-nano text-outline-variant/50 mt-0.5 truncate font-mono">
                                        <Globe size={9} />
                                        {feed.url}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(feed)} className="p-1.5 text-outline-variant/50 hover:text-primary transition-colors rounded">
                                            <Pencil size={13} />
                                        </button>
                                        <button onClick={() => handleDelete(feed.id)} className="p-1.5 text-outline-variant/50 hover:text-error transition-colors rounded">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>

                                    {/* Toggle switch */}
                                    <label className="relative inline-flex items-center cursor-pointer ml-1">
                                        <input type="checkbox" className="sr-only peer" checked={!!feed.is_active} onChange={() => toggleFeed(feed.id, !!feed.is_active)} />
                                        <div className="w-8 h-4 bg-surface-container-lowest peer-focus:outline-none border border-outline-variant/15 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-outline-variant/60 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary/25 peer-checked:border-primary/40 peer-checked:after:bg-primary-container" />
                                    </label>
                                </div>
                            </div>
                        );
                    })}

                    {feeds.length === 0 && !loading && (
                        <div className="text-center py-12 text-outline-variant/30">
                            <Rss size={36} strokeWidth={1} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">{t('feedManager.noFeeds')}</p>
                            <p className="text-nano mt-1">{t('feedManager.addPrompt')}</p>
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
                onCancel={() => { setDeleteConfirmOpen(false); setFeedToDelete(null); }}
            />
        </div>
    );
}
