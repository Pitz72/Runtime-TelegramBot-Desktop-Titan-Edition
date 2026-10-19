/**
 * `window.api` finto per vedere l'interfaccia nel browser, senza Electron e senza dati veri.
 *
 * Tutto è inventato: nomi, canali, feed. Nessuna chiamata di rete, nessun file toccato.
 * Il motore simulato emette lotti di righe di log realistici, così il diario si riempie.
 */
import type { BotConfig, FeedConfig, LogEntry } from '../../src/shared/types';

const listeners: Record<string, Array<(...a: any[]) => void>> = {};
const on = (ch: string, cb: (...a: any[]) => void) => {
    (listeners[ch] ??= []).push(cb);
    return () => { listeners[ch] = (listeners[ch] ?? []).filter(f => f !== cb); };
};
const emit = (ch: string, ...args: any[]) => (listeners[ch] ?? []).forEach(cb => cb(...args));

const params = new URLSearchParams(location.search);
const empty = params.has('empty');

let bots: BotConfig[] = empty ? [] : [
    {
        id: 1, name: 'Radio Notizie', token: '123456789:AAEXAMPLEexampleEXAMPLEexample00000', channel_id: '@radio_notizie_demo',
        start_date: '2026-09-01', check_interval: 15, send_from: '07:00', send_until: '23:00',
        notifications_enabled: true, is_active: true,
    },
    {
        id: 2, name: 'Podcast della settimana', token: '987654321:AAEXAMPLEexampleEXAMPLEexample11111', channel_id: '-1001234567890',
        start_date: '2026-10-01', check_interval: 30, send_from: '00:00', send_until: '23:59',
        notifications_enabled: false, is_active: true,
    },
    {
        id: 3, name: 'Archivio tecnico', token: '', channel_id: 'archivio_demo',
        start_date: '2026-08-15', check_interval: 60, send_from: '00:00', send_until: '23:59',
        notifications_enabled: true, is_active: false,
    },
];

const feed = (id: number, bot_id: number, name: string, url: string, type: FeedConfig['type'], extra: Partial<FeedConfig> = {}): FeedConfig => ({
    id, bot_id, name, url, type, is_active: true, keyword_filter: null, check_interval: null,
    last_fetch_at: null, digest_interval: null, digest_last_sent: null, ...extra,
});

let feeds: FeedConfig[] = [
    feed(1, 1, 'Notizie dal mondo', 'https://example.org/notizie/rss.xml', 'news'),
    feed(2, 1, 'Tecnologia e scienza', 'https://example.org/tech/feed', 'news', { keyword_filter: JSON.stringify({ include: ['AI', 'Linux'], exclude: [] }), check_interval: 5 }),
    feed(3, 1, 'Il podcast del mattino', 'https://example.org/podcast/mattino.xml', 'podcast', { digest_interval: 1440 }),
    feed(4, 1, 'Canale video di esempio', 'https://www.youtube.com/@esempio', 'youtube'),
    feed(5, 1, 'Cultura (in pausa)', 'https://example.org/cultura/rss', 'news', { is_active: false }),
    feed(6, 2, 'Puntate della settimana', 'https://example.org/settimana.xml', 'podcast'),
];

let running = false;
let logId = 0;
let timer: number | null = null;
const t = () => new Date().toLocaleTimeString();
const entry = (message: string, level: LogEntry['level'], event?: LogEntry['event']): LogEntry =>
    ({ id: ++logId, level, message: `[${t()}] ${message}`, ...(event ? { event } : {}) });

function simulateScan() {
    emit('bot-logs-batch', [
        entry('🔄 Checking 2 bots...', 'info', { type: 'scan-start', count: 2 }),
        entry('  📡 [Radio Notizie] Fetching: Notizie dal mondo', 'info', { type: 'source-start', bot: 'Radio Notizie', source: 'Notizie dal mondo' }),
        entry('  🆕 [Radio Notizie] Added to queue: Nuovo satellite europeo in orbita', 'success', { type: 'item-found', bot: 'Radio Notizie', source: 'Notizie dal mondo', title: 'Nuovo satellite europeo in orbita' }),
        entry('  🌙 [Podcast della settimana] Quiet hours — salvato in coda persistente: Puntata 42', 'warn', { type: 'item-deferred', bot: 'Podcast della settimana', source: 'Puntate della settimana', title: 'Puntata 42 — Il suono delle città' }),
        entry('  ⚠️ Errore di rete verso Telegram (tentativo 1/3): ETIMEDOUT', 'warn'),
        entry('  ✅ [Radio Notizie] Sent: Nuovo satellite europeo in orbita', 'success', { type: 'item-published', bot: 'Radio Notizie', source: 'Notizie dal mondo', title: 'Nuovo satellite europeo in orbita' }),
        entry('  ❌ [Canale video di esempio] Processing error: Fetch fallito: timeout', 'error'),
        entry('🏁 Scan complete — 1 published', 'success', { type: 'scan-end', count: 1 }),
        entry('⏳ Next check in 15 minutes...', 'info', { type: 'next-scan', count: 15 }),
    ]);
}

const ok = <T,>(v: T) => new Promise<T>(r => setTimeout(() => r(v), 120));

