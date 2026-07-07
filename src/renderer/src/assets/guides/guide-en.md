# ⚡ Titan Desktop: Quick Start Guide

Welcome to **Runtime TelegramBot Titan Edition**. This quick guide will allow you to configure your first bot and start publishing content to your Telegram channel in less than 3 minutes.

---

## 1. Preparation: Get the Telegram Token
Before starting Titan, you must create a "Bot" on Telegram:
1. Open Telegram and search for the user **@BotFather** (it has a blue verification check).
2. Send the command `/newbot` and follow the instructions to give your bot a name.
3. At the end, @BotFather will give you an **API Token** (a long string like `123456789:ABCdefGHIjklMNOpqr...`). **Copy it and keep it safe.**
4. Add the newly created bot to your Telegram Channel as an **Administrator** (it must have the permission to "Post Messages").

## 2. The First Launch (Setup Wizard)
Launch Titan Desktop. If it's your first time, the 4-step wizard will appear:
*   **Bot Name:** Choose a name to recognize it (e.g., *News Channel*).
*   **Bot Token:** Paste the Token provided by @BotFather.
*   **Channel ID:** Enter the name of your channel (e.g., `@mychannel`). If it's a private channel, enter the numeric ID (e.g., `-100123456789`).
*   **Cutoff Date:** Choose a date. The bot **will ignore** all articles and videos published before this date, avoiding flooding your channel with old content.

## 3. Adding Sources (Feed Manager)
Once inside the Dashboard:
1. Make sure your bot is selected in the left column.
2. In the **Feed Sources** panel, click on **"+ Add Source"**.
3. Enter the Name (e.g., *My Podcast*) and select the **Type** (Podcast, News, or YouTube).
4. Paste the URL:
   * For News and Podcasts: paste the URL of the RSS feed.
   * For YouTube: You can directly paste the channel URL or the handle (e.g., `@RuntimeRadio`). *No API Keys needed!*
5. Use the **Test (⚡)** button to verify that the link is valid, then click on **Save**.

## 4. Customizing Messages (Templates)
Do you want your posts to be perfectly formatted?
1. Click on the **Settings (⚙️)** icon in the left column.
2. Navigate to the **Templates** tab.
3. Use the convenient button panel at the top to insert automatic variables like `{{title}}`, `{{link}}`, or `{{summary}}`.
4. You can use basic HTML tags supported by Telegram, for example: `<b>Bold</b>`, `<i>Italic</i>`, or hide a long link behind text using `<a href="{{link}}">Click here</a>`.

## 5. Ignition
Have you entered the token and added the feeds? You are ready.
*   Click the large **Play (▶)** button at the center of the console.
*   The ring will start rotating and the bot will start working.
*   In the **System Logs** panel, you will see in real-time the bot reading your sources and publishing new content to Telegram!

---

### 💡 Useful Tips & Troubleshooting
*   **Quiet Hours:** In the bot settings, you can define activity hours. If you set it from 08:00 to 22:00, night news will not be lost, but will be queued and published at 08:00 in the morning!
*   **YouTube Errors:** If you receive "red" errors on YouTube channels, don't panic. Google often updates its servers. Temporarily turn off the YouTube feed from the dedicated button in the interface and wait for our software update.
*   **Changing PC:** Do you need to move the bot to another computer? Don't copy the files! Use the **Export (.rtb)** function in the settings. This will generate a secure file to import into the new PC, keeping your passwords encrypted.

*For advanced assistance, refer to the Pro User Manual in PDF format.*
