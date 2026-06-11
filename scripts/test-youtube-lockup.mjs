// Test diagnostico fallback LockupView — eseguire con: node scripts/test-youtube-lockup.mjs [canale]
import { Innertube } from 'youtubei.js';

const target = process.argv[2] || '@RuntimeRadio';

function extractLockupVideos(videosTab) {
    const lockups = videosTab?.memo?.get?.('LockupView') || [];
    const adapted = [];
    for (const lockup of lockups) {
        const type = lockup?.content_type;
        if (type !== 'VIDEO' && type !== 'MOVIE' && type !== 'SHORT') continue;
        const videoId = lockup?.content_id;
        if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) continue;
        const parts = (lockup.metadata?.metadata?.metadata_rows || [])
            .flatMap((row) => row?.metadata_parts || [])
            .map((part) => part?.text?.text || '')
            .filter(Boolean);
        const dateText = parts.find((t) => /\bago\b|\bfa\b/i.test(t))
            || parts.find((t) => /premier|upcoming|scheduled|in attesa/i.test(t))
            || '';
        adapted.push({
            videoId,
            title: lockup.metadata?.title?.text || 'No Title',
            dateText,
            allParts: parts
        });
    }
    return adapted;
}

const yt = await Innertube.create();
console.log('Innertube creata. Risolvo:', target);

let channel;
try {
    channel = await yt.getChannel(target);
} catch (e) {
    console.log('getChannel diretto fallito:', e.message, '— provo search...');
    const search = await yt.search(target, { type: 'channel' });
    if (!search.channels?.length) throw new Error('Canale non trovato');
    channel = await yt.getChannel(search.channels[0].id);
}
console.log('Canale:', channel?.metadata?.title);

const videosTab = await channel.getVideos();
const native = videosTab?.videos || [];
console.log('videosTab.videos (parser nativo 17.0.1):', native.length);

const lockups = videosTab?.memo?.get?.('LockupView') || [];
console.log('Nodi LockupView nel memo:', lockups.length);

const extracted = extractLockupVideos(videosTab);
console.log('Estratti dal fallback:', extracted.length);
for (const v of extracted.slice(0, 5)) {
    console.log(` - [${v.videoId}] "${v.title}" | dateText: "${v.dateText}" | parts: ${JSON.stringify(v.allParts)}`);
}
if (native.length > 0) {
    for (const v of native.slice(0, 3)) {
        console.log(` (nativo) "${v.title?.text}" | published: "${v.published?.text || ''}"`);
    }
}
