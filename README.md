# NEARLY ♡ — Dossier de conception

**Statut : pré-développement.** Ce dépôt contient le cahier des charges vivant du projet, **pas encore l'application**. Il est conçu pour être ouvert dans GitHub Codespaces puis utilisé avec Codex sans lui demander d'inventer les règles produit manquantes.

> Nom provisoire : **Nearly** — « Closer than you think. » Disponibilité du nom/de la marque/du domaine non vérifiée. Ne pas copier les visuels, sons ou interface de *Love Alarm*.

## Le concept en une phrase
Nearly provoque des occasions de rencontre lors de croisements dans la vie réelle : une personne reçoit une **suggestion anonyme** lorsqu'elle pourrait correspondre aux préférences d'un autre utilisateur volontaire, peut découvrir son profil selon ses réglages de visibilité, puis **envoyer volontairement un cœur** ; c'est ce cœur qui déclenche l'alarme emblématique du destinataire.

## Lire en premier
1. [`docs/01-decisions-validees.md`](docs/01-decisions-validees.md) — décisions actées et ambiguïtés non résolues.
2. [`docs/02-parcours-utilisateur.md`](docs/02-parcours-utilisateur.md) — parcours et scénarios métier.
3. [`docs/03-questionnaire-et-compatibilite.md`](docs/03-questionnaire-et-compatibilite.md) — profil, préférences, logique directionnelle.
4. [`docs/04-ecrans-et-design.md`](docs/04-ecrans-et-design.md) — expérience et direction artistique.
5. [`docs/05-confidentialite-et-securite.md`](docs/05-confidentialite-et-securite.md) — garde-fous à instruire avant tout lancement.
6. [`docs/06-questions-ouvertes.md`](docs/06-questions-ouvertes.md) — décisions à prendre **avant** d'implémenter les blocs concernés.
7. [`technical/architecture-proposee.md`](technical/architecture-proposee.md) — architecture proposée, non figée.
8. [`technical/plan-et-tests.md`](technical/plan-et-tests.md) — séquencement, critères d'acceptation et tests.
9. [`codex/00-instructions.md`](codex/00-instructions.md) — premier message prêt à coller dans Codex.

## Règle de travail
La conception fait foi. Distinguer systématiquement **VALIDÉ**, **PROPOSÉ** et **À DÉCIDER**. Si une règle métier est absente ou ambiguë, poser la question avant de coder. Implémenter par étapes, avec tests et build à chaque étape. Ne jamais simuler une capacité Bluetooth native en la présentant comme fonctionnelle.

## Comment l'utiliser sur GitHub
Télécharge puis **décompresse** le ZIP. Crée un dépôt `nearly-app` (nom temporaire), puis importe les fichiers et dossiers **contenus dans** `nearly-project/` à la racine du dépôt : README.md, docs/, technical/, codex/. Sur Codespaces, ouvre `codex/00-instructions.md` et colle son contenu à Codex.
