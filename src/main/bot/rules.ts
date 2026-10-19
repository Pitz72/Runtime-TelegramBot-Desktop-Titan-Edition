/**
 * Regole pure del motore — nessun import da `electron`, nessun accesso al database.
 *
 * Stanno qui, e non dentro engine.ts o telegram.ts, per una ragione sola: si possono
 * collaudare con un test secco (`npm test`), senza avviare Electron. Il codice che
 * decide cosa pubblicare, quando e come trattare un errore di Telegram è quello che
 * ha causato più guai nella storia del progetto; merita di essere provato a ogni modifica.
 */

// ─── Date e orari ────────────────────────────────────────────────────────────

/**
 * Interpreta un timestamp del DB come UTC.
 * Le righe scritte da `datetime('now')`/`CURRENT_TIMESTAMP` ("YYYY-MM-DD HH:MM:SS",
 * UTC senza fuso) verrebbero lette da `new Date()` come ora locale, sfasando i
 * confronti di N ore. Le righe in ISO con 'Z' passano dal ramo `new Date()`.
 */
export function parseUtcTimestamp(s: string): number {
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
        return Date.parse(s.replace(' ', 'T') + 'Z');
    }
    return new Date(s).getTime();
}

/**
 * La «data di partenza» di un bot come istante, o `null` se non è una data.
 *
 * ⚠️ `null` non va mai trattato come «nessun limite». Con una data illeggibile il
 * vecchio confronto `itemTime < NaN` era sempre falso, quindi **tutto** l'arretrato
 * del feed superava il filtro e finiva sul canale. Chi riceve `null` sospende il bot.
 */
export function parseStartDate(value: unknown): number | null {
    if (typeof value !== 'string' || value.trim() === '') return null;
    const t = parseUtcTimestamp(value.trim());
    return Number.isFinite(t) ? t : null;
}

/** True se il feed ha superato il proprio intervallo di controllo (F5). */
export function isFeedDue(lastFetchAt: string | null, intervalMinutes: number, now = Date.now()): boolean {
    if (!lastFetchAt) return true;
    const last = parseUtcTimestamp(lastFetchAt);
    if (!Number.isFinite(last)) return true;
    return now - last >= intervalMinutes * 60 * 1000;
}

/**
 * True se l'ora corrente cade nella finestra di invio del bot (fuori dalle ore di silenzio).
 * `from`/`until` sono "HH:MM"; una finestra che scavalca la mezzanotte (22:00–06:00) vale.
 */
export function isTimeAllowed(from: string, until: string, now = new Date()): boolean {
    const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (from <= until) return current >= from && current <= until;
    return current >= from || current <= until;
}

/**
 * Minuti di attesa tra un giro di scansione e il successivo.
 *
 * Il giro deve partire almeno con la frequenza del feed più frequente: prima contava solo
 * l'intervallo del bot, quindi un feed impostato a 5 minuti su un bot da 15 veniva letto
 * comunque ogni 15 — l'intervallo per feed (F5) non poteva scendere sotto quello del bot.
 */
export function loopIntervalMinutes(
    bots: Array<{ is_active: boolean; check_interval: number | null | undefined }>,
    feedIntervals: number[] = [],
): number {
    const active = bots.filter(b => b.is_active);
    if (active.length === 0) return 15;
    const candidates = [
        ...active.map(b => b.check_interval || 15),
        ...feedIntervals.filter(n => Number.isFinite(n) && n > 0),
    ];
    return Math.max(1, Math.min(120, Math.min(...candidates)));
}

// ─── Filtri sui contenuti ────────────────────────────────────────────────────

/** Filtro per parole chiave di un feed (F4). Un filtro illeggibile non blocca nulla. */
export function passesKeywordFilter(item: { title: string; summary: string }, keywordFilter: string | null): boolean {
    if (!keywordFilter) return true;
    try {
        const { include = [], exclude = [] } = JSON.parse(keywordFilter) as { include?: string[]; exclude?: string[] };
        const text = `${item.title} ${item.summary}`.toLowerCase();
        if (include.length > 0 && !include.some(kw => text.includes(kw.toLowerCase()))) return false;
        if (exclude.some(kw => text.includes(kw.toLowerCase()))) return false;
        return true;
    } catch {
        return true;
    }
}

