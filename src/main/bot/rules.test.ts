import { describe, expect, it } from 'vitest';
import {
    buildDigestMessage, classifyTelegramError, DIGEST_TEXT_BUDGET, escapeHtml, escapeUrl,
    isFeedDue, isTimeAllowed, loopIntervalMinutes, parseStartDate, parseUtcTimestamp,
    isMuted, normalizeChannelId, passesKeywordFilter, pickUrl, postingRight, startupMessage, truncate,
} from './rules';

const at = (h: number, m: number) => new Date(2026, 9, 19, h, m, 0);

describe('parseUtcTimestamp', () => {
    it('legge il formato di SQLite come UTC, non come ora locale', () => {
        expect(parseUtcTimestamp('2026-10-19 08:30:00')).toBe(Date.UTC(2026, 9, 19, 8, 30, 0));
    });
    it('legge l\'ISO con la Z', () => {
        expect(parseUtcTimestamp('2026-10-19T08:30:00Z')).toBe(Date.UTC(2026, 9, 19, 8, 30, 0));
    });
});

describe('parseStartDate', () => {
    it('accetta la data del selettore e l\'ISO completo', () => {
        expect(parseStartDate('2026-08-20')).toBe(Date.UTC(2026, 7, 20));
        expect(parseStartDate('2026-08-20T10:00:00.000Z')).toBe(Date.UTC(2026, 7, 20, 10));
        expect(parseStartDate('2026-08-20 10:00:00')).toBe(Date.UTC(2026, 7, 20, 10));
    });
    it('restituisce null per ciò che non è una data — mai «nessun limite»', () => {
        for (const v of ['', '   ', 'domani', '2026-13-45', null, undefined, 42, {}]) {
            expect(parseStartDate(v)).toBeNull();
        }
    });
});

describe('isFeedDue', () => {
    const now = Date.UTC(2026, 9, 19, 12, 0, 0);
    it('un feed mai letto è sempre da leggere', () => {
        expect(isFeedDue(null, 15, now)).toBe(true);
    });
    it('rispetta l\'intervallo, anche col formato UTC di SQLite', () => {
        expect(isFeedDue('2026-10-19 11:50:00', 15, now)).toBe(false);
        expect(isFeedDue('2026-10-19 11:45:00', 15, now)).toBe(true);
        expect(isFeedDue('2026-10-19T11:50:00Z', 5, now)).toBe(true);
    });
    it('un timestamp illeggibile non blocca il feed per sempre', () => {
        expect(isFeedDue('garbage', 15, now)).toBe(true);
    });
});

describe('isTimeAllowed', () => {
    it('finestra diurna, estremi inclusi', () => {
        expect(isTimeAllowed('08:00', '22:00', at(8, 0))).toBe(true);
        expect(isTimeAllowed('08:00', '22:00', at(22, 0))).toBe(true);
        expect(isTimeAllowed('08:00', '22:00', at(7, 59))).toBe(false);
        expect(isTimeAllowed('08:00', '22:00', at(22, 1))).toBe(false);
    });
    it('finestra che scavalca la mezzanotte', () => {
        expect(isTimeAllowed('22:00', '06:00', at(23, 30))).toBe(true);
        expect(isTimeAllowed('22:00', '06:00', at(5, 0))).toBe(true);
        expect(isTimeAllowed('22:00', '06:00', at(12, 0))).toBe(false);
    });
    it('il default 00:00–23:59 copre tutto il giorno', () => {
        expect(isTimeAllowed('00:00', '23:59', at(0, 0))).toBe(true);
        expect(isTimeAllowed('00:00', '23:59', at(23, 59))).toBe(true);
    });
});

