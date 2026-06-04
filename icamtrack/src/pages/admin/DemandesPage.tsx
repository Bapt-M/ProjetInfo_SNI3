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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="font-bold text-slate-800 mb-1">Valider la demande</h2>
        <p className="text-sm text-slate-500 mb-4">Étudiant : {loan.student?.full_name}</p>
        <div className="space-y-3">
          {loan.items?.map((item: LoanItem) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-sm text-slate-700 flex-1">{item.category?.name}</span>
              <select
                value={assignments[item.id] ?? ''}
                onChange={e => setAssignments(a => ({ ...a, [item.id]: e.target.value }))}
                className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
        {error && <p role="alert" className="text-red-600 text-sm mt-3">{error}</p>}
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">Annuler</button>
          <button onClick={submit} disabled={loading} className="px-4 py-2 text-sm bg-accent text-white rounded-lg cursor-pointer hover:bg-emerald-700 disabled:opacity-50">
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

  if (isLoading) return <p className="text-slate-500">Chargement...</p>

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Demandes en attente</h1>
      {requests?.length === 0 && <p className="text-slate-400">Aucune demande en attente.</p>}
      <div className="space-y-3">
        {requests?.map(req => (
          <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start justify-between">
            <div>
              <p className="font-medium text-slate-800">{req.student?.full_name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {req.items?.map(i => i.category?.name).join(', ')}
                {' '}<span className="text-xs text-slate-400">({req.items?.length} item(s))</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(req.created_at).toLocaleDateString('fr-FR')}
                {req.due_date && ` · Retour prévu le ${new Date(req.due_date).toLocaleDateString('fr-FR')}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setApproving(req)}
                className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-lg text-sm cursor-pointer hover:bg-emerald-700">
                <Check size={14} /> Valider
              </button>
              <button onClick={() => reject(req)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm cursor-pointer hover:bg-red-200">
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
