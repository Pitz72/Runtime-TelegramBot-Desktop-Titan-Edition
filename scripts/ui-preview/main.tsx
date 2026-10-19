// Banco di prova dell'interfaccia: prima il `window.api` finto, poi l'app vera.
import './mock-api';
import '../../src/renderer/src/main';

// ?axe — audit di accessibilità automatico (axe-core, regole WCAG 2.0/2.1/2.2 A e AA).
// Il risultato finisce in window.__axe e nella console; lo si rilancia con window.runAxe().
async function runAxe() {
    const axe = (await import('axe-core')).default;
    const result = await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    });
    const summary = {
        violations: result.violations.map(v => ({
            id: v.id, impact: v.impact, help: v.help,
            nodes: v.nodes.map(n => ({ target: n.target.join(' '), summary: n.failureSummary })),
        })),
        passes: result.passes.length,
        incomplete: result.incomplete.map(v => ({ id: v.id, nodes: v.nodes.length })),
    };
    (window as any).__axe = summary;
    console.info('[axe]', JSON.stringify(summary, null, 2));
    return summary;
}
(window as any).runAxe = runAxe;
