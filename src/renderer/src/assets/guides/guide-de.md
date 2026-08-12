# ⚡ Runtime TelegramBot Desktop Titan Edition: Kurzanleitung

Willkommen bei der **Runtime TelegramBot Desktop Titan Edition**. Diese Kurzanleitung ermöglicht es Ihnen, Ihren ersten Bot zu konfigurieren und in weniger als 3 Minuten erste Inhalte in Ihrem Telegram-Kanal zu veröffentlichen.

---

## 1. Vorbereitung: Den Telegram-Token erhalten
Bevor Sie Titan starten, müssen Sie einen „Bot“ auf Telegram erstellen:
1. Öffnen Sie Telegram und suchen Sie nach dem Benutzer **@BotFather** (er hat das blaue Verifizierungsabzeichen).
2. Senden Sie den Befehl `/newbot` und folgen Sie den Anweisungen, um Ihrem Bot einen Namen zu geben.
3. Am Ende gibt Ihnen @BotFather einen **API-Token** (eine lange Zeichenfolge wie `123456789:ABCdefGHIjklMNOpqr...`). **Kopieren Sie diesen und bewahren Sie ihn sicher auf.**
4. Fügen Sie den neu erstellten Bot als **Administrator** zu Ihrem Telegram-Kanal hinzu (er muss die Berechtigung „Nachrichten senden“ haben).

## 2. Der erste Start (Setup-Assistent)
Starten Sie Runtime TelegramBot Desktop Titan Edition. Wenn dies Ihr erstes Mal ist, erscheint der 4-stufige Assistent:
*   **Bot-Name:** Wählen Sie einen Namen, um ihn zu erkennen (z. B. *News-Kanal*).
*   **Bot Token:** Fügen Sie den von @BotFather bereitgestellten Token ein.
*   **Channel ID:** Geben Sie den Namen Ihres Kanals ein (z. B. `@meinkanal`). Wenn es ein privater Kanal ist, geben Sie die numerische ID (z. B. `-100123456789`).
*   **Startdatum:** Wählen Sie ein Datum. Der Bot **ignoriert** alle Artikel und Videos, die vor diesem Datum veröffentlicht wurden, um zu vermeiden, dass Ihr Kanal mit alten Inhalten überflutet wird.

## 3. Quellen hinzufügen (Feed-Manager)
Sobald Sie sich im Dashboard befinden:
1. Stellen Sie sicher, dass Ihr Bot in der linken Spalte ausgewählt ist.
2. Klicken Sie im Bereich **Feed-Quellen** auf **„+ Quelle hinzufügen“**.
3. Geben Sie den Namen ein (z. B. *Mein Podcast*) und wählen Sie den **Typ** aus (Podcast, News oder YouTube).
4. Fügen Sie die URL ein:
   * Für Nachrichten und Podcasts: Fügen Sie die URL des RSS-Feeds ein.
   * Für YouTube: Sie können die Kanal-URL oder das Handle direkt einfügen (z. B. `@RuntimeRadio`). *Es werden keine API-Schlüssel benötigt!*
5. Verwenden Sie die Schaltfläche **Testen (⚡)**, um zu überprüfen, ob der Link gültig ist, und klicken Sie dann auf **Speichern**.

## 4. Nachrichten anpassen (Vorlagen)
Möchten Sie, dass Ihre Beiträge perfekt formatiert sind?
1. Klicken Sie auf das Symbol **Einstellungen (⚙️)** in der linken Spalte.
2. Wechseln Sie zur Registerkarte **Vorlagen**.
3. Verwenden Sie das praktische Tastenfeld oben, um automatische Variablen wie `{{title}}`, `{{link}}` oder `{{summary}}` einzufügen.
4. Sie können grundlegende von Telegram unterstützte HTML-Tags verwenden, zum Beispiel: `<b>Fett</b>`, `<i>Kursiv</i>`, oder einen langen Link hinter einem Text verstecken, indem Sie `<a href="{{link}}">Hier klicken</a>` verwenden.

## 5. Zündung
Haben Sie den Token eingegeben und die Feeds hinzugefügt? Sie sind bereit.
*   Klicken Sie auf die große **Play-Taste (▶)** in der Mitte der Konsole.
*   Der Ring beginnt sich zu drehen und der Bot nimmt seine Arbeit auf.
*   Im Bereich **System Logs** sehen Sie in Echtzeit, wie der Bot Ihre Quellen liest und neue Inhalte auf Telegram veröffentlicht!

---

### 💡 Nützliche Tipps & Fehlerbehebung
*   **Ruhezeiten:** In den Bot-Einstellungen können Sie die Aktivitätszeiten definieren. Wenn Sie die Zeit von 08:00 bis 22:00 Uhr einstellen, gehen die Nachtnachrichten nicht verloren, sondern werden in die Warteschlange gestellt und morgens um 08:00 Uhr veröffentlicht!
*   **YouTube-Fehler:** Wenn Sie „rote“ Fehler auf YouTube-Kanälen erhalten, geraten Sie nicht in Panik. Google aktualisiert häufig seine Server. Schalten Sie den YouTube-Feed vorübergehend über die entsprechende Schaltfläche in der Oberfläche ab und warten Sie auf unser Software-Update.
*   **PC-Wechsel:** Müssen Sie den Bot auf einen anderen Computer übertragen? Kopieren Sie die Dateien nicht! Verwenden Sie die Funktion **Exportieren (.rtb)** in den Einstellungen. Dadurch wird eine sichere Datei generiert, die in den neuen PC importiert werden kann, wobei Ihre Passwörter verschlüsselt bleiben.

---

**Runtime TelegramBot Desktop · Titan Edition** ist freie Software, veröffentlicht unter der **MIT-Lizenz**: Sie dürfen sie verwenden, untersuchen, verändern und weitergeben.

Der Großteil des Codes wurde mit Sprachmodellen geschrieben (Google Gemini, Anthropic Claude). Konzept, Projektleitung und Überprüfung stammen von Simone Pizzi.

Für die vollständige Darstellung nutzen Sie die Schaltfläche **Handbuch herunterladen (PDF)**.

Kontakt: simonepizzi.runtimeradio.it/contatti
Freiwillige Spende: paypal.me/runtimeradio
