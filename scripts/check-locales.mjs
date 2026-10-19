/**
 * Verifica che i due file di traduzione abbiano esattamente le stesse chiavi.
 *
 * Serve perché I18nContext fa fallback sull'inglese quando una chiave manca: una
 * dimenticanza non rompe nulla, lascia semplicemente pezzi di interfaccia in inglese
 * e passa inosservata a lungo (è già successo con l'intero flusso di aggiornamento,
 * rimasto in inglese per un mese). Con l'italiano come riferimento il controllo dice
 * quindi se `en.json` è indietro rispetto a `it.json`.
 *
 * Uso: node scripts/check-locales.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const LANGS = ['it', 'en'];
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

// ── Chiavi usate nel codice ─────────────────────────────────────────────────
// La parità tra lingue non basta: una chiave scritta nel codice e mai aggiunta ai file
// compare a schermo così com'è («feeds.qualcosa»). Si cercano le chiamate t('…') con
// chiave letterale; quelle costruite a runtime sono elencate qui sotto, per esteso.
const DYNAMIC_KEYS = [
    ...['podcast', 'news', 'youtube'].map(k => `feedTypes.${k}`),
    ...['engineStart', 'engineStop', 'scanStart', 'sourceStart', 'itemFound', 'itemDeferred', 'itemPublished', 'scanEnd', 'nextScan', 'error', 'warn'].map(k => `journal.${k}`),
    ...['today', 'week', 'total'].map(k => `stats.${k}`),
    ...['title', 'feedName', 'link', 'summary'].map(k => `templates.chip.${k}`),
    ...['error', 'warning', 'info'].map(k => `templates.severity.${k}`),
    ...['empty', 'chipStartup', 'chipUnknown', 'chipInHref', 'tagUnsupported', 'closeWithoutOpen', 'closeWrong', 'aMissingHref', 'spanSpoiler', 'tgEmojiId', 'unclosed'].map(k => `templateValidator.${k}`),
    'updater.progress', 'updater.downloadedMsg', 'time.hour',
];

const srcDir = join(localesDir, '..');
const sources = [];
const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (/\.(tsx?|jsx?)$/.test(entry.name) && !entry.name.endsWith('.test.ts')) sources.push(p);
    }
};
walk(srcDir);

const used = new Set(DYNAMIC_KEYS);
for (const file of sources) {
    const text = readFileSync(file, 'utf-8');
    for (const m of text.matchAll(/\bt\(\s*['"]([a-zA-Z][\w.]*)['"]\s*\)/g)) used.add(m[1]);
}
const missingInCode = [...used].filter(k => !reference.includes(k)).sort();
if (missingInCode.length) {
    console.error(`✗ Chiavi usate nel codice ma assenti da ${REFERENCE}.json (${missingInCode.length}): ${missingInCode.join(', ')}`);
    process.exit(1);
}

console.log(`✓ Chiavi allineate su ${LANGS.length} lingue (${reference.length} chiavi); tutte le ${used.size} usate nel codice esistono.`);
