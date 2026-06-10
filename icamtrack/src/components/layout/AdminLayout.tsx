import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDashboardStats } from '../../hooks/useDashboard'
import { motion } from 'framer-motion'

const nav = [
  { to: '/admin/dashboard',      label: 'Dashboard',    dot: '#09090B' },
  { to: '/admin/materiel',       label: 'Matériel',     dot: '#00C8E0' },
  { to: '/admin/categories',     label: 'Catégories',   dot: '#71717A' },
  { to: '/admin/demandes',       label: 'Demandes',     dot: '#FF2D78', badge: true },
  { to: '/admin/emprunts-actifs',label: 'Emprunts',     dot: '#FF6B00' },
  { to: '/admin/historique',     label: 'Historique',   dot: '#71717A' },
  { to: '/admin/utilisateurs',   label: 'Utilisateurs', dot: '#7C3AED' },
]

export function AdminLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()
  const { data: stats } = useDashboardStats()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <div className="min-h-screen bg-bg">
      {/* ── TOPBAR ── */}
      <header className="bg-surface border-b border-border sticky top-0 z-50 flex items-stretch h-14">
        {/* Logo */}
        <div className="bg-fg text-yellow font-mono font-bold text-base uppercase tracking-tight border-r-2 border-fg px-6 flex items-center shrink-0 select-none">
          Icam<span className="text-yellow">Track</span>
        </div>

        {/* Mobile: hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
          aria-label="Ouvrir le menu"
          className="sm:hidden flex items-center justify-center px-4 text-muted hover:text-fg transition-colors cursor-pointer"
        >
          <Menu size={18} />
        </button>

        {/* Desktop: nav items */}
        <nav className="hidden sm:flex flex-1 overflow-x-auto">
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
                  {badge && (stats?.pending ?? 0) > 0 && (
                    <span className="text-[9px] font-extrabold bg-pink text-white px-1.5 py-0 leading-4">
                      {stats?.pending}
                    </span>
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
        <div className="flex items-center gap-3 px-5 border-l border-border shrink-0 ml-auto">
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

      {/* ── DRAWER MOBILE ── */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 sm:hidden transition-opacity duration-200 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setDrawerOpen(false)}
      />
      {/* Panel */}
      <div
        id="mobile-drawer"
        inert={!drawerOpen ? '' : undefined}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-200 sm:hidden flex flex-col ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <span className="font-mono font-bold text-base uppercase tracking-tight">
            Icam<span className="text-yellow">Track</span>
          </span>
          <button onClick={() => setDrawerOpen(false)} aria-label="Fermer le menu" className="text-muted hover:text-fg cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-col flex-1 overflow-y-auto py-2">
          {nav.map(({ to, label, dot, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest border-b border-border transition-colors cursor-pointer ${
                  isActive ? 'text-fg bg-bg border-l-2 border-l-fg' : 'text-muted hover:text-fg hover:bg-bg/60'
                }`
              }
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
              {label}
              {badge && (stats?.pending ?? 0) > 0 && (
                <span className="text-[9px] font-extrabold bg-pink text-white px-1.5 py-0 leading-4 ml-auto">
                  {stats?.pending}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border shrink-0">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted hover:text-pink border border-border hover:border-pink px-3 py-2 transition-colors cursor-pointer"
          >
            <LogOut size={11} /> Sortir
          </button>
        </div>
      </div>

      {/* ── MARQUEE ── */}
      <div className="border-b-2 border-pink border-t-2 border-t-cyan h-9 overflow-hidden flex items-center bg-bg">
        <div className="flex whitespace-nowrap marquee-track">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-16 px-32 text-[10px] font-bold uppercase tracking-widest text-muted">
              <span className="flex items-center gap-1.5 border border-success/50 text-success px-2 py-0.5">● DISPO&nbsp;{stats?.available ?? '—'}</span>
              <span className="flex items-center gap-1.5 border border-yellow-text/50 text-yellow-text px-2 py-0.5">● EMPRUNTÉS&nbsp;{stats?.borrowed ?? '—'}</span>
              <span className="flex items-center gap-1.5 border border-pink/50 text-pink px-2 py-0.5">⚠ RETARD&nbsp;{stats?.late ?? '—'}</span>
              <span className="flex items-center gap-1.5 border border-cyan/50 text-cyan px-2 py-0.5">◌ EN ATTENTE&nbsp;{stats?.pending ?? '—'}</span>
              <span className="flex items-center gap-1.5 border border-border text-muted px-2 py-0.5">TOTAL&nbsp;{stats?.total ?? '—'} MATÉRIELS</span>
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
