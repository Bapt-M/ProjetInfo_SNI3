# Responsive Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre IcamTrack utilisable sur mobile via un drawer hamburger pour la navigation et des tables à colonnes prioritaires pour les pages de données.

**Architecture:** Tailwind CSS breakpoints (`sm:` = 640px) pour toutes les adaptations. Drawer géré par `useState` local dans les layouts. Aucune nouvelle dépendance.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide React (icônes Menu/X déjà disponibles)

---

## Task 0 : Ajouter `.superpowers/` au `.gitignore`

**Files:**
- Modify: `.gitignore`

- [ ] **Ajouter la ligne**

```
# Superpowers brainstorming sessions
.superpowers/
```

- [ ] **Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers/ brainstorm artifacts"
```

---

## Task 1 : AdminLayout — drawer hamburger mobile

**Files:**
- Modify: `src/components/layout/AdminLayout.tsx`

- [ ] **Remplacer le contenu complet du fichier**

```tsx
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, ClipboardList, Activity, History, Users, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDashboardStats } from '../../hooks/useDashboard'
import { motion } from 'framer-motion'

const nav = [
  { to: '/admin/dashboard',      label: 'Dashboard',    Icon: LayoutDashboard, dot: '#09090B' },
  { to: '/admin/materiel',       label: 'Matériel',     Icon: Package,         dot: '#00C8E0' },
  { to: '/admin/categories',     label: 'Catégories',   Icon: Tag,             dot: '#71717A' },
  { to: '/admin/demandes',       label: 'Demandes',     Icon: ClipboardList,   dot: '#FF2D78', badge: true },
  { to: '/admin/emprunts-actifs',label: 'Emprunts',     Icon: Activity,        dot: '#FF6B00' },
  { to: '/admin/historique',     label: 'Historique',   Icon: History,         dot: '#71717A' },
  { to: '/admin/utilisateurs',   label: 'Utilisateurs', Icon: Users,           dot: '#7C3AED' },
]

export function AdminLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()
  const { data: stats } = useDashboardStats()
  const [drawerOpen, setDrawerOpen] = useState(false)

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
          className="sm:hidden flex items-center justify-center px-4 text-muted hover:text-fg transition-colors cursor-pointer"
          aria-label="Ouvrir le menu"
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-200 sm:hidden flex flex-col ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <span className="font-mono font-bold text-base uppercase tracking-tight">
            Icam<span className="text-yellow">Track</span>
          </span>
          <button onClick={() => setDrawerOpen(false)} className="text-muted hover:text-fg cursor-pointer">
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
```

- [ ] **Vérifier visuellement**

```bash
npm run dev
```
Ouvre http://localhost:5173, réduis la fenêtre < 640px : le hamburger ☰ doit apparaître. Clique dessus → drawer s'ouvre. Clique sur un lien → drawer se ferme, navigation correcte.

- [ ] **Commit**

```bash
git add src/components/layout/AdminLayout.tsx
git commit -m "feat: drawer hamburger mobile sur AdminLayout"
```

---

## Task 2 : StudentLayout — drawer hamburger mobile

**Files:**
- Modify: `src/components/layout/StudentLayout.tsx`

- [ ] **Remplacer le contenu complet du fichier**

```tsx
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Search, ClipboardList, History, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { motion } from 'framer-motion'

const nav = [
  { to: '/dashboard',     label: 'Accueil',      Icon: LayoutDashboard, dot: '#09090B' },
  { to: '/catalogue',     label: 'Catalogue',    Icon: Search,          dot: '#00C8E0' },
  { to: '/mes-demandes',  label: 'Mes demandes', Icon: ClipboardList,   dot: '#FF2D78' },
  { to: '/historique',    label: 'Historique',   Icon: History,         dot: '#71717A' },
]

