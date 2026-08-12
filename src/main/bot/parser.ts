
import Parser from 'rss-parser';
import crypto from 'crypto';
import dns from 'node:dns';
import { isIP } from 'node:net';
import { RssItem } from './types';

// --- Anti-SSRF URL Validation ---
// Blocca schemi non HTTP/HTTPS e indirizzi di rete privata/loopback.

/** True se l'indirizzo IP (v4 o v6) appartiene a una rete privata, loopback o link-local. */
function isPrivateAddress(addr: string): boolean {
    const a = addr.toLowerCase().replace(/^\[|\]$/g, '');

    // IPv4 (anche in forma IPv4-mapped IPv6 ::ffff:127.0.0.1)
    const v4 = a.startsWith('::ffff:') ? a.slice(7) : a;
    if (isIP(v4) === 4) {
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

    if (isIP(a) === 6) {
        return (
            a === '::' || a === '::1' ||
            /^f[cd]/.test(a) ||   // fc00::/7 unique-local
            /^fe[89ab]/.test(a)   // fe80::/10 link-local
        );
    }

    return false;
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
        throw new Error(`URL non valido: "${url}"`);
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error(`Protocollo non consentito: "${parsed.protocol}". Usare http:// o https://`);
    }

    const h = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');

    if (h === 'localhost' || /\.(local|internal|localdomain|home\.arpa)$/.test(h)) {
        throw new Error(`Indirizzo di rete privata/locale non consentito: "${h}"`);
    }

    if (isIP(h) !== 0) {
        if (isPrivateAddress(h)) {
            throw new Error(`Indirizzo di rete privata/locale non consentito: "${h}"`);
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
                throw new Error(`Indirizzo di rete privata/locale non consentito: "${h}" (${dotted})`);
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
        throw new Error(`Il dominio "${host}" risolve a un indirizzo di rete privata (${priv.address}): richiesta bloccata.`);
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

            // Image Logic Port (Enhanced for YouTube and AzuraCast)
            let image: string | undefined = undefined;

            // 1. YouTube/Atom media:group
            if (entry.media_group) {
                const group = entry.media_group;
                const thumb = group['media:thumbnail']?.[0] || group['media:thumbnail'];
                if (thumb) image = thumb['$']?.url || thumb.url;
            }

            // 2. iTunes Image (Podcasts / AzuraCast)
            if (!image && entry.itunes_image) {
                // Handle both object with href and direct string
                image = entry.itunes_image['$']?.['href'] || entry.itunes_image;
            }

            // 3. Generic Image Object
            if (!image && entry.image_obj) {
                image = entry.image_obj['url'] || entry.image_obj;
            }

            // 4. Enclosure (News/Blogs)
            if (!image && entry.enclosure && entry.enclosure.url && entry.enclosure.type?.startsWith('image')) {
                let rawUrl = entry.enclosure.url;
                if (rawUrl.startsWith('/')) {
                    try {
                        const baseUrl = new URL(url).origin;
                        image = `${baseUrl}${rawUrl}`;
                    } catch (e) {
                        image = rawUrl;
                    }
                } else {
                    image = rawUrl;
                }
            }

            // 5. Fallback: Search in content/summary for <img> tags
            if (!image) {
                const searchContent = entry.content || entry.contentSnippet;
                if (searchContent) {
                    const imgMatch = searchContent.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) image = imgMatch[1];
                }
            }

            items.push({
                title: entry.title || 'No Title',
                link: link,
                pubDate: date,
                summary: cleanSummary(entry.contentSnippet || entry.content || ''),
                image: image,
                feedName: name,
                id: generateId(link)
            });
        }

        return items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    } catch (error: any) {
        const msg = error.message || String(error);
        console.error(`[Parser] Errore critico fetching feed ${name}:`, error);
        throw new Error(`Fetch fallito: ${msg}`);
    }
}
