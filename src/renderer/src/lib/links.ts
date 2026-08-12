/**
 * Collegamenti esterni dell'applicazione.
 *
 * Passano tutti da `window.api.openExternal`, che accetta solo https e apre nel
 * browser di sistema: nessun URL viene mai caricato dentro una finestra Electron.
 */

/** Donazione libera a sostegno del progetto. */
export const DONATE_URL = 'https://www.paypal.com/paypalme/runtimeradio';

/** Pagina contatti dell'autore. */
export const CONTACT_URL = 'https://simonepizzi.runtimeradio.it/contatti';

/** Codice sorgente del progetto. */
export const SOURCE_URL = 'https://github.com/Ecosystem-Runtime/Runtime-TelegramBot-Desktop-Titan-Edition';

export function openLink(url: string): void {
    window.api.openExternal(url);
}
