## Chapter 7: Portability and Security (The OmniSync Ecosystem)

Titan keeps your work safe and gives you three ways to save or move it: the full database backup, the `.rtb` format for a single bot and the export of the entire configuration. Let's look at them.

### 7.1 Full database backup
Click the gear icon (⚙️) at the top right to open the **System Settings**, then go to the **Data & Backup** tab.

The **Export DB** button creates a complete clone of the `titan.db` database: everything is in there — the bot profiles, the feeds and the whole historical memory of publications. With **Import DB** you select a previously saved file and Titan restarts on its own, restoring the exact situation of that moment.

![The Data & Backup tab: export and import of the database and the configuration.](screenshots/09-system-backup.png)

It is the right method for a complete safety copy, or to put everything back after a reinstall on the same computer.

*Where the database lives.* The `titan.db` file is kept in a system folder, separate from the program, so a reinstall does not touch it. You will find it on Windows under `%APPDATA%\runtime-telegram-bot-titan-edition\`, on Linux under `~/.config/runtime-telegram-bot-titan-edition/`. If one day the software failed to start, you can copy `titan.db` from there by hand to keep it safe.

### 7.2 The .rtb format: moving a bot securely
To pass a single bot from one installation to another (for example to a colleague in the newsroom) there is **OmniSync**, the `.rtb` (Runtime Telegram Bot) format.

In the bot's settings, in the **Sharing** section, the **Export** button generates a `.rtb` file: a "digital cartridge" that holds the bot's name, all its feeds (with filters, intervals and digests) and the templates, but not the history of messages already sent. Whoever receives it loads it with the **Import** button in the bot column, the arrow icon next to the **+**.

And the token? Here Titan makes a deliberate security choice: the token travels inside the file, but encrypted and tied to the computer that created the export. Therefore:

-   **On the same computer** (for example after a reinstall) the token is re-read and restored without you doing anything.
-   **On another computer** the token, for security, cannot be decrypted: it arrives empty and must be re-entered by hand, the same one you copy from BotFather. Everything else (feeds, templates, settings) is already in place.

In practice the `.rtb` moves the configuration conveniently, but the real secret cannot be stolen by copying a file: it stays protected by the machine that generated it.

*Note (Linux).* Token encryption relies on the system keychain (GNOME Keyring, KWallet or another Secret Service). If your distribution does not have one, Titan does not stall: it uses internal encryption, still tied to the machine. To enable the native keychain, install `libsecret`.

### 7.3 Exporting all bots at once (configuration)
If you want to move not one bot but the whole setup, go back to the **Data & Backup** tab: next to the database you will find the export of the **configuration** in JSON format. It works like the `.rtb`, but on all bots at once: it carries the profiles, feeds and templates of each, again without the history. The same token rule seen above applies: it restores itself on the same computer, elsewhere it must be re-entered.
