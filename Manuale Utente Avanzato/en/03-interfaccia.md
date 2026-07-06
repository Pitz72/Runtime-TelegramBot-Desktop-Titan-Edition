## Chapter 3: The User Interface (Dashboard)

### 3.1 Anatomy of the console
Once the Setup Wizard is done, and on every later launch, you are greeted by Titan's command console: a glassy-looking interface split down the middle (the 50/50 layout).

-   **Left half (configuration).** It holds the **Bot Selector** (the sidebar where you scroll through and select the bot profile to view) and the **Feed Manager**, that is, the list of sources tied to the selected bot. This is where you tell the software what to look for.
-   **Right half (operation).** The execution area: the **Ignition** button (the large central Play button that switches the engine on and off), the send counters and the black **System Logs** console, which shows line by line what the bot is doing in real time.

At the top of the right half, a bar shows the logo, the name and the installed version; on the right you will find the **online/offline** indicator (when a bot is selected) and the gear icon that opens the System Settings (Chapters 7 and 8).

![The command console with the engine running: bots on the left, sources in the centre, execution and logs on the right.](screenshots/03-dashboard-online.png)

*Tip.* Once you press Play it does not matter which bot you are looking at: with the engine running, Titan works in the background on **all** active bots at once. The selection on the left is only for you, to review that profile's configuration.

### 3.2 The "System Logs" panel
The log console, at the bottom right, is a direct mirror of the asynchronous engine. It stays in English even when the interface is in another language: that way the messages remain a universal technical standard, handy when you need to ask for support.

Messages are colour-coded for quick reading:

-   🟢 **Green (`Sent` / `Found New Item`):** a new item was found and sent to Telegram.
-   🟡 **Yellow/orange (`Skipped` / `FloodWait`):** the engine ignored an item (for example because it predates the *Start Date*) or Telegram asked for an anti-spam pause, which the bot handles on its own.
-   🔴 **Red (`Error` / `Failed`):** a critical error, such as a dropped connection, a wrong API Token or a change in YouTube's servers.
-   ⚪ **Grey/white (`Fetching` / `No updates`):** routine business. The bot is reading the source but has found nothing new since the last check.

The bar at the top of the panel offers three controls:

-   **ALL BOTS / THIS BOT:** filters the stream to show every bot or only the selected one, handy when you have many running at once.
-   **Export:** saves the whole trace to a `.txt` file, indispensable if you need to pass it to a technician for review.
-   **Clear:** empties the log view. It does not touch the send history, only what you see on screen.

![The System Logs console shows, line by line and in real time, what the engine is doing.](screenshots/14-log-console.png)

### 3.3 Reading the statistics
On either side of the ignition button the interface shows three numbers: **Today**, **7 Days** and **Total**. They refresh on their own every 30 seconds while the engine is running, and they count only the **messages successfully sent** for the selected bot.

Next to the Total there is a chart icon: open it for the detail panel. Beyond the same three numbers, it shows you the breakdown **per source**: which feed produced how many sends, from the busiest down. That way you can see at a glance which sources really feed the channel.

![The Detailed Statistics panel, with the breakdown of sends per source.](screenshots/07-stats-modal.png)

*Note.* If you use the **Clear History** button in the bot's settings, these counters also reset to zero: the send history is deleted.
