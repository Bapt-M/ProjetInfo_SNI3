# IcamTrack — Design Spec

**Projet :** EC06-SNI-ProjInfo — ICAM Mai/Juin 2026
**Date :** 2026-06-03
**Stack :** React 18 + Vite + Supabase (Auth, PostgreSQL, Edge Functions)

---

## 1. Contexte et objectifs

Le département informatique de l'ICAM gère un parc d'équipements pédagogiques (Arduino, Raspberry Pi, câbles, etc.) actuellement suivi via tableurs et échanges informels. IcamTrack centralise la gestion du matériel, des emprunts et fournit une vue synthétique via un tableau de bord.

**Livrables attendus :** code source, base de données fonctionnelle, interface utilisable, rapport de projet, backlog Agile, soutenance orale.

---

## 2. Utilisateurs et rôles

| Rôle | Accès |
|------|-------|
| `student` | Parcourir le catalogue, créer des demandes d'emprunt (par catégorie + quantité), consulter ses demandes et son historique |
| `admin` | Tout ce qu'un étudiant peut faire + gérer le matériel/catégories, valider/refuser/clôturer les emprunts, voir l'historique complet, gérer les utilisateurs |

**Authentification :** Email / mot de passe via Supabase Auth. Le rôle est stocké dans la table `profiles` et contrôlé côté serveur via RLS.

---

## 3. Architecture

### Vue d'ensemble

```
Frontend (React + Vite)
  └── Supabase JS SDK
        ├── Auth (email/password)
        ├── PostgreSQL + RLS (CRUD direct pour lecture)
        └── Edge Functions Deno (logique métier critique)
```

### Stack technique

- **Frontend :** React 18, Vite, React Router v6, TanStack Query, Tailwind CSS, shadcn/ui, Lucide icons
- **Backend :** Supabase (Auth, PostgreSQL, Edge Functions)
- **Design system :** Data-Dense Dashboard — palette slate/vert émeraude, typo Fira Sans / Fira Code
- **Déploiement :** Vercel (frontend) + Supabase cloud

---

## 4. Schéma de base de données

### Tables

**`profiles`** — extension de `auth.users`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid PK (FK auth.users) | |
| `full_name` | text | |
| `role` | enum `student\|admin` | default `student` |
| `email` | text | |
| `created_at` | timestamptz | |

**`categories`**
| Colonne | Type |
|---------|------|
| `id` | uuid PK |
| `name` | text unique |
| `description` | text nullable |

**`equipment`**
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid PK | |
| `name` | text | |
| `category_id` | uuid FK categories | |
| `serial_number` | text nullable | |
| `status` | enum `available\|borrowed\|unavailable` | default `available` |
| `notes` | text nullable | |
| `created_at` | timestamptz | |

**`loan_requests`**
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid PK | |
| `student_id` | uuid FK profiles | |
| `status` | enum `pending\|approved\|active\|closed\|rejected` | |
| `due_date` | date nullable | Date de retour prévue (facultative) |
| `admin_note` | text nullable | Motif de refus ou note admin |
| `created_at` | timestamptz | |
| `closed_at` | timestamptz nullable | |

**`loan_items`** — un enregistrement par item physique dans une demande
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid PK | |
| `loan_id` | uuid FK loan_requests | |
| `category_id` | uuid FK categories | Catégorie demandée (toujours rempli) |
| `equipment_id` | uuid FK equipment nullable | NULL jusqu'à validation admin |
| `returned_at` | timestamptz nullable | |

> Une demande "3× Arduino Uno" génère **3 lignes** dans cette table (toutes category=Arduino, equipment_id=NULL). L'admin assigne un `equipment_id` sur chaque ligne à la validation. Le retour est global (pas de retour partiel) : `close-loan` remplit `returned_at` sur toutes les lignes en une fois.

### RLS (Row Level Security)

- `loan_requests` : SELECT limité à `student_id = auth.uid()` pour les étudiants ; admin voit tout
- `loan_items` : accès via `loan_requests` du même étudiant
- `equipment` / `categories` : lecture publique (authentifiés) ; écriture admin seulement
- `profiles` : lecture de son propre profil ; admin voit tout

