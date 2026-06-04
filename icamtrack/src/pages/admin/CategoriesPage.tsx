import { useState } from 'react'
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories'
import type { Category } from '../../lib/types'

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const del = useDeleteCategory()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function openCreate() { setEditing(null); setName(''); setDescription(''); setShowForm(true) }
  function openEdit(cat: Category) { setEditing(cat); setName(cat.name); setDescription(cat.description ?? ''); setShowForm(true) }
  function cancel() { setShowForm(false); setEditing(null) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) await update.mutateAsync({ id: editing.id, name, description })
    else await create.mutateAsync({ name, description })
    cancel()
  }

  if (isLoading) return <p className="text-muted p-8">Chargement...</p>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg">Catégories</h1>
          <p className="text-muted text-[11px] font-bold uppercase tracking-[2px] mt-1">{categories?.length ?? 0} catégorie(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg cursor-pointer transition-colors"
        >
          <Plus size={14} /> Nouvelle catégorie
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="bg-surface border-2 border-border p-4 mb-4 flex gap-3 items-end"
        >
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">Nom *</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-bg border-2 border-border px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors" />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              className="w-full bg-bg border-2 border-border px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors" />
          </div>
          <button type="submit" className="p-2 border-2 border-success text-success hover:bg-success hover:text-white cursor-pointer transition-colors"><Check size={16} /></button>
          <button type="button" onClick={cancel} className="p-2 border-2 border-border text-muted hover:border-fg hover:text-fg cursor-pointer transition-colors"><X size={16} /></button>
        </motion.form>
      )}

      <div className="bg-bg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Nom</th>
              <th className="text-left px-5 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Description</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories?.map((cat, i) => (
              <motion.tr
                key={cat.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-b border-border last:border-0 hover:bg-surface transition-colors"
              >
                <td className="px-5 py-3 font-bold uppercase text-xs tracking-wide text-fg">{cat.name}</td>
                <td className="px-5 py-3 text-muted text-xs">{cat.description ?? '—'}</td>
                <td className="px-5 py-3 flex gap-2 justify-end">
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-muted hover:text-fg cursor-pointer transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => del.mutate(cat.id)} className="p-1.5 text-muted hover:text-pink cursor-pointer transition-colors"><Trash2 size={14} /></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {categories?.length === 0 && <p className="text-center text-muted py-8 text-[11px] font-bold uppercase tracking-[2px]">Aucune catégorie.</p>}
      </div>
    </div>
  )
}
