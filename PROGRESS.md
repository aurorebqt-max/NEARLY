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
- Vérifications navigateur et sauvegarde de fin de mission. Mettre à jour cette section après les résultats.

## Non implémenté
Authentification, profils réels, questionnaire, algorithme de compatibilité, rencontres, radar, envoi/réception de cœurs, compteur, matchs, paramètres, backend, Bluetooth, notifications push et données de santé. Les présentations visuelles ne sont pas des fonctionnalités métier terminées.

## Décisions encore ouvertes
Voir Docs/06-questions-ouvertes.md : questionnaire et pondérations, paramètres détaillés de confidentialité, définition de « lu », devenir des cœurs/matchs après les 24 h, retrait après match, recroisements, regroupement des notifications, vérification de majorité et conservation des données. Rien de cela n'est décidé par l'interface.

## Vérifications et problèmes
- npm install : réussi après autorisation d'accès réseau ; aucun problème de dépendances signalé par npm.
- Lint : réussi.
- TypeScript et build : réussis ; déclaration Vite des imports CSS ajoutée après une première erreur de type.
- Navigateurs Playwright : installation en cours. Résultats non encore confirmés.
- Aucun téléphone physique disponible dans cette session ; les essais navigateur à venir ne prouveront pas les capacités natives.

## Prochaine mission proposée — à autoriser
Revue visuelle sur un téléphone réel, choix du prochain parcours à construire et arbitrage de ses règles ouvertes avant implémentation. La preuve technique de proximité reste nécessaire avant de promettre une détection native.

## Sauvegarde et reprise
- Branche : main ; distant : origin (aurorebqt-max/FREYMO).
- Ce fichier accompagne le premier jalon local ; ne pas présumer que GitHub est synchronisé avant confirmation du push.
- Reprendre par `git status`, ce document, README.md et les décisions de Docs/.
- Installation : `npm ci` ; lancement : `npm run dev` (port 5173, toutes interfaces).
- Contrôles : `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` après installation des navigateurs Playwright.
