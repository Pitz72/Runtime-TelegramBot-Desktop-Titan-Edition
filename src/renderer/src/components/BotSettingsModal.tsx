import React, { useState } from 'react';
import { Save, Trash2, AlertTriangle, Clock, X, Database, Settings, LayoutTemplate, Download } from 'lucide-react';
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

    const [activeTab, setActiveTab] = useState<'general' | 'templates'>('general');

    const { toast, success, error } = useToast();

    // Dialog States
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            await window.api.updateBot({
                id: bot.id,
                name: name.trim(),
                token,
                channelId,
                isActive,
                startDate,
                checkInterval,
                notificationsEnabled,
                sendFrom,
                sendUntil,
                templatePodcast,
                templateNews,
                templateYoutube,
                templateStartup
            });
            onUpdate({
                ...bot,
                name: name.trim(),
                token,
                channel_id: channelId,
                is_active: isActive,
                start_date: startDate,
                check_interval: checkInterval,
                notifications_enabled: notificationsEnabled,
                send_from: sendFrom,
                send_until: sendUntil,
                template_podcast: templatePodcast,
                template_news: templateNews,
                template_youtube: templateYoutube,
                template_startup: templateStartup
            });
            onClose();
        } catch (e) {
            console.error('Failed to save bot settings:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleteConfirmOpen(true);
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

    const handleClearHistory = async () => {
        setClearConfirmOpen(true);
    };

    const confirmClearHistory = async () => {
        setClearing(true);
        setClearConfirmOpen(false);
        try {
            await window.api.clearHistory(bot.id);
            success(t('botModal.successClear') as string, "Fatto");
        } catch (e) {
            console.error("Errore pulizia history:", e);
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

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-dark-900 border border-titan-500/15 rounded-2xl w-full max-w-4xl shadow-2xl shadow-titan-500/5 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-titan-500/10 bg-dark-800/50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">{t('botModal.editTitle')}</h2>
                        <p className="text-xs text-titan-500/40 mt-0.5">Edit: <span className="text-titan-400">{bot.name}</span></p>
                    </div>
                    <button onClick={onClose} className="text-neutral-600 hover:text-white transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-titan-500/10 px-6 bg-dark-800/30">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'general' ? 'border-titan-500 text-titan-400' : 'border-transparent text-titan-500/50 hover:text-titan-500/80'}`}
                    >
                        <Settings size={14} />
                        {t('templateEditor.tabGeneral') || 'Generale'}
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'templates' ? 'border-titan-500 text-titan-400' : 'border-transparent text-titan-500/50 hover:text-titan-500/80'}`}
                    >
                        <LayoutTemplate size={14} />
                        {t('templateEditor.tabTemplates') || 'Template'}
                    </button>
                </div>

                {/* Fields - Scrollable area */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {activeTab === 'general' ? (
                        <div className="grid grid-cols-2 gap-8 items-start">
                            {/* Left Column (Main Data) */}
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-titan-500/50 uppercase tracking-wider">{t('botModal.nameLabel')}</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-dark-950 border border-titan-500/10 rounded-lg p-3 text-white focus:outline-none focus:border-titan-500/40 transition-colors"
                                        placeholder={t('botModal.namePlaceholder') as string}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-titan-500/50 uppercase tracking-wider">{t('botModal.tokenLabel')}</label>
                                    <input
                                        type="text"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        className="w-full bg-dark-950 border border-titan-500/10 rounded-lg p-3 text-white focus:outline-none focus:border-titan-500/40 transition-colors font-mono text-xs"
                                        placeholder={t('botModal.tokenPlaceholder') as string}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-titan-500/50 uppercase tracking-wider">{t('botModal.channelLabel')}</label>
                                    <input
                                        type="text"
                                        value={channelId}
                                        onChange={(e) => setChannelId(e.target.value)}
                                        className="w-full bg-dark-950 border border-titan-500/10 rounded-lg p-3 text-white focus:outline-none focus:border-titan-500/40 transition-colors font-mono text-xs"
                                        placeholder={t('botModal.channelPlaceholder') as string}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-titan-500/50 uppercase tracking-wider">{t('botModal.startDateLabel')}</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full bg-dark-950 border border-titan-500/10 rounded-lg p-3 text-white focus:outline-none focus:border-titan-500/40 transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-titan-500/50 uppercase tracking-wider">{t('botModal.activeLabel')}</label>
                                        <div
                                            onClick={() => setIsActive(!isActive)}
                                            className={`w-full h-[46px] rounded-lg border flex items-center px-4 cursor-pointer transition-all ${isActive ? 'bg-titan-500/10 border-titan-500/20 text-titan-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-titan-400 status-dot-active' : 'bg-red-500 status-dot-stopped'}`}></div>
                                            {isActive ? 'Active' : 'Disabled'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5 mt-4">
                                    <label className="text-[10px] font-bold text-titan-500/50 uppercase tracking-wider">{t('botModal.notificationsLabel')}</label>
                                    <div
                                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                        className={`w-full h-[46px] rounded-lg border flex items-center px-4 cursor-pointer transition-all ${notificationsEnabled ? 'bg-titan-500/10 border-titan-500/20 text-titan-400' : 'bg-dark-950 border-titan-500/10 text-neutral-500'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full mr-2 ${notificationsEnabled ? 'bg-titan-400 status-dot-active' : 'bg-neutral-600 status-dot-stopped'}`}></div>
                                        {notificationsEnabled ? 'Enabled' : 'Disabled'}
                                    </div>
                                    <p className="text-[9px] text-neutral-700">{t('botModal.notificationsHint')}</p>
                                </div>
                            </div>

                            {/* Right Column (Secondary / Danger) */}
                            <div className="space-y-8 flex flex-col h-full">
                                {/* Check Interval */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-titan-500/50 uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock size={11} />
                                        {t('botModal.intervalLabel')}
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="1"
                                            max="120"
                                            value={checkInterval}
                                            onChange={(e) => setCheckInterval(Number(e.target.value))}
                                            className="flex-1 h-1.5 bg-dark-950 rounded-full appearance-none cursor-pointer accent-titan-500"
                                        />
                                        <div className="bg-dark-950 border border-titan-500/10 rounded-lg px-3 py-2 text-titan-400 font-mono text-sm min-w-[80px] text-center">
                                            {checkInterval} min
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-neutral-700">{t('botModal.intervalHint')}</p>
                                </div>

                                {/* Quiet Hours */}
                                <div className="space-y-3 pt-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-titan-500/50 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <Clock size={11} className="text-titan-500" />
                                            {t('botModal.quietHoursLabel')}
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[9px] text-neutral-500 uppercase">{t('botModal.timeFrom')}</label>
                                                <input
                                                    type="time"
                                                    value={sendFrom}
                                                    onChange={(e) => setSendFrom(e.target.value)}
                                                    className="w-full bg-dark-950 border border-titan-500/10 rounded-lg p-2 text-white focus:outline-none focus:border-titan-500/40 transition-colors [color-scheme:dark] text-sm"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[9px] text-neutral-500 uppercase">{t('botModal.timeUntil')}</label>
                                                <input
                                                    type="time"
                                                    value={sendUntil}
                                                    onChange={(e) => setSendUntil(e.target.value)}
                                                    className="w-full bg-dark-950 border border-titan-500/10 rounded-lg p-2 text-white focus:outline-none focus:border-titan-500/40 transition-colors [color-scheme:dark] text-sm"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-neutral-700 leading-tight mt-1.5">{t('botModal.quietHoursHint')}</p>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="flex-1 flex flex-col justify-end mt-4">
                                    <div className="pt-6 border-t border-red-500/10 space-y-4">
                                        <div className="flex items-center gap-2 text-red-500/60 text-[10px] font-bold uppercase tracking-widest">
                                            <AlertTriangle size={14} />
                                            {t('botModal.dangerZone')}
                                        </div>

                                        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-red-400/80">{t('botModal.clearHistoryTitle')}</h4>
                                                <p className="text-[10px] text-red-400/40 leading-relaxed mt-1 whitespace-pre-line">
                                                    {t('botModal.clearHistoryDesc')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleClearHistory}
                                                disabled={clearing}
                                                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-red-500/20"
                                            >
                                                <Database size={14} />
                                                {clearing ? '...' : t('botModal.clearHistoryBtn')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Zona Export */}
                                    <div className="pt-6 border-t border-titan-500/10 space-y-4">
                                        <div className="flex items-center gap-2 text-titan-500/60 text-[10px] font-bold uppercase tracking-widest">
                                            <Download size={14} />
                                            {t('botModal.shareZone')}
                                        </div>

                                        <div className="bg-titan-500/5 border border-titan-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-titan-400">{t('botModal.exportTitle')}</h4>
                                                <p className="text-[10px] text-titan-400/50 leading-relaxed mt-1 whitespace-pre-line">
                                                    {t('botModal.exportDesc')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleExport}
                                                disabled={isExporting}
                                                className="flex items-center gap-2 bg-titan-500/10 hover:bg-titan-500/20 text-titan-400 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-titan-500/20"
                                            >
                                                <Download size={14} />
                                                {isExporting ? '...' : t('botModal.exportBtn')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <TemplateEditor
                                label={t('templateEditor.templateStartup') as string}
                                value={templateStartup}
                                onChange={setTemplateStartup}
                                defaultTemplate="🟢 <b>Bot Avviato</b>"
                                hideChips={true}
                            />

                            <TemplateEditor
                                label={t('templateEditor.templateNews') as string}
                                value={templateNews}
                                onChange={setTemplateNews}
                                defaultTemplate="📰 <b>{{feedName}}</b>&#10;&#10;<b>{{title}}</b>&#10;&#10;🔗 <a href='{{link}}'>Leggi l'articolo completo</a>"
                            />

                            <TemplateEditor
                                label={t('templateEditor.templatePodcast') as string}
                                value={templatePodcast}
                                onChange={setTemplatePodcast}
                                defaultTemplate="🎙 <b>{{feedName}}</b>&#10;&#10;<i>{{title}}</i>&#10;&#10;{{summary}}&#10;&#10;🎧 <a href='{{link}}'>Ascolta l'episodio</a>"
                            />

                            <TemplateEditor
                                label={t('templateEditor.templateYoutube') as string}
                                value={templateYoutube}
                                onChange={setTemplateYoutube}
                                defaultTemplate="🎬 <b>{{feedName}}</b>&#10;&#10;<b>{{title}}</b>&#10;&#10;▶️ <a href='{{link}}'>Guarda il video</a>"
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-titan-500/10 bg-dark-800/30 flex justify-between items-center flex-shrink-0">
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 text-red-400/70 hover:text-red-400 transition-colors text-sm px-4 py-2 hover:bg-red-500/10 rounded-lg"
                    >
                        <Trash2 size={14} />
                        {t('botModal.delete')}
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 rounded-lg text-sm text-neutral-500 hover:text-white transition-colors"
                        >
                            {t('botModal.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !name.trim()}
                            className="flex items-center gap-2 bg-titan-600 hover:bg-titan-500 disabled:bg-neutral-800 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-titan-500/10 transition-all hover:scale-105 active:scale-95"
                        >
                            <Save size={14} />
                            {saving ? '...' : t('botModal.save')}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                title={t('botModal.deleteTitle') as string}
                message={t('botModal.deletePrompt') as string}
                confirmText={t('botModal.confirmDelete') as string}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
            />

            <ConfirmDialog
                isOpen={clearConfirmOpen}
                title={t('botModal.confirmClearHistoryTitle') as string}
                message={t('botModal.confirmClearHistoryPrompt') as string}
                confirmText={t('botModal.confirmClearHistoryBtn') as string}
                onConfirm={confirmClearHistory}
                onCancel={() => setClearConfirmOpen(false)}
            />
        </div>
    );
}
