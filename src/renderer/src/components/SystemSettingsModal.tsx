import React, { useState, useEffect } from 'react';
import { Database, Download, FileCode, Globe, Zap, ShieldCheck, Upload, X, RefreshCw, Loader2, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { useTranslation } from '../locales/I18nContext';
import { flagsList } from './IntroScreen';
import { useToast } from './ui/Toast';
import type { Updater } from '../hooks/useUpdater';
import { GuideModal } from './GuideModal';
import { openManual } from '../lib/docs';

interface Props { onClose: () => void; updater?: Updater; }

export function SystemSettingsModal({ onClose, updater }: Props) {
    const { toast, success, error } = useToast();
    const { locale, setLocale, t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'general' | 'backup' | 'performance'>('general');
    const [showGuide, setShowGuide] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [performanceMode, setPerformanceMode] = useState(false);

    useEffect(() => {
        window.api.getPerformanceMode().then(setPerformanceMode);
    }, []);

    const handleTogglePerformanceMode = async (enabled: boolean) => {
        setPerformanceMode(enabled);
        document.body.classList.toggle('performance-mode', enabled);
        await window.api.setPerformanceMode(enabled);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await window.api.exportDatabase();
            if (result.success) {
                success(`${t('systemSettings.toasts.dbExportSuccessMsg')}\n${result.path}`, t('systemSettings.toasts.dbExportSuccessTitle'));
            } else if (result.error !== 'Cancelled') {
                error(`${t('systemSettings.toasts.dbExportErrorMsg')}\n${result.error}`, t('systemSettings.toasts.dbExportErrorTitle'));
            }
        } catch (e) { error(t('systemSettings.toasts.fsError')); }
        finally { setIsExporting(false); }
    };

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const result = await window.api.importDatabase();
            if (result.success === false && result.error !== 'Cancelled' && result.error !== 'Cancelled by user') {
                error(`${t('systemSettings.toasts.dbImportErrorMsg')}\n${result.error}`, t('systemSettings.toasts.dbImportErrorTitle'));
            }
        } catch (e) { error(t('systemSettings.toasts.fsError')); }
        finally { setIsImporting(false); }
    };

    const handleExportConfig = async () => {
        setIsExporting(true);
        try {
            const result = await window.api.exportConfig();
            if (result.success && result.path) {
                success(`${t('systemSettings.toasts.configExportSuccessMsg')}\n${result.path}`, t('systemSettings.toasts.configExportSuccessTitle'));
            } else if (!result.success && result.error !== 'Cancelled') {
                error(`${t('systemSettings.toasts.configExportErrorMsg')}\n${result.error}`, t('systemSettings.toasts.configExportErrorTitle'));
            }
        } catch (e) { error(t('systemSettings.toasts.fsError')); }
        finally { setIsExporting(false); }
    };

    const handleImportConfig = async () => {
        setIsImporting(true);
        try {
            const result = await window.api.importConfig();
            if (result.success) {
                success(t('systemSettings.toasts.configImportSuccessMsg'), t('systemSettings.toasts.configImportSuccessTitle'));
            } else if (!result.success && result.error !== 'Cancelled') {
                error(`${t('systemSettings.toasts.configImportErrorMsg')}\n${result.error}`, t('systemSettings.toasts.configImportErrorTitle'));
            }
        } catch (e) { error(t('systemSettings.toasts.fsError')); }
        finally { setIsImporting(false); }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-4xl rounded-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-outline-variant/15 bg-surface-container-high/50">
                    <div>
                        <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-3">
                            <ShieldCheck size={20}  className="text-primary drop-glow-primary" />
                            {t('systemSettings.title')}
                        </h2>
                        <p className="text-nano text-outline-variant/50 mt-1">{t('systemSettings.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-outline-variant hover:text-on-surface hover:bg-surface-container-highest/50 rounded transition-colors">
                        <X size={18}  />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-surface-container-lowest border-b border-outline-variant/15 px-6 pt-2">
                    {[
                        { key: 'general',     label: t('systemSettings.tabGeneral')     || 'Generale'   },
                        { key: 'backup',      label: t('systemSettings.tabBackup')      || 'Backup'     },
                        { key: 'performance', label: t('systemSettings.tabPerformance') || 'Performance' },
                    ].map(({ key, label }) => (
                        <button key={key} onClick={() => setActiveTab(key as any)}
                            className={`px-5 py-3 text-micro border-b-2 transition-all ${
                                activeTab === key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-outline-variant/50 hover:text-on-surface-variant'
                            }`}
                        >{label}</button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'general' && (
                        <div className="max-w-md space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">
                                    <Globe size={13}  />
                                    {t('systemSettings.langSection.title')}
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed">{t('systemSettings.langSection.desc')}</p>
                                <div className="flex flex-wrap items-center gap-2 bg-surface-container-lowest rounded-xl p-3 ghost-border w-max">
                                    {flagsList.map((lang) => {
                                        const Flag = lang.component;
                                        const isActive = locale === lang.id;
                                        return (
                                            <button
                                                key={lang.id}
                                                onClick={() => setLocale(lang.id)}
                                                className={`p-2 rounded-lg transition-all ${
                                                    isActive
                                                        ? 'bg-primary/15 ring-1 ring-primary/40'
                                                        : 'opacity-50 hover:opacity-100 hover:bg-surface-container'
                                                }`}
                                                title={lang.label}
                                            >
                                                <div className="w-6 h-4 overflow-hidden rounded shadow-sm">
                                                    <Flag className="w-full h-full object-cover" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Aggiornamenti */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">
                                    <RefreshCw size={13} />
                                    {t('updater.sectionTitle')}
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed">{t('updater.sectionDesc')}</p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => updater?.check(true)}
                                        disabled={!updater || updater.status === 'checking' || updater.status === 'downloading'}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg ghost-border bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all text-primary text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {updater?.status === 'checking'
                                            ? <Loader2 size={15} className="animate-spin" />
                                            : <RefreshCw size={15} />}
                                        {t('updater.checkBtn')}
                                    </button>
                                    <div className="text-nano">
                                        {updater?.status === 'available' || updater?.status === 'downloading' || updater?.status === 'downloaded' ? (
                                            <span className="flex items-center gap-1.5 text-primary drop-glow-primary">
                                                <Sparkles size={12} />
                                                {t('updater.newBadge').replace('{{version}}', updater.newVersion || '')}
                                            </span>
                                        ) : updater?.status === 'uptodate' ? (
                                            <span className="flex items-center gap-1.5 text-success">
                                                <CheckCircle2 size={12} />
                                                {t('updater.upToDate')}
                                            </span>
                                        ) : (
                                            <span className="text-outline-variant/40 font-mono">v{updater?.currentVersion || ''}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Documentazione */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">
                                    <BookOpen size={13} />
                                    {t('quickGuide.docsSection')}
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed">{t('quickGuide.docsDesc')}</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowGuide(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg ghost-border bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all text-primary text-sm font-bold"
                                    >
                                        <BookOpen size={15} />
                                        {t('quickGuide.btn')}
                                    </button>
                                    <button
                                        onClick={() => openManual(locale)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg ghost-border bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/30 transition-all text-secondary text-sm font-bold"
                                    >
                                        <Download size={15} />
                                        {t('quickGuide.manualBtn')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'backup' && (
                        <div className="grid grid-cols-2 gap-8 items-start">
                            {/* Database */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">
                                    <Database size={13}  />
                                    {t('systemSettings.dbSection.title')}
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed">{t('systemSettings.dbSection.desc')}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleExport} disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl ghost-border bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all text-primary disabled:opacity-40">
                                        <Download size={24}  className="opacity-80" />
                                        <span className="text-sm font-bold">{t('systemSettings.dbSection.exportBtn')}</span>
                                        <span className="text-nano text-primary/40 text-center">{t('systemSettings.dbSection.exportHint')}</span>
                                    </button>
                                    <button onClick={handleImport} disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl ghost-border bg-tertiary/5 hover:bg-tertiary/10 hover:border-tertiary/30 transition-all text-tertiary disabled:opacity-40">
                                        <Upload size={24}  className="opacity-80" />
                                        <span className="text-sm font-bold">{t('systemSettings.dbSection.importBtn')}</span>
                                        <span className="text-nano text-tertiary/40 text-center">{t('systemSettings.dbSection.importHint')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* JSON Config */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">
                                    <FileCode size={13}  />
                                    {t('systemSettings.jsonSection.title')}
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed">{t('systemSettings.jsonSection.desc')}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleExportConfig} disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl ghost-border bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all text-primary disabled:opacity-40">
                                        <Download size={20}  />
                                        <span className="text-sm font-bold">{t('systemSettings.jsonSection.exportBtn')}</span>
                                        <span className="text-nano text-primary/40 text-center mt-1">{t('systemSettings.jsonSection.exportHint')}</span>
                                    </button>
                                    <button onClick={handleImportConfig} disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl ghost-border bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/30 transition-all text-secondary disabled:opacity-40">
                                        <Upload size={20}  />
                                        <span className="text-sm font-bold">{t('systemSettings.jsonSection.importBtn')}</span>
                                        <span className="text-nano text-secondary/40 text-center mt-1">{t('systemSettings.jsonSection.importHint')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="max-w-lg space-y-6">
                            <div className="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">
                                <Zap size={13}  />
                                {t('systemSettings.perfSection.title')}
                            </div>
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                {t('systemSettings.perfSection.desc')}
                            </p>

                            {/* Toggle */}
                            <label className="flex items-center justify-between p-4 rounded-xl ghost-border bg-surface-container-lowest cursor-pointer hover:bg-surface-container transition-colors">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-on-surface font-headline">
                                        {t('systemSettings.perfSection.toggleLabel')}
                                    </p>
                                    <p className="text-nano text-outline-variant/50">
                                        {t('systemSettings.perfSection.toggleHint')}
                                    </p>
                                </div>
                                <div
                                    onClick={() => handleTogglePerformanceMode(!performanceMode)}
                                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                                        performanceMode ? 'bg-success/80' : 'bg-surface-container-highest'
                                    }`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
                                        performanceMode
                                            ? 'translate-x-5 bg-on-primary-fixed'
                                            : 'translate-x-0 bg-outline-variant'
                                    }`} />
                                </div>
                            </label>

                            {/* What gets disabled */}
                            <div className="space-y-2 text-xs text-outline-variant/60">
                                <p className="text-micro text-outline-variant/40 pb-1">{t('systemSettings.perfSection.disabledList')}</p>
                                {['scanline', 'blur', 'glow', 'anim'].map((k) => (
                                    <div key={k} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/30 flex-shrink-0" />
                                        {t(`systemSettings.perfSection.item_${k}`)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-outline-variant/15 bg-surface-container-low/40 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-sm font-headline font-bold ignition-btn text-on-primary-fixed shadow-lg transition-all active:scale-95"
                    >
                        {t('systemSettings.close')}
                    </button>
                </div>
            </div>

            {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
        </div>
    );
}
