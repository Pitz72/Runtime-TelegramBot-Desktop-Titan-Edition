/**
 * Livello semantico di un messaggio di log — fix #23 (logging strutturato).
 * Usato anche come chiave stabile per React — fix #22 (key={log.id}).
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'success';

/**
 * Tipo di un evento del diario di scansione — Fase 7.
 *
 * Sono gli eventi che il motore dichiara *come tali*, invece di lasciarli dedurre dagli
 * emoji dentro una stringa (vedi `detectLevel` in main/logger.ts). Il diario a schermo
 * disegna questi; le righe senza evento restano nella console grezza e nel file.
 */
export type ScanEventType =
    | 'engine-start'
    | 'engine-stop'
    /** Giro di scansione avviato — `count` = bot da controllare */
    | 'scan-start'
    /** Sorgente in corso di lettura: alimenta la riga di attività, non una voce del diario */
    | 'source-start'
    /** Contenuto nuovo trovato e messo in coda di invio */
    | 'item-found'
    /** Contenuto trovato ma rimandato: ore di silenzio */
    | 'item-deferred'
    /** Contenuto pubblicato sul canale */
    | 'item-published'
    /** Giro concluso — `count` = contenuti pubblicati */
    | 'scan-end'
    /** Prossimo giro pianificato — `count` = minuti di attesa */
    | 'next-scan';

/**
 * Il carico strutturato di una riga di log, quando il motore ne emette uno.
 * Tutti i campi oltre a `type` sono opzionali: ogni evento riempie ciò che lo riguarda.
 */
export interface ScanEvent {
    type: ScanEventType;
    /** Nome del bot a cui l'evento appartiene */
    bot?: string;
    /** Nome della sorgente (feed) coinvolta */
    source?: string;
    /** Titolo del contenuto */
    title?: string;
    /** Conteggio: bot da controllare, contenuti pubblicati, minuti di attesa */
    count?: number;
}

export interface LogEntry {
    /** ID monotono crescente assegnato dal TitanLogger — stabile per React key */
    id: number;
    /** Livello semantico: dedotto dall'evento se c'è, altrimenti dagli emoji/keyword */
    level: LogLevel;
    /** Messaggio formattato con timestamp: "[HH:MM:SS] testo" */
    message: string;
    /** Evento strutturato, presente solo sulle righe che il diario sa disegnare — Fase 7 */
    event?: ScanEvent;
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
    /** Intervallo individuale in minuti — null = usa il check_interval del bot (F5) */
    check_interval: number | null;
    /** Timestamp ISO dell'ultimo fetch completato — null = mai fetchato (F5) */
    last_fetch_at: string | null;
    /** Minuti tra un invio digest e il successivo — null = modalità normale (F9) */
    digest_interval: number | null;
    /** Timestamp ISO dell'ultimo digest inviato — null = mai inviato (F9) */
    digest_last_sent: string | null;
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
