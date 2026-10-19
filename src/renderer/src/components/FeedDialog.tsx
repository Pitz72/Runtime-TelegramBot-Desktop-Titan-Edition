import React, { useEffect, useState } from 'react';
import { Rss, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { FeedConfig } from '../../../shared/types';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { SelectField, TextField } from './ui/Controls';
import { useTranslation } from '../locales/I18nContext';
import { errorMessage } from '../lib/errors';

type FeedType = 'podcast' | 'news' | 'youtube';

export function buildKeywordFilter(include: string, exclude: string): string | null {
    const inc = include.split(',').map(s => s.trim()).filter(Boolean);
    const exc = exclude.split(',').map(s => s.trim()).filter(Boolean);
    if (inc.length === 0 && exc.length === 0) return null;
    return JSON.stringify({ include: inc, exclude: exc });
}

export function parseKeywordFilter(raw: string | null): { include: string; exclude: string } {
    if (!raw) return { include: '', exclude: '' };
    try {
        const { include = [], exclude = [] } = JSON.parse(raw) as { include?: string[]; exclude?: string[] };
        return { include: include.join(', '), exclude: exclude.join(', ') };
    } catch { return { include: '', exclude: '' }; }
}

export const INTERVAL_PRESETS = [5, 15, 30, 60, 120, 240, 480, 1440] as const;
export const DIGEST_PRESETS = [60, 360, 720, 1440, 10080] as const;

export function useDurationLabel() {
    const { t } = useTranslation();
    return (minutes: number) => {
        if (minutes < 60) return t('time.minutes').replace('{n}', String(minutes));
        if (minutes === 60) return t('time.hour');
        if (minutes < 1440) return t('time.hours').replace('{n}', String(minutes / 60));
        if (minutes === 1440) return t('time.day');
        if (minutes === 10080) return t('time.week');
        return t('time.days').replace('{n}', String(minutes / 1440));
    };
}

interface Props {
    open: boolean;
    botId: number;
    /** null = nuova sorgente */
    feed: FeedConfig | null;
    onClose: () => void;
    onSaved: () => void;
}

export function FeedDialog({ open, botId, feed, onClose, onSaved }: Props) {
    const { t } = useTranslation();
    const duration = useDurationLabel();
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState<FeedType>('podcast');
    const [checkInterval, setCheckInterval] = useState<number | null>(null);
    const [digest, setDigest] = useState<number | null>(null);
    const [include, setInclude] = useState('');
    const [exclude, setExclude] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [test, setTest] = useState<{ success: boolean; count?: number; error?: string } | null>(null);
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        if (!open) return;
        const kw = parseKeywordFilter(feed?.keyword_filter ?? null);
        setName(feed?.name ?? '');
        setUrl(feed?.url ?? '');
        setType((feed?.type as FeedType) ?? 'podcast');
        setCheckInterval(feed?.check_interval ?? null);
        setDigest(feed?.digest_interval ?? null);
        setInclude(kw.include);
        setExclude(kw.exclude);
        setSubmitted(false); setTest(null); setServerError('');
    }, [open, feed]);

    const errors = {
        name: !name.trim() ? t('botForm.required') : '',
        url: !url.trim() ? t('botForm.required') : '',
    };

    const runTest = async () => {
        if (!url.trim()) { setSubmitted(true); return; }
        setTesting(true); setTest(null);
        try {
            setTest(await window.api.testFeed({ url: url.trim(), type }));
        } catch (e) {
            setTest({ success: false, error: errorMessage(e) });
        } finally {
            setTesting(false);
        }
    };

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setSubmitted(true);
        setServerError('');
        if (errors.name || errors.url) return;
        setSaving(true);
        const payload = {
            name: name.trim(), url: url.trim(), type,
            keywordFilter: buildKeywordFilter(include, exclude),
            checkInterval, digestInterval: digest,
        };
        try {
            if (feed) await window.api.updateFeed({ id: feed.id, ...payload });
            else await window.api.addFeed({ botId, ...payload });
            onSaved();
        } catch (err) {
            // Il main rifiuta indirizzi non validi o verso reti private: il motivo si mostra qui.
            setServerError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            icon={Rss}
            title={feed ? t('feedForm.editTitle') : t('feedForm.newTitle')}
            description={t('feedForm.description')}
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button variant="primary" loading={saving} onClick={() => submit()}>{feed ? t('common.saveChanges') : t('feedForm.add')}</Button>
                </>
            }
        >
            <form className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2" onSubmit={submit} noValidate>
                <TextField
                    label={t('feedForm.name')}
                    placeholder={t('feedForm.namePlaceholder')}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={submitted ? errors.name : ''}
                    required
                    data-autofocus
                />
                <SelectField label={t('feedForm.type')} value={type} onChange={e => { setType(e.target.value as FeedType); setTest(null); }}>
                    <option value="podcast">{t('feedTypes.podcast')}</option>
                    <option value="news">{t('feedTypes.news')}</option>
                    <option value="youtube">{t('feedTypes.youtube')}</option>
                </SelectField>

                <div className="sm:col-span-2">
                    <div className="flex items-end gap-2">
                        <TextField
                            label={type === 'youtube' ? t('feedForm.channelUrl') : t('feedForm.url')}
                            hint={type === 'youtube' ? t('feedForm.youtubeHint') : t('feedForm.urlHint')}
                            placeholder={type === 'youtube' ? 'https://www.youtube.com/@canale' : 'https://…'}
                            className="font-mono text-sm"
                            spellCheck={false}
                            value={url}
                            onChange={e => { setUrl(e.target.value); setTest(null); }}
                            error={submitted ? errors.url : ''}
                            required
                            containerClassName="flex-1"
                        />
                        {/* Allineato al campo, non al suggerimento sotto */}
                        <Button icon={Zap} loading={testing} onClick={runTest} className="mb-[26px]">{t('feedForm.test')}</Button>
                    </div>
                    <div aria-live="polite">
                        {test && (
                            <p className={`mt-2 flex items-start gap-2 rounded-md border border-line px-3 py-2 text-sm ${test.success ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                                {test.success ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
                                <span>
                                    {test.success
                                        ? t('feedForm.testOk').replace('{n}', String(test.count ?? 0))
                                        : t('feedForm.testFailed').replace('{error}', test.error || '')}
                                </span>
                            </p>
                        )}
                    </div>
                </div>

                <SelectField
                    label={t('feedForm.interval')}
                    hint={t('feedForm.intervalHint')}
                    value={checkInterval ?? ''}
                    onChange={e => setCheckInterval(e.target.value === '' ? null : Number(e.target.value))}
                >
                    <option value="">{t('feedForm.intervalBot')}</option>
                    {INTERVAL_PRESETS.map(v => <option key={v} value={v}>{t('feedForm.every').replace('{d}', duration(v))}</option>)}
                </SelectField>
                <SelectField
                    label={t('feedForm.digest')}
                    hint={t('feedForm.digestHint')}
                    value={digest ?? ''}
                    onChange={e => setDigest(e.target.value === '' ? null : Number(e.target.value))}
                >
                    <option value="">{t('feedForm.digestOff')}</option>
                    {DIGEST_PRESETS.map(v => <option key={v} value={v}>{t('feedForm.digestEvery').replace('{d}', duration(v))}</option>)}
                </SelectField>

                <fieldset className="sm:col-span-2">
                    <legend className="mb-2 text-sm font-medium text-fg-2">{t('feedForm.filter')}</legend>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextField
                            label={t('feedForm.include')}
                            hint={t('feedForm.includeHint')}
                            placeholder={t('feedForm.filterPlaceholder')}
                            value={include}
                            onChange={e => setInclude(e.target.value)}
                        />
                        <TextField
                            label={t('feedForm.exclude')}
                            hint={t('feedForm.excludeHint')}
                            placeholder={t('feedForm.filterPlaceholder')}
                            value={exclude}
                            onChange={e => setExclude(e.target.value)}
                        />
                    </div>
                </fieldset>

                {serverError && (
                    <p role="alert" className="rounded-md border border-line bg-danger-soft px-3 py-2 text-sm font-medium text-danger sm:col-span-2">{serverError}</p>
                )}
                <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
            </form>
        </Dialog>
    );
}
