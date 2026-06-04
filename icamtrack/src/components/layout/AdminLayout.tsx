import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, ClipboardList, Activity, History, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { motion } from 'framer-motion'

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard, dot: '#09090B' },
  { to: '/admin/materiel',  label: 'Matériel',  Icon: Package,         dot: '#00C8E0' },
  { to: '/admin/categories',label: 'Catégories',Icon: Tag,             dot: '#71717A' },
  { to: '/admin/demandes',  label: 'Demandes',  Icon: ClipboardList,   dot: '#FF2D78', badge: true },
  { to: '/admin/emprunts-actifs', label: 'Emprunts', Icon: Activity,   dot: '#FF6B00' },
  { to: '/admin/historique',label: 'Historique',Icon: History,         dot: '#71717A' },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', Icon: Users,     dot: '#7C3AED' },
]

export function AdminLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-bg">
      {/* ── TOPBAR ── */}
      <header className="bg-surface border-b border-border sticky top-0 z-50 flex items-stretch h-14">
        {/* Logo */}
        <div className="bg-fg text-yellow font-mono font-bold text-base uppercase tracking-tight border-r-2 border-fg px-6 flex items-center shrink-0 select-none">
          Icam<span className="text-yellow">Track</span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 overflow-x-auto">
          {nav.map(({ to, label, dot, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 text-[11px] font-bold uppercase tracking-widest border-r border-border whitespace-nowrap relative transition-colors cursor-pointer h-full ${
                  isActive ? 'text-fg bg-bg' : 'text-muted hover:text-fg hover:bg-bg/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
                  {label}
                  {badge && (
                    <span className="text-[9px] font-extrabold bg-pink text-white px-1.5 py-0 leading-4">5</span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-fg" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 px-5 border-l border-border shrink-0">
          <div className="w-7 h-7 bg-yellow text-black text-xs font-extrabold flex items-center justify-center uppercase shrink-0">
            {profile?.full_name?.charAt(0) ?? 'A'}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted hidden md:block">
            {profile?.full_name}
          </span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted hover:text-pink border border-border hover:border-pink px-3 py-1.5 transition-colors cursor-pointer"
          >
            <LogOut size={11} /> Sortir
          </button>
        </div>
      </header>

      {/* ── MARQUEE ── */}
      <div className="border-b-2 border-pink border-t-2 border-t-cyan h-9 overflow-hidden flex items-center bg-bg">
        <div className="flex whitespace-nowrap marquee-track">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-8 px-12 text-[10px] font-bold uppercase tracking-widest text-muted">
              <span className="flex items-center gap-1.5 border border-success/50 text-success px-2 py-0.5">● DISPO&nbsp;28</span>
              <span className="flex items-center gap-1.5 border border-yellow-text/50 text-yellow-text px-2 py-0.5">● EMPRUNTÉS&nbsp;12</span>
              <span className="flex items-center gap-1.5 border border-pink/50 text-pink px-2 py-0.5">⚠ RETARD&nbsp;3</span>
              <span className="flex items-center gap-1.5 border border-cyan/50 text-cyan px-2 py-0.5">◌ EN ATTENTE&nbsp;5</span>
              <span className="flex items-center gap-1.5 border border-border text-muted px-2 py-0.5">TOTAL&nbsp;48 MATÉRIELS</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
