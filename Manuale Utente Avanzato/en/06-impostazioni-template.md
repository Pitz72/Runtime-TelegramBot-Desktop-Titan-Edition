## Chapter 6: Advanced Settings and Templates

The settings for each bot open from the sliders icon (🎚️) next to its name, in the left-hand column. The window has two tabs: **General** (the bot's parameters) and **Templates** (the look of the messages).

### 6.1 Check interval and notifications
In the **General** tab, besides the data you already know (Name, Token, Channel ID, Start From Date), there are two settings that shape the bot's behaviour:

-   **Check Interval.** A slider from 1 to 120 minutes (15 by default) that sets how often the bot goes to check the feeds. It is the baseline rhythm; if a single source needs a different pace, you give it one from the Feed Manager (Chapter 5).
-   **Notifications.** A switch: when it is on, Titan pops up a system alert (a desktop notification) on every successful publication. If you run very busy channels and do not want to be alerted on every post, turn it off.

Next to the Token field, an eye icon lets you show or hide it while you paste it.

![The General tab of the bot settings: check interval, notifications and active hours.](screenshots/04-bot-settings-general.png)

### 6.2 Quiet hours (Active Hours)
Foreign newspapers and international creators often publish in the dead of night, and a push notification at three in the morning pleases no one. Quiet hours are there for exactly this.

Still in the **General** tab, the **Active Hours** section has two fields: **From** (e.g. 08:00) and **To** (e.g. 22:00). By default the window runs from 00:00 to 23:59, that is, no silence: it is up to you to narrow it.

-   *Outside the window.* The engine does not stop: it keeps checking RSS and YouTube feeds all night, so as not to miss anything. Only, instead of sending right away, it sets the content aside in a **persistent** waiting queue, saved to disk. Even if you switch the computer off, the queue is still there when you restart.
-   *When it reopens.* As soon as the clock re-enters the allowed window, the bot works through everything it has accumulated in chronological order, publishing one post every 3 seconds until the queue is empty.

This way your automations respect the audience's rest and the content arrives in the morning, when it has the best chance of being read.

### 6.3 Template editor and Smart Chips
By default Titan publishes with a clean but standard layout. If you want to give the messages your own editorial line (an emoji as a logo, the links laid out your way), open the **Templates** tab.

You will find four separate text areas, one per format: **Startup**, **News**, **Podcast**, **YouTube**. They are written in the **HTML that Telegram supports**: the useful tags are `<b>` (bold), `<i>` (italic), `<code>` (monospace) and `<a href="...">` (link).

![The Templates tab with the editor, the Smart Chips for variables and the message preview.](screenshots/05-bot-settings-templates.png)

Above each area, the **Smart Chips** buttons insert the dynamic variables, which the bot will replace with the real data at send time:

-   `{{title}}`: the title of the article or video.
-   `{{feedName}}`: the name you gave the source in the Feed Manager (for example *Press Review*).
-   `{{link}}`: the address of the article.
-   `{{summary}}`: a short preview of the text (at most 300 characters).

*Clean text.* Do not worry about what comes in from the feeds: Titan strips the source's HTML tags (images, tables, paragraphs) and neutralises special characters before sending, so a "dirty" article cannot break the message.

Two tools help you avoid mistakes:

-   **Preview.** The eye-shaped button shows how the message will look, with sample data in place of the variables, without leaving the editor.
-   **Validator.** As you type, Titan flags problems in real time: unbalanced tags, non-existent variables, unsafe links. The border of the area turns red for errors, yellow for warnings.

*Clean links.* Telegram can hide long links inside the text. Instead of "Click here: {{link}}", write `<a href="{{link}}">Read the article</a>`: the user will see only the blue clickable phrase.

### 6.4 The Danger Zone: resetting the history
At the bottom of the **General** tab there is a red section, the *Danger Zone*. The **Clear History** button is powerful and destructive: it wipes the bot's memory, that is, everything it has already published.

-   *When it helps.* If you have accidentally deleted many messages from the channel and want the bot to republish the latest stories to rebuild the board.
-   *How to use it without disaster.* If you clear the history and press Play, the bot treats everything it finds in the feeds as "new" and sends it in bulk, flooding the channel. To avoid this, after clearing, set the **Start From Date** (in the same tab) back to today: that way the bot forgets the past but publishes only from today onwards.

Clearing the history also resets the statistics counters to zero (Chapter 3). Next to the Danger Zone you will also find the bot export in `.rtb` format, which we cover in Chapter 7.