/**
 * Estrae un URL da un campo immagine di un feed, qualunque forma abbia.
 *
 * rss-parser restituisce i campi personalizzati così come li legge xml2js: a volte una
 * stringa, a volte `{ $: { href } }`, a volte `{ url: ['…'] }`, a volte un array. Prima
 * l'oggetto passava tal quale fino all'invio, dove `url.trim()` esplodeva — e il
 * contenuto, dopo i tentativi, veniva dato per pubblicato senza esserlo mai stato.
 */
export function pickUrl(value: unknown, depth = 0): string | undefined {
    if (depth > 4 || value == null) return undefined;
    if (typeof value === 'string') {
        const s = value.trim();
        return /^https?:\/\//i.test(s) ? s : undefined;
    }
    if (Array.isArray(value)) {
        for (const v of value) {
            const found = pickUrl(v, depth + 1);
            if (found) return found;
        }
        return undefined;
    }
    if (typeof value === 'object') {
        const o = value as Record<string, unknown>;
        return pickUrl(o.$, depth + 1) ?? pickUrl(o.href, depth + 1) ?? pickUrl(o.url, depth + 1);
    }
    return undefined;
}

// ─── HTML di Telegram ────────────────────────────────────────────────────────

/** Escape di testo generico per l'HTML di Telegram (titoli, sommari, nomi). */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Rende un URL proveniente dal feed sicuro dentro un attributo href.
 *
 * I template inseriscono il link in `href='{{link}}'`: un URL con `'`, `"`, `<` o `>`
 * uscirebbe dall'attributo e permetterebbe a chi controlla il feed di iniettare HTML nel
 * messaggio pubblicato. I caratteri strutturali vengono percent-encodati, `&` diventa
 * `&amp;` perché il contesto è un attributo HTML. Schemi diversi da http/https: scartati.
 */
