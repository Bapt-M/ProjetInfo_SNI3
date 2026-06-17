# Packs & Panier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter des packs (bundles de catégories gérés par l'admin) et un panier sticky dans le catalogue étudiant pour composer et soumettre une demande d'emprunt.

**Architecture:** Deux nouvelles tables Supabase (`packs`, `pack_items`). Côté admin : page CRUD + formulaire. Côté étudiant : refonte de `CataloguePage` avec layout 2 colonnes (catalogue + panier sticky) et section packs en haut. Panier en `useState` local, soumission via l'edge function `create-loan-request` existante.

**Tech Stack:** React, TypeScript, Tailwind CSS, @tanstack/react-query, Supabase JS v2, Lucide React

---

## Task 1 : Migration SQL — tables packs et pack_items

**Files:**
- Create: `supabase/migrations/20260617000000_packs.sql`

- [ ] **Créer le fichier de migration**

```sql
-- Packs (bundles de catégories prédéfinis)
create table packs (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- Items d'un pack
create table pack_items (
  id          uuid primary key default uuid_generate_v4(),
  pack_id     uuid not null references packs(id) on delete cascade,
  category_id uuid not null references categories(id),
  quantity    int  not null default 1 check (quantity > 0)
);

-- RLS
alter table packs      enable row level security;
alter table pack_items enable row level security;

create policy "read_packs"         on packs      for select using (auth.uid() is not null);
create policy "admin_manage_packs" on packs      for all    using (is_admin());

create policy "read_pack_items"         on pack_items for select using (auth.uid() is not null);
create policy "admin_manage_pack_items" on pack_items for all    using (is_admin());
```

- [ ] **Vérifier**

```bash
cat supabase/migrations/20260617000000_packs.sql
```
Doit afficher les deux CREATE TABLE, les deux ALTER TABLE et les quatre CREATE POLICY.

- [ ] **Commit**

```bash
git add supabase/migrations/20260617000000_packs.sql
git commit -m "feat: migration SQL — tables packs et pack_items"
```

---

## Task 2 : Types TypeScript + hook usePacks

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/hooks/usePacks.ts`

- [ ] **Ajouter les types dans `src/lib/types.ts`**

Ajouter à la fin du fichier (après l'interface `LoanRequest`) :

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

- [ ] **Créer `src/hooks/usePacks.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Pack } from '../lib/types'

export function usePacks() {
  return useQuery({
    queryKey: ['packs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packs')
        .select('*, items:pack_items(*, category:categories(id,name))')
        .order('name')
      if (error) throw error
      return data as Pack[]
    },
  })
}

export function useCreatePack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: {
      name: string
      description: string
      items: { category_id: string; quantity: number }[]
    }) => {
      const { data: pack, error: packError } = await supabase
        .from('packs')
        .insert({ name: values.name, description: values.description || null })
        .select('id')
        .single()
      if (packError) throw packError
      if (values.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('pack_items')
          .insert(values.items.map(i => ({ pack_id: pack.id, category_id: i.category_id, quantity: i.quantity })))
        if (itemsError) throw itemsError
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packs'] }),
  })
}

export function useUpdatePack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: {
      id: string
      name: string
      description: string
      items: { category_id: string; quantity: number }[]
    }) => {
      const { error: packError } = await supabase
        .from('packs')
        .update({ name: values.name, description: values.description || null })
        .eq('id', values.id)
      if (packError) throw packError

      const { error: deleteError } = await supabase
        .from('pack_items')
        .delete()
        .eq('pack_id', values.id)
      if (deleteError) throw deleteError

      if (values.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('pack_items')
          .insert(values.items.map(i => ({ pack_id: values.id, category_id: i.category_id, quantity: i.quantity })))
        if (itemsError) throw itemsError
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packs'] }),
  })
}

export function useDeletePack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('packs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packs'] }),
  })
}
```

- [ ] **Commit**

```bash
git add src/lib/types.ts src/hooks/usePacks.ts
git commit -m "feat: types Pack/PackItem et hook usePacks (CRUD)"
```

---

## Task 3 : Composant PackForm

**Files:**
- Create: `src/components/PackForm.tsx`

- [ ] **Créer `src/components/PackForm.tsx`**

```tsx
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import type { Pack } from '../lib/types'