(window as any).api = {
    getBots: () => ok(bots),
    createBot: (b: any) => {
        if (!b.name?.trim()) return Promise.reject(new Error("Error invoking remote method 'create-bot': Error: Campo obbligatorio mancante o non valido: \"name\""));
        const id = Math.max(0, ...bots.map(x => x.id)) + 1;
        bots = [...bots, { id, name: b.name, token: b.token, channel_id: b.channelId, start_date: b.startDate, check_interval: 15, send_from: '00:00', send_until: '23:59', notifications_enabled: true, is_active: true }];
        return ok(id);
    },
    deleteBot: (id: number) => { bots = bots.filter(b => b.id !== id); return ok(undefined); },
    updateBot: (d: any) => {
        bots = bots.map(b => b.id === d.id ? { ...b, name: d.name, token: d.token, channel_id: d.channelId, is_active: d.isActive, start_date: d.startDate, check_interval: d.checkInterval, notifications_enabled: d.notificationsEnabled, send_from: d.sendFrom, send_until: d.sendUntil, template_news: d.templateNews, template_podcast: d.templatePodcast, template_youtube: d.templateYoutube, template_startup: d.templateStartup } : b);
        return ok(undefined);
    },
    getFeeds: (botId: number) => ok(feeds.filter(f => f.bot_id === botId)),
    addFeed: (f: any) => {
        if (/127\.0\.0\.1|localhost/.test(f.url)) return Promise.reject(new Error(`Error invoking remote method 'add-feed': Error: Indirizzo di rete privata/locale non consentito: "${f.url}"`));
        feeds = [...feeds, feed(Math.max(0, ...feeds.map(x => x.id)) + 1, f.botId, f.name, f.url, f.type, { keyword_filter: f.keywordFilter, check_interval: f.checkInterval, digest_interval: f.digestInterval })];
        return ok(undefined);
    },
    updateFeed: (f: any) => { feeds = feeds.map(x => x.id === f.id ? { ...x, name: f.name, url: f.url, type: f.type, keyword_filter: f.keywordFilter, check_interval: f.checkInterval, digest_interval: f.digestInterval } : x); return ok(undefined); },
    deleteFeed: (id: number) => { feeds = feeds.filter(f => f.id !== id); return ok(undefined); },
    toggleFeed: (id: number, isActive: boolean) => { feeds = feeds.map(f => f.id === id ? { ...f, is_active: isActive } : f); return ok(undefined); },
    testFeed: ({ url }: any) => ok(url.includes('example') ? { success: true, count: 12 } : { success: false, error: 'Fetch fallito: getaddrinfo ENOTFOUND' }),
    clearHistory: () => ok(undefined),
    startBot: () => {
        running = true;
        emit('bot-logs-batch', [entry('🚀 Engine Started - Multi-Bot Mode', 'success', { type: 'engine-start' })]);
        setTimeout(simulateScan, 400);
        timer = window.setInterval(simulateScan, 20000);
        return ok({ success: true });
    },
    stopBot: () => {
        running = false;
        if (timer) clearInterval(timer);
        emit('bot-logs-batch', [entry('🛑 Engine Stopped', 'info', { type: 'engine-stop' })]);
        return ok({ success: true });
    },
    getBotStatus: () => ok({ running }),
    onLog: () => {},
    onLogsBatch: (cb: any) => { listeners['bot-logs-batch'] = [cb]; },
    onYouTubeApiError: () => {},
    getStats: (id: number) => ok(id === 1 ? { total: 1284, today: 7, week: 52 } : { total: 96, today: 0, week: 4 }),
    getDetailedStats: (id: number) => ok({
        total: 1284, today: 7, week: 52,
        byFeed: id === 1 ? [
            { feedId: 1, feedName: 'Notizie dal mondo', total: 801, today: 5 },
            { feedId: 2, feedName: 'Tecnologia e scienza', total: 377, today: 2 },
            { feedId: 9, feedName: null, total: 106, today: 0 },
        ] : [],
    }),
    importOpml: () => ok({ success: true, count: 0 }),
    getPerformanceMode: () => ok(false),
    setPerformanceMode: () => ok({ success: true }),
    getVersion: () => ok('2.4.0-preview'),
    setLocale: () => ok(undefined),
    onBotsChanged: (cb: any) => on('bots-changed', cb),
    checkForUpdates: () => { setTimeout(() => emit('update-not-available'), 300); return ok({ success: true }); },
    downloadUpdate: () => ok({ success: true }),
    installUpdate: () => ok(undefined),
    openExternal: (url: string) => { console.info('[preview] openExternal', url); return ok(undefined); },
    consumeWhatsNew: () => ok({ show: params.has('whatsnew'), version: '2.3.1' }),
    onUpdateAvailable: (cb: any) => on('update-available', cb),
    onUpdateNotAvailable: (cb: any) => on('update-not-available', cb),
    onUpdateProgress: (cb: any) => on('update-progress', cb),
    onUpdateDownloaded: (cb: any) => on('update-downloaded', cb),
    onUpdateError: (cb: any) => on('update-error', cb),
    getUiZoom: () => ok(1),
    setUiZoom: (z: number) => { document.body.style.zoom = String(z); return ok(z); },
    onUiZoomChanged: (cb: any) => on('ui-zoom-changed', cb),
    readLicense: (kind: string) => ok(kind === 'app' ? 'MIT License\n\nCopyright (c) 2026 Simone Pizzi\n\n(anteprima)' : 'Licenze di terze parti (anteprima)'),
    exportLogs: () => ok({ success: false, error: 'Cancelled' }),
    exportDatabase: () => ok({ success: false, error: 'Cancelled' }),
    importDatabase: () => ok({ success: false, error: 'Cancelled' }),
    exportConfig: () => ok({ success: false, error: 'Cancelled' }),
    importConfig: () => ok({ success: false, error: 'Cancelled' }),
    exportSingleBot: () => ok({ success: false }),
    importSingleBot: () => ok({ success: false }),
};
