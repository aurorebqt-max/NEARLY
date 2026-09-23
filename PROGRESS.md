# Nearly — progression et reprise

Mise à jour : 23 septembre 2026. Mission autorisée : **mission 1 — initialisation**. Ne pas commencer la mission suivante sans accord.

## Fonctionnalités terminées
- Application React + TypeScript + Vite, dépendances verrouillées par package-lock.json.
- Palette officielle, composants réutilisables, cœur SVG original et animation décorative avec réduction des mouvements.
- Écran de bienvenue, bouton de démarrage et accueil temporaire présentant les fonctions futures.
- Navigation web, historique et routes préparées pour Rencontres, Cœurs et Profil (pages d'attente explicites).
- Mise en page responsive, commandes tactiles, focus clavier et zones sûres mobiles.
- Documentation des règles validées : sens directionnel, consentement préalable, distinction pause/invisible et conservation des cœurs/matchs dans ces deux modes.

## En cours
Aucune fonctionnalité en cours. Mission 1 terminée et vérifiée ; attendre l’accord avant la mission suivante.

## Non implémenté
Authentification, profils réels, questionnaire, algorithme de compatibilité, rencontres, radar, envoi/réception de cœurs, compteur, matchs, paramètres, backend, Bluetooth, notifications push et données de santé. Les présentations visuelles ne sont pas des fonctionnalités métier terminées.

## Décisions encore ouvertes
Voir Docs/06-questions-ouvertes.md : questionnaire et pondérations, paramètres détaillés de confidentialité, définition de « lu », devenir des cœurs/matchs après les 24 h, retrait après match, recroisements, regroupement des notifications, vérification de majorité et conservation des données. Rien de cela n'est décidé par l'interface.

## Vérifications et problèmes
- npm install : réussi après autorisation d'accès réseau ; aucun problème de dépendances signalé par npm.
- Lint : réussi.
- TypeScript et build : réussis ; déclaration Vite des imports CSS ajoutée après une première erreur de type.
- Playwright : **6 tests réussis** sur Chromium mobile (Pixel 7), WebKit mobile (iPhone 13) et Chromium bureau. Parcours, historique, rechargement, pages inconnues, largeur 320 px, réduction des animations et accès clavier vérifiés.
- Captures de bienvenue et accueil générées dans `test-results/` (ignorées par Git) ; inspection visuelle effectuée. Débordement des cercles décoratifs et visibilité du bouton d’accès clavier hors focus corrigés.
- Aucun problème bloquant connu pour ce périmètre. Installation des navigateurs/bibliothèques et ouverture du serveur local ont nécessité les autorisations de l’environnement.
- Aucun téléphone physique disponible dans cette session ; les essais navigateur ne prouvent pas les capacités natives. Une ouverture sur téléphone réel reste à faire via le port 5173, selon README.md.

## Prochaine mission proposée — à autoriser
Revue visuelle sur un téléphone réel, choix du prochain parcours à construire et arbitrage de ses règles ouvertes avant implémentation. La preuve technique de proximité reste nécessaire avant de promettre une détection native.

## Sauvegarde et reprise
- Branche : main ; distant : origin (aurorebqt-max/NEARLY), adresse mise à jour après redirection confirmée par GitHub.
- Premier jalon `bde0a40` poussé avec succès sur GitHub. Le présent bilan accompagne le commit final des corrections mobiles et vérifications.
- Après chaque push, vérifier que `git status --short` est vide et que `git rev-parse HEAD`, `git rev-parse origin/main` et `git ls-remote origin refs/heads/main` donnent le même commit. Le résultat de la vérification finale est communiqué en fin de mission.
- Reprendre par `git status`, ce document, README.md et les décisions de Docs/.
- Installation : `npm ci` ; lancement : `npm run dev` (port 5173, toutes interfaces).
- Contrôles : `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` après installation des navigateurs Playwright.
