## Kapitel 2: Installation und erster Start

### 2.1 Systemvoraussetzungen
Titan Edition ist schlank und läuft unter Windows und Linux:

-   **Windows:** Windows 10 oder höher (64 Bit).
-   **Linux:** Ubuntu 22.04+, Debian und Derivate über das Paket `.deb`; auf den übrigen Distributionen verwenden Sie das Format `.AppImage`, eigenständig und ohne Installation.

*Hinweis Linux:* Auf einigen neueren Ubuntu-Versionen benötigt das `.AppImage` das Paket `libfuse2`; wenn es nicht startet, installieren Sie es (`sudo apt install libfuse2`) oder verwenden Sie das `.deb`.

*Hinweis für VPS-Server:* Titan kann auch auf einem Virtual Private Server ohne dedizierte Grafikkarte laufen. Erscheint die Oberfläche beim Start nicht, erzwingt ein Sicherheitsmechanismus sie nach etwa zehn Sekunden (wir sprechen darüber in Kapitel 9).

### 2.2 Installation
Die Installation ist einfach.

1. Laden Sie die Datei herunter, die Ihnen Ihr Administrator bereitstellt, oder von der offiziellen Releases-Seite.
2. **Unter Windows:** Starten Sie die Datei `.exe` und folgen Sie den Anweisungen auf dem Bildschirm. Das Programm legt selbst eine Verknüpfung auf dem Desktop an.
3. **Unter Linux:** Mit dem Paket `.deb` doppelklicken Sie und überlassen den Rest der Paketverwaltung; beim `.AppImage` machen Sie die Datei ausführbar (Rechtsklick → Eigenschaften → Berechtigungen → Ausführen erlauben) und öffnen sie mit einem Doppelklick.

Nach der Installation müssen Sie nichts mehr von Hand herunterladen: Titan prüft selbst, ob eine neuere Version vorliegt, und meldet sich, sobald es eine findet, mit einem eigenen Bildschirm, der Sie fragt, ob sie heruntergeladen werden soll und, nach Abschluss des Downloads, ob zum Installieren neu gestartet werden soll.

![Der Hinweis auf ein verfügbares Update: Titan bittet um Bestätigung vor dem Herunterladen und vor dem Neustart.](screenshots/11-update-available.png)

### 2.3 Der Setup Wizard (erster Start)
Beim allerersten Start, nach der animierten Boot-Sequenz und der Sprachwahl, empfängt Sie Titan mit einem Einrichtungsassistenten (Setup Wizard) in vier Schritten, um Ihre erste Automatisierung gleich einzurichten.

![Der Einrichtungsassistent führt in vier Schritten durch die Einrichtung des ersten Bots.](screenshots/02-setup-wizard.png)

1.  **Bot-Name:** ein aussagekräftiger Name, der Ihnen hilft, das Profil in der Oberfläche zu erkennen (z. B. „Bot Sportnachrichten“). Er ist für Ihre Nutzer auf Telegram nicht sichtbar.
2.  **Bot-Token:** Fügen Sie hier den geheimen Token ein, der von `@BotFather` erzeugt wurde. *(Wie Sie ihn erhalten, wird in Kapitel 4.2 erklärt.)*
3.  **Kanal-ID (Channel ID):** der öffentliche Benutzername des Kanals, dem At-Zeichen vorangestellt (z. B. `@meinkanal`). Ist der Kanal privat, geben Sie seine numerische Kennung ein, die meist mit dem Minuszeichen beginnt (z. B. `-100123456789`).
4.  **Startdatum (Start Date):** ein wichtiger Parameter. Standardmäßig ist es das heutige Datum: Titan liest Ihre Feeds trotzdem, **ignoriert und verwirft** jedoch jede Nachricht oder jedes Video, das vor diesem Datum veröffentlicht wurde. Das verhindert, dass der Bot beim ersten Start den Kanal mit wochenalten Nachrichten überschwemmt.

Nach Abschluss der vier Schritte klicken Sie auf **Titan Starten**: Sie landen auf der Hauptschaltzentrale.

---
