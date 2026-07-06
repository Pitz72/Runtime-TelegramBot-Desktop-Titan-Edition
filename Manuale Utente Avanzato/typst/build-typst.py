#!/usr/bin/env python3
# Converte i capitoli Markdown del Manuale Utente Avanzato di Runtime TelegramBot
# Titan Edition in capitoli Typst per il protocollo modulare
# (lib/manuale-template.typ). Ripetibile per ogni lingua.
#   python build-typst.py [lang]     (default: it)
#
# I sorgenti Markdown stanno UN LIVELLO SOPRA questa cartella (typst/), cioè
# nella cartella "Manuale Utente Avanzato/", nominati NN-slug.md.
import re, subprocess, sys, pathlib

LANG = sys.argv[1] if len(sys.argv) > 1 else "it"
HERE = pathlib.Path(__file__).parent.resolve()          # .../Manuale Utente Avanzato/typst
SRC  = HERE.parent / LANG                                # .../Manuale Utente Avanzato/<lang>
OUT  = HERE / "capitoli"

IMPORT = '#import "../lib/manuale-template.typ": *\n\n'

# Etichette dei callout imposte per lingua (paragrafo che inizia con
# #emph[Etichetta.]) -> tipo di box. Una parola/locuzione fissa per riquadro,
# per lingua, così il riconoscimento è certo (stesso principio di RRLMP).
_CALLOUT = {
    "suggerimento": {  # TIP
        "suggerimento", "consiglio", "tip", "conseil", "tipp",
        "sugerencia", "consejo", "dica", "sugestão", "совет", "建议", "提示",
    },
    "regola": {        # GOLDEN RULE
        "regola d'oro", "regola d’oro", "regola aurea",
        "golden rule", "rule of thumb",
        "règle d'or", "règle d’or", "faustregel", "goldene regel",
        "regla de oro", "regra de ouro", "золотое правило", "黄金法则", "黄金准则",
    },
    "attenzione": {    # WARNING
        "attenzione", "avvertenza", "warning", "caution", "attention",
        "achtung", "atención", "atenção", "внимание", "警告", "注意事项",
    },
    "nota": {          # NOTE
        "nota", "note", "hinweis", "примечание", "注",
        "nota linux", "nota tecnica",  # varianti già usate nel sorgente IT
    },
}
# indice inverso: parola -> tipo box
_LABEL2BOX = {w: box for box, words in _CALLOUT.items() for w in words}

def box_for_label(label):
    l = label.strip().lower().rstrip(".： :").strip()
    if l in _LABEL2BOX:
        return _LABEL2BOX[l]
    # fallback tollerante: match sul primo token significativo
    for box, words in _CALLOUT.items():
        if any(l.startswith(w) for w in words):
            return box
    return None

def match_bracket(s, i):
    # s[i] == '[' ; ritorna l'indice della ']' corrispondente (bilanciata)
    d = 0
    while i < len(s):
        if s[i] == '[': d += 1
        elif s[i] == ']':
            d -= 1
            if d == 0: return i
        i += 1
    return -1

def take_wrapped(block, marker):
    # Se `block` inizia con `marker` (es. "#emph[" o "#strong[") estrae il
    # contenuto della parentesi e il resto del blocco. Ritorna (inner, rest)
    # oppure (None, None).
    if not block.startswith(marker):
        return None, None
    open_br = len(marker) - 1
    close = match_bracket(block, open_br)
    if close == -1:
        return None, None
    inner = block[open_br + 1:close]
    rest = block[close + 1:].lstrip(" \n")
    return inner, rest

def transform_blocks(text, troubleshoot):
    # Divide in blocchi separati da riga vuota e converte:
    #  - paragrafi che iniziano con #emph[Etichetta.] -> box (nota/suggerimento/…)
    #  - (solo troubleshooting) paragrafi che iniziano con #strong[…] -> problema
    blocks = re.split(r"\n\s*\n", text)
    out = []
    for b in blocks:
        bs = b.strip("\n")
        # callout in corsivo
        inner, rest = take_wrapped(bs, "#emph[")
        if inner is not None:
            box = box_for_label(inner)
            if box is not None:
                out.append(f"#{box}[\n{rest}\n]")
                continue
        # coppia problema/soluzione (solo nel capitolo di troubleshooting)
        if troubleshoot:
            inner, rest = take_wrapped(bs, "#strong[")
            if inner is not None and rest:
                out.append(f"#problema[{inner}][\n{rest}\n]")
                continue
        out.append(bs)
    return "\n\n".join(out)

def post_typ(t, troubleshoot):
    # 1. via gli anchor dei titoli (<slug>) e i separatori decorativi (---)
    t = "\n".join(ln for ln in t.splitlines()
                  if ln.strip() != "#horizontalrule"
                  and not re.fullmatch(r"<[A-Za-z0-9_\-]+>", ln.strip()))
    # 2. titolo di capitolo: "== <Parola> N: Titolo" -> "= Titolo" (promosso a
    #    livello 1; il template ri-aggiunge l'etichetta di capitolo + vignetta).
    #    Language-agnostic: taglia tutto fino ai primi due punti (ASCII o cinesi).
    #    Si applica SOLO alla riga di capitolo ("== ", due segni + spazio), non
    #    alle sezioni ("=== ", tre segni), che vengono promosse subito dopo.
    t = re.sub(r"^== [^:：\n]*[:：]\s*(.+)$", r"= \1", t, flags=re.M)
    # 3. sezioni: "=== N.M Titolo" -> "== N.M Titolo"
    t = re.sub(r"^===\s", "== ", t, flags=re.M)
    t = re.sub(r"^====\s", "=== ", t, flags=re.M)
    # 4. path immagini: le figure vivono in typst/capitoli/, gli screenshot in
    #    "Manuale Utente Avanzato/screenshots/" -> due livelli sopra.
    t = t.replace('image("screenshots/', 'image("../../screenshots/')
    # 5. callout e problema/soluzione
    t = transform_blocks(t, troubleshoot)
    # 6. comprime 3+ righe vuote
    t = re.sub(r"\n{3,}", "\n\n", t)
    return IMPORT + t.strip() + "\n"

def convert(md_path, out_path, troubleshoot):
    md = md_path.read_text(encoding="utf-8")
    # `-citations`: gli handle Telegram/YouTube (@BotFather, @RuntimeRadio) NON
    # devono essere interpretati come citazioni bibliografiche.
    r = subprocess.run(["pandoc", "-f", "markdown-citations", "-t", "typst"],
                       input=md, capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        print(f"  pandoc ERRORE {md_path.name}:", r.stderr[:300]); sys.exit(1)
    out_path.write_text(post_typ(r.stdout, troubleshoot), encoding="utf-8")

OUT.mkdir(exist_ok=True)
md_files = sorted(SRC.glob("[0-9][0-9]-*.md"))
if not md_files:
    print("Nessun capitolo NN-*.md trovato in", SRC); sys.exit(1)
for i, md in enumerate(md_files, start=1):
    troubleshoot = "troubleshooting" in md.stem
    convert(md, OUT / f"cap{i:02d}.typ", troubleshoot)
    print(f"  cap{i:02d}.typ  <-  {md.name}")
print(f"OK — {len(md_files)} capitoli Typst generati in {OUT}")
