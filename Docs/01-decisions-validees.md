# 01 — Décisions validées (version de conception)

Ce document sépare les **décisions produit** des préférences fictives citées comme exemples. Ne pas traiter les exemples « brun, bouclé, sportif » ou « Aurore/Lucas » comme des données personnelles de la fondatrice ou comme des valeurs par défaut.

## Identité et intention
- **VALIDÉ** : application originale de rencontre par proximité, nom de travail Nearly ; mélange visuel moderne et romantique.
- **VALIDÉ** : ne pas imiter les actifs protégés ni le nom de la série *Love Alarm*.
- **VALIDÉ** : pas de swipe type Tinder, notes publiques du physique, scores de beauté, cartes des personnes autour de soi, classement de popularité, notifications incessantes, fonctionnalités essentielles payantes, ou données de santé visibles par autrui.

## Mécanique fondamentale, directionnelle
- **VALIDÉ** : si le profil de **B** correspond aux préférences de **A** et qu'une rencontre admissible est détectée, **B** reçoit une première notification anonyme : « Tu pourrais plaire à quelqu'un à proximité. »
- **VALIDÉ** : la notification anonyme ne révèle ni l'identité de A, ni sa photo, ni sa position exacte. B peut découvrir le profil de A dans ses rencontres potentielles, selon le consentement préalable et les paramètres de confidentialité de A décrits ci-dessous, sans autorisation supplémentaire par rencontre.
- **VALIDÉ** : consulter le profil de A ne déclenche aucune notification à A. Aucune notification d'intérêt n'est envoyée à A avant l'envoi volontaire du cœur de B.
- **VALIDÉ** : B peut envoyer volontairement un cœur à A ; **A** reçoit alors l'alarme emblématique et découvre l'identité de B.
- **VALIDÉ** : si A envoie un cœur en retour, **match immédiat**. Les correspondances A→B et B→A sont évaluées indépendamment. Une simple compatibilité n'est pas un cœur.
- **VALIDÉ** : rencontre potentielle disponible **24 heures** ; sort des cœurs et matchs une fois cette fenêtre expirée : **À DÉCIDER**.
- **VALIDÉ** : plusieurs détections proches dans le temps sont regroupées intelligemment pour éviter des vibrations en rafale ; fenêtre de regroupement : **À DÉCIDER**.
- **VALIDÉ** : grand cœur rose (couleur fixe), animation lors d'un cœur reçu, **compteur de cœurs non lus** ; le compteur revient à zéro lorsqu'ils sont consultés, tandis que l'historique éventuel demeure selon les règles à décider.
- **VALIDÉ** : retrait d'un cœur autorisé ; conséquences en cas de match ou de conversation : **À DÉCIDER**.

## Consentement, pause du radar et mode invisible
- **VALIDÉ** : radar désactivé par défaut. En l'activant volontairement, A accepte que son profil Nearly soit proposé aux utilisateurs qu'elle croise et qui correspondent à ses préférences, dans les limites de ses paramètres de confidentialité. Ce consentement ne constitue pas un intérêt exprimé pour chaque personne ; seul un cœur volontaire exprime cet intérêt.
- **VALIDÉ — radar en pause** : l'utilisateur n'est plus détectable et aucune nouvelle rencontre le concernant n'est créée. Les rencontres déjà proposées restent accessibles jusqu'à leur expiration normale de 24 heures, sauf blocage ou passage en mode invisible.
- **VALIDÉ — mode invisible** : effet immédiat ; aucune nouvelle rencontre concernant l'utilisateur n'est créée et son profil devient inaccessible dans les rencontres potentielles déjà proposées. Ces découvertes sont révoquées, pas simplement masquées.
- **VALIDÉ** : l'utilisateur peut réactiver sa visibilité à tout moment ; les rencontres révoquées ne réapparaissent pas automatiquement. Les règles de création d'une nouvelle rencontre lors d'un recroisement restent **À DÉCIDER**.
- **VALIDÉ** : la pause du radar et le mode invisible préservent l'accès aux cœurs déjà envoyés et aux matchs existants, sauf blocage de la personne concernée, suppression du compte ou fonction de retrait spécifique. Les conséquences détaillées du retrait et le sort des cœurs/matchs à l'expiration des 24 heures restent **À DÉCIDER**.
- **VALIDÉ** : une rencontre expirée ou devenue inaccessible ne permet plus de retrouver le profil concerné par cette rencontre. L'accès éventuellement autorisé dans le cadre d'un cœur ou d'un match est distinct de l'accès par découverte potentielle.
- **VALIDÉ** : les profils sont accessibles uniquement aux utilisateurs autorisés dans le cadre de Nearly ; aucune position exacte ni historique de déplacements n'est affiché.

## Inscription et profil
- **VALIDÉ** : inscription e-mail + Apple + Google.
- **VALIDÉ** : accès destiné aux personnes de **18 ans et plus** ; date de naissance déclarée à l'inscription. Cela **ne constitue pas** à lui seul une vérification d'âge fiable ; approche de sûreté à définir avant lancement public.
- **VALIDÉ** : **1 à 6 photos** ; **prénom affiché** ; profil de base + champs additionnels choisis par la personne.
- **VALIDÉ** : description des caractéristiques physiques par l'utilisateur lui-même, sans analyse automatique de photos en première version.
- **VALIDÉ** : intentions de rencontre prises en compte pour la compatibilité ; catégories et logique précise **À DÉCIDER**.

## Préférences et apprentissage
- **VALIDÉ** : questionnaire comprenant caractéristiques individuelles et portraits fictifs complets ; modes visuels exacts à préciser.
- **VALIDÉ** : importance personnalisée des préférences physiques, distincte des critères essentiels (âge et genre recherchés).
- **VALIDÉ** : équilibre entre physique et personnalité dans la correspondance ; pondération exacte **À DÉCIDER**.
- **VALIDÉ** : apprentissage progressif avec validation des changements importants par l'utilisateur, jamais de modification silencieuse des critères essentiels.
- **VALIDÉ** : plusieurs modes de découverte : habituel, découverte, événement ; modalités **À DÉCIDER**.
- **VALIDÉ** : la réponse « Je préfère ne pas préciser pour le moment » pour les genres recherchés est un **report de réponse**, pas « tous les genres ». Le comportement de l'algorithme en cas de renseignement manquant est **À DÉCIDER**.
- **CONTEXTE D'EXEMPLE, PAS DÉCISION PRODUIT** : tranche 18–35 ans fournie lors du questionnaire ; confirmer si c'est un réglage de démonstration ou une plage initiale souhaitée pour le produit. Ce n'est pas une restriction globale d'âge déjà validée.

## Crush Sense / Heart Diary
- **PROPOSÉ, NON PLANIFIÉ POUR LA PREMIÈRE VERSION** : journal privé, optionnel, pouvant rapprocher des rencontres d'événements physiologiques et de confirmations volontaires.
- **PRINCIPE VALIDÉ DANS LES ÉCHANGES** : un BPM élevé ne prouve aucune attirance ; prendre en compte effort/contexte, éviter les notifications répétitives, ne pas attribuer une réaction à une personne sans confirmation, ne partager aucune donnée de santé avec d'autres utilisateurs.
- Intégration Apple Health / montres, faisabilité, conformité, preuve scientifique : **À ÉTUDIER**, sans promesse de « détecteur de béguin ».
