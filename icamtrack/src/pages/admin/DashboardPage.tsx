import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDashboardStats } from '../../hooks/useDashboard'
import { useAllLoanRequests } from '../../hooks/useLoanRequests'
import { KPICard } from '../../components/KPICard'
import { StatusDonut } from '../../components/StatusDonut'
import { LoanTable } from '../../components/LoanTable'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
}

export function AdminDashboard() {
  const { data: stats } = useDashboardStats()
  const { data: activeLoans } = useAllLoanRequests('active')
  const { data: pendingLoans } = useAllLoanRequests('pending')

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between px-8 py-6 border-b-2 border-fg">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-[-1.5px] leading-none">
            Tableau <span className="text-yellow-text">de bord</span>
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-muted mt-2">
            ICAM — Département Informatique
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/demandes"
            className="text-[10px] font-bold uppercase tracking-[2px] border-2 border-fg bg-fg text-yellow px-4 py-2.5 hover:bg-yellow hover:text-black transition-colors cursor-pointer">
            Demandes ({pendingLoans?.length ?? 0}) →
          </Link>
        </div>
      </div>

      {/* KPI grid */}
      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-4 border-b-2 border-fg"
      >
        <KPICard label="Total matériels" value={stats?.total ?? 0}   color="default" />
        <KPICard label="Empruntés"        value={stats?.borrowed ?? 0} color="yellow" />
        <KPICard label="En retard"        value={stats?.late ?? 0}    color="pink" />
        <div className="bg-bg p-7 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-cyan" />
          <div className="text-[11px] font-bold uppercase tracking-[3px] text-muted mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan inline-block" />
            En attente
          </div>
          <div className="text-6xl font-bold font-mono leading-none tabular-nums text-fg">
            {stats?.pending ?? 0}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="grid grid-cols-3 border-b border-border">
        {/* Répartition */}
        <div className="border-r border-border p-6">
          <StatusDonut
            available={stats?.available ?? 0}
            borrowed={stats?.borrowed ?? 0}
            unavailable={stats?.unavailable ?? 0}
          />
        </div>

        {/* Demandes en attente */}
        <div className="col-span-2">
          <div className="flex items-center justify-between px-6 py-3 border-b-2 border-fg">
            <span className="text-[10px] font-bold uppercase tracking-[3px] text-muted">Demandes en attente</span>
            <Link to="/admin/demandes" className="text-[10px] font-bold uppercase tracking-[2px] text-fg hover:underline cursor-pointer">
              Voir toutes →
            </Link>
          </div>
          {pendingLoans?.slice(0, 5).map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center justify-between px-6 py-3.5 border-b border-border last:border-0 hover:bg-surface transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-fg bg-yellow text-black text-xs font-extrabold flex items-center justify-center uppercase">
                  {req.student?.full_name?.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-fg">{req.student?.full_name}</div>
                  <div className="font-mono text-[10px] text-muted mt-0.5">{req.items?.map(item => item.category?.name).join(', ')}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-muted border border-border px-2 py-1">
                {new Date(req.created_at).toLocaleDateString('fr-FR')}
              </span>
            </motion.div>
          ))}
          {!pendingLoans?.length && (
            <p className="px-6 py-8 text-[11px] font-bold uppercase tracking-[2px] text-muted">Aucune demande en attente.</p>
          )}
        </div>
      </div>

      {/* Loan table */}
      <div className="p-6">
        <LoanTable loans={activeLoans ?? []} />
      </div>
    </div>
  )
}
