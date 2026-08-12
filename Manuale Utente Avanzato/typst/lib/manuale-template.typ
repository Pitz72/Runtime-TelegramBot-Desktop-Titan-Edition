// =============================================================================
// manuale-template.typ — Identità tipografica del Manuale Utente Avanzato di
// Runtime TelegramBot · Titan Edition. Palette Titan Blue, font, copertina
// vettoriale, frontespizio, colophon, impaginazione, titoli di capitolo con
// vignetta comics, box ricorrenti e figure. Protocollo modulare Typst,
// modellato sul manuale di Runtime Live Machine Pro.
// Multilingua: le stringhe arrivano da strings.typ (--input lang=<lang>).
// =============================================================================

#import "strings.typ": T, LANG

// --- PALETTE DI MARCA (Titan Blue, da tailwind.config.js) ---------------------
#let c = (
  navy:        rgb("#0a0e17"),   // fondo copertina (tile dell'icona app)
  navy-2:      rgb("#0f1626"),   // secondo tono del gradiente copertina
  ink:         rgb("#111827"),   // testo corpo (blu-inchiostro quasi-nero)
  ink-soft:    rgb("#334155"),
  muted:       rgb("#64748b"),
  rule:        rgb("#dbe4f0"),   // filetti chiari
  paper:       rgb("#ffffff"),
  blue:        rgb("#3b82f6"),   // Titan Blue (primary-container)
  blue-deep:   rgb("#2563eb"),
  cyan:        rgb("#4cd7f6"),   // Titan Cyan (secondary)
  cyan-soft:   rgb("#7ee3fb"),
  indigo:      rgb("#6366f1"),
  emerald:     rgb("#059669"),
  amber:       rgb("#b45309"),
  red:         rgb("#dc2626"),
)
#let brandGrad = gradient.linear(c.cyan, c.blue, c.indigo)
#let brandGrad-h = gradient.linear(c.cyan, c.blue, c.indigo, angle: 0deg)

// --- FONT ---------------------------------------------------------------------
// Italiano e inglese sono coperti da Sora, Inter e Source Code Pro, che stanno in
// fonts/. Segoe UI e Arial restano come rete di sicurezza per i glifi rari.
#let font-display = ("Sora", "Segoe UI", "Arial")
#let font-body    = ("Inter", "Segoe UI", "Arial")
#let font-mono    = ("Source Code Pro", "Consolas")

#let _capnum = counter("titan-capitolo")

// Slug delle vignette, nell'ordine dei capitoli (una per capitolo).
#let vignette-slugs = (
  "01-introduzione", "02-installazione", "03-interfaccia", "04-bot-canali",
  "05-feed-manager", "06-impostazioni-template", "07-portabilita-sicurezza",
  "08-preferenze-sistema", "09-troubleshooting",
)

