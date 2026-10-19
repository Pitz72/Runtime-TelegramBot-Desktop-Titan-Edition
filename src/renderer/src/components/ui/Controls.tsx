import React, { forwardRef, useId, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/* ───────────────────────────── Switch ───────────────────────────── */

export interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** Etichetta visibile accanto all'interruttore */
    label?: React.ReactNode;
    /** Nome accessibile quando l'etichetta visibile non c'è (es. in una riga di elenco) */
    ariaLabel?: string;
    description?: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

/**
 * Interruttore `role="switch"`: Spazio e Invio lo commutano, lo stato è annunciato
 * («attivato/disattivato») e si vede anche senza colore, dalla posizione del pomello.
 */
export function Switch({ checked, onChange, label, ariaLabel, description, disabled, className }: SwitchProps) {
    const id = useId();
    const control = (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label ? undefined : ariaLabel}
            aria-labelledby={label ? `${id}-label` : undefined}
            aria-describedby={description ? `${id}-desc` : undefined}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                checked ? 'border-primary bg-primary' : 'border-line-strong bg-surface-3',
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    'inline-block h-4 w-4 rounded-full shadow transition-transform',
                    checked ? 'translate-x-[22px] bg-on-primary' : 'translate-x-[3px] bg-fg-3',
                )}
            />
        </button>
    );

    if (!label) return <span className={className}>{control}</span>;

    return (
        <div className={cn('flex items-start justify-between gap-4', className)}>
            <div className="min-w-0">
                <span id={`${id}-label`} className="block text-base font-medium text-fg" onClick={() => !disabled && onChange(!checked)}>
                    {label}
                </span>
                {description && <span id={`${id}-desc`} className="mt-0.5 block text-sm text-fg-3">{description}</span>}
            </div>
            {control}
        </div>
    );
}

/* ───────────────────────────── Campi ───────────────────────────── */

const INPUT = cn(
    'w-full rounded border border-line-strong bg-surface-2 px-3 text-base text-fg transition-colors',
    'placeholder:text-fg-3 hover:border-fg-3 disabled:cursor-not-allowed disabled:opacity-60',
    'aria-[invalid=true]:border-danger',
);

interface FieldShellProps {
    id: string;
    label: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    required?: boolean;
    className?: string;
    /** Etichetta solo per i lettori di schermo (es. la casella di ricerca con la lente) */
    hideLabel?: boolean;
    children: React.ReactNode;
}

function FieldShell({ id, label, hint, error, required, className, hideLabel, children }: FieldShellProps) {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={id} className={cn('text-sm font-medium text-fg-2', hideLabel && 'sr-only')}>
                {label}
                {required && <span className="text-danger" aria-hidden="true"> *</span>}
            </label>
            {children}
            {hint && !error && <p id={`${id}-hint`} className="text-sm text-fg-3">{hint}</p>}
            {error && <p id={`${id}-error`} role="alert" className="text-sm font-medium text-danger">{error}</p>}
        </div>
    );
}

function describedBy(id: string, hint?: React.ReactNode, error?: React.ReactNode) {
    return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
    label: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    hideLabel?: boolean;
    containerClassName?: string;
    /** Elemento dentro il campo, a destra (es. pulsante mostra/nascondi) */
    trailing?: React.ReactNode;
    leadingIcon?: LucideIcon;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
    { label, hint, error, hideLabel, containerClassName, className, trailing, leadingIcon: Leading, required, ...rest },
    ref,
) {
    const id = useId();
    return (
        <FieldShell id={id} label={label} hint={hint} error={error} required={required} hideLabel={hideLabel} className={containerClassName}>
            <div className="relative">
                {Leading && <Leading size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3" />}
                <input
                    ref={ref}
                    id={id}
                    required={required}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy(id, hint, error)}
                    className={cn(INPUT, 'h-9', Leading && 'pl-9', trailing && 'pr-11', className)}
                    {...rest}
                />
                {trailing && <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>}
            </div>
        </FieldShell>
    );
});

export interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
    label: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    containerClassName?: string;
}

export function SelectField({ label, hint, error, containerClassName, className, children, ...rest }: SelectFieldProps) {
    const id = useId();
    return (
        <FieldShell id={id} label={label} hint={hint} error={error} className={containerClassName}>
            <select
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, hint, error)}
                className={cn(INPUT, 'h-9 pr-8', className)}
                {...rest}
            >
                {children}
            </select>
        </FieldShell>
    );
}

export interface TextAreaFieldProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
    label: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    containerClassName?: string;
    labelAction?: React.ReactNode;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(
    { label, hint, error, containerClassName, className, ...rest },
    ref,
) {
    const id = useId();
    return (
        <FieldShell id={id} label={label} hint={hint} error={error} className={containerClassName}>
            <textarea
                ref={ref}
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, hint, error)}
                className={cn(INPUT, 'min-h-[120px] resize-y py-2 font-mono text-sm leading-relaxed', className)}
                {...rest}
            />
        </FieldShell>
    );
});

