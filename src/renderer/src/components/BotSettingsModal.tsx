import React, { useState } from 'react';
import {
    Save, Trash2, AlertTriangle, Clock, X, Database,
    Settings, LayoutTemplate, Download, Eye, EyeOff
} from 'lucide-react';
import { BotConfig } from '../../../shared/types';
import { useToast } from './ui/Toast';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useTranslation } from '../locales/I18nContext';
import { TemplateEditor } from './TemplateEditor';

interface Props {
    bot: BotConfig;
    onClose: () => void;
    onUpdate: (updatedBot: BotConfig) => void;
    onDelete: () => void;
}

export function BotSettingsModal({ bot, onClose, onUpdate, onDelete }: Props) {
    const { t } = useTranslation();
    const [name, setName] = useState(bot.name);
    const [token, setToken] = useState(bot.token);
    const [channelId, setChannelId] = useState(bot.channel_id);
    const [startDate, setStartDate] = useState(bot.start_date.split('T')[0]);
    const [checkInterval, setCheckInterval] = useState(bot.check_interval || 15);
    const [sendFrom, setSendFrom] = useState(bot.send_from || '00:00');
    const [sendUntil, setSendUntil] = useState(bot.send_until || '23:59');
    const [templatePodcast, setTemplatePodcast] = useState(bot.template_podcast || '');
    const [templateNews, setTemplateNews] = useState(bot.template_news || '');
    const [templateYoutube, setTemplateYoutube] = useState(bot.template_youtube || '');
    const [templateStartup, setTemplateStartup] = useState(bot.template_startup || '');
    const [isActive, setIsActive] = useState(bot.is_active);
    const [notificationsEnabled, setNotificationsEnabled] = useState(bot.notifications_enabled ?? true);
    const [saving, setSaving] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'templates'>('general');
    const { toast, success, error } = useToast();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            await window.api.updateBot({
                id: bot.id, name: name.trim(), token, channelId, isActive, startDate,
                checkInterval, notificationsEnabled, sendFrom, sendUntil,
                templatePodcast, templateNews, templateYoutube, templateStartup
            });
            onUpdate({
                ...bot, name: name.trim(), token, channel_id: channelId, is_active: isActive,
                start_date: startDate, check_interval: checkInterval, notifications_enabled: notificationsEnabled,
                send_from: sendFrom, send_until: sendUntil, template_podcast: templatePodcast,
                template_news: templateNews, template_youtube: templateYoutube, template_startup: templateStartup
            });
            onClose();
        } catch (e) {
            console.error('Failed to save bot settings:', e);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await window.api.deleteBot(bot.id);
            toast(t('botModal.successDelete') as string, 'success');
            onDelete();
            onClose();
        } catch (e) {
            error(t('botModal.errorDelete') as string);
        }
    };

    const confirmClearHistory = async () => {
        setClearing(true);
        setClearConfirmOpen(false);
        try {
            await window.api.clearHistory(bot.id);
            success(t('botModal.successClear') as string, "Fatto");
        } catch (e) {
            error(t('botModal.errorClear') as string);
        } finally {
            setClearing(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const res = await window.api.exportSingleBot(bot.id);
            if (res.success && res.path) {
                success(t('botModal.successExport') as string, res.path);
            } else if (!res.success && res.error) {
                error(`${t('botModal.errorExport')} ${res.error}`);
            }
        } catch (e: any) {
            error(`${t('botModal.errorExport')} ${e.message || String(e)}`);
        } finally {
            setIsExporting(false);
        }
    };

    // Shared input class
    const inputCls = "w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.15)] transition-all text-sm";
    const labelCls = "text-micro text-outline-variant mb-1.5 flex items-center gap-1.5 block";

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-6xl rounded-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-outline-variant/10 bg-surface-container-lowest flex-shrink-0">
                    <div>
                        <h2 className="font-headline text-xl font-bold text-on-surface">{t('botModal.editTitle')}</h2>
                        <p className="text-nano text-outline-variant/50 mt-0.5">
                            BOT_ID: 0x{bot.id.toString(16).toUpperCase().padStart(4, '0')} · <span className="text-primary/60">{bot.name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 text-outline-variant hover:text-on-surface hover:bg-surface-container-highest/50 rounded transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-outline-variant/10 px-6 bg-surface-container-lowest">
                    {[
                        { key: 'general', icon: Settings, label: t('templateEditor.tabGeneral') || 'Generale' },
                        { key: 'templates', icon: LayoutTemplate, label: t('templateEditor.tabTemplates') || 'Template' },
                    ].map(({ key, icon: Icon, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-micro transition-colors border-b-2 ${
                                activeTab === key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-outline-variant/50 hover:text-on-surface-variant'
                            }`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Fields */}
                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'general' ? (
                        <div className="grid grid-cols-2 gap-8 items-start">
                            {/* Left Column */}
                            <div className="space-y-5">
                                <div>
                                    <label className={labelCls}>{t('botModal.nameLabel')}</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                                        className={inputCls} placeholder={t('botModal.namePlaceholder') as string} />
                                </div>

                                <div>
                                    <label className={labelCls}>{t('botModal.tokenLabel')}</label>
                                    <div className="relative">
                                        <input
                                            type={showToken ? 'text' : 'password'}
                                            value={token} onChange={e => setToken(e.target.value)}
                                            className={inputCls + " pr-10 font-mono text-xs"}
                                            placeholder={t('botModal.tokenPlaceholder') as string}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowToken(!showToken)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showToken
                                                ? <EyeOff size={14} />
                                                : <Eye size={14} />
                                            }
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>{t('botModal.channelLabel')}</label>
                                    <input type="text" value={channelId} onChange={e => setChannelId(e.target.value)}
                                        className={inputCls + " font-mono text-xs"}
                                        placeholder={t('botModal.channelPlaceholder') as string} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>{t('botModal.startDateLabel')}</label>
                                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                            className={inputCls + " [color-scheme:dark]"} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>{t('botModal.activeLabel')}</label>
                                        <div
                                            onClick={() => setIsActive(!isActive)}
                                            className={`w-full h-[46px] rounded-lg border flex items-center px-4 cursor-pointer transition-all text-sm font-medium ${
                                                isActive
                                                    ? 'bg-success/10 border-success/30 text-success'
                                                    : 'bg-error/10 border-error/20 text-error'
                                            }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isActive ? 'bg-success status-dot-active' : 'bg-error status-dot-stopped'}`} />
                                            {isActive ? t('botModal.statusActive') : t('botModal.statusDisabled')}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>{t('botModal.notificationsLabel')}</label>
                                    <div
                                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                        className={`w-full h-[46px] rounded-lg border flex items-center px-4 cursor-pointer transition-all text-sm font-medium ${
                                            notificationsEnabled
                                                ? 'bg-success/10 border-success/30 text-success'
                                                : 'bg-surface-container-lowest border-outline-variant/15 text-on-surface-variant/50'
                                        }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${notificationsEnabled ? 'bg-success status-dot-active' : 'bg-outline-variant/40'}`} />
                                        {notificationsEnabled ? t('botModal.statusEnabled') : t('botModal.statusDisabled')}
                                    </div>
                                    <p className="text-nano text-outline-variant/50 mt-1">{t('botModal.notificationsHint')}</p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8 flex flex-col h-full">
                                {/* Interval */}
                                <div>
                                    <label className={labelCls}>
                                        <Clock size={11} />
                                        {t('botModal.intervalLabel')}
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range" min="1" max="120" value={checkInterval}
                                            onChange={e => setCheckInterval(Number(e.target.value))}
                                            className="flex-1 h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="ghost-border bg-surface-container-lowest rounded-lg px-3 py-2 text-primary font-mono text-sm min-w-[80px] text-center">
                                            {checkInterval} min
                                        </div>
                                    </div>
                                    <p className="text-nano text-outline-variant/50 mt-1">{t('botModal.intervalHint')}</p>
                                </div>

                                {/* Quiet Hours */}
                                <div>
                                    <label className={labelCls}>
                                        <Clock size={11} />
                                        {t('botModal.quietHoursLabel')}
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-nano text-outline-variant/40 mb-1 block">{t('botModal.timeFrom')}</label>
                                            <input type="time" value={sendFrom} onChange={e => setSendFrom(e.target.value)}
                                                className={inputCls + " [color-scheme:dark]"} />
                                        </div>
                                        <div>
                                            <label className="text-nano text-outline-variant/40 mb-1 block">{t('botModal.timeUntil')}</label>
                                            <input type="time" value={sendUntil} onChange={e => setSendUntil(e.target.value)}
                                                className={inputCls + " [color-scheme:dark]"} />
                                        </div>
                                    </div>
                                    <p className="text-nano text-outline-variant/50 mt-1.5 leading-tight">{t('botModal.quietHoursHint')}</p>
                                </div>

                                {/* Danger Zone */}
                                <div className="flex-1 flex flex-col justify-end">
                                    <div className="pt-5 border-t border-error/10 space-y-4">
                                        <div className="flex items-center gap-2 text-micro text-error/80">
                                            <AlertTriangle size={14} />
                                            {t('botModal.dangerZone')}
                                        </div>
                                        <div className="bg-error/5 border border-error/15 rounded-xl p-4 flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-error">{t('botModal.clearHistoryTitle')}</h4>
                                                <p className="text-nano text-error/60 mt-1 leading-relaxed whitespace-pre-line">{t('botModal.clearHistoryDesc')}</p>
                                            </div>
                                            <button
                                                onClick={() => setClearConfirmOpen(true)}
                                                disabled={clearing}
                                                className="flex items-center gap-2 bg-error/10 hover:bg-error/20 text-error px-4 py-2 rounded-lg text-xs font-bold transition-all border border-error/20 flex-shrink-0"
                                            >
                                                <Database size={13} />
                                                {clearing ? '...' : t('botModal.clearHistoryBtn')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Export zone */}
                                    <div className="pt-5 border-t border-outline-variant/10 space-y-4 mt-4">
                                        <div className="flex items-center gap-2 text-micro text-outline-variant/50">
                                            <Download size={14} />
                                            {t('botModal.shareZone')}
                                        </div>
                                        <div className="ghost-border bg-primary/5 rounded-xl p-4 flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-primary/80">{t('botModal.exportTitle')}</h4>
                                                <p className="text-nano text-primary/40 mt-1 leading-relaxed whitespace-pre-line">{t('botModal.exportDesc')}</p>
                                            </div>
                                            <button
                                                onClick={handleExport}
                                                disabled={isExporting}
                                                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-xs font-bold transition-all border border-primary/20 flex-shrink-0"
                                            >
                                                <Download size={13} />
                                                {isExporting ? '...' : t('botModal.exportBtn')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <TemplateEditor label={t('templateEditor.templateStartup') as string} value={templateStartup} onChange={setTemplateStartup} defaultTemplate="🟢 <b>Bot Avviato</b>" hideChips={true} />
                            <TemplateEditor label={t('templateEditor.templateNews') as string} value={templateNews} onChange={setTemplateNews} defaultTemplate="📰 <b>{{feedName}}</b>&#10;&#10;<b>{{title}}</b>&#10;&#10;🔗 <a href='{{link}}'>Leggi l'articolo completo</a>" />
                            <TemplateEditor label={t('templateEditor.templatePodcast') as string} value={templatePodcast} onChange={setTemplatePodcast} defaultTemplate="🎙 <b>{{feedName}}</b>&#10;&#10;<i>{{title}}</i>&#10;&#10;{{summary}}&#10;&#10;🎧 <a href='{{link}}'>Ascolta l'episodio</a>" />
                            <TemplateEditor label={t('templateEditor.templateYoutube') as string} value={templateYoutube} onChange={setTemplateYoutube} defaultTemplate="🎬 <b>{{feedName}}</b>&#10;&#10;<b>{{title}}</b>&#10;&#10;▶️ <a href='{{link}}'>Guarda il video</a>" />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest flex justify-between items-center flex-shrink-0">
                    <button
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="flex items-center gap-2 text-error/70 hover:text-error transition-colors text-sm px-4 py-2 hover:bg-error/10 rounded-lg border border-transparent hover:border-error/20"
                    >
                        <Trash2 size={14} />
                        {t('botModal.delete')}
                    </button>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                            {t('botModal.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !name.trim()}
                            className="flex items-center gap-2 ignition-btn px-6 py-2 rounded-lg text-sm font-headline font-bold text-on-primary-fixed disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                        >
                            <Save size={14} />
                            {saving ? '...' : t('botModal.save')}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDialog isOpen={deleteConfirmOpen} title={t('botModal.deleteTitle') as string} message={t('botModal.deletePrompt') as string} confirmText={t('botModal.confirmDelete') as string} onConfirm={confirmDelete} onCancel={() => setDeleteConfirmOpen(false)} />
            <ConfirmDialog isOpen={clearConfirmOpen} title={t('botModal.confirmClearHistoryTitle') as string} message={t('botModal.confirmClearHistoryPrompt') as string} confirmText={t('botModal.confirmClearHistoryBtn') as string} onConfirm={confirmClearHistory} onCancel={() => setClearConfirmOpen(false)} />
        </div>
    );
}
