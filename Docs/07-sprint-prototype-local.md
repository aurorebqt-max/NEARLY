# Sprint du 10 octobre 2026 — prototype local

## Statut et limites
Ce sprint est explicitement autorisé sur les dix blocs fonctionnels. Les décisions validées des documents 01–06 restent applicables. Les hypothèses ci-dessous sont **des paramètres de démonstration**, jamais des décisions produit finales. Les historiques des missions précédentes décrivent leur état à la date de livraison.

Le prototype est interactif dans un seul navigateur. Il ne constitue pas un service de rencontre déployable : aucun backend, contrôle d’accès serveur, authentification sécurisée, modération distante, caméra, reconnaissance faciale, Bluetooth, santé ou géolocalisation. Les illustrations sont des SVG originaux fictifs. Aucun téléversement photo réel.

## Parcours disponibles
- Cinq onglets : Accueil, Rencontres, Cœurs, Messages, Profil. Design Romantic Future conservé.
- Compte local par identifiant e-mail fictif, création de profil adulte déclaré, 1–6 illustrations modifiables, bio, intention, intérêts, caractéristiques et personnalité facultatives. Retour au compte par Connexion, session restaurée au rechargement. Déconnexion vers l’espace fictif Aurore. Apple/Google affichés comme non connectés.
- Édition avec validation et enregistrement explicite. Radar désactivé par défaut ; activation explicite et mode invisible. Un compte incomplet revient au profil avant les écrans de rencontre.
- Questionnaire : physique, âge/genre/intentions, intérêts, personnalité, importance extensible, galerie de portraits. Les portraits sélectionnés sont enregistrés. « Appliquer » reprend explicitement leurs traits souples ; ne change jamais âge/genre. Aucun apprentissage silencieux.
- Suggestions anonymes jusqu’à ouverture, expirant après 24 h. Aucun cœur automatique. Le compteur compte uniquement les cœurs reçus non lus hors blocage.
- Cœur retour, match unique et conversation créée uniquement par réciprocité. Une conversation fictive initiale est accompagnée de ses deux cœurs de seed.
- Messages persistants, aperçu/date/non-lus, lecture explicite, saisie, défilement, blocage local et signalement local avec motif. Aucun signalement transmis à une équipe.
- Badge Nearly « Profil vérifié · démo » et parcours présentation → permission simulée → portrait fictif → attente → réussite/échec/recommencer. Aucun badge n’atteste réellement identité ou majorité.
- Six pages de confiance provisoires. Export de l’ensemble de la démonstration du navigateur ; suppression du profil actif et de ses interactions. Si Aurore est supprimée, seuls ses champs fictifs d’origine sont restaurés comme point d’entrée de la démo.

## Laboratoire
Lancer `npm run dev`, puis `/#/laboratoire` (liens dans Accueil et Profil). La route et l’import du laboratoire sont exclus du build de production.

1. Sélectionner A et B distincts.
2. Autoriser explicitement les deux radars de démonstration.
3. Simuler le croisement. Les préférences de A sont comparées à B et inversement, séparément. Si B correspond à A, la suggestion est livrée à B et révèle A seulement après ouverture.
4. Observer comme B, ouvrir Rencontres, découvrir A et envoyer un cœur.
5. Revenir au laboratoire, observer comme A, ouvrir Cœurs et envoyer un cœur retour.
6. Ouvrir la conversation créée. Les changements de point de vue sont réservés au laboratoire ; ses actions utilisent les mêmes services que l’application.

Les exemples initiaux ont déjà quelques interactions. Les tests du laboratoire partent volontairement d’un jeu sans cœurs ni suggestions pour vérifier le flux complet sans raccourci.

## Paramètres ouverts isolés
`src/data/config.ts` centralise les listes proposées, seuil et conventions de démo ; `defaultPreferences()` fournit des paramètres modifiables.

