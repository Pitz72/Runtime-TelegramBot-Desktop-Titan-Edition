
import Parser from 'rss-parser';
import crypto from 'crypto';
import dns from 'node:dns';
import { isIP } from 'node:net';
import { RssItem } from './types';
import { itemTitle, pickUrl } from './rules';
import { tm } from '../i18n';

// --- Anti-SSRF URL Validation ---
// Blocca schemi non HTTP/HTTPS e indirizzi di rete privata/loopback.

/** True se l'IPv4 puntato appartiene a una rete privata, loopback, link-local o riservata. */
function isPrivateV4(v4: string): boolean {
    const [o1, o2] = v4.split('.').map(Number);
    return (
        o1 === 0 ||                             // 0.0.0.0/8
        o1 === 10 ||                            // 10.0.0.0/8
        o1 === 127 ||                           // loopback
        (o1 === 100 && o2 >= 64 && o2 <= 127) || // CGNAT 100.64.0.0/10
        (o1 === 169 && o2 === 254) ||           // link-local
        (o1 === 172 && o2 >= 16 && o2 <= 31) || // 172.16.0.0/12
        (o1 === 192 && o2 === 168) ||           // 192.168.0.0/16
        o1 >= 224                               // multicast + riservati
    );
}

/**
 * Le otto parole da 16 bit di un IPv6, `::` espanso e coda IPv4 puntata convertita.
 * `null` se la stringa non è un IPv6.
 */
function ipv6Words(addr: string): number[] | null {
    if (isIP(addr) !== 6) return null;
    let a = addr;
    const tail = /(\d+\.\d+\.\d+\.\d+)$/.exec(a);
    if (tail) {
        const [b1, b2, b3, b4] = tail[1].split('.').map(Number);
        a = a.slice(0, -tail[1].length) + `${((b1 << 8) | b2).toString(16)}:${((b3 << 8) | b4).toString(16)}`;
    }
    const [head, rest] = a.split('::');
    const left = head ? head.split(':') : [];
    const right = rest !== undefined && rest !== '' ? rest.split(':') : [];
    const missing = 8 - left.length - right.length;
    const words = [...left, ...Array(rest !== undefined ? missing : 0).fill('0'), ...right].map(w => parseInt(w || '0', 16));
    return words.length === 8 && words.every(w => Number.isInteger(w) && w >= 0 && w <= 0xffff) ? words : null;
}

const wordsToV4 = (hi: number, lo: number) => [hi >> 8, hi & 255, lo >> 8, lo & 255].join('.');

/** True se l'indirizzo IP (v4 o v6) appartiene a una rete privata, loopback o link-local. */
function isPrivateAddress(addr: string): boolean {
    const a = addr.toLowerCase().replace(/^\[|\]$/g, '');

    if (isIP(a) === 4) return isPrivateV4(a);

    const w = ipv6Words(a);
    if (!w) return false;

    const zeros = (from: number, to: number) => w.slice(from, to).every(x => x === 0);

    // IPv4 incapsulato. Il parser URL di Node riscrive «[::ffff:127.0.0.1]» come
    // «[::ffff:7f00:1]»: il vecchio controllo cercava solo la forma puntata e quella
    // esadecimale passava. Qui si guarda il valore, non la grafia.
    if (zeros(0, 5) && w[5] === 0xffff) return isPrivateV4(wordsToV4(w[6], w[7]));      // ::ffff:a.b.c.d (mapped)
    if (w[0] === 0x64 && w[1] === 0xff9b && zeros(2, 6)) return isPrivateV4(wordsToV4(w[6], w[7])); // 64:ff9b::/96 (NAT64)
    if (zeros(0, 6) && (w[6] !== 0 || w[7] > 1)) return isPrivateV4(wordsToV4(w[6], w[7]));       // ::a.b.c.d (compatible)

    return (
        zeros(0, 8) ||                          // ::
        (zeros(0, 7) && w[7] === 1) ||          // ::1
        (w[0] & 0xfe00) === 0xfc00 ||           // fc00::/7 unique-local
        (w[0] & 0xffc0) === 0xfe80 ||           // fe80::/10 link-local
        (w[0] & 0xff00) === 0xff00              // ff00::/8 multicast
    );
}

