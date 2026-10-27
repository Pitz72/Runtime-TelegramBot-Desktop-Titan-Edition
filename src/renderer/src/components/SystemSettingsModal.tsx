import React, { useEffect, useState } from 'react';
import {
    Settings, Globe, RefreshCw, Accessibility, Database, Info, Download, Upload, FileCode, BookOpen,
    Heart, Mail, Scale, FileText, CheckCircle2, Sparkles, Github, Power, Archive, FolderOpen,
} from 'lucide-react';
import type { DesktopSettings } from '../../../shared/types';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { SelectField, Switch, Tabs, TabPanel } from './ui/Controls';
import { useToast } from './ui/Toast';
import { flagsList } from './IntroScreen';
import { useTranslation } from '../locales/I18nContext';
import { openManual } from '../lib/docs';
import { DONATE_URL, CONTACT_URL, SOURCE_URL, openLink } from '../lib/links';
import { errorMessage } from '../lib/errors';
import { useUiPreferences, ZOOM_OPTIONS } from '../hooks/useUiPreferences';
import type { Updater } from '../hooks/useUpdater';
import { cn } from '@/lib/utils';
import { RuntimeUtilitiesLogo } from './brand/RuntimeUtilitiesLogo';

interface Props {
    open: boolean;
    onClose: () => void;
    updater?: Updater;
    onBotsImported?: () => void;
    onOpenGuide?: () => void;
}

type Tab = 'general' | 'accessibility' | 'data' | 'about';

function Section({ icon: Icon, title, text, children }: { icon: typeof Globe; title: string; text?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-lg border border-line bg-surface-2 p-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-fg">
                <Icon size={16} className="text-accent" aria-hidden="true" />
                {title}
            </h3>
            {text && <p className="mt-1 text-sm text-fg-3">{text}</p>}
            <div className="mt-4">{children}</div>
        </section>
    );
}

