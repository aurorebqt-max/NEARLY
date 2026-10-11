# Nearly — progression et reprise

Mise à jour : **10 octobre 2026**. Sprint 4 engagé : première application Expo/React Native en place dans `mobile/`, le web et le mode local/mock sont conservés.

## Reprise du 11 octobre 2026 — sauvegarde en pause

- Au début de la reprise, le seul Codespace accessible était `/workspaces/FREYMO`, dépôt `aurorebqt-max/NEARLY`, branche `main` à `f32d431` (identique à `origin/main`). Les commits `ffeffd1` et `9ae36a6` ne sont pas présents dans les références ou objets Git accessibles ; `gh codespace list` ne montre pas d’autre environnement. Les fichiers `/tmp/nearly-sprint4-sauvegarde.patch` et `/tmp/nearly-sprint4-fichiers.tar.gz` ont été retrouvés, et le patch correspondait aux modifications locales suivies.
- GitHub Auth est connecté au compte `aurorebqt-max`; les permissions du dépôt comprennent `push`, et `git push --dry-run origin main` a répondu `Everything up-to-date`.
- Complété dans cette reprise : verrouillage de l’accès au parcours principal jusqu’à l’onboarding, reprise locale du brouillon, contrôles de profil adulte déclaratif, sauvegarde des préférences/questionnaire, import manquant qui empêchait les bundles natifs, réorganisation des photos (nouvelle migration SQL), signalement/blocage depuis la conversation, export JSON, suppression distante du compte (Edge Function), vérification bidirectionnelle des blocages sur les push, et distribution serveur des événements cœur/match/message (Edge Function + migration, à configurer côté Supabase).
- Vérifications passées : typecheck mobile, exports Metro Android et iOS, lint et build web, `git diff --check`. Les deux exports ne sont pas des APK/IPA installables. `npm run test:supabase` n’a pas pu démarrer : aucun conteneur Supabase/Docker correspondant ni volume Supabase disponible ; `supabase migration list --local` échoue en connexion refusée. Aucun schéma n’a été appliqué localement ou à distance durant cette reprise.
- Bloqueurs d’installation : `EXPO_PUBLIC_EAS_PROJECT_ID` et les URL/clés publiques Supabase de développement ne sont pas configurés ; aucun build EAS distant n’a été lancé. Le build iOS installable nécessitera également un compte Apple/certificats. Le scan BLE natif reste absent et aucun essai physique n’a été fait.
- Sauvegarde effectuée : commit `6879a83` (`feat: advance Nearly native onboarding and services`) poussé sur `origin/main`; la vérification `git ls-remote` a confirmé `6879a83f18598ddc64f8ca6c3f7e7edd2c07598f`, et l’arbre de travail était propre. Avant tout `db push`, comparer l’historique distant des migrations `202610100004`, `202610100005`, `202610110001` et `202610110002`.

## Sprint 4 — application native, premier bloc

État initial repris : `main`/`origin/main` à `e5cdf45` (`fix: stabilize Supabase auth and validate real account photo flows`), arbre propre. Aucun projet natif, manifeste Expo ou dépendance React Native préexistants ; `src/features/mobile` contient les vues web à ne pas porter telles quelles.

Livré dans le premier bloc :
- Application Expo SDK 54 / React Native / TypeScript autonome dans `mobile/`, avec ses dépendances et lockfile distincts ; Vite, le package racine et les routes web restent en place.
- Navigation native à cinq onglets : Accueil, Rencontres, Cœurs, Messages et Profil ; surfaces adaptées au thème Nearly, safe areas, clavier natif et retour haptique discret.
- Auth Supabase e-mail/mot de passe avec session persistée sur AsyncStorage, callbacks de confirmation par lien et messages d’erreur explicites.
- Chargement du snapshot `nearly_snapshot` et appels aux RPC existantes pour rencontres, cœurs, conversations/messages, visibilité, profil et préférences ; aucun code métier Supabase copié dans une API parallèle.
- Édition native du profil, ajout/retrait de portraits privés via le bucket existant (redimensionnement/réencodage JPEG, limite 5 Mo), tranche d’âge, radar/invisibilité.
- Migration `202610100003_realtime.sql` pour publier cœurs, matchs, conversations et messages ; abonné mobile protégé par RLS, avec rechargement manuel si Realtime est indisponible.
- Aucune proximité, BLE, géolocalisation, notifications push ou accès caméra/microphone ajouté.

Validation locale : `npm --prefix mobile run typecheck`, exports Metro Android et iOS, `npm run lint`, `npm run build` et `npm run test:supabase` passés. Les deux bundles natifs sont produits. Migration 003 appliquée au Supabase local sans reset ; Realtime contient les quatre tables attendues. Aucune modification appliquée à un projet Supabase distant. Pas encore de validation sur appareils iOS/Android physiques. Variables de lancement et limites : `Docs/10-mobile.md`.

À poursuivre dans le Sprint 4 : essais d’authentification/confirmation sur appareil, parcours natifs et composants de présentation profil approfondis, puis tests sur appareils réels. Permissions/notifications ne sont pas encore validées ; BLE reste optionnel, isolé et non commencé.

