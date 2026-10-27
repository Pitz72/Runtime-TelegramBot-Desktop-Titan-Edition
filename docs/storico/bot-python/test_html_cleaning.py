#!/usr/bin/env python3
"""
Test per verificare la pulizia HTML nei messaggi
Script di diagnostica per i problemi di formattazione
"""

import sys
import os
import re
from html import unescape

# Aggiungi la cartella src al path Python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from bot import strip_html_tags, escape_markdown_v2, create_improved_message_with_feed

def test_html_cleaning():
    """Test casi problematici di HTML"""
    
    print("🧪 Test Pulizia HTML\n")
    print("=" * 70)
    
    # Test 1: Tag HTML semplici
    test_cases = [
        {
            "name": "Tag <b> e </b>",
            "input": "🎧 <b>Il TiraLinee | Episodio </b><b>#131</b><b> - Innovazioni nel CAD",
            "expected": "🎧 Il TiraLinee | Episodio #131 - Innovazioni nel CAD"
        },
        {
            "name": "Tag <i> e <strong>",
            "input": "Questo è <i>corsivo</i> e questo <strong>grassetto</strong>",
            "expected": "Questo è corsivo e questo grassetto"
        },
        {
            "name": "Entity HTML",
            "input": "Test &amp; prova &quot;virgolette&quot; e &#039;apostrofi&#039;",
            "expected": "Test & prova \"virgolette\" e 'apostrofi'"
        },
        {
            "name": "Tag multipli annidati",
            "input": "<b><i>Testo</i></b> normale <span>test</span>",
            "expected": "Testo normale test"
        },
        {
            "name": "Spazi multipli",
            "input": "Testo   con    spazi     multipli",
            "expected": "Testo con spazi multipli"
        },
        {
            "name": "Tag br e p",
            "input": "Prima riga<br>Seconda riga<p>Paragrafo</p>",
            "expected": "Prima riga Seconda riga Paragrafo"
        }
    ]
    
    passed = 0
    failed = 0
    
    for i, test in enumerate(test_cases, 1):
        result = strip_html_tags(test["input"])
        success = result == test["expected"]
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"\nTest {i}: {test['name']}")
        print(f"Input:    {test['input']}")
        print(f"Expected: {test['expected']}")
        print(f"Got:      {result}")
        print(f"Status:   {status}")
        
        if success:
            passed += 1
        else:
            failed += 1
    
    print("\n" + "=" * 70)
    print(f"Risultati: {passed} passati, {failed} falliti su {len(test_cases)} test")
    
    return failed == 0

def test_full_message():
    """Test messaggio completo come apparirebbe su Telegram"""
    
    print("\n\n🎯 Test Messaggio Completo\n")
    print("=" * 70)
    
    # Simula dati problematici dal feed
    feed_name = "Il TiraLinee"
    title = "🎧 <b>Il TiraLinee | Episodio </b><b>#131</b><b> - Innovazioni nel CAD, Lavorazione CNC e Trasform..."
    link = "https://www.spreaker.com/episode/test"
    summary = "In questo episodio parliamo di <strong>CAD</strong> e <i>automazione</i> con &amp; altri argomenti."
    tags = ["cad", "automazione", "design"]
    
    print("INPUT PROBLEMATICO:")
    print(f"  Feed:    {feed_name}")
    print(f"  Title:   {title}")
    print(f"  Summary: {summary}")
    
    # Crea messaggio pulito
    try:
        message = create_improved_message_with_feed(feed_name, title, link, summary, tags)
        
        print("\n✅ MESSAGGIO PULITO GENERATO:")
        print("-" * 70)
        print(message)
        print("-" * 70)
        
        # Verifica che non ci siano tag HTML residui
        has_html_tags = bool(re.search(r'<[^>]+>', message))
        has_escaped_html = '&lt;' in message or '&gt;' in message or '<b>' in message
        
        if has_html_tags or has_escaped_html:
            print("\n❌ ERRORE: Trovati tag HTML residui nel messaggio!")
            return False
        else:
            print("\n✅ Messaggio pulito - Nessun tag HTML trovato")
            return True
            
    except Exception as e:
        print(f"\n❌ ERRORE durante generazione messaggio: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_markdown_escaping():
    """Test che i caratteri Markdown siano escapati correttamente"""
    
    print("\n\n🔤 Test Escape Markdown\n")
    print("=" * 70)
    
    test_cases = [
        {
            "input": "Episodio #131 - Test",
            "should_contain": "\\#131"
        },
        {
            "input": "Link [importante]",
            "should_contain": "\\[importante\\]"
        },
        {
            "input": "Test (parentesi)",
            "should_contain": "\\(parentesi\\)"
        }
    ]
    
    passed = 0
    for i, test in enumerate(test_cases, 1):
        result = escape_markdown_v2(test["input"])
        success = test["should_contain"] in result
        
        status = "✅" if success else "❌"
        print(f"{status} Test {i}: {test['input']}")
        print(f"   Result: {result}")
        print(f"   Expected to contain: {test['should_contain']}")
        
        if success:
            passed += 1
    
    print(f"\n{passed}/{len(test_cases)} test passati")
    return passed == len(test_cases)

if __name__ == "__main__":
    print("\n" + "="*70)
    print("TEST PULIZIA HTML E FORMATTAZIONE MESSAGGI")
    print("="*70 + "\n")
    
    results = []
    
    # Esegui tutti i test
    results.append(("Pulizia HTML", test_html_cleaning()))
    results.append(("Messaggio Completo", test_full_message()))
    results.append(("Escape Markdown", test_markdown_escaping()))
    
    # Riepilogo finale
    print("\n\n" + "="*70)
    print("RIEPILOGO FINALE")
    print("="*70)
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if not result:
            all_passed = False
    
    print("="*70)
    
    if all_passed:
        print("\n🎉 TUTTI I TEST SUPERATI!")
        print("Il bot è pronto per gestire correttamente HTML e formattazione.")
        sys.exit(0)
    else:
        print("\n⚠️ ALCUNI TEST FALLITI")
        print("Controlla gli errori sopra per maggiori dettagli.")
        sys.exit(1)
