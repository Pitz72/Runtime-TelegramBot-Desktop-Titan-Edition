## Kapitel 1: Einführung und Grundbegriffe

### 1.1 Was ist Titan Edition?
Willkommen bei **Runtime TelegramBot Titan Edition**. Es ist kein simples „Skript“, das Links kopiert und einfügt: Es ist ein Werkzeug zur redaktionellen Automatisierung, das Ihre Quellen (RSS-Feeds, Podcasts, YouTube-Kanäle) liest und die neuen Inhalte in Ihrem Telegram-Kanal veröffentlicht, ohne dass Sie sie von Hand verfolgen müssen.

Es ist für alle gedacht, die Communitys, Redaktionen, Radiosender oder YouTube-Kanäle betreiben und Inhalte zeitnah und kontinuierlich verteilen müssen.

Der Unterschied zu kommerziellen Cloud-Diensten liegt darin, wo es läuft. Jene leben auf fremden Servern, oft mit einem Monatsabo und einer Obergrenze für die Zahl der Nachrichten, die Sie senden können. Titan läuft **lokal**, auf Ihrem Computer oder Ihrem Server: Ihre Daten und Ihre Zugangsdaten bleiben auf Ihrer Maschine, Sie zahlen keine Gebühr und kein kommerzieller Plan begrenzt die Zahl der Sendungen. Es bleiben nur die üblichen Anti-Spam-Grenzen von Telegram, die Titan selbst verwaltet.

![Der Willkommensbildschirm, der den Benutzer beim Start von Titan Edition empfängt.](screenshots/01-intro-welcome.png)

### 1.2 Das Ökosystem „unter der Haube“
Um es optimal zu nutzen, genügt es, zwei Konzepte zu erfassen, wie Titan mit Informationen umgeht.

-   **Asynchrone Engine (Producer-Consumer).** Titan hält zwei Aufgaben getrennt: Die eine lädt fortlaufend die Artikel aus Ihren Quellen herunter, die andere formatiert sie und sendet sie an Telegram. So hält der Download nie an, um auf den Versand zu warten, und der Versand hält die Pausen ein, die Telegram vorschreibt, um Sie nicht als Spam zu blockieren, das sogenannte *FloodWait*.
-   **Die Datenbank und das „Gedächtnis“ des Bots.** Jedes Mal, wenn er einen Artikel oder ein Video veröffentlicht, berechnet Titan einen digitalen Fingerabdruck (einen MD5-Hash) und trägt ihn in seine interne Datenbank ein. Es ist dieses Gedächtnis, das ihn daran hindert, dieselbe Nachricht zweimal zu veröffentlichen, selbst wenn Sie den Computer zwei Tage lang ausschalten und wieder einschalten.

---
