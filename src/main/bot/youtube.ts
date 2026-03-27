
import crypto from 'crypto';
import { RssItem } from './types';
import { validateFeedUrl } from './parser';

let youtube: any = null;

async function getYouTubeInstance() {
    if (!youtube) {
        const { Innertube } = await import('youtubei.js');
        youtube = await Innertube.create();
    }
    return youtube;
}

function generateId(link: string): string {
    return crypto.createHash('md5').update(link).digest('hex');
}

/**
 * Funzione per recuperare i video di un canale YouTube senza API Key.
 * Supporta ID canale (UC...), handle (@...) o URL completi.
 */
export async function fetchYouTubeVideos(channelIdOrHandle: string): Promise<RssItem[]> {
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

        let channel;
        try {
            // youtubei.js getChannel works with handles too (e.g. '@RuntimeRadio')
            channel = await yt.getChannel(targetId);
        } catch (e) {
            // Se fallisce, proviamo a cercarlo (spesso utile per handle nuovi o URL strani)
            const search = await yt.search(targetId, { type: 'channel' });
            if (search.channels.length > 0) {
                channel = await yt.getChannel(search.channels[0].id);
            } else {
                throw new Error(`Canale YouTube non trovato: ${targetId}`);
            }
        }

        const videos = await channel.getVideos();
        const items: RssItem[] = [];

        if (!videos.videos || videos.videos.length === 0) {
            return [];
        }

        // Prendiamo i primi 15 video
        const recentVideos = videos.videos.slice(0, 15);

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
                // Salta questo video, non è ancora uscito realmente
                continue;
            }
            // ------------------------------------------

            // youtubei.js Video object from getVideos() has 'published' text like '2 hours ago'
            // We'll estimate the date based on the text for the cutoff logic.

            let date = new Date();
            const dateText = v.published?.text || v.video_info?.text || "";

            if (dateText.includes('ago')) {
                const parts = dateText.split(' ');
                // Sulla base del formato "16 hours ago" o "2 days ago"
                // Cerchiamo il primo numero
                const amountMatch = dateText.match(/(\d+)/);
                const amount = amountMatch ? parseInt(amountMatch[0]) : 1;
                const unit = dateText.toLowerCase();

                if (unit.includes('hour')) date.setHours(date.getHours() - amount);
                else if (unit.includes('day')) date.setDate(date.getDate() - amount);
                else if (unit.includes('week')) date.setDate(date.getDate() - amount * 7);
                else if (unit.includes('month')) date.setMonth(date.getMonth() - amount);
                else if (unit.includes('minute')) date.setMinutes(date.getMinutes() - amount);
                else if (unit.includes('second')) date.setSeconds(date.getSeconds() - amount);
                else if (unit.includes('year')) date.setFullYear(date.getFullYear() - amount);
            }

            const videoLink = `https://www.youtube.com/watch?v=${v.id}`;

            items.push({
                title: v.title?.text || 'No Title',
                link: videoLink,
                pubDate: date,
                summary: v.description_snippet?.text || '',
                image: v.thumbnails?.[0]?.url,
                feedName: channel.metadata.title,
                id: generateId(videoLink)
            });
        }

        return items;
    } catch (error) {
        console.error('[YouTube] Error fetching videos:', error);
        throw error;
    }
}
