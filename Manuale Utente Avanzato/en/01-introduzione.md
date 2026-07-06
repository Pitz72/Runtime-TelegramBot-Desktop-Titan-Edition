## Chapter 1: Introduction and Core Concepts

### 1.1 What is Titan Edition?
Welcome to **Runtime TelegramBot Titan Edition**. It is not a simple "script" that copies and pastes links: it is an editorial automation tool that reads your sources (RSS feeds, podcasts, YouTube channels) and publishes new content to your Telegram channel without you having to follow them by hand.

It is designed for anyone who runs communities, publications, radio stations or YouTube channels and needs to distribute content promptly and continuously.

What sets it apart from commercial Cloud services is where it runs. Those live on someone else's servers, often with a monthly subscription and a cap on how many messages you can send. Titan runs **locally**, on your own computer or server: your data and your credentials stay on your machine, you pay no subscription, and no commercial plan limits how much you send. All that remains are Telegram's ordinary anti-spam limits, which Titan handles on its own.

![The welcome screen that greets you when Titan Edition starts.](screenshots/01-intro-welcome.png)

### 1.2 The ecosystem "under the hood"
To get the most out of it, you only need to grasp two ideas about how Titan handles information.

-   **Asynchronous engine (Producer-Consumer).** Titan keeps two jobs separate: one continuously downloads articles from your sources, the other formats them and sends them to Telegram. That way downloading never stops to wait for sending, and sending respects the pauses Telegram imposes to keep you from being blocked as spam, the so-called *FloodWait*.
-   **The database and the bot's "memory".** Every time it publishes an article or a video, Titan computes a fingerprint for it (an MD5 hash) and records it in its internal database. It is this memory that stops it from publishing the same story twice, even if you switch the computer off for two days and turn it back on.
