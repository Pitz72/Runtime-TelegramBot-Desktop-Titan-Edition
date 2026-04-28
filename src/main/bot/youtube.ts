
import crypto from 'crypto';
import { RssItem } from './types';
import { validateFeedUrl } from './parser';
import { TitanLogger } from '../logger';

let youtube: any = null;

// --- Cache YouTube Innertube — fix #19 ---
// Evita fetch ripetuti dello stesso canale nello stesso ciclo o con intervalli molto brevi.
// TTL: 5 minuti. Chiave: channel ID/handle normalizzato.
const YOUTUBE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minuti

interface YouTubeCacheEntry {
    items: RssItem[];
    fetchedAt: number;
}

const youtubeCache = new Map<string, YouTubeCacheEntry>();

/**
 * Normalizza l'identificatore del canale per usarlo come chiave di cache.
 * Equivalente alla pulizia input già fatta in fetchYouTubeVideos.
 */
function normalizeChannelKey(channelIdOrHandle: string): string {
    let key = channelIdOrHandle.trim();
    if (key.includes('youtube.com/')) {
        const parts = key.split('/');
        key = parts[parts.length - 1];
        if (key.includes('?')) key = key.split('?')[0];
    } else if (key.includes('youtu.be/')) {
        const parts = key.split('/');
        key = parts[parts.length - 1];
    }
    return key.toLowerCase();
}

/** Svuota la cache dei canali YouTube (usato anche da resetYouTubeSession) */
export function clearYouTubeCache() {
    youtubeCache.clear();
    TitanLogger.log('[YouTube] Cache cleared');
}
// -----------------------------------------

async function getYouTubeInstance() {
    if (!youtube) {
        const { Innertube } = await import('youtubei.js');
        youtube = await Innertube.create({ gl: 'US', hl: 'en' } as any);
        TitanLogger.log('[YouTube] New Innertube instance created');
    }
    return youtube;
}

/** Forza il reset della sessione (utile se si ricevono risposte vuote) */
export function resetYouTubeSession() {
    youtube = null;
    clearYouTubeCache();
    TitanLogger.log('[YouTube] Session manually reset');
}

function generateId(link: string): string {
    return crypto.createHash('md5').update(link).digest('hex');
}

/**
 * Funzione per recuperare i video di un canale YouTube senza API Key.
 * Supporta ID canale (UC...), handle (@...) o URL completi.
 */
