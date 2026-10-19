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
*   **Target channel:** Enter the name of your channel (e.g., `@mychannel`). If it's a private channel, enter the numeric ID (e.g., `-100123456789`).
*   **Start date:** Choose a date. The bot **will ignore** all articles and videos published before this date, avoiding flooding your channel with old content.

## 3. Adding Sources
Once you are in the Dashboard:
1. Select the bot in the **Bots** list, on the left.
2. In the **Sources** panel, click **Add source**.
3. Enter the name (e.g. "My podcast") and choose the **Type**: Podcast, Articles or YouTube.
4. Paste the address:
   * for articles and podcasts, the URL of the RSS feed;
   * for YouTube, the channel address or its handle (e.g. `@RuntimeRadio`). No API key is needed.
5. Press **Test** to check that the address works, then **Add**.

Each source has its own switch (active or paused) and buttons to edit or delete it.

## 4. Customising Messages (Templates)
1. Under the bot's name, click **Bot settings**.
2. Open the **Messages** tab.
3. Use the **Title**, **Source name**, **Link** and **Summary** buttons to insert the variables `{{title}}`, `{{feedName}}`, `{{link}}` and `{{summary}}`.
4. You can use the basic HTML that Telegram accepts, for example `<b>Bold</b>`, `<i>Italic</i>`, or hide a long link behind text with `<a href="{{link}}">Click here</a>`.
5. **Preview** shows the message with sample data; below the field, a check flags straight away any tag Telegram would reject.

## 5. Starting Up
With the token entered and the sources added, all that is left is to start.
*   Click **Start the engine**, at the top right. There is a single engine and it works for every active bot.
*   Next to the button you see its status ("Engine running") and the time of the next check.
*   In the **Activity** panel, **Journal** view, follow scans, items found and items published. The **Console** view shows the full log.

---

### 💡 Useful Tips & Troubleshooting
*   **Publishing hours:** in *Bot settings → Schedule* choose when the bot may publish. If you set 08:00 to 22:00, overnight news is not lost: it waits in a queue and goes out at 08:00.
*   **YouTube errors:** if errors appear on YouTube channels, YouTube has usually changed something in its pages. Pause that source with its switch and check whether an application update is available.
*   **Changing PC:** to move a bot to another computer, do not copy the files: use *Bot settings → Advanced → Export*. The .rtb file carries the sources, filters, templates and publishing hours. The token does not travel: it is encrypted and tied to the originating computer, so on the new PC it must be re-entered by hand. On the new PC, double-clicking the .rtb file imports it.
*   **Easier reading:** in *Settings → Accessibility* you can enlarge the whole interface (also with **Ctrl +** and **Ctrl −**, **Ctrl 0** to go back to 100%) and reduce animations and effects.

---

**Runtime TelegramBot Desktop · Titan Edition** is free software, released under the **MIT Licence**: you may use it, study it, modify it and redistribute it.

Most of the code was written with language models (Google Gemini, Anthropic Claude). The concept, the design direction and the verification are Simone Pizzi's.

For the full treatment use the **Full manual (PDF)** button.

Contact: simonepizzi.runtimeradio.it/contatti
Voluntary donation: paypal.me/runtimeradio
