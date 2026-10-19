import type { Language } from '../locales/I18nContext';

/**
 * Punti salienti per versione, localizzati. Mostrati nella schermata "Novità"
 * al primo avvio dopo un aggiornamento automatico. Se una versione non è qui,
 * la schermata usa un testo di fallback generico.
 */
export const RELEASE_NOTES: Record<string, Record<Language, string[]>> = {
    '2.4.1': {
        it: [
            'Spariti gli avvisi «Direct getChannel failed… trying search» che comparivano nel diario per ogni canale YouTube, a ogni giro.',
            'Titan trova il canale YouTube al primo colpo e se lo ricorda: metà delle richieste a YouTube, e meno occasioni di farsi rallentare.',
            'Quando serve la ricerca, Titan sceglie il canale con lo stesso handle o lo stesso nome, non il primo risultato.',
            'Un indirizzo come «youtube.com/@canale/videos» ora funziona come «@canale».',
        ],
        en: [
            'The “Direct getChannel failed… trying search” warnings that showed up in the diary for every YouTube channel, on every check, are gone.',
            'Titan finds the YouTube channel on the first try and remembers it: half the requests to YouTube, and fewer chances of being slowed down.',
            'When a search is needed, Titan picks the channel with the same handle or the same name, not the first result.',
            'An address like “youtube.com/@channel/videos” now works like “@channel”.',
        ],
    },
    '2.4.0': {
        it: [
            'Interfaccia ridisegnata in blu, più leggibile: testo più grande, ingrandimento dall’80 al 180% (Ctrl + e Ctrl −), tutto usabile da tastiera.',
            'Chiudere la finestra a motore acceso non ferma più i bot senza avvisare. Titan può restare nell’area di notifica, partire con il computer e avviare il motore da solo: vedi Impostazioni → Generale.',
            '«Prova il bot» verifica token, canale e permessi con Telegram, senza pubblicare nulla.',
            '«Controlla adesso» legge subito tutte le sorgenti, senza aspettare il loro intervallo.',
            'Bot per bot: avvio silenzioso, senza messaggio di avvio nel canale, e pubblicazione senza suono, sempre o in una fascia oraria.',
            'Un guasto di rete di qualche minuto non fa più perdere contenuti: restano da pubblicare e partono al giro successivo.',
            'Nuova schermata d’ingresso. Titan è un software di Simone Pizzi per Runtime Utilities.',
        ],
        en: [
            'A redesigned blue interface that is easier to read: larger text, zoom from 80 to 180% (Ctrl + and Ctrl −), fully usable from the keyboard.',
            'Closing the window while the engine runs no longer stops your bots without warning. Titan can stay in the notification area, start with the computer and start the engine by itself: see Settings → General.',
            '“Test the bot” checks the token, the destination and the permissions with Telegram, without posting anything.',
            '“Check now” reads every source right away, without waiting for its interval.',
            'Bot by bot: silent start, with no startup message in the channel, and publishing without sound, always or during set hours.',
            'A few minutes of network trouble no longer loses content: it stays to be published and goes out on the next check.',
            'A new intro screen. Titan is software by Simone Pizzi for Runtime Utilities.',
        ],
    },
    '2.3.1': {
        it: [
            'Gli show il cui feed dà lo stesso indirizzo a tutte le puntate tornano a pubblicare: dopo la prima, le successive venivano scartate come già inviate.',
            'Dove il link non distingue le puntate, l’identificativo si ricava ora dal «guid», il campo che lo standard RSS destina proprio a questo.',
            'Per tutti gli altri feed non cambia nulla: lo storico di pubblicazione resta valido e nessun contenuto vecchio torna in canale.',
        ],
        en: [
            'Shows whose feed gives every episode the same address publish again: after the first one, the rest were dropped as already sent.',
            'Where the link does not tell episodes apart, the identifier now comes from the <guid>, the field the RSS standard means for exactly this.',
            'Nothing changes for every other feed: the publishing history stays valid and no old item goes back to the channel.',
        ],
    },
    '2.3.0': {
        it: [
            'Il pannello delle sorgenti ha una lente di ricerca: su un canale affollato il feed si trova, non si cerca a scorrimento.',
            'Si cerca su nome, indirizzo, tipo e parole del filtro; più termini insieme restringono il risultato.',
            'Un contatore dice quanti feed su quanti, così una ricerca stretta non sembra un canale vuoto.',
            'La ricerca vale per il canale che si sta guardando e riparte pulita quando si cambia canale.',
        ],
        en: [
            'The sources panel now has a search box: on a crowded channel you find the feed instead of scrolling for it.',
            'It searches name, address, type and filter keywords; several words together narrow the result.',
            'A counter tells you how many feeds out of how many, so a narrow search doesn’t look like an empty channel.',
            'The search belongs to the channel you are looking at, and starts clean when you switch channel.',
        ],
    },
    '2.2.1': {
        it: [
            'Nel diario non compaiono più errori che non sono errori: bastava la parola «error» nel titolo di un video.',
            'Il livello di una riga si legge ora dai marcatori del programma, mai dal testo che arriva dai feed.',
            'Le segnalazioni del lettore YouTube dichiarano se sono errori o avvisi, così restano visibili nel diario.',
        ],
        en: [
            'The diary no longer shows errors that aren’t errors: the word “error” in a video title was enough.',
            'A line’s level now comes from the program’s own markers, never from text coming out of the feeds.',
            'The YouTube reader’s warnings declare whether they are errors or warnings, so they stay in the diary.',
        ],
    },
    '2.2.0': {
        it: [
            'Il pannello dei log è ora un diario di scansione: racconta cosa fa il programma, non cosa scrive.',
            'La console di prima resta, dietro l’interruttore Diario/Console nell’intestazione del pannello.',
            'Il motore dichiara i suoi eventi: il livello di una riga non si deduce più dal testo.',
            'Una riga di attività nomina il feed in lettura, così il pannello non sembra fermo mentre lavora.',
            'L’esportazione porta con sé l’intera giornata, non solo ciò che era a schermo.',
            'L’indirizzo del canale e la data, nella scelta del bot, tornano leggibili.',
        ],
        en: [
            'The log panel is now a scan diary: it tells you what the program is doing, not what it writes.',
            'The old console is still there, behind the Diary/Console switch in the panel header.',
            'The engine declares its own events: a line’s level is no longer guessed from its text.',
            'An activity line names the feed being read, so the panel no longer looks stalled while working.',
            'Exporting now carries the whole day, not just what happened to be on screen.',
            'The channel address and date in the bot picker are readable again.',
        ],
    },
    '2.1.9': {
        it: [
            'La schermata iniziale porta «Titan Edition» su una riga sua, senza spezzarlo.',
            'Il credito agli LLM e a chi ha diretto il progetto ora si legge davvero.',
            'Le bandiere delle lingue sono centrate, non più allineate a sinistra.',
            'Le Impostazioni di Sistema non escono più dallo schermo: scheda «Generale» su due colonne.',
            'Le tre schede delle impostazioni hanno tutte la stessa misura.',
        ],
        en: [
            'The intro screen keeps “Titan Edition” whole on a line of its own.',
            'The credit to the LLMs and to whoever directed the project is now actually readable.',
            'The language flags are centred instead of hugging the left edge.',
            'System Settings no longer runs off the screen: the General tab is on two columns.',
            'All three settings tabs are now the same size.',
        ],
    },
    '2.1.8': {
        it: [
            'Titan è software libero: codice sorgente pubblico, licenza MIT.',
            'I token dei bot non compaiono più nei log, nemmeno in quelli esportati.',
            'Avviare l’applicazione due volte non pubblica più i contenuti in doppio.',
            'Il campo della data si chiama «Data di Partenza» anche nelle impostazioni del bot.',
            'Interfaccia, guide e manuale in italiano e inglese.',
        ],
        en: [
            'Titan is free software: public source code under the MIT licence.',
            'Bot tokens no longer appear in the logs, not even in exported ones.',
            'Starting the app twice no longer publishes everything twice.',
            'The date field is called “Start From Date” in the bot settings too.',
            'Interface, guides and manual in Italian and English.',
        ],
    },
    '2.1.7': {
        it: [
            'Nome del prodotto uniforme in tutta l’applicazione.',
            'Icona dell’app corretta nella barra applicazioni di Windows.',
            'Schermata delle novità affidabile a ogni aggiornamento.',
            'Guida rapida e manuale PDF completo sempre a portata di mano.',
        ],
        en: [
            'Consistent product name across the whole app.',
            'Fixed the app icon in the Windows taskbar.',
            'Reliable what’s-new screen after every update.',
            'Quick guide and full PDF manual always at hand.',
        ],
    },
    '2.1.6': {
        it: [
            'Guida rapida integrata, consultabile in ogni lingua direttamente dall’app.',
            'Manuale d’uso completo scaricabile in PDF con un clic.',
            'Nuova schermata delle novità a ogni aggiornamento.',
            'Nuovo logo e branding Titan in tutta l’interfaccia.',
        ],
        en: [
            'Built-in quick guide, available in every language right inside the app.',
            'Full user manual downloadable as a PDF in one click.',
            'New what’s-new screen shown after every update.',
            'Fresh Titan logo and branding across the whole interface.',
        ],
    },
};

/** Punti salienti per la versione indicata, o null se non presenti. */
export function notesFor(version: string, locale: Language): string[] | null {
    const entry = RELEASE_NOTES[version];
    if (!entry) return null;
    return entry[locale] || entry.en || null;
}
