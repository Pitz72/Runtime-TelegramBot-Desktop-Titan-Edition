## Chapitre 7 : Portabilité et sécurité (l'écosystème OmniSync)

Titan met votre travail à l'abri et vous offre trois façons de le sauvegarder ou de le déplacer : la sauvegarde complète de la base de données, le format `.rtb` pour un bot isolé et l'exportation de toute la configuration. Voyons-les.

### 7.1 Sauvegarde complète de la base de données
Cliquez sur l'icône en forme d'engrenage (⚙️) en haut à droite pour ouvrir les **Paramètres Système**, puis allez dans l'onglet **Données & Backup**.

Le bouton **Exporter BD** crée un clone complet de la base de données `titan.db` : elle contient tout, les profils de bots, les flux et toute la mémoire historique des publications. Avec **Importer BD**, vous sélectionnez un fichier enregistré précédemment et Titan redémarre tout seul, rétablissant la situation exacte de ce moment-là.

![L'onglet Données & Backup : exportation et importation de la base de données et de la configuration.](screenshots/09-system-backup.png)

C'est la bonne méthode pour une copie de sécurité complète, ou pour tout remettre en place après une réinstallation sur le même ordinateur.

*Où vit la base de données.* Le fichier `titan.db` est conservé dans un dossier système, séparé du programme, de sorte qu'une réinstallation n'y touche pas. Vous le trouvez sous Windows dans `%APPDATA%\runtime-telegram-bot-titan-edition\`, sous Linux dans `~/.config/runtime-telegram-bot-titan-edition/`. Si un jour le logiciel ne démarrait plus, vous pouvez copier `titan.db` depuis là à la main pour le mettre en sécurité.

### 7.2 Le format .rtb : déplacer un bot en toute sécurité
Pour faire passer un bot isolé d'une installation à une autre (par exemple à un collègue de la rédaction), il y a **OmniSync**, le format `.rtb` (Runtime Telegram Bot).

Dans les paramètres du bot, à la section **Partage**, le bouton **Exporter** génère un fichier `.rtb` : une « cartouche numérique » qui contient le nom du bot, tous ses flux (avec filtres, intervalles et digests) et les modèles, mais pas l'historique des messages déjà envoyés. Celui qui le reçoit le charge avec le bouton **Importer** dans la colonne des bots, l'icône en forme de flèche à côté du **+**.

Et le jeton ? Ici, Titan fait un choix de sécurité précis : le jeton voyage dans le fichier, mais chiffré et lié à l'ordinateur qui a créé l'exportation. Par conséquent :

-   **Sur le même ordinateur** (par exemple après une réinstallation), le jeton est relu et rétabli sans que vous ayez rien à faire.
-   **Sur un autre ordinateur**, le jeton, par sécurité, n'est pas déchiffrable : il arrive vide et doit être ressaisi à la main, le même que vous copiez depuis BotFather. Tout le reste (flux, modèles, paramètres) est déjà à sa place.

En pratique, le `.rtb` déplace la configuration de façon commode, mais le vrai secret ne se vole pas en copiant un fichier : il reste protégé par la machine qui l'a généré.

*Note pour Linux.* Le chiffrement du jeton s'appuie sur le trousseau du système (GNOME Keyring, KWallet ou un autre service Secret Service). Si votre distribution n'en possède pas, Titan ne se bloque pas : il utilise un chiffrement interne, lui aussi lié à la machine. Pour activer le trousseau natif, installez `libsecret`.

### 7.3 Exporter tous les bots ensemble (configuration)
Si vous voulez déplacer non pas un bot mais tout l'ensemble, revenez dans l'onglet **Données & Backup** : à côté de la base de données se trouve l'exportation de la **configuration** au format JSON. Elle fonctionne comme le `.rtb`, mais sur tous les bots d'un coup : elle emporte les profils, les flux et les modèles de chacun, toujours sans l'historique. La même règle que pour le jeton vue plus haut s'applique : elle se rétablit toute seule sur le même ordinateur, ailleurs elle doit être ressaisie.

---
