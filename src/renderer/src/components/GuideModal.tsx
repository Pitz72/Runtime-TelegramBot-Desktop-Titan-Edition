import React from 'react';
import { Download, BookOpen } from 'lucide-react';
import { useTranslation } from '../locales/I18nContext';
import { GUIDES, openManual } from '../lib/docs';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';

interface Props { open: boolean; onClose: () => void; }

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
            nodes.push(<strong key={`${keyBase}-b${i}`} className="font-semibold text-fg">{m[1]}</strong>);
        } else if (m[2] !== undefined) {
            nodes.push(<code key={`${keyBase}-c${i}`} className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[0.9em] text-accent-strong">{m[2]}</code>);
        } else if (m[3] !== undefined) {
            nodes.push(<span key={`${keyBase}-a${i}`} className="text-accent underline underline-offset-2">{m[3]}</span>);
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
                ? <ol key={`ol-${key++}`} className="list-decimal space-y-1.5 pl-6 text-fg-2 marker:text-fg-3">{items}</ol>
                : <ul key={`ul-${key++}`} className="list-disc space-y-1.5 pl-6 text-fg-2 marker:text-fg-3">{items}</ul>
        );
        list = null;
    };

    for (const raw of lines) {
        const line = raw.trimEnd();
        const trimmed = line.trim();

        if (trimmed === '') { flushList(); continue; }
        if (/^---+$/.test(trimmed)) {
            flushList();
            blocks.push(<hr key={`hr-${key++}`} className="my-6 border-line" />);
            continue;
        }
        // Heading
        const h = /^(#{1,4})\s+(.*)$/.exec(trimmed);
        if (h) {
            flushList();
            const level = h[1].length;
            const content = renderInline(h[2], `h-${key}`);
            if (level === 1) blocks.push(<h2 key={`h-${key++}`} className="mb-2 text-2xl font-semibold text-fg">{content}</h2>);
            else if (level === 2) blocks.push(<h3 key={`h-${key++}`} className="mb-2 mt-6 text-lg font-semibold text-fg">{content}</h3>);
            else blocks.push(<h4 key={`h-${key++}`} className="mb-1.5 mt-4 text-base font-semibold text-accent-strong">{content}</h4>);
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
        blocks.push(<p key={`p-${key++}`} className="leading-relaxed text-fg-2">{renderInline(trimmed, `p-${key}`)}</p>);
    }
    flushList();
    return blocks;
}

export function GuideModal({ open, onClose }: Props) {
    const { locale, t } = useTranslation();
    const content = React.useMemo(() => renderMarkdown(GUIDES[locale] || GUIDES.en), [locale]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            icon={BookOpen}
            title={t('quickGuide.title')}
            size="lg"
            footer={
                <>
                    <Button icon={Download} className="mr-auto" onClick={() => openManual(locale)}>{t('quickGuide.manualBtn')}</Button>
                    <Button variant="primary" onClick={onClose}>{t('common.close')}</Button>
                </>
            }
        >
            <article className="select-text space-y-3 text-base">{content}</article>
        </Dialog>
    );
}
