import React, { useEffect, useState } from 'react';
import { Bot, Eye, EyeOff } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button, IconButton } from './ui/Button';
import { TextField } from './ui/Controls';
import { useTranslation } from '../locales/I18nContext';
import { errorMessage } from '../lib/errors';

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: (id: number) => void;
}

const today = () => new Date().toISOString().split('T')[0];

/** Un token di BotFather: cifre, due punti, 35 caratteri. Serve solo a un avviso, non blocca. */
export const TOKEN_SHAPE = /^\d{6,12}:[A-Za-z0-9_-]{30,}$/;

/** Token mostrato/nascosto: per chi vede poco, poter rileggere ciò che ha incollato conta. */
export function TokenVisibility({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
    const { t } = useTranslation();
    return (
        <IconButton
            icon={visible ? EyeOff : Eye}
            label={visible ? t('botForm.hideToken') : t('botForm.showToken')}
            size="sm"
            aria-pressed={visible}
            onClick={onToggle}
        />
    );
}

export function NewBotDialog({ open, onClose, onCreated }: Props) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [token, setToken] = useState('');
    const [channel, setChannel] = useState('');
    const [startDate, setStartDate] = useState(today());
    const [showToken, setShowToken] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        if (!open) return;
        setName(''); setToken(''); setChannel(''); setStartDate(today());
        setShowToken(false); setSubmitted(false); setServerError('');
    }, [open]);

    const errors = {
        name: !name.trim() ? t('botForm.required') : '',
        token: !token.trim() ? t('botForm.required') : '',
        channel: !channel.trim() ? t('botForm.required') : '',
        startDate: !startDate ? t('botForm.required') : '',
    };
    const valid = !Object.values(errors).some(Boolean);
    const tokenWarning = token.trim() && !TOKEN_SHAPE.test(token.trim()) ? t('botForm.tokenShape') : '';

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setSubmitted(true);
        setServerError('');
        if (!valid) return;
        setSaving(true);
        try {
            const id = await window.api.createBot({ name: name.trim(), token: token.trim(), channelId: channel.trim(), startDate });
            onCreated(id);
        } catch (err) {
            setServerError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            icon={Bot}
            title={t('botForm.newTitle')}
            description={t('botForm.newDescription')}
            size="md"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button variant="primary" loading={saving} onClick={() => submit()}>{t('botForm.create')}</Button>
                </>
            }
        >
            <form className="space-y-4" onSubmit={submit} noValidate>
                <TextField
                    label={t('botForm.name')}
                    hint={t('botForm.nameHint')}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={submitted ? errors.name : ''}
                    required
                    data-autofocus
                />
                <TextField
                    label={t('botForm.token')}
                    hint={tokenWarning || t('botForm.tokenHint')}
                    type={showToken ? 'text' : 'password'}
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono text-sm"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    error={submitted ? errors.token : ''}
                    required
                    trailing={<TokenVisibility visible={showToken} onToggle={() => setShowToken(v => !v)} />}
                />
                <TextField
                    label={t('botForm.channel')}
                    hint={t('botForm.channelHint')}
                    placeholder="@iltuocanale"
                    className="font-mono text-sm"
                    spellCheck={false}
                    value={channel}
                    onChange={e => setChannel(e.target.value)}
                    error={submitted ? errors.channel : ''}
                    required
                />
                <TextField
                    label={t('botForm.startDate')}
                    hint={t('botForm.startDateHint')}
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    error={submitted ? errors.startDate : ''}
                    required
                    containerClassName="max-w-[220px]"
                />
                {serverError && (
                    <p role="alert" className="rounded-md border border-line bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{serverError}</p>
                )}
                {/* Invio da tastiera in qualunque campo crea il bot */}
                <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
            </form>
        </Dialog>
    );
}
