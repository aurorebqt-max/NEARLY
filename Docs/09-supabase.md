# Sprint 2 — Supabase

## Modes et configuration

Le mode local/mock et le laboratoire de développement sont conservés. `VITE_BACKEND_MODE=local` est le défaut ; choisir `supabase` pour démarrer avec le backend. Le bouton de changement de mode fonctionne lorsque les variables publiques sont renseignées. Aucun import de localStorage ou des personnages fictifs vers la base. Session Supabase séparée (`nearly.supabase.auth`).

Créer `.env.local` (ignoré par Git) depuis `.env.example` avec `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`. Utiliser uniquement la clé publique publishable/anon. Les clés administratives restent côté serveur/tests et ne sont jamais nécessaires au frontend. Redémarrer Vite après modification. Projet local : `FREYMO`, API 54321, PostgreSQL 54322, Studio 54323, courrier local 54324.

## Reprise sans perte

Exécuter `npx supabase status`, `docker ps -a` et `docker volume ls`. Si arrêté, `npx supabase start` réutilise les données disponibles. Pour des migrations nouvelles sur une instance active : `npx supabase migration up --local`. Aucun reset ou effacement de volume nécessaire.

Migrations : `202610100001_nearly.sql` (14 tables, trigger Auth, RLS et RPC) et `202610100002_photos.sql` (bucket privé et photos). Vérifier avec `npx supabase migration list --local`.

## Contrats et droits

Les services locaux restent purs. Les écrans utilisent les commandes explicites de `src/domain/commands.ts`. Le serveur produit un snapshot filtré ; seul le propriétaire reçoit sa naissance et ses préférences. Un tiers autorisé reçoit l'âge et le profil exposable. Les rencontres anonymes ne révèlent pas leur source avant ouverture.

Toutes les tables ont la RLS. Le navigateur dispose de lectures filtrées et des RPC autorisées, sans écriture directe des matchs/conversations. Verrouillage par paire pour cœurs, blocage et messages ; conversation unique par match, requête de message unique par expéditeur.

Photos : bucket privé, chemins UUID par propriétaire, 1–6 photos référencées, JPEG/PNG/WebP ≤ 5 Mo. Le frontend réencode en JPEG sans EXIF ; cela ne remplace pas une validation/modération serveur. Liens signés de 60 secondes : le blocage empêche les nouveaux accès, mais ne rappelle pas un fichier téléchargé ou un lien encore valide.

## Tests dédiés

`npm run test:supabase` exige Docker et Supabase local démarrés. Le script refuse une API distante, lit les clés en mémoire sans les afficher et crée quatre comptes uniques (dont une inscription publique). Seuls ces comptes et leurs photos temporaires sont nettoyés ; aucune donnée préexistante n'est ciblée.

Couverture : migrations et 14 tables/RLS, authentification/reconnexion, profils/préférences persistants, photos privées, isolation intercomptes, anonymat des rencontres, cœurs concurrents, match unique, messages idempotents et compteurs indépendants, blocage/déblocage/signalement, absence de badge fiable auto-attribué. Rencontres injectées par un client administratif local, jamais par le navigateur.

`npm run test:supabase:ui` démarre Vite sur 5175 avec les variables publiques locales en mémoire et vérifie le parcours mobile complet (connexion, profil, vraie photo, préférences, session et retour démo). Son compte est créé et nettoyé séparément ; aucun fichier de trace contenant une session n'est enregistré.

Validation de bloc : lint, typecheck, build, `npm test`, `npm run test:lab`, `npm run test:supabase`, `npm run test:supabase:ui`. Les deux migrations sont appliquées et `npx supabase db lint --local` ne signale aucune erreur.

## Limites

Aucun déploiement distant. Messages par polling toutes les 10 secondes et au retour au premier plan, sans push. Pas de génération automatique de croisements serveur, Bluetooth, géolocalisation, santé ou reconnaissance faciale. Apple/Google non raccordés. Vérification simulée. Signalements persistants, traitement humain à organiser. Suppression autonome du compte distant non implémentée et annoncée comme telle dans l'interface. Questions produit inchangées, aucune politique définitive de conservation/anti-abus ajoutée.

## Environnement de reprise

Le Docker de cette session était vide. Le disque s'est rempli au téléchargement : les fichiers Docker ont été déplacés vers `/tmp/nearly-docker-data`, monté sur `/var/lib/docker`. Les ACL héritées de `/tmp` puis le conflit iptables legacy/nft ont été corrigés. Les services ont ensuite démarré et les migrations se sont appliquées sans reset. Ce montage et `/tmp` sont propres à cette session : ils ne constituent pas une sauvegarde durable des données. Les migrations et tests sont sauvegardés dans Git ; aucun projet distant n'est configuré.

Le `.env.local` préparé conserve `VITE_BACKEND_MODE=local`. Sur `/#/connexion`, « Utiliser le backend réel » ouvre l'authentification Supabase. Les confirmations e-mail sont désactivées uniquement dans la configuration locale. Pour un projet hébergé, configurer explicitement les URL autorisées et l'envoi/confirmation des e-mails avant usage.
