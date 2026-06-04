import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useEquipment, useCreateEquipment, useUpdateEquipment, useDeleteEquipment } from '../../hooks/useEquipment'
import { useCategories } from '../../hooks/useCategories'
import { EquipmentForm } from '../../components/EquipmentForm'
import type { Equipment, EquipmentStatus } from '../../lib/types'

const statusLabel: Record<EquipmentStatus, { label: string; color: string }> = {
  available: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-800' },
  borrowed: { label: 'Emprunté', color: 'bg-amber-100 text-amber-800' },
  unavailable: { label: 'Indisponible', color: 'bg-red-100 text-red-800' },
}

export function MaterielPage() {
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | ''>('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Equipment | null>(null)

  const { data: equipment, isLoading } = useEquipment({
    categoryId: filterCat || undefined,
    status: filterStatus || undefined,
  })
  const { data: categories } = useCategories()
  const create = useCreateEquipment()
  const update = useUpdateEquipment()
  const del = useDeleteEquipment()

  function openCreate() { setEditing(null); setShowForm(true) }
  function openEdit(eq: Equipment) { setEditing(eq); setShowForm(true) }

  async function handleSubmit(values: { name: string; category_id: string; status: EquipmentStatus; serial_number?: string; notes?: string }) {
    const payload: Omit<Equipment, 'id' | 'created_at' | 'category'> = {
      name: values.name,
      category_id: values.category_id,
      status: values.status,
      serial_number: values.serial_number ?? null,
      notes: values.notes ?? null,
    }
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">Matériel</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-accent text-white px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-emerald-700">
          <Plus size={14} /> Nouveau matériel
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Toutes les catégories</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as EquipmentStatus | '')}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Tous les statuts</option>
          <option value="available">Disponible</option>
          <option value="borrowed">Emprunté</option>
          <option value="unavailable">Indisponible</option>
        </select>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <h2 className="font-medium text-slate-700 mb-3">{editing ? 'Modifier' : 'Nouveau matériel'}</h2>
          <EquipmentForm
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </div>
      )}

      {isLoading ? <p className="text-slate-500">Chargement...</p> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">N° série</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {equipment?.map(eq => {
                const s = statusLabel[eq.status]
                return (
                  <tr key={eq.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{eq.name}</td>
                    <td className="px-4 py-3 text-slate-500">{eq.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{eq.serial_number ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => openEdit(eq)} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"><Pencil size={14} /></button>
                      <button onClick={() => del.mutate(eq.id)} className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {equipment?.length === 0 && <p className="text-center text-slate-400 py-8">Aucun matériel.</p>}
        </div>
      )}
    </div>
  )
}
