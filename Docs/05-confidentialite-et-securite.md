# 05 — Confidentialité, sécurité, conformité : points à instruire

**Document de conception, pas un avis juridique ou une attestation de conformité.** Faire vérifier le dispositif avant test public et avant publication en magasins d'applications.

## Invariants produit
- Adultes uniquement ; déclaration de naissance choisie pour l'inscription, **preuve de majorité non résolue**.
- Radar opt-in (activation volontaire), désactivation immédiate, paramètres de notification ; modalités précises à valider.
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
