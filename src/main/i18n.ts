/**
 * Testi dei dialoghi nativi aperti dal main process.
 *
 * L'interfaccia ha le sue traduzioni nel renderer; i dialoghi di sistema (salva, apri,
 * conferme, errori fatali) nascono qui e prima erano solo in italiano. Il renderer
 * comunica la lingua scelta con `set-locale`; finché non lo fa vale quella del sistema.
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
        openRtbDetail: 'Il bot viene aggiunto all’elenco. Il token resta leggibile solo se il profilo è stato esportato da questo computer; altrimenti andrà reinserito nelle impostazioni del bot.',
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
        openRtbDetail: 'The bot is added to your list. Its token stays readable only if the profile was exported on this computer; otherwise you will need to enter it again in the bot settings.',
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
    },
} as const;

export type MainStringKey = keyof typeof STRINGS.it;

let locale: MainLocale | null = null;

export function setMainLocale(value: unknown) {
    if (value === 'it' || value === 'en') locale = value;
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
