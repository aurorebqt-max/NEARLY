# Plan de développement et validation

## Phase 0 — conception (continue)
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
- Si `profil(B) correspond aux préférences(A)`, c'est **B** qui reçoit la suggestion ; tester indépendamment le sens inverse. A ne reçoit ni cœur automatique ni notification d'intérêt avant un cœur volontaire.
- La suggestion ne révèle ni identité, ni photo, ni position exacte de A ; B peut découvrir son profil dans Nearly selon son consentement préalable et ses paramètres de confidentialité, sans autorisation par rencontre. La consultation ne notifie pas A.
- Si B appuie sur cœur pour A, A reçoit l'alarme et son compteur **non lu** augmente de 1 ; une relecture n'incrémente rien.
- À lecture, le compteur baisse ; cœur/historique ne disparaît pas seulement parce qu'il devient lu.
- Deux cœurs réciproques créent **un seul** match, y compris en simultané.
- Plusieurs événements proches produisent une notification regroupée, pas une rafale.
- Une suggestion expire après 24 h ; le traitement des états liés doit suivre la règle encore à décider.
- Le radar est désactivé par défaut ; l'activation et le consentement sont volontaires.
- Une pause du radar empêche la détectabilité et toute nouvelle rencontre concernant l'utilisateur, mais préserve l'accès aux rencontres déjà proposées jusqu'à leur expiration normale, sauf blocage ou mode invisible.
- Le mode invisible empêche toute nouvelle rencontre concernant l'utilisateur et révoque immédiatement l'accès à son profil dans les rencontres potentielles déjà proposées. Une réactivation ne restaure pas ces rencontres.
- Une rencontre expirée ou révoquée ne permet plus d'accéder au profil, y compris par une ancienne notification ou un lien conservé.
- La pause et le mode invisible préservent l'accès aux cœurs déjà envoyés et aux matchs existants, sauf blocage, suppression du compte ou retrait spécifique ; ne pas confondre cet accès avec celui d'une rencontre potentielle.
- Blocage, suppression du compte et refus des permissions empêchent les accès/notifs non autorisés selon le cadre concerné ; ne pas assimiler une pause du radar à une révocation des découvertes existantes.
- Pas de liste de coordonnées ou de points représentant des personnes réelles sur le radar.
- Tous les développements passent lint/typecheck/tests/build selon scripts disponibles et tests sur écran mobile.

## Mission 1 — initialisation autorisée
Le développement visuel démarre pendant la poursuite de la conception. Périmètre : socle React/TypeScript/Vite, palette officielle, bienvenue, animation originale, accueil temporaire et navigation vers des pages d'attente. Aucun algorithme ni radar n'est implémenté.

Vérifications de ce socle : lint, TypeScript, build et parcours Playwright sur Chromium mobile, WebKit mobile et Chromium bureau ; liens, historique, rechargement, route inconnue, absence de débordement à 320 px et préférence de réduction des animations. Ces essais navigateur ne remplacent pas un essai sur téléphone physique. Le prototype natif de proximité demeure nécessaire avant toute promesse de détection réelle.

## Mission 2 — interface smartphone
Vérifier les quatre rubriques en Chromium mobile et WebKit mobile, la conservation de la présentation, l’historique et les liens directs. Contrôler le défilement indépendant de la navigation, la largeur 320 px, le cadre vertical centré à 820 et 1440 px, le focus clavier et la réduction des mouvements.

Le test du compteur vérifie 2 → 3 à l’ajout d’un cœur fictif, sa couleur rose constante, l’absence de marquage comme lu lors de la navigation, la liste d’expéditeurs cohérente et l’absence de nouvelle animation au retour à l’accueil. Les tests ne valident aucun backend ni mécanisme réel d’expiration/notification.
