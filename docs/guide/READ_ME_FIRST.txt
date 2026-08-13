=================================================================
  RUNTIME TELEGRAMBOT DESKTOP · TITAN EDITION
  Read me first
=================================================================

Titan publishes to your Telegram channel on its own: whatever
appears on the RSS feeds, podcasts and YouTube channels you point
it at. It runs on your computer, so your data and your tokens
stay there.

It is free software, released under the MIT Licence: you may use
it, study it, modify it and redistribute it, including for
commercial purposes. The source code is public:
https://github.com/Ecosystem-Runtime/Runtime-TelegramBot-Desktop-Titan-Edition


--- INSTALLATION ------------------------------------------------

Windows 10 or later (64-bit)
  Run the .exe file and follow the on-screen instructions. The
  program creates a desktop shortcut for you.

Linux
  .deb        Ubuntu 22.04+, Debian and derivatives: double-click
              and let the package manager do the work.
  .AppImage   Every other distribution: make the file executable
              (right-click > Properties > Permissions > Allow
              executing) and start it with a double-click. Some
              recent Ubuntu versions need the libfuse2 package
              first:  sudo apt install libfuse2

macOS
  There is no official installer and none is planned. The code is
  cross-platform and does build and run on macOS: anyone using it
  there starts from source (Node 20 and the Xcode Command Line
  Tools are required).

On the first launch, a four-step wizard walks you through setting
up your first bot.


--- SMARTSCREEN NOTICE (WINDOWS ONLY) ---------------------------

The first time you run the .exe, Windows may show the blue screen
"Windows protected your PC — Unknown publisher".

This is not an antivirus alert. Windows shows it for any program
not signed with a paid commercial certificate, which this project
does not have. The warning is about that certificate, not about
what is inside the file.

If you would rather verify than trust, the source code is public
and buildable: you can produce the executable yourself from
source, with the same commands our continuous integration uses.

To carry on: click "More info", then "Run anyway".


--- UPDATES -----------------------------------------------------

Titan checks on its own, at every launch, whether a newer version
exists. When it finds one it tells you through a dedicated screen:
it asks whether to download it and, once the download is done,
whether to restart to install it. You decide at each step.

Automatic updating applies to the Windows build and to the
.AppImage. It does not work with the .deb package: there, updates
go through the package manager or a fresh manual download.


--- DOCUMENTATION -----------------------------------------------

Quick Guide — it is inside the program. Open it from the welcome
screen or from System Settings > General. It covers how to get the
token from @BotFather, the four setup steps, how to add a source
and how to start the engine.

Advanced User Manual — nine chapters as a PDF, in Italian and
English. You download it from the same two places, with the
"Download Manual (PDF)" button. It is not part of the
installation: it is fetched from the network on the spot, so an
active connection is needed.


--- HOW THIS WAS WRITTEN ----------------------------------------

Most of the code was written with language models (Google Gemini,
Anthropic Claude). The concept, the vision, the design direction,
the meticulous definition of every detail and the stubborn hunt
for bugs are Simone Pizzi's: the models wrote the code, the
decisions were all his. The same method applies to this
documentation.


--- CONTACT -----------------------------------------------------

Bug reports and requests
  https://github.com/Ecosystem-Runtime/Runtime-TelegramBot-Desktop-Titan-Edition/issues

Contact
  https://simonepizzi.runtimeradio.it/contatti

Voluntary donation
  https://paypal.me/runtimeradio

Titan is free and stays free. The donation is optional and
unlocks nothing.

  Simone Pizzi — Runtime Radio
