# ⚡ Runtime TelegramBot Desktop · Titan Edition: quick guide

Welcome to **Runtime TelegramBot Desktop · Titan Edition**. This quick guide takes you from setting up your first bot to your first publication on your Telegram channel.

---

## 1. Preparation: Get the Telegram Token
Before starting Titan, you must create a "Bot" on Telegram:
1. Open Telegram and search for the user **@BotFather** (it has a blue verification check).
2. Send the command `/newbot` and follow the instructions to give your bot a name.
3. At the end, @BotFather will give you an **API Token** (a long string like `123456789:ABCdefGHIjklMNOpqr...`). **Copy it and keep it safe.**
4. Add the newly created bot to your Telegram Channel as an **Administrator** (it must have the permission to "Post Messages").

## 2. The First Launch (Setup Wizard)
Launch Titan. If it is your first time, the four-step wizard will appear:
*   **Bot Name:** Choose a name to recognise it (e.g. "News Channel").
*   **Bot Token:** Paste the Token provided by @BotFather.
*   **Channel ID:** Enter the name of your channel (e.g., `@mychannel`). If it's a private channel, enter the numeric ID (e.g., `-100123456789`).
*   **Start From Date:** Choose a date. The bot **will ignore** all articles and videos published before this date, avoiding flooding your channel with old content.

## 3. Adding Sources (Feed Manager)
Once inside the Dashboard:
1. Make sure your bot is selected in the left column.
2. In the **Feed Sources** panel, click on **Add Source**.
3. Enter the Name (e.g. "My Podcast") and select the **Type** (Podcast, News or YouTube).
4. Paste the URL:
   * For News and Podcasts: paste the URL of the RSS feed.
   * For YouTube: you can paste the channel URL or the handle directly (e.g. `@RuntimeRadio`). No API key is needed.
5. Use the **Test (⚡)** button to verify that the link is valid, then click on **Save**.

## 4. Customising Messages (Templates)
1. Click the sliders icon (🎚️) next to the bot's name, in the left column.
2. Navigate to the **Templates** tab.
3. Use the **Smart Chips** buttons at the top to insert variables such as `{{title}}`, `{{link}}` or `{{summary}}`.
4. You can use basic HTML tags supported by Telegram, for example: `<b>Bold</b>`, `<i>Italic</i>`, or hide a long link behind text using `<a href="{{link}}">Click here</a>`.

## 5. Ignition
With the token entered and the sources added, all that is left is to start.
*   Click the large **Play (▶)** button at the centre of the console.
*   The ring will start rotating and the bot will start working.
*   In the **System Logs** panel, you will see the bot reading your sources and publishing new content to Telegram in real time.

---

### 💡 Useful Tips & Troubleshooting
*   **Quiet Hours:** In the bot settings, you can define activity hours. If you set it from 08:00 to 22:00, night news is not lost: it stays queued and is published at 08:00.
*   **YouTube errors:** if "red" errors appear on YouTube channels, Google has usually changed the code of its pages. Pause that feed from the switch next to the source and wait for an application update.
*   **Changing PC:** to move a bot to another computer, do not copy the files: use **Export (.rtb)** in the bot's settings. The file carries the sources, filters and templates. The token does not travel: it is encrypted and tied to the originating computer, so on the new PC it must be re-entered by hand.

---

**Runtime TelegramBot Desktop · Titan Edition** is free software, released under the **MIT Licence**: you may use it, study it, modify it and redistribute it.

Most of the code was written with language models (Google Gemini, Anthropic Claude). The concept, the design direction and the verification are Simone Pizzi's.

For the full treatment use the **Download Manual (PDF)** button.

Contact: simonepizzi.runtimeradio.it/contatti
Voluntary donation: paypal.me/runtimeradio
