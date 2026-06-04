import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useEquipment, useCreateEquipment, useUpdateEquipment, useDeleteEquipment } from '../../hooks/useEquipment'
import { useCategories } from '../../hooks/useCategories'
import { EquipmentForm } from '../../components/EquipmentForm'
import type { Equipment, EquipmentStatus } from '../../lib/types'

const statusLabel: Record<EquipmentStatus, { label: string; color: string }> = {
  available: { label: 'Disponible', color: 'border border-success text-success' },
  borrowed: { label: 'Emprunté', color: 'border border-yellow-text text-yellow-text' },
  unavailable: { label: 'Indisponible', color: 'border border-pink text-pink' },
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg">Matériel</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg cursor-pointer transition-colors"
        >
          <Plus size={14} /> Nouveau matériel
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="bg-surface border-2 border-border px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors">
          <option value="">Toutes les catégories</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as EquipmentStatus | '')}
          className="bg-surface border-2 border-border px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors">
          <option value="">Tous les statuts</option>
          <option value="available">Disponible</option>
          <option value="borrowed">Emprunté</option>
          <option value="unavailable">Indisponible</option>
        </select>
      </div>

      {showForm && (
        <div className="bg-surface border-2 border-border p-4 mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[3px] text-muted mb-3">{editing ? 'Modifier' : 'Nouveau matériel'}</h2>
          <EquipmentForm
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </div>
      )}

      {isLoading ? <p className="text-muted text-[11px] font-bold uppercase">Chargement...</p> : (
        <div className="bg-bg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Nom</th>
                <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Catégorie</th>
                <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">N° série</th>
                <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {equipment?.map(eq => {
                const s = statusLabel[eq.status]
                return (
                  <tr key={eq.id} className="border-b border-border hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-bold uppercase text-xs tracking-wide text-fg">{eq.name}</td>
                    <td className="px-4 py-3 text-muted text-xs">{eq.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted font-mono text-xs">{eq.serial_number ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => openEdit(eq)} className="p-1.5 text-muted hover:text-fg cursor-pointer transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => del.mutate(eq.id)} className="p-1.5 text-muted hover:text-pink cursor-pointer transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {equipment?.length === 0 && <p className="text-center text-muted py-8 text-[11px] font-bold uppercase tracking-[2px]">Aucun matériel.</p>}
        </div>
      )}
    </div>
  )
}
