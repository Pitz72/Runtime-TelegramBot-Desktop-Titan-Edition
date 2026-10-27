
import crypto from 'crypto';
import { RssItem } from './types';
import { validateFeedUrl } from './parser';
import { TitanLogger } from '../logger';
import { adaptLockupView, itemTitle, pickYouTubeChannel, youtubeChannelRef } from './rules';

let youtube: any = null;

// Contatore errori consecutivi: evitiamo di ricreare l'istanza Innertube a ogni errore
// transitorio (issue LuanRT/YouTube.js#1158 — nuovi handshake ravvicinati amplificano
// l'antibot). Resettiamo la sessione solo dopo errori ripetuti, quando è plausibile che
// sia davvero compromessa. Azzerato a ogni risposta valida.
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS_BEFORE_RESET = 5;

// --- Cache YouTube Innertube — fix #19 ---
// Evita fetch ripetuti dello stesso canale nello stesso ciclo o con intervalli molto brevi.
// TTL: 5 minuti. Chiave: channel ID/handle normalizzato.
const YOUTUBE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minuti

interface YouTubeCacheEntry {
    items: RssItem[];
    fetchedAt: number;
}

const youtubeCache = new Map<string, YouTubeCacheEntry>();

/** Chiave di cache del canale: uguale per le forme equivalenti (handle, indirizzo, ID). */
function normalizeChannelKey(channelIdOrHandle: string): string {
    return youtubeChannelRef(channelIdOrHandle).key;
}

/**
 * ID canale (UC…) già trovati in questa sessione. Un handle si traduce in ID una volta
 * sola: dopo, ogni giro va dritto al canale. Non si svuota all'arresto del motore —
 * un handle non cambia canale da un giro all'altro.
 */
const channelIds = new Map<string, string>();

/**
 * L'ID del canale per ciò che l'utente ha scritto nella sorgente.
 *
 * `getChannel` accetta solo ID: prima gli si passava l'handle, YouTube rispondeva 400 a
 * ogni giro e si ripiegava su una ricerca (un avviso nel diario per canale, e il doppio
 * delle richieste — proprio ciò che l'antibot di YouTube punisce). Ora l'handle si fa
 * tradurre dalla pagina del canale, che risponde con l'ID esatto. La ricerca resta come
 * ultima risorsa, e sceglie il canale con lo stesso handle o nome, non il primo che capita.
 */
