## Kapitel 6: Erweiterte Einstellungen und Vorlagen

Die Einstellungen jedes Bots öffnen sich über das Schieberegler-Symbol (🎚️) neben seinem Namen, in der linken Spalte. Das Fenster hat zwei Registerkarten: **Allgemein** (die Parameter des Bots) und **Vorlagen** (das Aussehen der Nachrichten).

### 6.1 Überprüfungsintervall und Benachrichtigungen
In der Registerkarte **Allgemein** gibt es neben den Daten, die Sie bereits kennen (Name, Token, Kanal-ID, Startdatum), zwei Einstellungen, die das Verhalten des Bots bestimmen:

-   **Überprüfungsintervall.** Ein Schieberegler von 1 bis 120 Minuten (standardmäßig 15), der festlegt, wie oft der Bot die Feeds prüft. Es ist der Grundrhythmus; braucht eine einzelne Quelle einen anderen Takt, geben Sie ihn ihr im Feed Manager (Kapitel 5).
-   **Benachrichtigungen.** Ein Schalter: Ist er eingeschaltet, blendet Titan bei jeder erfolgreichen Veröffentlichung einen Systemhinweis ein (eine Desktop-Benachrichtigung). Wenn Sie sehr aktive Kanäle betreiben und nicht bei jedem Beitrag benachrichtigt werden möchten, schalten Sie ihn aus.

Neben dem Token-Feld erlaubt Ihnen ein augenförmiges Symbol, ihn beim Einfügen anzuzeigen oder zu verbergen.

![Die Registerkarte Allgemein der Bot-Einstellungen: Überprüfungsintervall, Benachrichtigungen und aktive Stunden.](screenshots/04-bot-settings-general.png)

### 6.2 Ruhezeiten (Aktive Stunden)
Ausländische Zeitungen und internationale Kreative veröffentlichen oft mitten in der Nacht, und eine Push-Benachrichtigung um drei Uhr morgens gefällt niemandem. Genau dafür sind die Ruhezeiten da.

Weiterhin in der Registerkarte **Allgemein** hat der Abschnitt **Aktive Stunden** zwei Felder: **Von** (z. B. 08:00) und **Bis** (z. B. 22:00). Standardmäßig reicht das Fenster von 00:00 bis 23:59, also keine Ruhe: Sie sind es, der es eingrenzt.

-   *Außerhalb des Fensters.* Die Engine hält nicht an: Sie prüft die ganze Nacht weiter die RSS- und YouTube-Feeds, um nichts zu verpassen. Nur legt sie die Inhalte, statt sofort zu senden, in einer **persistenten** Warteschlange beiseite, auf der Festplatte gespeichert. Selbst wenn Sie den Computer ausschalten, ist die Warteschlange beim Neustart noch da.
-   *Bei der Wiedereröffnung.* Sobald die Uhr wieder in das erlaubte Fenster tritt, arbeitet der Bot alles Angesammelte in chronologischer Reihenfolge ab und veröffentlicht alle 3 Sekunden einen Beitrag, bis die Warteschlange leer ist.

So achten Ihre Automatisierungen auf die Ruhe des Publikums, und der Inhalt kommt morgens an, wenn er die besten Chancen hat, gelesen zu werden.

### 6.3 Vorlageneditor und Smart Chips
Standardmäßig veröffentlicht Titan mit einem sauberen, aber standardmäßigen Layout. Wenn Sie den Nachrichten Ihre redaktionelle Linie geben möchten (ein Emoji als Logo, die Links nach Ihrer Art angeordnet), öffnen Sie die Registerkarte **Vorlagen**.

Sie finden vier getrennte Textbereiche, einen pro Format: **Start**, **News**, **Podcast**, **YouTube**. Sie werden im **von Telegram unterstützten HTML** geschrieben: Die nützlichen Tags sind `<b>` (fett), `<i>` (kursiv), `<code>` (Monospace) und `<a href="...">` (Link).

![Die Registerkarte Vorlagen mit dem Editor, den Smart Chips für die Variablen und der Nachrichtenvorschau.](screenshots/05-bot-settings-templates.png)

Über jedem Bereich fügen die Schaltflächen **Smart Chips** die dynamischen Variablen ein, die der Bot beim Versand durch die echten Daten ersetzt:

-   `{{title}}`: der Titel des Artikels oder des Videos.
-   `{{feedName}}`: der Name, den Sie der Quelle im Feed Manager gegeben haben (zum Beispiel *Pressespiegel*).
-   `{{link}}`: die Adresse des Artikels.
-   `{{summary}}`: eine kurze Vorschau des Textes (höchstens 300 Zeichen).

*Sauberer Text.* Machen Sie sich keine Sorgen darüber, was aus den Feeds kommt: Titan befreit den Text von den HTML-Tags der Quelle (Bilder, Tabellen, Absätze) und neutralisiert die Sonderzeichen vor dem Versand, sodass ein „schmutziger" Artikel die Nachricht nicht zum Scheitern bringen kann.

Zwei Werkzeuge helfen Ihnen, Fehler zu vermeiden:

-   **Vorschau.** Die augenförmige Schaltfläche zeigt, wie die Nachricht aussehen wird, mit Beispieldaten anstelle der Variablen, ohne den Editor zu verlassen.
-   **Validator.** Während Sie schreiben, meldet Titan Probleme in Echtzeit: nicht ausgeglichene Tags, nicht existierende Variablen, unsichere Links. Der Rand des Bereichs wird rot bei Fehlern, gelb bei Warnungen.

*Saubere Links.* Telegram kann lange Links im Text verbergen. Statt „Hier klicken: {{link}}" schreiben Sie `<a href="{{link}}">Den Artikel lesen</a>`: Der Nutzer sieht nur den blauen, anklickbaren Satz.

### 6.4 Die Gefahrenzone: den Verlauf zurücksetzen
Am unteren Ende der Registerkarte **Allgemein** gibt es einen roten Abschnitt, die *Gefahrenzone*. Die Schaltfläche **Verlauf Löschen** ist mächtig und destruktiv: Sie löscht das Gedächtnis des Bots, also alles, was er bereits veröffentlicht hat.

-   *Wann es hilft.* Wenn Sie versehentlich viele Nachrichten aus dem Kanal gelöscht haben und möchten, dass der Bot die neuesten Meldungen erneut veröffentlicht, um die Pinnwand wiederherzustellen.
-   *Wie man es ohne Desaster verwendet.* Wenn Sie den Verlauf löschen und Play drücken, betrachtet der Bot alles, was er in den Feeds findet, als „neu" und sendet es im Block, wodurch der Kanal überschwemmt wird. Um das zu vermeiden, setzen Sie nach dem Löschen das **Startdatum** (in derselben Registerkarte) auf das heutige Datum zurück: So vergisst der Bot die Vergangenheit, veröffentlicht aber nur von heute an.

Beim Löschen des Verlaufs kehren auch die Statistikzähler auf null zurück (Kapitel 3). Neben der Gefahrenzone finden Sie auch den Export des Bots im Format `.rtb`, den wir in Kapitel 7 behandeln.

---
