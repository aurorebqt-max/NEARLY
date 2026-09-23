# Architecture proposée (à valider après les décisions métier)

## Deux couches séparées
1. **Prototype fonctionnel web**, possible depuis Codespaces/iPad : React, TypeScript, Vite, Supabase et Vercel, avec simulation explicite de rencontre et de notification ; permet de valider UX, direction des alertes, cœurs, compteur et tests.
2. **Prototype natif de proximité sur deux vrais téléphones** : vérifier tôt Bluetooth, fonctionnement en arrière-plan, téléphone verrouillé, autorisations, batteries et limites de publication. Ne pas vendre la fonctionnalité comme acquise.

Évolution envisageable : React Native/Expo avec builds de développement natifs et code métier TypeScript partagé ; les capacités Bluetooth et santé dépendront des API et limitations réelles des plateformes. Vercel héberge le web, pas un binaire mobile.

## Modules envisagés
`auth` · `profile` · `preferences` · `compatibility` · `encounter` · `proximity-adapter` · `suggestions` · `hearts` · `matches` · `notifications` · `privacy` · `reporting` ; `crush-sense` en module optionnel ultérieur.

## Supabase (noms provisoires)
`profiles`, `profile_photos`, `preferences`, `radar_settings`, `encounters`, `suggestions`, `hearts`, `matches`, `blocks`, `reports` ; `messages` si la messagerie est validée.

Politique par défaut : RLS explicite, opérations sensibles serveur, pas de clé de service dans le client, pas d'accès direct transversal aux préférences ou aux événements de proximité, identifiants temporaires/non corrélables pour détection si pertinents, politiques de rétention et suppression testées.

**Ne pas écrire les migrations définitives** avant de figer : exposition des profils, expiration 24 h, état des cœurs lus/retirés, réciprocité/match, bloqueurs et politique de conservation.
