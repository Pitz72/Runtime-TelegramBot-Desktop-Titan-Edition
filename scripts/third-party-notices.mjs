/**
 * Genera resources/THIRD-PARTY-NOTICES.txt: le licenze di tutto il codice di terzi che
 * finisce dentro l'applicazione distribuita.
 *
 * Perché serve. Vite incorpora le dipendenze (React, telegraf, rss-parser, youtubei.js…)
 * dentro un unico file JavaScript e ne toglie i commenti: gli avvisi di copyright che le
 * licenze MIT, ISC, BSD e Apache chiedono di conservare «in tutte le copie» sparivano dal
 * programma installato. Questo file li rimette, uno per pacchetto, e viene incluso
 * nell'installer (cartella resources/). Chromium ed Electron hanno già i loro file di
 * licenza, che electron-builder aggiunge da sé.
 *
 * Le dipendenze considerate sono quelle di produzione (`dependencies` in package.json) e
 * le loro dipendenze transitive: le devDependencies non finiscono nell'app.
 *
 * Uso: node scripts/third-party-notices.mjs   (lo lancia anche `npm run build`)
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
const out = join(root, 'resources', 'THIRD-PARTY-NOTICES.txt');

const LICENSE_FILE = /^(licen[sc]e|copying|notice)(\.(md|txt|markdown))?$/i;

/** Cartella di un pacchetto, risolta come farebbe Node a partire da `fromDir`. */
function resolvePackageDir(name, fromDir) {
    let dir = fromDir;
    while (true) {
        const candidate = join(dir, 'node_modules', name);
        if (existsSync(join(candidate, 'package.json'))) return candidate;
        const parent = dirname(dir);
        if (parent === dir) return null;
        dir = parent;
    }
}

const seen = new Map(); // "name@version" → { name, version, license, texts }
const missing = [];

function visit(name, fromDir) {
    const dir = resolvePackageDir(name, fromDir);
    if (!dir) { missing.push(name); return; }
    const meta = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
    const key = `${meta.name}@${meta.version}`;
    if (seen.has(key)) return;

    const files = readdirSync(dir).filter(f => LICENSE_FILE.test(f)).sort();
    const texts = files.map(f => readFileSync(join(dir, f), 'utf-8').trim());
    const license = typeof meta.license === 'string' ? meta.license
        : meta.license?.type ?? (Array.isArray(meta.licenses) ? meta.licenses.map(l => l.type ?? l).join(' OR ') : 'UNKNOWN');
    seen.set(key, { name: meta.name, version: meta.version, license, homepage: meta.homepage ?? meta.repository?.url ?? meta.repository ?? '', texts });

    for (const dep of Object.keys({ ...meta.dependencies, ...meta.optionalDependencies })) {
        visit(dep, dir);
    }
}

for (const dep of Object.keys(pkg.dependencies ?? {})) visit(dep, root);

const entries = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
const rule = '='.repeat(78);
const lines = [
    `Runtime TelegramBot Desktop · Titan Edition ${pkg.version}`,
    'Licenze del software di terze parti incluso nell’applicazione',
    'Third-party software licenses included in the application',
    '',
    `Titan è distribuito con licenza ${pkg.license} (file LICENSE). Contiene i pacchetti`,
    'elencati qui sotto, ciascuno con la propria licenza e il proprio avviso di copyright.',
    'Chromium ed Electron sono accompagnati dai file LICENSE.electron.txt e',
    'LICENSES.chromium.html nella cartella di installazione.',
    '',
    `Pacchetti: ${entries.length}`,
    '',
];

for (const e of entries) {
    lines.push(rule, `${e.name} ${e.version} — ${e.license}`);
    if (e.homepage) lines.push(String(e.homepage).replace(/^git\+/, ''));
    lines.push(rule, '');
    if (e.texts.length) {
        for (const t of e.texts) lines.push(t, '');
    } else {
        lines.push(`(Il pacchetto non include un file di licenza: vale la licenza ${e.license} dichiarata nel suo package.json.)`, '');
    }
}

writeFileSync(out, lines.join('\n'), 'utf-8');

// La licenza di Titan accanto a quelle dei terzi: l'app la mostra in Impostazioni → Informazioni.
copyFileSync(join(root, 'LICENSE'), join(root, 'resources', 'LICENSE.txt'));

const unknown = entries.filter(e => !e.license || e.license === 'UNKNOWN');
console.log(`✓ ${entries.length} pacchetti → ${out.replace(root, '.')}`);
if (unknown.length) console.warn(`⚠ Licenza non dichiarata: ${unknown.map(e => e.name).join(', ')}`);
if (missing.length) console.warn(`⚠ Non trovati in node_modules: ${[...new Set(missing)].join(', ')}`);

// Licenze copyleft forte: la loro presenza in un'app MIT va decisa, non scoperta dopo.
const copyleft = entries.filter(e => /\b(A?GPL|LGPL|SSPL|EUPL)/i.test(e.license));
if (copyleft.length) {
    console.error(`✗ Licenze copyleft nelle dipendenze di produzione: ${copyleft.map(e => `${e.name} (${e.license})`).join(', ')}`);
    process.exit(1);
}