/**
 * Validazione sincrona dell'URL di un feed: schema e forma dell'host.
 * Copre anche le forme che il vecchio controllo testuale lasciava passare — IPv6 privati,
 * IPv4 in forma decimale/ottale/esadecimale (es. http://2130706433/), IPv4-mapped IPv6,
 * CGNAT e i domini `.local`/`.internal` delle reti domestiche e dei metadata server cloud.
 */
export function validateFeedUrl(url: string): void {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error(tm('urlInvalid', { url }));
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error(tm('urlProtocol', { protocol: parsed.protocol }));
    }

    const h = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');

    if (h === 'localhost' || /\.(local|internal|localdomain|home\.arpa)$/.test(h)) {
        throw new Error(tm('urlPrivate', { host: h }));
    }

    if (isIP(h) !== 0) {
        if (isPrivateAddress(h)) {
            throw new Error(tm('urlPrivate', { host: h }));
        }
        return;
    }

    // IPv4 scritto in forma non puntata (decimale, ottale o esadecimale): new URL() lo
    // lascia passare come "hostname" ma il resolver lo tratta come indirizzo numerico.
    // Es. http://2130706433/ e http://0x7f000001/ sono entrambi 127.0.0.1.
    if (/^(0x[0-9a-f]+|\d+)$/.test(h)) {
        const n = h.startsWith('0x') ? parseInt(h, 16) : parseInt(h, 10);
        if (Number.isFinite(n) && n <= 0xffffffff) {
            const dotted = [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
            if (isPrivateAddress(dotted)) {
                throw new Error(tm('urlPrivate', { host: `${h} (${dotted})` }));
            }
        }
    }
}

/**
 * Secondo livello di difesa: risolve davvero il nome e rifiuta se punta a una rete privata.
 *
 * Il controllo testuale di validateFeedUrl non vede il caso in cui un dominio pubblico
 * risolve a 127.0.0.1 o a un IP RFC-1918. Qui si guarda l'indirizzo effettivo.
 * Se la risoluzione fallisce NON si blocca nulla: il fetch successivo produrrà comunque
 * l'errore di rete corretto, e non vogliamo trasformare un DNS lento in un feed rotto.
 *
 * Limite noto e accettato: rss-parser segue i redirect e la destinazione di un 3xx non
 * ripassa da qui. Bloccare i redirect romperebbe i molti feed legittimi che fanno
 * http→https o passano da servizi di aggregazione.
 */
async function assertPublicHost(url: string): Promise<void> {
    const host = new URL(url).hostname.replace(/^\[|\]$/g, '');
    if (isIP(host) !== 0) return; // già validato in forma numerica da validateFeedUrl

    let addresses: dns.LookupAddress[];
    try {
        addresses = await dns.promises.lookup(host, { all: true });
    } catch {
        return;
    }

    const priv = addresses.find(a => isPrivateAddress(a.address));
    if (priv) {
        throw new Error(tm('urlPrivateDns', { host, address: priv.address }));
    }
}

const parser = new Parser({
    timeout: 30000, // 30 second timeout
    customFields: {
        item: [
            ['itunes:image', 'itunes_image'],
            ['image', 'image_obj'],
            ['media:group', 'media_group'],
        ]
    }
});

// Helper: Generate Deterministic ID
function generateId(link: string): string {
    return crypto.createHash('md5').update(link).digest('hex');
}

