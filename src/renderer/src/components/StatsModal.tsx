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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-dark-900 border border-titan-500/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-titan-500/10 bg-dark-800/50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <BarChart3 size={18} className="text-titan-400" />
                        <div>
                            <h2 className="text-base font-bold text-white">{t('stats.detailsTitle') as string}</h2>
                            <p className="text-[10px] text-titan-500/40">{botName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-neutral-600 hover:text-white transition-colors p-1">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-10 text-neutral-600 text-sm">
                            {t('stats.loading') as string}
                        </div>
                    ) : stats ? (
                        <>
                            {/* Totali */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-dark-950 border border-titan-500/10 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-titan-400 leading-none">{stats.today}</p>
                                    <p className="text-[9px] text-titan-500/40 uppercase tracking-widest font-bold mt-1">{t('stats.today') as string}</p>
                                </div>
                                <div className="bg-dark-950 border border-titan-500/10 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-titan-300 leading-none">{stats.week}</p>
                                    <p className="text-[9px] text-titan-500/40 uppercase tracking-widest font-bold mt-1">{t('stats.week') as string}</p>
                                </div>
                                <div className="bg-dark-950 border border-titan-500/10 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-neutral-400 leading-none">{stats.total}</p>
                                    <p className="text-[9px] text-titan-500/40 uppercase tracking-widest font-bold mt-1">{t('stats.total') as string}</p>
                                </div>
                            </div>

                            {/* Per Feed */}
                            <div>
                                <div className="flex items-center gap-2 text-[10px] text-titan-500/50 uppercase font-bold tracking-widest mb-3">
                                    <TrendingUp size={11} />
                                    {t('stats.feedBreakdown') as string}
                                </div>

                                {stats.byFeed.length === 0 ? (
                                    <div className="text-center py-8 text-neutral-700 text-sm">
                                        <Rss size={32} className="mx-auto mb-2 opacity-10" />
                                        {t('stats.noData') as string}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {stats.byFeed.map(feed => (
                                            <div key={feed.feedId} className="bg-dark-950/60 border border-titan-500/5 rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-xs font-medium text-white truncate flex-1 mr-2">{feed.feedName}</span>
                                                    <div className="flex items-center gap-3 flex-shrink-0 text-[10px]">
                                                        <span className="text-titan-400 font-bold">+{feed.today} <span className="text-titan-500/40 font-normal">{t('stats.today') as string}</span></span>
                                                        <span className="text-neutral-500 font-bold">{feed.total} {t('stats.total') as string}</span>
                                                    </div>
                                                </div>
                                                <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-titan-600 to-titan-400 rounded-full transition-all"
                                                        style={{ width: `${Math.max(2, (feed.total / maxTotal) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-neutral-700 text-sm">{t('stats.noData') as string}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
