# 05 — Confidentialité, sécurité, conformité : points à instruire

**Document de conception, pas un avis juridique ou une attestation de conformité.** Faire vérifier le dispositif avant test public et avant publication en magasins d'applications.

## Invariants produit
- Adultes uniquement ; déclaration de naissance choisie pour l'inscription, **preuve de majorité non résolue**.
- Radar désactivé par défaut. Son activation volontaire vaut consentement préalable à la découverte du profil par les utilisateurs croisés correspondant aux préférences de la personne, dans les limites de ses paramètres de confidentialité, sans autorisation supplémentaire par rencontre.
- Radar en pause : plus de détectabilité ni de nouvelles rencontres concernant l'utilisateur ; rencontres déjà proposées accessibles jusqu'à leur expiration normale de 24 heures, sauf blocage ou mode invisible.
- Mode invisible : aucune nouvelle rencontre concernant l'utilisateur ; accès à son profil immédiatement révoqué dans les rencontres potentielles déjà proposées. Réactiver la visibilité ne restaure pas automatiquement ces rencontres.
- La pause et le mode invisible préservent l'accès aux cœurs déjà envoyés et aux matchs existants, sauf blocage, suppression du compte ou retrait spécifique. Leur durée après expiration d'une suggestion et les conséquences détaillées du retrait restent à décider.
- Une rencontre expirée ou révoquée ne donne plus accès au profil concerné. Les accès autorisés par un cœur ou un match sont distincts des accès par rencontre potentielle.
- Notification de suggestion sans identité, photo ni position exacte ; aucune notification de consultation du profil, ni notification d'intérêt avant un cœur volontaire.
- Pas de carte, pas de localisation précise ni de trajectoire historique exposées à d'autres utilisateurs.
- Pas de révélation automatique de préférences intimes ; profils visibles uniquement selon des règles explicites de consentement.
- Blocage, signalement, limitation des abus, suppression du compte et de ses données.
- Un tiers ne voit jamais les données de santé, les interprétations émotionnelles ni les retours privés de Crush Sense.

## Questions de risque prioritaires
1. Un signal anonyme peut identifier de fait une personne dans un lieu vide ; envisager des garde-fous adaptés, temporisation, politique de dévoilement et prévention du harcèlement.
2. Quelles bases légales et quelles informations de consentement pour les données de proximité, les préférences potentiellement sensibles et, plus tard, les données de santé ?
3. Une AIPD/DPIA est-elle nécessaire ? À examiner avant lancement public.
4. Quelle politique de conservation pour événements de proximité (minimisation), suggestions 24 h, cœurs, matchs et messages ?
5. Quelles politiques RLS Supabase, limitation de taux, anti-énumération, anti-usurpation de proximité, modération d'images et signalements ?
6. Respect des restrictions d'Apple/Google pour l'arrière-plan, les notifications, HealthKit et les permissions.

## Crush Sense : séparation obligatoire
Fonction entièrement facultative, sans blocage de la fonction de rencontre. Ne pas utiliser BPM seul, ne pas inférer la cible de l'attirance, ne pas promettre de classifier des sentiments ; distinguer clairement observation, interprétation hypothétique et confirmation utilisateur. Étudier traitement local des données et autorisations d'accès aux sources de santé.
