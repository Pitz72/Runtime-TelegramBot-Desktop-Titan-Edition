## Kapitel 4: Verwaltung von Bots und Kanälen

### 4.1 Mehrere Bots anlegen
Titan ist mehrkanalig: Sie können mehrere Bots aus demselben Fenster verwalten, jeden mit seinem Kanal. Angenommen, Sie betreiben ein Radio: Sie brauchen einen Telegram-Kanal für die geschriebenen Nachrichten (News), einen für die Audiofolgen (Podcast) und vielleicht einen dritten für die Kulissen (YouTube). Sie müssen das Programm nicht dreimal installieren.

Oben in der Bot-Spalte, rechts, gibt es eine kleine Befehlsgruppe. Das **+** öffnet ein schnelles Formular: Geben Sie Name, Token, Kanal-ID und Stichtag ein, speichern Sie, und das neue Profil erscheint in der Liste. Neben dem **+** finden Sie auch die Schaltfläche, um einen Bot aus einer `.rtb`-Datei zu **importieren** (Kapitel 7), und die mit Schiebereglern (🎚️), um seine **Einstellungen** zu öffnen (Kapitel 6).

Jedes Profil lebt für sich: Feeds, Zeiten und Vorlagen sind getrennt. Wenn Sie Play drücken, orchestriert Titan alle aktiven Bots in einem einzigen Arbeitszyklus und bedient sie reihum.

![Der Bot Selector: jedes Profil zeigt seinen Namen, seinen Kanal und seinen Status online/offline.](screenshots/12-bot-selector.png)

### 4.2 Den Token von @BotFather beziehen
Der **Bot Token** (Token des Bots) ist der „Hausschlüssel“, der es der Software erlaubt, mit den Servern von Telegram zu sprechen. Um einen zu erhalten, brauchen Sie Telegram, auf dem Smartphone oder dem Computer:

1. Geben Sie in der Telegram-Suche `BotFather` ein und öffnen Sie das offizielle Profil, erkennbar am blauen Verifizierungshäkchen.
2. Drücken Sie **Start** und senden Sie den Befehl `/newbot`.
3. BotFather fragt zuerst nach einem „Namen“ (dem, den die Nutzer lesen), dann nach einem eindeutigen „Username“, der mit dem Wort *bot* enden muss (zum Beispiel `meinradio_news_bot`).
4. Ist der Username frei, antwortet BotFather mit einer Glückwunschnachricht, die eine lange alphanumerische Zeichenfolge enthält, unter dem Hinweis *Use this token to access the HTTP API*.
5. Kopieren Sie diese Zeichenfolge: Sie ist der Token, den Sie in Titan einfügen.

**Wichtig.** Geben Sie den Token niemals weiter. Titan speichert ihn verschlüsselt und bindet ihn über den Schlüsselbund des Betriebssystems an diesen Computer: So bleibt der Token unlesbar, selbst wenn Sie die Programmdateien auf eine andere Maschine kopieren. Um ihn wirklich auf einen anderen PC zu verschieben, gibt es das Format `.rtb`, erklärt in Kapitel 7.

### 4.3 Die richtige Channel ID finden
Um zu veröffentlichen, muss der Bot wissen, *wohin* er die Nachrichten senden soll: das ist die **Channel ID** (Kanal-ID).

-   **Öffentliche Kanäle.** Das ist der einfachste Fall. Hat der Kanal einen Link wie `t.me/meinkanal`, so ist die Channel ID `@meinkanal`. Sie müssen nicht einmal genau sein: Titan bereinigt selbst, was Sie einfügen: Es entfernt das Präfix `https://` und `t.me/` und ergänzt das At-Zeichen, falls es fehlt. So werden `https://t.me/meinkanal`, `t.me/meinkanal` und `meinkanal` alle zu `@meinkanal`.
-   **Private Kanäle.** Sie haben keinen öffentlichen Namen: Sie werden durch eine von Telegram vergebene Zahlenfolge identifiziert, die meist mit dem Minuszeichen beginnt (zum Beispiel `-1002345678912`). Um sie zu erhalten, leiten Sie eine Nachricht des Kanals an einen kostenlosen Dienst-Bot wie `@getidsbot` weiter, der Ihnen den genauen numerischen Code des Chats antwortet. Diese Zahl fügt man unverändert ein.

*Goldene Regel.* Nachdem der Kanal erstellt und die ID beschafft ist, und **bevor Sie den Bot starten**, gehen Sie in die Einstellungen des Telegram-Kanals, öffnen **Administratoren**, suchen Ihren Bot und fügen ihn mit der Berechtigung zum Senden von Nachrichten hinzu. Ist der Bot kein Administrator (oder ist die ID falsch), hat er keine Möglichkeit, in den Kanal zu schreiben: In den Protokollen erscheint ein roter Telegram-Fehler (wir sehen sie in Kapitel 9) und es wird nichts veröffentlicht.

---
