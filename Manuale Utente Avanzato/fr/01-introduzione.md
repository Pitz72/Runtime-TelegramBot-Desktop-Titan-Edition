## Chapitre 1 : Introduction et notions de base

### 1.1 Qu'est-ce que Titan Edition ?
Bienvenue dans **Runtime TelegramBot Titan Edition**. Ce n'est pas un simple « script » qui copie-colle des liens : c'est un outil d'automatisation éditoriale qui lit vos sources (flux RSS, podcasts, chaînes YouTube) et publie les nouveaux contenus sur votre canal Telegram sans que vous ayez à les suivre à la main.

Il s'adresse à celles et ceux qui gèrent des communautés, des rédactions, des radios ou des chaînes YouTube et qui doivent diffuser des contenus de façon rapide et continue.

La différence avec les services Cloud commerciaux tient à l'endroit où il tourne. Ces derniers vivent sur les serveurs d'autrui, souvent avec un abonnement mensuel et un plafond de messages à envoyer. Titan tourne **en local**, sur votre ordinateur ou votre serveur : vos données et vos identifiants restent sur votre machine, vous ne payez aucun abonnement et aucune formule commerciale ne limite le nombre d'envois. Il ne reste que les limites anti-spam habituelles de Telegram, que Titan gère lui-même.

![L'écran de bienvenue qui accueille l'utilisateur au démarrage de Titan Edition.](screenshots/01-intro-welcome.png)

### 1.2 L'écosystème « sous le capot »
Pour en tirer le meilleur parti, il suffit de saisir deux notions sur la façon dont Titan gère l'information.

-   **Moteur asynchrone (Producer-Consumer).** Titan sépare deux tâches : l'une télécharge en continu les articles de vos sources, l'autre les met en forme et les envoie à Telegram. Ainsi le téléchargement ne s'arrête jamais pour attendre l'envoi, et l'envoi respecte les pauses que Telegram impose pour ne pas vous faire bloquer comme spam, le fameux *FloodWait*.
-   **La base de données et la « mémoire » du bot.** Chaque fois qu'il publie un article ou une vidéo, Titan en calcule une empreinte numérique (un hash MD5) et l'enregistre dans sa base de données interne. C'est cette mémoire qui l'empêche de republier deux fois la même nouvelle, même si vous éteignez l'ordinateur pendant deux jours avant de le rallumer.

---
