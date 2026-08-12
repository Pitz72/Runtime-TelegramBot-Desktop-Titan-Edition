/**
 * Verifica che gli 8 file di traduzione abbiano esattamente le stesse chiavi.
 *
 * Serve perché I18nContext fa fallback sull'inglese quando una chiave manca: una
 * dimenticanza non rompe nulla, lascia semplicemente pezzi di interfaccia in inglese
 * e passa inosservata a lungo (è già successo con l'intero flusso di aggiornamento,
 * rimasto in inglese in 5 lingue su 8 per un mese).
 *
 * Uso: node scripts/check-locales.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const LANGS = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh'];
const REFERENCE = 'it';

const localesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'renderer', 'src', 'locales');

const flatten = (obj, prefix = '') =>
    Object.entries(obj).flatMap(([key, value]) =>
        value && typeof value === 'object'
            ? flatten(value, `${prefix}${key}.`)
            : [`${prefix}${key}`]
    );

const keysOf = (lang) =>
    flatten(JSON.parse(readFileSync(join(localesDir, `${lang}.json`), 'utf-8')));

const reference = keysOf(REFERENCE);
let failed = false;

for (const lang of LANGS) {
    if (lang === REFERENCE) continue;
    const keys = keysOf(lang);
    const missing = reference.filter(k => !keys.includes(k));
    const extra = keys.filter(k => !reference.includes(k));
    if (missing.length || extra.length) {
        failed = true;
        console.error(`✗ ${lang}`);
        if (missing.length) console.error(`   mancanti (${missing.length}): ${missing.join(', ')}`);
        if (extra.length) console.error(`   in più (${extra.length}): ${extra.join(', ')}`);
    }
}

if (failed) {
    console.error(`\nTutte e ${LANGS.length} le lingue devono avere le stesse chiavi di ${REFERENCE}.json.`);
    process.exit(1);
}

console.log(`✓ Chiavi allineate su tutte e ${LANGS.length} le lingue (${reference.length} chiavi).`);
