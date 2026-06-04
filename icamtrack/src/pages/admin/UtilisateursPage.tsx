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

  if (isLoading) return <p className="text-slate-500">Chargement...</p>

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Utilisateurs</h1>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Rôle</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {profiles?.map(p => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{p.full_name}</td>
                <td className="px-4 py-3 text-slate-500">{p.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.role === 'admin' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.role === 'admin' ? 'Admin' : 'Étudiant'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleRole.mutate(p)}
                    className="text-xs text-accent hover:underline cursor-pointer"
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
