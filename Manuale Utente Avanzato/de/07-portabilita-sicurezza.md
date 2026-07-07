## Kapitel 7: Portabilität und Sicherheit (das Ökosystem OmniSync)

Titan bewahrt Ihre Arbeit sicher auf und gibt Ihnen drei Wege, sie zu speichern oder zu verschieben: die vollständige Sicherung der Datenbank, das Format `.rtb` für einen einzelnen Bot und den Export der gesamten Konfiguration. Sehen wir sie uns an.

### 7.1 Vollständige Sicherung der Datenbank
Klicken Sie oben rechts auf das Zahnradsymbol (⚙️), um die **Systemeinstellungen** zu öffnen, und gehen Sie dann zur Registerkarte **Daten & Backup**.

Die Schaltfläche **DB Exportieren** erstellt einen vollständigen Klon der Datenbank `titan.db`: Darin ist alles enthalten, die Bot-Profile, die Feeds und das gesamte historische Gedächtnis der Veröffentlichungen. Mit **DB Importieren** wählen Sie eine zuvor gespeicherte Datei, und Titan startet von selbst neu und stellt genau die Situation jenes Moments wieder her.

![Die Registerkarte Daten & Backup: Export und Import der Datenbank und der Konfiguration.](screenshots/09-system-backup.png)

Es ist die richtige Methode für eine vollständige Sicherheitskopie oder um nach einer Neuinstallation auf demselben Computer alles wiederherzustellen.

*Wo die Datenbank lebt.* Die Datei `titan.db` wird in einem Systemordner aufbewahrt, getrennt vom Programm, sodass eine Neuinstallation sie nicht berührt. Sie finden sie unter Windows in `%APPDATA%\runtime-telegram-bot-titan-edition\`, unter Linux in `~/.config/runtime-telegram-bot-titan-edition/`. Sollte die Software eines Tages nicht mehr starten, können Sie `titan.db` von dort von Hand kopieren, um sie in Sicherheit zu bringen.

### 7.2 Das Format .rtb: einen Bot sicher verschieben
Um einen einzelnen Bot von einer Installation zur anderen zu bringen (zum Beispiel zu einem Kollegen in der Redaktion), gibt es **OmniSync**, das Format `.rtb` (Runtime Telegram Bot).

In den Bot-Einstellungen, im Abschnitt **Teilen**, erzeugt die Schaltfläche **Exportieren** eine `.rtb`-Datei: eine „digitale Kartusche“, die den Namen des Bots, alle seine Feeds (mit Filtern, Intervallen und Digests) und die Vorlagen enthält, aber nicht den Verlauf der bereits gesendeten Nachrichten. Wer sie erhält, lädt sie mit der Schaltfläche **Importieren** in der Bot-Spalte, dem Pfeilsymbol neben dem **+**.

Und der Token? Hier trifft Titan eine klare Sicherheitsentscheidung: Der Token reist in der Datei mit, aber verschlüsselt und an den Computer gebunden, der den Export erstellt hat. Deshalb:

-   **Auf demselben Computer** (zum Beispiel nach einer Neuinstallation) wird der Token wieder gelesen und wiederhergestellt, ohne dass Sie etwas tun.
-   **Auf einem anderen Computer** ist der Token aus Sicherheitsgründen nicht entschlüsselbar: Er kommt leer an und muss von Hand neu eingegeben werden, derselbe, den Sie von BotFather kopieren. Alles Übrige (Feeds, Vorlagen, Einstellungen) ist bereits an seinem Platz.

In der Praxis verschiebt das `.rtb` die Konfiguration bequem, aber das eigentliche Geheimnis lässt sich nicht durch Kopieren einer Datei stehlen: Es bleibt durch die Maschine geschützt, die es erzeugt hat.

*Hinweis für Linux.* Die Verschlüsselung des Tokens stützt sich auf den Schlüsselbund des Systems (GNOME Keyring, KWallet oder einen anderen Secret-Service-Dienst). Hat Ihre Distribution keinen, blockiert Titan nicht: Es verwendet eine interne Verschlüsselung, die ebenfalls an die Maschine gebunden ist. Um den nativen Schlüsselbund zu aktivieren, installieren Sie `libsecret`.

### 7.3 Alle Bots gemeinsam exportieren (Konfiguration)
Wenn Sie nicht einen Bot, sondern das gesamte Gefüge verschieben möchten, kehren Sie zur Registerkarte **Daten & Backup** zurück: Neben der Datenbank finden Sie den Export der **Konfiguration** im JSON-Format. Er funktioniert wie das `.rtb`, aber über alle Bots auf einmal: Er nimmt die Profile, Feeds und Vorlagen jedes einzelnen mit, stets ohne den Verlauf. Es gilt dieselbe Token-Regel wie oben: Auf demselben Computer stellt er sich von selbst wieder her, andernorts muss er neu eingegeben werden.

---
