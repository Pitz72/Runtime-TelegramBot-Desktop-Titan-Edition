# Runtime TelegramBot — Schnellstartanleitung

Willkommen bei **Runtime TelegramBot** (Titan Edition). Diese Anleitung hilft dir, deinen ersten Bot einzurichten und in wenigen Minuten Inhalte auf deinem Telegram-Kanal zu veröffentlichen.

---

## 1. Telegram-Token erhalten

Bevor du die App startest, musst du einen Bot auf Telegram erstellen:

1. Öffne Telegram und suche nach **@BotFather** (er hat das blaue Häkchen).
2. Sende den Befehl `/newbot` und folge den Anweisungen, um dem Bot einen Namen zu geben.
3. @BotFather gibt dir einen **API-Token** zurück (z. B. `123456789:ABCdefGHIjklMNOpqr...`). Kopiere ihn.
4. Füge den Bot als **Administrator** zu deinem Telegram-Kanal hinzu, mit der Berechtigung Nachrichten zu senden.

---

## 2. Erster Start — Bot-Konfiguration

Beim ersten Start klicke auf **„+ Neuer Bot“** und fülle die Felder aus:

- **Name** — ein Name, um den Bot in der Oberfläche zu erkennen (z. B. *Nachrichtenkanal*).
- **Token** — der von @BotFather bereitgestellte API-Token.
- **Channel ID** — der Kanalname (z. B. `@meinkanal`) oder die numerische ID für private Kanäle (z. B. `-100123456789`).
- **Stichtag** — der Bot ignoriert alle Inhalte, die vor diesem Datum veröffentlicht wurden. Nützlich, um den Kanal nicht mit alten Artikeln zu überfluten.

---

## 3. Feeds hinzufügen (Feed Manager)

Klicke im Bot-Dashboard auf **„+ Feed hinzufügen“**:

1. Weise dem Feed einen beschreibenden **Namen** zu.
2. Wähle den **Typ**: News, Podcast oder YouTube.
3. Füge die **URL** ein:
   - News / Podcast: URL des RSS-Feeds.
   - YouTube: Kanal-URL oder Handle (z. B. `@RuntimeRadio`). *Kein API-Key erforderlich.*
4. Verwende **Test (⚡)**, um die Gültigkeit des Links zu prüfen, dann **Speichern**.

### Erweiterte Feed-Optionen

- **Keyword-Filter** — Filtert Artikel nach einzuschließenden oder auszuschließenden Schlüsselwörtern. In den Feed-Einstellungen aktivierbar. Ein bernsteinfarbenes Badge zeigt den aktiven Filter an.
- **Benutzerdefiniertes Intervall** — Setzt ein individuelles Abrufintervall für den Feed (von 5 Minuten bis 24 Stunden), unabhängig vom globalen Bot-Intervall.
- **Digest Mode** — Anstatt jeden Artikel einzeln zu veröffentlichen, sammelt es Inhalte über ein konfigurierbares Intervall (1h, 6h, 12h, 24h, 7T) und sendet sie in einer einzigen Zusammenfassung. Ein violettes Badge zeigt den aktiven Modus an.
- **OPML-Import** — Importiert mehrere Feeds gleichzeitig aus einer Standard-`.opml`-Datei über die OPML-Schaltfläche im Feed Manager.

---

## 4. Nachrichten anpassen (Template)

Gehe in die Bot-Einstellungen → Reiter **Template**:

- Verwende **Smart Chips**, um dynamische Variablen einzufügen: `{{title}}`, `{{link}}`, `{{summary}}`, `{{feedName}}`, usw.
- Es stehen 4 separate Templates zur Verfügung: Start, News, Podcast, YouTube.
- Der **Validator** meldet Fehler in Echtzeit (nicht ausgeglichene Tags, unbekannte Chips, unsichere Links).
- Die Schaltfläche **Vorschau** zeigt, wie die Nachricht mit Beispieldaten aussehen wird, ohne den Editor zu verlassen.

Von Telegram unterstützte HTML-Tags: `<b>`, `<i>`, `<code>`, `<a href="...">`.

---

## 5. Start — Ignition

Wenn der Bot konfiguriert und die Feeds hinzugefügt wurden:

- Klicke auf die Schaltfläche **Play (▶)** in der Konsole.
- Der Statusring beginnt sich zu drehen und der Bot geht in Betrieb.
- Im **System Logs**-Panel siehst du in Echtzeit den Feed-Abruf und die Veröffentlichung auf Telegram.

Um mehrere Bots gleichzeitig zu überwachen, verwende den Toggle **ALL BOTS / THIS BOT** im Log.

---

## 6. Statistiken

Klicke auf das **Analytics (📊)**-Symbol im Dashboard:

- Zähler für veröffentlichte Artikel: heute / letzte 7 Tage / gesamt.
- Aufschlüsselung nach Feed, sortiert nach Veröffentlichungsvolumen.

---

## Systemeinstellungen

Über das Zahnrad-Symbol oben rechts erreichbar:

- **Allgemein** — globales Prüfintervall, ruhige Stunden, Sprache.
- **Backup** — Datenbankexport und -wiederherstellung.
- **Performance Mode** — deaktiviert GPU-intensive Effekte (Scanlines, Blur, Glow, Animationen). Nützlich auf Geräten mit eingeschränkter Hardware. Sofort wirksam ohne Neustart.

---

## Portabilität — .rtb-Datei

Um einen Bot auf einen anderen Computer zu übertragen ohne die Konfiguration zu verlieren:

1. In den Bot-Einstellungen → **Exportieren (.rtb)**.
2. Übertrage die Datei auf den neuen PC.
3. Auf dem neuen PC → **Importieren (.rtb)** und gib den Token erneut ein (Tokens sind aus Sicherheitsgründen maschinenspezifisch).

---

## Fehlerbehebung

- **YouTube-Fehler** — Google aktualisiert regelmäßig seine Server. Wenn rote Fehler bei YouTube-Feeds auftreten, deaktiviere den Feed vorübergehend und warte auf ein App-Update.
- **Ungültiger Token** — Überprüfe, dass der Bot dem Kanal als Administrator mit der Berechtigung zum Senden von Nachrichten hinzugefügt wurde.
- **Linux ohne libsecret** — Die App funktioniert normal mit dem AES-256-GCM-Fallback. Für den nativen Schlüsselbund installiere: `sudo apt-get install libsecret-1-0`.

---

*Die vollständige Anleitung findest du im Benutzerhandbuch im PDF-Format.*
