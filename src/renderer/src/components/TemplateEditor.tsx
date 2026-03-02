import React, { useRef } from 'react';
import { useTranslation } from '../locales/I18nContext';

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
                className="w-full h-32 bg-dark-950 border border-titan-500/10 rounded-lg p-3 text-white focus:outline-none focus:border-titan-500/40 focus:ring-1 focus:ring-titan-500/40 transition-colors font-mono text-xs resize-y custom-scrollbar"
            />

            <p className="text-[10px] text-neutral-500 mt-1">
                {t('templateEditor.htmlHint')}
            </p>
        </div>
    );
}
