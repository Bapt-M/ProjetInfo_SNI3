import { CheckCircle } from 'lucide-react'
import { useAllLoanRequests } from '../../hooks/useLoanRequests'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export function EmpruntsActifsPage() {
  const { data: loans, isLoading } = useAllLoanRequests('active')
  const qc = useQueryClient()

  async function closeLoan(loanId: string) {
    if (!window.confirm('Confirmer le retour de cet emprunt ?')) return
    await supabase.functions.invoke('close-loan', { body: { loan_id: loanId } })
    qc.invalidateQueries({ queryKey: ['loan_requests'] })
    qc.invalidateQueries({ queryKey: ['equipment'] })
  }

  if (isLoading) return <p className="text-muted p-8 text-[11px] font-bold uppercase">Chargement...</p>

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg mb-6">Emprunts actifs</h1>
      {loans?.length === 0 && <p className="text-muted text-[11px] font-bold uppercase tracking-[2px]">Aucun emprunt en cours.</p>}
      <div className="bg-bg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Étudiant</th>
              <th className="hidden sm:table-cell text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Matériel</th>
              <th className="hidden sm:table-cell text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Depuis</th>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Retour prévu</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loans?.map(loan => {
              const isLate = loan.due_date ? new Date(loan.due_date) < new Date() : false
              return (
                <tr key={loan.id} className={`border-b border-border transition-colors ${isLate ? 'bg-pink/5' : 'hover:bg-surface'}`}>
                  <td className="px-4 py-3">
                    <div className="font-bold uppercase text-xs tracking-wide text-fg">{loan.student?.full_name}</div>
                    <div className="text-muted text-[10px] font-mono mt-0.5 sm:hidden">
                      {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-muted text-xs font-mono">
                    {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-muted text-xs font-mono">
                    {new Date(loan.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    {loan.due_date
                      ? <span className={`text-[10px] font-bold uppercase border px-2 py-0.5 ${isLate ? 'border-pink text-pink' : 'border-border text-muted'}`}>
                          {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                          {isLate && ' ⚠'}
                        </span>
                      : <span className="text-muted text-xs font-mono">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => closeLoan(loan.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 border-success text-success hover:bg-success hover:text-white cursor-pointer transition-colors whitespace-nowrap">
                      <CheckCircle size={12} /> <span className="hidden sm:inline">Retour enregistré</span><span className="sm:hidden">Retour</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
