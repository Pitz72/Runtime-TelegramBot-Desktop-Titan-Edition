## Kapitel 2: Installation und erster Start

### 2.1 Systemvoraussetzungen
Titan Edition ist schlank und läuft unter Windows und Linux:

-   **Windows:** Windows 10 oder höher (64 Bit).
-   **Linux:** Ubuntu 22.04+, Debian und Derivate über das Paket `.deb`; auf den übrigen Distributionen verwenden Sie das Format `.AppImage`, eigenständig und ohne Installation.

*Hinweis Linux:* Auf einigen neueren Ubuntu-Versionen benötigt das `.AppImage` das Paket `libfuse2`; wenn es nicht startet, installieren Sie es (`sudo apt install libfuse2`) oder verwenden Sie das `.deb`.

*Hinweis für VPS-Server:* Titan kann auch auf einem Virtual Private Server ohne dedizierte Grafikkarte laufen. Erscheint die Oberfläche beim Start nicht, erzwingt ein Sicherheitsmechanismus sie nach etwa zehn Sekunden (wir sprechen darüber in Kapitel 9).

### 2.2 Installation
Die Installation ist einfach.

1. Laden Sie das Installationsprogramm von der Releases-Seite des Projekts herunter. Alternativ können Sie es selbst aus dem Quellcode bauen.
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

### 2.4 Der Begrüßungsbildschirm: Sprache, Anleitung und Handbuch
Der Bildschirm mit den acht Flaggen gehört nicht nur zum ersten Start: Er kehrt bei jedem Start zurück, und dort wählen Sie die Sprache der Oberfläche, die sofort wechselt. Die Schaltfläche **Titan Starten** führt Sie hinein.

Unter dieser Schaltfläche liegen drei Verknüpfungen:

-   **Kurzanleitung** öffnet auf dem Bildschirm eine Zusammenfassung von wenigen Seiten, in der gewählten Sprache: wie man den Token von @BotFather erhält, die vier Schritte des Assistenten, wie man eine Quelle hinzufügt, wie man die Nachrichten anpasst und wie man den Motor startet. Sie richtet sich an alle, die sofort loslegen wollen, ohne dieses Handbuch zu lesen.
-   **Handbuch herunterladen (PDF)** öffnet im Systembrowser das vollständige Handbuch — das, welches Sie gerade lesen — in Ihrer Sprache. Die Datei steckt nicht in der Anwendung: Sie wird im selben Moment aus dem Netz geholt, eine aktive Verbindung ist also nötig.
-   **Projekt unterstützen** öffnet die Seite für eine freiwillige Spende. Titan ist kostenlos und quelloffen: Die Spende ist freiwillig und schaltet nichts frei.

Die beiden Einträge zur Dokumentation finden Sie auch in den Systemeinstellungen, in der Registerkarte **Allgemein** (Kapitel 8.2).

### 2.5 Nach einem Update: der Bildschirm „Neuigkeiten“
Wenn sich Titan aktualisiert hat, zeigt der erste Start der neuen Version eine bildschirmfüllende Seite mit dem, was sich geändert hat: Korrekturen, neue Funktionen, geänderte Verhaltensweisen. Die Versionsnummer steht im Vordergrund, die Liste ist in Ihrer Sprache, und die Schaltfläche **Weiter** schließt sie.

Sie erscheint einmal pro Version: einmal geschlossen, sehen Sie sie erst beim nächsten Update wieder. Bringt eine Version keine eigene Liste mit, tritt an ihre Stelle eine allgemeine Zeile, die Korrekturen und Stabilitätsverbesserungen meldet.


---
