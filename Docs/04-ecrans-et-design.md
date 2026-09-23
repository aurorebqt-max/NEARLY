# 04 — Écrans et identité visuelle

## Direction validée
- Style **mixte moderne + romantique**.
- Grand cœur **rose fixe**, animation originale lors de la réception d'un cœur.
- Nombre central : **cœurs non lus**, et non tous les profils compatibles ni le cumul historique.
- Une suggestion de proximité n'est **pas** l'alarme d'un cœur reçu.

## Palette officielle (VALIDÉE — mission 1)
- Nuit `#211323` ; rose `#D65B91` ; rose clair `#F5A8C7` ; lilas `#A65AB8` ; perle `#FFF5F9`.
- Slogan de travail : *Closer than you think.*
- Nom, logo, sons, animation et interface à créer **originaux** ; droits et marques à vérifier.

## Inventaire d'écrans envisagé
1. Accueil/splash et présentation ; 2. connexion (e-mail, Apple, Google) ; 3. majorité et profil ; 4. photos ; 5. questionnaire individuel ; 6. portraits fictifs ; 7. résumé des préférences ; 8. radar abstrait ; 9. suggestion anonyme ; 10. liste de suggestions 24 h ; 11. profil découvert selon visibilité ; 12. cœur reçu (animation et compteur non lu) ; 13. cœurs reçus ; 14. match ; 15. messagerie si validée ; 16. paramètres, consentements, blocage, signalement et suppression.

## Étanchéité visuelle
Le radar doit être une **animation d'état**, pas une carte et pas des points géolocalisant d'autres personnes. Éviter distances précises, trajets ou présence nominative en temps réel. Les alertes et les listes ne doivent pas créer de possibilité de suivi par recoupement.

## Design system livré — mission 1
- Palette centralisée dans `src/design-system/tokens.ts`, exposée en variables CSS par l'adaptateur web.
- Typographie : titres Georgia, texte avec polices système ; aucun téléchargement de police externe.
- Composants réutilisables : cœur SVG original, icônes SVG originales, lien-bouton, carte de fonctionnalité future.
- Boutons tactiles, focus clavier visible, lien d'évitement, zones sûres mobiles et respect de la préférence de réduction des animations.
- L'animation du cœur de bienvenue est décorative ; elle ne représente pas la réception d'un cœur. Aucun compteur fictif n'est affiché.
- Bienvenue et accueil navigables ; Rencontres, Cœurs et Profil sont des pages d'attente explicitement marquées « À venir ».
- Les choix de composition et de typographie sont l'implémentation initiale proposée ; la palette est validée. Les autres écrans de l'inventaire restent à développer.

## Interface smartphone — mission 2
- Présentation conservée : bienvenue à `/#/`, présentation des fonctionnalités à `/#/presentation`.
- Application distincte à `/#/accueil`, `/#/rencontres`, `/#/coeurs`, `/#/profil`, toujours en une seule colonne verticale. Cadre centré sur iPad et ordinateur, sans interface tablette ou bureau spécifique.
- Navigation immobilisée en bas du cadre ; seul le contenu central défile. Safe areas sur les quatre côtés via les variables d’environnement CSS ; validation physique encore à faire.
- Accueil : grand cœur rose fixe, compteur de cœurs non lus fictifs. Le bouton de démonstration ajoute un exemple local (2 → 3) et déclenche une animation originale, sans changement de couleur. Revenir à l’écran ne rejoue pas une réception. Réduction des mouvements respectée.
- Rencontres : exemples anonymes, ouverture locale d’un profil fictif, mention des 24 h et durées illustratives. Aucun délai réel, calcul de compatibilité ou expiration automatique.
- Cœurs : expéditeurs fictifs identifiés. Aucun marquage automatique comme lu : le déclencheur métier est encore ouvert. L’envoi et le retour de cœur restent indisponibles.
- Profil : personnage fictif, emplacements photo illustratifs, personnalisation et paramètres présentés mais inactifs. Les champs détaillés restent à décider.
- Toutes les données sont des exemples de présentation, pas des valeurs par défaut pour les futurs comptes.

## Finition visuelle — mission 3
- Raffinement « Romantic Future » limité au cadre smartphone : dégradés nuit/rose, contrastes de texte, respirations du cœur, focus visible et cibles tactiles. Palette officielle inchangée.
- Accueil : respiration lente du grand cœur au repos ; l’animation de réception d’origine (2 → 3) est conservée sans changement de couleur.
- Rencontres : bascule de démonstration vers un état vide fictif, sans expiration réelle ni suppression de données.
- Cœurs : synthèse des cœurs non lus, état vide fictif et aperçu visuel de match étiqueté « démonstration » — aucun match n’est créé, le compteur non lu est inchangé.
- Profil : portrait SVG original et fictif, section « Ce qui vous ressemble » présentée sans champs actifs, boutons de paramètres affichés mais inactifs (« À venir »).
- Aucune règle métier ouverte n’est déduite ni implémentée. Les états vides et l’aperçu de match sont des bascules locales de présentation.

## Affinages premium — mission 4
- Compteur central : pastille de verre discrète derrière le chiffre (halo, bordure perle, chiffres tabulaires), contraste perle sur le cœur rose fixe ; reste strictement le compteur de cœurs non lus.
- Navigation basse : état actif en capsule dock flottante (glassmorphism léger, glow discret, soulignement fin), sans lourd aplat ; même structure d’onglets et mêmes zones tactiles.
- Palette officielle et réduction des mouvements inchangées. Aucune règle métier ajoutée.
