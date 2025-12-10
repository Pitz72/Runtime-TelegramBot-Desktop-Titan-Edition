#!/usr/bin/env python3
"""Test semplificato per verificare la pulizia HTML"""

import re
from html import unescape

def strip_html_tags(text: str) -> str:
    """Rimuove tutti i tag HTML e converte entity HTML in caratteri normali."""
    if not isinstance(text, str):
        return ''
    
    # Rimuove tutti i tag HTML
    text = re.sub(r'<[^>]+>', '', text)
    
    # Converte entity HTML (es: &amp; → &, &quot; → ", &#039; → ')
    text = unescape(text)
    
    # Pulisce spazi multipli
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()

# Test caso problematico reale
print("Test caso Il TiraLinee:")
print("-" * 70)

problematic_title = "🎧 <b>Il TiraLinee | Episodio </b><b>#131</b><b> - Innovazioni nel CAD, Lavorazione CNC e Trasform..."

print(f"INPUT:\n  {problematic_title}\n")

cleaned = strip_html_tags(problematic_title)

print(f"OUTPUT:\n  {cleaned}\n")

# Verifica
has_html = '<' in cleaned or '>' in cleaned
print(f"Contiene tag HTML: {'❌ SI (ERRORE)' if has_html else '✅ NO (OK)'}")

print("\n" + "=" * 70)
print("\nAltri test:")
print("-" * 70)

tests = [
    ("&amp; &quot; &#039;", "& \" '"),
    ("<i>corsivo</i>", "corsivo"),
    ("Testo   con    spazi", "Testo con spazi"),
]

for input_text, expected in tests:
    result = strip_html_tags(input_text)
    ok = result == expected
    status = "✅" if ok else "❌"
    print(f"{status} '{input_text}' → '{result}' (atteso: '{expected}')")

print("\n✅ Test completato!")
