# Premier message à donner à Codex

Tu travailles sur Nearly, en développement progressif avec un cahier des charges vivant. Lis README.md, PROGRESS.md, Docs/ et Technical/ avant toute modification. Les fonctionnalités aux règles validées peuvent être implémentées dans le périmètre de la mission autorisée.

RÈGLES IMPÉRATIVES :
1. Distingue VALIDÉ, PROPOSÉ et À DÉCIDER. N'invente pas de décision manquante.
2. Le sens de la suggestion est crucial : si le profil de B correspond aux préférences de A, **B reçoit** la suggestion « Tu pourrais plaire à quelqu'un ». Si B envoie un cœur à A, **A reçoit** l'alarme emblématique. Si A répond, match immédiat.
3. Le grand cœur compte les **cœurs non lus**, pas les compatibilités, ni tous les cœurs depuis l'inscription.
4. Pas de carte de personnes, de coordonnées en clair, de scores de beauté, de swipe Tinder ou d'utilisation visible de données de santé.
5. Ne copie pas les assets de Love Alarm. Nom Nearly provisoire.
6. La capacité native de proximité en arrière-plan **n'est pas prouvée** : signaler les risques, prévoir une simulation honnête et un prototype technique tôt.
7. Ne commence pas par coder toute l'application ni par générer des migrations SQL définitives.
8. Radar désactivé par défaut ; l'activation volontaire autorise la découverte du profil selon les paramètres de confidentialité, sans accord par rencontre. La suggestion ne révèle ni identité, ni photo, ni position exacte ; consulter un profil ne notifie pas son propriétaire.
9. Distingue impérativement **pause du radar** (plus de détectabilité ni de nouvelles rencontres, découvertes existantes conservées jusqu'à expiration sauf blocage/invisibilité) et **mode invisible** (plus de nouvelles rencontres, accès au profil immédiatement révoqué dans les découvertes existantes, sans restauration automatique à la réactivation).
10. Pause et invisibilité préservent l'accès aux cœurs déjà envoyés et matchs existants, sauf blocage, suppression du compte ou retrait spécifique. Une rencontre expirée/révoquée ne permet plus de retrouver un profil par cette rencontre. Ne déduis pas de ces règles la durée des cœurs/matchs après expiration ni les conséquences détaillées d'un retrait, encore à décider.

REPRISE ET SAUVEGARDE :
- Le diagnostic initial est terminé. La mission 1 initialise le prototype visuel ; consulter PROGRESS.md pour son état réel.
- Ne jamais implémenter une règle ouverte ni commencer une mission suivante sans accord.
- Pour toute phase codée : diff limité, lint/typecheck/tests/build pertinents, description honnête de ce qui fonctionne et des maquettes.
- Mettre à jour PROGRESS.md à chaque jalon cohérent, committer et pousser sur GitHub lorsque autorisé ; vérifier la synchronisation. Ne jamais annoncer une sauvegarde distante sans push réussi.
- Aucun faux Bluetooth, aucune clé secrète dans le client, aucune promesse juridique.
