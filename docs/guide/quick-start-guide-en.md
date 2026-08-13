# Runtime TelegramBot Desktop · Titan Edition — Quick Start Guide

Welcome to **Runtime TelegramBot Desktop · Titan Edition**. This guide will help you set up your first bot and start publishing content to your Telegram channel in just a few minutes.

---

## 1. Get Your Telegram Token

Before launching the app, you need to create a bot on Telegram:

1. Open Telegram and search for **@BotFather** (it has the blue checkmark).
2. Send the `/newbot` command and follow the instructions to assign a name to your bot.
3. @BotFather will return an **API Token** (e.g. `123456789:ABCdefGHIjklMNOpqr...`). Copy it.
4. Add the bot to your Telegram channel as an **Administrator** with permission to send messages.

---

## 2. First Launch — Bot Configuration

On first launch, click the **+** at the top of the bot column and fill in the fields:

- **Name** — a name to identify the bot in the interface (e.g. *News Channel*).
- **Token** — the API Token provided by @BotFather.
- **Channel ID** — the channel name (e.g. `@mychannel`) or the numeric ID for private channels (e.g. `-100123456789`).
- **Start From Date** — the bot will ignore all content published before this date. Useful to avoid flooding the channel with old articles.

---

## 3. Adding Feeds (Feed Manager)

Select the bot on the left, then in the **Feed Sources** panel click **Add Source**:

1. Assign a descriptive **Name** to the feed.
2. Select the **Type**: News, Podcast, or YouTube.
3. Paste the **URL**:
   - News / Podcast: the RSS feed URL.
   - YouTube: the channel URL or handle (e.g. `@RuntimeRadio`). *No API Key required.*
4. Use **Test (⚡)** to verify the link is valid, then **Save**.

### Advanced feed options

- **Keyword filter** — publishes only articles containing certain words, or discards those containing others. An amber badge signals that the filter is active.
- **Custom interval** — gives this source a check rhythm of its own (from 5 minutes to 24 hours), separate from the bot's.
- **Digest** — instead of publishing each article as it appears, accumulates content (1 hour, 6, 12, 24 hours or 7 days) and sends it in a single summary message, up to 20 at a time. A purple badge signals that the digest is active.
- **OPML import** — imports in bulk every source held in an `.opml` file, with the OPML button at the top of the Feed Manager.

---

## 4. Customising Messages (Templates)

Go to bot settings → **Templates** tab:

- Use **Smart Chips** to insert dynamic variables: `{{title}}`, `{{link}}`, `{{summary}}`, `{{feedName}}`, etc.
- Four separate templates are available: Startup, News, Podcast, YouTube.
- The **Validator** flags errors in real time (unbalanced tags, unknown chips, unsafe links).
- The **Preview** button shows how the message will look with sample data, without leaving the editor.

Telegram-supported HTML tags: `<b>`, `<i>`, `<code>`, `<a href="...">`.

---

## 5. Starting — Ignition

Once the bot is configured and feeds have been added:

- Click the **Play (▶)** button in the console.
- The status ring will start spinning and the bot will go live.
- In the **System Logs** panel you will see feed fetching and Telegram publishing in real time.

To monitor multiple bots simultaneously, use the **ALL BOTS / THIS BOT** toggle in the log.

---

## 6. Statistics

Click the chart icon next to the **Total** to open **Detailed Statistics**:

- Published article counters: today / last 7 days / total.
- Breakdown by feed, sorted by publication volume.

---

## System Settings

Accessible from the gear icon in the top right:

- **General** — interface language, update check, documentation, credits and donation.
- **Data & Backup** — database export and restore.
- **Performance** — turns off the heaviest graphical effects (scanlines, blurs, glows, animations). Useful on slower machines; it takes effect at once, with no restart.

Check interval and quiet hours are not here: they belong to the individual bot, on the **General** tab of its settings.

---

## Portability — .rtb File

To move a bot to another computer without losing the configuration:

1. In bot settings → **Export (.rtb)**.
2. Transfer the file to the new PC.
3. On the new PC → **Import (.rtb)** and re-enter the token by hand: for security the token is tied to the computer that created the export and cannot be decrypted elsewhere. Everything else arrives already configured.

---

## Troubleshooting

- **YouTube errors** — Google periodically updates its servers. If red errors appear on YouTube feeds, temporarily disable the feed and wait for an app update.
- **Invalid token** — Verify that the bot has been added to the channel as an administrator with permission to send messages.
- **Linux without libsecret** — The app works normally using the AES-256-GCM fallback. For the native keychain install: `sudo apt-get install libsecret-1-0`.

---

**Runtime TelegramBot Desktop · Titan Edition** is free software, released under the **MIT Licence**: you may use it, study it, modify it and redistribute it.

Most of the code was written with language models (Google Gemini, Anthropic Claude). The concept, the design direction and the verification are Simone Pizzi's.

For the full treatment see the **Advanced User Manual** in PDF, available in Italian and English.

Contact: simonepizzi.runtimeradio.it/contatti
Voluntary donation: paypal.me/runtimeradio
