import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useMyLoanRequests } from '../../hooks/useLoanRequests'
import { useAuth } from '../../hooks/useAuth'
import type { LoanStatus } from '../../lib/types'

const statusLabel: Record<LoanStatus, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-slate-100 text-slate-600' },
  active: { label: 'En cours', color: 'bg-amber-100 text-amber-700' },
  closed: { label: 'Clôturé', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700' },
}

export function StudentDashboard() {
  const { profile } = useAuth()
  const { data: requests } = useMyLoanRequests()

  const active = requests?.filter(r => r.status === 'active') ?? []
  const pending = requests?.filter(r => r.status === 'pending') ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Bonjour, {profile?.full_name}</h1>
        <p className="text-slate-500 text-sm mt-1">Bienvenue sur IcamTrack</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 border-l-4 border-l-amber-500">
          <p className="text-2xl font-bold font-mono text-amber-600">{active.length}</p>
          <p className="text-sm text-slate-500 mt-1">Emprunt(s) en cours</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 border-l-4 border-l-slate-400">
          <p className="text-2xl font-bold font-mono text-slate-600">{pending.length}</p>
          <p className="text-sm text-slate-500 mt-1">Demande(s) en attente</p>
        </div>
      </div>

      {active.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-slate-700 text-sm">Mes emprunts actifs</p>
            <Link to="/mes-demandes" className="text-xs text-accent hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          {active.map(loan => (
            <div key={loan.id} className="py-2 border-b border-slate-100 last:border-0">
              <p className="text-sm text-slate-700">
                {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
              </p>
              {loan.due_date && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Retour prévu le {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="font-medium text-slate-700 text-sm mb-3">Dernières demandes</p>
        {requests?.slice(0, 5).map(req => {
          const s = statusLabel[req.status]
          return (
            <div key={req.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm text-slate-700">
                  {req.items?.map(i => i.category?.name).join(', ')}
                </p>
                <p className="text-xs text-slate-400">{new Date(req.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
            </div>
          )
        })}
        {!requests?.length && <p className="text-slate-400 text-sm text-center py-4">Aucune demande pour l'instant.</p>}
      </div>
    </div>
  )
}
