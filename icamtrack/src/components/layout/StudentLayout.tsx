import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Search, ClipboardList, History, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const nav = [
  { to: '/dashboard', label: 'Accueil', Icon: LayoutDashboard },
  { to: '/catalogue', label: 'Catalogue', Icon: Search },
  { to: '/mes-demandes', label: 'Mes demandes', Icon: ClipboardList },
  { to: '/historique', label: 'Historique', Icon: History },
]

export function StudentLayout() {
  const { signOut, profile } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-bold">IcamTrack</span>
          <nav className="flex gap-1">
            {nav.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
                    isActive ? 'bg-white/20 font-medium' : 'hover:bg-white/10'
                  }`
                }
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-300">{profile?.full_name}</span>
          <button onClick={signOut} className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
