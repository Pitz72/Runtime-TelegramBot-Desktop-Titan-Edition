import React, { useState } from 'react';
import { Database, DownloadSimple, FileJs, Globe, ShieldCheck, UploadSimple, X } from '@phosphor-icons/react';
import { useTranslation } from '../locales/I18nContext';
import { flagsList } from './IntroScreen';
import { useToast } from './ui/Toast';

interface Props { onClose: () => void; }

export function SystemSettingsModal({ onClose }: Props) {
    const { toast, success, error } = useToast();
    const { locale, setLocale, t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'general' | 'backup'>('general');
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

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
                            <ShieldCheck size={20} weight="duotone" className="text-primary drop-glow-primary" />
                            {t('systemSettings.title')}
                        </h2>
                        <p className="text-nano text-outline-variant/50 mt-1">{t('systemSettings.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-outline-variant hover:text-on-surface hover:bg-surface-container-highest/50 rounded transition-colors">
                        <X size={18} weight="bold" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-surface-container-lowest border-b border-outline-variant/15 px-6 pt-2">
                    {[
                        { key: 'general', label: t('systemSettings.tabGeneral') || 'Generale' },
                        { key: 'backup',  label: t('systemSettings.tabBackup')  || 'Backup'   },
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
                        <div className="max-w-md">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">
                                    <Globe size={13} weight="duotone" />
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
                        </div>
                    )}

                    {activeTab === 'backup' && (
                        <div className="grid grid-cols-2 gap-8 items-start">
                            {/* Database */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">
                                    <Database size={13} weight="duotone" />
                                    {t('systemSettings.dbSection.title')}
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed">{t('systemSettings.dbSection.desc')}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleExport} disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl ghost-border bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all text-primary disabled:opacity-40">
                                        <DownloadSimple size={24} weight="duotone" className="opacity-80" />
                                        <span className="text-sm font-bold">{t('systemSettings.dbSection.exportBtn')}</span>
                                        <span className="text-nano text-primary/40 text-center">{t('systemSettings.dbSection.exportHint')}</span>
                                    </button>
                                    <button onClick={handleImport} disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl ghost-border bg-tertiary/5 hover:bg-tertiary/10 hover:border-tertiary/30 transition-all text-tertiary disabled:opacity-40">
                                        <UploadSimple size={24} weight="duotone" className="opacity-80" />
                                        <span className="text-sm font-bold">{t('systemSettings.dbSection.importBtn')}</span>
                                        <span className="text-nano text-tertiary/40 text-center">{t('systemSettings.dbSection.importHint')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* JSON Config */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-micro text-outline-variant/60 border-b border-outline-variant/10 pb-2">
                                    <FileJs size={13} weight="duotone" />
                                    {t('systemSettings.jsonSection.title')}
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed">{t('systemSettings.jsonSection.desc')}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleExportConfig} disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl ghost-border bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all text-primary disabled:opacity-40">
                                        <DownloadSimple size={20} weight="duotone" />
                                        <span className="text-sm font-bold">{t('systemSettings.jsonSection.exportBtn')}</span>
                                        <span className="text-nano text-primary/40 text-center mt-1">{t('systemSettings.jsonSection.exportHint')}</span>
                                    </button>
                                    <button onClick={handleImportConfig} disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl ghost-border bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/30 transition-all text-secondary disabled:opacity-40">
                                        <UploadSimple size={20} weight="duotone" />
                                        <span className="text-sm font-bold">{t('systemSettings.jsonSection.importBtn')}</span>
                                        <span className="text-nano text-secondary/40 text-center mt-1">{t('systemSettings.jsonSection.importHint')}</span>
                                    </button>
                                </div>
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
        </div>
    );
}
