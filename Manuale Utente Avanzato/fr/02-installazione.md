## Chapitre 2 : Installation et premier démarrage

### 2.1 Configuration requise
Titan Edition est léger et fonctionne sur Windows et Linux :

-   **Windows :** Windows 10 ou version ultérieure (64 bits).
-   **Linux :** Ubuntu 22.04+, Debian et dérivées via le paquet `.deb` ; sur les autres distributions, utilisez le format `.AppImage`, autonome et sans installation.

*Note Linux :* sur certaines versions récentes d'Ubuntu, l'`.AppImage` a besoin du paquet `libfuse2` ; s'il ne démarre pas, installez-le (`sudo apt install libfuse2`) ou utilisez le `.deb`.

*Note pour les serveurs VPS :* Titan peut aussi tourner sur un Virtual Private Server dépourvu de carte graphique dédiée. Si l'interface n'apparaît pas au démarrage, un mécanisme de sécurité la force au bout d'une dizaine de secondes (nous en parlons au Chapitre 9).

### 2.2 Installation
L'installation est simple.

1. Téléchargez le fichier fourni par votre administrateur ou depuis la page officielle des versions.
2. **Sous Windows :** lancez le fichier `.exe` et suivez les instructions à l'écran. Le programme crée lui-même un raccourci sur le bureau.
3. **Sous Linux :** avec le paquet `.deb`, double-cliquez et laissez faire le gestionnaire de paquets ; avec l'`.AppImage`, rendez le fichier exécutable (clic droit → Propriétés → Permissions → Autoriser l'exécution) et lancez-le d'un double-clic.

Une fois l'installation faite, vous n'aurez plus rien à télécharger à la main : Titan vérifie lui-même s'il existe une version plus récente et, lorsqu'il en trouve une, vous le signale par un écran dédié qui vous demande s'il faut la télécharger et, une fois le téléchargement terminé, s'il faut redémarrer pour l'installer.

![L'avis de mise à jour disponible : Titan demande confirmation avant de télécharger et avant de redémarrer.](screenshots/11-update-available.png)

### 2.3 Le Setup Wizard (premier démarrage)
Au tout premier démarrage, après la séquence animée de boot et le choix de la langue, Titan vous accueille avec un assistant de configuration (Setup Wizard) en quatre étapes, pour mettre en place tout de suite votre première automatisation.

![L'assistant de configuration guide la mise en place du premier bot en quatre étapes.](screenshots/02-setup-wizard.png)

1.  **Nom du Bot :** un nom descriptif qui vous aide à reconnaître le profil dans l'interface (p. ex. « Bot Actus Sport »). Il ne sera pas visible par vos utilisateurs sur Telegram.
2.  **Jeton du Bot :** collez ici le jeton secret généré par `@BotFather`. *(La marche à suivre pour l'obtenir est expliquée au Chapitre 4.2.)*
3.  **ID du Canal (Channel ID) :** le nom d'utilisateur public du canal précédé de l'arobase (p. ex. `@moncanal`). Si le canal est privé, saisissez son identifiant numérique, qui commence en général par le signe moins (p. ex. `-100123456789`).
4.  **Date de début (Start Date) :** un paramètre important. Par défaut, c'est la date du jour : Titan lira quand même vos flux, mais **ignorera et écartera** toute nouvelle ou vidéo publiée avant cette date. Cela évite qu'au premier démarrage le bot n'inonde le canal de nouvelles vieilles de plusieurs semaines.

Une fois les quatre étapes terminées, cliquez sur **Lancer Titan** : vous vous retrouverez sur le tableau de bord principal.

---
