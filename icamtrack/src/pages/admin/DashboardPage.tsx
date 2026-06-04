import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useDashboardStats } from '../../hooks/useDashboard'
import { useAllLoanRequests } from '../../hooks/useLoanRequests'
import { KPICard } from '../../components/KPICard'
import { StatusDonut } from '../../components/StatusDonut'
import { LoanTable } from '../../components/LoanTable'

export function AdminDashboard() {
  const { data: stats } = useDashboardStats()
  const { data: activeLoans } = useAllLoanRequests('active')
  const { data: pendingLoans } = useAllLoanRequests('pending')

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Tableau de bord</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total matériels" value={stats?.total ?? 0} color="slate" />
        <KPICard label="Empruntés" value={stats?.borrowed ?? 0} color="amber" />
        <KPICard label="En retard" value={stats?.late ?? 0} color="red" />
        <KPICard label="Demandes en attente" value={stats?.pending ?? 0} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatusDonut
          available={stats?.available ?? 0}
          borrowed={stats?.borrowed ?? 0}
          unavailable={stats?.unavailable ?? 0}
        />
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-slate-700 text-sm">Dernières demandes en attente</p>
            <Link to="/admin/demandes" className="text-xs text-accent flex items-center gap-1 hover:underline">
              Voir toutes <ArrowRight size={12} />
            </Link>
          </div>
          {pendingLoans?.slice(0, 4).map(req => (
            <div key={req.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-700">{req.student?.full_name}</span>
              <span className="text-xs text-slate-400">
                {req.items?.map(i => i.category?.name).join(', ')}
              </span>
            </div>
          ))}
          {pendingLoans?.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Aucune demande en attente.</p>}
        </div>
      </div>

      <LoanTable loans={activeLoans ?? []} />
    </div>
  )
}
