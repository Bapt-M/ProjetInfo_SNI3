import { useState } from 'react'
import { Package, Plus } from 'lucide-react'
import { useEquipment } from '../../hooks/useEquipment'
import { useCategories } from '../../hooks/useCategories'
import { LoanRequestForm } from '../../components/LoanRequestForm'
import type { EquipmentStatus } from '../../lib/types'

const statusLabel: Record<EquipmentStatus, { label: string; color: string }> = {
  available: { label: 'Disponible', color: 'border border-success text-success' },
  borrowed: { label: 'Emprunté', color: 'border border-yellow-text text-yellow-text' },
  unavailable: { label: 'Indisponible', color: 'border border-pink text-pink' },
}

export function CataloguePage() {
  const [filterCat, setFilterCat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { data: equipment, isLoading } = useEquipment({ categoryId: filterCat || undefined })
  const { data: categories } = useCategories()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg">Catalogue</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg cursor-pointer transition-colors">
          <Plus size={14} /> Faire une demande
        </button>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat('')}
          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 cursor-pointer transition-colors ${!filterCat ? 'bg-fg text-yellow border-fg' : 'border-border text-muted hover:border-fg hover:text-fg'}`}>
          Tout
        </button>
        {categories?.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 cursor-pointer transition-colors ${filterCat === c.id ? 'bg-fg text-yellow border-fg' : 'border-border text-muted hover:border-fg hover:text-fg'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {isLoading ? <p className="text-muted text-[11px] font-bold uppercase">Chargement...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {equipment?.map(eq => {
            const s = statusLabel[eq.status]
            return (
              <div key={eq.id} className="bg-bg border border-border p-4 hover:bg-surface transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <Package size={18} className="text-muted mt-0.5" />
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] ${s.color}`}>{s.label}</span>
                </div>
                <p className="font-bold uppercase text-xs tracking-wide text-fg">{eq.name}</p>
                <p className="text-[10px] text-muted mt-1">{eq.category?.name}</p>
                {eq.serial_number && (
                  <p className="text-[10px] text-muted font-mono mt-1">#{eq.serial_number}</p>
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
