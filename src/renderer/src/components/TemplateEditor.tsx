import React, { useMemo, useRef } from 'react';
import { useTranslation } from '../locales/I18nContext';
import { validateTemplate } from '../utils/templateValidator';

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

    const issues = useMemo(
        () => validateTemplate(value, hideChips),
        [value, hideChips]
    );

    const hasErrors = issues.some(i => i.severity === 'error');
    const hasWarnings = issues.some(i => i.severity === 'warning');

    const insertText = (textToInsert: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const currentValue = value;
        const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);

        onChange(newValue);

        // setTimeout is needed to allow React to re-render with the new value
        // before we set the cursor position.
        setTimeout(() => {
            textarea.selectionStart = start + textToInsert.length;
            textarea.selectionEnd = start + textToInsert.length;
            textarea.focus();
        }, 0);
    };

    return (
        <div className="flex flex-col gap-2 p-4 bg-dark-900 border border-titan-500/20 rounded-xl">
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold text-titan-400">{label}</label>
                {!hideChips && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">{t('templateEditor.insertVar')}</span>
                        <button
                            onClick={() => insertText('{{title}}')}
                            className="px-2 py-1 bg-titan-500/10 hover:bg-titan-500/20 text-titan-300 rounded-md text-[10px] font-mono transition-colors border border-titan-500/20"
                        >
                            [Titolo]
                        </button>
                        <button
                            onClick={() => insertText('{{feedName}}')}
                            className="px-2 py-1 bg-titan-500/10 hover:bg-titan-500/20 text-titan-300 rounded-md text-[10px] font-mono transition-colors border border-titan-500/20"
                        >
                            [Sorgente]
                        </button>
                        <button
                            onClick={() => insertText('{{link}}')}
                            className="px-2 py-1 bg-titan-500/10 hover:bg-titan-500/20 text-titan-300 rounded-md text-[10px] font-mono transition-colors border border-titan-500/20"
                        >
                            [Link]
                        </button>
                        <button
                            onClick={() => insertText('{{summary}}')}
                            className="px-2 py-1 bg-titan-500/10 hover:bg-titan-500/20 text-titan-300 rounded-md text-[10px] font-mono transition-colors border border-titan-500/20"
                        >
                            [Sommario]
                        </button>
                    </div>
                )}
            </div>

            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={defaultTemplate}
                className={`w-full h-32 bg-dark-950 border rounded-lg p-3 text-white focus:outline-none focus:ring-1 transition-colors font-mono text-xs resize-y custom-scrollbar ${
                    hasErrors
                        ? 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20'
                        : hasWarnings
                        ? 'border-yellow-500/30 focus:border-yellow-500/50 focus:ring-yellow-500/20'
                        : 'border-titan-500/10 focus:border-titan-500/40 focus:ring-titan-500/40'
                }`}
            />

            {/* Validation panel */}
            {value.trim() !== '' && (
                <div className="space-y-1">
                    {issues.length === 0 ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-green-400/70">
                            <span>✓</span>
                            <span>{t('templateEditor.validOk')}</span>
                        </div>
                    ) : (
                        issues.map((issue, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-1.5 text-[10px] leading-relaxed ${
                                    issue.severity === 'error'
                                        ? 'text-red-400'
                                        : issue.severity === 'warning'
                                        ? 'text-yellow-400'
                                        : 'text-blue-400/70'
                                }`}
                            >
                                <span className="shrink-0 mt-0.5 font-bold">
                                    {issue.severity === 'error' ? '✗' : issue.severity === 'warning' ? '⚠' : 'ℹ'}
                                </span>
                                <span>{issue.message}</span>
                            </div>
                        ))
                    )}
                </div>
            )}

            <p className="text-[10px] text-neutral-500 mt-1">
                {t('templateEditor.htmlHint')}
            </p>
        </div>
    );
}
