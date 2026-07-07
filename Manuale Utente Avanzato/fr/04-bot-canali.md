## Chapitre 4 : Gestion des bots et des canaux

### 4.1 Créer plusieurs bots
Titan est multicanal : vous pouvez gérer plusieurs bots depuis la même fenêtre, chacun avec son canal. Supposons que vous gériez une radio : il vous faut un canal Telegram pour les actualités écrites (News), un pour les épisodes audio (Podcast) et peut-être un troisième pour les coulisses (YouTube). Pas besoin d'installer le programme trois fois.

En haut de la colonne des bots, à droite, se trouve un petit groupe de commandes. Le **+** ouvre un formulaire rapide : saisissez Nom, Jeton, ID du Canal et Date limite, enregistrez, et le nouveau profil apparaît dans la liste. À côté du **+**, vous trouvez aussi le bouton pour **importer** un bot depuis un fichier `.rtb` (Chapitre 7) et celui à curseurs (🎚️) pour ouvrir ses **paramètres** (Chapitre 6).

Chaque profil vit pour son compte : flux, horaires et modèles sont séparés. Quand vous appuyez sur Play, Titan orchestre tous les bots actifs dans un seul cycle de travail, en les servant à tour de rôle.

![Le Bot Selector : chaque profil affiche son nom, son canal et son état en ligne/hors ligne.](screenshots/12-bot-selector.png)

### 4.2 Récupérer le jeton auprès de @BotFather
Le **Bot Token** (jeton du bot) est la « clé de la maison » qui permet au logiciel de parler aux serveurs de Telegram. Pour en obtenir un, il vous faut Telegram, sur smartphone ou sur ordinateur :

1. Dans la recherche de Telegram, tapez `BotFather` et ouvrez le profil officiel, reconnaissable à sa coche bleue de vérification.
2. Appuyez sur **Démarrer** et envoyez la commande `/newbot`.
3. BotFather vous demande d'abord un « Nom » (celui que liront les utilisateurs), puis un « Username » unique, qui doit se terminer par le mot *bot* (par exemple `maradio_news_bot`).
4. Si l'username est libre, BotFather répond par un message de félicitations contenant une longue chaîne alphanumérique, sous la mention *Use this token to access the HTTP API*.
5. Copiez cette chaîne : c'est le jeton à coller dans Titan.

**Important.** Ne partagez jamais le jeton. Titan l'enregistre chiffré, en le liant à cet ordinateur via le trousseau du système d'exploitation : ainsi, même en copiant les fichiers du programme sur une autre machine, le jeton reste illisible. Pour le déplacer vraiment sur un autre PC, il y a le format `.rtb`, expliqué au Chapitre 7.

### 4.3 Trouver le bon Channel ID
Pour publier, le bot doit savoir *où* envoyer les messages : c'est le **Channel ID** (ID du canal).

-   **Canaux publics.** C'est le cas le plus simple. Si le canal a un lien du type `t.me/moncanal`, le Channel ID est `@moncanal`. Pas besoin d'être précis : Titan nettoie tout seul ce que vous collez : il retire le préfixe `https://` et `t.me/`, et ajoute l'arobase si elle manque. Ainsi `https://t.me/moncanal`, `t.me/moncanal` et `moncanal` finissent tous en `@moncanal`.
-   **Canaux privés.** Ils n'ont pas de nom public : ils sont identifiés par une chaîne numérique attribuée par Telegram, qui commence en général par le signe moins (par exemple `-1002345678912`). Pour l'obtenir, transférez un message du canal à un bot de service gratuit comme `@getidsbot`, qui vous répond avec le code numérique exact de la discussion. Ce nombre se colle tel quel.

*Règle d'or.* Une fois le canal créé et l'ID obtenu, et **avant de lancer le bot**, entrez dans les paramètres du canal Telegram, ouvrez **Administrateurs**, cherchez votre bot et ajoutez-le avec l'autorisation d'envoyer des messages. Si le bot n'est pas administrateur (ou si l'ID est erroné), il n'a aucun moyen d'écrire dans le canal : une erreur rouge de Telegram apparaîtra dans les journaux (voir le Chapitre 9) et rien ne sera publié.

---