/* ───────────────────────────── Schede ───────────────────────────── */

export interface TabItem<T extends string> {
    id: T;
    label: string;
    icon?: LucideIcon;
}

/**
 * Schede WAI-ARIA: `tablist`/`tab`/`tabpanel`, frecce sinistra e destra, Home e Fine.
 * Solo la scheda attiva è raggiungibile con Tab (roving tabindex).
 */
export function Tabs<T extends string>({ items, value, onChange, label, idBase, className }: {
    items: TabItem<T>[];
    value: T;
    onChange: (id: T) => void;
    label: string;
    idBase: string;
    className?: string;
}) {
    const refs = useRef<Record<string, HTMLButtonElement | null>>({});

    const move = (delta: number | 'first' | 'last') => {
        const index = items.findIndex(i => i.id === value);
        const next = delta === 'first' ? 0 : delta === 'last' ? items.length - 1 : (index + delta + items.length) % items.length;
        onChange(items[next].id);
        refs.current[items[next].id]?.focus();
    };

    return (
        <div
            role="tablist"
            aria-label={label}
            className={cn('flex gap-1 border-b border-line', className)}
            onKeyDown={(e) => {
                if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
                else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
                else if (e.key === 'Home') { e.preventDefault(); move('first'); }
                else if (e.key === 'End') { e.preventDefault(); move('last'); }
            }}
        >
            {items.map(({ id, label: itemLabel, icon: Icon }) => {
                const selected = id === value;
                return (
                    <button
                        key={id}
                        ref={el => { refs.current[id] = el; }}
                        type="button"
                        role="tab"
                        id={`${idBase}-tab-${id}`}
                        aria-selected={selected}
                        aria-controls={`${idBase}-panel-${id}`}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onChange(id)}
                        className={cn(
                            '-mb-px inline-flex h-10 items-center gap-2 border-b-2 px-3 text-base font-medium transition-colors',
                            selected ? 'border-accent text-fg' : 'border-transparent text-fg-3 hover:text-fg',
                        )}
                    >
                        {Icon && <Icon size={16} aria-hidden="true" />}
                        {itemLabel}
                    </button>
                );
            })}
        </div>
    );
}

export function TabPanel({ idBase, id, children, className }: { idBase: string; id: string; children: React.ReactNode; className?: string }) {
    return (
        <div role="tabpanel" id={`${idBase}-panel-${id}`} aria-labelledby={`${idBase}-tab-${id}`} tabIndex={0} className={cn('focus-visible:outline-offset-4', className)}>
            {children}
        </div>
    );
}

/* ─────────────────────── Gruppo di pulsanti alternativi ─────────────────────── */

/**
 * Due o tre viste alternative (Diario/Console, Tutti/Solo questo bot). Pulsanti con
 * `aria-pressed` dentro un gruppo con nome: semplice per la tastiera e per i lettori.
 */
export function Segmented<T extends string>({ options, value, onChange, label, size = 'sm' }: {
    options: Array<{ value: T; label: string; disabled?: boolean }>;
    value: T;
    onChange: (value: T) => void;
    label: string;
    size?: 'sm' | 'md';
}) {
    return (
        <div role="group" aria-label={label} className="inline-flex rounded border border-line bg-surface-2 p-0.5">
            {options.map(opt => {
                const active = opt.value === value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        aria-pressed={active}
                        disabled={opt.disabled}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            'rounded-sm px-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                            size === 'sm' ? 'h-7 text-sm' : 'h-8 text-base',
                            active ? 'bg-surface-4 text-accent-strong shadow-raised' : 'text-fg-3 hover:text-fg',
                        )}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

/* ───────────────────────────── Distintivi ───────────────────────────── */

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'podcast' | 'news' | 'youtube';

const BADGE_TONES: Record<BadgeTone, string> = {
    neutral: 'text-fg-2',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    podcast: 'text-podcast',
    news: 'text-news',
    youtube: 'text-youtube',
};

export function Badge({ tone = 'neutral', icon: Icon, children, className }: {
    tone?: BadgeTone;
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span className={cn('inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-line bg-surface-3 px-2 text-xs font-medium', BADGE_TONES[tone], className)}>
            {Icon && <Icon size={12} aria-hidden="true" />}
            {children}
        </span>
    );
}

/** Pallino di stato: decorativo. Lo stato va sempre detto anche a parole accanto. */
export function StatusDot({ tone, pulse = false, className }: { tone: 'success' | 'danger' | 'neutral' | 'warning'; pulse?: boolean; className?: string }) {
    const color = tone === 'success' ? 'bg-success' : tone === 'danger' ? 'bg-danger' : tone === 'warning' ? 'bg-warning' : 'bg-fg-3';
    return <span aria-hidden="true" className={cn('inline-block h-2 w-2 shrink-0 rounded-full', color, pulse && 'animate-pulse-dot', className)} />;
}
