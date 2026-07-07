# Runtime TelegramBot Desktop Titan Edition — Guide de Démarrage Rapide

Bienvenue dans **Runtime TelegramBot Desktop Titan Edition**. Ce guide vous permet de configurer votre premier bot et de commencer à publier du contenu sur votre canal Telegram en quelques minutes.

---

## 1. Obtenir le Token Telegram

Avant de lancer l'application, vous devez créer un bot sur Telegram :

1. Ouvrez Telegram et recherchez **@BotFather** (il a la coche bleue).
2. Envoyez la commande `/newbot` et suivez les instructions pour attribuer un nom au bot.
3. @BotFather vous renverra un **Token API** (ex. `123456789:ABCdefGHIjklMNOpqr...`). Copiez-le.
4. Ajoutez le bot à votre canal Telegram en tant qu'**Administrateur** avec la permission d'envoyer des messages.

---

## 2. Premier Lancement — Configuration du Bot

Au premier lancement, cliquez sur **« + Nouveau Bot »** et remplissez les champs :

- **Nom** — un nom pour identifier le bot dans l'interface (ex. *Canal d'Actualités*).
- **Token** — le Token API fourni par @BotFather.
- **Channel ID** — le nom du canal (ex. `@moncanal`) ou l'ID numérique pour les canaux privés (ex. `-100123456789`).
- **Date limite** — le bot ignorera tous les contenus publiés avant cette date. Utile pour éviter d'inonder le canal avec d'anciens articles.

---

## 3. Ajouter des Feeds (Feed Manager)

Dans le tableau de bord du bot, cliquez sur **« + Ajouter un Feed »** :

1. Attribuez un **Nom** descriptif au feed.
2. Sélectionnez le **Type** : News, Podcast ou YouTube.
3. Collez l'**URL** :
   - News / Podcast : URL du feed RSS.
   - YouTube : URL de la chaîne ou handle (ex. `@RuntimeRadio`). *Aucune API Key requise.*
4. Utilisez **Tester (⚡)** pour vérifier la validité du lien, puis **Enregistrer**.

### Options avancées de feed

- **Filtre par Mots-Clés** — Filtre les articles par mots-clés à inclure ou exclure. Activable dans les paramètres du feed. Un badge ambré indique le filtre actif.
- **Intervalle Personnalisé** — Définit un intervalle de récupération individuel pour le feed (de 5 minutes à 24 heures), indépendant de l'intervalle global du bot.
- **Digest Mode** — Au lieu de publier chaque article individuellement, accumule le contenu sur un intervalle configurable (1h, 6h, 12h, 24h, 7j) et l'envoie en un seul message récapitulatif. Un badge violet indique le mode actif.
- **Import OPML** — Importe plusieurs feeds simultanément depuis un fichier `.opml` standard via le bouton OPML dans le Feed Manager.

---

## 4. Personnaliser les Messages (Template)

Allez dans les paramètres du bot → onglet **Template** :

- Utilisez les **Smart Chips** pour insérer des variables dynamiques : `{{title}}`, `{{link}}`, `{{summary}}`, `{{feedName}}`, etc.
- 4 templates séparés sont disponibles : Démarrage, News, Podcast, YouTube.
- Le **Validateur** signale en temps réel les erreurs éventuelles (balises non équilibrées, chips inconnus, liens non sécurisés).
- Le bouton **Aperçu** montre comment le message apparaîtra avec des données d'exemple, sans quitter l'éditeur.

Balises HTML prises en charge par Telegram : `<b>`, `<i>`, `<code>`, `<a href="...">`.

---

## 5. Démarrage — Ignition

Lorsque le bot est configuré et que les feeds ont été ajoutés :

- Cliquez sur le bouton **Play (▶)** dans la console.
- L'anneau de statut commencera à tourner et le bot entrera en fonction.
- Dans le panneau **System Logs** vous verrez en temps réel la récupération des feeds et la publication sur Telegram.

Pour surveiller plusieurs bots simultanément, utilisez le toggle **ALL BOTS / THIS BOT** dans le log.

---

## 6. Statistiques

Cliquez sur l'icône **Analytics (📊)** dans le tableau de bord pour voir :

- Compteurs d'articles publiés : aujourd'hui / 7 derniers jours / total.
- Répartition par feed, triée par volume de publication.

---

## Paramètres Système

Accessibles depuis l'icône d'engrenage en haut à droite :

- **Général** — intervalle de vérification global, heures silencieuses, langue.
- **Backup** — export et restauration de la base de données.
- **Performance Mode** — désactive les effets gourmands en GPU (scanlines, blur, glow, animations). Utile sur les machines avec du matériel limité. Effectif immédiatement sans redémarrage.

---

## Portabilité — Fichier .rtb

Pour déplacer un bot sur un autre ordinateur sans perdre la configuration :

1. Dans les paramètres du bot → **Exporter (.rtb)**.
2. Transférez le fichier sur le nouveau PC.
3. Sur le nouveau PC → **Importer (.rtb)** et saisissez à nouveau le token (les tokens sont spécifiques à la machine pour des raisons de sécurité).

---

## Dépannage

- **Erreurs YouTube** — Google met régulièrement à jour ses serveurs. Si des erreurs rouges apparaissent sur les feeds YouTube, désactivez temporairement le feed et attendez une mise à jour de l'application.
- **Token non valide** — Vérifiez que le bot a été ajouté au canal en tant qu'administrateur avec la permission d'envoyer des messages.
- **Linux sans libsecret** — L'application fonctionne normalement en utilisant le fallback AES-256-GCM. Pour le trousseau natif, installez : `sudo apt-get install libsecret-1-0`.

---

*Pour le guide complet, consultez le Manuel d'Utilisation disponible au format PDF.*