// =============================================================================
// COPERTINA — pagina a vivo, vettoriale nativa. Fondo navy con gradiente,
// anelli orbitali ciano, logo Titan e blocco titolo.
// =============================================================================
#let copertina(versione: "2.1.5", autore: "Simone Pizzi",
               edizione: "Seconda Edizione · 2026", produzione: "Ecosystem Runtime") = page(
  fill: c.navy, margin: 0pt, header: none, footer: none,
)[
  // -- Fondale: gradiente radiale morbido -------------------------------------
  #place(top + left, rect(width: 100%, height: 100%,
    fill: gradient.radial(c.navy-2, c.navy, center: (50%, 34%), radius: 90%)))

  // -- Anelli orbitali (eco del logo "T + anello") ----------------------------
  #place(center + horizon, dy: -46mm, rotate(-24deg,
    ellipse(width: 240mm, height: 96mm,
      stroke: 1.1pt + gradient.linear(c.cyan.transparentize(30%), c.blue.transparentize(75%), c.navy.transparentize(0%)))))
  #place(center + horizon, dy: -46mm, rotate(-24deg,
    ellipse(width: 190mm, height: 74mm,
      stroke: .7pt + c.cyan.transparentize(62%))))
  #place(center + horizon, dy: -46mm, rotate(18deg,
    ellipse(width: 210mm, height: 60mm,
      stroke: .6pt + c.blue.transparentize(72%))))

  // -- Alone dietro al logo ---------------------------------------------------
  #place(center + horizon, dy: -46mm, circle(radius: 46mm,
    fill: gradient.radial(c.cyan.transparentize(80%), c.navy.transparentize(100%))))

  // -- Contenuto --------------------------------------------------------------
  #place(top + center, dy: 30mm)[
    #text(font: font-display, size: 10pt, weight: 600, tracking: 5pt, fill: c.cyan)[#T.tagline]
  ]

  #place(center + horizon, dy: -46mm)[
    #image("../assets/logo.png", width: 52mm)
  ]

  #place(center + horizon, dy: 34mm)[
    #align(center)[
      // Corpo ridotto rispetto a "TITAN EDITION": il nome canonico include "DESKTOP"
      // e a 30pt sfonderebbe la larghezza della pagina.
      #text(font: font-display, size: 21pt, weight: 800, tracking: 1.5pt, fill: c.paper)[RUNTIME TELEGRAMBOT DESKTOP]
      #v(1mm)
      #text(font: font-display, size: 30pt, weight: 800, tracking: 6pt, fill: brandGrad-h)[TITAN EDITION]
      #v(6mm)
      #box(width: 54mm, line(length: 100%, stroke: 2.4pt + brandGrad-h))
      #v(7mm)
      #text(font: font-display, size: 15pt, weight: 500, fill: rgb("#c7d2e5"))[#T.manual-title]
      #v(4mm)
      #box(inset: (x: 11pt, y: 5.5pt), radius: 999pt,
        stroke: .8pt + c.cyan.transparentize(30%), fill: c.cyan.transparentize(88%))[
        #text(font: font-mono, size: 11pt, weight: 600, fill: c.cyan-soft)[v#versione]
      ]
    ]
  ]

  // -- Piede: edizione, autore, produzione ------------------------------------
  #place(bottom + center, dy: -26mm)[
    #align(center)[
      #text(font: font-display, size: 10pt, weight: 600, tracking: 3pt, fill: c.cyan)[#upper(edizione)]
      #v(4mm)
      #text(font: font-display, size: 13pt, weight: 600, fill: c.paper)[#autore]
      #v(1.5mm)
      #text(font: font-body, size: 9.5pt, fill: rgb("#8b97ad"), tracking: .5pt)[#T.production-word · #produzione]
    ]
  ]
]

// =============================================================================
// FRONTESPIZIO — pagina interna, testo scuro su bianco, accenti di marca
// =============================================================================
#let frontespizio(versione: "2.1.5", autore: "Simone Pizzi", edizione: "Seconda Edizione · 2026") = {
  page(header: none, footer: none)[
    #v(1fr)
    #align(center)[
      #image("../assets/logo.png", width: 1.55in)
      #v(9mm)
      #text(font: font-display, size: 9.5pt, weight: 600, tracking: 3.5pt, fill: c.blue)[#T.tagline]
      #v(6mm)
      #text(font: font-display, size: 26pt, weight: 800, tracking: .3pt, fill: c.ink)[Runtime TelegramBot Desktop]
      #v(1mm)
      #text(font: font-display, size: 20pt, weight: 700, fill: c.blue)[Titan Edition]
      #v(3.5mm)
      #text(font: font-mono, size: 12.5pt, weight: 600, fill: c.blue-deep)[v#versione]
      #v(5mm)
      #box(width: 46mm, line(length: 100%, stroke: 1.8pt + brandGrad-h))
      #v(6mm)
      #text(font: font-display, size: 16pt, weight: 600, fill: c.ink-soft)[#T.manual-title]
      #v(8mm)
      #text(font: font-display, size: 11.5pt, weight: 500, fill: c.ink)[#autore]
    ]
    #v(1fr)
    #align(center)[
      #text(font: font-display, size: 9.5pt, weight: 600, fill: c.blue, tracking: .5pt)[#edizione]
      #v(1.5mm)
      #text(font: font-mono, size: 9pt, fill: c.ink-soft)[#T.aligned-to #versione]
    ]
    #v(8mm)
  ]
}

