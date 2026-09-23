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

## Contraintes métier validées à respecter
Le consentement à la découverte est donné à l'activation volontaire du radar, désactivé par défaut, dans les limites des paramètres de confidentialité. La pause du radar interdit les nouvelles rencontres et la détectabilité sans révoquer les découvertes existantes ; le mode invisible interdit les nouvelles rencontres et révoque immédiatement l'accès au profil dans les découvertes existantes. La réactivation ne restaure pas les rencontres révoquées.

Les accès par découverte potentielle doivent être distingués des accès autorisés par les cœurs déjà envoyés et les matchs existants, que la pause et l'invisibilité préservent sauf blocage, suppression du compte ou retrait spécifique. Une ancienne notification ou un lien conservé ne doit pas permettre de contourner l'expiration ou la révocation d'une rencontre.

**Ne pas écrire les migrations définitives** avant de figer les points restants : paramètres détaillés de confidentialité, sort des cœurs/matchs à l'expiration des 24 h, état des cœurs lus/retirés, conséquences du retrait après match, blocage et politique de conservation.

## Socle livré — mission 1
React + TypeScript + Vite à la racine du dépôt ; React Router avec URLs à fragment pour l'hébergement statique. `src/app` contient le cadre et les routes, `src/features` les écrans, `src/design-system` les tokens sans dépendance et les composants web. `src/domain` est réservé et documenté, sans logique métier inventée.

Le design system expose la palette officielle depuis TypeScript en variables CSS. Les vues web dépendent du DOM ; elles ne sont pas directement portables en React Native. Les tokens et le futur métier pourront être partagés. Aucun adaptateur de proximité, service distant, Supabase ou stockage utilisateur n'est encore implémenté. Les propositions précédentes restent non figées pour les missions suivantes.

## Séparation présentation / prototype smartphone — mission 2
`PresentationShell` conserve les pages de présentation. `PhoneShell` gère uniquement le cadre smartphone, sa navigation et l’état local de démonstration. Les écrans de `src/features/mobile` consomment les données fictives via `src/features/demo`, sans accès réseau ou persistance. Un rechargement ou une sortie de l’interface smartphone réinitialise la démonstration.

Les fixtures et les tokens sont du TypeScript indépendant du DOM. Le contexte React de démonstration n’est pas un moteur métier ni le stockage prévu pour la production. Les composants `ScreenHeading`, `Avatar`, `PersonPreview`, `UnavailableButton` et le cœur sont réutilisés entre les écrans.

La future application cible exclusivement iPhone/Android. Le cadre navigateur et ses safe areas CSS appartiennent à l’adaptateur web ; ils seront remplacés par des vues, une navigation et une gestion des safe areas natives. Aucune dépendance ni migration React Native n’est ajoutée dans cette mission.