export async function fetchYouTubeVideos(channelIdOrHandle: string): Promise<RssItem[]> {
    // --- Controllo cache — fix #19 ---
    const cacheKey = normalizeChannelKey(channelIdOrHandle);
    const cached = youtubeCache.get(cacheKey);
    if (cached) {
        const ageMs = Date.now() - cached.fetchedAt;
        if (ageMs < YOUTUBE_CACHE_TTL_MS) {
            TitanLogger.log(`[YouTube] Cache HIT per "${cacheKey}" (età: ${Math.round(ageMs / 1000)}s, TTL: ${YOUTUBE_CACHE_TTL_MS / 1000}s)`);
            return cached.items;
        }
        TitanLogger.log(`[YouTube] Cache EXPIRED per "${cacheKey}" (età: ${Math.round(ageMs / 1000)}s) — fetch fresco`);
    }
    // ----------------------------------

    try {
        const yt = await getYouTubeInstance();
        let targetId = channelIdOrHandle;

        // Validazione anti-SSRF se l'input è un URL completo
        if (targetId.startsWith('http://') || targetId.startsWith('https://')) {
            validateFeedUrl(targetId);
        }

        // Pulizia input
        if (targetId.includes('youtube.com/')) {
            const parts = targetId.split('/');
            targetId = parts[parts.length - 1];
            if (targetId.includes('?')) targetId = targetId.split('?')[0];
        } else if (targetId.includes('youtu.be/')) {
            const parts = targetId.split('/');
            targetId = parts[parts.length - 1];
        }

        TitanLogger.log(`[YouTube] Resolving channel: ${targetId}`);

        let channel;
        try {
            // youtubei.js getChannel works with handles too (e.g. '@RuntimeRadio')
            channel = await yt.getChannel(targetId);
        } catch (e) {
            // Se fallisce, proviamo a cercarlo (spesso utile per handle nuovi o URL strani)
            TitanLogger.log(`[YouTube] Direct getChannel failed for "${targetId}", trying search...`);
            const search = await yt.search(targetId, { type: 'channel' });
            if (search.channels && search.channels.length > 0) {
                channel = await yt.getChannel(search.channels[0].id);
            } else {
                throw new Error(`Canale YouTube non trovato: ${targetId}`);
            }
        }

        TitanLogger.log(`[YouTube] Channel found: ${channel?.metadata?.title || 'unknown'}`);

        const videosTab = await channel.getVideos();

        // Usiamo SOLO videosTab.videos — il fallback su videosTab.contents restituisce
        // oggetti non-video (RichItem, sezioni) con v.id non corrispondente al videoId YouTube,
        // producendo MD5 diversi tra sessioni diverse e bypassing del controllo isProcessed.
        const videoList = videosTab?.videos || [];
        TitanLogger.log(`[YouTube] Raw videos count: ${videoList.length}`);

        if (videoList.length === 0) {
            TitanLogger.log(`[YouTube] WARNING: No videos returned for channel "${targetId}". Possible API issue — resetting session.`);
            // Reset sessione per il prossimo tentativo
            resetYouTubeSession();
            return [];
        }

        const items: RssItem[] = [];

        // Prendiamo i primi 15 video
        const recentVideos = videoList.slice(0, 15);

        for (const v of recentVideos) {
            // --- FILTRO ANTI-PREMIERE E PROGRAMMATI ---
            const isUpcoming = v.is_upcoming === true;
            const isPremiere = v.is_premiere === true;

            const rawDateText = (v.published?.text || v.video_info?.text || "").toLowerCase();
            const textIndicatesFuture = rawDateText.includes('premiere') ||
                rawDateText.includes('upcoming') ||
                rawDateText.includes('in attesa') ||
                rawDateText.includes('scheduled');

            if (isUpcoming || isPremiere || textIndicatesFuture) {
                TitanLogger.log(`[YouTube] Skipping upcoming/premiere: ${v.title?.text || v.id}`);
                continue;
            }
            // ------------------------------------------

            // youtubei.js Video object from getVideos() has 'published' text like '2 hours ago'
            // We'll estimate the date based on the text for the cutoff logic.

            let date: Date | null = null;

            // Supporto sia per l'inglese ("ago") che per l'italiano ("fa")
            if (rawDateText.includes('ago') || rawDateText.includes('fa')) {
                date = new Date();
                const amountMatch = rawDateText.match(/(\d+)/);
                const amount = amountMatch ? parseInt(amountMatch[0]) : 1;

                // Forme abbreviate InnerTube con hl:'en' (es. "3mo ago", "1y ago", "22h ago").
                // La regex deve testare 'mo' prima di 'm' per evitare match parziali.
                const abbrev = rawDateText.match(/(\d+)(mo|min|y|w|h|d|m|s)\s*ago/i);
                if (abbrev) {
                    const n = parseInt(abbrev[1]);
                    const u = abbrev[2].toLowerCase();
                    if (u === 'y') date.setFullYear(date.getFullYear() - n);
                    else if (u === 'mo') date.setMonth(date.getMonth() - n);
                    else if (u === 'w') date.setDate(date.getDate() - n * 7);
                    else if (u === 'd') date.setDate(date.getDate() - n);
                    else if (u === 'h') date.setHours(date.getHours() - n);
                    else if (u === 'm' || u === 'min') date.setMinutes(date.getMinutes() - n);
                    else if (u === 's') date.setSeconds(date.getSeconds() - n);
                } else {
                // Forme full-word inglese/italiano (es. "3 months ago", "2 giorni fa")
                // NOTA: NON usare includes('or') — "or" è contenuto in "giorno"/"giorni"
                // causando il match errato di "giorni" (days) come "ora/ore" (hours).
                if (rawDateText.includes('hour') || rawDateText.includes('ora') || rawDateText.includes('ore')) date.setHours(date.getHours() - amount);
                else if (rawDateText.includes('day') || rawDateText.includes('giorn')) date.setDate(date.getDate() - amount);
                else if (rawDateText.includes('week') || rawDateText.includes('settiman')) date.setDate(date.getDate() - amount * 7);
                else if (rawDateText.includes('month') || rawDateText.includes('mes')) date.setMonth(date.getMonth() - amount);
                else if (rawDateText.includes('minute') || rawDateText.includes('minut')) date.setMinutes(date.getMinutes() - amount);
                else if (rawDateText.includes('second')) date.setSeconds(date.getSeconds() - amount);
                else if (rawDateText.includes('year') || rawDateText.includes('ann')) date.setFullYear(date.getFullYear() - amount);
                }
            } else {
                // Prova il parsing diretto per date fisse (es. "Apr 10, 2026")
                const parsed = Date.parse(rawDateText);
                if (!isNaN(parsed)) {
                    date = new Date(parsed);
                }
            }

            // --- PROTEZIONE ANTI-SPAM (CRITICA) ---
            // Se non siamo riusciti a determinare la data, NON usiamo "new Date()" (adesso).
            // Usiamo una data nel passato remoto (1 Gennaio 2000) per assicurarci che
            // il video venga ignorato dal filtro cutoffDate invece di causare spam.
            if (!date) {
                date = new Date(Date.UTC(2000, 0, 1)); // UTC puro — coerente con il threshold in engine.ts
                if (rawDateText) TitanLogger.log(`[YouTube] WARN: data non parsabile per "${v.title?.text}": "${rawDateText}" → fallback 2000`);
            }
            TitanLogger.log(`[YouTube] Item: "${v.title?.text}" | dateText: "${rawDateText}" | date: ${date.toISOString().slice(0, 10)}`);

            // --- ID EXTRACTION DETERMINISTICO ---
            // v.id può variare tra sessioni (renderer ID vs video ID puro) quando il canale
            // viene risolto via search-fallback. Il thumbnail URL è sempre stabile:
            // https://i.ytimg.com/vi/{VIDEO_ID}/hqdefault.jpg
            let videoId = '';
            const thumbUrl = v.thumbnails?.[0]?.url || v.best_thumbnail?.url || '';
            const thumbMatch = thumbUrl.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
            if (thumbMatch) {
                videoId = thumbMatch[1];
            } else if (v.video_id && /^[a-zA-Z0-9_-]{11}$/.test(v.video_id)) {
                videoId = v.video_id;
            } else if (v.id && /^[a-zA-Z0-9_-]{11}$/.test(v.id)) {
                videoId = v.id;
            } else {
                // Fallback grezzo — logghiamo per diagnostica
                videoId = v.id || v.video_id || '';
                if (videoId) TitanLogger.log(`[YouTube] WARN: ID non standard per "${v.title?.text}": "${videoId}"`);
            }
            if (!videoId) {
                TitanLogger.log(`[YouTube] Skipping item with no video ID (type: ${v.type || 'unknown'})`);
                continue;
            }
            const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

            // Thumbnail: prova diversi path in base alla versione di youtubei.js
            const thumbnail = v.thumbnails?.[0]?.url
                || v.best_thumbnail?.url
                || v.thumbnail?.url
                || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined);

            items.push({
                title: v.title?.text || v.title || 'No Title',
                link: videoLink,
                pubDate: date,
                summary: v.description_snippet?.text || v.short_description || '',
                image: thumbnail,
                feedName: channel.metadata?.title || channel.title || 'YouTube',
                id: generateId(videoLink)
            });
        }

        TitanLogger.log(`[YouTube] Parsed ${items.length} valid items from ${channel.metadata?.title || targetId}`);

        // Salva in cache — fix #19
        youtubeCache.set(cacheKey, { items, fetchedAt: Date.now() });
        TitanLogger.log(`[YouTube] Cache MISS → salvato in cache per "${cacheKey}" (TTL: ${YOUTUBE_CACHE_TTL_MS / 1000}s)`);

        return items;
    } catch (error) {
        TitanLogger.log(`[YouTube] Error fetching videos: ${error}`);
        // Reset sessione dopo errore (clearYouTubeCache è chiamato dentro resetYouTubeSession)
        resetYouTubeSession();
        throw error;
    }
}
