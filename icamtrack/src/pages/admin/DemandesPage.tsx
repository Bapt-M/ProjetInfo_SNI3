import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useAllLoanRequests } from '../../hooks/useLoanRequests'
import { useEquipment } from '../../hooks/useEquipment'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import type { LoanRequest, LoanItem } from '../../lib/types'

function ApproveModal({ loan, onClose }: { loan: LoanRequest; onClose: () => void }) {
  const qc = useQueryClient()
  const { data: equipment } = useEquipment({ status: 'available' })
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    const items = loan.items ?? []
    if (Object.keys(assignments).length !== items.length) {
      setError('Assignez un équipement à chaque article.')
      return
    }
    setLoading(true)
    const res = await supabase.functions.invoke('approve-loan-request', {
      body: {
        loan_id: loan.id,
        assignments: Object.entries(assignments).map(([loan_item_id, equipment_id]) => ({ loan_item_id, equipment_id })),
      },
    })
    setLoading(false)
    if (res.error) { setError(res.error.message); return }
    qc.invalidateQueries({ queryKey: ['loan_requests'] })
    qc.invalidateQueries({ queryKey: ['equipment'] })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-bg border-2 border-fg shadow-xl w-full max-w-lg p-6">
        <h2 className="text-[10px] font-bold uppercase tracking-[3px] text-muted mb-1">Valider la demande</h2>
        <p className="text-sm font-bold text-fg mb-4">Étudiant : {loan.student?.full_name}</p>
        <div className="space-y-3">
          {loan.items?.map((item: LoanItem) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-sm text-fg flex-1 font-bold uppercase text-xs tracking-wide">{item.category?.name}</span>
              <select
                value={assignments[item.id] ?? ''}
                onChange={e => setAssignments(a => ({ ...a, [item.id]: e.target.value }))}
                className="bg-surface border-2 border-border px-2 py-1.5 text-sm text-fg focus:outline-none focus:border-fg transition-colors"
              >
                <option value="">Choisir un item...</option>
                {equipment
                  ?.filter(eq => eq.category_id === item.category_id)
                  .map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}{eq.serial_number ? ` #${eq.serial_number}` : ''}
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>
        {error && <p role="alert" className="text-pink text-[10px] font-bold uppercase mt-3">{error}</p>}
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] border-2 border-border text-muted hover:border-fg hover:text-fg cursor-pointer transition-colors">Annuler</button>
          <button onClick={submit} disabled={loading}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg cursor-pointer disabled:opacity-50 transition-colors">
            {loading ? 'Validation...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function DemandesPage() {
  const { data: requests, isLoading } = useAllLoanRequests('pending')
  const qc = useQueryClient()
  const [approving, setApproving] = useState<LoanRequest | null>(null)

  async function reject(loan: LoanRequest) {
    const note = window.prompt('Motif du refus (optionnel)')
    await supabase.functions.invoke('reject-loan-request', {
      body: { loan_id: loan.id, admin_note: note ?? undefined },
    })
    qc.invalidateQueries({ queryKey: ['loan_requests'] })
  }

  if (isLoading) return <p className="text-muted p-8 text-[11px] font-bold uppercase">Chargement...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg mb-6">Demandes en attente</h1>
      {requests?.length === 0 && <p className="text-muted text-[11px] font-bold uppercase tracking-[2px]">Aucune demande en attente.</p>}
      <div className="space-y-3">
        {requests?.map(req => (
          <div key={req.id} className="bg-bg border border-border p-4 flex items-start justify-between hover:bg-surface transition-colors">
            <div>
              <p className="font-bold uppercase text-xs tracking-wide text-fg">{req.student?.full_name}</p>
              <p className="text-muted text-xs mt-1">
                {req.items?.map(i => i.category?.name).join(', ')}
                {' '}<span className="text-muted">({req.items?.length} item(s))</span>
              </p>
              <p className="text-muted text-[10px] mt-1 font-mono">
                {new Date(req.created_at).toLocaleDateString('fr-FR')}
                {req.due_date && ` · Retour prévu le ${new Date(req.due_date).toLocaleDateString('fr-FR')}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setApproving(req)}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 border-success text-success hover:bg-success hover:text-white cursor-pointer transition-colors">
                <Check size={14} /> Valider
              </button>
              <button onClick={() => reject(req)}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 border-pink text-pink hover:bg-pink hover:text-white cursor-pointer transition-colors">
                <X size={14} /> Refuser
              </button>
            </div>
          </div>
        ))}
      </div>
      {approving && <ApproveModal loan={approving} onClose={() => setApproving(null)} />}
    </div>
  )
}
