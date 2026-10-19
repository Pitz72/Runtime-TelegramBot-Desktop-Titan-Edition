import React, { useId, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle, AlertTriangle, Info, RotateCcw } from 'lucide-react';
import { useTranslation } from '../locales/I18nContext';
import { validateTemplate, type ValidationIssue } from '../utils/templateValidator';
import { sanitizeTelegramHtml } from '../lib/telegramHtml';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

type T = (key: string) => string;

function renderPreview(template: string, t: T): string {
    // I valori di esempio passano dall'escape come quelli veri in telegram.ts; il risultato
    // passa dal sanificatore prima di finire nel DOM (vedi lib/telegramHtml.ts).
    const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const filled = template
        .replace(/&#10;/g, '\n')
        .replace(/\{\{title\}\}/g, esc(t('templates.sampleTitle')))
        .replace(/\{\{feedName\}\}/g, esc(t('templates.sampleFeed')))
        .replace(/\{\{link\}\}/g, 'https://example.com/articolo')
        .replace(/\{\{summary\}\}/g, esc(t('templates.sampleSummary')));
    return sanitizeTelegramHtml(filled);
}

function issueText(issue: ValidationIssue, t: T): string {
    let text = t(`templateValidator.${issue.code}`);
    if (text === `templateValidator.${issue.code}`) return issue.message;
    for (const [k, v] of Object.entries(issue.params ?? {})) text = text.split(`{${k}}`).join(v);
    return text;
}

const CHIPS = ['title', 'feedName', 'link', 'summary'] as const;

interface Props {
    label: string;
    description?: string;
    value: string;
    onChange: (value: string) => void;
    /** Modello predefinito: mostrato come segnaposto e ripristinabile con un clic */
    defaultTemplate: string;
    /** Messaggio di avvio: lì i segnaposto non vengono sostituiti */
    isStartup?: boolean;
}

export function TemplateEditor({ label, description, value, onChange, defaultTemplate, isStartup = false }: Props) {
    const { t } = useTranslation();
    const id = useId();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showPreview, setShowPreview] = useState(false);

    const issues = useMemo(() => validateTemplate(value, isStartup), [value, isStartup]);
    const visibleIssues = value.trim() === '' ? [] : issues;
    const hasErrors = visibleIssues.some(i => i.severity === 'error');
    const effective = value.trim() === '' ? defaultTemplate : value;

    const insert = (text: string) => {
        const area = textareaRef.current;
        if (!area) return;
        const start = area.selectionStart;
        const end = area.selectionEnd;
        onChange(value.slice(0, start) + text + value.slice(end));
        requestAnimationFrame(() => {
            area.focus();
            area.selectionStart = area.selectionEnd = start + text.length;
        });
    };

    return (
        <section aria-labelledby={`${id}-label`} className="rounded-lg border border-line bg-surface-2 p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 id={`${id}-label`} className="text-base font-semibold text-fg">
                        <label htmlFor={`${id}-text`}>{label}</label>
                    </h3>
                    {description && <p className="text-sm text-fg-3">{description}</p>}
                </div>
                <div className="flex gap-1">
                    <Button size="sm" variant="ghost" icon={showPreview ? EyeOff : Eye} aria-pressed={showPreview} onClick={() => setShowPreview(p => !p)}>
                        {t('templates.preview')}
                    </Button>
                    {value.trim() !== '' && (
                        <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => onChange('')}>{t('templates.useDefault')}</Button>
                    )}
                </div>
            </div>

            {!isStartup && (
                <div className="mb-2 flex flex-wrap items-center gap-1.5" role="group" aria-label={t('templates.insertLabel')}>
                    <span className="text-sm text-fg-3">{t('templates.insertLabel')}</span>
                    {CHIPS.map(chip => (
                        <button
                            key={chip}
                            type="button"
                            onClick={() => insert(`{{${chip}}}`)}
                            className="inline-flex h-7 items-center rounded-full border border-line bg-surface-3 px-2.5 font-mono text-xs text-accent hover:border-line-strong hover:bg-surface-4"
                        >
                            {t(`templates.chip.${chip}`)}
                        </button>
                    ))}
                </div>
            )}

            <textarea
                ref={textareaRef}
                id={`${id}-text`}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={defaultTemplate.replace(/&#10;/g, '\n')}
                spellCheck={false}
                aria-invalid={hasErrors || undefined}
                aria-describedby={`${id}-status`}
                className={cn(
                    'min-h-[120px] w-full resize-y rounded border bg-surface-1 px-3 py-2 font-mono text-sm leading-relaxed text-fg placeholder:text-fg-3',
                    hasErrors ? 'border-danger' : 'border-line-strong hover:border-fg-3',
                )}
            />

            <div id={`${id}-status`} className="mt-2 space-y-1" aria-live="polite">
                {value.trim() === '' ? (
                    <p className="flex items-center gap-1.5 text-sm text-fg-3">
                        <Info size={14} aria-hidden="true" />
                        {t('templates.usingDefault')}
                    </p>
                ) : visibleIssues.length === 0 ? (
                    <p className="flex items-center gap-1.5 text-sm text-success">
                        <CheckCircle2 size={14} aria-hidden="true" />
                        {t('templates.valid')}
                    </p>
                ) : visibleIssues.map((issue, i) => {
                    const Icon = issue.severity === 'error' ? AlertCircle : issue.severity === 'warning' ? AlertTriangle : Info;
                    const color = issue.severity === 'error' ? 'text-danger' : issue.severity === 'warning' ? 'text-warning' : 'text-fg-3';
                    return (
                        <p key={i} className={cn('flex items-start gap-1.5 text-sm', color)}>
                            <Icon size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                            <span>
                                <span className="sr-only">{t(`templates.severity.${issue.severity}`)}: </span>
                                {issueText(issue, t)}
                            </span>
                        </p>
                    );
                })}
            </div>

            {showPreview && (
                <figure className="mt-3">
                    <figcaption className="mb-1.5 text-sm font-medium text-fg-3">{t('templates.previewCaption')}</figcaption>
                    <div
                        className="tg-preview whitespace-pre-wrap rounded-md border border-line bg-surface-1 p-3 text-base text-fg"
                        dangerouslySetInnerHTML={{ __html: renderPreview(effective, t) }}
                    />
                </figure>
            )}
        </section>
    );
}
