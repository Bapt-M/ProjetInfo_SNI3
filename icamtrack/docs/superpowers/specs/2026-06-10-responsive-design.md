# Responsive Design — IcamTrack

## Contexte

L'interface actuelle est desktop-first. Sur mobile, la topnav déborde, les tables dépassent l'écran et les grilles de dashboard s'écrasent. Ce spec couvre la mise en responsive complète de l'app admin et étudiant.

## Décisions de design

| Élément | Mobile | Desktop |
|---|---|---|
| Navigation | Drawer latéral (hamburger ☰) | Topbar horizontale actuelle |
| Tables | Colonnes prioritaires + métadonnées sous le nom | Table complète inchangée |
| KPI grid | 2×2 | 4 colonnes en ligne |
| Donut dashboard | Masqué (`hidden sm:block`) | Visible |
| Formulaires | Champs empilés | Grille 2 colonnes |

## Breakpoints

Tailwind CSS natif :
- `sm` = 640px (bascule mobile → desktop pour la majorité des éléments)
- `lg` = 1024px (utilisé ponctuellement pour les très larges grilles)

## Navigation — Drawer mobile

### AdminLayout et StudentLayout

**Desktop** : topbar actuelle inchangée (`hidden sm:flex` sur les nav items).

**Mobile** :
- Le logo reste dans la topbar.
- Les nav items sont remplacés par un bouton ☰ (`sm:hidden`).
- Un état `drawerOpen: boolean` (useState) contrôle le drawer.
- Le drawer est `fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-200` avec `translate-x-0` quand ouvert et `-translate-x-full` quand fermé.
- Un overlay sombre `fixed inset-0 bg-black/50 z-40` se ferme au tap.
- Chaque NavLink dans le drawer ferme le drawer (`setDrawerOpen(false)`) au clic.
- Le badge "Demandes" est visible dans le drawer (même logique que la topbar).

## Tables — Colonnes prioritaires

Pattern appliqué à : `MaterielPage`, `EmpruntsActifsPage`, `DemandesPage`, `HistoriquePage`, `LoanTable`.

**Règle** : les colonnes secondaires ont la classe `hidden sm:table-cell`. Sur mobile, la colonne principale (nom/étudiant) affiche les métadonnées secondaires dans un `<div>` sous le texte principal :

```tsx
<td className="px-4 py-3">
  <div className="font-bold uppercase text-xs text-fg">{eq.name}</div>
  <div className="text-muted text-[10px] font-mono sm:hidden">{eq.category?.name} · {eq.serial_number ?? '—'}</div>
</td>
<td className="hidden sm:table-cell px-4 py-3 text-muted text-xs">{eq.category?.name}</td>
<td className="hidden sm:table-cell px-4 py-3 text-muted font-mono text-xs">{eq.serial_number ?? '—'}</td>
```

Les colonnes **toujours visibles** : nom/étudiant, statut, actions.  
Les colonnes **masquées sur mobile** : catégorie, n° série, date, note admin (selon la table).

## Dashboard admin

### KPI grid
```tsx
// Avant
className="grid grid-cols-4 border-b-2 border-fg"
// Après
className="grid grid-cols-2 sm:grid-cols-4 border-b-2 border-fg"
```

### Section donut + demandes
```tsx
// Avant
className="grid grid-cols-3 border-b border-border"
// Après
className="grid grid-cols-1 sm:grid-cols-3 border-b border-border"
```
Le bloc donut reçoit `className="hidden sm:block border-r border-border p-6"`.  
La liste demandes (`col-span-2`) devient `col-span-1 sm:col-span-2` et prend toute la largeur sur mobile.

### Header
```tsx
// flex-col sur mobile, flex-row sur desktop
className="flex flex-col sm:flex-row sm:items-end justify-between px-4 sm:px-8 py-6 border-b-2 border-fg gap-4"
```
Le bouton "Demandes →" reçoit `w-full sm:w-auto`.

## Formulaires

`EquipmentForm` et `LoanRequestForm` : les champs passent en `grid grid-cols-1 sm:grid-cols-2 gap-4`. Les champs qui doivent prendre toute la largeur (textarea notes, select catégorie) reçoivent `sm:col-span-2`.

## Padding et espacement

- `p-6` sur les pages → `p-4 sm:p-6`
- Titres h1 `text-2xl` → inchangés (déjà corrects)
- `px-8` dans le dashboard header → `px-4 sm:px-8`

## Fichiers à modifier

1. `src/components/layout/AdminLayout.tsx` — drawer + état `drawerOpen`
2. `src/components/layout/StudentLayout.tsx` — drawer (4 items, plus simple)
3. `src/pages/admin/DashboardPage.tsx` — grilles adaptatives, header, donut masqué
4. `src/pages/admin/MaterielPage.tsx` — colonnes prioritaires
5. `src/pages/admin/EmpruntsActifsPage.tsx` — colonnes prioritaires
6. `src/pages/admin/DemandesPage.tsx` — colonnes prioritaires
7. `src/pages/admin/HistoriquePage.tsx` — colonnes prioritaires
8. `src/components/LoanTable.tsx` — colonnes prioritaires
9. `src/components/EquipmentForm.tsx` — layout form responsive

## Ce qui n'est pas dans le scope

- Refonte du marquee (fonctionne déjà avec overflow hidden)
- Pages étudiant (CataloguePage, MesDemandesPage) — mises en responsive par les mêmes patterns mais non détaillées ici car moins critiques
- Tests automatisés de responsive
