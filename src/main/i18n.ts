/**
 * Testi del main process: dialoghi nativi, righe del diario, errori che arrivano
 * all'interfaccia, notifiche e i testi che finiscono sul canale.
 *
 * L'interfaccia ha le sue traduzioni nel renderer; questi testi nascono qui e per molto
 * tempo erano solo in italiano. Il renderer comunica la lingua scelta con `set-locale`, che
 * la salva nelle impostazioni: all'avvio successivo il main la conosce prima che si apra
 * la finestra (il motore può partire da solo). Senza, vale quella del sistema.
 *
 * Le righe informative della console tecnica restano fuori: sono diagnostica, non diario.
 */
import { app } from 'electron';

export type MainLocale = 'it' | 'en';

const STRINGS = {
    it: {
        exportLogTitle: 'Esporta log',
        exportDbTitle: 'Esporta database completo',
        importDbTitle: 'Importa database',
        importDbConfirmTitle: 'Conferma importazione',
        importDbConfirm: 'Importando un database sovrascriverai TUTTI i dati attuali e l’applicazione si riavvierà. Continuare?',
        exportConfigTitle: 'Esporta tutti i bot',
        importConfigTitle: 'Importa profili bot',
        exportBotTitle: 'Esporta profilo bot',
        importBotTitle: 'Importa profilo bot',
        importOpmlTitle: 'Importa feed da OPML',
        cancel: 'Annulla',
        proceed: 'Procedi',
        import: 'Importa',
        openRtbTitle: 'Importa profilo bot',
        openRtbMessage: 'Importare il profilo bot da «{file}»?',
        openRtbDetail: 'Il bot viene aggiunto all’elenco e pubblica solo i contenuti nuovi, da adesso: il profilo non porta lo storico. Se un altro bot pubblica già sullo stesso canale, resta spento. Il token resta leggibile solo se il profilo è stato esportato da questo computer; altrimenti andrà reinserito nelle impostazioni del bot.',
        openRtbFailed: 'Importazione non riuscita',
        dbOpenFailedTitle: 'Impossibile aprire il database',
        dbOpenFailed: 'Titan non riesce ad aprire il proprio database e non può partire.\n\nFile: {path}\n\nDettagli: {error}\n\nSe il file è danneggiato, nella stessa cartella ci sono i backup automatici (titan.db.backup-…).',
        uiLoadFailedTitle: 'Errore di caricamento dell’interfaccia',
        uiLoadFailed: 'Impossibile caricare i file grafici dell’applicazione (index.html mancante o danneggiato).\n\nReinstalla l’applicazione.\nDettagli: {error}',
        fatalTitle: 'Errore fatale',
        filterDb: 'Database SQLite',
        filterText: 'File di testo',
        filterAll: 'Tutti i file',
        filterRtb: 'Profili bot Titan',
        filterOpml: 'File OPML',
        trayOpen: 'Apri Titan',
        trayRunning: 'Motore acceso',
        trayStopped: 'Motore spento',
        trayStart: 'Avvia il motore',
        trayStop: 'Ferma il motore',
        trayScanNow: 'Controlla adesso',
        trayQuit: 'Esci da Titan',
        trayHintTitle: 'Titan continua a lavorare',
        trayHintBody: 'La finestra è chiusa, il motore no. Riaprila dall’icona di Titan nell’area di notifica.',
        closeTitle: 'Chiudere Titan?',
        closeMessage: 'Il motore è acceso: se chiudi Titan, i bot smettono di pubblicare.',
        closeDetail: 'Nell’area di notifica Titan continua a lavorare senza finestra. La riapri dalla sua icona, oppure avviando di nuovo Titan.',
        closeDetailNoTray: 'Su questo desktop l’area di notifica non è disponibile: per continuare a pubblicare lascia la finestra aperta, anche ridotta a icona.',
        closeToTray: 'Continua nell’area di notifica',
        closeQuit: 'Chiudi Titan',
        closeRemember: 'Non chiederlo più (si cambia in Impostazioni → Generale)',
        autoStarted: '▶️ Motore avviato all’apertura (Impostazioni → Generale → Avvia il motore all’apertura).',

        // ── Motore: righe del diario (avvisi ed errori) ──
        engineStartFailed: '❌ Errore durante l’avvio del motore: {error}',
        engineUnexpected: '❌ Errore imprevisto del motore: {error}',
        nextScanFallback: '❌ Impossibile calcolare il prossimo giro, uso 15 minuti: {error}',
        scanNowUser: '👆 Controllo immediato richiesto: tutte le sorgenti attive, senza aspettare il loro intervallo.',
        scanNowResume: '💤 Ripresa dalla sospensione: controllo di tutte le sorgenti attive, senza aspettare il loro intervallo.',
        startupTemplateRejected: '⚠️ [{bot}] Telegram rifiuta il messaggio di avvio personalizzato ({error}): uso quello standard.',
        startupFailed: '❌ [{bot}] Messaggio di avvio non inviato: {error}',
        tokenUnreadable: '⚠️ [{bot}] Token non leggibile su questo computer: bot saltato. Apri le impostazioni del bot e reinserisci il token.',
        startDateInvalid: '❌ [{bot}] La data di partenza «{date}» non è una data valida: bot sospeso per non pubblicare tutto l’arretrato dei feed. Correggila nelle impostazioni del bot.',
        startDateFuture: '⚠️ [{bot}] La data di partenza ({date}) è nel futuro: nessun contenuto verrà pubblicato finché non arriva.',
        botNoFeeds: '⚠️ [{bot}] Nessuna sorgente da controllare.',
        pendingDrainFailed: '❌ [{bot}] Errore nel recupero della coda delle ore di silenzio: {error}',
        feedFailed: '❌ [{feed}] Lettura non riuscita: {error}',
        feedRetried: '⚠️ [{bot}] {feed}: letto al secondo tentativo (il primo era andato in timeout o la connessione era caduta).',
        queueLarge: '⚠️ [{bot}] Coda di invio lunga: {n} contenuti in attesa.',
        digestError: '❌ [{bot}] Errore nel riepilogo: {error}',
        botFailed: '❌ [{bot}] Errore durante il controllo del bot: {error}',
        botDeletedDuringFetch: '⚠️ [{bot}] Elaborazione interrotta: il bot è stato eliminato durante la lettura.',
        requeueFailed: '❌ [{bot}] Impossibile rimettere in coda «{title}»: {error}',
        jobBotDeleted: '⚠️ [{bot}] Contenuto tolto dalla coda: il bot è stato eliminato.',
        sendRetry: '⚠️ [{bot}] Invio non riuscito (tentativo {n} di {max}): «{title}», di nuovo in coda.',
        sendGaveUp: '⚠️ [{bot}] Telegram non raggiungibile: «{title}» non pubblicato, riproverò al prossimo giro. ({error})',
        botRejected: '❌ [{bot}] Telegram rifiuta il bot: {error}. Controlla token, canale e che il bot sia amministratore del canale. {n} contenuti restano in attesa e partiranno quando il problema è risolto.',
        itemRejected: '❌ [{bot}] Telegram ha rifiutato «{title}»: {error}. Contenuto saltato per non ritentarlo all’infinito.',
        jobFailed: '❌ [{bot}] Errore imprevisto con «{title}»: {error}. Contenuto saltato.',
        digestRejected: '❌ [{bot}] Riepilogo di «{feed}» rifiutato da Telegram: {error}. Quei {n} contenuti vengono saltati.',
        digestFailed: '⚠️ [{bot}] Riepilogo di «{feed}» non inviato, riprovo al prossimo giro. ({error})',
        notifySent: 'Pubblicato: {title}',
        unhandledRejection: '⚠️ Errore non gestito (Titan resta acceso): {error}',
        fatalLog: 'Errore fatale, Titan si chiude: {error}',
        backupDone: '🗄️ Backup quotidiano del database salvato ({file}); Titan tiene gli ultimi {n}.',
        backupFailed: '❌ Backup quotidiano del database non riuscito: {error}',

        // ── Invio a Telegram ──
        templateRejected: '⚠️ Telegram rifiuta il template personalizzato ({error}): «{title}» pubblicato con il modello predefinito. Correggi il template nelle impostazioni del bot.',
        floodTooLong: '⚠️ Telegram chiede di attendere {wait} s: contenuto rimandato al prossimo giro.',
        floodWait: '⏳ Telegram chiede di attendere {wait} s prima del prossimo invio.',
        previewRetry: '🔄 Telegram ha rifiutato il messaggio ({error}): nuovo tentativo senza anteprima.',
        networkRetry: '⚠️ Errore di rete verso Telegram (tentativo {n} di {max}): {error}',

        // ── YouTube ──
        ytChannelNotFound: 'Canale YouTube non trovato: {input}',
        ytChannelApprox: '[YouTube] «{input}» non trovato con precisione: uso il primo risultato della ricerca, «{name}». Se non è il canale giusto, scrivi nella sorgente l’indirizzo completo del canale.',
        ytNoVideos: '[YouTube] Nessun video dal canale «{channel}»: probabile limite temporaneo di YouTube. Riprovo al prossimo giro.',
        ytDateUnreadable: '[YouTube] Data non leggibile per «{title}» («{text}»): video ignorato.',
        ytOddId: '[YouTube] Identificativo insolito per «{title}»: «{id}».',
        ytFetchError: '[YouTube] Lettura non riuscita ({n} di fila): {error}',
        ytSessionReset: '[YouTube] {n} errori di fila: sessione con YouTube ricreata.',

        // ── Indirizzi dei feed ──
        urlInvalid: 'Indirizzo non valido: «{url}»',
        urlProtocol: 'Protocollo non consentito: «{protocol}». Usa http:// o https://',
        urlPrivate: 'Indirizzo di una rete privata o locale non consentito: «{host}»',
        urlPrivateDns: 'Il dominio «{host}» porta a un indirizzo di rete privata ({address}): richiesta bloccata.',
        fetchFailed: 'Lettura del feed non riuscita: {error}',

        // ── Profili .rtb ──
        rtbFieldMissing: 'Campo obbligatorio mancante o non valido nel file .rtb: «{field}»',
        rtbInterval: 'Nel file .rtb l’intervallo deve essere tra 1 e 1440 minuti, invece è: {value}',
        rtbFeedType: 'Tipo di sorgente non valido nel file .rtb: «{value}». Valori ammessi: podcast, news, youtube',
        rtbItemInvalid: 'Elemento non valido nel file .rtb',
        rtbFeedInvalid: 'Sorgente non valida nel file .rtb',
        rtbFormatInvalid: 'Il file non è un profilo .rtb valido',
        dbImportInvalid: 'File non importato: database non valido o danneggiato. {error}',

        // ── Testi che finiscono sul canale ──
        // Identici, carattere per carattere, ai modelli di sempre: sono ciò che esce sui canali.
        tplPodcast: "🎙 <b>{{feedName}}</b>\n\n<i>{{title}}</i>\n\n{{summary}}\n\n🎧 <a href='{{link}}'>Ascolta l'episodio</a>",
        tplYoutube: "🎬 <b>{{feedName}}</b>\n\n<b>{{title}}</b>\n\n▶️ <a href='{{link}}'>Guarda il video</a>",
        tplNews: "📰 <b>{{feedName}}</b>\n\n<b>{{title}}</b>\n\n🔗 <a href='{{link}}'>Leggi l'articolo completo</a>",
        digestOne: 'contenuto',
        digestMany: 'contenuti',
        digestRead: 'Leggi',
        digestMore: '… e altri {n}',
    },
    en: {
        exportLogTitle: 'Export log',
        exportDbTitle: 'Export full database',
        importDbTitle: 'Import database',
        importDbConfirmTitle: 'Confirm import',
        importDbConfirm: 'Importing a database will overwrite ALL current data and the application will restart. Continue?',
        exportConfigTitle: 'Export all bots',
        importConfigTitle: 'Import bot profiles',
        exportBotTitle: 'Export bot profile',
        importBotTitle: 'Import bot profile',
        importOpmlTitle: 'Import feeds from OPML',
        cancel: 'Cancel',
        proceed: 'Proceed',
        import: 'Import',
        openRtbTitle: 'Import bot profile',
        openRtbMessage: 'Import the bot profile from “{file}”?',
        openRtbDetail: 'The bot is added to your list and publishes only new content, from now on: a profile carries no history. If another bot already publishes to the same channel, it stays switched off. Its token stays readable only if the profile was exported on this computer; otherwise you will need to enter it again in the bot settings.',
        openRtbFailed: 'Import failed',
        dbOpenFailedTitle: 'Cannot open the database',
        dbOpenFailed: 'Titan cannot open its database and cannot start.\n\nFile: {path}\n\nDetails: {error}\n\nIf the file is damaged, the same folder holds the automatic backups (titan.db.backup-…).',
        uiLoadFailedTitle: 'Interface loading error',
        uiLoadFailed: 'The application’s interface files could not be loaded (index.html missing or damaged).\n\nPlease reinstall the application.\nDetails: {error}',
        fatalTitle: 'Fatal error',
        filterDb: 'SQLite database',
        filterText: 'Text files',
        filterAll: 'All files',
        filterRtb: 'Titan bot profiles',
        filterOpml: 'OPML files',
        trayOpen: 'Open Titan',
        trayRunning: 'Engine running',
        trayStopped: 'Engine stopped',
        trayStart: 'Start the engine',
        trayStop: 'Stop the engine',
        trayScanNow: 'Check now',
        trayQuit: 'Quit Titan',
        trayHintTitle: 'Titan keeps working',
        trayHintBody: 'The window is closed, the engine is not. Reopen it from the Titan icon in the notification area.',
        closeTitle: 'Close Titan?',
        closeMessage: 'The engine is running: if you close Titan, your bots stop publishing.',
        closeDetail: 'In the notification area Titan keeps working without a window. Reopen it from its icon, or by starting Titan again.',
        closeDetailNoTray: 'This desktop has no notification area: to keep publishing, leave the window open, even minimised.',
        closeToTray: 'Keep running in the notification area',
        closeQuit: 'Close Titan',
        closeRemember: 'Don’t ask again (change it in Settings → General)',
        autoStarted: '▶️ Engine started on launch (Settings → General → Start the engine on launch).',

        // ── Engine: journal lines (warnings and errors) ──
        engineStartFailed: '❌ The engine could not start: {error}',
        engineUnexpected: '❌ Unexpected engine error: {error}',
        nextScanFallback: '❌ Could not work out the next run, using 15 minutes: {error}',
        scanNowUser: '👆 Check now: every active source, without waiting for its interval.',
        scanNowResume: '💤 Back from sleep: checking every active source, without waiting for its interval.',
        startupTemplateRejected: '⚠️ [{bot}] Telegram rejects the custom startup message ({error}): using the standard one.',
        startupFailed: '❌ [{bot}] Startup message not sent: {error}',
        tokenUnreadable: '⚠️ [{bot}] The token can’t be read on this computer: bot skipped. Open the bot settings and enter the token again.',
        startDateInvalid: '❌ [{bot}] The start date “{date}” is not a valid date: bot paused so it doesn’t publish the feeds’ whole backlog. Fix it in the bot settings.',
        startDateFuture: '⚠️ [{bot}] The start date ({date}) is in the future: nothing will be published until it arrives.',
        botNoFeeds: '⚠️ [{bot}] No sources to check.',
        pendingDrainFailed: '❌ [{bot}] Error while recovering the quiet-hours queue: {error}',
        feedFailed: '❌ [{feed}] Could not read the source: {error}',
        feedRetried: '⚠️ [{bot}] {feed}: read on the second attempt (the first one timed out or the connection dropped).',
        queueLarge: '⚠️ [{bot}] Long publishing queue: {n} items waiting.',
        digestError: '❌ [{bot}] Digest error: {error}',
        botFailed: '❌ [{bot}] Error while checking the bot: {error}',
        botDeletedDuringFetch: '⚠️ [{bot}] Processing stopped: the bot was deleted while reading.',
        requeueFailed: '❌ [{bot}] Could not put “{title}” back in the queue: {error}',
        jobBotDeleted: '⚠️ [{bot}] Item removed from the queue: the bot was deleted.',
        sendRetry: '⚠️ [{bot}] Sending failed (attempt {n} of {max}): “{title}”, queued again.',
        sendGaveUp: '⚠️ [{bot}] Telegram unreachable: “{title}” not published, I’ll try again on the next run. ({error})',
        botRejected: '❌ [{bot}] Telegram rejects the bot: {error}. Check the token, the channel and that the bot is an administrator of the channel. {n} items stay waiting and will go out once the problem is fixed.',
        itemRejected: '❌ [{bot}] Telegram rejected “{title}”: {error}. Item skipped so it isn’t retried forever.',
        jobFailed: '❌ [{bot}] Unexpected error with “{title}”: {error}. Item skipped.',
        digestRejected: '❌ [{bot}] Telegram rejected the digest of “{feed}”: {error}. Those {n} items are skipped.',
        digestFailed: '⚠️ [{bot}] Digest of “{feed}” not sent, retrying on the next run. ({error})',
        notifySent: 'Published: {title}',
        unhandledRejection: '⚠️ Unhandled error (Titan keeps running): {error}',
        fatalLog: 'Fatal error, Titan is closing: {error}',
        backupDone: '🗄️ Daily database backup saved ({file}); Titan keeps the last {n}.',
        backupFailed: '❌ Daily database backup failed: {error}',

        // ── Sending to Telegram ──
        templateRejected: '⚠️ Telegram rejects the custom template ({error}): “{title}” published with the default one. Fix the template in the bot settings.',
        floodTooLong: '⚠️ Telegram asks to wait {wait} s: item postponed to the next run.',
        floodWait: '⏳ Telegram asks to wait {wait} s before the next message.',
        previewRetry: '🔄 Telegram rejected the message ({error}): trying again without the preview.',
        networkRetry: '⚠️ Network error towards Telegram (attempt {n} of {max}): {error}',

        // ── YouTube ──
        ytChannelNotFound: 'YouTube channel not found: {input}',
        ytChannelApprox: '[YouTube] “{input}” not found exactly: using the first search result, “{name}”. If it is not the right channel, write the channel’s full address in the source.',
        ytNoVideos: '[YouTube] No videos from the channel “{channel}”: probably a temporary YouTube limit. Trying again on the next run.',
        ytDateUnreadable: '[YouTube] Unreadable date for “{title}” (“{text}”): video ignored.',
        ytOddId: '[YouTube] Unusual identifier for “{title}”: “{id}”.',
        ytFetchError: '[YouTube] Reading failed ({n} in a row): {error}',
        ytSessionReset: '[YouTube] {n} errors in a row: YouTube session recreated.',

        // ── Feed addresses ──
        urlInvalid: 'Invalid address: “{url}”',
        urlProtocol: 'Protocol not allowed: “{protocol}”. Use http:// or https://',
        urlPrivate: 'Private or local network address not allowed: “{host}”',
        urlPrivateDns: 'The domain “{host}” points to a private network address ({address}): request blocked.',
        fetchFailed: 'Could not read the feed: {error}',

        // ── .rtb profiles ──
        rtbFieldMissing: 'Required field missing or invalid in the .rtb file: “{field}”',
        rtbInterval: 'In the .rtb file the interval must be between 1 and 1440 minutes, but it is: {value}',
        rtbFeedType: 'Invalid source type in the .rtb file: “{value}”. Allowed values: podcast, news, youtube',
        rtbItemInvalid: 'Invalid item in the .rtb file',
        rtbFeedInvalid: 'Invalid source in the .rtb file',
        rtbFormatInvalid: 'The file is not a valid .rtb profile',
        dbImportInvalid: 'File not imported: invalid or damaged database. {error}',

        // ── Text that ends up in the channel ──
        tplPodcast: "🎙 <b>{{feedName}}</b>\n\n<i>{{title}}</i>\n\n{{summary}}\n\n🎧 <a href='{{link}}'>Listen to the episode</a>",
        tplYoutube: "🎬 <b>{{feedName}}</b>\n\n<b>{{title}}</b>\n\n▶️ <a href='{{link}}'>Watch the video</a>",
        tplNews: "📰 <b>{{feedName}}</b>\n\n<b>{{title}}</b>\n\n🔗 <a href='{{link}}'>Read the full article</a>",
        digestOne: 'item',
        digestMany: 'items',
        digestRead: 'Read',
        digestMore: '… and {n} more',
    },
} as const;

export type MainStringKey = keyof typeof STRINGS.it;

/** Per i test di parità tra le lingue. */
export const MAIN_STRINGS = STRINGS;

let locale: MainLocale | null = null;

const localeListeners = new Set<() => void>();

/** Chi mostra testi fuori dalla finestra (il menu dell'area di notifica) si aggiorna al cambio lingua. */
export function onMainLocaleChange(listener: () => void) {
    localeListeners.add(listener);
}

export function setMainLocale(value: unknown) {
    if ((value === 'it' || value === 'en') && value !== locale) {
        locale = value;
        for (const listener of localeListeners) listener();
    }
}

/** La lingua in uso nel main: quella scelta nell'interfaccia o, finché non c'è, quella del sistema. */
export function mainLocale(): MainLocale {
    return currentLocale();
}

function currentLocale(): MainLocale {
    if (locale) return locale;
    try {
        return app.getLocale().toLowerCase().startsWith('it') ? 'it' : 'en';
    } catch {
        return 'it';
    }
}

/** Testo localizzato; `{nome}` nel testo si sostituisce con `vars.nome`. */
export function tm(key: MainStringKey, vars: Record<string, string> = {}): string {
    let text: string = STRINGS[currentLocale()][key];
    for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(v);
    return text;
}
