## Kapitel 9: Fehlerbehebung

Hier finden Sie die häufigsten Probleme und wie Sie sie lösen, im Format Problem und Lösung.

**Das Fenster ist beim Start weiß.** Das kommt selten vor, und fast nur auf virtuellen Maschinen oder Computern ohne aktuelle Grafikkarte. Warten Sie etwa zehn Sekunden: Titan hat ein Sicherheitsnetz, das die Oberfläche, wenn sie nicht von selbst erscheint, trotzdem erzwingt. Bleibt sie weiß, installieren Sie die Anwendung über die alte: Sie verlieren keine Daten, denn die Datenbank wird in einem vom Programm getrennten Systemordner aufbewahrt (der genaue Pfad steht in Kapitel 7).

**Ich habe einen YouTube-Feed hinzugefügt und in den Protokollen lese ich „Cannot read properties…“.** Die Verbindung zwischen Titan und YouTube (*InnerTube*) ist nicht offiziell: Sie liest die Seiten, wie es ein Browser täte. Ab und zu ändert Google den Code seiner Seiten und bringt dieses Lesen durcheinander. Der Fehler erscheint im Protokoll, und das Dashboard meldet ihn mit einer Benachrichtigung. Deaktivieren Sie in der Zwischenzeit den betreffenden YouTube-Kanal und warten Sie auf ein Update: Titan aktualisiert sich selbst (Kapitel 2), und das Problem löst sich meist an der Wurzel. Ihre Nachrichten und Ihre Podcasts funktionieren derweil weiter ohne Probleme.

**Der Bot meldet „Bad Request: chat not found“.** Die Channel ID ist falsch oder, häufiger, Sie haben vergessen, den Bot zu den **Administratoren** des Kanals hinzuzufügen. Beheben Sie es: Öffnen Sie ihn in den Einstellungen des Telegram-Kanals, fügen Sie den Bot als Administrator hinzu und geben Sie ihm die Berechtigung zum Senden von Nachrichten. Der Fehler verschwindet (siehe auch Kapitel 4).

**Ich doppelklicke auf das Symbol, und es öffnet sich kein zweites Fenster: Das bereits vorhandene kommt nach vorne.** Das ist so gewollt. Titan lässt jeweils nur eine Instanz zu: Läuft das Programm bereits, öffnet der zweite Start nichts, sondern holt lediglich das vorhandene Fenster nach vorne und stellt es wieder her, falls es minimiert war. Der Grund ist handfest: Zwei Instanzen würden dieselbe Datenbank öffnen und zwei unabhängige Motoren über dieselben Feeds laufen lassen — mit dem Ergebnis, denselben Inhalt zweimal im Kanal zu veröffentlichen.

**Der Bot veröffentlicht die Nachrichten, aber das Bild erscheint als kleines Quadrat statt als große Vorschau.** Das ist das normale Verhalten von Telegram, wenn die RSS-Quelle kein großes Bild enthält, sondern nur ein Miniaturbild. Titan sucht das Bild in der höchsten Auflösung, die es finden kann, und gräbt dabei sogar im Artikeltext, aber wenn die Quelle kein geeignetes hat, greift Telegram auf das Miniaturbild zurück. Um das zu beheben, muss man auf der Seite eingreifen, die den Feed veröffentlicht, nicht am Bot.

---
