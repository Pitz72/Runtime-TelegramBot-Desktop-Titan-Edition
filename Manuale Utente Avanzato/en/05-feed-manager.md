## Chapter 5: The Feed Manager (The Sources)

### 5.1 Adding and testing a source
The Feed Manager (the panel below the bot list) is your bot's "diet": here you enter the web addresses (URLs) from which Titan will fetch content.

To add a source:

1. Select the bot you want to assign it to.
2. Click **Add Source**.
3. Give the source a **Name**. It is more than a label: it is the text you can stamp at the top of your messages as the story's byline (it is the `{{feedName}}` field in templates, Chapter 6).
4. Choose the **Type**:
    -   **Podcast:** for audio streams (MP3). Titan tries to recover the cover image, often hidden in the *iTunes* tags used by services such as Spreaker or AzuraCast.
    -   **News:** for the classic articles of blogs, news sites or newspapers.
5. Paste the feed URL (usually an address ending in `.xml` or `.rss`).

Before saving you can use the **Test (⚡)** button: it makes a real call to the link and tells you at once whether it responds. If the feed is valid, a green notice reports how many stories it found; if something is wrong (site offline, wrong link), the notice is red. The test is only a check: it does not force you to do anything, you can save anyway, but it is the quickest way to avoid entering a wrong address.

![The form for adding a new source, with name, type, URL and the test button.](screenshots/06-feed-form.png)

Every source in the list has a switch to enable it or pause it without deleting it, plus icons to edit or remove it.

![The list of sources: type, active-filter badges and a switch for each feed.](screenshots/13-feed-list.png)

If a source stops responding (for example a 404 error), you will notice: a red line appears in the System Logs with the feed's name. And if you are wondering how many sources you can add, there is no fixed cap: keep in mind, though, that the engine checks them in rotation, so with many dozens of feeds (or many bots) the full check cycle grows longer.

### 5.2 Native YouTube handling
Integrating YouTube into an automation system is usually a hassle: it calls for a developer account on Google Cloud and an API key, with the attendant costs and limits. Titan skips all of that thanks to *InnerTube*, an engine that reads YouTube pages the way a browser would, with no key at all.

1.  In **Add Source** choose the type **YouTube (Video)**.
2.  In the URL field you need no strange codes or XML feeds: paste the channel handle (the at sign under the YouTuber's name, for example `@RuntimeRadio`) or the full channel address copied from the browser.

Titan takes care of the rest. There is one useful safeguard, though: the **anti-premiere filter**. When a YouTuber schedules a live stream or a video "coming in two days", YouTube shows it at the top of the list anyway. A naive bot would fire the notification right away, and whoever clicks lands on a video that is not available yet. Titan instead checks the video's status: if it is marked as *upcoming* or *premiere*, it discards it and publishes it only when it truly becomes visible.

### 5.3 Advanced feed options
When you add or edit a source, below the main fields you will find three optional settings. You can ignore them (the feed works fine with the default values) or use them for finer control.

-   **Keyword filter.** Two fields, "include" and "exclude", with words separated by commas. If you fill in "include", Titan publishes only content in which at least one of those words appears, in the title or the body; if you fill in "exclude", it discards anything that contains even one of them. An amber badge on the source signals that the filter is active.
-   **Custom interval.** Normally each feed follows the bot's check rhythm. Here you can give it one of its own, from 5 minutes to 24 hours: handy for checking a very active site more often, or a slow one less often. A badge shows the interval set.
-   **Digest.** Instead of publishing each item as soon as it appears, Titan can accumulate them and send them together in a single summary message, at a fixed cadence (1 hour, 6, 12, 24 hours or 7 days). The summary lists the titles with a "Read" link, up to 20 items per message. Useful for wordy sources that would otherwise flood the channel. A purple badge signals that the digest is active.

### 5.4 Importing several feeds at once (OPML)
If you already have a list of feeds in an RSS reader, you do not have to re-enter them by hand. The **OPML** button, at the top of the Feed Manager, imports in bulk all the sources contained in a standard `.opml` file, the format RSS readers use to export their lists. When it is done, Titan tells you how many feeds it added.
