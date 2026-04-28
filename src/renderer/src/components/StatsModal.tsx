import React, { useEffect, useState } from 'react';
import { X, BarChart3, TrendingUp, Rss } from 'lucide-react';
import { useTranslation } from '../locales/I18nContext';

interface Props {
    botId: number;
    botName: string;
    onClose: () => void;
}

interface DetailedStats {
    total: number;
    today: number;
    week: number;
    byFeed: Array<{ feedId: number; feedName: string; total: number; today: number }>;
}

export function StatsModal({ botId, botName, onClose }: Props) {
    const { t } = useTranslation();
    const [stats, setStats] = useState<DetailedStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.api.getDetailedStats(botId).then(s => {
            setStats(s);
            setLoading(false);
        });
    }, [botId]);

    const maxTotal = stats?.byFeed.reduce((m, f) => Math.max(m, f.total), 1) ?? 1;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-lg rounded-xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-outline-variant/15 bg-surface-container-high/50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <BarChart3 size={18}  className="text-primary drop-glow-primary" />
                        <div>
                            <h2 className="font-headline text-base font-bold text-on-surface">{t('stats.detailsTitle') as string}</h2>
                            <p className="text-nano text-outline-variant/50">{botName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-outline-variant hover:text-on-surface hover:bg-surface-container-highest/50 rounded transition-colors"
                    >
                        <X size={16}  />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 scanline-bg">
                    {loading ? (
                        <div className="flex items-center justify-center py-10 text-outline-variant/40 text-micro">
                            {t('stats.loading') as string}
                        </div>
                    ) : stats ? (
                        <>
                            {/* Stat tiles grid */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {/* Today */}
                                <div className="ghost-border bg-surface-container rounded-lg p-4 flex flex-col justify-between hover:bg-surface-container-high transition-colors group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-0.5 tile-stripe-primary opacity-60" />
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-nano text-on-surface-variant">{t('stats.today') as string}</span>
                                        <span className="text-nano text-tertiary/50">VOL:24H</span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="font-headline text-3xl font-bold text-primary text-glow group-hover:text-secondary transition-colors">
                                            {stats.today}
                                        </span>
                                    </div>
                                </div>

                                {/* 7 Days */}
                                <div className="ghost-border bg-surface-container rounded-lg p-4 flex flex-col justify-between hover:bg-surface-container-high transition-colors group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-0.5 tile-stripe-secondary opacity-60" />
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-nano text-on-surface-variant">{t('stats.week') as string}</span>
                                        <span className="text-nano text-tertiary/50">VOL:168H</span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="font-headline text-3xl font-bold text-secondary text-glow-cyan group-hover:text-primary transition-colors">
                                            {stats.week}
                                        </span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="ghost-border bg-surface-container rounded-lg p-4 flex flex-col justify-between hover:bg-surface-container-high transition-colors group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-0.5 tile-stripe-tertiary opacity-60" />
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-nano text-on-surface-variant">{t('stats.total') as string}</span>
                                        <span className="text-nano text-tertiary/50">ALL</span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="font-headline text-3xl font-bold text-on-surface group-hover:text-tertiary transition-colors">
                                            {stats.total}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Per Feed breakdown */}
                            <div>
                                <div className="flex items-center gap-2 text-micro text-outline-variant/50 mb-3">
                                    <TrendingUp size={11}  />
                                    {t('stats.feedBreakdown') as string}
                                </div>

                                {stats.byFeed.length === 0 ? (
                                    <div className="text-center py-8 text-outline-variant/30">
                                        <Rss size={32}  className="mx-auto mb-2 opacity-30" />
                                        <p className="text-micro">{t('stats.noData') as string}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {stats.byFeed.map(feed => (
                                            <div key={feed.feedId} className="ghost-border bg-surface-container-lowest/60 rounded-lg p-3 hover:bg-surface-container transition-colors">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-medium text-on-surface truncate flex-1 mr-2">{feed.feedName}</span>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <span className="text-nano text-secondary font-bold">
                                                            +{feed.today} <span className="text-outline-variant/40 font-normal">{t('stats.today') as string}</span>
                                                        </span>
                                                        <span className="text-nano text-on-surface-variant font-bold">
                                                            {feed.total} {t('stats.total') as string}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="h-0.5 bg-surface-container-highest rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${Math.max(2, (feed.total / maxTotal) * 100)}%`,
                                                            background: 'linear-gradient(90deg, #4cd7f6, #adc6ff)',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-outline-variant/30 text-micro">
                            {t('stats.noData') as string}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
