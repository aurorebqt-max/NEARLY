# Audit sprint 2 — avant modification

Le dépôt dc97c96 est propre. Les services métier manipulent synchroniquement un `LocalState` complet. Le seul stockage applicatif est `src/adapters/storage.ts` (localStorage `nearly.demo.v1`). `StoreProvider.update(callback)` clone puis sauvegarde tout le graphe : ce contrat ne doit pas être transposé en upload d’un état complet vers Supabase.

Couplages constatés : formulaires et boutons appellent des mutations de graphe, quelques opérations de lecture/blocage sont inline ; profil candidat et profil privé partagent `UserProfile` ; fixtures Aurore supposées présentes par PhoneShell ; auth locale sans session serveur ; portraits fictifs stockés comme chaînes.

Approche retenue : conserver les fonctions pures locales et le laboratoire, ajouter des commandes explicites asynchrones avec adaptateurs local/Supabase. Le serveur décide des droits, de l’éligibilité et de la réciprocité ; jamais d’écriture de matchs depuis le navigateur. Snapshot filtré pour la session, sans fixtures ni préférences des tiers. Profil propre privé (naissance), projection publique autorisée (âge). Buckets privés. Mode affiché et caches séparés ; pas d’import automatique de fixtures.

Aucun projet distant ni variable Supabase détecté au démarrage. La préparation et les tests sur Supabase Docker local peuvent avancer indépendamment. Une connexion distante ne sera annoncée qu’après configuration effective et vérification.
