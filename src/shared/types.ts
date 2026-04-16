/**
 * Livello semantico di un messaggio di log — fix #23 (logging strutturato).
 * Usato anche come chiave stabile per React — fix #22 (key={log.id}).
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
    /** ID monotono crescente assegnato dal TitanLogger — stabile per React key */
    id: number;
    /** Livello semantico rilevato dagli emoji/keyword nel messaggio */
    level: LogLevel;
    /** Messaggio formattato con timestamp: "[HH:MM:SS] testo" */
    message: string;
}

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
    /** JSON string: { include: string[], exclude: string[] } — null = nessun filtro (F4) */
    keyword_filter: string | null;
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
