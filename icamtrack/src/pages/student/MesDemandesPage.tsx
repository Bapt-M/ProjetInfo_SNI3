import { useMyLoanRequests } from '../../hooks/useLoanRequests'
import type { LoanStatus } from '../../lib/types'

const statusLabel: Record<LoanStatus, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-slate-100 text-slate-600' },
  active: { label: 'En cours', color: 'bg-amber-100 text-amber-700' },
  closed: { label: 'Clôturé', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700' },
}

export function MesDemandesPage() {
  const { data: requests, isLoading } = useMyLoanRequests()

  if (isLoading) return <p className="text-slate-500">Chargement...</p>

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Mes demandes</h1>
      {requests?.length === 0 && <p className="text-slate-400">Aucune demande.</p>}
      <div className="space-y-3">
        {requests?.map(req => {
          const s = statusLabel[req.status]
          return (
            <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-800 text-sm">
                    {req.items?.map(i => i.category?.name).join(', ')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Demandé le {new Date(req.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  {req.items?.some(i => i.equipment_id) && (
                    <p className="text-xs text-slate-500 mt-1">
                      Items : {req.items?.filter(i => i.equipment?.name).map(i => i.equipment?.name).join(', ')}
                    </p>
                  )}
                  {req.admin_note && (
                    <p className="text-xs text-red-500 mt-1">Note : {req.admin_note}</p>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
