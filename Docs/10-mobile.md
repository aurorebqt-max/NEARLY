# Application mobile native

Le projet Expo/React Native TypeScript est isolé dans `mobile/` ; il ne remplace ni ne modifie le prototype web Vite. Il réutilise le modèle TypeScript partagé de `src/domain/models.ts` et les RPC Supabase déjà protégées par RLS, sans embarquer les adaptateurs navigateur.

## Démarrage

1. Copier `mobile/.env.example` vers `mobile/.env` et renseigner `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` avec l’URL et la clé publique du projet (publishable ou anon, jamais une clé secrète/service_role).
2. Depuis `mobile/`, lancer `npm install`, puis `npm run start`.
3. Ouvrir le projet dans Expo Go ou un build de développement iOS/Android. `npm run ios` et `npm run android` ouvrent les simulateurs correspondants lorsqu’ils sont installés.

Pour les inscriptions avec confirmation e-mail, autoriser le lien `nearly://auth/callback` dans les URL de redirection du projet Supabase. Le schéma `nearly` est déclaré dans `app.json` ; les callbacks PKCE et les liens `token_hash`/OTP sont pris en charge.

## État des écrans

Navigation native à cinq onglets : Accueil, Rencontres, Cœurs, Messages et Profil. L’application gère la session Auth sur AsyncStorage, restaure les liens de confirmation, charge le snapshot `nearly_snapshot`, puis utilise les RPC existantes pour révéler une rencontre, envoyer/lire un cœur, envoyer/lire des messages, enregistrer profil/préférences et gérer la visibilité. Les images du profil sont redimensionnées et réencodées en JPEG, puis envoyées dans le bucket privé existant. Des mises à jour Supabase Realtime rafraîchissent cœurs, matchs et messages ; le rechargement manuel reste disponible.

Le radar demeure informatif et désactivé par défaut : cette version n’implémente ni BLE, ni géolocalisation, ni notifications push. Aucune promesse de détection en arrière-plan n’est faite. Le sélecteur de photos demande l’accès à la photothèque au moment de l’ajout ; aucun accès caméra n’est demandé.

## Vérifications

```sh
cd mobile
npm run typecheck
npm run export:android
npm run export:ios
```

Un export Metro valide la configuration et le bundle Android, mais ne remplace pas les tests sur appareil physique, notamment pour safe areas, clavier, liens de confirmation, haptics et permissions. Le mode développement Expo requiert le service Supabase configuré.
