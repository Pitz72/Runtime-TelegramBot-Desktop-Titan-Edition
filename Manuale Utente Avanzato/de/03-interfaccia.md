## Kapitel 3: Die Benutzeroberfläche (das Dashboard)

### 3.1 Anatomie der Konsole
Nach Abschluss des Setup Wizard, und bei jedem weiteren Start, empfängt Sie die Schaltzentrale von Titan: eine Oberfläche in Glasoptik, in zwei Hälften geteilt (das 50/50-Layout).

-   **Linke Hälfte (Konfiguration).** Sie beherbergt den **Bot Selector** (die Seitenleiste, in der Sie das anzuzeigende Bot-Profil durchblättern und auswählen) und den **Feed Manager**, also die Liste der Quellen, die dem ausgewählten Bot zugeordnet sind. Hier sagen Sie der Software, wonach sie suchen soll.
-   **Rechte Hälfte (Betrieb).** Der Ausführungsbereich: die Schaltfläche **Ignition** (die große zentrale Play-Taste, die die Engine ein- und ausschaltet), die Sendezähler und die schwarze Konsole der **Systemprotokolle** (System Logs), die Zeile für Zeile zeigt, was der Bot in Echtzeit tut.

Oben in der rechten Hälfte zeigt eine Leiste das Logo, den Namen und die installierte Version; rechts finden Sie die Anzeige **online/offline** (wenn ein Bot ausgewählt ist) und das Zahnradsymbol, das die Systemeinstellungen öffnet (Kapitel 7 und 8).

![Die Schaltzentrale bei laufender Engine: die Bots links, die Quellen in der Mitte, Ausführung und Protokolle rechts.](screenshots/03-dashboard-online.png)

*Tipp.* Sobald Play gedrückt ist, spielt es keine Rolle, welchen Bot Sie gerade betrachten: bei laufender Engine arbeitet Titan im Hintergrund an **allen** aktiven Bots zugleich. Die Auswahl links dient nur Ihnen, um die Konfiguration dieses Profils einzusehen.

### 3.2 Das Panel „Systemprotokolle“
Die Protokollkonsole, unten rechts, ist das direkte Spiegelbild der asynchronen Engine. Sie bleibt auf Englisch, auch wenn die Oberfläche in einer anderen Sprache ist: So bleiben die Meldungen ein universeller technischer Standard, praktisch, wenn Sie Unterstützung anfordern müssen.

![Die Konsole der Systemprotokolle zeigt in Echtzeit, Zeile für Zeile, was die Engine tut.](screenshots/14-log-console.png)

Die Meldungen sind zum schnellen Lesen farblich codiert:

-   🟢 **Grün (`Sent` / `Found New Item`):** ein neues Element wurde gefunden und an Telegram gesendet.
-   🟡 **Gelb/Orange (`Skipped` / `FloodWait`):** die Engine hat ein Element übersprungen (etwa weil es vor dem *Stichtag* liegt) oder Telegram hat eine Anti-Spam-Pause verlangt, die der Bot selbst handhabt.
-   🔴 **Rot (`Error` / `Failed`):** ein kritischer Fehler, etwa eine unterbrochene Verbindung, ein falscher API-Token oder eine Änderung an den YouTube-Servern.
-   ⚪ **Grau/Weiß (`Fetching` / `No updates`):** normaler Betrieb. Der Bot liest die Quelle, hat aber seit der letzten Prüfung nichts Neues gefunden.

Die Leiste oben im Panel bietet drei Befehle:

-   **Alle / Dieser Bot:** filtert den Strom und zeigt alle Bots oder nur den ausgewählten, praktisch, wenn Sie viele zugleich aktiv haben.
-   **Exportieren:** speichert das gesamte Protokoll in einer `.txt`-Datei, unverzichtbar, wenn Sie es einem Techniker zur Prüfung übergeben müssen.
-   **Leeren:** leert die Protokollansicht. Der Sendeverlauf bleibt unberührt, nur das, was Sie auf dem Bildschirm sehen.

### 3.3 Die Statistiken verstehen
Zu beiden Seiten der Einschalttaste zeigt die Oberfläche drei Zahlen: **Heute (Today)**, **7 Tage (Week)** und **Gesamt (Total)**. Sie aktualisieren sich alle 30 Sekunden von selbst, während die Engine läuft, und zählen nur die **erfolgreich gesendeten Nachrichten** des ausgewählten Bots.

Neben Gesamt befindet sich ein Diagrammsymbol: Öffnen Sie es für das Detailpanel. Neben denselben drei Zahlen zeigt es Ihnen die Aufschlüsselung **nach Quelle**: welcher Feed wie viele Sendungen erzeugt hat, vom aktivsten abwärts. So sehen Sie auf einen Blick, welche Quellen den Kanal wirklich speisen.

![Das Detailpanel der Statistiken, mit der Aufschlüsselung der Sendungen nach Quelle.](screenshots/07-stats-modal.png)

*Hinweis.* Wenn Sie die Schaltfläche **Verlauf Löschen** (Clear History) in den Bot-Einstellungen verwenden, kehren auch diese Zähler auf null zurück: Der Sendeverlauf wird gelöscht.

---
