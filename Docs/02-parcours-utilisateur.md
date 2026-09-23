# 02 — Parcours et scénarios métier

## Parcours principal A/B
1. A et B ont un compte adulte, un profil valide, un radar activé et les autorisations nécessaires (modalités à valider).
2. A et B se croisent. Le service établit un **événement de proximité admissible** sans afficher de positions précises.
3. Évaluation indépendante : `profil(B) correspond aux préférences(A)` puis `profil(A) correspond aux préférences(B)`.
4. Si B correspond au type de A, **B** reçoit une suggestion anonyme (« Tu pourrais plaire à quelqu'un à proximité »). Si A correspond aussi au type de B, **A** peut recevoir sa propre suggestion ; regrouper les notifications simultanées.
5. La notification ne révèle ni identité, ni photo, ni position exacte de A. B ouvre sa suggestion avant son expiration (24 h) et consulte le profil de A selon le consentement donné à l'activation du radar et les paramètres de confidentialité de A, sans autorisation supplémentaire par rencontre. Cette consultation ne notifie pas A. Un blocage ou le passage de A en mode invisible interdit cet accès.
6. B choisit « Envoyer un cœur ». A reçoit l'alarme distinctive ; le compteur de cœurs **non lus** augmente ; A peut identifier B.
7. A ouvre le cœur : celui-ci devient lu et n'entre plus dans le compteur. A peut envoyer un cœur en retour.
8. Cœurs réciproques => match immédiat. Animation originale ; règles de messagerie à définir.
9. Un utilisateur peut retirer un cœur ; définir précisément la machine à états correspondante avant codage.

## Pause du radar et mode invisible (VALIDÉ)
- Le radar est désactivé par défaut ; son activation est volontaire et autorise la découverte du profil dans les limites des paramètres de confidentialité.
- Si A met son radar en pause, A n'est plus détectable et aucune nouvelle rencontre concernant A n'est créée. B conserve l'accès à une rencontre déjà proposée jusqu'à son expiration normale de 24 heures, sauf blocage ou passage de A en mode invisible.
- Si A passe en mode invisible, aucune nouvelle rencontre concernant A n'est créée et B perd immédiatement l'accès au profil de A par les rencontres potentielles déjà proposées.
- Si A réactive sa visibilité, les rencontres révoquées ne réapparaissent pas automatiquement. Le traitement d'un nouveau croisement reste à définir.
- La pause et le mode invisible préservent l'accès aux cœurs déjà envoyés et aux matchs existants, sauf blocage, suppression du compte ou retrait spécifique. Cela ne tranche pas leur durée après expiration de la suggestion ni les conséquences détaillées du retrait.
- Une rencontre expirée ou révoquée ne permet plus de retrouver le profil de A ; un accès autorisé par un cœur ou un match relève d'un cadre distinct.

## Cas à tester et à décider
- A plaît à B mais B ne plaît pas à A ; la notification part **vers A** si `profil(A)` correspond à `préférences(B)` (vérifier le sens à chaque test).
- Deux cœurs mutuels envoyés quasi simultanément : un seul match, jamais deux.
- Plusieurs personnes compatibles dans un même lieu : une première notification puis regroupement silencieux.
- Deux personnes se recroisent durant 24 h ; après 24 h ; après blocage ; après retrait d'un cœur.
- Profil incomplet, âge non éligible, genres recherchés non précisés, préférences contradictoires.
- Notification reçue alors que l'utilisateur conduit ou ne peut pas ouvrir l'application.
- Perte de réseau, application fermée, téléphone verrouillé, Bluetooth désactivé, permissions refusées.
- Un utilisateur est seul dans une zone : même une alarme « anonyme » peut indirectement révéler sa présence ; tester les mesures de discrétion.
- Suppression de compte, retrait de consentement, signalement et blocage pendant chaque étape.

## Invariant de vocabulaire
- **Suggestion / correspondance** : résultat d'algorithme ; ne prouve pas une attirance.
- **Cœur reçu** : décision volontaire d'un autre utilisateur.
- **Match** : deux cœurs réciproques.
- **Crush Sense** : interprétation exploratoire et privée des propres données, sans affirmation scientifique d'amour.
