# Packs & Panier — IcamTrack

## Contexte

Le système actuel de demande d'emprunt est un formulaire modal où l'étudiant sélectionne des catégories à la carte. L'objectif est d'ajouter des **packs** (bundles prédéfinis de catégories) gérés par l'admin, et un **panier persistant** visible dans la page catalogue pour composer sa demande avant de la soumettre.

## Schéma DB

Deux nouvelles tables, nouvelle migration `supabase/migrations/20260617000000_packs.sql` :

```sql
create table packs (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

create table pack_items (
  id          uuid primary key default uuid_generate_v4(),
  pack_id     uuid not null references packs(id) on delete cascade,
  category_id uuid not null references categories(id),
  quantity    int  not null default 1 check (quantity > 0)
);
```

RLS :
- `packs` : select pour tout utilisateur connecté, all pour admin
- `pack_items` : select pour tout utilisateur connecté, all pour admin

## Types TypeScript

Ajouts dans `src/lib/types.ts` :

```ts
export interface Pack {
  id: string
  name: string
  description: string | null
  created_at: string
  items?: PackItem[]
}

export interface PackItem {
  id: string
  pack_id: string
  category_id: string
  quantity: number
  category?: Category
}
```

## Côté admin

### Navigation
Nouveau nav item **"Packs"** dans `AdminLayout` entre Catégories et Demandes :
```ts
{ to: '/admin/packs', label: 'Packs', dot: '#7C3AED' }
```

### PacksPage (`src/pages/admin/PacksPage.tsx`)
Table CRUD identique en style à `CategoriesPage` :
- Colonnes : Nom, Description, Nombre d'items, Actions (éditer / supprimer)
- Bouton "Nouveau pack" ouvre `PackForm` inline (même pattern que `MaterielPage`)
- Suppression d'un pack supprime les `pack_items` en cascade (FK)

### PackForm (`src/components/PackForm.tsx`)
Formulaire avec :
- Champ `name` (requis)
- Champ `description` (optionnel)
- Liste d'items dynamique : chaque item = sélecteur catégorie + compteur quantité (+/−). Bouton "+ Ajouter un item". Bouton poubelle par item.
- Validation : au moins 1 item, pas de doublon de catégorie dans le même pack
- `onSubmit` reçoit `{ name, description, items: { category_id, quantity }[] }`

### Hook (`src/hooks/usePacks.ts`)
- `usePacks()` — liste tous les packs avec leurs items et catégories
- `useCreatePack()` — mutation : crée le pack puis insère les pack_items
- `useUpdatePack()` — mutation : met à jour le pack et remplace les pack_items (delete all + re-insert)
- `useDeletePack()` — mutation : supprime le pack (cascade sur pack_items)

Query vers Supabase :
```ts
supabase.from('packs').select('*, items:pack_items(*, category:categories(id,name))')
```

### Route
Nouvelle route dans `src/App.tsx` : `/admin/packs` → `<PacksPage />`

## Côté étudiant — Catalogue avec panier

### Layout
`CataloguePage` passe en layout 2 colonnes sur desktop :
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
  <div>/* catalogue */</div>
  <div className="hidden lg:block sticky top-24">/* panier */</div>
</div>
```

Sur mobile : panier masqué, bouton flottant `fixed bottom-4 right-4` affiché **uniquement si le panier contient au moins 1 item**, affichant le nombre d'items. Cliquer ouvre un drawer depuis le bas (`fixed inset-x-0 bottom-0`, hauteur max `80vh`, scroll interne).

### Section Packs (en haut du catalogue)
Au-dessus de la grille matériel, une section "Packs disponibles" avec des cartes horizontales :
```
[Nom du pack]  [Description]  [item1 x1, item2 x2, ...]  [→ Ajouter au panier]
```
Cliquer sur "Ajouter au panier" ajoute d'un coup tous les `pack_items` dans le panier (par catégorie + quantité).

### État du panier
```ts
interface CartItem { category_id: string; category_name: string; quantity: number }
const [cart, setCart] = useState<CartItem[]>([])
```

- `addToCart(items: CartItem[])` — merge avec les items existants (additionne les quantités si même catégorie)
- `removeFromCart(category_id: string)` — supprime
- `changeQty(category_id: string, delta: number)` — ajuste la quantité (min 1)

### Panneau panier
```
PANIER (3)
────────────────────────
Arduino Uno       [−][1][+] [x]
Breadboard        [−][2][+] [x]
Kit câbles        [−][1][+] [x]
────────────────────────
Date de retour : [input date]
[Soumettre la demande]
```
La soumission appelle `supabase.functions.invoke('create-loan-request', { body: { items, due_date } })` — identique à l'actuel. Le panier se vide après succès.

### Suppression du LoanRequestForm modal
Le modal `LoanRequestForm` est remplacé par le panier. Le bouton "Faire une demande" est supprimé du header de `CataloguePage`. Le formulaire modal `LoanRequestForm.tsx` peut rester pour les autres pages qui l'importeraient (aucune pour l'instant — il peut être supprimé).

## Fichiers à créer/modifier

| Action | Fichier |
|---|---|
| Créer | `supabase/migrations/20260617000000_packs.sql` |
| Modifier | `src/lib/types.ts` |
| Créer | `src/hooks/usePacks.ts` |
| Modifier | `src/components/layout/AdminLayout.tsx` |
| Créer | `src/pages/admin/PacksPage.tsx` |
| Créer | `src/components/PackForm.tsx` |
| Modifier | `src/pages/student/CataloguePage.tsx` |
| Modifier | `src/App.tsx` |
| Supprimer | `src/components/LoanRequestForm.tsx` |

## Hors scope

- Persistance du panier entre sessions (localStorage) — pas nécessaire pour un outil de labo
- Packs suggérés automatiquement selon l'historique
- Notifications temps réel sur la disponibilité des items du panier
