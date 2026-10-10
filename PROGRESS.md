# Nearly — progression et reprise

Mise à jour : **10 octobre 2026**. Sprint fonctionnel autorisé sur les dix blocs ; mission 4 terminée pour le périmètre local/mock demandé. Design Romantic Future / Romantic Tech Premium conservé.

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

## Toujours mocké / non implémenté
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