Branche : `main` ; `origin/main` était synchronisé à `e5cdf45` lors de la reprise.

---

## Historique — Sprint 2 Supabase repris et validé en local

## Sprint 2 — reprise Supabase du 10 octobre 2026

État retrouvé : `main` à `d43809a`, synchronisé avec la référence locale `origin/main`. Les commits `ebd8a0d` (schéma/RPC/contrats) et `d43809a` (adaptateur et écrans) préexistaient. Seuls `scripts/test-supabase.mjs` et `supabase/.gitignore` étaient non suivis ; aucun diff sur les fichiers suivis.

Déjà implémenté : client Supabase, variables publiques dans `.env.example`, choix local/Supabase, session e-mail/mot de passe, profils et préférences persistants, Storage privé, commandes cœurs/matchs/conversations/messages/blocage/signalement et polling de 10 secondes. Laboratoire et services locaux conservés.

Migrations conservées : `202610100001_nearly.sql` et `202610100002_photos.sql`. Tables : profiles, profile_photos, preferences, physical_traits, interests, personality_preferences, encounters, hearts, matches, conversations, messages, blocks, reports, verification_requests. RLS et RPC définies ; bucket privé `profile-photos` (JPEG/PNG/WebP, 5 Mo).

À la reprise, aucun conteneur, volume ou image Docker ; ancien journal `/tmp/nearly-supabase-start.log` absent. Le téléchargement a saturé le disque et empêché PostgreSQL de démarrer (ENOSPC). Stockage Docker déplacé intégralement vers `/tmp/nearly-docker-data`, montage conservé à `/var/lib/docker`, sans purge de fichiers ou volumes. Attention : `/tmp` est éphémère dans cet environnement. Journaux : `/tmp/nearly-supabase-resume.log` et `/tmp/nearly-supabase-resume-2.log`.

Corrections et ajouts de reprise :
- Tests existants raccordés à `npm run test:supabase`, imports Node corrigés, assertions migrations/RLS/inscription publique/persistance après reconnexion et données invalides ajoutées.
- Parcours navigateur réel ajouté (`npm run test:supabase:ui`) : connexion, photo décodée/réencodée et téléversée, profil, préférences, rechargement, déconnexion/reconnexion, retour à la démo.
- Client Supabase unique pour éviter les instances Auth concurrentes sous React StrictMode. Libellés connexion/profil/signalement adaptés au mode réel.
- Redirections Auth alignées sur Vite (5173, preview 4173, test 5175), mot de passe minimum 8 caractères, seed automatique désactivé (aucun seed de fixtures).
- `.env.local` créé avec URL et clé publique locales uniquement ; ignoré par Git, mode local conservé par défaut. README et `Docs/09-supabase.md` actualisés.

Validation : deux migrations initiales appliquées sans réécriture ; `migration list --local` confirme leurs versions, `db lint --local` ne trouve aucune erreur SQL. Les 14 tables ont RLS et politiques, vérifiées en base et par tests intercomptes. Suite Supabase API et parcours navigateur passés. Lint, typecheck, build, 54 tests application et 2 tests laboratoire passés ; validation finale relancée après les dernières corrections.

Diagnostic environnement résolu : ACL par défaut de `/tmp` corrigée sur le stockage Docker déplacé (racines de snapshots restaurées en 0755), puis mode iptables legacy rétabli pour éliminer le conflit legacy/nft empêchant Realtime de joindre PostgreSQL. Le démarrage a ensuite appliqué les migrations normalement. Aucun reset de base ni réécriture des migrations. Les démarrages ratés ont automatiquement nettoyé leurs conteneurs/volumes initiaux vides ; aucune donnée applicative préexistante n'était présente dans cet environnement. Journal réussi : `/tmp/nearly-supabase-final-start.log` (peut contenir des clés locales, ne pas publier).

Sauvegarde intermédiaire : `6ef9556` poussé sur `origin/main`.

Limites : aucun projet hébergé connecté ; croisements par fixture administrative de test uniquement ; Apple/Google, notifications, modération humaine et suppression autonome du compte distant non implémentés. Vérification d'identité simulée sans badge fiable. Les sections suivantes conservent le bilan historique du mode local.

