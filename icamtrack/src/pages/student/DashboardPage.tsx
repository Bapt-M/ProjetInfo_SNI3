import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMyLoanRequests } from '../../hooks/useLoanRequests'
import { useAuth } from '../../hooks/useAuth'
import type { LoanStatus } from '../../lib/types'

const statusLabel: Record<LoanStatus, { label: string; cls: string }> = {
  pending:  { label: 'En attente', cls: 'border-border text-muted' },
  active:   { label: 'En cours',   cls: 'border-yellow-text text-yellow-text' },
  closed:   { label: 'Clôturé',    cls: 'border-success text-success' },
  rejected: { label: 'Refusé',     cls: 'border-pink text-pink' },
}

export function StudentDashboard() {
  const { profile } = useAuth()
  const { data: requests } = useMyLoanRequests()
  const active  = requests?.filter(r => r.status === 'active')  ?? []
  const pending = requests?.filter(r => r.status === 'pending') ?? []

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold uppercase tracking-[-1px] leading-none">
          Bonjour, <span className="text-yellow-text">{profile?.full_name}</span>
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-[3px] text-muted mt-2">Bienvenue sur IcamTrack</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-0 border border-border">
        <div className="p-6 border-r border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-yellow-text" />
          <div className="text-[10px] font-bold uppercase tracking-[3px] text-muted mb-3">En cours</div>
          <div className="text-5xl font-bold font-mono tabular-nums text-fg">{active.length}</div>
          <div className="text-[10px] font-bold uppercase tracking-[2px] text-yellow-text mt-2">Emprunt(s) actifs</div>
        </div>
        <div className="p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-fg" />
          <div className="text-[10px] font-bold uppercase tracking-[3px] text-muted mb-3">Queue</div>
          <div className="text-5xl font-bold font-mono tabular-nums text-fg">{pending.length}</div>
          <div className="text-[10px] font-bold uppercase tracking-[2px] text-muted mt-2">Demande(s) en attente</div>
        </div>
      </div>

      {active.length > 0 && (
        <div className="border border-border">
          <div className="flex items-center justify-between px-5 py-3 border-b-2 border-fg">
            <span className="text-[10px] font-bold uppercase tracking-[3px] text-muted">Emprunts actifs</span>
            <Link to="/mes-demandes" className="text-[10px] font-bold uppercase tracking-[2px] text-fg hover:underline">Voir tout →</Link>
          </div>
          {active.map((loan, i) => (
            <motion.div key={loan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="px-5 py-3.5 border-b border-border last:border-0 hover:bg-surface transition-colors">
              <p className="text-xs font-bold uppercase tracking-wide text-fg">
                {loan.items?.map(item => item.equipment?.name ?? item.category?.name).join(', ')}
              </p>
              {loan.due_date && (
                <p className="font-mono text-[10px] text-muted mt-1">
                  Retour prévu le {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <div className="border border-border">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-fg">
          <span className="text-[10px] font-bold uppercase tracking-[3px] text-muted">Dernières demandes</span>
        </div>
        {requests?.slice(0, 5).map((req, i) => {
          const s = statusLabel[req.status]
          return (
            <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0 hover:bg-surface transition-colors">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-fg">
                  {req.items?.map(item => item.category?.name).join(', ')}
                </p>
                <p className="font-mono text-[10px] text-muted mt-0.5">{new Date(req.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-[1px] border px-2 py-0.5 ${s.cls}`}>{s.label}</span>
            </motion.div>
          )
        })}
        {!requests?.length && <p className="px-5 py-6 text-[11px] font-bold uppercase tracking-[2px] text-muted">Aucune demande.</p>}
      </div>
    </div>
  )
}
