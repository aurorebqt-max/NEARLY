# Nearly — progression et reprise

Mise à jour : 23 septembre 2026. Mission autorisée : **mission 2 — interface smartphone**. Mission 1 validée par l’utilisatrice. Ne pas commencer la mission 3 sans accord.

## Fonctionnalités terminées
- Socle React + TypeScript + Vite et palette officielle Nearly conservés.
- Bienvenue et présentation mission 1 conservées à `/#/` et `/#/presentation`.
- Interface distincte exclusivement smartphone : Accueil, Rencontres, Cœurs, Profil.
- Cadre vertical centré sur iPad/ordinateur ; navigation fixe au bas du cadre et contenu défilant ; safe areas CSS.
- Grand cœur rose fixe avec compteur de cœurs non lus fictifs (2 initialement), animation originale à l’ajout local d’un exemple (3), réduction des mouvements respectée.
- Suggestions anonymes fictives, profils de démonstration consultables, durée de 24 h expliquée avec exemples statiques.
- Liste des cœurs fictifs avec expéditeurs identifiés ; aucune lecture automatique ni envoi.
- Profil fictif, espaces photo illustratifs et présentation des futurs paramètres (inactifs).
- Composants communs et fixtures séparés des adaptateurs navigateur. Aucune migration React Native.

## En cours
Aucune fonctionnalité en cours. Mission 2 livrée ; attendre l’accord pour la mission 3.

## Non implémenté
Bluetooth, géolocalisation, push, Supabase, authentification, envoi réel de cœurs, données santé, paramètres effectifs, modification du profil, algorithme de compatibilité, expiration réelle et matchs. Les données de démo sont en mémoire et réinitialisées en quittant le cadre ou en rechargeant la page.

## Décisions encore ouvertes
Voir Docs/06-questions-ouvertes.md : déclencheur du statut lu, sort des cœurs/matchs après 24 h, retrait après match, questionnaire et pondérations, paramètres détaillés, regroupement, recroisements, vérification de majorité et conservation. Aucun de ces choix n’est déduit de la maquette.

## Vérifications et problèmes
- Lint, TypeScript et build réussis.
- 15 tests navigateur réussis sur Chromium mobile, WebKit mobile et Chromium bureau ; largeurs 320 px, 820 px et 1440 px couvertes. Navigation, état fictif, animation, profils, format portrait centré et défilement testés.
- Captures des quatre écrans inspectées ; générées dans test-results/ (ignoré par Git).
- Safe areas prévues dans le CSS, sans validation physique iPhone/Android dans cette session.
- Aucun problème bloquant connu pour le périmètre de démonstration.
- Dépendances existantes réutilisées, aucune installation supplémentaire.

## Prochaine mission — à autoriser
Mission 3 : périmètre à fixer après revue de l’interface smartphone. Définir les règles ouvertes du parcours retenu avant de l’implémenter. Ne pas commencer automatiquement une migration native ou un backend.

## Sauvegarde et reprise
- Branche main ; origin : https://github.com/aurorebqt-max/NEARLY.git.
- Mission 1 sauvegardée au commit 0104697. Le présent bilan accompagne le commit de mission 2 ; la confirmation du push et de la synchronisation est donnée en fin de mission.
- Reprendre par git status, ce fichier, README.md et Docs/.
- Lancement : npm run dev ; ouvrir le port 5173 depuis Codespaces (URL transférée accessible au téléphone autorisé).
- Contrôles : npm run lint, npm run typecheck, npm run build, npm test.
- Après push : vérifier état Git propre et égalité de HEAD, origin/main et git ls-remote origin refs/heads/main.
