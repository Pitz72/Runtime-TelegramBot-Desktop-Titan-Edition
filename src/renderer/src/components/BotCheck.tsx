import React, { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, MinusCircle, ShieldCheck, XCircle } from 'lucide-react';
import type { BotCheckResult } from '../../../shared/types';
import { Button } from './ui/Button';
import { useTranslation } from '../locales/I18nContext';
import { errorMessage } from '../lib/errors';
import { cn } from '@/lib/utils';

type Tone = 'ok' | 'bad' | 'warn' | 'skip';

const TONES: Record<Tone, { icon: typeof CheckCircle2; className: string }> = {
    ok: { icon: CheckCircle2, className: 'text-success' },
    bad: { icon: XCircle, className: 'text-danger' },
    warn: { icon: AlertTriangle, className: 'text-warning' },
    skip: { icon: MinusCircle, className: 'text-fg-3' },
};

function Row({ tone, label, text }: { tone: Tone; label: string; text: string }) {
    const { icon: Icon, className } = TONES[tone];
    return (
        <li className="flex items-start gap-2.5">
            <Icon size={16} className={cn('mt-0.5 shrink-0', className)} aria-hidden="true" />
            <p className="text-sm text-fg-2">
                <span className="font-semibold text-fg">{label}:</span> {text}
            </p>
        </li>
    );
}

/**
 * «Prova il bot»: token, canale e permessi verificati con Telegram, senza pubblicare nulla.
 * Usa i valori scritti nel modulo, salvati o no, così si prova prima di salvare. Il
 * risultato si azzera appena token o canale cambiano: non deve restare un «tutto a posto»
 * riferito a valori che non ci sono più.
 */
export function BotCheck({ token, channelId, topicId = '', headingLevel = 3 }: {
    token: string;
    channelId: string;
    /** Argomento del gruppo, se c'è: si verifica che il gruppo abbia gli argomenti attivi */
    topicId?: string;
    /** Livello del titolo nella pagina che lo ospita: 3 dentro un dialogo, 2 sotto l'h1 del wizard */
    headingLevel?: 2 | 3;
}) {
    const Heading = headingLevel === 2 ? 'h2' : 'h3';
    const { t } = useTranslation();
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<BotCheckResult | null>(null);
    const [failure, setFailure] = useState('');
    const request = useRef(0);
    const titleId = useId();

    useEffect(() => {
        request.current++;
        setResult(null);
        setFailure('');
        setRunning(false);
    }, [token, channelId, topicId]);

    const run = async () => {
        const id = ++request.current;
        setRunning(true);
        setResult(null);
        setFailure('');
        try {
            const r = await window.api.testBot({ token: token.trim(), channelId: channelId.trim(), topicId: topicId.trim() || null });
            if (id === request.current) setResult(r);
        } catch (e) {
            if (id === request.current) setFailure(errorMessage(e));
        } finally {
            if (id === request.current) setRunning(false);
        }
    };

    const chatKind = (type?: string) =>
        type === 'channel' ? t('botCheck.kind.channel') : type === 'private' ? t('botCheck.kind.private') : t('botCheck.kind.group');

    let rows: Array<{ tone: Tone; label: string; text: string }> = [];
    let allGood = false;
    if (result) {
        const { token: tk, chat, rights } = result;
        rows = [
            {
                label: t('botCheck.token'),
                tone: tk.status === 'ok' ? 'ok' : tk.status === 'network' ? 'warn' : 'bad',
                text: tk.status === 'ok'
                    ? t('botCheck.tokenOk').replace('{username}', tk.username ? `@${tk.username}` : '')
                    : t(`botCheck.token_${tk.status}`),
            },
            {
                label: t('botCheck.chat'),
                tone: chat.status === 'ok' ? 'ok' : chat.status === 'skipped' ? 'skip' : chat.status === 'network' ? 'warn' : 'bad',
                text: chat.status === 'ok'
                    ? t('botCheck.chatOk').replace('{title}', chat.title ?? '').replace('{kind}', chatKind(chat.type))
                    : t(`botCheck.chat_${chat.status}`),
            },
            {
                label: t('botCheck.rights'),
                tone: rights.status === 'ok' ? 'ok' : rights.status === 'skipped' ? 'skip' : rights.status === 'network' || rights.status === 'unknown' ? 'warn' : 'bad',
                text: rights.status === 'unknown'
                    ? t('botCheck.rights_unknown').replace('{error}', rights.error ?? '')
                    : t(`botCheck.rights_${rights.status}`),
            },
        ];
        if (result.topic) {
            rows.push({
                label: t('botCheck.topic'),
                tone: result.topic.status === 'ok' ? 'ok' : 'bad',
                text: t(`botCheck.topic_${result.topic.status}`),
            });
        }
        allGood = tk.status === 'ok' && chat.status === 'ok' && rights.status === 'ok' && (!result.topic || result.topic.status === 'ok');
    }

    return (
        <section aria-labelledby={titleId} className="rounded-lg border border-line bg-surface-2 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-[200px] flex-1">
                    <Heading id={titleId} className="text-base font-semibold text-fg">{t('botCheck.title')}</Heading>
                    <p className="text-sm text-fg-3">{t('botCheck.hint')}</p>
                </div>
                <Button icon={ShieldCheck} loading={running} disabled={!token.trim() || !channelId.trim()} onClick={run}>
                    {t('botCheck.run')}
                </Button>
            </div>

            <div aria-live="polite">
                {running && <p className="mt-3 text-sm text-fg-3">{t('botCheck.running')}</p>}
                {failure && <p role="alert" className="mt-3 text-sm font-medium text-danger">{failure}</p>}
                {result && (
                    <div className="mt-4 border-t border-line pt-3">
                        <p className={cn('mb-2 text-sm font-semibold', allGood ? 'text-success' : 'text-fg')}>
                            {allGood ? t('botCheck.allGood') : t('botCheck.someProblems')}
                        </p>
                        <ul className="space-y-1.5">
                            {rows.map(r => <Row key={r.label} {...r} />)}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
