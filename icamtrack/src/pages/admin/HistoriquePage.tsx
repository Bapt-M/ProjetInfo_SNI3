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
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">Historique</h1>
      <input
        placeholder="Rechercher par étudiant ou équipement..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Étudiant</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Matériel</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Emprunté le</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Retourné le</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(loan => (
              <tr key={loan.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{loan.student?.full_name}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">
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
        {filtered.length === 0 && <p className="text-center text-slate-400 py-8">Aucun résultat.</p>}
      </div>
    </div>
  )
}