---

## 5. Edge Functions

| Fonction | Appelée par | Rôle |
|----------|-------------|------|
| `create-loan-request` | Étudiant | Vérifie stock disponible dans la catégorie, crée `loan_request` + `loan_items`, statut → `pending` |
| `approve-loan-request` | Admin | Assigne des `equipment_id` spécifiques aux `loan_items`, passe statut → `active`, met `equipment.status` → `borrowed` |
| `reject-loan-request` | Admin | Passe statut → `rejected`, enregistre `admin_note` |
| `close-loan` | Admin | Enregistre `returned_at` sur les `loan_items`, libère `equipment.status` → `available`, passe statut → `closed`, enregistre `closed_at` |

---

## 6. Pages et navigation

### Interface étudiant

| Route | Description |
|-------|-------------|
| `/login` | Connexion email/mot de passe |
| `/dashboard` | Résumé : emprunts actifs, demandes en attente |
| `/catalogue` | Parcourir les catégories, voir disponibilité, créer une demande |
| `/mes-demandes` | Liste des demandes avec statut (pending / active / closed / rejected) |
| `/historique` | Emprunts clôturés avec dates et items |

### Interface admin (`/admin/*`)

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | KPIs + donut répartition statuts + table emprunts actifs + file d'attente demandes |
| `/admin/materiel` | CRUD équipements, filtres par catégorie/statut |
| `/admin/categories` | CRUD catégories |
| `/admin/demandes` | File des demandes `pending` → validation + assignation items |
| `/admin/emprunts-actifs` | Emprunts `active` → clôture (retour) |
| `/admin/historique` | Historique complet filtrable par étudiant ou équipement |
| `/admin/utilisateurs` | Liste comptes, passage role `student` → `admin` |

---

## 7. Flux principal (happy path)

```
1. Étudiant → /catalogue
   → choisit une catégorie + quantité
   → soumet (Edge Fn: create-loan-request)
   → loan_request.status = pending

2. Admin → /admin/demandes
   → voit la demande en attente
   → assigne les items physiques
   → valide (Edge Fn: approve-loan-request)
   → loan_request.status = active
   → equipment.status = borrowed

3. Admin → /admin/emprunts-actifs
   → enregistre le retour
   → clôture (Edge Fn: close-loan)
   → loan_request.status = closed
   → equipment.status = available
```

---

## 8. Composants UI clés

| Composant | Rôle |
|-----------|------|
| `KPICard` | Chiffre + label + couleur sémantique (vert/amber/rouge) |
| `StatusDonut` | Recharts — 3 segments disponible/emprunté/indisponible |
| `LoanTable` | Table tri par colonne, badge statut, ligne retard en amber |
| `PendingQueue` | Actions rapides approuver/refuser en 1 clic |
| `EquipmentForm` | Formulaire création/édition équipement (validation Zod) |
| `LoanRequestForm` | Sélecteur catégorie + stepper quantité |

---

## 9. Design system

- **Style :** Data-Dense Dashboard
- **Couleurs :** Slate `#334155` (primary), vert émeraude `#059669` (accent), fond `#F8FAFC`
- **Typo :** Fira Sans (body), Fira Code (données numériques, codes)
- **Icônes :** Lucide React (stroke consistent, pas d'emoji)
- **Composants :** shadcn/ui (Radix UI) + Tailwind CSS

---

## 10. Planning sprints (d'après planning ICAM)

| Semaine | Sprint | Jalon |
|---------|--------|-------|
| S1 Mai | Init + Conception BDD | Schéma BDD validé, dépôt initialisé |
| S2 Mai | Sprint 1 — CRUD Matériel | JALON 1 : inventaire gérable |
| S3 Mai | Sprint 2a — Emprunts (création) | Emprunt assignable |
| S4 Mai | Sprint 2b — Retours + historique | JALON 2 : cycle emprunt/retour complet |
| S5 Juin | Sprint 3 — Dashboard | JALON 3 : vue globale fonctionnelle |
| S6 Juin | Recette + UI + Rapport | JALON 4 : application figée et stable |
| S7 Juin | Soutenance | JALON 5 : projet validé |
