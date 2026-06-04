import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../lib/types'

function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name')
      if (error) throw error
      return data as Profile[]
    },
  })
}

export function UtilisateursPage() {
  const { data: profiles, isLoading } = useProfiles()
  const qc = useQueryClient()

  const toggleRole = useMutation({
    mutationFn: async (profile: Profile) => {
      const newRole = profile.role === 'admin' ? 'student' : 'admin'
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  })

  if (isLoading) return <p className="text-muted p-8 text-[11px] font-bold uppercase">Chargement...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg mb-6">Utilisateurs</h1>
      <div className="bg-bg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Nom</th>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Email</th>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Rôle</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {profiles?.map(p => (
              <tr key={p.id} className="border-b border-border hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-bold uppercase text-xs tracking-wide text-fg">{p.full_name}</td>
                <td className="px-4 py-3 text-muted text-xs font-mono">{p.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] border ${
                    p.role === 'admin' ? 'border-purple text-purple' : 'border-border text-muted'
                  }`}>
                    {p.role === 'admin' ? 'Admin' : 'Étudiant'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleRole.mutate(p)}
                    className="text-[10px] font-bold uppercase tracking-[2px] text-muted hover:text-fg cursor-pointer hover:underline transition-colors"
                  >
                    Passer {p.role === 'admin' ? 'étudiant' : 'admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
