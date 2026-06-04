import { motion } from 'framer-motion'
import type { LoanRequest } from '../lib/types'

interface Props { loans: LoanRequest[] }

export function LoanTable({ loans }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-bg border border-border overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b-2 border-fg">
        <span className="text-[10px] font-bold uppercase tracking-[3px] text-muted">Emprunts actifs</span>
        <span className="font-mono text-xs font-bold text-fg">{loans.length}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-5 py-2.5 text-[9px] font-bold uppercase tracking-[2px] text-muted">Étudiant</th>
            <th className="text-left px-5 py-2.5 text-[9px] font-bold uppercase tracking-[2px] text-muted">Matériel</th>
            <th className="text-left px-5 py-2.5 text-[9px] font-bold uppercase tracking-[2px] text-muted">Retour prévu</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan, i) => {
            const isLate = loan.due_date ? new Date(loan.due_date) < new Date() : false
            return (
              <motion.tr
                key={loan.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * i }}
                className={`border-b border-border last:border-0 hover:bg-surface transition-colors ${isLate ? 'bg-pink/5' : ''}`}
              >
                <td className="px-5 py-3 font-bold uppercase text-xs tracking-wide text-fg">{loan.student?.full_name}</td>
                <td className="px-5 py-3 font-mono text-xs text-muted">
                  {loan.items?.map(item => item.equipment?.name ?? item.category?.name).join(', ')}
                </td>
                <td className="px-5 py-3">
                  {loan.due_date
                    ? <span className={`text-[10px] font-bold uppercase tracking-wide border px-2 py-0.5 ${isLate ? 'border-pink text-pink bg-pink/5' : 'border-border text-muted'}`}>
                        {new Date(loan.due_date).toLocaleDateString('fr-FR')}{isLate && ' ⚠'}
                      </span>
                    : <span className="font-mono text-xs text-muted">—</span>
                  }
                </td>
              </motion.tr>
            )
          })}
          {loans.length === 0 && (
            <tr><td colSpan={3} className="px-5 py-8 text-center text-[11px] font-bold uppercase tracking-[2px] text-muted">Aucun emprunt actif.</td></tr>
          )}
        </tbody>
      </table>
    </motion.div>
  )
}
