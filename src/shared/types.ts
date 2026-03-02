export interface BotConfig {
    id: number;
    name: string;
    token: string;
    channel_id: string;
    start_date: string;
    check_interval: number; // minutes, default 15
    send_from: string;
    send_until: string;
    template_podcast?: string;
    template_news?: string;
    template_youtube?: string;
    template_startup?: string;
    notifications_enabled: boolean;
    is_active: boolean;
}

export interface FeedConfig {
    id: number;
    bot_id: number;
    name: string;
    url: string;
    type: 'podcast' | 'news' | 'youtube';
    is_active: boolean;
}

export interface RssItem {
    title: string;
    link: string;
    pubDate: Date;
    summary: string;
    image?: string;
    feedName: string;
    id: string; // MD5 hash
}
