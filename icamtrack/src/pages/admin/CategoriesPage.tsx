import { useState } from 'react'
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react'
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

  if (isLoading) return <p className="text-slate-500">Chargement...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Catégories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-accent text-white px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-emerald-700">
          <Plus size={14} /> Nouvelle catégorie
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button type="submit" className="p-2 bg-accent text-white rounded-lg cursor-pointer hover:bg-emerald-700"><Check size={16} /></button>
          <button type="button" onClick={cancel} className="p-2 bg-slate-200 rounded-lg cursor-pointer hover:bg-slate-300"><X size={16} /></button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories?.map(cat => (
              <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{cat.name}</td>
                <td className="px-4 py-3 text-slate-500">{cat.description ?? '—'}</td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"><Pencil size={14} /></button>
                  <button onClick={() => del.mutate(cat.id)} className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories?.length === 0 && (
          <p className="text-center text-slate-400 py-8">Aucune catégorie. Créez-en une.</p>
        )}
      </div>
    </div>
  )
}
