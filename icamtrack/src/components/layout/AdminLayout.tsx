import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, ClipboardList, Activity, History, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const nav = [
  { to: '/admin/dashboard', label: 'Tableau de bord', Icon: LayoutDashboard },
  { to: '/admin/materiel', label: 'Matériel', Icon: Package },
  { to: '/admin/categories', label: 'Catégories', Icon: Tag },
  { to: '/admin/demandes', label: 'Demandes', Icon: ClipboardList },
  { to: '/admin/emprunts-actifs', label: 'Emprunts actifs', Icon: Activity },
  { to: '/admin/historique', label: 'Historique', Icon: History },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', Icon: Users },
]

export function AdminLayout() {
  const { signOut, profile } = useAuth()
  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-56 bg-primary text-white flex flex-col">
        <div className="px-4 py-5 border-b border-slate-600">
          <p className="font-bold text-lg">IcamTrack</p>
          <p className="text-xs text-slate-300">Admin</p>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {nav.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  isActive ? 'bg-white/20 font-medium' : 'hover:bg-white/10'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-600">
          <p className="text-xs text-slate-300 mb-2 truncate">{profile?.full_name}</p>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer"
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
