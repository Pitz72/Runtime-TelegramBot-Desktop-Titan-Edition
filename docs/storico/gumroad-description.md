# Gumroad Product Description — Runtime TelegramBot Titan Edition

> Aggiornare a ogni release: sezione "LATEST VERSION", patch notes, numero versione nei pacchetti.

---

Stop paying monthly subscriptions to automate your Telegram channels.
Put your RSS feeds and YouTube publishing on autopilot with a powerful desktop app. No cloud limits, no recurring fees, total privacy.

---

🚀 LATEST VERSION: v2.0.3 — YouTube Anti-Bot Mitigation

We've listened to our users and completely upgraded the Titan experience:

🛡️ **v2.0.3 YouTube Hotfix:** YouTube tightened its server-side anti-bot protection in May 2026, causing the InnerTube client to return empty channel results across the board (a known upstream issue closed by the library maintainer as "not fixable client-side"). Titan's previous defensive behavior — recreating the Innertube session on every empty response — was unintentionally *amplifying* the rate-limit. This release stops the aggressive session reset and adds a 5-second back-off between YouTube fetches. Result: fewer requests, friendlier traffic pattern, and feeds resume publishing as YouTube relaxes its throttling.

🔧 **v2.0.3 Stability Patch:** Fixed the in-app automatic updater. A filename mismatch between the update manifest and GitHub's release assets was causing a 404 error when trying to download updates. The OTA update system now works flawlessly end-to-end.

🔧 **v2.0.1 Stability Patch:** Fixed a rare but confirmed bug where podcast episodes could be published twice when Quiet Hours ended and a new episode had arrived overnight. The bot could send the same post once from the recovered queue and once again from the fresh feed scan — in the same cycle. This is now fully blocked by a pre-send deduplication guard. *If you've ever woken up on a Monday morning to a double post — this one's for you.*

🎨 **"Titan Blue" Redesign:** A stunning, sleek deep black and pure blue interface. It's not just an automation tool; it's a premium command center.

🛡️ **"SilentGuard" Memory:** Your Quiet Hours are now invincible. Even if you reboot your PC or server during the night, your queued posts are safely stored in the database and will be published flawlessly in the morning. Never lose a post again.

⚡ **"LogVault" Console:** Run the bot for weeks. The new virtualized console lets you smoothly scroll through up to 5,000 log events with zero UI lag or freezing.

⚙️ **"SteelCore" Engine:** Bulletproof YouTube and RSS fetching. We've reinforced our core engine to handle weird date formats, YouTube backend changes, and network hiccups better than ever.

---

🔥 The "Killer" Features

🎬 YouTube Zero-Config (No API Key needed)
Forget about complex Google Cloud setups, quotas, or credit cards. Titan uses a native InnerTube integration. Just paste the YouTube handle (e.g., @YourChannel) and the bot does the rest. It even features a smart Anti-Premiere Filter: it ignores scheduled videos and only publishes them when they are actually live.

🛡️ IronShield Anti-Spam
Never spam your audience with old news again. The advanced dual-hash check (URL + Title) ensures that even if a website changes a link, the bot remembers it and won't republish it.

🌙 Quiet Hours & Digest Mode
Respect your community's sleep. Set "Quiet Hours" to pause publishing during the night; the bot will queue everything and neatly publish it in the morning. Too many news? Use Digest Mode to accumulate articles and send them as a single, clean daily summary.

---

⚙️ Full Feature List

Multi-Bot Orchestration

- Run multiple independent Telegram bots from a single dashboard.
- Support for RSS feeds (News/Podcasts) and YouTube channels.
- Bulk import your existing feeds via OPML files.
- Per-feed scheduler: set individual fetch intervals (from 5 minutes to 24 hours).

Pixel-Perfect Formatting

- Visual Template Editor with Telegram HTML support.
- Smart Chips: Easily inject dynamic data like {{title}}, {{link}}, {{summary}}, and {{feedName}}.
- Real-time validator and live preview to test your messages before saving.

Analytics & Control

- Dashboard with real-time logs (filter by single bot or global).
- Detailed statistics: track your published articles today, last 7 days, and all-time.
- Keyword Filter: Include or exclude specific articles based on keywords.

Built for Security & Performance

- Telegram Tokens are hardware-encrypted using Electron's safeStorage.
- Performance Mode: Toggle off GPU-heavy visuals (animations, blur) for smooth running on low-end VPS machines.
- Automatic Updates: The app checks for updates silently via GitHub Releases and installs them with one click.

---

📦 What You Get with Your Purchase

You will get immediate access to both Windows and Linux versions. Buy once, run anywhere.

1. Windows Package (v2.0.3)

- `RuntimeTelegramBot-TitanEdition-Setup-2.0.3.exe` — Standard Windows Installer.
- Welcome messages and Quick-Start guides in 8 languages (EN, IT, FR, DE, ES, PT, RU, ZH).

2. Linux Package (v2.0.3)

- `RuntimeTelegramBot-TitanEdition-2.0.3.AppImage` — Universal portable file.
- `RuntimeTelegramBot-TitanEdition-2.0.3.deb` — For Debian/Ubuntu-based distros.
- Welcome messages and Quick-Start guides in 8 languages.

(Note: macOS build is currently pending developer certificate signing. Windows/Linux buyers will receive the macOS package at no extra cost once it becomes available).

---

🛠️ Technical Notes & Support

- Requirements: Windows 10/11 (64-bit) OR Linux with glibc ≥ 2.31 (Ubuntu 20.04+, Debian 11+, Fedora 34+).
- Windows SmartScreen: We are an independent developer team. Because we don't use corporate EV certificates, Windows Defender may show a blue "SmartScreen" warning on the first launch. This is completely normal for indie software. Simply click "More info" → "Run anyway".
- Linux Setup: For the AppImage, remember to make the file executable (chmod +x) before running it.
- Support: Included! Open a ticket at ecosystem.runtimeradio.com or reach out directly via Gumroad.

€9.99 — One-time payment. Lifetime access.
