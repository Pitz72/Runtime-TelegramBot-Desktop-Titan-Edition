import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Rss, Newspaper, Youtube, Pencil, Filter, Clock, Upload, BookOpen, Search, X, CheckCircle2, AlertCircle, Inbox } from 'lucide-react';
import { FeedConfig } from '../../../shared/types';
import { useToast } from './ui/Toast';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { Button, IconButton } from './ui/Button';
import { Badge, Switch, TextField, type BadgeTone } from './ui/Controls';
import { FeedDialog, parseKeywordFilter, useDurationLabel } from './FeedDialog';
import { useTranslation } from '../locales/I18nContext';
import { errorMessage } from '../lib/errors';
import { cn } from '@/lib/utils';

interface Props {
    botId: number;
    /** false quando la sezione è già nominata da una scheda: il titolo resta solo per i lettori di schermo */
    showTitle?: boolean;
    /** Cambia a ogni giro concluso: l'elenco si rilegge e mostra l'esito delle letture */
    refreshKey?: number;
}

/**
 * L'esito dell'ultima lettura di una sorgente (schema v14). Prima, per sapere che un feed
 * non rispondeva più, bisognava cercarne il nome nel diario.
 */
function FeedStatus({ feed }: { feed: FeedConfig }) {
    const { t, locale } = useTranslation();
    if (!feed.last_checked_at || !feed.last_status) {
        return <p className="mt-1.5 text-sm text-fg-3">{t('feeds.statusNever')}</p>;
    }
    const when = new Date(feed.last_checked_at).toLocaleString(locale === 'it' ? 'it-IT' : 'en-GB', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
    if (feed.last_status === 'ok') {
        return (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-fg-3">
                <CheckCircle2 size={14} className="shrink-0 text-success" aria-hidden="true" />
                {t('feeds.statusOk').replace('{time}', when).replace('{n}', String(feed.last_item_count ?? 0))}
            </p>
        );
    }
    return (
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-danger" title={feed.last_error ?? undefined}>
            <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-2 break-words">{t('feeds.statusError').replace('{time}', when).replace('{error}', feed.last_error ?? '')}</span>
        </p>
    );
}

const TYPE_STYLE: Record<FeedConfig['type'], { icon: typeof Rss; tone: BadgeTone; tile: string }> = {
    podcast: { icon: Rss, tone: 'podcast', tile: 'text-podcast' },
    news: { icon: Newspaper, tone: 'news', tile: 'text-news' },
    youtube: { icon: Youtube, tone: 'youtube', tile: 'text-youtube' },
};

export function FeedManager({ botId, showTitle = true, refreshKey = 0 }: Props) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const duration = useDurationLabel();
    const [feeds, setFeeds] = useState<FeedConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [dialog, setDialog] = useState<{ open: boolean; feed: FeedConfig | null }>({ open: false, feed: null });
    const [toDelete, setToDelete] = useState<FeedConfig | null>(null);
    const [importing, setImporting] = useState(false);

    const loadFeeds = async () => {
        try {
            setFeeds(await window.api.getFeeds(botId));
        } catch (e) {
            toast(errorMessage(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setLoading(true); setQuery(''); loadFeeds(); }, [botId]);
    // A fine giro gli esiti delle letture sono cambiati: si rilegge senza mostrare il caricamento.
    useEffect(() => { if (refreshKey > 0) loadFeeds(); }, [refreshKey]);

    // Ricerca locale al canale: nome, URL, tipo e parole del filtro. Più termini = tutti.
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return feeds;
        const terms = q.split(/\s+/);
        return feeds.filter(feed => {
            const kw = parseKeywordFilter(feed.keyword_filter);
            const haystack = `${feed.name} ${feed.url} ${feed.type} ${t(`feedTypes.${feed.type}`)} ${kw.include} ${kw.exclude}`.toLowerCase();
            return terms.every(term => haystack.includes(term));
        });
    }, [feeds, query, t]);

    const toggle = async (feed: FeedConfig) => {
        // Aggiornamento ottimistico: l'interruttore risponde subito, poi si riallinea al database.
        setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, is_active: !f.is_active } : f));
        try {
            await window.api.toggleFeed(feed.id, !feed.is_active);
        } catch (e) {
            toast(errorMessage(e), 'error');
        }
        loadFeeds();
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        try {
            await window.api.deleteFeed(toDelete.id);
            toast(t('feeds.deleted').replace('{name}', toDelete.name), 'success');
        } catch (e) {
            toast(errorMessage(e), 'error');
        }
        setToDelete(null);
        loadFeeds();
    };

    const importOpml = async () => {
        setImporting(true);
        try {
            const res = await window.api.importOpml(botId);
            if (res.success && res.count > 0) {
                toast(t('feeds.opmlImported').replace('{n}', String(res.count)), 'success');
                loadFeeds();
            } else if (res.success) {
                toast(t('feeds.opmlEmpty'), 'info');
            } else if (res.error) {
                toast(`${t('feeds.opmlError')} ${res.error}`, 'error');
            }
        } catch (e) {
            toast(`${t('feeds.opmlError')} ${errorMessage(e)}`, 'error');
        } finally {
            setImporting(false);
        }
    };

    const activeCount = feeds.filter(f => f.is_active).length;

    return (
        <section aria-labelledby="feeds-heading" className="flex h-full min-h-0 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-4">
                <div>
                    <h2 id="feeds-heading" className={showTitle ? 'text-lg font-semibold text-fg' : 'sr-only'}>{t('feeds.title')}</h2>
                    <p className={showTitle ? 'text-sm text-fg-3' : 'text-base text-fg-2'}>
                        {loading ? t('common.loading')
                            : feeds.length === 0 ? t('feeds.subtitleEmpty')
                            : t('feeds.subtitle').replace('{active}', String(activeCount)).replace('{total}', String(feeds.length))}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" icon={Upload} loading={importing} onClick={importOpml} title={t('feeds.opmlTitle')}>OPML</Button>
                    <Button size="sm" variant="primary" icon={Plus} onClick={() => setDialog({ open: true, feed: null })}>{t('feeds.add')}</Button>
                </div>
            </div>

            {feeds.length > 0 && (
                <div className="px-5 pb-3">
                    <TextField
                        label={t('feeds.search')}
                        hideLabel
                        leadingIcon={Search}
                        type="search"
                        placeholder={t('feeds.searchPlaceholder')}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Escape' && query) { e.stopPropagation(); setQuery(''); } }}
                        trailing={query ? <IconButton icon={X} size="sm" label={t('feeds.searchClear')} onClick={() => setQuery('')} /> : undefined}
                    />
                    {query && (
                        <p className="mt-1.5 text-sm text-fg-3 tabular" aria-live="polite">
                            {t('feeds.searchCount').replace('{n}', String(filtered.length)).replace('{total}', String(feeds.length))}
                        </p>
                    )}
                </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
                {!loading && feeds.length === 0 && (
                    <div className="flex flex-col items-center rounded-lg border border-dashed border-line-strong px-6 py-10 text-center">
                        <Rss size={28} className="mb-3 text-fg-3" aria-hidden="true" />
                        <p className="text-base font-medium text-fg">{t('feeds.emptyTitle')}</p>
                        <p className="mt-1 max-w-sm text-sm text-fg-3">{t('feeds.emptyText')}</p>
                        <Button className="mt-4" variant="primary" size="sm" icon={Plus} onClick={() => setDialog({ open: true, feed: null })}>{t('feeds.add')}</Button>
                    </div>
                )}

                {feeds.length > 0 && filtered.length === 0 && (
                    <div className="flex flex-col items-center px-6 py-10 text-center">
                        <Search size={24} className="mb-2 text-fg-3" aria-hidden="true" />
                        <p className="text-base text-fg-2">{t('feeds.noResults')}</p>
                        <Button className="mt-3" size="sm" variant="ghost" onClick={() => setQuery('')}>{t('feeds.searchClear')}</Button>
                    </div>
                )}

                <ul className="space-y-2">
                    {filtered.map(feed => {
                        const style = TYPE_STYLE[feed.type] ?? TYPE_STYLE.news;
                        const Icon = style.icon;
                        return (
                            <li key={feed.id} className={cn('rounded-lg border border-line bg-surface-2 p-3 transition-colors hover:border-line-strong', !feed.is_active && 'bg-surface-1')}>
                                <div className="flex items-start gap-3">
                                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-3', style.tile)} aria-hidden="true">
                                        <Icon size={17} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className={cn('truncate text-base font-medium', feed.is_active ? 'text-fg' : 'text-fg-3')}>{feed.name}</h3>
                                        <p className="truncate font-mono text-xs text-fg-3" title={feed.url}>{feed.url}</p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            <Badge tone={style.tone}>{t(`feedTypes.${feed.type}`)}</Badge>
                                            {!feed.is_active && <Badge>{t('feeds.paused')}</Badge>}
                                            {feed.keyword_filter && <Badge tone="accent" icon={Filter}>{t('feeds.badgeFilter')}</Badge>}
                                            {feed.check_interval != null && <Badge icon={Clock}>{t('feedForm.every').replace('{d}', duration(feed.check_interval))}</Badge>}
                                            {feed.digest_interval != null && <Badge tone="warning" icon={BookOpen}>{t('feeds.badgeDigest').replace('{d}', duration(feed.digest_interval))}</Badge>}
                                            {!!feed.digest_waiting && <Badge icon={Inbox}>{t('feeds.digestWaiting').replace('{n}', String(feed.digest_waiting))}</Badge>}
                                        </div>
                                        {feed.is_active && <FeedStatus feed={feed} />}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <Switch checked={!!feed.is_active} onChange={() => toggle(feed)} ariaLabel={t('feeds.toggle').replace('{name}', feed.name)} className="mr-1" />
                                        <IconButton icon={Pencil} size="sm" label={t('feeds.edit').replace('{name}', feed.name)} onClick={() => setDialog({ open: true, feed })} />
                                        <IconButton icon={Trash2} size="sm" variant="danger-ghost" label={t('feeds.delete').replace('{name}', feed.name)} onClick={() => setToDelete(feed)} />
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <FeedDialog
                open={dialog.open}
                botId={botId}
                feed={dialog.feed}
                onClose={() => setDialog({ open: false, feed: null })}
                onSaved={() => {
                    toast(dialog.feed ? t('feeds.updated') : t('feeds.added'), 'success');
                    setDialog({ open: false, feed: null });
                    loadFeeds();
                }}
            />

            <ConfirmDialog
                isOpen={toDelete !== null}
                title={t('feeds.deleteTitle')}
                message={t('feeds.deleteMessage').replace('{name}', toDelete?.name ?? '')}
                confirmText={t('feeds.deleteConfirm')}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </section>
    );
}
