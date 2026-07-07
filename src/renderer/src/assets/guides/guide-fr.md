# ⚡ Runtime TelegramBot Desktop Titan Edition : Guide de Démarrage Rapide

Bienvenue dans **Runtime TelegramBot Desktop Titan Edition**. Ce guide rapide vous permettra de configurer votre premier bot et de commencer à publier du contenu sur votre canal Telegram en moins de 3 minutes.

---

## 1. Préparation : Obtenez le Token Telegram
Avant de démarrer Titan, vous devez créer un « Bot » sur Telegram :
1. Ouvrez Telegram et recherchez l'utilisateur **@BotFather** (il possède le badge de vérification bleu).
2. Envoyez la commande `/newbot` et suivez les instructions pour donner un nom à votre bot.
3. À la fin, @BotFather vous donnera un **Token API** (une longue chaîne comme `123456789:ABCdefGHIjklMNOpqr...`). **Copiez-le et conservez-le en sécurité.**
4. Ajoutez le bot nouvellement créé à votre Canal Telegram en tant qu'**Administrateur** (il doit avoir la permission d'« Envoyer des messages »).

## 2. Le Premier Lancement (Assistant de Configuration)
Lancez Runtime TelegramBot Desktop Titan Edition. Si c'est votre première fois, l'assistant en 4 étapes apparaîtra :
*   **Nom du Bot :** Choisissez un nom pour le reconnaître (ex. *Canal d'Actualités*).
*   **Bot Token :** Collez le Token fourni par @BotFather.
*   **ID du Canal :** Entrez le nom de votre canal (ex. `@moncanal`). Si c'est un canal privé, entrez l'ID numérique (ex. `-100123456789`).
*   **Date limite :** Choisissez une date. Le bot **ignorera** tous les articles et vidéos publiés avant cette date, évitant d'inonder votre canal d'anciens contenus.

## 3. Ajouter des Sources (Gestionnaire de Flux)
Une fois dans le Tableau de Bord :
1. Assurez-vous que votre bot est sélectionné dans la colonne de gauche.
2. Dans le panneau **Sources de Flux**, cliquez sur **« + Ajouter une Source »**.
3. Entrez le Nom (ex. *Mon Podcast*) et sélectionnez le **Type** (Podcast, News ou YouTube).
4. Collez l'URL :
   * Pour les News et les Podcasts : collez l'URL du flux RSS.
   * Pour YouTube : Vous pouvez coller directement l'URL de la chaîne ou l'identifiant (ex. `@RuntimeRadio`). *Aucune clé API requise !*
5. Utilisez le bouton **Tester (⚡)** pour vérifier que le lien est valide, puis cliquez sur **Enregistrer**.

## 4. Personnaliser les Messages (Modèles)
Voulez-vous que vos publications soient parfaitement formatées ?
1. Cliquez sur l'icône **Paramètres (⚙️)** dans la colonne de gauche.
2. Allez dans l'onglet **Modèles**.
3. Utilisez le panneau de boutons pratique en haut pour insérer des variables automatiques comme `{{title}}`, `{{link}}` ou `{{summary}}`.
4. Vous pouvez utiliser les balises HTML de base prises en charge par Telegram, par exemple : `<b>Gras</b>`, `<i>Italique</i>`, ou cacher un lien long derrière un texte en utilisant `<a href="{{link}}">Cliquez ici</a>`.

## 5. Allumage (Ignition)
Vous avez saisi le token et ajouté les flux ? Vous êtes prêt.
*   Cliquez sur le grand bouton **Lecture (▶)** au centre de la console.
*   L'anneau commencera à tourner et le bot se mettra au travail.
*   Dans le panneau **System Logs**, vous verrez en temps réel le bot lire vos sources et publier de nouveaux contenus sur Telegram !

---

### 💡 Conseils Utiles & Dépannage
*   **Plages de Silence :** Dans les paramètres du bot, vous pouvez définir les heures d'activité. Si vous réglez de 08:00 à 22:00, les nouvelles nocturnes ne seront pas perdues, mais seront mises en file d'attente et publiées à 08:00 du matin !
*   **Erreurs YouTube :** Si vous recevez des erreurs « rouges » sur les chaînes YouTube, pas de panique. Google met souvent à jour ses serveurs. Désactivez temporairement le flux YouTube depuis le bouton dédié dans l'interface et attendez notre mise à jour logicielle.
*   **Changement de PC :** Devez-vous déplacer le bot vers un autre ordinateur ? Ne copiez pas les fichiers ! Utilisez la fonction **Exporter (.rtb)** dans les paramètres. Cela générera un fichier sécurisé à importer dans le nouveau PC, en gardant vos mots de passe cryptés.

*Pour une assistance avancée, reportez-vous au Manuel d'Utilisation Pro au format PDF.*
