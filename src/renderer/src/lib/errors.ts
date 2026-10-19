/**
 * Il messaggio leggibile di un errore arrivato dal main process.
 *
 * Electron avvolge le eccezioni degli handler IPC in
 * «Error invoking remote method 'add-feed': Error: <messaggio vero>»: a schermo serve
 * solo l'ultima parte, che è quella scritta per l'utente (es. «Indirizzo di rete privata/
 * locale non consentito»).
 */
export function errorMessage(e: unknown): string {
    const raw = e instanceof Error ? e.message : String(e ?? '');
    return raw.replace(/^Error invoking remote method '[^']+':\s*(?:[A-Za-z]*Error:\s*)?/, '').trim() || raw;
}
