# IcamTrack — Backlog Agile

**Projet :** EC06-SNI-ProjInfo · ICAM Mai–Juin 2026
**Méthode :** Scrum adapté · 7 sprints hebdomadaires
**Outil :** Suivi dans ce fichier + Git (commits liés aux US)

---

## Équipe & rôles

| Membre | Rôle | Responsabilités |
|--------|------|-----------------|
| **Éva** | Chef de projet · Scrum Master | Backlog, planification sprints, suivi avancement, rapport, coordination transverse |
| **Théo H** | Tech Lead · DevOps | Choix architecture, setup infra Supabase, Edge Functions, déploiement Vercel |
| **Théo M** | Dev Data | Schéma BDD, migrations SQL, RLS, requêtes Supabase |
| **Baptiste** | Dev Web principal | Frontend React, composants UI, pages, hooks, design system |

---

## Conventions

**Format US :** `En tant que [rôle], je veux [action] afin de [bénéfice].`
**Statuts :** ✅ Done · 🔄 En cours · ⏳ À faire
**Points :** Fibonacci 1–13 (1 = trivial, 13 = semaine complète)
**Jalons :** J1 → J5 (d'après planning ICAM)

---

## Vue d'ensemble des sprints

| Sprint | Semaine | Focus | Jalon |
|--------|---------|-------|-------|
| S0 | S1 Mai | Init, architecture, BDD | — |
| S1 | S2 Mai | CRUD Matériel & Catégories | **J1** |
| S2 | S3 Mai | Emprunts — création & validation | — |
| S3 | S4 Mai | Retours, historique, Edge Functions | **J2** |
| S4 | S5 Juin | Dashboard & KPIs | **J3** |
| S5 | S6 Juin | Recette, UI polish, rapport | **J4** |
| S6 | S7 Juin | Soutenance | **J5** |

---

## EPIC 1 — Infrastructure & Setup

### US-001 · Initialisation du dépôt et de l'environnement de dev
> En tant qu'équipe, nous voulons un dépôt Git structuré et un environnement de dev fonctionnel afin de pouvoir collaborer efficacement dès le premier jour.

| Champ | Valeur |
|-------|--------|
| Assigné | Théo H |
| Points | 3 |
| Sprint | S0 |
| Statut | ✅ Done |

**Tâches :**
- [x] Créer le dépôt Git (main branch)
- [x] Scaffold projet Vite + React + TypeScript
- [x] Configurer Tailwind CSS v4 + Space Grotesk / DM Mono
- [x] Configurer Vitest + Testing Library
- [x] Ajouter `.env.local` avec variables Supabase
- [x] Premier commit de structure

---

### US-002 · Configuration du projet Supabase
> En tant que Tech Lead, je veux configurer le projet Supabase (Auth, BDD, Edge Functions) afin que l'équipe dispose d'un backend opérationnel.

| Champ | Valeur |
|-------|--------|
| Assigné | Théo H |
| Points | 3 |
| Sprint | S0 |
| Statut | ✅ Done |

**Tâches :**
- [x] Créer le projet Supabase cloud
- [x] Installer Supabase CLI et lier le projet
- [x] Configurer les variables d'environnement (URL + anon key)
- [x] Valider la connexion depuis le frontend

---

### US-003 · Choix et documentation de l'architecture technique
> En tant qu'équipe, nous voulons une architecture documentée afin que chaque membre comprenne les responsabilités de chaque couche.

| Champ | Valeur |
|-------|--------|
| Assigné | Théo H + Éva |
| Points | 2 |
| Sprint | S0 |
| Statut | ✅ Done |

**Tâches :**
- [x] Rédiger le design spec (`docs/superpowers/specs/`)
- [x] Valider le choix React + Supabase Edge Functions (vs Express)
- [x] Documenter les rôles `student` / `admin`
- [x] Cartographier les routes et flux principaux

---

## EPIC 2 — Base de données & Authentification

### US-004 · Schéma de base de données initial
> En tant que Dev Data, je veux un schéma PostgreSQL clair et versionné afin de garantir l'intégrité des données tout au long du projet.

| Champ | Valeur |
|-------|--------|
| Assigné | Théo M |
| Points | 5 |
| Sprint | S0 |
| Statut | ✅ Done |

**Tâches :**
- [x] Créer les enums `user_role`, `equipment_status`, `loan_status`
- [x] Créer les tables `profiles`, `categories`, `equipment`, `loan_requests`, `loan_items`
- [x] Créer le trigger `handle_new_user` (avec `SET search_path = public`)
- [x] Créer la fonction helper `is_admin()`
- [x] Appliquer la migration sur Supabase cloud

---

### US-005 · Row Level Security (RLS)
> En tant qu'admin système, je veux des politiques de sécurité PostgreSQL afin qu'aucun étudiant ne puisse accéder aux données d'un autre utilisateur.

| Champ | Valeur |
|-------|--------|
| Assigné | Théo M |
| Points | 5 |
| Sprint | S0 |
| Statut | ✅ Done |

**Tâches :**
- [x] Activer RLS sur les 5 tables
- [x] Politique lecture `profiles` : propre profil + admin
- [x] Politique `categories` et `equipment` : lecture pour tous, écriture admin
- [x] Politique `loan_requests` : étudiant voit ses demandes, admin voit tout
- [x] Politique `loan_items` : lecture via loan_request parent
- [x] Politiques INSERT pour les étudiants sur loan_requests/items
- [x] Corriger `auth.role()` → `auth.uid() is not null`

---

### US-006 · Authentification email / mot de passe
> En tant qu'utilisateur, je veux me connecter avec mon email et mot de passe ICAM afin d'accéder à l'application de façon sécurisée.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste |
| Points | 5 |
| Sprint | S0 |
| Statut | ✅ Done |

**Tâches :**
- [x] Créer le hook `useAuth` (AuthProvider, context React)
- [x] Page de connexion (LoginPage) avec validation
- [x] Créer `ProtectedRoute` (redirect si non connecté)
- [x] Redirect automatique selon le rôle après connexion
- [x] Gestion déconnexion
- [x] Guard : profile null après échec fetch → redirect login

---

### US-007 · Création de compte admin
> En tant qu'admin système, je veux pouvoir créer et promouvoir des comptes admin afin de démarrer l'utilisation de l'application.

| Champ | Valeur |
|-------|--------|
| Assigné | Théo H |
| Points | 2 |
| Sprint | S0 |
| Statut | ✅ Done |

**Tâches :**
- [x] Créer compte Baptiste via Supabase Auth Admin API
- [x] Mettre à jour `profiles.role = 'admin'` en SQL
- [x] Documenter la procédure pour futurs admins

---

## EPIC 3 — Gestion du matériel (JALON 1)

### US-008 · Créer et gérer les catégories de matériel
> En tant qu'admin, je veux créer, modifier et supprimer des catégories afin d'organiser le parc matériel.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste |
| Points | 3 |
| Sprint | S1 |
| Statut | ✅ Done |

**Tâches :**
- [x] Hook `useCategories` (list, create, update, delete)
- [x] Page admin `/admin/categories` avec tableau inline-edit
- [x] Invalidation cache TanStack Query après mutation

---

### US-009 · Créer une fiche matériel
> En tant qu'admin, je veux créer une fiche matériel avec nom, catégorie, numéro de série et notes afin de référencer chaque équipement du parc.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste |
| Points | 5 |
| Sprint | S1 |
| Statut | ✅ Done |

**Tâches :**
- [x] Hook `useEquipment` (list avec filtres, create, update, delete)
- [x] Composant `EquipmentForm` avec validation Zod + React Hook Form
- [x] Page admin `/admin/materiel` avec filtres catégorie/statut

---

### US-010 · Modifier et supprimer une fiche matériel
> En tant qu'admin, je veux modifier ou supprimer une fiche matériel afin de maintenir l'inventaire à jour.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste |
| Points | 2 |
| Sprint | S1 |
| Statut | ✅ Done |

**Tâches :**
- [x] Formulaire pré-rempli à l'édition
- [x] Confirmation avant suppression
- [x] Mise à jour du statut manuel possible (available/unavailable)

---

### US-011 · Alimenter la base avec des données de démonstration
> En tant qu'équipe, nous voulons des données réalistes en base afin de démontrer l'application lors de la soutenance.

| Champ | Valeur |
|-------|--------|
| Assigné | Théo M |
| Points | 2 |
| Sprint | S1 |
| Statut | ✅ Done |

**Tâches :**
- [x] Insérer 8 catégories (Arduino, RPi, Capteurs, Câbles, etc.)
- [x] Insérer 41 équipements réalistes avec numéros de série
- [x] Tous les statuts à `available` pour la démo

---

## EPIC 4 — Gestion des emprunts (JALON 2)

### US-012 · Parcourir le catalogue (étudiant)
> En tant qu'étudiant, je veux parcourir le catalogue des équipements disponibles afin de savoir ce que je peux emprunter.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste |
| Points | 3 |
| Sprint | S2 |
| Statut | ✅ Done |

**Tâches :**
- [x] Page `/catalogue` avec grille d'équipements
- [x] Filtre par catégorie
- [x] Badges de statut (disponible/emprunté/indisponible)

---

### US-013 · Faire une demande d'emprunt (étudiant)
> En tant qu'étudiant, je veux soumettre une demande d'emprunt pour plusieurs articles afin d'obtenir le matériel nécessaire à mes projets.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste + Théo H |
| Points | 8 |
| Sprint | S2 |
| Statut | ✅ Done |

**Tâches :**
- [x] Composant `LoanRequestForm` (panier catégories + quantités)
- [x] Champ date de retour prévue (optionnel)
- [x] Edge Function `create-loan-request` (vérif stock + création)
- [x] Hook `useLoanRequests` (useMyLoanRequests)
- [x] Invalidation cache après soumission

---

### US-014 · Valider une demande d'emprunt (admin)
> En tant qu'admin, je veux valider une demande en assignant des équipements précis afin de tracer chaque item physique sorti du parc.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste + Théo H |
| Points | 8 |
| Sprint | S2 |
| Statut | ✅ Done |

**Tâches :**
- [x] Page `/admin/demandes` avec liste des demandes pending
- [x] Modal `ApproveModal` : selecteur d'équipement par item
- [x] Edge Function `approve-loan-request` (assigne equipment_id + statut borrowed)
- [x] Mise à jour équipements empruntés dans la BDD

---

### US-015 · Refuser une demande d'emprunt (admin)
> En tant qu'admin, je veux refuser une demande avec un motif afin d'informer l'étudiant de la raison du refus.

| Champ | Valeur |
|-------|--------|
| Assigné | Théo H + Baptiste |
| Points | 3 |
| Sprint | S2 |
| Statut | ✅ Done |

**Tâches :**
- [x] Bouton "Refuser" dans la liste des demandes
- [x] Edge Function `reject-loan-request` avec champ `admin_note`
- [x] Affichage de la note sur la page étudiant

---

### US-016 · Enregistrer le retour d'un emprunt (admin)
> En tant qu'admin, je veux enregistrer le retour du matériel afin de clôturer l'emprunt et remettre les équipements en disponible.

| Champ | Valeur |
|-------|--------|
| Assigné | Théo H + Baptiste |
| Points | 5 |
| Sprint | S3 |
| Statut | ✅ Done |

**Tâches :**
- [x] Page `/admin/emprunts-actifs` avec tableau des emprunts en cours
- [x] Mise en évidence des emprunts en retard (fond rose)
- [x] Edge Function `close-loan` (libère equipements + ferme demande)
- [x] Confirmation avant clôture

---

### US-017 · Consulter ses demandes (étudiant)
> En tant qu'étudiant, je veux voir l'état de toutes mes demandes afin de suivre l'avancement de mes emprunts.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste |
| Points | 3 |
| Sprint | S3 |
| Statut | ✅ Done |

**Tâches :**
- [x] Page `/mes-demandes` avec badges statut colorés
- [x] Affichage du matériel assigné une fois la demande validée
- [x] Affichage note admin si refus

---

## EPIC 5 — Historique & Traçabilité

### US-018 · Historique personnel (étudiant)
> En tant qu'étudiant, je veux consulter l'historique de mes emprunts passés afin de garder une trace de mes utilisations.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste |
| Points | 2 |
| Sprint | S3 |
| Statut | ✅ Done |

**Tâches :**
- [x] Page `/historique` avec liste des emprunts clôturés
- [x] Affichage date emprunt et date retour

---

### US-019 · Historique complet avec recherche (admin)
> En tant qu'admin, je veux consulter et filtrer l'historique complet afin d'auditer les mouvements du parc matériel.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste + Théo M |
| Points | 3 |
| Sprint | S3 |
| Statut | ✅ Done |

**Tâches :**
- [x] Page `/admin/historique` avec recherche libre
- [x] Filtre par étudiant ou nom d'équipement (client-side)
- [x] Affichage date emprunt et date retour

---

## EPIC 6 — Tableau de bord (JALON 3)

### US-020 · Tableau de bord administrateur
> En tant qu'admin, je veux voir en un coup d'œil l'état du parc, les demandes en attente et les emprunts actifs afin de prendre des décisions rapides.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste + Théo M |
| Points | 8 |
| Sprint | S4 |
| Statut | ✅ Done |

**Tâches :**
- [x] Hook `useDashboardStats` (total, available, borrowed, unavailable, pending, late)
- [x] Composant `KPICard` avec compteur animé
- [x] Composant `StatusDonut` → remplacé par barres de progression (brutalist)
- [x] Composant `LoanTable` (emprunts actifs avec mise en évidence retards)
- [x] File des demandes en attente (5 dernières + lien)
- [x] Page `/admin/dashboard`

---

### US-021 · Tableau de bord étudiant
> En tant qu'étudiant, je veux voir mes emprunts actifs et mes demandes en cours dès la connexion afin d'avoir une vue rapide sur ma situation.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste |
| Points | 3 |
| Sprint | S4 |
| Statut | ✅ Done |

**Tâches :**
- [x] Page `/dashboard` avec compteurs emprunts actifs / demandes en attente
- [x] Liste des emprunts actifs avec date de retour prévue
- [x] 5 dernières demandes avec statut

---

### US-022 · Marquee temps réel dans la topbar
> En tant qu'admin, je veux voir les chiffres clés défiler dans la barre de navigation afin d'avoir une vue instantanée sans ouvrir le dashboard.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste |
| Points | 2 |
| Sprint | S4 |
| Statut | ✅ Done |

**Tâches :**
- [x] Bande marquee avec animation CSS (infinie)
- [x] Données dynamiques depuis `useDashboardStats`
- [x] Badge dynamique sur "Demandes" (s'affiche seulement si pending > 0)

---

## EPIC 7 — Gestion des utilisateurs

### US-023 · Gérer les comptes utilisateurs (admin)
> En tant qu'admin, je veux voir la liste des comptes et changer le rôle d'un utilisateur afin d'accorder ou retirer les droits d'administration.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste |
| Points | 2 |
| Sprint | S4 |
| Statut | ✅ Done |

**Tâches :**
- [x] Page `/admin/utilisateurs`
- [x] Tableau avec nom, email, rôle
- [x] Bouton toggle student ↔ admin

---

## EPIC 8 — Design & UX (JALON 4)

### US-024 · Design system cohérent (Brutalist White)
> En tant qu'équipe, nous voulons une interface visuellement distinctive et cohérente afin de présenter un produit professionnel lors de la soutenance.

| Champ | Valeur |
|-------|--------|
| Assigné | Baptiste |
| Points | 8 |
| Sprint | S5 |
| Statut | ✅ Done |

**Tâches :**
- [x] Définition du design system (Space Grotesk + DM Mono, palette blanc/noir/accents)
- [x] Topbar noire avec logo jaune, topbar étudiant off-white
- [x] Marquee fond blanc avec bordures cyan/rose
- [x] KPI cards avec compteurs animés (framer-motion)
- [x] Transitions de pages (opacity + translateY)
- [x] Suppression border-radius (style brutalist)
- [x] Badges status outline colorés

---

### US-025 · Recette fonctionnelle et corrections de bugs
> En tant qu'équipe, nous voulons vérifier que l'ensemble des parcours utilisateurs fonctionne sans erreur afin de livrer une application stable.

| Champ | Valeur |
|-------|--------|
| Assigné | Éva (coordination) + tous |
| Points | 5 |
| Sprint | S5 |
| Statut | 🔄 En cours |

**Tâches :**
- [x] Cycle complet emprunt : demande → validation → retour
- [x] Vérification connexion admin et étudiant
- [x] Données de démonstration en base (41 matériels)
- [ ] Test sur plusieurs navigateurs (Chrome, Firefox, Safari)
- [ ] Vérification responsive mobile
- [ ] Test de non-régression après chaque fix

---

### US-026 · Déploiement en production
> En tant qu'équipe, nous voulons une URL accessible publiquement afin de démontrer l'application depuis n'importe quel poste lors de la soutenance.

| Champ | Valeur |
|-------|--------|
| Assigné | Théo H |
| Points | 3 |
| Sprint | S5 |
| Statut | ⏳ À faire |

**Tâches :**
- [ ] Déployer le frontend sur Vercel (`npx vercel --prod`)
- [ ] Configurer les variables d'environnement sur Vercel
- [ ] Vérifier que les Edge Functions répondent en prod
- [ ] Tester le login et le cycle emprunt sur l'URL de prod

---

## EPIC 9 — Rapport & Soutenance (JALON 5)

### US-027 · Rédaction du rapport de projet
> En tant qu'équipe, nous voulons un rapport structuré documentant nos choix techniques et notre démarche afin de satisfaire aux exigences de l'évaluation.

| Champ | Valeur |
|-------|--------|
| Assigné | Éva (lead) + tous (contributions) |
| Points | 8 |
| Sprint | S5–S6 |
| Statut | ⏳ À faire |

**Sections à rédiger :**
- [ ] Introduction et contexte (Éva)
- [ ] Analyse des besoins et cas d'utilisation (Éva)
- [ ] Architecture technique et choix technologiques (Théo H)
- [ ] Modèle de données et RLS (Théo M)
- [ ] Développement frontend et design (Baptiste)
- [ ] Organisation Agile et retour d'expérience (Éva)
- [ ] Conclusion et perspectives (Éva)
- [ ] Annexes : schéma BDD, captures d'écran

---

### US-028 · Préparation de la soutenance
> En tant qu'équipe, nous voulons préparer une démonstration convaincante afin de valoriser notre travail lors de la présentation orale.

| Champ | Valeur |
|-------|--------|
| Assigné | Éva (coordination) |
| Points | 5 |
| Sprint | S6 |
| Statut | ⏳ À faire |

**Tâches :**
- [ ] Préparer le support de présentation (slides)
- [ ] Définir le scénario de démo (login admin → tableau de bord → emprunt → retour)
- [ ] Répétition générale
- [ ] Préparer les comptes de démo (admin + étudiant)
- [ ] Vérifier la connexion internet + URL de prod le jour J

---

## Récapitulatif par sprint

| Sprint | US | Points | Assignés principaux | Statut |
|--------|-----|--------|---------------------|--------|
| S0 Init | US-001 à US-007 | 25 | Théo H, Théo M, Baptiste, Éva | ✅ |
| S1 Matériel | US-008 à US-011 | 12 | Baptiste, Théo M | ✅ **J1** |
| S2 Emprunts | US-012 à US-015 | 22 | Baptiste, Théo H | ✅ |
| S3 Retours | US-016 à US-019 | 13 | Baptiste, Théo H, Théo M | ✅ **J2** |
| S4 Dashboard | US-020 à US-023 | 15 | Baptiste, Théo M | ✅ **J3** |
| S5 Recette | US-024 à US-026 | 16 | Baptiste, Théo H, Éva | 🔄 **J4** |
| S6 Soutenance | US-027 à US-028 | 13 | Éva + tous | ⏳ **J5** |
| **Total** | **28 US** | **116 pts** | | |

---

## Récapitulatif par membre

| Membre | US assignées | Points | Domaine |
|--------|-------------|--------|---------|
| Baptiste | 001, 006, 008–013, 017–022, 023, 024 | ~65 | Frontend, UI, hooks |
| Théo H | 002, 003, 007, 013–016, 026 | ~28 | Infra, Edge Functions, DevOps |
| Théo M | 004, 005, 011, 019–020 | ~18 | BDD, RLS, requêtes |
| Éva | 003, 025, 027, 028 | ~21 | Coordination, rapport, soutenance |

---

## Definition of Done (DoD)

Une US est **Done** quand :
1. Le code est commité sur `main` avec un message clair
2. Le build TypeScript passe sans erreur (`npm run build`)
3. Les tests existants passent (`npm test`)
4. La fonctionnalité a été vérifiée manuellement dans le navigateur
5. Le code a été revu par au moins un autre membre de l'équipe

---

*Dernière mise à jour : 2026-06-04 · IcamTrack v1.0*
