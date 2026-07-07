## Kapitel 5: Der Feed Manager (die Quellen)

### 5.1 Eine Quelle hinzufügen und testen
Der Feed Manager (das Panel unter der Bot-Liste) ist die „Ernährung“ Ihres Bots: Hier geben Sie die Webadressen (URL) ein, aus denen Titan die Inhalte fischen soll.

Um eine Quelle hinzuzufügen:

1. Wählen Sie den Bot, dem Sie sie zuweisen möchten.
2. Klicken Sie auf **Quelle Hinzufügen**.
3. Geben Sie der Quelle einen **Namen**. Das ist keine beliebige Beschriftung: Es ist der Text, den Sie oben in den Nachrichten als Signatur der Meldung anzeigen können (es ist das Feld `{{feedName}}` der Vorlagen, Kapitel 6).
4. Wählen Sie den **Typ**:
    -   **Podcast:** für die Audioströme (MP3). Titan versucht, das Coverbild zu holen, das oft in den *iTunes*-Tags versteckt ist, die von Diensten wie Spreaker oder AzuraCast verwendet werden.
    -   **Nachrichten:** für die klassischen Artikel aus Blogs, Nachrichtenseiten oder Zeitungen.
5. Fügen Sie die URL des Feeds ein (meist eine Adresse, die auf `.xml` oder `.rss` endet).

Vor dem Speichern können Sie die Schaltfläche **Testen (⚡)** verwenden: Sie ruft den Link tatsächlich auf und sagt Ihnen sofort, ob er antwortet. Ist der Feed gültig, meldet ein grüner Hinweis, wie viele Nachrichten gefunden wurden; stimmt etwas nicht (Seite offline, falscher Link), ist der Hinweis rot. Der Test ist nur eine Prüfung: Er verpflichtet Sie zu nichts, Sie können trotzdem speichern, aber es ist der schnellste Weg, keine falsche Adresse einzugeben.

![Das Formular zum Anlegen einer neuen Quelle, mit Name, Typ, URL und der Test-Schaltfläche.](screenshots/06-feed-form.png)

Jede Quelle in der Liste hat einen Schalter, um sie zu aktivieren oder zu pausieren, ohne sie zu löschen, sowie die Symbole, um sie zu bearbeiten oder zu entfernen.

![Die Quellenliste: der Typ, das Abzeichen der aktiven Filter und der Schalter für jeden Feed.](screenshots/13-feed-list.png)

Wenn eine Quelle nicht mehr antwortet (etwa ein 404-Fehler), bemerken Sie es: In den Systemprotokollen erscheint eine rote Zeile mit dem Namen des Feeds. Und falls Sie sich fragen, wie viele Quellen Sie hinzufügen können, gibt es keine feste Obergrenze: Bedenken Sie jedoch, dass die Engine sie reihum prüft, sodass sich mit vielen Dutzend Feeds (oder vielen Bots) die vollständige Prüfrunde verlängert.

### 5.2 Die native YouTube-Verwaltung
Normalerweise ist es lästig, YouTube in ein Automatisierungssystem einzubinden: Es erfordert ein Entwicklerkonto bei Google Cloud und einen API-Schlüssel, mit den entsprechenden Kosten und Grenzen. Titan erspart sich all das dank *InnerTube*, einer Engine, die die YouTube-Seiten liest, wie es ein Browser täte, ganz ohne Schlüssel.

1.  Wählen Sie in **Quelle Hinzufügen** den Typ **YouTube (Video)**.
2.  Im URL-Feld braucht es weder seltsame Codes noch XML-Feeds: Fügen Sie das Handle des Kanals ein (das At-Zeichen unter dem Namen des YouTubers, zum Beispiel `@RuntimeRadio`) oder die vollständige Adresse des Kanals, aus dem Browser kopiert.

Um den Rest kümmert sich Titan. Es gibt allerdings eine nützliche Vorkehrung: den **Anti-Premiere-Filter**. Wenn ein YouTuber einen Livestream oder ein Video „verfügbar in zwei Tagen“ plant, zeigt YouTube es dennoch ganz oben in der Liste. Ein naiver Bot würde sofort die Benachrichtigung senden, und wer klickt, landet bei einem noch nicht verfügbaren Video. Titan hingegen prüft den Status des Videos: Ist es als *upcoming* oder *premiere* markiert, verwirft er es und veröffentlicht es erst, wenn es wirklich sichtbar wird.

### 5.3 Erweiterte Feed-Optionen
Wenn Sie eine Quelle hinzufügen oder bearbeiten, finden Sie unter den Hauptfeldern drei optionale Einstellungen. Sie können sie ignorieren (der Feed funktioniert bestens mit den Standardwerten) oder sie für eine feinere Steuerung nutzen.

-   **Filter nach Schlüsselwörtern.** Zwei Felder, „einschließen“ und „ausschließen“, mit durch Kommas getrennten Wörtern. Füllen Sie „einschließen“ aus, veröffentlicht Titan nur die Inhalte, in denen mindestens eines dieser Wörter vorkommt, im Titel oder im Text; füllen Sie „ausschließen“ aus, verwirft er die, die auch nur eines enthalten. Ein bernsteinfarbenes Abzeichen an der Quelle zeigt an, dass der Filter aktiv ist.
-   **Benutzerdefiniertes Intervall.** In der Regel folgt jeder Feed dem Prüfrhythmus des Bots. Hier können Sie ihm einen eigenen geben, von 5 Minuten bis 24 Stunden: praktisch, um eine sehr aktive Seite häufiger zu prüfen oder eine langsame seltener. Ein Abzeichen zeigt das eingestellte Intervall an.
-   **Digest.** Statt jeden Inhalt zu veröffentlichen, sobald er erscheint, kann Titan sie sammeln und gemeinsam in einer einzigen Zusammenfassungsnachricht senden, in festem Takt (1 Stunde, 6, 12, 24 Stunden oder 7 Tage). Die Zusammenfassung listet die Titel mit dem Link „Lesen“ auf, bis zu 20 Inhalte pro Nachricht. Nützlich für weitschweifige Quellen, die sonst den Kanal überschwemmen würden. Ein violettes Abzeichen zeigt den aktiven Digest an.

### 5.4 Mehrere Feeds auf einmal importieren (OPML)
Wenn Sie bereits eine Feed-Liste in einem RSS-Reader haben, müssen Sie sie nicht von Hand neu eingeben. Die Schaltfläche **OPML**, oben im Feed Manager, importiert im Block alle Quellen, die in einer standardmäßigen `.opml`-Datei enthalten sind, dem Format, mit dem RSS-Reader ihre Listen exportieren. Am Ende sagt Ihnen Titan, wie viele Feeds hinzugefügt wurden.

---