// Rewrite of `safe_date_parse`
function parseDate(item: any): Date | null {
    try {
        // Priorità a isoDate fornito da rss-parser (già normalizzato)
        if (item.isoDate) {
            const d = new Date(item.isoDate);
            if (!isNaN(d.getTime())) return d;
        }

        // Fallback per RSS standard
        if (item.pubDate) {
            const d = new Date(item.pubDate);
            if (!isNaN(d.getTime())) return d;
        }

        // Specifici per Atom (YouTube) se isoDate fallisce
        if (item.published) {
            const d = new Date(item.published);
            if (!isNaN(d.getTime())) return d;
        }
        if (item.updated) {
            const d = new Date(item.updated);
            if (!isNaN(d.getTime())) return d;
        }

        // Se non trova nulla, prova a cercare stringhe che somigliano a date nei campi personalizzati
        for (const key in item) {
            if (typeof item[key] === 'string' && (key.includes('date') || key.includes('published'))) {
                const d = new Date(item[key]);
                if (!isNaN(d.getTime())) return d;
            }
        }
    } catch (e) {
        console.error("[Parser] Errore nel parsing della data:", e);
    }
    return null;
}

/** Decodifica un'entità numerica (&#123; o &#x1F;) in carattere, ignorando codepoint invalidi. */
function decodeNumericEntity(raw: string, radix: number): string {
    try {
        const code = parseInt(raw, radix);
        if (!Number.isFinite(code) || code < 0 || code > 0x10FFFF) return '';
        return String.fromCodePoint(code);
    } catch {
        return '';
    }
}

// Rewrite of `clean_summary`
function cleanSummary(html: string): string {
    if (!html) return "";

    // 1. Rimuovi interi blocchi <script>/<style> (contenuto incluso, non solo i tag)
    let text = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');

    // 2. Rimuovi i tag HTML, inclusi quelli malformati o non chiusi a fine stringa
    //    (la vecchia regex /<[^>]*>?/gm lasciava passare "<b senza chiusura").
    text = text.replace(/<[^>]*>/g, '').replace(/<[^>]*$/g, '');

    // 3. Decodifica le entità HTML/XML più comuni. &amp; per ultimo per non
    //    trasformare sequenze come "&amp;lt;" in "<".
    text = text
        .replace(/&nbsp;/gi, ' ')
        .replace(/&quot;/gi, '"')
        .replace(/&apos;/gi, "'")
        .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => decodeNumericEntity(n, 16))
        .replace(/&#(\d+);/g, (_, n) => decodeNumericEntity(n, 10))
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&');

    // 4. Normalizza spazi bianchi
    text = text.replace(/\s+/g, ' ').trim();

    if (text.length > 300) {
        return text.substring(0, 297) + "...";
    }
    return text;
}

