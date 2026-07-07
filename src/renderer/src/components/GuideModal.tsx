import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, BookOpen } from 'lucide-react';
import { useTranslation } from '../locales/I18nContext';
import { GUIDES, openManual } from '../lib/docs';

interface Props { onClose: () => void; }

/** Renderizza l'inline markdown: **grassetto**, `codice`, [testo](url). */
function renderInline(text: string, keyBase: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    // Token: **bold** | `code` | [label](url)
    const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) nodes.push(text.slice(last, m.index));
        if (m[1] !== undefined) {
            nodes.push(<strong key={`${keyBase}-b${i}`} className="font-semibold text-on-surface">{m[1]}</strong>);
        } else if (m[2] !== undefined) {
            nodes.push(<code key={`${keyBase}-c${i}`} className="px-1.5 py-0.5 rounded bg-surface-container-highest/70 text-primary font-mono text-[0.85em]">{m[2]}</code>);
        } else if (m[3] !== undefined) {
            nodes.push(<span key={`${keyBase}-a${i}`} className="text-primary underline underline-offset-2">{m[3]}</span>);
        }
        last = re.lastIndex;
        i++;
    }
    if (last < text.length) nodes.push(text.slice(last));
    return nodes;
}

/** Parser markdown minimale sufficiente per le guide rapide. */
function renderMarkdown(md: string): React.ReactNode[] {
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    const blocks: React.ReactNode[] = [];
    let list: { text: string; ordered: boolean }[] | null = null;
    let key = 0;

    const flushList = () => {
        if (!list) return;
        const ordered = list[0].ordered;
        const items = list.map((it, idx) => (
            <li key={`li-${key}-${idx}`} className="leading-relaxed">{renderInline(it.text, `li-${key}-${idx}`)}</li>
        ));
        blocks.push(
            ordered
                ? <ol key={`ol-${key++}`} className="list-decimal pl-6 space-y-1.5 text-on-surface-variant marker:text-primary/70">{items}</ol>
                : <ul key={`ul-${key++}`} className="list-disc pl-6 space-y-1.5 text-on-surface-variant marker:text-primary/60">{items}</ul>
        );
        list = null;
    };

    for (const raw of lines) {
        const line = raw.trimEnd();
        const trimmed = line.trim();

        if (trimmed === '') { flushList(); continue; }
        if (/^---+$/.test(trimmed)) {
            flushList();
            blocks.push(<hr key={`hr-${key++}`} className="my-6 border-outline-variant/15" />);
            continue;
        }
        // Heading
        const h = /^(#{1,4})\s+(.*)$/.exec(trimmed);
        if (h) {
            flushList();
            const level = h[1].length;
            const content = renderInline(h[2], `h-${key}`);
            if (level === 1) blocks.push(<h1 key={`h-${key++}`} className="font-headline text-2xl font-black text-on-surface mb-2">{content}</h1>);
            else if (level === 2) blocks.push(<h2 key={`h-${key++}`} className="font-headline text-lg font-bold text-primary drop-glow-primary mt-6 mb-2">{content}</h2>);
            else blocks.push(<h3 key={`h-${key++}`} className="font-headline text-sm font-bold text-secondary mt-4 mb-1.5">{content}</h3>);
            continue;
        }
        // List item: "1. ", "* ", "- " (con eventuale indentazione)
        const ol = /^(\d+)\.\s+(.*)$/.exec(trimmed);
        const ul = /^[*\-]\s+(.*)$/.exec(trimmed);
        if (ol) {
            if (list && !list[0].ordered) flushList();
            list = list || [];
            list.push({ text: ol[2], ordered: true });
            continue;
        }
        if (ul) {
            if (list && list[0].ordered) flushList();
            list = list || [];
            list.push({ text: ul[1], ordered: false });
            continue;
        }
        // Paragrafo
        flushList();
        blocks.push(<p key={`p-${key++}`} className="leading-relaxed text-on-surface-variant">{renderInline(trimmed, `p-${key}`)}</p>);
    }
    flushList();
    return blocks;
}

export function GuideModal({ onClose }: Props) {
    const { locale, t } = useTranslation();
    const content = React.useMemo(() => renderMarkdown(GUIDES[locale] || GUIDES.en), [locale]);

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="glass-panel w-full max-w-3xl max-h-[88vh] rounded-xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-outline-variant/15 bg-surface-container-high/50 flex-shrink-0">
                    <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-3">
                        <BookOpen size={20} className="text-primary drop-glow-primary" />
                        {t('quickGuide.title')}
                    </h2>
                    <button onClick={onClose} className="p-1 text-outline-variant hover:text-on-surface hover:bg-surface-container-highest/50 rounded transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Contenuto scrollabile */}
                <div className="p-6 overflow-y-auto space-y-3 text-sm">
                    {content}
                </div>

                {/* Footer: scarica manuale + chiudi */}
                <div className="p-4 border-t border-outline-variant/15 bg-surface-container-low/40 flex justify-between items-center flex-shrink-0">
                    <button
                        onClick={() => openManual(locale)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg ghost-border bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/30 transition-all text-secondary text-sm font-bold"
                    >
                        <Download size={15} />
                        {t('quickGuide.manualBtn')}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-sm font-headline font-bold ignition-btn text-on-primary-fixed shadow-lg transition-all active:scale-95"
                    >
                        {t('quickGuide.close')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
