## Chapitre 9 : Dépannage (résolution des problèmes)

Voici les problèmes les plus courants et comment s'en sortir, sous la forme problème et solution.

**La fenêtre est blanche au démarrage.** Cela arrive rarement, et presque uniquement sur des machines virtuelles ou des ordinateurs sans carte graphique à jour. Patientez une dizaine de secondes : Titan dispose d'un filet de sécurité qui, si l'interface n'apparaît pas d'elle-même, la force malgré tout. Si elle reste blanche, réinstallez l'application par-dessus l'ancienne : vous ne perdez aucune donnée, car la base de données est conservée dans un dossier système séparé du programme (le chemin exact est au Chapitre 7).

**J'ai ajouté un flux YouTube et les journaux affichent « Cannot read properties… ».** Le lien entre Titan et YouTube (*InnerTube*) n'est pas officiel : il lit les pages comme le ferait un navigateur. De temps à autre, Google change le code de ses pages et met cette lecture en défaut. L'erreur apparaît dans le journal et le tableau de bord vous le signale par une notification. En attendant, désactivez la chaîne YouTube en cause et attendez une mise à jour : Titan se met à jour tout seul (Chapitre 2) et le problème se règle en général à la racine. Vos Actualités et vos Podcasts, pendant ce temps, continuent de fonctionner sans souci.

**Le bot signale « Bad Request: chat not found ».** Le Channel ID est erroné, ou, plus souvent, vous avez oublié d'ajouter le bot aux **Administrateurs** du canal. Corrigez : ouvrez les paramètres du canal Telegram, ajoutez le bot comme administrateur et donnez-lui l'autorisation d'envoyer des messages. L'erreur disparaît (voir aussi le Chapitre 4).

**Le bot publie les nouvelles mais l'image apparaît comme un petit carré au lieu d'un grand aperçu.** C'est le comportement normal de Telegram quand la source RSS ne contient pas de grande image, mais seulement une miniature. Titan cherche l'image à la plus haute résolution qu'il puisse trouver, allant jusqu'à fouiller le texte de l'article, mais si la source n'en a pas de convenable, Telegram se rabat sur la miniature. Pour corriger cela, il faut intervenir sur le site qui publie le flux, et non sur le bot.

---
