import { useMyLoanRequests } from '../../hooks/useLoanRequests'

export function StudentHistorique() {
  const { data: all } = useMyLoanRequests()
  const closed = all?.filter(r => r.status === 'closed') ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg mb-6">Mon historique</h1>
      {closed.length === 0 && <p className="text-muted text-[11px] font-bold uppercase tracking-[2px]">Aucun emprunt clôturé.</p>}
      <div className="bg-bg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Matériel</th>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Emprunté le</th>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Retourné le</th>
            </tr>
          </thead>
          <tbody>
            {closed.map(loan => (
              <tr key={loan.id} className="border-b border-border hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-bold uppercase text-xs tracking-wide text-fg">
                  {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
                </td>
                <td className="px-4 py-3 text-muted text-xs font-mono">
                  {new Date(loan.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-muted text-xs font-mono">
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