// =============================================================================
// COLOPHON / PAGINA DEI DIRITTI
// =============================================================================
#let colophon(versione: "2.1.5", autore: "Simone Pizzi", edizione: "Seconda Edizione · 2026",
              produzione: "Ecosystem Runtime") = {
  page(header: none, footer: none)[
    #v(1fr)
    #align(center)[
      #image("../assets/logo.png", width: 66pt)
      #v(6mm)
      #set par(justify: false, leading: .9em)
      #set text(font: font-body, size: 9.5pt, fill: c.ink-soft)
      #text(font: font-display, size: 12pt, weight: 600, fill: c.ink)[Runtime TelegramBot Desktop · Titan Edition — #T.manual-title]
      #v(2.5mm)
      #text(size: 9pt)[#edizione · #T.aligned-to #versione]
      #v(3mm)
      #box(width: 30mm, line(length: 100%, stroke: 1pt + brandGrad-h))
      #v(3.5mm)
      #text(fill: c.ink, weight: 600)[© 2026 #produzione / #autore]
      #linebreak()
      #T.rights
      #v(4.5mm)
      #block(width: 82%)[#T.repro]
      #v(4.5mm)
      #block(width: 82%)[#T.trademark]
      #v(4.5mm)
      #block(width: 82%)[#T.credits]
    ]
    #v(1fr)
  ]
}

// =============================================================================
// BOX RICORRENTI
// =============================================================================
#let _callout(titolo, accent, sfondo, corpo) = block(
  width: 100%,
  fill: sfondo,
  stroke: (left: 3pt + accent),
  radius: (top-right: 4pt, bottom-right: 4pt),
  inset: (left: 12pt, rest: 10pt),
  above: 1.1em, below: 1.1em,
  breakable: false,
)[
  #text(font: font-display, size: 8pt, weight: 700, fill: accent, tracking: 1pt)[#upper(titolo)]
  #v(-0.2em)
  #set text(size: 9.8pt)
  #corpo
]

#let nota(corpo)         = _callout(T.note-label, c.blue, rgb("#eef4fe"), corpo)
#let suggerimento(corpo) = _callout(T.tip-label, c.emerald, rgb("#edfaf4"), corpo)
#let attenzione(corpo)   = _callout(T.warning-label, c.amber, rgb("#fdf6ec"), corpo)
#let regola(corpo)       = _callout(T.rule-label, c.indigo, rgb("#f0f0fe"), corpo)

// Coppia Problema/Soluzione per il capitolo di troubleshooting.
#let problema(titolo, corpo) = block(
  width: 100%, fill: rgb("#f7f9fc"), stroke: .8pt + c.rule, radius: 6pt,
  inset: (x: 13pt, y: 11pt), above: 1.2em, below: 1.2em, breakable: false,
)[
  #grid(columns: (auto, 1fr), gutter: 7pt,
    align(top)[#box(baseline: -1pt)[#text(fill: c.red, size: 12pt)[#sym.circle.filled.small]]],
    text(font: font-display, size: 11pt, weight: 700, fill: c.ink)[#titolo])
  #v(2mm)
  #block(inset: (left: 0pt))[
    #text(font: font-display, size: 7.5pt, weight: 700, fill: c.emerald, tracking: 1pt)[#upper(T.solution-label)]
    #v(-0.15em)
    #set text(size: 10pt)
    #corpo
  ]
]

// Vignetta comics a inizio capitolo (banda a piena larghezza).
#let vignetta(slug) = block(above: 0pt, below: 6mm, breakable: false)[
  #block(radius: 8pt, clip: true, stroke: 1pt + c.rule,
    image("../../vignette/" + slug + ".jpeg", width: 100%))
]

