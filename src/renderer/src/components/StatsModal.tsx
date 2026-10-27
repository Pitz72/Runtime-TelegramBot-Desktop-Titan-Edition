import React, { useEffect, useState } from 'react';
import { BarChart3, Rss, Inbox, History, Send, Moon, BookOpen } from 'lucide-react';
import type { BotQueues, HistoryEntry, QueuedItem } from '../../../shared/types';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Tabs, TabPanel } from './ui/Controls';
import { useTranslation } from '../locales/I18nContext';

interface Props {
    open: boolean;
    botId: number;
    botName: string;
    onClose: () => void;
}

interface DetailedStats {
    total: number;
    today: number;
    week: number;
    byFeed: Array<{ feedId: number; feedName: string | null; total: number; today: number }>;
}

type Tab = 'numbers' | 'queues' | 'history';

/** Gli orari del database: «AAAA-MM-GG HH:MM:SS» di SQLite è UTC senza fuso, l'ISO ha la Z. */
function toDate(value: string | null): Date | null {
    if (!value) return null;
    const t = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? Date.parse(value.replace(' ', 'T') + 'Z') : Date.parse(value);
    return Number.isFinite(t) ? new Date(t) : null;
}

/** Un elenco di contenuti, leggibile riga per riga anche con il lettore di schermo. */
function ItemList({ items, emptyText }: { items: Array<{ title: string; feedName: string | null; at: string | null }>; emptyText: string }) {
    const { t, locale } = useTranslation();
    if (items.length === 0) return <p className="py-3 text-sm text-fg-3">{emptyText}</p>;
    const format = (value: string | null) => toDate(value)?.toLocaleString(locale === 'it' ? 'it-IT' : 'en-GB', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    }) ?? '';
    return (
        <ul className="divide-y divide-line rounded-md border border-line bg-surface-2">
            {items.map((item, i) => (
                <li key={i} className="px-3 py-2">
                    <p className="break-words text-base text-fg">{item.title || t('stats.untitled')}</p>
                    <p className="text-sm text-fg-3">
                        {item.feedName ?? t('stats.removedFeed')}
                        {item.at && <> · <time dateTime={toDate(item.at)?.toISOString()}>{format(item.at)}</time></>}
                    </p>
                </li>
            ))}
        </ul>
    );
}

function QueueSection({ icon: Icon, title, items, emptyText }: { icon: typeof Moon; title: string; items: QueuedItem[]; emptyText: string }) {
    return (
        <section className="mb-5">
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-fg">
                <Icon size={16} className="text-fg-3" aria-hidden="true" />
                {title}
            </h3>
            <ItemList items={items} emptyText={emptyText} />
        </section>
    );
}

/**
 * Attività del bot: i numeri delle pubblicazioni, ciò che aspetta di uscire e lo storico.
 * Le barre sono decorative: il numero è sempre scritto, e l'elenco per sorgente è una
 * tabella vera.
 */
