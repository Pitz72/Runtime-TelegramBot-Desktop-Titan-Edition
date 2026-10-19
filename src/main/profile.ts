import { app } from 'electron';
import { resolve } from 'node:path';

/**
 * Profilo dati alternativo — va importato PRIMA di qualunque altro modulo del main.
 *
 * `TITAN_USER_DATA_DIR=<cartella>` avvia Titan con database, log e impostazioni in quella
 * cartella, e con un proprio blocco di istanza singola. Serve a provare una build accanto
 * all'app che sta pubblicando, senza toccarne i dati e senza che la seconda istanza esca
 * subito passando il fuoco alla prima.
 *
 * Il logger e il database leggono `userData` quando vengono caricati: per questo il
 * cambio deve avvenire qui, in un modulo valutato per primo.
 */
const override = process.env.TITAN_USER_DATA_DIR?.trim();
if (override) {
    app.setPath('userData', resolve(override));
}
