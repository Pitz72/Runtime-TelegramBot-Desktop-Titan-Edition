#import "lib/manuale-template.typ": *

// Versione del software ed etichetta d'edizione: un solo punto di verità.
#let VERSIONE  = "2.1.8"
#let AUTORE    = "Simone Pizzi"
#let PRODUZIONE = "Ecosystem Runtime"
#let EDIZIONE  = T.edition-name + " · 2026"

// Due tirature dalla stessa sorgente:
//  • digitale (default) — include la copertina a piena pagina;
//  • interno KDP (`--input kdp=1`) — parte dal frontespizio, senza copertina.
#let per-kdp = "kdp" in sys.inputs

#show: conf.with(titolo: T.manual-title, autore: AUTORE)

// ---- FRONTE DEL MANUALE -----------------------------------------------------
#if not per-kdp {
  copertina(versione: VERSIONE, autore: AUTORE, edizione: EDIZIONE, produzione: PRODUZIONE)
}
#frontespizio(versione: VERSIONE, autore: AUTORE, edizione: EDIZIONE)
#colophon(versione: VERSIONE, autore: AUTORE, edizione: EDIZIONE, produzione: PRODUZIONE)

// ---- INDICE -----------------------------------------------------------------
#page(header: none)[
  #text(font: font-display, size: 22pt, weight: 800, fill: c.ink)[#T.toc-title]
  #v(2mm)
  #box(width: 38mm, line(length: 100%, stroke: 2.5pt + brandGrad-h))
  #v(6mm)
  #outline(title: none, depth: 2, indent: 1.2em)
]

// ---- CAPITOLI ---------------------------------------------------------------
#include "capitoli/cap01.typ"
#include "capitoli/cap02.typ"
#include "capitoli/cap03.typ"
#include "capitoli/cap04.typ"
#include "capitoli/cap05.typ"
#include "capitoli/cap06.typ"
#include "capitoli/cap07.typ"
#include "capitoli/cap08.typ"
#include "capitoli/cap09.typ"
