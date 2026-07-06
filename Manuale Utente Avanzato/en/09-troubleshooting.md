## Chapter 9: Troubleshooting

Here are the most common problems and how to get out of them, in problem-and-solution form.

**The window is blank at launch.** This happens rarely, and almost only on virtual machines or computers without an up-to-date graphics card. Wait about ten seconds: Titan has a safety net that, if the interface does not appear on its own, forces it anyway. If it stays blank, reinstall the application over the old one: you lose no data, because the database is kept in a system folder separate from the program (the exact path is in Chapter 7).

**I added a YouTube feed and the logs read "Cannot read properties…".** The link between Titan and YouTube (*InnerTube*) is not official: it reads the pages the way a browser would. Every so often Google changes the code of its pages and throws this reading off. The error appears in the log and the dashboard flags it with a notification. In the meantime, disable the offending YouTube channel and wait for an update: Titan updates itself (Chapter 2) and the problem usually gets fixed at the root. Your News and Podcasts, meanwhile, keep working fine.

**The bot reports "Bad Request: chat not found".** The Channel ID is wrong, or, more often, you forgot to add the bot to the channel's **Administrators**. Fix it: open the Telegram channel settings, add the bot as an administrator and give it permission to send messages. The error disappears (see also Chapter 4).

**The bot publishes the news but the image shows up as a small square instead of a large preview.** This is Telegram's normal behaviour when the RSS source contains no large image, only a thumbnail. Titan looks for the image at the highest resolution it can find, going so far as to dig into the article text, but if the source does not have a suitable one, Telegram falls back to the thumbnail. To fix it you have to act on the site that publishes the feed, not on the bot.
