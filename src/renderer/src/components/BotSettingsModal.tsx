import React, { useEffect, useState } from 'react';
import { SlidersHorizontal, Settings2, CalendarClock, MessageSquareText, Wrench, Download, History, Trash2 } from 'lucide-react';
import { BotConfig } from '../../../shared/types';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { SelectField, Switch, Tabs, TabPanel, TextField } from './ui/Controls';
import { BotCheck } from './BotCheck';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { TemplateEditor } from './TemplateEditor';
import { TokenVisibility, TOKEN_SHAPE } from './NewBotDialog';
import { useToast } from './ui/Toast';
import { useTranslation } from '../locales/I18nContext';
import { errorMessage } from '../lib/errors';

interface Props {
    open: boolean;
    bot: BotConfig;
    onClose: () => void;
    onSaved: () => void;
    onDeleted: () => void;
    onHistoryCleared: () => void;
}

type Tab = 'general' | 'schedule' | 'messages' | 'advanced';

/** I modelli che il motore usa quando un template è vuoto (telegram.ts / engine.ts). */
const DEFAULTS = {
    startup: '🟢 <b>Nome del bot Online</b>',
    news: "📰 <b>{{feedName}}</b>&#10;&#10;<b>{{title}}</b>&#10;&#10;🔗 <a href='{{link}}'>Leggi l'articolo completo</a>",
    podcast: "🎙 <b>{{feedName}}</b>&#10;&#10;<i>{{title}}</i>&#10;&#10;{{summary}}&#10;&#10;🎧 <a href='{{link}}'>Ascolta l'episodio</a>",
    youtube: "🎬 <b>{{feedName}}</b>&#10;&#10;<b>{{title}}</b>&#10;&#10;▶️ <a href='{{link}}'>Guarda il video</a>",
};

