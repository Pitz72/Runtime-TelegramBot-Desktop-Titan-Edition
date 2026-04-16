/**
 * Titan Desktop — Template Validator
 * Validates Telegram HTML-mode templates before saving.
 * Checks: allowed tags, tag balance, <a href> presence,
 * known {{chip}} placeholders, and chips-inside-href safety.
 */

export interface ValidationIssue {
    severity: 'error' | 'warning' | 'info';
    message: string;
}

/**
 * HTML tags accepted by Telegram's HTML parse mode.
 * Reference: https://core.telegram.org/bots/api#html-style
 */
const ALLOWED_TAGS = new Set([
    'b', 'strong',
    'i', 'em',
    'u', 'ins',
    's', 'strike', 'del',
    'code', 'pre',
    'a',
    'tg-spoiler',
    'tg-emoji',
    'blockquote',
    'span', // valid only as <span class="tg-spoiler">
]);

/** Placeholder chips that Titan substitutes at send time. */
const KNOWN_CHIPS = new Set(['title', 'feedName', 'link', 'summary']);

/**
 * Validates a Titan template string.
 * @param template - Raw template text (may contain HTML and {{chips}}).
 * @param isStartup - True when validating the startup template (chips are never substituted there).
 * @returns Array of validation issues, empty means the template is valid.
 */
export function validateTemplate(template: string, isStartup = false): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!template || template.trim() === '') {
        issues.push({
            severity: 'info',
            message: 'Empty template — the built-in default will be used at send time.',
        });
        return issues;
    }

    // ── Chip validation ──────────────────────────────────────────────────────
    const chipRegex = /\{\{([^}]+)\}\}/g;
    let chipMatch: RegExpExecArray | null;
    const seenUnknown = new Set<string>();

    while ((chipMatch = chipRegex.exec(template)) !== null) {
        const chipName = chipMatch[1].trim();

        if (isStartup) {
            // Chips are never substituted in startup messages
            issues.push({
                severity: 'info',
                message: `{{${chipName}}} will not be substituted in the startup message — it will appear literally.`,
            });
        } else if (!KNOWN_CHIPS.has(chipName) && !seenUnknown.has(chipName)) {
            seenUnknown.add(chipName);
            issues.push({
                severity: 'warning',
                message: `Unknown placeholder {{${chipName}}}. Valid chips: {{title}}, {{feedName}}, {{link}}, {{summary}}.`,
            });
        }
    }

    // ── Chips inside href values ─────────────────────────────────────────────
    // e.g. <a href="{{title}}"> is risky: title may contain &, <, > etc.
    if (!isStartup) {
        const hrefChipRegex = /href=["']([^"']*)\{\{([^}]+)\}\}([^"']*)["']/g;
        let hrefMatch: RegExpExecArray | null;

        while ((hrefMatch = hrefChipRegex.exec(template)) !== null) {
            const chipName = hrefMatch[2].trim();
            if (chipName !== 'link') {
                issues.push({
                    severity: 'warning',
                    message: `{{${chipName}}} inside an href attribute may break the URL if its value contains special characters. Only {{link}} is safe inside href.`,
                });
            }
        }
    }

    // ── HTML tag validation ──────────────────────────────────────────────────
    // Regex captures: [1]=closing slash, [2]=tag name, [3]=attributes, [4]=self-closing slash
    const tagRegex = /<(\/?)([\w-]+)(\s[^>]*)?\s*(\/?)>/g;
    let tagMatch: RegExpExecArray | null;
    const stack: string[] = [];
    const reportedUnsupported = new Set<string>();

    while ((tagMatch = tagRegex.exec(template)) !== null) {
        const isClosing = tagMatch[1] === '/';
        const tagName = tagMatch[2].toLowerCase();
        const attrs = (tagMatch[3] ?? '').trim();
        const isSelfClosing = tagMatch[4] === '/';

        // Unknown tag check
        if (!ALLOWED_TAGS.has(tagName)) {
            if (!reportedUnsupported.has(tagName)) {
                reportedUnsupported.add(tagName);
                issues.push({
                    severity: 'error',
                    message: `<${tagName}> is not supported in Telegram HTML mode and will cause a parse error.`,
                });
            }
            continue; // Skip balancing for unsupported tags
        }

        if (isClosing) {
            if (stack.length === 0) {
                issues.push({
                    severity: 'error',
                    message: `</${tagName}> found without a matching opening tag.`,
                });
            } else if (stack[stack.length - 1] !== tagName) {
                issues.push({
                    severity: 'error',
                    message: `</${tagName}> closes the wrong tag (expected </${stack[stack.length - 1]}>).`,
                });
                stack.pop(); // Pop anyway to avoid cascading errors
            } else {
                stack.pop();
            }
        } else if (!isSelfClosing) {
            // Per-tag attribute checks
            if (tagName === 'a' && !attrs.includes('href')) {
                issues.push({
                    severity: 'error',
                    message: `<a> tag is missing the required href attribute.`,
                });
            }

            if (tagName === 'span' && !attrs.includes('tg-spoiler')) {
                issues.push({
                    severity: 'warning',
                    message: `<span> is only valid in Telegram when used as <span class="tg-spoiler">…</span>.`,
                });
            }

            if (tagName === 'tg-emoji' && !attrs.includes('emoji-id')) {
                issues.push({
                    severity: 'warning',
                    message: `<tg-emoji> requires an emoji-id attribute.`,
                });
            }

            stack.push(tagName);
        }
    }

    // Any tag left open in the stack is unclosed
    for (const unclosed of stack) {
        issues.push({
            severity: 'error',
            message: `<${unclosed}> was opened but never closed.`,
        });
    }

    return issues;
}
