import { useState } from 'react'
import { useAllLoanRequests } from '../../hooks/useLoanRequests'

export function AdminHistorique() {
  const { data: all } = useAllLoanRequests('closed')
  const [search, setSearch] = useState('')

  const filtered = all?.filter(r =>
    !search ||
    r.student?.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.items?.some(i => i.equipment?.name?.toLowerCase().includes(search.toLowerCase()))
  ) ?? []

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg mb-4">Historique</h1>
      <input
        placeholder="Rechercher par étudiant ou équipement..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm bg-surface border-2 border-border px-4 py-2 text-sm text-fg placeholder-muted mb-4 focus:outline-none focus:border-fg transition-colors"
      />
      <div className="bg-bg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Étudiant</th>
              <th className="hidden sm:table-cell text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Matériel</th>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Emprunté le</th>
              <th className="hidden sm:table-cell text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Retourné le</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(loan => (
              <tr key={loan.id} className="border-b border-border hover:bg-surface transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold uppercase text-xs tracking-wide text-fg">{loan.student?.full_name}</div>
                  <div className="text-muted text-[10px] font-mono mt-0.5 sm:hidden">
                    {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
                  </div>
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-muted text-xs font-mono">
                  {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
                </td>
                <td className="px-4 py-3 text-muted text-xs font-mono">
                  {new Date(loan.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-muted text-xs font-mono">
                  {loan.closed_at ? new Date(loan.closed_at).toLocaleDateString('fr-FR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted py-8 text-[11px] font-bold uppercase tracking-[2px]">Aucun résultat.</p>}
      </div>
    </div>
  )
}
