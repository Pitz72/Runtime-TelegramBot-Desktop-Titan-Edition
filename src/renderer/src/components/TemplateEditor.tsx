import React, { useMemo, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../locales/I18nContext';
import { validateTemplate } from '../utils/templateValidator';

function renderPreview(template: string, t: (key: string) => any): string {
    const title    = t('templateEditor.sampleTitle') as string;
    const feedName = t('templateEditor.sampleFeed') as string;
    const summary  = t('templateEditor.sampleSummary') as string;
    const link     = 'https://example.com/articolo';
    return template
        .replace(/&#10;/g, '\n')
        .replace(/\{\{title\}\}/g, title)
        .replace(/\{\{feedName\}\}/g, feedName)
        .replace(/\{\{link\}\}/g, link)
        .replace(/\{\{summary\}\}/g, summary);
}

interface Props {
    label: string;
    value: string;
    onChange: (value: string) => void;
    defaultTemplate: string;
    hideChips?: boolean;
}

export function TemplateEditor({ label, value, onChange, defaultTemplate, hideChips = false }: Props) {
    const { t } = useTranslation();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showPreview, setShowPreview] = useState(false);

    const issues = useMemo(() => validateTemplate(value, hideChips), [value, hideChips]);
    const hasErrors   = issues.some(i => i.severity === 'error');
    const hasWarnings = issues.some(i => i.severity === 'warning');

    const insertText = (textToInsert: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end   = textarea.selectionEnd;
        const newValue = value.substring(0, start) + textToInsert + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
            textarea.selectionStart = start + textToInsert.length;
            textarea.selectionEnd   = start + textToInsert.length;
            textarea.focus();
        }, 0);
    };

    const chipCls = "px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded text-nano font-mono transition-colors border border-primary/20";

    return (
        <div className="flex flex-col gap-2 p-4 ghost-border bg-surface-container rounded-xl">
            {/* Label row */}
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-3">
                    <label className="text-sm font-headline font-semibold text-primary">{label}</label>
                    {!hideChips && value.trim() !== '' && (
                        <button
                            onClick={() => setShowPreview(p => !p)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-nano font-bold border transition-colors ${
                                showPreview
                                    ? 'bg-secondary/15 border-secondary/30 text-secondary'
                                    : 'bg-surface-container-lowest border-outline-variant/20 text-outline-variant hover:text-primary'
                            }`}
                            title={t('templateEditor.previewBtn') as string}
                        >
                            {showPreview ? <EyeOff size={10} /> : <Eye size={10} />}
                            {t('templateEditor.previewBtn') as string}
                        </button>
                    )}
                </div>
                {!hideChips && (
                    <div className="flex items-center gap-2">
                        <span className="text-nano text-outline-variant/50">{t('templateEditor.insertVar')}</span>
                        <button onClick={() => insertText('{{title}}')}    className={chipCls}>[Titolo]</button>
                        <button onClick={() => insertText('{{feedName}}')} className={chipCls}>[Sorgente]</button>
                        <button onClick={() => insertText('{{link}}')}     className={chipCls}>[Link]</button>
                        <button onClick={() => insertText('{{summary}}')}  className={chipCls}>[Sommario]</button>
                    </div>
                )}
            </div>

            {/* Preview panel */}
            {showPreview && value.trim() !== '' && (
                <div
                    className="bg-surface-container-lowest ghost-border rounded-lg p-3 text-xs text-on-surface leading-relaxed font-body scanline-bg relative"
                    style={{ whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{ __html: renderPreview(value, t) }}
                />
            )}

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={defaultTemplate}
                className={`w-full h-32 bg-surface-container-lowest border rounded-lg p-3 text-on-surface focus:outline-none focus:ring-1 transition-colors font-mono text-xs resize-y ${
                    hasErrors
                        ? 'border-error/40 focus:border-error/60 focus:ring-error/20'
                        : hasWarnings
                        ? 'border-tertiary/30 focus:border-tertiary/50 focus:ring-tertiary/20'
                        : 'border-outline-variant/15 focus:border-primary/40 focus:ring-primary/20'
                }`}
            />

            {/* Validation panel */}
            {value.trim() !== '' && (
                <div className="space-y-1">
                    {issues.length === 0 ? (
                        <div className="flex items-center gap-1.5 text-nano text-secondary/70">
                            <span>✓</span>
                            <span>{t('templateEditor.validOk')}</span>
                        </div>
                    ) : (
                        issues.map((issue, i) => (
                            <div key={i} className={`flex items-start gap-1.5 text-nano leading-relaxed ${
                                issue.severity === 'error'   ? 'text-error'
                                : issue.severity === 'warning' ? 'text-tertiary'
                                : 'text-primary/60'
                            }`}>
                                <span className="shrink-0 mt-0.5 font-bold">
                                    {issue.severity === 'error' ? '✗' : issue.severity === 'warning' ? '⚠' : 'ℹ'}
                                </span>
                                <span>{issue.message}</span>
                            </div>
                        ))
                    )}
                </div>
            )}

            <p className="text-nano text-outline-variant/40 mt-1">{t('templateEditor.htmlHint')}</p>
        </div>
    );
}
