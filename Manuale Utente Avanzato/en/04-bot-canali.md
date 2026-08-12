## Chapter 4: Managing Bots and Channels

### 4.1 Creating multiple bots
Titan is multi-channel: you can run several bots from the same window, each with its own channel. Say you run a radio station: you need one Telegram channel for written news (News), one for audio episodes (Podcast) and maybe a third for behind-the-scenes (YouTube). You do not have to install the program three times.

At the top of the bot column, on the right, there is a small cluster of controls. The **+** opens a quick form: enter Name, Token, Channel ID and Start From Date, save, and the new profile appears in the list. Next to the **+** you will also find the button to **import** a bot from a `.rtb` file (Chapter 7) and the sliders button (🎚️) that opens its **settings** (Chapter 6).

Each profile lives on its own: feeds, schedules and templates are separate. When you press Play, Titan orchestrates all the active bots in a single work cycle, serving them in rotation.

![The Bot Selector: each profile shows its name, channel and online/offline status.](screenshots/12-bot-selector.png)

### 4.2 Getting the Token from @BotFather
The **Bot Token** is the "house key" that lets the software talk to Telegram's servers. To get one you need Telegram, on your phone or your computer:

1. In Telegram's search box type `BotFather` and open the official profile, recognisable by the blue verification tick.
2. Press **Start** and send the `/newbot` command.
3. BotFather first asks for a "Name" (what users will read), then a unique "Username" that must end in the word *bot* (for example `myradio_news_bot`).
4. If the username is free, BotFather replies with a congratulations message containing a long alphanumeric string, under the heading *Use this token to access the HTTP API*.
5. Copy that string: it is the token to paste into Titan.

**Important.** Never share the Token. Titan stores it encrypted, tied to this computer through the operating system's keychain: so, even by copying the program's files to another machine, the token stays unreadable. To actually move it to another PC there is the `.rtb` format, explained in Chapter 7.

### 4.3 Finding the correct Channel ID
To publish, the bot must know *where* to send the messages: that is the **Channel ID**.

-   **Public channels.** This is the simplest case. If the channel has a link like `t.me/mychannel`, the Channel ID is `@mychannel`. You do not even need to be precise: Titan cleans up whatever you paste, stripping the `https://` and `t.me/` prefix and adding the at sign if it is missing. So `https://t.me/mychannel`, `t.me/mychannel` and `mychannel` all end up as `@mychannel`.
-   **Private channels.** They have no public name: they are identified by a numeric string assigned by Telegram, which usually begins with a minus sign (for example `-1002345678912`). To obtain it, forward a message from the channel to a free service bot such as `@getidsbot`, which replies with the chat's exact numeric code. This number is pasted in as-is.

*Golden rule.* Once the channel is created and the ID obtained, and **before starting the bot**, go into the Telegram channel settings, open **Administrators**, find your bot and add it with permission to send messages. If the bot is not an administrator (or the ID is wrong) it has no way to write in the channel: a red Telegram error will appear in the logs (we look at them in Chapter 9) and nothing will be published.
