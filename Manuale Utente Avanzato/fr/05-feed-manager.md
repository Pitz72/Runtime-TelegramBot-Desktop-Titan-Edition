## Chapitre 5 : Le Feed Manager (les sources)

### 5.1 Ajouter et tester une source
Le Feed Manager (le panneau sous la liste des bots) est le « régime alimentaire » de votre bot : c'est là que vous saisissez les adresses web (URL) où Titan ira pêcher les contenus.

Pour ajouter une source :

1. Sélectionnez le bot auquel vous voulez l'affecter.
2. Cliquez sur **Ajouter la Source**.
3. Donnez un **Nom** à la source. Ce n'est pas une étiquette quelconque : c'est le texte que vous pourrez afficher en tête des messages comme signature de la nouvelle (c'est le champ `{{feedName}}` des modèles, Chapitre 6).
4. Choisissez le **Type** :
    -   **Podcast :** pour les flux audio (MP3). Titan tente de récupérer l'image de couverture, souvent cachée dans les balises *iTunes* utilisées par des services comme Spreaker ou AzuraCast.
    -   **Actualités :** pour les articles classiques de blogs, de sites d'information ou de journaux.
5. Collez l'URL du flux (en général une adresse qui se termine par `.xml` ou `.rss`).

Avant d'enregistrer, vous pouvez utiliser le bouton **Tester (⚡)** : il fait un appel réel au lien et vous dit aussitôt s'il répond. Si le flux est valide, un avis vert indique combien de nouvelles il a trouvées ; si quelque chose cloche (site hors ligne, lien erroné), l'avis est rouge. Le test n'est qu'une vérification : il ne vous oblige à rien, vous pouvez enregistrer malgré tout, mais c'est le moyen le plus rapide de ne pas saisir une mauvaise adresse.

![Le formulaire d'ajout d'une nouvelle source, avec le nom, le type, l'URL et le bouton de test.](screenshots/06-feed-form.png)

Chaque source de la liste possède un interrupteur pour l'activer ou la mettre en pause sans la supprimer, ainsi que les icônes pour la modifier ou l'effacer.

![La liste des sources : le type, le badge des filtres actifs et l'interrupteur pour chaque flux.](screenshots/13-feed-list.png)

Si une source cesse de répondre (par exemple une erreur 404), vous le remarquez : une ligne rouge portant le nom du flux apparaît dans les Journaux Système. Et si vous vous demandez combien de sources vous pouvez ajouter, il n'y a pas de plafond fixe : gardez cependant à l'esprit que le moteur les contrôle à tour de rôle, donc avec plusieurs dizaines de flux (ou de nombreux bots) le tour de contrôle complet s'allonge.

### 5.2 La gestion native de YouTube
D'ordinaire, intégrer YouTube à un système d'automatisation est une corvée : cela demande un compte développeur sur Google Cloud et une clé API, avec les coûts et les limites qui vont avec. Titan fait l'économie de tout cela grâce à *InnerTube*, un moteur qui lit les pages de YouTube comme le ferait un navigateur, sans aucune clé.

1.  Dans **Ajouter la Source**, choisissez le type **YouTube (Vidéo)**.
2.  Dans le champ URL, pas besoin de codes étranges ni de flux XML : collez le handle de la chaîne (l'arobase sous le nom du YouTubeur, par exemple `@RuntimeRadio`) ou l'adresse complète de la chaîne copiée depuis le navigateur.

Titan s'occupe du reste. Il y a toutefois une précaution utile : le **filtre anti-premiere**. Quand un YouTubeur programme un direct ou une vidéo « à venir dans deux jours », YouTube l'affiche quand même en tête de liste. Un bot naïf enverrait aussitôt la notification, et qui clique tombe sur une vidéo pas encore disponible. Titan, lui, contrôle l'état de la vidéo : si elle est marquée comme *upcoming* ou *premiere*, il l'écarte et ne la publie que lorsqu'elle devient vraiment visible.

### 5.3 Options avancées du flux
Quand vous ajoutez ou modifiez une source, sous les champs principaux se trouvent trois réglages facultatifs. Vous pouvez les ignorer (le flux fonctionne très bien avec les valeurs par défaut) ou vous en servir pour un contrôle plus fin.

-   **Filtre par mots-clés.** Deux champs, « inclure » et « exclure », avec les mots séparés par une virgule. Si vous remplissez « inclure », Titan ne publie que les contenus où figure au moins un de ces mots, dans le titre ou le texte ; si vous remplissez « exclure », il écarte ceux qui en contiennent ne serait-ce qu'un. Un badge ambre sur la source signale que le filtre est actif.
-   **Intervalle personnalisé.** Normalement, chaque flux suit le rythme de contrôle du bot. Ici, vous pouvez lui en donner un bien à lui, de 5 minutes à 24 heures : pratique pour contrôler plus souvent un site très actif, ou plus rarement un site lent. Un badge indique l'intervalle défini.
-   **Digest.** Au lieu de publier chaque contenu dès sa parution, Titan peut les accumuler et les envoyer ensemble dans un unique message récapitulatif, à cadence fixe (1 heure, 6, 12, 24 heures ou 7 jours). Le récapitulatif énumère les titres avec le lien « Lire », jusqu'à 20 contenus par message. Utile pour les sources prolixes, qui autrement inonderaient le canal. Un badge violet signale le digest actif.

### 5.4 Importer plusieurs flux à la fois (OPML)
Si vous avez déjà une liste de flux dans un lecteur RSS, pas besoin de les ressaisir à la main. Le bouton **OPML**, en haut du Feed Manager, importe en bloc toutes les sources contenues dans un fichier `.opml` standard, le format avec lequel les lecteurs RSS exportent leurs listes. À la fin, Titan vous indique combien de flux il a ajoutés.

---
