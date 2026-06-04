import { useState } from 'react'
import { Package, Plus } from 'lucide-react'
import { useEquipment } from '../../hooks/useEquipment'
import { useCategories } from '../../hooks/useCategories'
import { LoanRequestForm } from '../../components/LoanRequestForm'
import type { EquipmentStatus } from '../../lib/types'

const statusLabel: Record<EquipmentStatus, { label: string; color: string }> = {
  available: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-800' },
  borrowed: { label: 'Emprunté', color: 'bg-amber-100 text-amber-800' },
  unavailable: { label: 'Indisponible', color: 'bg-red-100 text-red-800' },
}

export function CataloguePage() {
  const [filterCat, setFilterCat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { data: equipment, isLoading } = useEquipment({ categoryId: filterCat || undefined })
  const { data: categories } = useCategories()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Catalogue</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-accent text-white px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-emerald-700">
          <Plus size={14} /> Faire une demande
        </button>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat('')}
          className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${!filterCat ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>
          Tout
        </button>
        {categories?.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${filterCat === c.id ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {isLoading ? <p className="text-slate-500">Chargement...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {equipment?.map(eq => {
            const s = statusLabel[eq.status]
            return (
              <div key={eq.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <Package size={18} className="text-slate-400 mt-0.5" />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                </div>
                <p className="font-medium text-slate-800 text-sm">{eq.name}</p>
                <p className="text-xs text-slate-400 mt-1">{eq.category?.name}</p>
                {eq.serial_number && (
                  <p className="text-xs text-slate-300 font-mono mt-1">#{eq.serial_number}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && <LoanRequestForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