export function StudentLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border sticky top-0 z-50 flex items-stretch h-14">
        <div className="bg-fg text-yellow font-mono font-bold text-base uppercase tracking-tight border-r-2 border-fg px-6 flex items-center shrink-0 select-none">
          Icam<span className="text-yellow">Track</span>
        </div>

        {/* Mobile: hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="sm:hidden flex items-center justify-center px-4 text-muted hover:text-fg transition-colors cursor-pointer"
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} />
        </button>

        {/* Desktop: nav items */}
        <nav className="hidden sm:flex flex-1 overflow-x-auto">
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

        <div className="flex items-center gap-3 px-5 border-l border-border shrink-0 ml-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted hidden md:block">{profile?.full_name}</span>
          <button onClick={signOut} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted hover:text-pink border border-border hover:border-pink px-3 py-1.5 transition-colors cursor-pointer">
            <LogOut size={11} /> Sortir
          </button>
        </div>
      </header>

      {/* ── DRAWER MOBILE ── */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 sm:hidden transition-opacity duration-200 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-200 sm:hidden flex flex-col ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <span className="font-mono font-bold text-base uppercase tracking-tight">
            Icam<span className="text-yellow">Track</span>
          </span>
          <button onClick={() => setDrawerOpen(false)} className="text-muted hover:text-fg cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-col flex-1 py-2">
          {nav.map(({ to, label, dot }) => (
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

      <div className="border-b-2 border-pink border-t-2 border-t-cyan h-9 overflow-hidden flex items-center bg-bg">
        <div className="flex whitespace-nowrap marquee-track">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-16 px-32 text-[10px] font-bold uppercase tracking-widest text-muted">
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
```

- [ ] **Vérifier visuellement**

Même test que Task 1 mais avec une route `/dashboard` (vue étudiant). Hamburger visible < 640px, les 4 liens fonctionnent.

- [ ] **Commit**

```bash
git add src/components/layout/StudentLayout.tsx
git commit -m "feat: drawer hamburger mobile sur StudentLayout"
```

---

## Task 3 : DashboardPage admin — grilles adaptatives

**Files:**
- Modify: `src/pages/admin/DashboardPage.tsx`

- [ ] **Modifier le header (ligne 22-37)**

```tsx
{/* Page header */}
<div className="flex flex-col sm:flex-row sm:items-end justify-between px-4 sm:px-8 py-6 border-b-2 border-fg gap-4">
  <div>
    <h1 className="text-4xl font-bold uppercase tracking-[-1.5px] leading-none">
      Tableau <span className="text-yellow-text">de bord</span>
    </h1>
    <p className="text-[11px] font-bold uppercase tracking-[3px] text-muted mt-2">
      ICAM — Département Informatique
    </p>
  </div>
  <div className="flex gap-2">
    <Link to="/admin/demandes"
      className="w-full sm:w-auto text-center text-[10px] font-bold uppercase tracking-[2px] border-2 border-fg bg-fg text-yellow px-4 py-2.5 hover:bg-yellow hover:text-black transition-colors cursor-pointer">
      Demandes ({pendingLoans?.length ?? 0}) →
    </Link>
  </div>
</div>
```

- [ ] **Modifier la KPI grid (ligne 40-57) — `grid-cols-4` → `grid-cols-2 sm:grid-cols-4`**

```tsx
<motion.div
  variants={container} initial="hidden" animate="show"
  className="grid grid-cols-2 sm:grid-cols-4 border-b-2 border-fg"
>
```

- [ ] **Modifier la section contenu (ligne 60-104) — `grid-cols-3` → responsive, donut masqué mobile**

```tsx
{/* Content */}
<div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border">
  {/* Répartition — masqué sur mobile */}
  <div className="hidden sm:block border-r border-border p-6">
    <StatusDonut
      available={stats?.available ?? 0}
      borrowed={stats?.borrowed ?? 0}
      unavailable={stats?.unavailable ?? 0}
    />
  </div>

  {/* Demandes en attente */}
  <div className="col-span-1 sm:col-span-2">
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-fg">
      <span className="text-[10px] font-bold uppercase tracking-[3px] text-muted">Demandes en attente</span>
      <Link to="/admin/demandes" className="text-[10px] font-bold uppercase tracking-[2px] text-fg hover:underline cursor-pointer">
        Voir toutes →
      </Link>
    </div>
    {pendingLoans?.slice(0, 5).map((req, i) => (
      <motion.div
        key={req.id}
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 + i * 0.05 }}
        className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border last:border-0 hover:bg-surface transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 border-2 border-fg bg-yellow text-black text-xs font-extrabold flex items-center justify-center uppercase shrink-0">
            {req.student?.full_name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-wide text-fg truncate">{req.student?.full_name}</div>
            <div className="font-mono text-[10px] text-muted mt-0.5 truncate">{req.items?.map(item => item.category?.name).join(', ')}</div>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[2px] text-muted border border-border px-2 py-1 shrink-0 ml-3">
          {new Date(req.created_at).toLocaleDateString('fr-FR')}
        </span>
      </motion.div>
    ))}
    {!pendingLoans?.length && (
      <p className="px-4 sm:px-6 py-8 text-[11px] font-bold uppercase tracking-[2px] text-muted">Aucune demande en attente.</p>
    )}
  </div>
</div>
```

- [ ] **Modifier le padding du loan table (ligne 107)**

```tsx
{/* Loan table */}
<div className="p-4 sm:p-6">
  <LoanTable loans={activeLoans ?? []} />
</div>
```

- [ ] **Vérifier visuellement**

< 640px : KPIs en 2×2, donut masqué, demandes pleine largeur, header empilé.
> 640px : layout original intact.

- [ ] **Commit**

```bash
git add src/pages/admin/DashboardPage.tsx
git commit -m "feat: dashboard admin responsive — grilles adaptatives, donut masqué mobile"
```

---

## Task 4 : MaterielPage — colonnes prioritaires

**Files:**
- Modify: `src/pages/admin/MaterielPage.tsx`

- [ ] **Modifier `p-6` → `p-4 sm:p-6` (ligne 47)**

```tsx
<div className="p-4 sm:p-6">
```

- [ ] **Modifier le `<thead>` — masquer colonnes secondaires**

```tsx
<thead className="bg-surface border-b border-border">
  <tr>
    <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Nom</th>
    <th className="hidden sm:table-cell text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Catégorie</th>
    <th className="hidden sm:table-cell text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">N° série</th>
    <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Statut</th>
    <th className="px-4 py-3" />
  </tr>
</thead>
```

- [ ] **Modifier le `<tbody>` — métadonnées sous le nom sur mobile**

```tsx
<tbody>
  {equipment?.map(eq => {
    const s = statusLabel[eq.status]
    return (
      <tr key={eq.id} className="border-b border-border hover:bg-surface transition-colors">
        <td className="px-4 py-3">
          <div className="font-bold uppercase text-xs tracking-wide text-fg">{eq.name}</div>
          <div className="text-muted text-[10px] font-mono mt-0.5 sm:hidden">
            {eq.category?.name ?? '—'} · {eq.serial_number ?? '—'}
          </div>
        </td>
        <td className="hidden sm:table-cell px-4 py-3 text-muted text-xs">{eq.category?.name ?? '—'}</td>
        <td className="hidden sm:table-cell px-4 py-3 text-muted font-mono text-xs">{eq.serial_number ?? '—'}</td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] ${s.color}`}>{s.label}</span>
        </td>
        <td className="px-4 py-3 flex gap-2 justify-end">
          <button onClick={() => openEdit(eq)} className="p-1.5 text-muted hover:text-fg cursor-pointer transition-colors"><Pencil size={14} /></button>
          <button onClick={() => del.mutate(eq.id)} className="p-1.5 text-muted hover:text-pink cursor-pointer transition-colors"><Trash2 size={14} /></button>
        </td>
      </tr>
    )
  })}
</tbody>
```

- [ ] **Vérifier visuellement**

< 640px : seulement Nom (avec catégorie+série dessous) et Statut visibles, actions à droite.
> 640px : table complète.

- [ ] **Commit**

```bash
git add src/pages/admin/MaterielPage.tsx
git commit -m "feat: MaterielPage responsive — colonnes prioritaires mobile"
```

---

## Task 5 : EmpruntsActifsPage — colonnes prioritaires

**Files:**
- Modify: `src/pages/admin/EmpruntsActifsPage.tsx`

- [ ] **Modifier `p-6` → `p-4 sm:p-6` et le `<thead>`**

```tsx
<div className="p-4 sm:p-6">
  <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg mb-6">Emprunts actifs</h1>
  {loans?.length === 0 && <p className="text-muted text-[11px] font-bold uppercase tracking-[2px]">Aucun emprunt en cours.</p>}
  <div className="bg-bg border border-border overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-surface border-b border-border">
        <tr>
          <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Étudiant</th>
          <th className="hidden sm:table-cell text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Matériel</th>
          <th className="hidden sm:table-cell text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Depuis</th>
          <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Retour prévu</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
```

- [ ] **Modifier le `<tbody>` — métadonnées sous le nom sur mobile**

```tsx
<tbody>
  {loans?.map(loan => {
    const isLate = loan.due_date ? new Date(loan.due_date) < new Date() : false
    return (
      <tr key={loan.id} className={`border-b border-border transition-colors ${isLate ? 'bg-pink/5' : 'hover:bg-surface'}`}>
        <td className="px-4 py-3">
          <div className="font-bold uppercase text-xs tracking-wide text-fg">{loan.student?.full_name}</div>
          <div className="text-muted text-[10px] font-mono mt-0.5 sm:hidden">
            {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
          </div>
        </td>
        <td className="hidden sm:table-cell px-4 py-3 text-muted text-xs font-mono">
          {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
        </td>
        <td className="hidden sm:table-cell px-4 py-3 text-muted text-xs font-mono">
          {new Date(loan.created_at).toLocaleDateString('fr-FR')}
        </td>
        <td className="px-4 py-3">
          {loan.due_date
            ? <span className={`text-[10px] font-bold uppercase border px-2 py-0.5 ${isLate ? 'border-pink text-pink' : 'border-border text-muted'}`}>
                {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                {isLate && ' ⚠'}
              </span>
            : <span className="text-muted text-xs font-mono">—</span>
          }
        </td>
        <td className="px-4 py-3">
          <button onClick={() => closeLoan(loan.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 border-success text-success hover:bg-success hover:text-white cursor-pointer transition-colors whitespace-nowrap">
            <CheckCircle size={12} /> <span className="hidden sm:inline">Retour enregistré</span><span className="sm:hidden">Retour</span>
          </button>
        </td>
      </tr>
    )
  })}
</tbody>
```

- [ ] **Commit**

```bash
git add src/pages/admin/EmpruntsActifsPage.tsx
git commit -m "feat: EmpruntsActifsPage responsive — colonnes prioritaires mobile"
```

---

## Task 6 : HistoriquePage — colonnes prioritaires

**Files:**
- Modify: `src/pages/admin/HistoriquePage.tsx`

- [ ] **Modifier `p-6` → `p-4 sm:p-6`, `<thead>` et `<tbody>`**

```tsx
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
```

- [ ] **Commit**

```bash
git add src/pages/admin/HistoriquePage.tsx
git commit -m "feat: HistoriquePage responsive — colonnes prioritaires mobile"
```

---

## Task 7 : LoanTable — colonnes prioritaires

**Files:**
- Modify: `src/components/LoanTable.tsx`

- [ ] **Modifier le `<thead>` et `<tbody>` — masquer la colonne Matériel, la mettre en sous-ligne**

```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-border">
      <th className="text-left px-5 py-2.5 text-[9px] font-bold uppercase tracking-[2px] text-muted">Étudiant</th>
      <th className="hidden sm:table-cell text-left px-5 py-2.5 text-[9px] font-bold uppercase tracking-[2px] text-muted">Matériel</th>
      <th className="text-left px-5 py-2.5 text-[9px] font-bold uppercase tracking-[2px] text-muted">Retour prévu</th>
    </tr>
  </thead>
  <tbody>
    {loans.map((loan, i) => {
      const isLate = loan.due_date ? new Date(loan.due_date) < new Date() : false
      return (
        <motion.tr
          key={loan.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 * i }}
          className={`border-b border-border last:border-0 hover:bg-surface transition-colors ${isLate ? 'bg-pink/5' : ''}`}
        >
          <td className="px-5 py-3">
            <div className="font-bold uppercase text-xs tracking-wide text-fg">{loan.student?.full_name}</div>
            <div className="text-muted text-[10px] font-mono mt-0.5 sm:hidden">
              {loan.items?.map(item => item.equipment?.name ?? item.category?.name).join(', ')}
            </div>
          </td>
          <td className="hidden sm:table-cell px-5 py-3 font-mono text-xs text-muted">
            {loan.items?.map(item => item.equipment?.name ?? item.category?.name).join(', ')}
          </td>
          <td className="px-5 py-3">
            {loan.due_date
              ? <span className={`text-[10px] font-bold uppercase tracking-wide border px-2 py-0.5 ${isLate ? 'border-pink text-pink bg-pink/5' : 'border-border text-muted'}`}>
                  {new Date(loan.due_date).toLocaleDateString('fr-FR')}{isLate && ' ⚠'}
                </span>
              : <span className="font-mono text-xs text-muted">—</span>
            }
          </td>
        </motion.tr>
      )
    })}
    {loans.length === 0 && (
      <tr><td colSpan={3} className="px-5 py-8 text-center text-[11px] font-bold uppercase tracking-[2px] text-muted">Aucun emprunt actif.</td></tr>
    )}
  </tbody>
</table>
```

- [ ] **Commit**

```bash
git add src/components/LoanTable.tsx
git commit -m "feat: LoanTable responsive — colonne matériel masquée mobile"
```

---

## Task 8 : EquipmentForm — responsive form

**Files:**
- Modify: `src/components/EquipmentForm.tsx`

- [ ] **Modifier `grid grid-cols-2` → `grid grid-cols-1 sm:grid-cols-2` (ligne 38)**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

Le reste du composant est inchangé.

- [ ] **Commit**

```bash
git add src/components/EquipmentForm.tsx
git commit -m "feat: EquipmentForm responsive — grid 1 col mobile, 2 cols desktop"
```

---

## Task 9 : DemandesPage — padding + actions mobile

**Files:**
- Modify: `src/pages/admin/DemandesPage.tsx`

- [ ] **Modifier `p-6` → `p-4 sm:p-6` et les cartes de demandes**

```tsx
<div className="p-4 sm:p-6">
  <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg mb-6">Demandes en attente</h1>
  {requests?.length === 0 && <p className="text-muted text-[11px] font-bold uppercase tracking-[2px]">Aucune demande en attente.</p>}
  <div className="space-y-3">
    {requests?.map(req => (
      <div key={req.id} className="bg-bg border border-border p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 hover:bg-surface transition-colors">
        <div className="min-w-0">
          <p className="font-bold uppercase text-xs tracking-wide text-fg">{req.student?.full_name}</p>
          <p className="text-muted text-xs mt-1">
            {req.items?.map(i => i.category?.name).join(', ')}
            {' '}<span className="text-muted">({req.items?.length} item(s))</span>
          </p>
          <p className="text-muted text-[10px] mt-1 font-mono">
            {new Date(req.created_at).toLocaleDateString('fr-FR')}
            {req.due_date && ` · Retour prévu le ${new Date(req.due_date).toLocaleDateString('fr-FR')}`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setApproving(req)}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 border-success text-success hover:bg-success hover:text-white cursor-pointer transition-colors">
            <Check size={14} /> Valider
          </button>
          <button onClick={() => reject(req)}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 border-pink text-pink hover:bg-pink hover:text-white cursor-pointer transition-colors">
            <X size={14} /> Refuser
          </button>
        </div>
      </div>
    ))}
  </div>
  {approving && <ApproveModal loan={approving} onClose={() => setApproving(null)} />}
</div>
```

- [ ] **Commit**

```bash
git add src/pages/admin/DemandesPage.tsx
git commit -m "feat: DemandesPage responsive — cartes flex-col mobile, padding adaptatif"
```
