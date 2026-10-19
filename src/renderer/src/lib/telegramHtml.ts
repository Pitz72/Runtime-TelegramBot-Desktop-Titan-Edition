/**
 * Anteprima dei template: l'HTML del template trasformato in HTML sicuro da mostrare.
 *
 * Fino alla 2.3 l'anteprima finiva in `dangerouslySetInnerHTML` così com'era. Il template
 * lo scrive l'utente, ma può anche arrivare da un profilo .rtb ricevuto da altri: un
 * `<meta http-equiv="refresh">` o un `<iframe>` nel testo diventavano elementi veri nella
 * finestra di Titan. Qui si tiene solo ciò che Telegram stesso accetta in modalità HTML;
 * il resto perde il tag e conserva il testo, e i contenitori pericolosi spariscono interi.
 *
 * Il parsing usa DOMParser, che non esegue script né carica risorse.
 */

/** Tag dell'HTML di Telegram — https://core.telegram.org/bots/api#html-style */
const ALLOWED = new Set([
    'b', 'strong', 'i', 'em', 'u', 'ins', 's', 'strike', 'del',
    'code', 'pre', 'blockquote', 'tg-spoiler', 'span', 'a', 'br',
]);

/** Elementi che spariscono con tutto il loro contenuto. */
const DROP_WITH_CONTENT = new Set([
    'script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript',
    'meta', 'link', 'title', 'head', 'svg', 'math', 'video', 'audio', 'canvas', 'form',
]);

function escapeText(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
    return escapeText(s).replace(/"/g, '&quot;');
}

function serialize(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return escapeText(node.textContent ?? '');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (DROP_WITH_CONTENT.has(tag)) return '';

    const inner = Array.from(el.childNodes).map(serialize).join('');
    if (!ALLOWED.has(tag)) return inner;

    switch (tag) {
        case 'br':
            return '<br>';
        case 'a': {
            // Nell'anteprima un link non porta da nessuna parte: si mostra come tale,
            // con l'indirizzo nel tooltip, ma resta testo.
            const href = el.getAttribute('href') ?? '';
            const safe = /^https?:\/\//i.test(href.trim()) ? href.trim() : '';
            return `<span class="tg-link"${safe ? ` title="${escapeAttr(safe)}"` : ''}>${inner}</span>`;
        }
        case 'span':
            return el.getAttribute('class') === 'tg-spoiler'
                ? `<span class="tg-spoiler">${inner}</span>`
                : inner;
        case 'tg-spoiler':
            return `<span class="tg-spoiler">${inner}</span>`;
        default:
            return `<${tag}>${inner}</${tag}>`;
    }
}

/** HTML sicuro per l'anteprima: solo i tag di Telegram, nessun attributo eseguibile. */
export function sanitizeTelegramHtml(html: string): string {
    const doc = new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, 'text/html');
    return Array.from(doc.body.childNodes).map(serialize).join('');
}