// =============================================================================
// CONFIGURAZIONE DOCUMENTO
// =============================================================================
#let conf(titolo: "Manuale Utente Avanzato", autore: "Simone Pizzi", doc) = {
  set document(title: "Runtime TelegramBot Desktop · Titan Edition — " + titolo, author: autore)

  set page(
    width: 210mm, height: 297mm,               // A4 (edizione digitale)
    margin: (top: 22mm, bottom: 20mm, x: 20mm),
    header: context {
      let pg = here().page()
      let h1 = query(heading.where(level: 1))
      let corrente = none
      for h in h1 { if h.location().page() <= pg { corrente = h } }
      if corrente != none {
        set text(font: font-body, size: 8pt, fill: c.muted)
        grid(columns: (1fr, auto),
          align(left)[Runtime TelegramBot Desktop · Titan Edition],
          align(right)[#corrente.body])
        v(-0.4em)
        line(length: 100%, stroke: 0.4pt + c.rule)
      }
    },
    footer: context {
      let pg = counter(page).get().first()
      if pg > 1 {
        set text(font: font-mono, size: 8.5pt, fill: c.ink-soft)
        align(center)[#pg]
      }
    },
  )

  set text(font: font-body, size: 10.5pt, fill: c.ink, lang: T.typst-lang, hyphenate: true)
  set par(justify: true, leading: 0.72em, spacing: 0.95em, first-line-indent: 0pt)
  set heading(numbering: none)

  // Titolo di capitolo (livello 1): pagebreak, vignetta, etichetta, titolo, filetto
  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    _capnum.step()
    context {
      let n = _capnum.get().first()
      let slug = vignette-slugs.at(n - 1, default: none)
      if slug != none { vignetta(slug) }
      block(above: 0pt, below: 0.9em)[
        #text(font: font-display, size: 11pt, weight: 700, fill: c.blue, tracking: 2pt)[
          #upper(T.chapter-prefix + str(n) + T.chapter-suffix)
        ]
        #v(1mm)
        #text(font: font-display, size: 25pt, weight: 800, fill: c.ink, hyphenate: false)[#it.body]
        #v(2mm)
        #box(width: 38mm, line(length: 100%, stroke: 2.5pt + brandGrad-h))
      ]
    }
    v(0.4em)
  }
  show heading.where(level: 2): it => block(above: 1.5em, below: 0.6em)[
    #text(font: font-display, size: 15pt, weight: 600, fill: c.ink)[#it.body]
    #v(0.6mm)
    #line(length: 100%, stroke: 0.4pt + c.rule)
  ]
  show heading.where(level: 3): it => block(above: 1.1em, below: 0.4em)[
    #text(font: font-display, size: 11.5pt, weight: 600, fill: c.blue)[#it.body]
  ]

  // Codice inline
  show raw.where(block: false): it => box(
    fill: rgb("#eef3f9"), radius: 2.5pt, inset: (x: 3.5pt, y: 0pt), outset: (y: 2.5pt),
  )[#text(font: font-mono, size: 0.86em, fill: c.blue-deep)[#it]]

  // Blocco codice
  show raw.where(block: true): it => block(
    width: 100%, fill: rgb("#f4f7fb"), stroke: (left: 2.5pt + c.blue),
    radius: (top-right: 3pt, bottom-right: 3pt), inset: 9pt, above: 1em, below: 1em,
  )[#text(font: font-mono, size: 9pt, fill: c.ink)[#it]]

  // Tabelle
  set table(
    stroke: (x, y) => (bottom: 0.4pt + c.rule),
    inset: (x: 7pt, y: 5pt),
    fill: (_, y) => if y == 0 { c.ink } else if calc.even(y) { rgb("#f5f8fc") },
  )
  show table.cell: set text(size: 8.8pt)
  show table.cell.where(y: 0): set text(font: font-display, weight: 700, size: 8pt, fill: c.paper)

  // Figure — screenshot incorniciato (bordo arrotondato) + didascalia
  set figure(gap: 1.6mm, numbering: none)
  show figure: it => block(above: 1.4em, below: 1.2em, breakable: false, width: 100%)[
    #align(center)[
      #block(radius: 7pt, clip: true, stroke: .9pt + c.rule, it.body)
      #if it.caption != none {
        v(1.6mm)
        text(font: font-body, size: 8.3pt, style: "italic", fill: c.muted)[#it.caption.body]
      }
    ]
  ]

  // Enfasi / link
  show strong: set text(fill: c.ink)
  show link: set text(fill: c.blue-deep)

  doc
}
