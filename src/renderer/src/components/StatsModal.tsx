import React, { useEffect, useState } from 'react';
import { BarChart3, Rss } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
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

/**
 * Pubblicazioni per sorgente. Le barre sono decorative: il numero è sempre scritto, e
 * l'elenco è una tabella vera, leggibile riga per riga anche con il lettore di schermo.
 */
export function StatsModal({ open, botId, botName, onClose }: Props) {
    const { t } = useTranslation();
    const [stats, setStats] = useState<DetailedStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        window.api.getDetailedStats(botId)
            .then(s => setStats(s))
            .catch(() => setStats(null))
            .finally(() => setLoading(false));
    }, [open, botId]);

    const maxTotal = stats?.byFeed.reduce((m, f) => Math.max(m, f.total), 1) ?? 1;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            icon={BarChart3}
            title={t('stats.detailsTitle')}
            description={botName}
            size="md"
            footer={<Button variant="primary" onClick={onClose}>{t('common.close')}</Button>}
        >
            {loading ? (
                <p className="py-8 text-center text-base text-fg-3" role="status">{t('common.loading')}</p>
            ) : !stats ? (
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
            )}
        </Dialog>
    );
}