## Réellement fonctionnel en local
- Navigation smartphone à cinq onglets : Accueil, Rencontres, Cœurs, Messages, Profil. Cadre vertical, safe areas, scroll indépendant, adaptation du viewport au clavier.
- Connexion/inscription **de démonstration**, identifiant e-mail local sans authentification sécurisée. Onboarding avec prénom, naissance déclarée adulte, 1–6 illustrations, bio, intention, préférences de base. Session restaurée au rechargement.
- Profil éditable : champs, intérêts, personnalité, caractéristiques facultatives, photos fictives, validation, sauvegarde explicite, radar opt-in et invisibilité.
- Questionnaire enregistré : critères physiques, essentiels âge/genre, intentions, intérêts, personnalité, poids extensibles et portraits fictifs. Transfert explicite des traits d’un portrait ; aucun apprentissage silencieux.
- Moteur directionnel testable. B correspondant aux préférences de A reçoit la suggestion de A ; sens inverse indépendant. Aucun score public.
- Suggestions anonymes jusqu’à ouverture, échéance 24 h, pause/invisibilité distinctes, révocation sans restauration automatique, déduplication des suggestions actives.
- Cœurs volontaires, lecture explicite, compteur non lu, cœur retour, match unique, conversation seulement après réciprocité. Retrait avant match disponible ; retrait après match laissé ouvert.
- Messages locaux persistants, liste avec illustration, prénom, statut vérifié éventuel, aperçu, date et non-lus, état vide, saisie et défilement, blocage et signalement local avec motif.
- Six pages de confiance **provisoires** ; export de la démonstration et suppression du profil actif avec ses interactions.
- Badge Nearly « Profil vérifié · démo » sur les vues concernées. Parcours de vérification simulé complet, refus/échec/recommencer inclus.
- Laboratoire réservé au développement : sélectionner A/B, consentement radar, croisement, changement de point de vue, suggestions, cœurs, match et conversation via les mêmes services. Route/import absents du build de production.
- Architecture séparée : domain, services, state, features, data, adapters ; fixtures uniques. Stockage versionné, rejet des snapshots incomplets, erreur visible si sauvegarde impossible.

## Bilan historique du sprint local — avant Supabase
Aucun Supabase, backend, authentification sécurisée, Apple/Google, transmission de messages, push/alarme sonore, Bluetooth, géolocalisation, santé, reconnaissance faciale, caméra réelle, vérification d’identité/majorité, photo réelle téléversée, support ou modération distante. Les illustrations sont originales et fictives. Textes légaux non définitifs.

Le prototype vise un navigateur et un onglet actif. Aucun chiffrement ni contrôle d’accès serveur : utiliser exclusivement des données de démonstration. Les comptes locaux sont des personnages de simulation. Les essais navigateur ne remplacent pas une validation physique iPhone/Android du clavier et des safe areas.

## Décisions ouvertes et conventions de démo
Voir `Docs/06-questions-ouvertes.md` (questions toujours ouvertes) et **`Docs/07-sprint-prototype-local.md`** (implémentation réelle et paramètres temporaires).
- Lecture par bouton ; cœur/match/message conservés après expiration de suggestion ; retrait après match non proposé.
- Genre reporté : aucune suggestion issue de ces préférences ; pas « tous les genres ».
- Âge initial 18–99, catégories et seuil/poids configurables de démo ; aucune règle produit définitive déduite.
- Un recroisement explicite peut créer une nouvelle suggestion après expiration/révocation ; pas de restauration automatique.
- Pas de politique finale de conservation, regroupement ou anti-abus.

## Vérifications
- Lint, TypeScript et build : passés sur le code final du sprint.
- Laboratoire : **2 parcours complets passés**, Chromium mobile et WebKit mobile.
- Suite complète production : **51 tests passés** sur Chromium mobile, WebKit mobile et Chromium bureau. Après la dernière correction ciblée de consentement et de révocation : **21 tests métier passés**, dont la nouvelle régression ; lint, typecheck et build relancés et passés. Les parcours navigateur inchangés ne sont pas relancés inutilement.
- Couverture : sens directionnel, consentement, pondérations/critères essentiels, idempotence des cœurs/matchs, pause/invisibilité/expiration/blocage, suppression, onboarding et persistance, questionnaire, conversation, vérification simulée, navigation et tailles 320/360/430/820/1440.
- Aucune dépendance externe ajoutée. Première exécution des tests a détecté un sélecteur d’onboarding incorrect ; corrigé puis parcours ciblé passé. Délai du test laboratoire aligné sur les autres parcours pour WebKit.

## Commits intermédiaires
- `7a4d0e3` : messages, confiance et socle local.
- `ae574bf` : onboarding, profil éditable et questionnaire.
- `50b941f` : suggestions directionnelles, cœurs/matchs et laboratoire.
- `d625b45` : corrections de persistance/suppression, clavier mobile et tests de bout en bout.
- Commit de clôture : préservation du consentement courant lors de la sauvegarde d’un brouillon, révocation limitée aux suggestions révélant le profil invisible, test de régression, documentation et bilan de validation.

## Reprise et démonstration
1. Lire ce fichier, README et Docs ; `git status`.
2. `npm run dev` ; ouvrir le port 5173 (URL transférée Codespaces).
3. `/#/connexion` pour créer un profil ; `/#/profil` pour modifier profil/préférences ; `/#/laboratoire` pour le flux simulé complet.
4. Vérifications : `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, `npm run test:lab`.
5. Branche main ; origin : https://github.com/aurorebqt-max/NEARLY.git. Après push, comparer HEAD, origin/main et `git ls-remote origin refs/heads/main`.

Prochaine étape produit : arbitrer les paramètres ouverts et préparer un vrai service d’authentification/données avec autorisations serveur avant toute utilisation réelle. Bluetooth, santé et géolocalisation restent hors de ce sprint.
