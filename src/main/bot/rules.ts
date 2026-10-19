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

// ─── Destinazione e permessi ─────────────────────────────────────────────────

/**
 * L'identificativo del canale nella forma che vuole Telegram, qualunque forma abbia scritto
 * l'utente: «https://t.me/Canale», «t.me/Canale» e «Canale» diventano «@Canale»; un ID
 * numerico (anche negativo, «-100…») resta com'è.
 */
export function normalizeChannelId(raw: string): string {
    let id = raw.trim().replace(/^https?:\/\//i, '').replace(/^t\.me\//i, '');
    if (/^-?\d+$/.test(id)) return id;
    if (!id.startsWith('@')) id = '@' + id;
    return id;
}

/** Esito della verifica dei permessi di pubblicazione del bot in una chat. */
export type PostRight = 'ok' | 'notMember' | 'notAdmin' | 'noPostRight' | 'restricted';

/**
 * Il bot può pubblicare in questa chat? Si decide dal suo stato di membro (getChatMember).
 *
 * In un canale scrive solo un amministratore con il permesso «Pubblica messaggi»; in un
 * gruppo basta essere membri, purché non limitati. È il guasto più comune dopo il token
 * sbagliato: il bot aggiunto al canale come semplice iscritto.
 */
export function postingRight(
    chatType: string,
    member: { status: string; can_post_messages?: boolean; can_send_messages?: boolean },
): PostRight {
    const { status } = member;
    if (status === 'left' || status === 'kicked') return 'notMember';
    if (chatType === 'channel') {
        if (status === 'creator') return 'ok';
        if (status === 'administrator') return member.can_post_messages === false ? 'noPostRight' : 'ok';
        return 'notAdmin';
    }
    if (status === 'restricted' && member.can_send_messages === false) return 'restricted';
    return 'ok';
}

// ─── Canali YouTube ──────────────────────────────────────────────────────────

const YT_CHANNEL_ID = /^UC[\w-]{22}$/;

/**
 * Cosa ha scritto l'utente come sorgente YouTube, ridotto a ciò che serve per trovarla:
 * - `id`: un ID canale («UC…»), che si usa così com'è;
 * - `url`: l'indirizzo della pagina del canale, che YouTube sa tradurre in ID;
 * - `key`: una chiave stabile per le cache, uguale per le forme equivalenti.
 *
 * Prima si prendeva l'ultimo pezzo dell'indirizzo e lo si passava a `getChannel`, che
 * vuole solo ID: con un handle («@Canale») YouTube rispondeva 400 a ogni giro, e Titan
 * ripiegava su una ricerca. Funzionava, ma con il doppio delle richieste e un avviso
 * nel diario per ogni canale. In più «…/@Canale/videos» diventava «videos».
 */
export function youtubeChannelRef(input: string): { id?: string; url?: string; key: string } {
    const raw = input.trim();
    if (YT_CHANNEL_ID.test(raw)) return { id: raw, key: raw.toLowerCase() };

    const fromUrl = raw.match(/^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/(.*)$/i);
    const path = (fromUrl ? fromUrl[1] : raw).split(/[?#]/)[0];
    const segs = path.split('/').filter(Boolean);
    const [first = '', second = ''] = segs;

    if (first.toLowerCase() === 'channel' && YT_CHANNEL_ID.test(second)) return { id: second, key: second.toLowerCase() };
    if (first.startsWith('@') && first.length > 1) {
        return { url: `https://www.youtube.com/${first}`, key: first.toLowerCase() };
    }
    if ((first === 'c' || first === 'user') && second) {
        return { url: `https://www.youtube.com/${first}/${second}`, key: `${first}/${second}`.toLowerCase() };
    }
    // Una parola sola che ha la forma di un handle: quasi sempre è l'handle senza «@».
    if (!fromUrl && segs.length === 1 && /^[\w.-]{3,30}$/.test(first)) {
        return { url: `https://www.youtube.com/@${first}`, key: `@${first}`.toLowerCase() };
    }
    // Un nome con spazi o una forma che non si riconosce: resterà la ricerca.
    return { key: raw.toLowerCase() };
}

/**
 * Tra i risultati di una ricerca di canali, quello che corrisponde davvero a ciò che si
 * cercava: stesso handle o, per una ricerca per nome, stesso nome. `null` se nessuno
 * corrisponde — prima si prendeva comunque il primo, anche se era un omonimo.
 */
export function pickYouTubeChannel<T extends { author?: { name?: string; url?: string } }>(results: T[], wanted: string): T | null {
    const target = wanted.trim().toLowerCase();
    if (!target) return null;
    const handle = target.startsWith('@') ? target : `@${target}`;
    return results.find(r => {
        const url = (r.author?.url ?? '').toLowerCase().split(/[?#]/)[0];
        const name = (r.author?.name ?? '').trim().toLowerCase();
        return url.endsWith(`/${handle}`) || name === target.replace(/^@/, '');
    }) ?? null;
}

// ─── Notifiche senza suono ───────────────────────────────────────────────────

/** `off` = notifiche normali; `always` = sempre senza suono; `window` = senza suono in una fascia oraria. */
export type MuteMode = 'off' | 'always' | 'window';

export const MUTE_MODES: readonly MuteMode[] = ['off', 'always', 'window'];

/**
 * True se il messaggio va pubblicato senza suono (`disable_notification` di Telegram):
 * gli iscritti lo ricevono come sempre, ma il telefono non suona e non vibra. Utile di
 * notte, o per i canali che pubblicano spesso. La fascia può scavalcare la mezzanotte.
 */
export function isMuted(
    bot: { mute_mode?: string | null; mute_from?: string | null; mute_until?: string | null },
    now = new Date(),
): boolean {
    if (bot.mute_mode === 'always') return true;
    if (bot.mute_mode === 'window') return isTimeAllowed(bot.mute_from || '22:00', bot.mute_until || '07:00', now);
    return false;
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
