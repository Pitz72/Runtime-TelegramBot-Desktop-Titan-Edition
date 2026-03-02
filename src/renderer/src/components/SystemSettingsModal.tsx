import React, { useState } from 'react';
import { Database, Download, FileJson, Globe, Shield, Upload, X } from 'lucide-react';
import { useTranslation } from '../locales/I18nContext';
import { flagsList } from './IntroScreen';
import { useToast } from './ui/Toast';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface Props {
    onClose: () => void;
}

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
        } catch (e) {
            console.error(e);
            error(t('systemSettings.toasts.fsError'));
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const result = await window.api.importDatabase();
            if (result.success === false && result.error !== 'Cancelled' && result.error !== 'Cancelled by user') {
                error(`${t('systemSettings.toasts.dbImportErrorMsg')}\n${result.error}`, t('systemSettings.toasts.dbImportErrorTitle'));
            }
        } catch (e) {
            console.error(e);
            error(t('systemSettings.toasts.fsError'));
        } finally {
            setIsImporting(false);
        }
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
        } catch (e: any) {
            console.error(e);
            error(t('systemSettings.toasts.fsError'));
        } finally {
            setIsExporting(false);
        }
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
        } catch (e) {
            console.error(e);
            error(t('systemSettings.toasts.fsError'));
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-dark-900 border border-titan-500/15 rounded-2xl w-full max-w-4xl shadow-2xl shadow-titan-500/5 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-titan-500/10 bg-dark-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Shield className="text-titan-500" size={20} />
                            {t('systemSettings.title')}
                        </h2>
                        <p className="text-xs text-titan-500/40 mt-1">{t('systemSettings.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-600 hover:text-white transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex bg-dark-950 border-b border-titan-500/10 px-6 pt-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'general' ? 'border-titan-400 text-titan-300' : 'border-transparent text-titan-500/50 hover:text-titan-500/80'}`}
                    >
                        {t('systemSettings.tabGeneral')}
                    </button>
                    <button
                        onClick={() => setActiveTab('backup')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'backup' ? 'border-titan-400 text-titan-300' : 'border-transparent text-titan-500/50 hover:text-titan-500/80'}`}
                    >
                        {t('systemSettings.tabBackup')}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'general' && (
                        <div className="max-w-md">
                            {/* Language Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-titan-400 text-xs font-bold uppercase tracking-widest border-b border-titan-500/10 pb-2">
                                    <Globe size={14} />
                                    {t('systemSettings.langSection.title')}
                                </div>
                                <p className="text-xs text-neutral-400 mb-4">
                                    {t('systemSettings.langSection.desc')}
                                </p>

                                <div className="flex flex-wrap items-center gap-2 bg-dark-950 rounded-xl p-3 border border-titan-500/10 w-max">
                                    {flagsList.map((lang) => {
                                        const Flag = lang.component;
                                        const isActive = locale === lang.id;

                                        return (
                                            <button
                                                key={lang.id}
                                                onClick={() => setLocale(lang.id)}
                                                className={`p-2 rounded-lg transition-all ${isActive ? 'bg-titan-500/20 ring-1 ring-titan-500/50' : 'opacity-50 hover:opacity-100 hover:bg-dark-800'}`}
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
                            {/* Database Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-titan-400 text-xs font-bold uppercase tracking-widest border-b border-titan-500/10 pb-2">
                                    <Database size={14} />
                                    {t('systemSettings.dbSection.title')}
                                </div>

                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    {t('systemSettings.dbSection.desc')}
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleExport}
                                        disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-titan-500/20 bg-titan-500/5 hover:bg-titan-500/10 hover:border-titan-500/40 transition-all text-titan-300 disabled:opacity-50"
                                    >
                                        <Download size={24} className="mb-1 opacity-80" />
                                        <span className="text-sm font-bold">{t('systemSettings.dbSection.exportBtn')}</span>
                                        <span className="text-[10px] text-titan-500/50 text-center">{t('systemSettings.dbSection.exportHint')}</span>
                                    </button>

                                    <button
                                        onClick={handleImport}
                                        disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all text-amber-300 disabled:opacity-50"
                                    >
                                        <Upload size={24} className="mb-1 opacity-80 text-amber-400" />
                                        <span className="text-sm font-bold">{t('systemSettings.dbSection.importBtn')}</span>
                                        <span className="text-[10px] text-amber-500/50 text-center">{t('systemSettings.dbSection.importHint')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Bot Profiles Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-titan-400 text-xs font-bold uppercase tracking-widest border-b border-titan-500/10 pb-2">
                                    <FileJson size={14} />
                                    {t('systemSettings.jsonSection.title')}
                                </div>

                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    {t('systemSettings.jsonSection.desc')}
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleExportConfig}
                                        disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-titan-500/20 bg-titan-500/5 hover:bg-titan-500/10 hover:border-titan-500/40 transition-all text-titan-300 disabled:opacity-50"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Download size={20} />
                                            <span className="text-sm font-bold">{t('systemSettings.jsonSection.exportBtn')}</span>
                                        </div>
                                        <span className="text-[10px] text-titan-500/50 text-center mt-1">{t('systemSettings.jsonSection.exportHint')}</span>
                                    </button>

                                    <button
                                        onClick={handleImportConfig}
                                        disabled={isExporting || isImporting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/40 transition-all text-green-300 disabled:opacity-50"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Upload size={20} />
                                            <span className="text-sm font-bold">{t('systemSettings.jsonSection.importBtn')}</span>
                                        </div>
                                        <span className="text-[10px] text-green-500/50 text-center mt-1">{t('systemSettings.jsonSection.importHint')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-titan-500/10 bg-dark-800/30 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-sm font-medium bg-titan-600 hover:bg-titan-500 text-white shadow-lg transition-all active:scale-95"
                    >
                        {t('systemSettings.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
