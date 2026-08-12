## Chapitre 6 : Paramètres avancés et modèles

Les paramètres de chaque bot s'ouvrent depuis l'icône à curseurs (🎚️) à côté de son nom, dans la colonne de gauche. La fenêtre a deux onglets : **Général** (les paramètres du bot) et **Modèles** (l'aspect des messages).

### 6.1 Intervalle de contrôle et notifications
Dans l'onglet **Général**, outre les données que vous connaissez déjà (Nom, Jeton, ID du Canal, Date de début), deux réglages déterminent le comportement du bot :

-   **Intervalle de contrôle.** Un curseur de 1 à 120 minutes (15 par défaut) qui fixe la fréquence à laquelle le bot va vérifier les flux. C'est le rythme de base ; si une source particulière a besoin d'une autre cadence, vous la lui donnez depuis le Feed Manager (Chapitre 5).
-   **Notifications.** Un interrupteur : quand il est allumé, Titan fait apparaître un avis système (une notification du bureau) à chaque publication réussie. Si vous gérez des canaux très actifs et ne voulez pas être averti à chaque post, éteignez-le.

À côté du champ Jeton, une icône en forme d'œil vous permet de l'afficher ou de le masquer pendant que vous le collez.

![L'onglet Général des paramètres du bot : intervalle de contrôle, notifications et heures actives.](screenshots/04-bot-settings-general.png)

### 6.2 Plages horaires de silence (Heures Actives)
Les journaux étrangers et les créateurs internationaux publient souvent en pleine nuit, et une notification push à trois heures du matin ne fait plaisir à personne. Les plages horaires de silence servent précisément à cela.

Toujours dans l'onglet **Général**, la section **Heures Actives** comporte deux champs : **De** (p. ex. 08:00) et **À** (p. ex. 22:00). Par défaut, la fenêtre va de 00:00 à 23:59, c'est-à-dire aucun silence : c'est à vous de la resserrer.

-   *Hors de la fenêtre.* Le moteur ne s'arrête pas : il continue de contrôler les flux RSS et YouTube toute la nuit, pour ne rien manquer. Seulement, au lieu d'envoyer tout de suite, il met les contenus de côté dans une file d'attente **persistante**, enregistrée sur le disque. Même si vous éteignez l'ordinateur, la file est encore là au redémarrage.
-   *À la réouverture.* Dès que l'horloge revient dans la plage autorisée, le bot écoule dans l'ordre chronologique tout ce qu'il a accumulé, en publiant un post toutes les 3 secondes jusqu'à vider la file.

Ainsi vos automatisations respectent le repos du public et le contenu arrive le matin, quand il a le plus de chances d'être lu.

### 6.3 Éditeur de modèles et Smart Chips
Par défaut, Titan publie avec une mise en page nette mais standard. Si vous voulez donner aux messages votre ligne éditoriale (un emoji en guise de logo, les liens disposés à votre façon), ouvrez l'onglet **Modèles**.

Vous y trouvez quatre zones de texte séparées, une par format : **Démarrage**, **Actualités**, **Podcast**, **YouTube**. Elles s'écrivent dans le **HTML pris en charge par Telegram** : les balises utiles sont `<b>` (gras), `<i>` (italique), `<code>` (monospace) et `<a href="...">` (lien).

![L'onglet Modèles avec l'éditeur, les Smart Chips pour les variables et l'aperçu du message.](screenshots/05-bot-settings-templates.png)

Au-dessus de chaque zone, les boutons **Smart Chips** insèrent les variables dynamiques, que le bot remplacera par la donnée réelle au moment de l'envoi :

-   `{{title}}` : le titre de l'article ou de la vidéo.
-   `{{feedName}}` : le nom que vous avez donné à la source dans le Feed Manager (par exemple *Revue de presse*).
-   `{{link}}` : l'adresse de l'article.
-   `{{summary}}` : un bref aperçu du texte (300 caractères au maximum).

*Texte propre.* Ne vous souciez pas de ce qui arrive des flux : Titan débarrasse le texte des balises HTML de la source (images, tableaux, paragraphes) et neutralise les caractères spéciaux avant l'envoi, de sorte qu'un article « sale » ne peut pas faire échouer le message.

Deux outils vous aident à ne pas vous tromper :

-   **Aperçu.** Le bouton en forme d'œil montre le rendu du message, avec des données d'exemple à la place des variables, sans quitter l'éditeur.
-   **Validateur.** Pendant que vous écrivez, Titan signale les problèmes en temps réel : balises non équilibrées, variables inexistantes, liens non sûrs. Le bord de la zone devient rouge pour les erreurs, jaune pour les avertissements.

*Liens propres.* Telegram sait masquer les liens longs dans le texte. Au lieu de « Cliquez ici : {{link}} », écrivez `<a href="{{link}}">Lire l'article</a>` : l'utilisateur ne verra que la phrase bleue cliquable.

### 6.4 La Zone de Danger : réinitialiser l'historique
Au bas de l'onglet **Général** se trouve une section rouge, la *Zone de Danger*. Le bouton **Effacer l'historique** est puissant et destructeur : il efface la mémoire du bot, c'est-à-dire tout ce qu'il a déjà publié.

-   *Quand cela sert.* Si vous avez supprimé par erreur de nombreux messages du canal et voulez que le bot republie les dernières nouvelles pour reconstituer le fil.
-   *Comment l'utiliser sans dégâts.* Si vous effacez l'historique et appuyez sur Play, le bot considère comme « nouveau » tout ce qu'il trouve dans les flux et l'envoie en bloc, inondant le canal. Pour l'éviter, après l'effacement, ramenez la **Date de début** (dans le même onglet) à la date du jour : ainsi le bot oublie le passé mais ne publie qu'à partir d'aujourd'hui.

En effaçant l'historique, les compteurs de statistiques reviennent eux aussi à zéro (Chapitre 3). À côté de la Zone de Danger, vous trouvez aussi l'exportation du bot au format `.rtb`, que nous voyons au Chapitre 7.

---
