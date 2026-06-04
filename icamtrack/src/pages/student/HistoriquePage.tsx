import { useMyLoanRequests } from '../../hooks/useLoanRequests'

export function StudentHistorique() {
  const { data: all } = useMyLoanRequests()
  const closed = all?.filter(r => r.status === 'closed') ?? []

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Mon historique</h1>
      {closed.length === 0 && <p className="text-slate-400">Aucun emprunt clôturé.</p>}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Matériel</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Emprunté le</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Retourné le</th>
            </tr>
          </thead>
          <tbody>
            {closed.map(loan => (
              <tr key={loan.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">
                  {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(loan.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {loan.closed_at ? new Date(loan.closed_at).toLocaleDateString('fr-FR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
