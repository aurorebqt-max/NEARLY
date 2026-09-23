# 03 — Questionnaire et moteur de compatibilité

## Deux ensembles de données distincts
- **Mon profil** : prénom, photos (1–6), âge affiché et naissance privée, caractéristiques autodéclarées, personnalité et intérêts, intention(s), informations optionnelles affichables individuellement.
- **Mon profil d'attirance** : tranches d'âge, genres recherchés, préférences physiques, centres d'intérêt/personnalité, intentions compatibles et importance des critères. Les préférences intimes ne sont pas publiées en bloc.

## Validé
- Déclaration physique manuelle (pas de classification automatique à partir d'images dans la V1).
- Questions visuelles sur les caractéristiques **puis** portraits fictifs pour affiner.
- Des préférences souples avec importance personnalisée ; âge et genre recherchés à part.
- Physique **et** personnalité influencent les correspondances.
- L'IA peut proposer d'affiner les préférences, avec validation préalable des modifications importantes.
- Modes habituel / découverte / événement.

## Restant à définir (ne pas deviner dans le code)
- Champs exacts et listes de réponses : cheveux (couleur/texture/longueur), yeux, taille, silhouette, style, barbe, etc.
- Questionnaires personnalité, centres d'intérêt et intentions : catégories et affichage public/privé.
- Importance : nombre de niveaux, pondérations et seuil de déclenchement ; gestion des champs non renseignés.
- Tranche 18–35 : simple exemple ou configuration de départ ?
- « Genre non précisé pour le moment » : aucun déclenchement tant que le critère est manquant, ou autre parcours volontairement choisi ?
- Portraits : jeu duo, galerie ou adaptatif ; source des visuels, droits et diversité ; boutons « les deux / aucun / passer ».
- Compatibilité des intentions : strictes/souples/personnalisables.

## Contrat logique envisagé (PROPOSÉ)
`isPotentialFit(viewerPreferences, candidateProfile)` renvoie un résultat directionnel documenté ; ne pas le confondre avec `isPotentialFit(candidatePreferences, viewerProfile)`.

`canNotifyRecipient(recipient, originator, encounter)` exige notamment : participation autorisée, critères essentiels respectés, pas de blocage, règles de visibilité et de sécurité respectées, absence de notification identique récente.

**Attention au sens :** si B correspond au type de A, le destinataire de la première suggestion est **B**, qui pourrait plaire à A. Les données privées de A ne doivent pas être exposées en clair à B.
