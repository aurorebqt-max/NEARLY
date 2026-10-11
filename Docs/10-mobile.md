# Application mobile native

Le projet Expo/React Native TypeScript est isolé dans `mobile/` ; il ne remplace ni ne modifie le prototype web Vite. Il réutilise le modèle TypeScript partagé de `src/domain/models.ts` et les RPC Supabase déjà protégées par RLS, sans embarquer les adaptateurs navigateur.

## Démarrage

1. Copier `mobile/.env.example` vers `mobile/.env` et renseigner `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` avec l’URL et la clé publique du projet (publishable ou anon, jamais une clé secrète/service_role).
2. Depuis `mobile/`, lancer `npm install`, puis `npm run start`.
3. Ouvrir le projet dans Expo Go ou un build de développement iOS/Android. `npm run ios` et `npm run android` ouvrent les simulateurs correspondants lorsqu’ils sont installés.

Pour les inscriptions avec confirmation e-mail, autoriser le lien `nearly://auth/callback` dans les URL de redirection du projet Supabase. Le schéma `nearly` est déclaré dans `app.json` ; les callbacks PKCE et les liens `token_hash`/OTP sont pris en charge.

## Installer sur un téléphone

`app.json` déclare les identifiants `com.nearly.app` pour iOS et Android. `eas.json` contient les profils `development`, `preview` (APK Android distribuable) et `production`. Aucun `projectId` EAS n’est inventé ou commité : créez/associez le projet depuis votre compte Expo, puis fournissez `EXPO_PUBLIC_EAS_PROJECT_ID` dans l’environnement EAS et dans `mobile/.env`. Ajoutez également les deux variables publiques Supabase aux environnements de build EAS.

Avec EAS CLI et un compte Expo configuré :

```sh
cd mobile
npx eas-cli build --profile development --platform android
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile development --platform ios
```

Le build iOS de distribution requiert un compte Apple et les certificats/profils de signature correspondants ; EAS peut les créer après authentification. Aucun build distant ni publication App Store/Play Store n’a été lancé. Un export Metro n’est pas un APK/IPA installable.

## État des écrans

Après inscription/connexion réelle, la session Supabase est persistée dans AsyncStorage et les profils incomplets restent dans l’onboarding jusqu’à validation serveur. L’onboarding reprend ses champs depuis un brouillon local, vérifie l’âge déclaré, exige une intention et 1 à 6 photos, puis enregistre les critères et le profil. Le profil permet l’édition, l’ajout/retrait/réorganisation des photos privées, les préférences directionnelles, le radar, l’export JSON, la suppression de compte et la déconnexion. Le parcours natif expose les rencontres, les cœurs, les matchs, les messages, le blocage et le signalement ; les RPC/RLS restent l’autorité backend.

Les photos sont choisies depuis la photothèque, réencodées en JPEG et gardées dans le bucket privé. La vérification d’identité n’est pas implémentée : ne pas afficher de badge vérifié sur la base d’une simulation.

Le radar serveur gère les consentements et croisements transmis, mais aucun scanner/advertiser BLE natif n’est inclus ; la détection de proximité réelle n’est donc pas encore disponible. Le sélecteur demande l’accès à la photothèque au moment de l’ajout ; aucun accès caméra n’est demandé.

Les notifications push nécessitent un build EAS sur appareil physique. Déployez `send-push`, renseignez `PUSH_WEBHOOK_SECRET` dans les secrets de la fonction et ajoutez dans le Vault Supabase `nearly_push_function_url` (URL complète de `send-push`) et `nearly_push_webhook_secret` (même secret). La migration `202610110002_push_dispatch.sql` émet les événements cœur, match et message ; sans ces deux secrets, les opérations sociales continuent et le serveur écrit un avertissement, mais aucun push n’est distribué. Déployez aussi `delete-account` pour activer la suppression distante.

Les migrations non encore vérifiées sur le projet distant sont `202610100004_push_tokens.sql`, `202610100005_proximity.sql`, `202610110001_photo_order.sql` et `202610110002_push_dispatch.sql`. Vérifiez l’historique Supabase distant avant tout `db push`; aucune migration distante n’a été appliquée pendant cette reprise.

## Vérifications

```sh
cd mobile
npm run typecheck
npm run export:android
npm run export:ios
```

Un export Metro valide la configuration et le bundle Android, mais ne remplace pas les tests sur appareil physique, notamment pour safe areas, clavier, liens de confirmation, haptics et permissions. Le mode développement Expo requiert le service Supabase configuré.
