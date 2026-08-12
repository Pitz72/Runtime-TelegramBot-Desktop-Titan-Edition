## Chapitre 3 : L'interface utilisateur (le tableau de bord)

### 3.1 Anatomie de la console
Une fois le Setup Wizard terminé, et à chaque démarrage suivant, c'est le tableau de bord de Titan qui vous accueille : une interface à l'aspect vitré, divisée en deux moitiés (la disposition 50/50).

-   **Moitié gauche (configuration).** Elle abrite le **Bot Selector** (la barre latérale où vous faites défiler et sélectionnez le profil de bot à afficher) et le **Feed Manager**, c'est-à-dire la liste des sources associées au bot sélectionné. C'est là que vous indiquez au logiciel quoi chercher.
-   **Moitié droite (exploitation).** La zone d'exécution : le bouton **Ignition** (le grand bouton Play central qui allume et éteint le moteur), les compteurs d'envois et la console noire des **Journaux Système** (System Logs), qui montre ligne après ligne ce que fait le bot en temps réel.

En haut de la moitié droite, une barre affiche le logo, le nom et la version installée ; à droite se trouvent l'indicateur **en ligne/hors ligne** (lorsqu'un bot est sélectionné) et l'icône en forme d'engrenage qui ouvre les Paramètres Système (Chapitres 7 et 8).

![Le tableau de bord moteur allumé : les bots à gauche, les sources au centre, l'exécution et les journaux à droite.](screenshots/03-dashboard-online.png)

*Conseil.* Une fois le bouton Play enfoncé, peu importe le bot que vous regardez : moteur allumé, Titan travaille en arrière-plan sur **tous** les bots actifs à la fois. La sélection de gauche ne sert qu'à vous, pour consulter la configuration de ce profil.

### 3.2 Le panneau « Journaux Système »
La console des journaux, en bas à droite, est le reflet direct du moteur asynchrone. Elle reste en anglais même quand l'interface est dans une autre langue : ainsi les messages demeurent un standard technique universel, pratique lorsque vous devez demander de l'aide.

![La console des Journaux Système montre en temps réel, ligne après ligne, ce que fait le moteur.](screenshots/14-log-console.png)

Les messages sont codés par couleur pour une lecture rapide :

-   🟢 **Vert (`Sent` / `Found New Item`) :** un nouvel élément a été trouvé et envoyé à Telegram.
-   🟡 **Jaune/orange (`Skipped` / `FloodWait`) :** le moteur a ignoré un élément (par exemple parce qu'il est antérieur à la *Date de début*) ou Telegram a demandé une pause anti-spam, que le bot gère tout seul.
-   🔴 **Rouge (`Error` / `Failed`) :** une erreur critique, comme une connexion interrompue, un jeton API erroné ou un changement dans les serveurs de YouTube.
-   ⚪ **Gris/blanc (`Fetching` / `No updates`) :** administration courante. Le bot lit la source mais n'a rien trouvé de neuf depuis le dernier contrôle.

La barre en haut du panneau propose trois commandes :

-   **Tous / Ce Bot :** filtre le flux en affichant tous les bots ou seulement celui qui est sélectionné, pratique quand vous en avez beaucoup d'actifs à la fois.
-   **Exporter :** enregistre l'intégralité du relevé dans un fichier `.txt`, indispensable si vous devez le transmettre à un technicien pour un contrôle.
-   **Effacer :** vide l'affichage des journaux. Cela ne touche pas l'historique des envois, seulement ce que vous voyez à l'écran.

### 3.3 Comprendre les statistiques
De part et d'autre du bouton d'allumage, l'interface affiche trois nombres : **Aujourd'hui (Today)**, **7 jours (Week)** et **Total**. Ils se mettent à jour tout seuls toutes les 30 secondes pendant que le moteur tourne et ne comptent que les **messages envoyés avec succès** sur le bot sélectionné.

À côté du Total, une icône en forme de graphique : ouvrez-la pour le panneau de détail. Outre ces trois mêmes nombres, il vous montre la répartition **par source** : quel flux a produit combien d'envois, du plus actif au moins actif. Vous voyez ainsi d'un coup d'œil quelles sources alimentent vraiment le canal.

![Le panneau de détail des statistiques, avec la répartition des envois par source.](screenshots/07-stats-modal.png)

*Note.* Si vous utilisez le bouton **Effacer l'historique** (Clear History) dans les paramètres du bot, ces compteurs reviennent eux aussi à zéro : l'historique des envois est supprimé.

---
