import type { LoanRequest } from '../lib/types'

interface Props { loans: LoanRequest[] }

export function LoanTable({ loans }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <p className="font-medium text-slate-700 px-4 py-3 border-b border-slate-100 text-sm">Emprunts actifs</p>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-4 py-2 font-medium text-slate-600 text-xs">Étudiant</th>
            <th className="text-left px-4 py-2 font-medium text-slate-600 text-xs">Matériel</th>
            <th className="text-left px-4 py-2 font-medium text-slate-600 text-xs">Retour prévu</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => {
            const isLate = loan.due_date ? new Date(loan.due_date) < new Date() : false
            return (
              <tr key={loan.id} className={`border-b border-slate-100 ${isLate ? 'bg-amber-50' : ''}`}>
                <td className="px-4 py-2 text-slate-700">{loan.student?.full_name}</td>
                <td className="px-4 py-2 text-slate-500 text-xs">
                  {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
                </td>
                <td className="px-4 py-2">
                  {loan.due_date
                    ? <span className={isLate ? 'text-amber-700 font-medium text-xs' : 'text-slate-500 text-xs'}>
                        {new Date(loan.due_date).toLocaleDateString('fr-FR')}{isLate && ' ⚠'}
                      </span>
                    : <span className="text-slate-400 text-xs">—</span>
                  }
                </td>
              </tr>
            )
          })}
          {loans.length === 0 && (
            <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-sm">Aucun emprunt actif.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
