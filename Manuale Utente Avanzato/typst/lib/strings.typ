// =============================================================================
// strings.typ — Dizionario del Manuale Utente Avanzato di
// Runtime TelegramBot · Titan Edition. La lingua si sceglie da riga di comando:
// `--input lang=<lang>`. Un solo punto di verità per tutte le stringhe di
// template (copertina, frontespizio, colophon, header, box, indice, capitolo).
// Lingue: it (sorgente) · en. Dalla 2.1.8 sono queste due e basta: fr, de, es,
// pt, ru e zh sono state ritirate.
// I nomi di prodotto "Runtime TelegramBot" e "Titan Edition" restano in latino
// in entrambe le lingue (marchio). La copertina è vettoriale nativa: si localizza
// da queste stringhe, non servono immagini di copertina per lingua.
// =============================================================================

#let LANG = sys.inputs.at("lang", default: "it")

#let STR = (
  it: (
    typst-lang: "it",
    manual-title: "Manuale Utente Avanzato",
    toc-title: "Indice",
    tagline: "PUBBLICAZIONE AUTOMATICA DA RSS A TELEGRAM",
    aligned-to: "Allineato alla versione",
    version-word: "Versione",
    language-name: "Italiano",
    edition-name: "Seconda Edizione",
    production-word: "Produzione",
    chapter-prefix: "Capitolo ", chapter-suffix: "",
    note-label: "Nota", tip-label: "Suggerimento", warning-label: "⚠ Attenzione",
    rule-label: "Regola d'oro", problem-label: "Problema", solution-label: "Soluzione",
    rights: "Rilasciato sotto licenza MIT.",
    repro: "Questo manuale e il software che descrive sono liberi: puoi usarli, copiarli, modificarli e ridistribuirli, anche a fini commerciali, alle condizioni della licenza MIT riportata per intero nel file LICENSE del codice sorgente. L'unico obbligo è conservare la nota di copyright e il testo della licenza.",
    trademark: "Runtime TelegramBot Desktop · Titan Edition è un software originale. Telegram, YouTube e gli altri marchi citati appartengono ai rispettivi proprietari.",
    credits: "Software ideato e diretto da SIMONE PIZZI, che ne ha definito ogni comportamento. Gran parte del codice è stata scritta con modelli linguistici (Google Gemini, Anthropic Claude); questo manuale è nato con lo stesso metodo ed è stato riletto riga per riga. Produzione Ecosystem Runtime. Composto con Typst; titoli in Sora, testo in Inter, codice in Source Code Pro.",
  ),
  en: (
    typst-lang: "en",
    manual-title: "Advanced User Manual",
    toc-title: "Contents",
    tagline: "AUTOMATED RSS-TO-TELEGRAM PUBLISHING",
    aligned-to: "Aligned with version",
    version-word: "Version",
    language-name: "English",
    edition-name: "Second Edition",
    production-word: "Production",
    chapter-prefix: "Chapter ", chapter-suffix: "",
    note-label: "Note", tip-label: "Tip", warning-label: "⚠ Warning",
    rule-label: "Golden Rule", problem-label: "Problem", solution-label: "Solution",
    rights: "Released under the MIT Licence.",
    repro: "This manual and the software it describes are free: you may use, copy, modify and redistribute them, including commercially, under the terms of the MIT Licence, reproduced in full in the LICENSE file of the source code. The only obligation is to keep the copyright notice and the licence text with them.",
    trademark: "Runtime TelegramBot Desktop · Titan Edition is an original software product. Telegram, YouTube and the other trademarks mentioned belong to their respective owners.",
    credits: "Software conceived and directed by SIMONE PIZZI, who defined every one of its behaviours. Most of the code was written with language models (Google Gemini, Anthropic Claude); this manual was produced by the same method and read line by line. Produced by Ecosystem Runtime. Typeset with Typst; headings in Sora, body in Inter, code in Source Code Pro.",
  ),
)

#let T = STR.at(LANG, default: STR.it)