export function StatsModal({ open, botId, botName, onClose }: Props) {
    const { t } = useTranslation();
    const [tab, setTab] = useState<Tab>('numbers');
    const [stats, setStats] = useState<DetailedStats | null>(null);
    const [queues, setQueues] = useState<BotQueues | null>(null);
    const [history, setHistory] = useState<HistoryEntry[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!open) return;
        setTab('numbers');
        setLoading(true);
        Promise.all([
            window.api.getDetailedStats(botId).catch(() => null),
            window.api.getQueues(botId).catch(() => null),
            window.api.getHistory(botId).catch(() => null),
        ]).then(([s, q, h]) => {
            setStats(s);
            setQueues(q);
            setHistory(h);
        }).finally(() => setLoading(false));
    }, [open, botId]);

    const maxTotal = stats?.byFeed.reduce((m, f) => Math.max(m, f.total), 1) ?? 1;
    const waiting = queues ? queues.sending + queues.quietHours.length + queues.digest.length : 0;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            icon={BarChart3}
            title={t('stats.detailsTitle')}
            description={botName}
            size="lg"
            bodyClassName="pt-0"
            footer={<Button variant="primary" onClick={onClose}>{t('common.close')}</Button>}
        >
            <div className="sticky top-0 z-10 -mx-6 mb-5 bg-surface-1 px-6 pt-3">
                <Tabs
                    idBase="stats"
                    label={t('stats.detailsTitle')}
                    value={tab}
                    onChange={setTab}
                    items={[
                        { id: 'numbers', label: t('stats.tabNumbers'), icon: BarChart3 },
                        { id: 'queues', label: queues && waiting > 0 ? `${t('stats.tabQueues')} (${waiting})` : t('stats.tabQueues'), icon: Inbox },
                        { id: 'history', label: t('stats.tabHistory'), icon: History },
                    ]}
                />
            </div>

            <TabPanel idBase="stats" id={tab}>
                {loading ? (
                    <p className="py-8 text-center text-base text-fg-3" role="status">{t('common.loading')}</p>
                ) : tab === 'numbers' ? (
                    !stats ? (
                        <p className="py-8 text-center text-base text-fg-3">{t('stats.noData')}</p>
                    ) : (
                        <>
                            <dl className="mb-6 grid grid-cols-3 gap-3">
                                {([['today', stats.today], ['week', stats.week], ['total', stats.total]] as const).map(([key, value]) => (
                                    <div key={key} className="rounded-md border border-line bg-surface-2 px-4 py-3">
                                        <dt className="text-sm text-fg-3">{t(`stats.${key}`)}</dt>
                                        <dd className="text-3xl font-semibold text-fg tabular">{value}</dd>
                                    </div>
                                ))}
                            </dl>

                            <h3 className="mb-3 text-base font-semibold text-fg">{t('stats.feedBreakdown')}</h3>
                            {stats.byFeed.length === 0 ? (
                                <div className="flex flex-col items-center py-8 text-center">
                                    <Rss size={24} className="mb-2 text-fg-3" aria-hidden="true" />
                                    <p className="text-base text-fg-3">{t('stats.noData')}</p>
                                </div>
                            ) : (
                                <table className="w-full border-separate border-spacing-y-2 text-left">
                                    <caption className="sr-only">{t('stats.feedBreakdown')}</caption>
                                    <thead>
                                        <tr className="text-sm text-fg-3">
                                            <th scope="col" className="font-medium">{t('stats.source')}</th>
                                            <th scope="col" className="w-20 text-right font-medium">{t('stats.today')}</th>
                                            <th scope="col" className="w-20 text-right font-medium">{t('stats.total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.byFeed.map((feed, i) => (
                                            <tr key={feed.feedId ?? `removed-${i}`} className="align-top">
                                                <th scope="row" className="pr-3 font-normal">
                                                    <span className="block truncate text-base text-fg">{feed.feedName ?? t('stats.removedFeed')}</span>
                                                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
                                                        <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(3, (feed.total / maxTotal) * 100)}%` }} />
                                                    </span>
                                                </th>
                                                <td className="text-right text-base text-fg-2 tabular">{feed.today}</td>
                                                <td className="text-right text-base font-semibold text-fg tabular">{feed.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )
                ) : tab === 'queues' ? (
                    !queues ? (
                        <p className="py-8 text-center text-base text-fg-3">{t('stats.noData')}</p>
                    ) : (
                        <>
                            <p className="mb-4 text-sm text-fg-3">{t('stats.queuesIntro')}</p>
                            <p className="mb-5 flex items-center gap-2 text-base text-fg">
                                <Send size={16} className="text-fg-3" aria-hidden="true" />
                                {t('stats.sendingNow').replace('{n}', String(queues.sending))}
                            </p>
                            <QueueSection icon={Moon} title={t('stats.quietHoursQueue').replace('{n}', String(queues.quietHours.length))} items={queues.quietHours} emptyText={t('stats.queueEmpty')} />
                            <QueueSection icon={BookOpen} title={t('stats.digestQueue').replace('{n}', String(queues.digest.length))} items={queues.digest} emptyText={t('stats.queueEmpty')} />
                        </>
                    )
                ) : (
                    !history ? (
                        <p className="py-8 text-center text-base text-fg-3">{t('stats.noData')}</p>
                    ) : (
                        <>
                            <p className="mb-4 text-sm text-fg-3">{t('stats.historyIntro')}</p>
                            <ItemList items={history} emptyText={t('stats.noData')} />
                        </>
                    )
                )}
            </TabPanel>
        </Dialog>
    );
}
