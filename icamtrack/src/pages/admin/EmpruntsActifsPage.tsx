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

  if (isLoading) return <p className="text-slate-500">Chargement...</p>

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Emprunts actifs</h1>
      {loans?.length === 0 && <p className="text-slate-400">Aucun emprunt en cours.</p>}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Étudiant</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Matériel</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Depuis</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Retour prévu</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loans?.map(loan => {
              const isLate = loan.due_date ? new Date(loan.due_date) < new Date() : false
              return (
                <tr key={loan.id} className={`border-b border-slate-100 ${isLate ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">{loan.student?.full_name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(loan.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    {loan.due_date
                      ? <span className={isLate ? 'text-amber-700 font-medium' : 'text-slate-500'}>
                          {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                          {isLate && ' ⚠'}
                        </span>
                      : <span className="text-slate-400">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => closeLoan(loan.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs cursor-pointer hover:bg-slate-700">
                      <CheckCircle size={12} /> Retour enregistré
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