describe('loopIntervalMinutes', () => {
    it('senza bot attivi torna al default', () => {
        expect(loopIntervalMinutes([])).toBe(15);
        expect(loopIntervalMinutes([{ is_active: false, check_interval: 5 }])).toBe(15);
    });
    it('un feed più frequente del bot accorcia il giro', () => {
        expect(loopIntervalMinutes([{ is_active: true, check_interval: 15 }], [5])).toBe(5);
    });
    it('resta tra 1 e 120 minuti', () => {
        expect(loopIntervalMinutes([{ is_active: true, check_interval: 1440 }])).toBe(120);
        expect(loopIntervalMinutes([{ is_active: true, check_interval: 15 }], [0, -3])).toBe(15);
    });
});

describe('passesKeywordFilter', () => {
    const item = { title: 'Novità su Electron 44', summary: 'Rilascio della nuova versione' };
    it('senza filtro passa tutto', () => {
        expect(passesKeywordFilter(item, null)).toBe(true);
    });
    it('include ed esclude, senza distinguere maiuscole', () => {
        expect(passesKeywordFilter(item, JSON.stringify({ include: ['electron'] }))).toBe(true);
        expect(passesKeywordFilter(item, JSON.stringify({ include: ['python'] }))).toBe(false);
        expect(passesKeywordFilter(item, JSON.stringify({ exclude: ['RILASCIO'] }))).toBe(false);
    });
    it('un filtro illeggibile non blocca nulla', () => {
        expect(passesKeywordFilter(item, '{rotto')).toBe(true);
    });
});

describe('pickUrl', () => {
    it('estrae l\'URL dalle forme di xml2js', () => {
        expect(pickUrl('https://a.it/x.jpg')).toBe('https://a.it/x.jpg');
        expect(pickUrl({ $: { href: 'https://a.it/i.png' } })).toBe('https://a.it/i.png');
        expect(pickUrl({ url: ['https://a.it/u.png'] })).toBe('https://a.it/u.png');
        expect(pickUrl([{ $: { url: 'https://a.it/t.jpg' } }])).toBe('https://a.it/t.jpg');
    });
    it('scarta tutto ciò che non è un URL http(s)', () => {
        expect(pickUrl({ title: 'logo' })).toBeUndefined();
        expect(pickUrl('javascript:alert(1)')).toBeUndefined();
        expect(pickUrl('/relative.png')).toBeUndefined();
        expect(pickUrl(42)).toBeUndefined();
    });
});