export function BotSettingsModal({ open, bot, onClose, onSaved, onDeleted, onHistoryCleared }: Props) {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const [tab, setTab] = useState<Tab>('general');

    const [name, setName] = useState(bot.name);
    const [token, setToken] = useState(bot.token);
    const [showToken, setShowToken] = useState(false);
    const [channelId, setChannelId] = useState(bot.channel_id);
    const [isActive, setIsActive] = useState(bot.is_active);
    const [notifications, setNotifications] = useState(bot.notifications_enabled ?? true);
    const [silentStart, setSilentStart] = useState(bot.silent_start ?? false);
    const [muteMode, setMuteMode] = useState<BotConfig['mute_mode']>(bot.mute_mode ?? 'off');
    const [muteFrom, setMuteFrom] = useState(bot.mute_from || '22:00');
    const [muteUntil, setMuteUntil] = useState(bot.mute_until || '07:00');
    const [startDate, setStartDate] = useState(bot.start_date.split('T')[0]);
    const [interval, setIntervalMinutes] = useState(String(bot.check_interval || 15));
    const [sendFrom, setSendFrom] = useState(bot.send_from || '00:00');
    const [sendUntil, setSendUntil] = useState(bot.send_until || '23:59');
    const [tplStartup, setTplStartup] = useState(bot.template_startup || '');
    const [tplNews, setTplNews] = useState(bot.template_news || '');
    const [tplPodcast, setTplPodcast] = useState(bot.template_podcast || '');
    const [tplYoutube, setTplYoutube] = useState(bot.template_youtube || '');

    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState('');
    const [confirm, setConfirm] = useState<'delete' | 'clear' | null>(null);
    const [busy, setBusy] = useState(false);

    // Ogni apertura riparte dai valori salvati del bot.
    useEffect(() => {
        if (!open) return;
        setTab('general');
        setName(bot.name); setToken(bot.token); setShowToken(false); setChannelId(bot.channel_id);
        setIsActive(bot.is_active); setNotifications(bot.notifications_enabled ?? true); setSilentStart(bot.silent_start ?? false);
        setMuteMode(bot.mute_mode ?? 'off'); setMuteFrom(bot.mute_from || '22:00'); setMuteUntil(bot.mute_until || '07:00');
        setStartDate(bot.start_date.split('T')[0]); setIntervalMinutes(String(bot.check_interval || 15));
        setSendFrom(bot.send_from || '00:00'); setSendUntil(bot.send_until || '23:59');
        setTplStartup(bot.template_startup || ''); setTplNews(bot.template_news || '');
        setTplPodcast(bot.template_podcast || ''); setTplYoutube(bot.template_youtube || '');
        setSubmitted(false); setServerError('');
    }, [open, bot]);

    const intervalNumber = Number(interval);
    const errors = {
        name: !name.trim() ? t('botForm.required') : '',
        // Token vuoto: caso reale di un database importato da un altro PC, dove il token
        // non si può decifrare. Va detto qui, non lasciato fallire al salvataggio.
        token: !token.trim() ? t('botForm.tokenMissing') : '',
        channel: !channelId.trim() ? t('botForm.required') : '',
        startDate: !startDate ? t('botForm.required') : '',
        interval: !Number.isInteger(intervalNumber) || intervalNumber < 1 || intervalNumber > 1440 ? t('botSettings.intervalRange') : '',
    };
    const generalInvalid = !!(errors.name || errors.token || errors.channel);
    const scheduleInvalid = !!(errors.startDate || errors.interval);

    const save = async () => {
        setSubmitted(true);
        setServerError('');
        if (generalInvalid) { setTab('general'); return; }
        if (scheduleInvalid) { setTab('schedule'); return; }
        setSaving(true);
        try {
            await window.api.updateBot({
                id: bot.id, name: name.trim(), token: token.trim(), channelId: channelId.trim(), isActive, startDate,
                checkInterval: intervalNumber, notificationsEnabled: notifications, sendFrom, sendUntil,
                templatePodcast: tplPodcast, templateNews: tplNews, templateYoutube: tplYoutube, templateStartup: tplStartup,
                silentStart, muteMode, muteFrom, muteUntil,
            });
            success(t('botSettings.saved'));
            onSaved();
        } catch (e) {
            setServerError(errorMessage(e));
        } finally {
            setSaving(false);
        }
    };

    const exportProfile = async () => {
        try {
            const res = await window.api.exportSingleBot(bot.id);
            if (res.success && res.path) success(res.path, t('botSettings.exported'));
            else if (!res.success && res.error) error(`${t('botSettings.exportFailed')} ${res.error}`);
        } catch (e) {
            error(`${t('botSettings.exportFailed')} ${errorMessage(e)}`);
        }
    };

    const runConfirm = async () => {
        setBusy(true);
        try {
            if (confirm === 'clear') {
                await window.api.clearHistory(bot.id);
                success(t('botSettings.historyCleared'));
                onHistoryCleared();
                setConfirm(null);
            } else if (confirm === 'delete') {
                await window.api.deleteBot(bot.id);
                success(t('botSettings.deleted').replace('{name}', bot.name));
                setConfirm(null);
                onDeleted();
            }
        } catch (e) {
            error(errorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    const quietActive = !(sendFrom === '00:00' && sendUntil === '23:59');

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                icon={SlidersHorizontal}
                title={t('botSettings.title')}
                description={bot.name}
                size="lg"
                bodyClassName="pt-0"
                footer={
                    <>
                        {serverError && <p role="alert" className="mr-auto text-sm font-medium text-danger">{serverError}</p>}
                        <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                        <Button variant="primary" loading={saving} onClick={save}>{t('common.saveChanges')}</Button>
                    </>
                }
            >
                <div className="sticky top-0 z-10 -mx-6 mb-5 bg-surface-1 px-6 pt-3">
                    <Tabs
                        idBase="bot-settings"
                        label={t('botSettings.title')}
                        value={tab}
                        onChange={setTab}
                        items={[
                            { id: 'general', label: t('botSettings.tabGeneral'), icon: Settings2 },
                            { id: 'schedule', label: t('botSettings.tabSchedule'), icon: CalendarClock },
                            { id: 'messages', label: t('botSettings.tabMessages'), icon: MessageSquareText },
                            { id: 'advanced', label: t('botSettings.tabAdvanced'), icon: Wrench },
                        ]}
                    />
                </div>

                <TabPanel idBase="bot-settings" id={tab}>
                    {tab === 'general' && (
                        <div className="space-y-4">
                            <TextField label={t('botForm.name')} value={name} onChange={e => setName(e.target.value)} error={submitted ? errors.name : ''} required />
                            <TextField
                                label={t('botForm.token')}
                                hint={token.trim() && !TOKEN_SHAPE.test(token.trim()) ? t('botForm.tokenShape') : t('botForm.tokenHint')}
                                type={showToken ? 'text' : 'password'}
                                autoComplete="off"
                                spellCheck={false}
                                className="font-mono text-sm"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                error={submitted || !bot.token ? errors.token : ''}
                                required
                                trailing={<TokenVisibility visible={showToken} onToggle={() => setShowToken(v => !v)} />}
                            />
                            <TextField
                                label={t('botForm.channel')}
                                hint={t('botForm.channelHint')}
                                className="font-mono text-sm"
                                spellCheck={false}
                                value={channelId}
                                onChange={e => setChannelId(e.target.value)}
                                error={submitted ? errors.channel : ''}
                                required
                            />
                            <BotCheck token={token} channelId={channelId} />
                            <div className="space-y-4 rounded-lg border border-line bg-surface-2 p-4">
                                <Switch checked={isActive} onChange={setIsActive} label={t('botSettings.active')} description={t('botSettings.activeHint')} />
                                <div className="h-px bg-line" aria-hidden="true" />
                                <Switch checked={notifications} onChange={setNotifications} label={t('botSettings.notifications')} description={t('botSettings.notificationsHint')} />
                                <div className="h-px bg-line" aria-hidden="true" />
                                <Switch checked={silentStart} onChange={setSilentStart} label={t('botSettings.silentStart')} description={t('botSettings.silentStartHint')} />
                            </div>
                        </div>
                    )}

                    {tab === 'schedule' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                            <TextField
                                label={t('botForm.startDate')}
                                hint={t('botForm.startDateHint')}
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                error={submitted ? errors.startDate : ''}
                                required
                            />
                            <TextField
                                label={t('botSettings.interval')}
                                hint={t('botSettings.intervalHint')}
                                type="number"
                                inputMode="numeric"
                                min={1}
                                max={1440}
                                step={1}
                                value={interval}
                                onChange={e => setIntervalMinutes(e.target.value)}
                                error={errors.interval}
                            />
                            </div>
                            <fieldset className="rounded-lg border border-line bg-surface-2 p-4">
                                <legend className="px-1 text-base font-semibold text-fg">{t('botSettings.window')}</legend>
                                <p className="mb-4 text-sm text-fg-3">{t('botSettings.windowHint')}</p>
                                <div className="flex flex-wrap gap-4">
                                    <TextField label={t('botSettings.from')} type="time" value={sendFrom} onChange={e => setSendFrom(e.target.value || '00:00')} containerClassName="w-40" />
                                    <TextField label={t('botSettings.until')} type="time" value={sendUntil} onChange={e => setSendUntil(e.target.value || '23:59')} containerClassName="w-40" />
                                </div>
                                <p className="mt-3 text-sm text-fg-2" aria-live="polite">
                                    {quietActive
                                        ? t('botSettings.windowSummary').replace('{from}', sendFrom).replace('{until}', sendUntil)
                                        : t('botSettings.windowAlways')}
                                </p>
                            </fieldset>
                            <fieldset className="rounded-lg border border-line bg-surface-2 p-4">
                                <legend className="px-1 text-base font-semibold text-fg">{t('botSettings.mute')}</legend>
                                <p className="mb-4 text-sm text-fg-3">{t('botSettings.muteHint')}</p>
                                <SelectField
                                    label={t('botSettings.muteMode')}
                                    value={muteMode}
                                    onChange={e => setMuteMode(e.target.value as BotConfig['mute_mode'])}
                                    containerClassName="max-w-sm"
                                >
                                    <option value="off">{t('botSettings.muteOff')}</option>
                                    <option value="always">{t('botSettings.muteAlways')}</option>
                                    <option value="window">{t('botSettings.muteWindow')}</option>
                                </SelectField>
                                {muteMode === 'window' && (
                                    <div className="mt-4 flex flex-wrap gap-4">
                                        <TextField label={t('botSettings.from')} type="time" value={muteFrom} onChange={e => setMuteFrom(e.target.value || '22:00')} containerClassName="w-40" />
                                        <TextField label={t('botSettings.until')} type="time" value={muteUntil} onChange={e => setMuteUntil(e.target.value || '07:00')} containerClassName="w-40" />
                                    </div>
                                )}
                                <p className="mt-3 text-sm text-fg-2" aria-live="polite">
                                    {muteMode === 'always'
                                        ? t('botSettings.muteSummaryAlways')
                                        : muteMode === 'window'
                                            ? t('botSettings.muteSummaryWindow').replace('{from}', muteFrom).replace('{until}', muteUntil)
                                            : t('botSettings.muteSummaryOff')}
                                </p>
                            </fieldset>
                        </div>
                    )}

                    {tab === 'messages' && (
                        <div className="space-y-4">
                            <p className="text-sm text-fg-3">{t('templates.intro')}</p>
                            <TemplateEditor label={t('templates.news')} value={tplNews} onChange={setTplNews} defaultTemplate={DEFAULTS.news} />
                            <TemplateEditor label={t('templates.podcast')} value={tplPodcast} onChange={setTplPodcast} defaultTemplate={DEFAULTS.podcast} />
                            <TemplateEditor label={t('templates.youtube')} value={tplYoutube} onChange={setTplYoutube} defaultTemplate={DEFAULTS.youtube} />
                            <TemplateEditor
                                label={t('templates.startup')}
                                description={silentStart ? t('templates.startupSilent') : t('templates.startupHint')}
                                value={tplStartup}
                                onChange={setTplStartup}
                                defaultTemplate={DEFAULTS.startup}
                                isStartup
                            />
                        </div>
                    )}

                    {tab === 'advanced' && (
                        <div className="space-y-3">
                            <ActionRow
                                icon={Download}
                                title={t('botSettings.exportTitle')}
                                text={t('botSettings.exportText')}
                                action={<Button icon={Download} onClick={exportProfile}>{t('botSettings.export')}</Button>}
                            />
                            <ActionRow
                                icon={History}
                                title={t('botSettings.clearTitle')}
                                text={t('botSettings.clearText')}
                                tone="warning"
                                action={<Button variant="danger-ghost" icon={History} onClick={() => setConfirm('clear')}>{t('botSettings.clear')}</Button>}
                            />
                            <ActionRow
                                icon={Trash2}
                                title={t('botSettings.deleteTitle')}
                                text={t('botSettings.deleteText')}
                                tone="danger"
                                action={<Button variant="danger" icon={Trash2} onClick={() => setConfirm('delete')}>{t('botSettings.delete')}</Button>}
                            />
                        </div>
                    )}
                </TabPanel>
            </Dialog>

            <ConfirmDialog
                isOpen={confirm === 'clear'}
                title={t('botSettings.clearConfirmTitle')}
                message={t('botSettings.clearConfirmText')}
                confirmText={t('botSettings.clear')}
                busy={busy}
                onConfirm={runConfirm}
                onCancel={() => setConfirm(null)}
            />
            <ConfirmDialog
                isOpen={confirm === 'delete'}
                title={t('botSettings.deleteConfirmTitle').replace('{name}', bot.name)}
                message={t('botSettings.deleteConfirmText')}
                confirmText={t('botSettings.delete')}
                busy={busy}
                onConfirm={runConfirm}
                onCancel={() => setConfirm(null)}
            />
        </>
    );
}

function ActionRow({ icon: Icon, title, text, action, tone }: {
    icon: typeof Download;
    title: string;
    text: string;
    action: React.ReactNode;
    tone?: 'warning' | 'danger';
}) {
    const iconClass = tone === 'danger' ? 'bg-danger-soft text-danger' : tone === 'warning' ? 'bg-warning-soft text-warning' : 'bg-surface-4 text-accent';
    return (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-surface-2 p-4">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${iconClass}`} aria-hidden="true">
                <Icon size={17} />
            </span>
            <div className="min-w-[200px] flex-1">
                <h3 className="text-base font-semibold text-fg">{title}</h3>
                <p className="text-sm text-fg-3">{text}</p>
            </div>
            {action}
        </div>
    );
}
