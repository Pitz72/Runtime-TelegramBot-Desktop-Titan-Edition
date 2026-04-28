
import Parser from 'rss-parser';
import crypto from 'crypto';
import { RssItem } from './types';

// --- Anti-SSRF URL Validation ---
// Blocca schemi non HTTP/HTTPS e indirizzi di rete privata/loopback.
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
    const h = parsed.hostname.toLowerCase();
    if (
        h === 'localhost' ||
        h === '::1' ||
        /^127\./.test(h) ||
        /^0\.0\.0\.0/.test(h) ||
        /^10\./.test(h) ||
        /^172\.(1[6-9]|2[0-9]|3[01])\./.test(h) ||
        /^192\.168\./.test(h) ||
        /^169\.254\./.test(h)  // link-local
    ) {
        throw new Error(`Indirizzo di rete privata/locale non consentito: "${h}"`);
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

// Rewrite of `clean_summary`
function cleanSummary(html: string): string {
    if (!html) return "";
    // Strip HTML tags and decode basic entities if needed
    let text = html.replace(/<[^>]*>?/gm, '').trim();
    if (text.length > 300) {
        return text.substring(0, 297) + "...";
    }
    return text;
}

export async function fetchFeed(name: string, url: string): Promise<RssItem[]> {
    try {
        validateFeedUrl(url);
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