export async function fetchFeed(name: string, url: string): Promise<RssItem[]> {
    try {
        validateFeedUrl(url);
        await assertPublicHost(url);
        const feed = await parser.parseURL(url);
        const items: RssItem[] = [];
        // <guid> grezzo di ogni item, in parallelo a items: serve solo alla
        // disambiguazione degli ID più sotto, quindi non entra in RssItem.
        const guids: string[] = [];

        if (!feed.items || feed.items.length === 0) {
            console.warn(`[Parser] Feed ${name} (${url}) non ha elementi.`);
            return [];
        }

        for (const entry of feed.items) {
            // Robust Link Extraction (Fix for AzuraCast empty <link> tags)
            let link = entry.link || "";

            if (!link || link.trim() === "") {
                // Fallback 1: Enclosure URL (Common in podcasts like AzuraCast)
                if (entry.enclosure && entry.enclosure.url) {
                    link = entry.enclosure.url;
                }
                // Fallback 2: GUID if it's a URL
                else if (entry.guid && (entry.guid.startsWith('http') || entry.guid.startsWith('https'))) {
                    link = entry.guid;
                }
            }

            if (!link || link.trim() === "") {
                console.warn(`[Parser] Salto item senza link in ${name}: ${entry.title}`);
                continue;
            }

            // --- Spreaker: normalizza il link alla pagina dell'episodio ---
            // Alcune show Spreaker impostano come <link> il sito personale dell'autore
            // (es. dk.dataknightmare.eu) invece della pagina dell'episodio. Il <guid> è però
            // sempre "https://api.spreaker.com/episode/{ID}": lo convertiamo nell'URL pubblico
            // "https://www.spreaker.com/episode/{ID}" così il click porta all'episodio Spreaker.
            const spreakerMatch = (typeof entry.guid === 'string' ? entry.guid : '').match(/api\.spreaker\.com\/episode\/(\d+)/);
            if (spreakerMatch) {
                link = `https://www.spreaker.com/episode/${spreakerMatch[1]}`;
            }

            const date = parseDate(entry);
            if (!date) {
                console.warn(`[Parser] Salto item senza data in ${name}: ${entry.title}`);
                continue;
            }

            // Immagine: i campi arrivano da xml2js in forme diverse (stringa, `{ $: { href } }`,
            // `{ url: [...] }`, array). `pickUrl` accetta solo un URL http(s) vero: prima un
            // oggetto poteva arrivare fino all'invio e farlo fallire.
            let image: string | undefined = undefined;

            // 1. YouTube/Atom media:group
            if (entry.media_group) {
                image = pickUrl(entry.media_group['media:thumbnail']);
            }

            // 2. iTunes Image (Podcasts / AzuraCast)
            if (!image && entry.itunes_image) {
                image = pickUrl(entry.itunes_image);
            }

            // 3. Generic Image Object
            if (!image && entry.image_obj) {
                image = pickUrl(entry.image_obj);
            }

            // 4. Enclosure (News/Blogs) — gli indirizzi relativi si completano con l'origine del feed
            if (!image && entry.enclosure && typeof entry.enclosure.url === 'string' && entry.enclosure.type?.startsWith('image')) {
                try {
                    image = pickUrl(new URL(entry.enclosure.url, url).href);
                } catch {
                    image = undefined;
                }
            }

            // 5. Fallback: Search in content/summary for <img> tags
            if (!image) {
                const searchContent = entry.content || entry.contentSnippet;
                if (typeof searchContent === 'string') {
                    const imgMatch = searchContent.match(/<img[^>]+src=["']([^"'>]+)["']/i);
                    if (imgMatch) image = pickUrl(imgMatch[1]);
                }
            }

            const summary = cleanSummary(entry.contentSnippet || entry.content || '');
            items.push({
                // Senza titolo (Mastodon, microblog) vale l'inizio del testo — vedi itemTitle.
                title: itemTitle(entry.title, summary),
                link: link,
                pubDate: date,
                summary,
                image: image,
                feedName: name,
                id: generateId(link)
            });
            // rss-parser espone <guid> per RSS e <id> per Atom.
            const rawGuid = typeof entry.guid === 'string' ? entry.guid.trim()
                : typeof (entry as any).id === 'string' ? (entry as any).id.trim()
                : '';
            guids.push(rawGuid);
        }

        // --- ID da <guid> per i feed che riusano lo stesso <link> ---
        // Alcuni generatori (es. gli Show Extra di runtimeradio.com) mettono in ogni
        // <item> il link della pagina dello show invece di quello dell'episodio: tutti
        // gli episodi collassano sullo stesso MD5 e, dopo la prima pubblicazione,
        // isProcessed() scarta in silenzio ogni puntata successiva.
        // Il <guid> resta invece univoco, quindi lo usiamo come ID — ma SOLO dove il
        // link è effettivamente duplicato, così gli ID dei feed normali (e quindi la
        // history già scritta) restano identici e nulla rischia di essere ripubblicato.
        const linkCount = new Map<string, number>();
        for (const item of items) {
            linkCount.set(item.link, (linkCount.get(item.link) ?? 0) + 1);
        }
        items.forEach((item, i) => {
            if ((linkCount.get(item.link) ?? 0) > 1 && guids[i]) {
                item.id = generateId(guids[i]);
            }
        });

        return items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    } catch (error: any) {
        const msg = error.message || String(error);
        console.error(`[Parser] Errore critico fetching feed ${name}:`, error);
        throw new Error(tm('fetchFailed', { error: msg }));
    }
}
