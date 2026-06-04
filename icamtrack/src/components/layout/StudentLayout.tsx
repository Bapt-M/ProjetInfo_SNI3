import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Search, ClipboardList, History, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { motion } from 'framer-motion'

const nav = [
  { to: '/dashboard',    label: 'Accueil',     Icon: LayoutDashboard, dot: '#09090B' },
  { to: '/catalogue',   label: 'Catalogue',   Icon: Search,          dot: '#00C8E0' },
  { to: '/mes-demandes',label: 'Mes demandes',Icon: ClipboardList,   dot: '#FF2D78' },
  { to: '/historique',  label: 'Historique',  Icon: History,         dot: '#71717A' },
]

export function StudentLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border sticky top-0 z-50 flex items-stretch h-14">
        <div className="bg-fg text-yellow font-mono font-bold text-base uppercase tracking-tight border-r-2 border-fg px-6 flex items-center shrink-0 select-none">
          Icam<span className="text-yellow">Track</span>
        </div>
        <nav className="flex flex-1 overflow-x-auto">
          {nav.map(({ to, label, dot }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 text-[11px] font-bold uppercase tracking-widest border-r border-border whitespace-nowrap relative transition-colors cursor-pointer h-full ${
                  isActive ? 'text-fg bg-bg' : 'text-muted hover:text-fg hover:bg-bg/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
                  {label}
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-fg" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 px-5 border-l border-border shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted hidden md:block">{profile?.full_name}</span>
          <button onClick={signOut} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted hover:text-pink border border-border hover:border-pink px-3 py-1.5 transition-colors cursor-pointer">
            <LogOut size={11} /> Sortir
          </button>
        </div>
      </header>

      <div className="border-b-2 border-pink border-t-2 border-t-cyan h-9 overflow-hidden flex items-center bg-bg">
        <div className="flex whitespace-nowrap marquee-track">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-8 px-12 text-[10px] font-bold uppercase tracking-widest text-muted">
              <span className="border border-success/50 text-success px-2 py-0.5">Catalogue disponible</span>
              <span className="border border-pink/50 text-pink px-2 py-0.5">Faites vos demandes →</span>
              <span className="border border-cyan/50 text-cyan px-2 py-0.5">Suivi en temps réel</span>
              <span className="border border-border text-muted px-2 py-0.5">ICAM — Département Info</span>
            </div>
          ))}
        </div>
      </div>

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-5xl mx-auto px-4 py-6"
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