interface PackFormItem { category_id: string; quantity: number }

interface Props {
  defaultValues?: Pack
  onSubmit: (values: { name: string; description: string; items: PackFormItem[] }) => Promise<void>
  onCancel: () => void
}

export function PackForm({ defaultValues, onSubmit, onCancel }: Props) {
  const { data: categories } = useCategories()
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [items, setItems] = useState<PackFormItem[]>(
    defaultValues?.items?.map(i => ({ category_id: i.category_id, quantity: i.quantity })) ?? []
  )
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function addItem() {
    const firstUnused = categories?.find(c => !items.some(i => i.category_id === c.id))
    if (!firstUnused) return
    setItems(prev => [...prev, { category_id: firstUnused.id, quantity: 1 }])
  }

  function updateCategory(index: number, category_id: string) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, category_id } : item))
  }

  function changeQty(index: number, delta: number) {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ))
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!name.trim()) { setFormError('Le nom est requis.'); return }
    if (items.length === 0) { setFormError('Ajoutez au moins un article.'); return }
    const hasDuplicate = items.some(
      (item, i) => items.findIndex(x => x.category_id === item.category_id) !== i
    )
    if (hasDuplicate) { setFormError('Deux articles ne peuvent pas avoir la même catégorie.'); return }
    setSubmitting(true)
    await onSubmit({ name: name.trim(), description: description.trim(), items })
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">Nom *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border-2 border-border bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">Description</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border-2 border-border bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted">Articles du pack</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[2px] text-fg border border-border hover:border-fg px-2 py-1 cursor-pointer transition-colors"
          >
            <Plus size={11} /> Ajouter
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-muted text-[11px] font-bold uppercase py-3 border border-dashed border-border text-center">
            Aucun article — cliquez sur Ajouter
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 border border-border p-2">
              <select
                value={item.category_id}
                onChange={e => updateCategory(index, e.target.value)}
                className="flex-1 bg-bg border-2 border-border px-2 py-1.5 text-sm text-fg focus:outline-none focus:border-fg transition-colors"
              >
                {categories?.map(c => (
                  <option
                    key={c.id}
                    value={c.id}
                    disabled={c.id !== item.category_id && items.some(i => i.category_id === c.id)}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => changeQty(index, -1)}
                  className="w-7 h-7 flex items-center justify-center border border-border text-muted hover:text-fg cursor-pointer transition-colors text-sm"
                >−</button>
                <span className="w-6 text-center text-sm font-mono font-bold text-fg">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQty(index, 1)}
                  className="w-7 h-7 flex items-center justify-center border border-border text-muted hover:text-fg cursor-pointer transition-colors text-sm"
                >+</button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-1.5 text-muted hover:text-pink cursor-pointer transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {formError && <p role="alert" className="text-pink text-[10px] font-bold uppercase">{formError}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] border-2 border-border text-muted hover:border-fg hover:text-fg cursor-pointer transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg disabled:opacity-50 cursor-pointer transition-colors"
        >
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Commit**

```bash
git add src/components/PackForm.tsx
git commit -m "feat: composant PackForm — création/édition de packs avec items dynamiques"
```

---

## Task 4 : Page admin PacksPage

**Files:**
- Create: `src/pages/admin/PacksPage.tsx`

- [ ] **Créer `src/pages/admin/PacksPage.tsx`**

```tsx
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { usePacks, useCreatePack, useUpdatePack, useDeletePack } from '../../hooks/usePacks'
import { PackForm } from '../../components/PackForm'
import type { Pack } from '../../lib/types'

export function PacksPage() {
  const { data: packs, isLoading } = usePacks()
  const create = useCreatePack()
  const update = useUpdatePack()
  const del = useDeletePack()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Pack | null>(null)

  function openCreate() { setEditing(null); setShowForm(true) }
  function openEdit(pack: Pack) { setEditing(pack); setShowForm(true) }
  function cancel() { setShowForm(false); setEditing(null) }

  async function handleSubmit(values: { name: string; description: string; items: { category_id: string; quantity: number }[] }) {
    if (editing) await update.mutateAsync({ id: editing.id, ...values })
    else await create.mutateAsync(values)
    cancel()
  }

  if (isLoading) return <p className="text-muted p-8 text-[11px] font-bold uppercase">Chargement...</p>

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg">Packs</h1>
          <p className="text-muted text-[11px] font-bold uppercase tracking-[2px] mt-1">
            {packs?.length ?? 0} pack(s)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg cursor-pointer transition-colors"
        >
          <Plus size={14} /> Nouveau pack
        </button>
      </div>

      {showForm && (
        <div className="bg-surface border-2 border-border p-4 mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[3px] text-muted mb-3">
            {editing ? 'Modifier le pack' : 'Nouveau pack'}
          </h2>
          <PackForm
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={cancel}
          />
        </div>
      )}

      <div className="bg-bg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Nom</th>
              <th className="hidden sm:table-cell text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Description</th>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Articles</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {packs?.map(pack => (
              <tr key={pack.id} className="border-b border-border hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-bold uppercase text-xs tracking-wide text-fg">{pack.name}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-muted text-xs">{pack.description ?? '—'}</td>
                <td className="px-4 py-3 text-muted text-xs font-mono">{pack.items?.length ?? 0} article(s)</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(pack)} className="p-1.5 text-muted hover:text-fg cursor-pointer transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => del.mutate(pack.id)} className="p-1.5 text-muted hover:text-pink cursor-pointer transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {packs?.length === 0 && (
          <p className="text-center text-muted py-8 text-[11px] font-bold uppercase tracking-[2px]">Aucun pack.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/pages/admin/PacksPage.tsx
git commit -m "feat: PacksPage — CRUD packs admin"
```

---

## Task 5 : Wiring — nav AdminLayout + route App.tsx

**Files:**
- Modify: `src/components/layout/AdminLayout.tsx`
- Modify: `src/App.tsx`

- [ ] **Ajouter "Packs" dans le tableau `nav` de `AdminLayout.tsx`**

Trouver le tableau `nav` (ligne ~8) et insérer après l'entrée `Catégories` :

```ts
const nav = [
  { to: '/admin/dashboard',      label: 'Dashboard',    dot: '#09090B' },
  { to: '/admin/materiel',       label: 'Matériel',     dot: '#00C8E0' },
  { to: '/admin/categories',     label: 'Catégories',   dot: '#71717A' },
  { to: '/admin/packs',          label: 'Packs',        dot: '#22c55e' },
  { to: '/admin/demandes',       label: 'Demandes',     dot: '#FF2D78', badge: true },
  { to: '/admin/emprunts-actifs',label: 'Emprunts',     dot: '#FF6B00' },
  { to: '/admin/historique',     label: 'Historique',   dot: '#71717A' },
  { to: '/admin/utilisateurs',   label: 'Utilisateurs', dot: '#7C3AED' },
]
```

- [ ] **Ajouter le lazy import et la route dans `src/App.tsx`**

Ajouter l'import lazy après les autres imports admin (ligne ~20) :

```ts
const PacksPage = lazy(() => import('./pages/admin/PacksPage').then(m => ({ default: m.PacksPage })))
```

Ajouter la route dans le bloc admin (après `/admin/categories`) :

```tsx
<Route path="/admin/packs" element={<PacksPage />} />
```

- [ ] **Vérifier visuellement**

```bash
npm run dev
```
Connecté en admin, le nav doit afficher "Packs" entre Catégories et Demandes. La page `/admin/packs` doit s'afficher.

- [ ] **Commit**

```bash
git add src/components/layout/AdminLayout.tsx src/App.tsx
git commit -m "feat: nav Packs dans AdminLayout + route /admin/packs"
```

---

## Task 6 : CataloguePage — layout 2 colonnes + section packs + panier

**Files:**
- Modify: `src/pages/student/CataloguePage.tsx`
- Delete: `src/components/LoanRequestForm.tsx`

- [ ] **Remplacer entièrement `src/pages/student/CataloguePage.tsx`**

```tsx
import { useState } from 'react'
import { Package, ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react'
import { useEquipment } from '../../hooks/useEquipment'
import { useCategories } from '../../hooks/useCategories'
import { usePacks } from '../../hooks/usePacks'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import type { EquipmentStatus } from '../../lib/types'

const statusLabel: Record<EquipmentStatus, { label: string; color: string }> = {
  available:   { label: 'Disponible',   color: 'border border-success text-success' },
  borrowed:    { label: 'Emprunté',     color: 'border border-yellow-text text-yellow-text' },
  unavailable: { label: 'Indisponible', color: 'border border-pink text-pink' },
}

interface CartItem { category_id: string; category_name: string; quantity: number }

export function CataloguePage() {
  const [filterCat, setFilterCat] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [dueDate, setDueDate] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: equipment, isLoading } = useEquipment({ categoryId: filterCat || undefined })
  const { data: categories } = useCategories()
  const { data: packs } = usePacks()
  const qc = useQueryClient()

  function addToCart(items: CartItem[]) {
    setCart(prev => {
      const next = [...prev]
      for (const item of items) {
        const existing = next.find(i => i.category_id === item.category_id)
        if (existing) existing.quantity += item.quantity
        else next.push({ ...item })
      }
      return next
    })
  }

  function removeFromCart(category_id: string) {
    setCart(c => c.filter(i => i.category_id !== category_id))
  }

  function changeQty(category_id: string, delta: number) {
    setCart(c => c.map(i =>
      i.category_id !== category_id ? i : { ...i, quantity: Math.max(1, i.quantity + delta) }
    ))
  }

  async function submitCart(e: React.FormEvent) {
    e.preventDefault()
    if (!cart.length) return
    setLoading(true)
    setError(null)
    const res = await supabase.functions.invoke('create-loan-request', {
      body: {
        items: cart.map(i => ({ category_id: i.category_id, quantity: i.quantity })),
        due_date: dueDate || undefined,
      },
    })
    setLoading(false)
    if (res.error) { setError(res.error.message); return }
    qc.invalidateQueries({ queryKey: ['loan_requests'] })
    setCart([])
    setDueDate('')
    setCartOpen(false)
  }

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)
  const today = new Date().toISOString().split('T')[0]

  const cartPanel = (
    <form onSubmit={submitCart} className="bg-surface border-2 border-fg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[3px] text-muted">Panier</span>
        <span className="font-mono text-xs font-bold text-fg">{totalItems} article{totalItems > 1 ? 's' : ''}</span>
      </div>

      {cart.length === 0 && (
        <p className="text-muted text-[11px] font-bold uppercase tracking-[2px] py-4 text-center border border-dashed border-border">
          Panier vide
        </p>
      )}

      {cart.map(item => (
        <div key={item.category_id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
          <span className="text-xs font-bold uppercase tracking-wide text-fg flex-1 min-w-0 truncate">{item.category_name}</span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <button type="button" onClick={() => changeQty(item.category_id, -1)}
              className="p-1 text-muted hover:text-fg cursor-pointer transition-colors"><Minus size={11} /></button>
            <span className="w-5 text-center text-xs font-mono font-bold text-fg">{item.quantity}</span>
            <button type="button" onClick={() => changeQty(item.category_id, 1)}
              className="p-1 text-muted hover:text-fg cursor-pointer transition-colors"><Plus size={11} /></button>
            <button type="button" onClick={() => removeFromCart(item.category_id)}
              className="p-1 text-muted hover:text-pink cursor-pointer transition-colors"><Trash2 size={11} /></button>
          </div>
        </div>
      ))}

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">
          Retour prévu (optionnel)
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          min={today}
          className="w-full border-2 border-border bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors"
        />
      </div>

      {error && <p role="alert" className="text-pink text-[10px] font-bold uppercase">{error}</p>}

      <button
        type="submit"
        disabled={!cart.length || loading}
        className="w-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg disabled:opacity-40 cursor-pointer transition-colors"
      >
        {loading ? 'Envoi...' : 'Soumettre la demande'}
      </button>
    </form>
  )

  return (
    <div>
      {/* Section packs */}
      {packs && packs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[3px] text-muted mb-3">Packs disponibles</h2>
          <div className="flex flex-col gap-2">
            {packs.map(pack => (
              <div key={pack.id} className="bg-bg border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-surface transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-bold uppercase text-xs tracking-wide text-fg">{pack.name}</p>
                  {pack.description && <p className="text-[10px] text-muted mt-0.5">{pack.description}</p>}
                  <p className="text-[10px] text-muted font-mono mt-1">
                    {pack.items?.map(i => `${i.category?.name} ×${i.quantity}`).join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(
                    (pack.items ?? []).map(i => ({
                      category_id: i.category_id,
                      category_name: i.category?.name ?? '',
                      quantity: i.quantity,
                    }))
                  )}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] border-2 border-fg text-fg hover:bg-fg hover:text-yellow cursor-pointer transition-colors"
                >
                  <ShoppingCart size={12} /> Ajouter au panier
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* Catalogue */}
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg mb-4">Catalogue</h1>

          <div className="mb-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCat('')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 cursor-pointer transition-colors ${!filterCat ? 'bg-fg text-yellow border-fg' : 'border-border text-muted hover:border-fg hover:text-fg'}`}
            >
              Tout
            </button>
            {categories?.map(c => (
              <button
                key={c.id}
                onClick={() => setFilterCat(c.id)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 cursor-pointer transition-colors ${filterCat === c.id ? 'bg-fg text-yellow border-fg' : 'border-border text-muted hover:border-fg hover:text-fg'}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-muted text-[11px] font-bold uppercase">Chargement...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {equipment?.map(eq => {
                const s = statusLabel[eq.status]
                return (
                  <div key={eq.id} className="bg-bg border border-border p-4 hover:bg-surface transition-colors flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <Package size={18} className="text-muted mt-0.5" />
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] ${s.color}`}>{s.label}</span>
                    </div>
                    <p className="font-bold uppercase text-xs tracking-wide text-fg">{eq.name}</p>
                    <p className="text-[10px] text-muted mt-1">{eq.category?.name}</p>
                    {eq.serial_number && <p className="text-[10px] text-muted font-mono mt-1">#{eq.serial_number}</p>}
                    {eq.status === 'available' && (
                      <button
                        type="button"
                        onClick={() => addToCart([{
                          category_id: eq.category_id,
                          category_name: eq.category?.name ?? '',
                          quantity: 1,
                        }])}
                        className="mt-auto pt-3 w-full text-[9px] font-bold uppercase tracking-[1px] border border-border text-muted hover:border-fg hover:text-fg px-2 py-1 cursor-pointer transition-colors"
                      >
                        + Panier
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Panier sticky — desktop */}
        <div className="hidden lg:block sticky top-24">
          {cartPanel}
        </div>
      </div>

      {/* Bouton flottant panier — mobile */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 right-4 lg:hidden flex items-center gap-2 px-4 py-3 bg-fg text-yellow font-bold text-[11px] uppercase tracking-[2px] shadow-lg z-30 cursor-pointer"
        >
          <ShoppingCart size={14} /> Panier ({totalItems})
        </button>
      )}

      {/* Drawer panier — mobile */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden max-h-[80vh] overflow-y-auto bg-bg border-t-2 border-fg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-[10px] font-bold uppercase tracking-[3px] text-muted">Mon panier</span>
              <button onClick={() => setCartOpen(false)} className="text-muted hover:text-fg cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              {cartPanel}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Supprimer `src/components/LoanRequestForm.tsx`**

```bash
rm src/components/LoanRequestForm.tsx
```

- [ ] **Vérifier visuellement**

```bash
npm run dev
```
En tant qu'étudiant sur `/catalogue` :
- Les packs (si créés via admin) apparaissent en haut avec un bouton "Ajouter au panier"
- Cliquer sur un pack ajoute tous ses items dans le panier
- Les cartes matériel disponible ont un bouton "+ Panier"
- Desktop : panier sticky visible à droite
- Mobile (< 1024px) : bouton flottant "Panier (N)" apparaît dès qu'un item est ajouté, ouvre le drawer

- [ ] **Commit**

```bash
git add src/pages/student/CataloguePage.tsx
git rm src/components/LoanRequestForm.tsx
git commit -m "feat: catalogue avec panier sticky et section packs"
```
