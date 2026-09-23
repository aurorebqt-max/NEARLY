# Nearly — progression et reprise

Mise à jour : 23 septembre 2026. Mission autorisée et finalisée : **mission 3 — finition visuelle de l’interface smartphone**. Missions 1 et 2 validées. Ne pas commencer la mission 4 sans accord.

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
- Mission 3 : raffinement visuel « Romantic Future » dans `src/app/romantic-future.css` (dégradés nuit/rose, typographie, respirations du cœur, focus et états tactiles), sans nouvelle règle métier.
- Mission 3 : portrait SVG original et fictif sur le profil, section « Ce qui vous ressemble » et boutons de présentation des futurs paramètres (inactifs, libellé « À venir »).
- Mission 3 : états vides fictifs sur Rencontres et Cœurs (bascule de démonstration), synthèse des cœurs non lus et aperçu visuel de match sans création de match.
- Mission 3 : présentation uniquement — aucune expiration, lecture, envoi, compatibilité ou persistance réelle ajoutée.

## En cours
Aucune fonctionnalité en cours. Mission 3 livrée ; attendre l’accord pour la mission 4.

## Non implémenté
Bluetooth, géolocalisation, push, Supabase, authentification, envoi réel de cœurs, données santé, paramètres effectifs, modification du profil, algorithme de compatibilité, expiration réelle et matchs. Les données de démo sont en mémoire et réinitialisées en quittant le cadre ou en rechargeant la page.

## Décisions encore ouvertes
Voir Docs/06-questions-ouvertes.md : déclencheur du statut lu, sort des cœurs/matchs après 24 h, retrait après match, questionnaire et pondérations, paramètres détaillés, regroupement, recroisements, vérification de majorité et conservation. Aucun de ces choix n’est déduit de la maquette.

## Vérifications et problèmes
- Lint, TypeScript et build réussis après la finition mission 3.
- 21 tests navigateur réussis sur Chromium mobile, WebKit mobile et Chromium bureau ; largeurs 320 px, 360 px, 430 px, 820 px et 1440 px couvertes. Navigation, état fictif, animation, profils, format portrait centré, défilement, états vides, aperçu de match, cibles tactiles ≥ 44 px et marges de safe area testés.
- Captures des écrans inspectées lors des missions précédentes ; générées dans test-results/ (ignoré par Git).
- Safe areas prévues dans le CSS, sans validation physique iPhone/Android dans cette session.
- Aucun problème bloquant connu pour le périmètre de démonstration.
- Dépendances existantes réutilisées, aucune installation supplémentaire.

## Prochaine mission — à autoriser
Mission 4 : périmètre à fixer après revue de la finition visuelle. Définir les règles ouvertes du parcours retenu avant de l’implémenter. Ne pas commencer automatiquement une migration native ou un backend.

## Sauvegarde et reprise
- Branche main ; origin : https://github.com/aurorebqt-max/NEARLY.git.
- Mission 1 sauvegardée au commit 0104697 ; mission 2 au commit a8c3cf3. Le présent bilan accompagne le commit de mission 3 ; la confirmation du push et de la synchronisation est donnée en fin de mission.
- Reprendre par git status, ce fichier, README.md et Docs/.
- Lancement : npm run dev ; ouvrir le port 5173 depuis Codespaces (URL transférée accessible au téléphone autorisé).
- Contrôles : npm run lint, npm run typecheck, npm run build, npm test.
- Après push : vérifier état Git propre et égalité de HEAD, origin/main et git ls-remote origin refs/heads/main.
