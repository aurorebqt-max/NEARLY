# Plan de développement et validation

## Phase 0 — conception (actuelle)
Terminer le registre des décisions ; écrire machines à états, critères d'acceptation, politique de confidentialité et schémas de données. Préciser ce qui est non réalisable ou non validé sur iOS/Android.

## Phase 1 — preuve technique mobile (en parallèle du design)
Avant de construire tout le produit : tester avec **deux téléphones réels** la détection de proximité, les autorisations, le mode verrouillé/arrière-plan et les limites de notification. Documenter résultats mesurés et solution de repli.

## Phase 2 — prototype web simulé
Créer une UI mobile, comptes factices puis authentification, profils, préférences, moteur directionnel, suggestions 24 h simulées, cœur reçu, compteur non lu, match. Signal clair « simulation » ; aucun Bluetooth simulé présenté comme réel.

## Phase 3 — données et durcissement
Schéma validé, SQL/migrations, RLS, tests de droits, anonymat, blocage, signalement, suppression, déduplication et intégrité des matchs.

## Phase 4 — version native
Portage UI et modules réutilisables, véritable adapter de proximité selon faisabilité, permissions, tests de performance et de batterie ; audit avant bêta.

## Phase ultérieure — Crush Sense
Prototype séparé, opt-in, sans export de données de santé vers autrui ; expertise scientifique et juridique préalable.

## Cas d'acceptation minimum
- Si `B correspond à A`, c'est **B** qui reçoit la suggestion ; A ne reçoit pas automatiquement de cœur.
- Si B appuie sur cœur pour A, A reçoit l'alarme et son compteur **non lu** augmente de 1 ; une relecture n'incrémente rien.
- À lecture, le compteur baisse ; cœur/historique ne disparaît pas seulement parce qu'il devient lu.
- Deux cœurs réciproques créent **un seul** match, y compris en simultané.
- Plusieurs événements proches produisent une notification regroupée, pas une rafale.
- Une suggestion expire après 24 h ; le traitement des états liés doit suivre la règle encore à décider.
- Blocage, désactivation radar, suppression du compte et refus des permissions empêchent les accès/notifs non autorisés.
- Pas de liste de coordonnées ou de points représentant des personnes réelles sur le radar.
- Tous les développements passent lint/typecheck/tests/build selon scripts disponibles et tests sur écran mobile.