export function escapeUrl(url: unknown): string {
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url.trim())) return '';
    return url
        .trim()
        .replace(/%(?![0-9A-Fa-f]{2})/g, '%25')
        .replace(/'/g, '%27')
        .replace(/"/g, '%22')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/&(?!amp;)/g, '&amp;');
}

/** Tronca un testo a `max` caratteri visibili, chiudendo con un'ellissi. */
export function truncate(text: string, max: number): string {
    return text.length <= max ? text : text.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

/**
 * Telegram accetta al massimo 4096 caratteri di testo visibile per messaggio.
 * Il digest resta parecchio sotto: lascia margine a emoji e entità.
 */
export const DIGEST_TEXT_BUDGET = 3500;
const DIGEST_TITLE_MAX = 180;

/**
 * Messaggio di un digest (F9), con un tetto sulla lunghezza.
 *
 * Senza tetto, venti titoli lunghi superavano il limite di Telegram: l'invio veniva
 * rifiutato, la coda non si svuotava e il digest restava bloccato per sempre, ritentato
 * a ogni giro. Gli elementi che non ci stanno sono contati in coda al messaggio.
 */
export function buildDigestMessage(
    feedName: string,
    items: Array<{ item_title: string | null; item_link: string | null }>,
    maxItems = 20,
): { text: string; included: number } {
    const capped = items.slice(0, maxItems);
    const lines: string[] = [];
    let visible = 0;
    for (const it of capped) {
        const title = truncate((it.item_title || '').trim(), DIGEST_TITLE_MAX);
        const href = escapeUrl(it.item_link || '');
        const line = href
            ? `${lines.length + 1}. <b>${escapeHtml(title)}</b>\n🔗 <a href="${href}">Leggi</a>`
            : `${lines.length + 1}. <b>${escapeHtml(title)}</b>`;
        const cost = title.length + 16;
        if (visible + cost > DIGEST_TEXT_BUDGET && lines.length > 0) break;
        lines.push(line);
        visible += cost;
    }
    const included = lines.length;
    const rest = items.length - included;
    const header = `📋 <b>${escapeHtml(truncate(feedName, 120))}</b> — ${included} ${included === 1 ? 'contenuto' : 'contenuti'}\n\n`;
    const footer = rest > 0 ? `\n\n… e altri ${rest}` : '';
    return { text: header + lines.join('\n\n') + footer, included };
}

// ─── Messaggio di avvio ──────────────────────────────────────────────────────

/**
 * Il messaggio che un bot pubblica quando parte il motore, oppure `null` se non deve
 * pubblicarne nessuno: bot spento, token illeggibile o **avvio silenzioso**.
 *
 * L'avvio silenzioso è per le chat e i canali che non gradiscono l'annuncio: il bot
 * parte e lavora come gli altri, solo senza farsi sentire. Prima l'unico modo era
 * spegnerlo, avviare il motore e riaccenderlo a mano dopo un po'.
 */
export function startupMessage(
    bot: { name: string; token: string; is_active: boolean; silent_start?: boolean; template_startup?: string | null },
    appVersion: string,
): string | null {
    if (!bot.is_active || !bot.token || bot.silent_start) return null;
    const custom = bot.template_startup && bot.template_startup.trim() !== '' ? bot.template_startup : null;
    const base = custom ?? `🟢 <b>${escapeHtml(bot.name)} Online</b>`;
    return `${base}\n\n<pre>Runtime TelegramBot Desktop v${appVersion}</pre>`;
}

// ─── Errori di Telegram ──────────────────────────────────────────────────────

/**
 * Natura di un errore di invio, da cui dipende cosa fare del contenuto:
 * - `flood`     — Telegram chiede di aspettare (`retry_after`): si aspetta e si riprova;
 * - `transient` — rete, timeout, 5xx: il contenuto resta da pubblicare, si riprova più tardi;
 * - `config`    — token non valido, canale inesistente, bot senza permessi: inutile insistere
 *                 finché l'utente non corregge, ma il contenuto **non** va perso;
 * - `rejected`  — Telegram rifiuta *quel* messaggio (HTML non valido, troppo lungo):
 *                 ritentare darebbe lo stesso esito.
 */
export type TelegramErrorKind = 'flood' | 'transient' | 'config' | 'rejected';

export interface TelegramErrorInfo {
    kind: TelegramErrorKind;
    description: string;
    /** Secondi di attesa richiesti da Telegram, solo per `flood` */
    retryAfter?: number;
}

const NETWORK_CODES = /\b(ETIMEDOUT|ESOCKETTIMEDOUT|ECONNRESET|ECONNREFUSED|ECONNABORTED|ENOTFOUND|EAI_AGAIN|ENETUNREACH|ENETDOWN|EHOSTUNREACH|EPIPE|UND_ERR_[A-Z_]+)\b/;

export function classifyTelegramError(e: unknown): TelegramErrorInfo {
    const err = e as { response?: { error_code?: number; description?: string; parameters?: { retry_after?: number } }; code?: string; message?: string; type?: string };
    const description = err?.response?.description || err?.message || String(e);
    const status = err?.response?.error_code;
    const retryAfter = err?.response?.parameters?.retry_after;

    if (typeof retryAfter === 'number' && retryAfter > 0) {
        return { kind: 'flood', description, retryAfter };
    }

    if (typeof status === 'number') {
        if (status === 429) return { kind: 'flood', description, retryAfter: 5 };
        if (status >= 500) return { kind: 'transient', description };
        if (status === 401 || status === 403 || status === 404) return { kind: 'config', description };
        if (status === 400 && /chat not found|chat_id is empty|have no rights|not enough rights|bot was kicked|bot is not a member|need administrator rights/i.test(description)) {
            return { kind: 'config', description };
        }
        if (status === 400) return { kind: 'rejected', description };
        return { kind: 'transient', description };
    }

    // Nessuna risposta HTTP: rete, DNS, timeout, socket chiuso. La vecchia ricerca cercava
    // 'ETIMEOUT' (il codice vero è ETIMEDOUT) e quindi non riconosceva i timeout.
    const text = `${err?.code ?? ''} ${err?.type ?? ''} ${description}`;
    if (NETWORK_CODES.test(text) || /network|socket hang up|timed? ?out|fetch failed|request to .* failed|aborted/i.test(text)) {
        return { kind: 'transient', description };
    }

    // Ignoto: meglio ritentare più tardi che perdere il contenuto.
    return { kind: 'transient', description };
}
