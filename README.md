# NEARLY ♡

**Statut : mission 1 — premier aperçu web.** Application React + TypeScript + Vite avec bienvenue animée, accueil de présentation et navigation. Les comptes, rencontres, cœurs et réglages ne sont pas encore implémentés. Le cahier des charges reste vivant ; seules les règles validées peuvent être développées. Voir [PROGRESS.md](PROGRESS.md) pour reprendre le travail.

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

Le bouton « Découvrir Nearly » ouvre l'accueil. La navigation fonctionne ; les rubriques futures sont signalées comme telles. Le routage par fragment (`/#/accueil`) permet de recharger et de partager les pages sans réécriture côté hébergeur.

## Vérifications
```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium webkit
npm test
```

Playwright peut demander des bibliothèques système supplémentaires sur une nouvelle machine (`npx playwright install-deps chromium webkit`). Les tests lancent le serveur de prévisualisation sur le port 4173 et nécessitent un build préalable. `npm run preview` permet aussi d'inspecter le build manuellement.

## Structure
- `src/app/` : navigation et cadre de l'application web.
- `src/features/` : écrans regroupés par fonctionnalité.
- `src/design-system/` : tokens TypeScript, styles et composants visuels.
- `src/domain/` : emplacement documenté pour le futur métier indépendant de l'interface ; aucune règle implémentée à ce stade.
- `tests/` : parcours navigateur et contrôles responsive.
- `Docs/`, `Technical/` : décisions produit et conception technique.

React Native pourra réutiliser les tokens et le futur métier TypeScript. Les composants HTML/CSS et la navigation web nécessiteront des équivalents natifs. Aucun backend, Bluetooth, push ou accès santé n'est connecté.

## Sauvegarde et reprise
Consulter `PROGRESS.md`, puis les décisions validées avant toute nouvelle mission. À chaque jalon cohérent : vérifier, mettre à jour la progression, committer et pousser sur GitHub. Un fichier non committé/poussé n'est pas sauvegardé sur GitHub. Ne commencer la mission suivante qu'après accord explicite.