| Sujet ouvert | Comportement démonstratif |
| --- | --- |
| Plage d’âge initiale | 18–99, modifiable jusqu’à 120 ; aucune restriction globale à 35 ans |
| Genre reporté | `null`, ne génère aucune suggestion depuis ces préférences ; pas assimilé à tous les genres |
| Pondérations | Poids 0–3 par groupe, moyenne pondérée des réponses, seuil interne 0,5 |
| Champs souples absents | Groupe sans préférence ignoré ; trait candidat absent ne correspond pas à un trait demandé |
| Intentions | Liste recherchée vide : non restrictive ; sinon correspondance exacte |
| Lecture cœurs/messages | Bouton explicite ; ouvrir une liste ne marque rien comme lu |
| Après 24 h | Suggestion expirée inaccessible ; cœurs/matchs/messages conservés localement |
| Retrait | Possible avant match ; après match non proposé dans la démo |
| Recroisement | Suggestion active identique dédupliquée ; un nouvel événement explicite peut en recréer une après révocation/expiration |
| Notifications/groupement | Pas de push ni vibrations ; pas de politique finale de regroupement |
| Conservation | Stockage navigateur jusqu’à suppression/effacement ; aucun délai légal/final établi |
| Portraits | Galerie d’illustrations, sélection multiple/aucun, transfert de traits confirmé par bouton |

L’évaluation renvoie un score **interne de correspondance aux préférences**, jamais affiché comme classement, valeur d’une personne ou score de beauté. L’interface du laboratoire affiche seulement oui/non.

## Invariants implémentés
- Pause radar : interdit les nouveaux croisements, conserve les suggestions déjà proposées.
- Invisibilité : interdit les nouveaux croisements et révoque les suggestions qui révèlent ce profil ; réactiver ne les restaure pas. Les suggestions reçues concernant les autres profils ne sont pas révoquées par ce réglage.
- Pause/invisibilité préservent cœurs et matchs ; blocage interdit découverte, cœur et message dans les deux directions, y compris via lien de conversation conservé.
- Enregistrer un brouillon de profil conserve les réglages de visibilité et le statut vérifié courants, même s’ils ont changé depuis l’ouverture du formulaire.
- Lecture sans envoi de notification d’intérêt ; un cœur reste une action volontaire.
- Déduplication des cœurs par direction et des conversations par paire ; pas de conversation à partir d’une simple suggestion.
- Expiration contrôlée au niveau service et rafraîchie dans la liste toutes les secondes.

## Architecture et remplacement futur
- `src/domain` : types purs et fonction testable `evaluateCompatibility(preferences, candidate, now)`.
- `src/data` : fixtures uniques, configuration et textes provisoires.
- `src/services` : auth locale, profil, préférences, interactions sociales, suppression.
- `src/adapters` : interface de stockage et adaptateur localStorage versionné, adaptation clavier navigateur.
- `src/state` : contexte React et mutations synchrones clonées ; sauvegarde avant publication, erreur visible si stockage indisponible/plein.
- `src/features` : écrans et formulaires. Le contexte de démonstration historique sert uniquement de pont pour le cœur central.

Supabase devra remplacer les services/adaptateurs locaux par des opérations serveur avec authentification, RLS et validation d’autorisation. Le stockage local n’est ni chiffré, ni isolé entre personnages, ni sûr pour données réelles. Le prototype vise un seul onglet actif : aucune résolution de conflits entre onglets/appareils. La validation de majorité est uniquement déclarative.

## Vérification
`npm run lint`, `npm run typecheck`, `npm run build`, `npm test` pour le build de production ; `npm run test:lab` pour le serveur de développement. Les parcours incluent navigation à cinq onglets, largeur 320/360/430, cadre 820/1440, safe areas, mouvement réduit, onboarding et persistance, questionnaire, réciprocité, messagerie/blocage et vérification simulée. Les tests métier vérifient direction, critères essentiels, pondérations, consentement, déduplication, expiration et révocation.

Le clavier logiciel utilise `visualViewport` lorsqu’il est disponible ; les tests navigateur ne remplacent pas une validation physique iPhone/Android du clavier, des safe areas et du cycle d’arrière-plan.