export function SystemSettingsModal({ open, onClose, updater, onBotsImported, onOpenGuide }: Props) {
    const { t, locale, setLocale } = useTranslation();
    const { success, error, toast } = useToast();
    const { zoom, setZoom, reduceMotion, setReduceMotion } = useUiPreferences();
    const [tab, setTab] = useState<Tab>('general');
    const [busy, setBusy] = useState<string | null>(null);
    const [license, setLicense] = useState<{ kind: 'app' | 'third-party'; text: string } | null>(null);

    const [desktop, setDesktop] = useState<DesktopSettings | null>(null);

    useEffect(() => {
        if (!open) return;
        setTab('general');
        window.api.getDesktopSettings?.().then(setDesktop).catch(() => setDesktop(null));
    }, [open]);

    const changeDesktop = async (patch: { closeAction?: DesktopSettings['closeAction']; autoStartEngine?: boolean; openAtLogin?: boolean }) => {
        try {
            setDesktop(await window.api.setDesktopSettings(patch));
        } catch (e) {
            error(errorMessage(e));
        }
    };

    const run = async (key: string, fn: () => Promise<void>) => {
        setBusy(key);
        try { await fn(); } catch (e) { error(errorMessage(e)); } finally { setBusy(null); }
    };

    const exportDb = () => run('exportDb', async () => {
        const r = await window.api.exportDatabase();
        if (r.success) success(r.path ?? '', t('system.data.dbExported'));
        else if (r.error !== 'Cancelled') error(`${t('system.data.failed')} ${r.error}`);
    });
    const importDb = () => run('importDb', async () => {
        const r = await window.api.importDatabase();
        if (!r.success && r.error !== 'Cancelled' && r.error !== 'Cancelled by user') error(`${t('system.data.failed')} ${r.error}`);
    });
    const openBackups = () => run('backups', async () => {
        const r = await window.api.openBackupsFolder();
        if (!r.success) error(`${t('system.data.failed')} ${r.error}`);
    });
    const exportConfig = () => run('exportConfig', async () => {
        const r = await window.api.exportConfig();
        if (r.success) success(r.path ?? '', t('system.data.profilesExported'));
        else if (r.error !== 'Cancelled') error(`${t('system.data.failed')} ${r.error}`);
    });
    const importConfig = () => run('importConfig', async () => {
        const r = await window.api.importConfig();
        if (r.success) {
            // L'elenco dei bot si ricarica da sé (prima bisognava ricaricare l'interfaccia a mano).
            onBotsImported?.();
            success(t('system.data.profilesImported'));
            if (r.paused && r.paused.length > 0) {
                const list = r.paused.map(p => `${p.name} → ${p.pausedFor}`).join('; ');
                toast(t('system.data.profilesImportedPaused').replace('{list}', list), 'warning');
            }
        } else if (r.error !== 'Cancelled') error(`${t('system.data.failed')} ${r.error}`);
    });

    const showLicense = (kind: 'app' | 'third-party') => run(`license-${kind}`, async () => {
        const text = await window.api.readLicense(kind);
        if (text) setLicense({ kind, text });
        else toast(t('system.about.licenseMissing'), 'info');
    });

    const updateStatus = updater?.status;

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                icon={Settings}
                title={t('system.title')}
                description={t('system.subtitle')}
                size="lg"
                bodyClassName="pt-0"
                footer={<Button variant="primary" onClick={onClose}>{t('common.done')}</Button>}
            >
                <div className="sticky top-0 z-10 -mx-6 mb-5 bg-surface-1 px-6 pt-3">
                    <Tabs
                        idBase="system"
                        label={t('system.title')}
                        value={tab}
                        onChange={setTab}
                        items={[
                            { id: 'general', label: t('system.tabGeneral'), icon: Globe },
                            { id: 'accessibility', label: t('system.tabAccessibility'), icon: Accessibility },
                            { id: 'data', label: t('system.tabData'), icon: Database },
                            { id: 'about', label: t('system.tabAbout'), icon: Info },
                        ]}
                    />
                </div>

                <TabPanel idBase="system" id={tab} className="space-y-4">
                    {tab === 'general' && (
                        <>
                            <Section icon={Globe} title={t('system.language.title')} text={t('system.language.text')}>
                                <fieldset>
                                    <legend className="sr-only">{t('system.language.title')}</legend>
                                    <div className="flex flex-wrap gap-2">
                                        {flagsList.map(lang => {
                                            const Flag = lang.component;
                                            const checked = locale === lang.id;
                                            return (
                                                <label
                                                    key={lang.id}
                                                    className={cn(
                                                        'flex cursor-pointer items-center gap-3 rounded-md border px-4 py-2.5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                                                        checked ? 'border-accent bg-surface-4 text-fg' : 'border-line bg-surface-3 text-fg-2 hover:border-line-strong',
                                                    )}
                                                >
                                                    <input type="radio" name="language" value={lang.id} checked={checked} onChange={() => setLocale(lang.id)} className="sr-only" />
                                                    <span className="h-4 w-6 overflow-hidden rounded-sm" aria-hidden="true"><Flag className="h-full w-full" /></span>
                                                    <span className="text-base font-medium" lang={lang.id}>{lang.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </fieldset>
                            </Section>

                            {desktop && (
                                <Section icon={Power} title={t('system.desktop.title')} text={t('system.desktop.text')}>
                                    <div className="space-y-4">
                                        <Switch
                                            checked={desktop.openAtLogin.enabled}
                                            disabled={!desktop.openAtLogin.supported}
                                            onChange={on => changeDesktop({ openAtLogin: on })}
                                            label={t('system.desktop.openAtLogin')}
                                            description={desktop.openAtLogin.supported ? t('system.desktop.openAtLoginHint') : t('system.desktop.openAtLoginUnsupported')}
                                        />
                                        <div className="h-px bg-line" aria-hidden="true" />
                                        <Switch
                                            checked={desktop.autoStartEngine}
                                            onChange={on => changeDesktop({ autoStartEngine: on })}
                                            label={t('system.desktop.autoStart')}
                                            description={t('system.desktop.autoStartHint')}
                                        />
                                        <div className="h-px bg-line" aria-hidden="true" />
                                        <SelectField
                                            label={t('system.desktop.close')}
                                            hint={desktop.trayAvailable ? t('system.desktop.closeHint') : t('system.desktop.noTray')}
                                            value={desktop.closeAction}
                                            onChange={e => changeDesktop({ closeAction: e.target.value as DesktopSettings['closeAction'] })}
                                            containerClassName="max-w-md"
                                        >
                                            <option value="ask">{t('system.desktop.closeAsk')}</option>
                                            <option value="tray" disabled={!desktop.trayAvailable}>{t('system.desktop.closeTray')}</option>
                                            <option value="quit">{t('system.desktop.closeQuit')}</option>
                                        </SelectField>
                                    </div>
                                </Section>
                            )}

                            <Section icon={RefreshCw} title={t('updater.sectionTitle')} text={t('updater.sectionDesc')}>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        icon={RefreshCw}
                                        loading={updateStatus === 'checking'}
                                        disabled={!updater || updateStatus === 'downloading'}
                                        onClick={() => updater?.check(true)}
                                    >
                                        {t('updater.checkBtn')}
                                    </Button>
                                    <p className="text-sm text-fg-3" aria-live="polite">
                                        {updateStatus === 'available' || updateStatus === 'downloading' || updateStatus === 'downloaded' ? (
                                            <span className="inline-flex items-center gap-1.5 text-accent">
                                                <Sparkles size={14} aria-hidden="true" />
                                                {t('updater.newBadge').replace('{{version}}', updater?.newVersion || '')}
                                            </span>
                                        ) : updateStatus === 'uptodate' ? (
                                            <span className="inline-flex items-center gap-1.5 text-success">
                                                <CheckCircle2 size={14} aria-hidden="true" />
                                                {t('updater.upToDate')}
                                            </span>
                                        ) : (
                                            t('system.currentVersion').replace('{version}', updater?.currentVersion || '')
                                        )}
                                    </p>
                                </div>
                            </Section>
                        </>
                    )}

                    {tab === 'accessibility' && (
                        <>
                            <Section icon={Accessibility} title={t('system.a11y.zoomTitle')} text={t('system.a11y.zoomText')}>
                                <div className="flex flex-wrap items-end gap-3">
                                    <SelectField
                                        label={t('system.a11y.zoomLabel')}
                                        value={String(zoom)}
                                        onChange={e => setZoom(Number(e.target.value))}
                                        containerClassName="w-48"
                                    >
                                        {ZOOM_OPTIONS.map(z => <option key={z} value={String(z)}>{Math.round(z * 100)}%</option>)}
                                    </SelectField>
                                    <Button variant="ghost" disabled={zoom === 1} onClick={() => setZoom(1)}>{t('system.a11y.zoomReset')}</Button>
                                </div>
                                <p className="mt-3 text-sm text-fg-3">{t('system.a11y.zoomShortcuts')}</p>
                            </Section>

                            <Section icon={Sparkles} title={t('system.a11y.motionTitle')} text={t('system.a11y.motionText')}>
                                <Switch
                                    checked={reduceMotion}
                                    onChange={setReduceMotion}
                                    label={t('system.a11y.motionLabel')}
                                    description={t('system.a11y.motionHint')}
                                />
                            </Section>

                            <Section icon={Info} title={t('system.a11y.statementTitle')} text={t('system.a11y.statementText')}>
                                <Button variant="ghost" icon={FileText} onClick={() => openLink(`${SOURCE_URL}/blob/main/docs/accessibilita.md`)}>
                                    {t('system.a11y.statementLink')}
                                </Button>
                            </Section>
                        </>
                    )}

                    {tab === 'data' && (
                        <>
                            <Section icon={Database} title={t('system.data.dbTitle')} text={t('system.data.dbText')}>
                                <div className="flex flex-wrap gap-2">
                                    <Button icon={Download} loading={busy === 'exportDb'} disabled={!!busy} onClick={exportDb}>{t('system.data.dbExport')}</Button>
                                    <Button variant="danger-ghost" icon={Upload} loading={busy === 'importDb'} disabled={!!busy} onClick={importDb}>{t('system.data.dbImport')}</Button>
                                </div>
                                <p className="mt-3 text-sm text-fg-3">{t('system.data.dbImportHint')}</p>
                            </Section>
                            <Section icon={Archive} title={t('system.data.backupsTitle')} text={t('system.data.backupsText')}>
                                <Button icon={FolderOpen} loading={busy === 'backups'} disabled={!!busy} onClick={openBackups}>{t('system.data.backupsOpen')}</Button>
                            </Section>
                            <Section icon={FileCode} title={t('system.data.profilesTitle')} text={t('system.data.profilesText')}>
                                <div className="flex flex-wrap gap-2">
                                    <Button icon={Download} loading={busy === 'exportConfig'} disabled={!!busy} onClick={exportConfig}>{t('system.data.profilesExport')}</Button>
                                    <Button icon={Upload} loading={busy === 'importConfig'} disabled={!!busy} onClick={importConfig}>{t('system.data.profilesImport')}</Button>
                                </div>
                            </Section>
                        </>
                    )}

                    {tab === 'about' && (
                        <>
                            <Section icon={BookOpen} title={t('quickGuide.docsSection')} text={t('quickGuide.docsDesc')}>
                                <div className="flex flex-wrap gap-2">
                                    <Button icon={BookOpen} onClick={() => onOpenGuide?.()}>{t('quickGuide.btn')}</Button>
                                    <Button icon={Download} onClick={() => openManual(locale)}>{t('quickGuide.manualBtn')}</Button>
                                    <Button variant="ghost" icon={Github} onClick={() => openLink(SOURCE_URL)}>{t('system.about.source')}</Button>
                                </div>
                            </Section>

                            <Section icon={Scale} title={t('system.about.licenseTitle')} text={t('system.about.licenseText')}>
                                <div className="flex flex-wrap gap-2">
                                    <Button icon={FileText} loading={busy === 'license-app'} onClick={() => showLicense('app')}>{t('system.about.licenseApp')}</Button>
                                    <Button icon={FileText} loading={busy === 'license-third-party'} onClick={() => showLicense('third-party')}>{t('system.about.licenseThirdParty')}</Button>
                                </div>
                            </Section>

                            <Section icon={Sparkles} title={t('credits.title')}>
                                <p className="whitespace-pre-line text-sm text-fg-2">{t('credits.body')}</p>
                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
                                    <RuntimeUtilitiesLogo className="h-8 w-auto text-fg-2" />
                                    <p className="text-sm text-fg-3">{t('app.copyright')}</p>
                                </div>
                            </Section>

                            <Section icon={Heart} title={t('support.sectionTitle')} text={t('support.sectionDesc')}>
                                <div className="flex flex-wrap gap-2">
                                    <Button icon={Heart} onClick={() => openLink(DONATE_URL)}>{t('support.donateBtn')}</Button>
                                    <Button variant="ghost" icon={Mail} onClick={() => openLink(CONTACT_URL)}>{t('support.contactBtn')}</Button>
                                </div>
                            </Section>
                        </>
                    )}
                </TabPanel>
            </Dialog>

            <Dialog
                open={license !== null}
                onClose={() => setLicense(null)}
                icon={Scale}
                title={license?.kind === 'app' ? t('system.about.licenseApp') : t('system.about.licenseThirdParty')}
                size="lg"
                footer={<Button variant="primary" onClick={() => setLicense(null)}>{t('common.close')}</Button>}
            >
                <pre tabIndex={0} className="select-text whitespace-pre-wrap break-words font-mono text-xs leading-5 text-fg-2">{license?.text}</pre>
            </Dialog>
        </>
    );
}