describe('escapeHtml / escapeUrl', () => {
    it('neutralizza i caratteri strutturali del testo', () => {
        expect(escapeHtml('<b>A & B</b>')).toBe('&lt;b&gt;A &amp; B&lt;/b&gt;');
    });
    it('un URL non può uscire dall\'attributo href', () => {
        const out = escapeUrl(`https://evil.example/x'><a href='https://phish.example`);
        expect(out).not.toMatch(/['"<>]/);
        expect(out.startsWith('https://evil.example/x%27%3E%3Ca')).toBe(true);
    });
    it('codifica & una volta sola e lascia intatti i %XX validi', () => {
        expect(escapeUrl('https://a.it/?a=1&b=2')).toBe('https://a.it/?a=1&amp;b=2');
        expect(escapeUrl('https://a.it/?a=1&amp;b=2')).toBe('https://a.it/?a=1&amp;b=2');
        expect(escapeUrl('https://a.it/%20%zz')).toBe('https://a.it/%20%25zz');
    });
    it('scarta schemi diversi da http/https e valori non stringa', () => {
        expect(escapeUrl('javascript:alert(1)')).toBe('');
        expect(escapeUrl('file:///etc/passwd')).toBe('');
        expect(escapeUrl({ url: 'https://a.it' })).toBe('');
        expect(escapeUrl(undefined)).toBe('');
    });
});

describe('buildDigestMessage', () => {
    it('elenca i contenuti con il link sicuro', () => {
        const { text, included } = buildDigestMessage('Feed <1>', [
            { item_title: 'Primo & unico', item_link: 'https://a.it/1' },
        ]);
        expect(included).toBe(1);
        expect(text).toContain('Feed &lt;1&gt;');
        expect(text).toContain('Primo &amp; unico');
        expect(text).toContain('href="https://a.it/1"');
        expect(text).toContain('1 contenuto');
    });
    it('resta sotto il limite di Telegram e conta chi resta fuori', () => {
        const long = 'x'.repeat(500);
        const items = Array.from({ length: 20 }, (_, i) => ({ item_title: `${i} ${long}`, item_link: `https://a.it/${i}` }));
        const { text, included } = buildDigestMessage('F', items);
        const visible = text.replace(/<[^>]+>/g, '');
        expect(visible.length).toBeLessThan(4096);
        expect(included).toBeLessThan(20);
        expect(text).toContain(`… e altri ${20 - included}`);
        expect(DIGEST_TEXT_BUDGET).toBeLessThan(4096);
    });
    it('al massimo venti per messaggio', () => {
        const items = Array.from({ length: 30 }, (_, i) => ({ item_title: `T${i}`, item_link: `https://a.it/${i}` }));
        expect(buildDigestMessage('F', items).included).toBe(20);
    });
});

describe('truncate', () => {
    it('chiude con l\'ellissi solo quando serve', () => {
        expect(truncate('abc', 5)).toBe('abc');
        expect(truncate('abcdefgh', 5)).toBe('abcd…');
    });
});

describe('classifyTelegramError', () => {
    const tg = (error_code: number, description: string, retry_after?: number) => ({
        response: { error_code, description, ...(retry_after ? { parameters: { retry_after } } : {}) },
    });

    it('FloodWait porta l\'attesa chiesta da Telegram', () => {
        expect(classifyTelegramError(tg(429, 'Too Many Requests: retry after 7', 7))).toEqual({
            kind: 'flood', description: 'Too Many Requests: retry after 7', retryAfter: 7,
        });
    });
    it('token, canale e permessi sono configurazione, non contenuto', () => {
        expect(classifyTelegramError(tg(401, 'Unauthorized')).kind).toBe('config');
        expect(classifyTelegramError(tg(403, 'Forbidden: bot was kicked from the channel chat')).kind).toBe('config');
        expect(classifyTelegramError(tg(400, 'Bad Request: chat not found')).kind).toBe('config');
        expect(classifyTelegramError(tg(400, 'Bad Request: need administrator rights in the channel chat')).kind).toBe('config');
    });
    it('un messaggio malformato è un rifiuto definitivo', () => {
        expect(classifyTelegramError(tg(400, "Bad Request: can't parse entities")).kind).toBe('rejected');
        expect(classifyTelegramError(tg(400, 'Bad Request: message is too long')).kind).toBe('rejected');
    });
    it('rete e 5xx sono transitori — il vecchio controllo non riconosceva ETIMEDOUT', () => {
        expect(classifyTelegramError(tg(502, 'Bad Gateway')).kind).toBe('transient');
        expect(classifyTelegramError({ code: 'ETIMEDOUT', message: 'connect ETIMEDOUT 149.154.167.220:443' }).kind).toBe('transient');
        expect(classifyTelegramError({ message: 'request to https://api.telegram.org/bot<x>/sendMessage failed, reason: getaddrinfo ENOTFOUND api.telegram.org' }).kind).toBe('transient');
        expect(classifyTelegramError(new Error('socket hang up')).kind).toBe('transient');
    });
    it('nel dubbio si riprova, non si perde il contenuto', () => {
        expect(classifyTelegramError(new Error('qualcosa di mai visto')).kind).toBe('transient');
    });
});

describe('startupMessage', () => {
    const bot = { name: 'Radio <Demo>', token: '123:abc', is_active: true, silent_start: false, template_startup: null };

    it('annuncia l\'avvio col modello predefinito, nome in escape e versione in fondo', () => {
        expect(startupMessage(bot, '2.4.0')).toBe('🟢 <b>Radio &lt;Demo&gt; Online</b>\n\n<pre>Runtime TelegramBot Desktop v2.4.0</pre>');
    });
    it('usa il modello personalizzato quando c\'è, e ignora quello fatto di soli spazi', () => {
        expect(startupMessage({ ...bot, template_startup: 'Eccomi' }, '2.4.0')).toBe('Eccomi\n\n<pre>Runtime TelegramBot Desktop v2.4.0</pre>');
        expect(startupMessage({ ...bot, template_startup: '   ' }, '2.4.0')).toContain('Online');
    });
    it('avvio silenzioso: nessun messaggio, nemmeno con un modello personalizzato', () => {
        expect(startupMessage({ ...bot, silent_start: true }, '2.4.0')).toBeNull();
        expect(startupMessage({ ...bot, silent_start: true, template_startup: 'Eccomi' }, '2.4.0')).toBeNull();
    });
    it('nessun messaggio da un bot spento o senza token leggibile', () => {
        expect(startupMessage({ ...bot, is_active: false }, '2.4.0')).toBeNull();
        expect(startupMessage({ ...bot, token: '' }, '2.4.0')).toBeNull();
    });
});

describe('normalizeChannelId', () => {
    it('porta ogni forma scritta dall\'utente a quella di Telegram', () => {
        expect(normalizeChannelId('https://t.me/Canale')).toBe('@Canale');
        expect(normalizeChannelId(' t.me/Canale ')).toBe('@Canale');
        expect(normalizeChannelId('Canale')).toBe('@Canale');
        expect(normalizeChannelId('@Canale')).toBe('@Canale');
    });
    it('lascia stare gli ID numerici, anche negativi', () => {
        expect(normalizeChannelId('-1001234567890')).toBe('-1001234567890');
        expect(normalizeChannelId('123456')).toBe('123456');
    });
});

describe('postingRight', () => {
    it('in un canale pubblica solo un amministratore con il permesso di pubblicare', () => {
        expect(postingRight('channel', { status: 'creator' })).toBe('ok');
        expect(postingRight('channel', { status: 'administrator', can_post_messages: true })).toBe('ok');
        expect(postingRight('channel', { status: 'administrator', can_post_messages: false })).toBe('noPostRight');
        expect(postingRight('channel', { status: 'member' })).toBe('notAdmin');
    });
    it('fuori dalla chat non pubblica nessuno', () => {
        expect(postingRight('channel', { status: 'left' })).toBe('notMember');
        expect(postingRight('supergroup', { status: 'kicked' })).toBe('notMember');
    });
    it('in un gruppo basta essere membri, purché non limitati', () => {
        expect(postingRight('supergroup', { status: 'member' })).toBe('ok');
        expect(postingRight('group', { status: 'restricted', can_send_messages: false })).toBe('restricted');
        expect(postingRight('group', { status: 'restricted', can_send_messages: true })).toBe('ok');
    });
});

describe('isMuted', () => {
    it('spento e sempre fanno quel che dicono', () => {
        expect(isMuted({ mute_mode: 'off' }, at(23, 0))).toBe(false);
        expect(isMuted({ mute_mode: 'always' }, at(12, 0))).toBe(true);
        expect(isMuted({}, at(23, 0))).toBe(false);
    });
    it('la fascia oraria vale anche a cavallo della mezzanotte', () => {
        const bot = { mute_mode: 'window', mute_from: '22:00', mute_until: '07:00' };
        expect(isMuted(bot, at(23, 30))).toBe(true);
        expect(isMuted(bot, at(3, 0))).toBe(true);
        expect(isMuted(bot, at(12, 0))).toBe(false);
    });
    it('fascia senza orari leggibili: si usa 22:00–07:00', () => {
        expect(isMuted({ mute_mode: 'window', mute_from: null, mute_until: null }, at(23, 0))).toBe(true);
    });
});