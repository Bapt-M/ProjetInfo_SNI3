import { useMyLoanRequests } from '../../hooks/useLoanRequests'
import type { LoanStatus } from '../../lib/types'

const statusLabel: Record<LoanStatus, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'border border-border text-muted' },
  active: { label: 'En cours', color: 'border border-yellow-text text-yellow-text' },
  closed: { label: 'Clôturé', color: 'border border-success text-success' },
  rejected: { label: 'Refusé', color: 'border border-pink text-pink' },
}

export function MesDemandesPage() {
  const { data: requests, isLoading } = useMyLoanRequests()

  if (isLoading) return <p className="text-muted text-[11px] font-bold uppercase">Chargement...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg mb-6">Mes demandes</h1>
      {requests?.length === 0 && <p className="text-muted text-[11px] font-bold uppercase tracking-[2px]">Aucune demande.</p>}
      <div className="space-y-3">
        {requests?.map(req => {
          const s = statusLabel[req.status]
          return (
            <div key={req.id} className="bg-bg border border-border p-4 hover:bg-surface transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold uppercase text-xs tracking-wide text-fg">
                    {req.items?.map(i => i.category?.name).join(', ')}
                  </p>
                  <p className="text-muted text-[10px] font-mono mt-1">
                    Demandé le {new Date(req.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  {req.items?.some(i => i.equipment_id) && (
                    <p className="text-muted text-[10px] font-mono mt-1">
                      Items : {req.items?.filter(i => i.equipment?.name).map(i => i.equipment?.name).join(', ')}
                    </p>
                  )}
                  {req.admin_note && (
                    <p className="text-pink text-[10px] font-bold uppercase mt-1">Note : {req.admin_note}</p>
                  )}
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] ${s.color}`}>{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