async function resolveChannelId(yt: any, input: string): Promise<string> {
    const ref = youtubeChannelRef(input);
    if (ref.id) return ref.id;
    const known = channelIds.get(ref.key);
    if (known) return known;

    let id: string | undefined;
    if (ref.url) {
        try {
            const nav = await yt.resolveURL(ref.url);
            const browseId = nav?.payload?.browseId;
            if (typeof browseId === 'string' && browseId.startsWith('UC')) id = browseId;
        } catch {
            // Pagina non trovata o risposta inattesa: resta la ricerca.
        }
    }

    if (!id) {
        const query = ref.key.startsWith('@') ? ref.key : input.trim();
        const search = await yt.search(query, { type: 'channel' });
        const results: any[] = search?.channels ?? [];
        const exact = pickYouTubeChannel(results, query);
        const chosen = exact ?? results[0];
        if (!chosen?.id) throw new Error(`Canale YouTube non trovato: ${input}`);
        if (!exact) {
            TitanLogger.log(`[YouTube] «${input}» non trovato con precisione: uso il primo risultato della ricerca, «${chosen.author?.name ?? chosen.id}». Se non è il canale giusto, scrivi nella sorgente l'indirizzo completo del canale.`, 'warn');
        }
        id = chosen.id as string;
    }

    channelIds.set(ref.key, id);
    TitanLogger.log(`[YouTube] ${input} → ${id}`);
    return id;
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
        youtube = await Innertube.create();
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

// --- Nodi LockupView ---
// YouTube serve le liste video dei canali come nodi `LockupView` invece di `Video` (issue
// LuanRT/YouTube.js#1181). youtubei.js 17.0.1 non li metteva in videosTab.videos, e Titan li
// ripescava dal memo. Dalla 17.2 ci sono, ma con la forma del LockupView: niente `title.text`,
// niente `published.text`. Presi così, ogni video aveva data illeggibile, finiva sul ripiego
// del 2000 e veniva scartato — YouTube non avrebbe pubblicato più nulla. Ogni elemento della
// lista passa quindi da `adaptLockupView` (rules.ts); il memo resta come ultima risorsa.
function normalizeVideoList(videosTab: any): any[] {
    const listed: any[] = videosTab?.videos || [];
    const source = listed.length > 0 ? listed : (videosTab?.memo?.get?.('LockupView') || []);
    const videos: any[] = [];
    for (const v of source) {
        if (v?.type === 'LockupView' || v?.content_id !== undefined) {
            const adapted = adaptLockupView(v);
            if (adapted) videos.push(adapted);
        } else {
            videos.push(v);
        }
    }
    return videos;
}
// -----------------------------------------

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

        TitanLogger.log(`[YouTube] Resolving channel: ${targetId}`);

        const channelId = await resolveChannelId(yt, targetId);
        const channel = await yt.getChannel(channelId);

        TitanLogger.log(`[YouTube] Channel found: ${channel?.metadata?.title || 'unknown'}`);

        const videosTab = await channel.getVideos();

        // Usiamo SOLO videosTab.videos (o i LockupView del memo) — il fallback su
        // videosTab.contents restituisce oggetti non-video (RichItem, sezioni) con v.id non
        // corrispondente al videoId YouTube, producendo MD5 diversi tra sessioni diverse e
        // bypassing del controllo isProcessed.
        const videoList = normalizeVideoList(videosTab);
        // Risposta valida dall'API (anche se 0 video): la sessione funziona, azzera gli errori.
        consecutiveErrors = 0;
        TitanLogger.log(`[YouTube] Raw videos count: ${videoList.length}`);

        if (videoList.length === 0) {
            // v2.0.3: NON resettare la sessione su 0 risultati.
            // Issue upstream LuanRT/YouTube.js#1158 e #1166 (chiusa dal maintainer il 14/05/2026
            // come "server-side, non fixabile") confermano che è rate-limiting YouTube:
            // creare nuove istanze Innertube subito dopo un 0 *amplifica* il blocco invece di
            // risolverlo. Manteniamo la sessione viva e lasciamo che il prossimo poll riprovi.
            TitanLogger.log(`[YouTube] WARNING: No videos returned for channel "${targetId}". Probabile rate-limit YouTube — sessione mantenuta, riprova al prossimo ciclo.`, 'warn');
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

                // Forme abbreviate InnerTube (es. "3mo ago", "1y ago", "22h ago").
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
                if (rawDateText) TitanLogger.log(`[YouTube] WARN: data non parsabile per "${v.title?.text}": "${rawDateText}" → fallback 2000`, 'warn');
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
                if (videoId) TitanLogger.log(`[YouTube] WARN: ID non standard per "${v.title?.text}": "${videoId}"`, 'warn');
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

            // `v.title` è un oggetto Text: usarlo come ripiego metteva un oggetto al posto del titolo.
            const titleText = typeof v.title?.text === 'string' ? v.title.text
                : typeof v.title === 'string' ? v.title
                : '';
            const summary = typeof v.description_snippet?.text === 'string' ? v.description_snippet.text
                : typeof v.short_description === 'string' ? v.short_description
                : '';
            items.push({
                // Mai «No Title»: un segnaposto finirebbe nella deduplica per titolo (itemTitle).
                title: itemTitle(titleText, summary),
                link: videoLink,
                pubDate: date,
                summary,
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
        consecutiveErrors++;
        TitanLogger.log(`[YouTube] Error fetching videos (${consecutiveErrors} consecutivi): ${error}`, 'error');
        // NON ricreare l'istanza Innertube a ogni errore: i nuovi handshake ravvicinati
        // amplificano il blocco antibot (issue #1158). Manteniamo sessione e cache intatte;
        // resettiamo solo dopo errori ripetuti, quando la sessione è plausibilmente compromessa.
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS_BEFORE_RESET) {
            TitanLogger.log(`[YouTube] ${consecutiveErrors} errori consecutivi — reset sessione Innertube.`, 'warn');
            resetYouTubeSession();
            consecutiveErrors = 0;
        }
        throw error;
    }
}
