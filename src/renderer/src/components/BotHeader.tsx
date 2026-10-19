import React from 'react';
import { BarChart3, SlidersHorizontal, CalendarDays, Clock, MessageSquareOff, BellOff } from 'lucide-react';
import { BotConfig } from '../../../shared/types';
import { Button } from './ui/Button';
import { Badge } from './ui/Controls';
import { channelLabel } from './BotSidebar';
import { useTranslation } from '../locales/I18nContext';

interface Props {
    bot: BotConfig;
    stats: { total: number; today: number; week: number } | null;
    onOpenSettings: () => void;
    onOpenStats: () => void;
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
    return (
        <div className="min-w-[96px] rounded-md border border-line bg-surface-2 px-4 py-2.5">
            <dt className="text-xs font-medium text-fg-3">{label}</dt>
            <dd className="text-2xl font-semibold leading-8 text-fg tabular">{value ?? '—'}</dd>
        </div>
    );
}

/** Intestazione del bot selezionato: chi è, dove pubblica, quanto ha pubblicato. */
export function BotHeader({ bot, stats, onOpenSettings, onOpenStats }: Props) {
    const { t, locale } = useTranslation();
    const start = new Date(bot.start_date);
    const startLabel = isNaN(start.getTime())
        ? bot.start_date
        : start.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    const quiet = bot.send_from && bot.send_until && !(bot.send_from === '00:00' && bot.send_until === '23:59');

    return (
        <section aria-labelledby="bot-heading" className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-6 pb-5 pt-5">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 id="bot-heading" className="truncate text-2xl font-semibold text-fg">{bot.name}</h1>
                    <Badge tone={bot.is_active ? 'success' : 'neutral'}>{bot.is_active ? t('bots.active') : t('bots.inactive')}</Badge>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-3">
                    <span className="font-mono text-fg-2">{channelLabel(bot.channel_id)}</span>
                    <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} aria-hidden="true" />
                        {t('botHeader.since').replace('{date}', startLabel)}
                    </span>
                    {quiet && (
                        <span className="inline-flex items-center gap-1.5">
                            <Clock size={14} aria-hidden="true" />
                            {t('botHeader.window').replace('{from}', bot.send_from).replace('{until}', bot.send_until)}
                        </span>
                    )}
                    {bot.mute_mode && bot.mute_mode !== 'off' && (
                        <span className="inline-flex items-center gap-1.5">
                            <BellOff size={14} aria-hidden="true" />
                            {bot.mute_mode === 'always'
                                ? t('botHeader.muted')
                                : t('botHeader.mutedWindow').replace('{from}', bot.mute_from).replace('{until}', bot.mute_until)}
                        </span>
                    )}
                    {bot.silent_start && (
                        <span className="inline-flex items-center gap-1.5">
                            <MessageSquareOff size={14} aria-hidden="true" />
                            {t('botHeader.silent')}
                        </span>
                    )}
                </p>
                <div className="mt-3 flex gap-2">
                    <Button size="sm" icon={SlidersHorizontal} onClick={onOpenSettings}>{t('botHeader.settings')}</Button>
                    <Button size="sm" variant="ghost" icon={BarChart3} onClick={onOpenStats}>{t('botHeader.stats')}</Button>
                </div>
            </div>

            <dl className="flex gap-2" aria-label={t('stats.published')}>
                <Stat label={t('stats.today')} value={stats?.today} />
                <Stat label={t('stats.week')} value={stats?.week} />
                <Stat label={t('stats.total')} value={stats?.total} />
            </dl>
        </section>
    );
}
