# NEARLY ♡

**Statut : prototype interactif local — sprint du 10 octobre 2026.** Nearly reste exclusivement pensée pour smartphone, avec un cadre vertical sur ordinateur. Cinq onglets, onboarding local, profil éditable, questionnaire, compatibilité directionnelle, cœurs/matchs et messagerie fonctionnent avec des données de démonstration persistantes. Aucun backend ni détection réelle. Voir [PROGRESS.md](PROGRESS.md) et [le bilan fonctionnel du sprint](Docs/07-sprint-prototype-local.md).

> Nom provisoire : **Nearly** — « Closer than you think. » Disponibilité du nom/de la marque/du domaine non vérifiée. Ne pas copier les visuels, sons ou interface de *Love Alarm*.

## Le concept en une phrase
Nearly provoque des occasions de rencontre lors de croisements dans la vie réelle : une personne reçoit une **suggestion anonyme** lorsqu'elle pourrait correspondre aux préférences d'un autre utilisateur volontaire, peut découvrir son profil selon ses réglages de visibilité, puis **envoyer volontairement un cœur** ; c'est ce cœur qui déclenche l'alarme emblématique du destinataire.

## Lire en premier
1. [`Docs/01-decisions-validees.md`](Docs/01-decisions-validees.md) — décisions actées et ambiguïtés non résolues.
2. [`Docs/02-parcours-utilisateur.md`](Docs/02-parcours-utilisateur.md) — parcours et scénarios métier.
3. [`Docs/03-questionnaire-et-compatibilite.md`](Docs/03-questionnaire-et-compatibilite.md) — profil, préférences, logique directionnelle.
4. [`Docs/04-ecrans-et-design.md`](Docs/04-ecrans-et-design.md) — expérience et direction artistique.
5. [`Docs/05-confidentialite-et-securite.md`](Docs/05-confidentialite-et-securite.md) — garde-fous à instruire avant tout lancement.
6. [`Docs/06-questions-ouvertes.md`](Docs/06-questions-ouvertes.md) — décisions à prendre **avant** d'implémenter les blocs concernés.
7. [`Technical/architecture-proposee.md`](Technical/architecture-proposee.md) — architecture proposée, non figée.
8. [`Technical/plan-et-tests.md`](Technical/plan-et-tests.md) — séquencement, critères d'acceptation et tests.
9. [`Codex/00-instructions.md`](Codex/00-instructions.md) — premier message prêt à coller dans Codex.

## Règle de travail
La conception fait foi. Distinguer systématiquement **VALIDÉ**, **PROPOSÉ** et **À DÉCIDER**. Si une règle métier est absente ou ambiguë, poser la question avant de coder. Implémenter par étapes, avec tests et build à chaque étape. Ne jamais simuler une capacité Bluetooth native en la présentant comme fonctionnelle.

## Lancer le projet
Node.js 22.12+ (vérifié avec Node 24) et npm.

```sh
npm ci
npm run dev
```

Ouvrir http://localhost:5173. Dans Codespaces, ouvrir le port **5173** depuis l'onglet Ports ; sur téléphone, ouvrir son URL HTTPS transférée, avec le compte GitHub autorisé si le port est privé. Depuis une machine locale, sur le même réseau Wi-Fi, utiliser `http://ADRESSE_IP_DE_LA_MACHINE:5173` (pare-feu autorisant le port). Le serveur écoute sur `0.0.0.0`.

Le bouton « Découvrir Nearly » ouvre l’espace fictif Aurore. Les cinq onglets sont navigables : Accueil, Rencontres, Cœurs, Messages et Profil. La présentation d’origine reste à `/#/` et `/#/presentation`.

Pour votre parcours local : `/#/connexion` → Créer un compte → compléter le profil avec 1–6 illustrations fictives → questionnaire. L’e-mail est seulement un identifiant local sans mot de passe ni envoi d’e-mail ; utilisez des données fictives. Le profil, les préférences et les interactions persistent dans ce navigateur. Profil permet l’édition, les paramètres, la vérification simulée et l’accès aux six pages de confiance provisoires.

Pour tester le flux complet : `npm run dev`, puis `/#/laboratoire`. Choisir A/B, autoriser les radars, simuler, changer de point de vue, découvrir la suggestion et envoyer deux cœurs volontaires pour ouvrir une conversation. Le laboratoire est absent du build de production. Aucun score de beauté, Bluetooth, santé ou géolocalisation.

## Vérifications
```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium webkit
npm test
npm run test:lab
```

Playwright peut demander des bibliothèques système supplémentaires sur une nouvelle machine (`npx playwright install-deps chromium webkit`). Les tests lancent le serveur de prévisualisation sur le port 4173 et nécessitent un build préalable. `npm run preview` permet aussi d'inspecter le build manuellement.

## Structure
- `src/app/` : routes, cadre smartphone et couches visuelles Nearly.
- `src/domain/` : modèles et moteur de compatibilité testable.
- `src/data/` : fixtures uniques et paramètres de démonstration.
- `src/services/` : auth, profils, préférences, cœurs/matchs/messages, visibilité et suppression.
- `src/adapters/` : stockage remplaçable et adaptation du clavier navigateur.
- `src/state/` : état partagé persistant.
- `src/features/` : écrans mobile, compte, questionnaire, confiance, messagerie et laboratoire.
- `tests/`, `tests-dev/` : métier, parcours navigateur et laboratoire.

Le détail des choix encore ouverts et des limites est dans [Docs/07-sprint-prototype-local.md](Docs/07-sprint-prototype-local.md). Supabase et les autorisations serveur restent à implémenter ; le compte local n’est pas une authentification sécurisée. Les textes de confiance sont provisoires, aucun signalement n’est transmis ni traité par une équipe.

## Sauvegarde et reprise
Consulter `PROGRESS.md`, puis les décisions validées avant toute nouvelle mission. À chaque jalon cohérent : vérifier, mettre à jour la progression, committer et pousser sur GitHub. Un fichier non committé/poussé n'est pas sauvegardé sur GitHub. Ne commencer la mission suivante qu'après accord explicite.
