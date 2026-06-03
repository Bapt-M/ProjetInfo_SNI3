# IcamTrack — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une application web React + Supabase de gestion de matériel et d'emprunts pour le département informatique de l'ICAM.

**Architecture:** SPA React (Vite + TypeScript) avec deux interfaces (étudiant / admin), Supabase pour l'auth, la BDD PostgreSQL et les Edge Functions Deno pour la logique métier critique (création/validation/clôture d'emprunts).

**Tech Stack:** React 18, Vite, TypeScript, React Router v6, TanStack Query v5, React Hook Form, Zod, Tailwind CSS, shadcn/ui, Recharts, Supabase JS SDK v2, Supabase Edge Functions (Deno), Vitest + Testing Library.

---

## Structure des fichiers

```
icamtrack/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.local                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── src/
│   ├── main.tsx
│   ├── App.tsx                         # Routes
│   ├── lib/
│   │   ├── supabase.ts                 # Client Supabase
│   │   └── types.ts                    # Types TypeScript partagés
│   ├── hooks/
│   │   ├── useAuth.ts                  # Auth state + login/logout
│   │   ├── useCategories.ts            # CRUD catégories
│   │   ├── useEquipment.ts             # CRUD équipements
│   │   ├── useLoanRequests.ts          # Queries demandes d'emprunt
│   │   └── useDashboard.ts             # Stats tableau de bord
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx         # Sidebar admin
│   │   │   └── StudentLayout.tsx       # Navbar étudiant
│   │   ├── KPICard.tsx
│   │   ├── StatusDonut.tsx             # Donut Recharts
│   │   ├── LoanTable.tsx
│   │   ├── PendingQueue.tsx
│   │   ├── EquipmentForm.tsx
│   │   └── LoanRequestForm.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── student/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CataloguePage.tsx
│   │   │   ├── MesDemandesPage.tsx
│   │   │   └── HistoriquePage.tsx
│   │   └── admin/
│   │       ├── DashboardPage.tsx
│   │       ├── MaterielPage.tsx
│   │       ├── CategoriesPage.tsx
│   │       ├── DemandesPage.tsx
│   │       ├── EmpruntsActifsPage.tsx
│   │       ├── HistoriquePage.tsx
│   │       └── UtilisateursPage.tsx
│   ├── router/
│   │   └── ProtectedRoute.tsx
│   └── test/
│       └── setup.ts
└── supabase/
    ├── config.toml
    ├── migrations/
    │   └── 20260603000000_initial_schema.sql
    └── functions/
        ├── create-loan-request/index.ts
        ├── approve-loan-request/index.ts
        ├── reject-loan-request/index.ts
        └── close-loan/index.ts
```

---

## Task 1 : Scaffold projet React + Tailwind + Supabase

**Files:**
- Create: `icamtrack/` (répertoire racine du projet)
- Create: `src/lib/supabase.ts`
- Create: `src/lib/types.ts`
- Create: `src/test/setup.ts`
- Create: `vite.config.ts`

- [ ] **Créer le projet Vite**

```bash
npm create vite@latest icamtrack -- --template react-ts
cd icamtrack
npm install
```

- [ ] **Installer les dépendances**

```bash
npm install @supabase/supabase-js @tanstack/react-query react-router-dom react-hook-form zod recharts lucide-react
npm install -D tailwindcss postcss autoprefixer vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
npx tailwindcss init -p
```

- [ ] **Configurer Tailwind** — remplacer `tailwind.config.ts` :

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Fira Sans', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        primary: '#334155',
        accent: '#059669',
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Configurer Vite + Vitest** — remplacer `vite.config.ts` :

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Créer `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Ajouter les fonts Google** dans `index.html` `<head>` :

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

- [ ] **Créer `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Créer `src/lib/types.ts`**

```ts
export type UserRole = 'student' | 'admin'
export type EquipmentStatus = 'available' | 'borrowed' | 'unavailable'
export type LoanStatus = 'pending' | 'active' | 'closed' | 'rejected'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  email: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
}

export interface Equipment {
  id: string
  name: string
  category_id: string
  serial_number: string | null
  status: EquipmentStatus
  notes: string | null
  created_at: string
  category?: Category
}

export interface LoanItem {
  id: string
  loan_id: string
  category_id: string
  equipment_id: string | null
  returned_at: string | null
  category?: Category
  equipment?: Equipment
}

export interface LoanRequest {
  id: string
  student_id: string
  status: LoanStatus
  due_date: string | null
  admin_note: string | null
  created_at: string
  closed_at: string | null
  student?: Profile
  items?: LoanItem[]
}
```

- [ ] **Créer `.env.local`** (valeurs à remplir depuis Supabase dashboard) :

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

- [ ] **Vérifier que Vite démarre**

```bash
npm run dev
```
Attendu : page Vite par défaut sur `http://localhost:5173`

- [ ] **Commit**

```bash
git init
git add .
git commit -m "feat: scaffold React + Vite + Tailwind + Supabase client"
```

---

## Task 2 : Schéma BDD Supabase + RLS

**Files:**
- Create: `supabase/migrations/20260603000000_initial_schema.sql`

- [ ] **Installer Supabase CLI** (si pas déjà fait)

```bash
npm install -g supabase
supabase login
supabase init
```

- [ ] **Créer la migration** `supabase/migrations/20260603000000_initial_schema.sql` :

```sql
-- Extensions
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('student', 'admin');
create type equipment_status as enum ('available', 'borrowed', 'unavailable');
create type loan_status as enum ('pending', 'active', 'closed', 'rejected');

-- Profiles
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null default '',
  role user_role not null default 'student',
  email text not null default '',
  created_at timestamptz not null default now()
);

-- Categories
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text
);

-- Equipment
create table equipment (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category_id uuid not null references categories(id),
  serial_number text,
  status equipment_status not null default 'available',
  notes text,
  created_at timestamptz not null default now()
);

-- Loan requests
create table loan_requests (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id),
  status loan_status not null default 'pending',
  due_date date,
  admin_note text,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

-- Loan items (1 row = 1 physical item slot)
create table loan_items (
  id uuid primary key default uuid_generate_v4(),
  loan_id uuid not null references loan_requests(id) on delete cascade,
  category_id uuid not null references categories(id),
  equipment_id uuid references equipment(id),
  returned_at timestamptz
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper function pour vérifier le rôle admin (évite la récursion RLS)
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- RLS
alter table profiles enable row level security;
alter table categories enable row level security;
alter table equipment enable row level security;
alter table loan_requests enable row level security;
alter table loan_items enable row level security;

-- Profiles
create policy "read_own_profile" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "admin_update_profiles" on profiles
  for update using (is_admin());

-- Categories (lecture pour tous, écriture admin)
create policy "read_categories" on categories
  for select using (auth.role() = 'authenticated');
create policy "admin_manage_categories" on categories
  for all using (is_admin());

-- Equipment (lecture pour tous, écriture admin)
create policy "read_equipment" on equipment
  for select using (auth.role() = 'authenticated');
create policy "admin_manage_equipment" on equipment
  for all using (is_admin());

-- Loan requests
create policy "read_own_requests" on loan_requests
  for select using (student_id = auth.uid() or is_admin());

-- Loan items
create policy "read_own_loan_items" on loan_items
  for select using (
    exists (
      select 1 from loan_requests
      where id = loan_id and (student_id = auth.uid() or is_admin())
    )
  );
```

- [ ] **Appliquer la migration sur Supabase cloud**

```bash
supabase db push
```
Attendu : `Finished supabase db push.`

- [ ] **Vérifier dans Supabase Dashboard** → Table Editor : les 5 tables existent (`profiles`, `categories`, `equipment`, `loan_requests`, `loan_items`)

- [ ] **Commit**

```bash
git add supabase/
git commit -m "feat: add initial DB schema with RLS"
```

---

## Task 3 : Authentification — login, useAuth, ProtectedRoute

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/router/ProtectedRoute.tsx`
- Create: `src/pages/LoginPage.tsx`

- [ ] **Créer `src/hooks/useAuth.ts`**

```ts
import { useState, useEffect, createContext, useContext } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
}

interface AuthContext extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const Context = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, profile: null, session: null, loading: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user, session)
      else setState(s => ({ ...s, loading: false }))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) loadProfile(session.user, session)
      else setState({ user: null, profile: null, session: null, loading: false })
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(user: User, session: Session) {
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    setState({ user, profile, session, loading: false })
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return <Context.Provider value={{ ...state, signIn, signOut }}>{children}</Context.Provider>
}

export function useAuth() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
```

- [ ] **Créer `src/router/ProtectedRoute.tsx`**

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../lib/types'

interface Props {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Chargement...
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to={profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
  }
  return <>{children}</>
}
```

- [ ] **Créer `src/pages/LoginPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Email ou mot de passe incorrect.')
      return
    }
    // profile is loaded async; redirect after auth state updates
  }

  // Redirect once profile is loaded after login
  if (profile) {
    navigate(profile.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">IcamTrack</h1>
        <p className="text-slate-500 text-sm mb-6">Connexion à votre espace</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Écrire le test** `src/pages/LoginPage.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { AuthProvider } from '../hooks/useAuth'

test('renders login form', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  )
  expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
})
```

- [ ] **Lancer le test**

```bash
npx vitest run src/pages/LoginPage.test.tsx
```
Attendu : PASS

- [ ] **Commit**

```bash
git add src/hooks/useAuth.ts src/router/ProtectedRoute.tsx src/pages/LoginPage.tsx src/pages/LoginPage.test.tsx
git commit -m "feat: add auth — useAuth, ProtectedRoute, LoginPage"
```

---

## Task 4 : App.tsx + layouts

**Files:**
- Create: `src/App.tsx`
- Modify: `src/main.tsx`
- Create: `src/components/layout/AdminLayout.tsx`
- Create: `src/components/layout/StudentLayout.tsx`

- [ ] **Créer `src/components/layout/AdminLayout.tsx`**

```tsx
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
```

- [ ] **Créer `src/components/layout/StudentLayout.tsx`**

```tsx
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
```

- [ ] **Créer `src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './router/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { StudentLayout } from './components/layout/StudentLayout'
import { LoginPage } from './pages/LoginPage'

// Lazy-loaded pages (placeholders until tasks below are done)
import { lazy, Suspense } from 'react'
const StudentDashboard = lazy(() => import('./pages/student/DashboardPage').then(m => ({ default: m.StudentDashboard })))
const CataloguePage = lazy(() => import('./pages/student/CataloguePage').then(m => ({ default: m.CataloguePage })))
const MesDemandesPage = lazy(() => import('./pages/student/MesDemandesPage').then(m => ({ default: m.MesDemandesPage })))
const StudentHistorique = lazy(() => import('./pages/student/HistoriquePage').then(m => ({ default: m.StudentHistorique })))
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage').then(m => ({ default: m.AdminDashboard })))
const MaterielPage = lazy(() => import('./pages/admin/MaterielPage').then(m => ({ default: m.MaterielPage })))
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage').then(m => ({ default: m.CategoriesPage })))
const DemandesPage = lazy(() => import('./pages/admin/DemandesPage').then(m => ({ default: m.DemandesPage })))
const EmpruntsActifsPage = lazy(() => import('./pages/admin/EmpruntsActifsPage').then(m => ({ default: m.EmpruntsActifsPage })))
const AdminHistorique = lazy(() => import('./pages/admin/HistoriquePage').then(m => ({ default: m.AdminHistorique })))
const UtilisateursPage = lazy(() => import('./pages/admin/UtilisateursPage').then(m => ({ default: m.UtilisateursPage })))

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Chargement...</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* Student */}
              <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/catalogue" element={<CataloguePage />} />
                <Route path="/mes-demandes" element={<MesDemandesPage />} />
                <Route path="/historique" element={<StudentHistorique />} />
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/materiel" element={<MaterielPage />} />
                <Route path="/admin/categories" element={<CategoriesPage />} />
                <Route path="/admin/demandes" element={<DemandesPage />} />
                <Route path="/admin/emprunts-actifs" element={<EmpruntsActifsPage />} />
                <Route path="/admin/historique" element={<AdminHistorique />} />
                <Route path="/admin/utilisateurs" element={<UtilisateursPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

- [ ] **Modifier `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Ajouter Tailwind directives dans `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Commit**

```bash
git add src/
git commit -m "feat: add app routing, admin and student layouts"
```

---

## Task 5 : Sprint 1 — Catégories CRUD (admin)

**Files:**
- Create: `src/hooks/useCategories.ts`
- Create: `src/pages/admin/CategoriesPage.tsx`

- [ ] **Créer `src/hooks/useCategories.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Category } from '../lib/types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name')
      if (error) throw error
      return data as Category[]
    },
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: { name: string; description: string }) => {
      const { error } = await supabase.from('categories').insert(values)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; name: string; description: string }) => {
      const { error } = await supabase.from('categories').update(values).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
```

- [ ] **Créer `src/pages/admin/CategoriesPage.tsx`**

```tsx
import { useState } from 'react'
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories'
import type { Category } from '../../lib/types'

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const del = useDeleteCategory()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function openCreate() { setEditing(null); setName(''); setDescription(''); setShowForm(true) }
  function openEdit(cat: Category) { setEditing(cat); setName(cat.name); setDescription(cat.description ?? ''); setShowForm(true) }
  function cancel() { setShowForm(false); setEditing(null) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) await update.mutateAsync({ id: editing.id, name, description })
    else await create.mutateAsync({ name, description })
    cancel()
  }

  if (isLoading) return <p className="text-slate-500">Chargement...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Catégories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-accent text-white px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-emerald-700">
          <Plus size={14} /> Nouvelle catégorie
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button type="submit" className="p-2 bg-accent text-white rounded-lg cursor-pointer hover:bg-emerald-700"><Check size={16} /></button>
          <button type="button" onClick={cancel} className="p-2 bg-slate-200 rounded-lg cursor-pointer hover:bg-slate-300"><X size={16} /></button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories?.map(cat => (
              <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{cat.name}</td>
                <td className="px-4 py-3 text-slate-500">{cat.description ?? '—'}</td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"><Pencil size={14} /></button>
                  <button onClick={() => del.mutate(cat.id)} className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories?.length === 0 && (
          <p className="text-center text-slate-400 py-8">Aucune catégorie. Créez-en une.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/hooks/useCategories.ts src/pages/admin/CategoriesPage.tsx
git commit -m "feat: categories CRUD (admin)"
```

---

## Task 6 : Sprint 1 — Équipements CRUD (admin)

**Files:**
- Create: `src/hooks/useEquipment.ts`
- Create: `src/components/EquipmentForm.tsx`
- Create: `src/pages/admin/MaterielPage.tsx`

- [ ] **Créer `src/hooks/useEquipment.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Equipment, EquipmentStatus } from '../lib/types'

export function useEquipment(filters?: { categoryId?: string; status?: EquipmentStatus }) {
  return useQuery({
    queryKey: ['equipment', filters],
    queryFn: async () => {
      let q = supabase.from('equipment').select('*, category:categories(id,name)').order('name')
      if (filters?.categoryId) q = q.eq('category_id', filters.categoryId)
      if (filters?.status) q = q.eq('status', filters.status)
      const { data, error } = await q
      if (error) throw error
      return data as Equipment[]
    },
  })
}

export function useCreateEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: Omit<Equipment, 'id' | 'created_at' | 'category'>) => {
      const { error } = await supabase.from('equipment').insert(values)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment'] }),
  })
}

export function useUpdateEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Equipment> & { id: string }) => {
      const { error } = await supabase.from('equipment').update(values).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment'] }),
  })
}

export function useDeleteEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('equipment').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment'] }),
  })
}
```

- [ ] **Créer `src/components/EquipmentForm.tsx`**

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCategories } from '../hooks/useCategories'
import type { Equipment } from '../lib/types'

const schema = z.object({
  name: z.string().min(1, 'Nom requis'),
  category_id: z.string().uuid('Catégorie requise'),
  serial_number: z.string().optional(),
  status: z.enum(['available', 'borrowed', 'unavailable']),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<Equipment>
  onSubmit: (values: FormValues) => Promise<void>
  onCancel: () => void
}

export function EquipmentForm({ defaultValues, onSubmit, onCancel }: Props) {
  const { data: categories } = useCategories()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      category_id: defaultValues?.category_id ?? '',
      serial_number: defaultValues?.serial_number ?? '',
      status: defaultValues?.status ?? 'available',
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
          <input {...register('name')}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie *</label>
          <select {...register('category_id')}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Sélectionner...</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">N° de série</label>
          <input {...register('serial_number')}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
          <select {...register('status')}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="available">Disponible</option>
            <option value="borrowed">Emprunté</option>
            <option value="unavailable">Indisponible</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea {...register('notes')} rows={2}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
          Annuler
        </button>
        <button type="submit" disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Installer zod resolver**

```bash
npm install @hookform/resolvers
```

- [ ] **Créer `src/pages/admin/MaterielPage.tsx`**

```tsx
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useEquipment, useCreateEquipment, useUpdateEquipment, useDeleteEquipment } from '../../hooks/useEquipment'
import { useCategories } from '../../hooks/useCategories'
import { EquipmentForm } from '../../components/EquipmentForm'
import type { Equipment, EquipmentStatus } from '../../lib/types'

const statusLabel: Record<EquipmentStatus, { label: string; color: string }> = {
  available: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-800' },
  borrowed: { label: 'Emprunté', color: 'bg-amber-100 text-amber-800' },
  unavailable: { label: 'Indisponible', color: 'bg-red-100 text-red-800' },
}

export function MaterielPage() {
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | ''>('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Equipment | null>(null)

  const { data: equipment, isLoading } = useEquipment({
    categoryId: filterCat || undefined,
    status: filterStatus || undefined,
  })
  const { data: categories } = useCategories()
  const create = useCreateEquipment()
  const update = useUpdateEquipment()
  const del = useDeleteEquipment()

  function openCreate() { setEditing(null); setShowForm(true) }
  function openEdit(eq: Equipment) { setEditing(eq); setShowForm(true) }

  async function handleSubmit(values: Parameters<typeof create.mutateAsync>[0]) {
    if (editing) await update.mutateAsync({ id: editing.id, ...values })
    else await create.mutateAsync(values)
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">Matériel</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-accent text-white px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-emerald-700">
          <Plus size={14} /> Nouveau matériel
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Toutes les catégories</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as EquipmentStatus | '')}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Tous les statuts</option>
          <option value="available">Disponible</option>
          <option value="borrowed">Emprunté</option>
          <option value="unavailable">Indisponible</option>
        </select>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <h2 className="font-medium text-slate-700 mb-3">{editing ? 'Modifier' : 'Nouveau matériel'}</h2>
          <EquipmentForm
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </div>
      )}

      {isLoading ? <p className="text-slate-500">Chargement...</p> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">N° série</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {equipment?.map(eq => {
                const s = statusLabel[eq.status]
                return (
                  <tr key={eq.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{eq.name}</td>
                    <td className="px-4 py-3 text-slate-500">{eq.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{eq.serial_number ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => openEdit(eq)} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"><Pencil size={14} /></button>
                      <button onClick={() => del.mutate(eq.id)} className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {equipment?.length === 0 && <p className="text-center text-slate-400 py-8">Aucun matériel.</p>}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/hooks/useEquipment.ts src/components/EquipmentForm.tsx src/pages/admin/MaterielPage.tsx
git commit -m "feat: equipment CRUD (admin) — JALON 1"
```

---

## Task 7 : Edge Function — create-loan-request

**Files:**
- Create: `supabase/functions/create-loan-request/index.ts`

- [ ] **Créer `supabase/functions/create-loan-request/index.ts`**

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  items: Array<{ category_id: string; quantity: number }>
  due_date?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) return new Response('Unauthorized', { status: 401 })

    const { items, due_date }: RequestBody = await req.json()

    if (!items?.length) {
      return new Response(
        JSON.stringify({ error: 'Au moins un article requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier stock disponible pour chaque catégorie
    for (const item of items) {
      const { count } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', item.category_id)
        .eq('status', 'available')

      if ((count ?? 0) < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Stock insuffisant pour une des catégories demandées` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Créer la demande
    const { data: loan, error: loanErr } = await supabase
      .from('loan_requests')
      .insert({ student_id: user.id, due_date: due_date ?? null })
      .select()
      .single()

    if (loanErr) throw loanErr

    // Créer les lignes (1 ligne = 1 item physique)
    const loanItems = items.flatMap(item =>
      Array.from({ length: item.quantity }, () => ({
        loan_id: loan.id,
        category_id: item.category_id,
      }))
    )

    const { error: itemsErr } = await supabase.from('loan_items').insert(loanItems)
    if (itemsErr) throw itemsErr

    return new Response(
      JSON.stringify({ id: loan.id }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

- [ ] **Déployer la fonction**

```bash
supabase functions deploy create-loan-request --no-verify-jwt
```
Attendu : `Deployed create-loan-request`

- [ ] **Tester via curl** (remplacer `TOKEN` par un JWT étudiant depuis Supabase Dashboard > Auth)

```bash
curl -X POST https://xxxx.supabase.co/functions/v1/create-loan-request \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"category_id":"UUID_CATEGORIE","quantity":1}]}'
```
Attendu : `{"id":"..."}` avec statut 201

- [ ] **Commit**

```bash
git add supabase/functions/create-loan-request/
git commit -m "feat: edge function create-loan-request"
```

---

## Task 8 : Catalogue étudiant + formulaire de demande

**Files:**
- Create: `src/hooks/useLoanRequests.ts`
- Create: `src/components/LoanRequestForm.tsx`
- Create: `src/pages/student/CataloguePage.tsx`

- [ ] **Créer `src/hooks/useLoanRequests.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { LoanRequest } from '../lib/types'
import { useAuth } from './useAuth'

export function useMyLoanRequests() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['loan_requests', 'mine', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_requests')
        .select('*, items:loan_items(*, category:categories(id,name), equipment:equipment(id,name,serial_number))')
        .eq('student_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as LoanRequest[]
    },
  })
}

export function useAllLoanRequests(statusFilter?: string) {
  return useQuery({
    queryKey: ['loan_requests', 'all', statusFilter],
    queryFn: async () => {
      let q = supabase
        .from('loan_requests')
        .select('*, student:profiles(id,full_name,email), items:loan_items(*, category:categories(id,name), equipment:equipment(id,name,serial_number))')
        .order('created_at', { ascending: false })
      if (statusFilter) q = q.eq('status', statusFilter)
      const { data, error } = await q
      if (error) throw error
      return data as LoanRequest[]
    },
  })
}
```

- [ ] **Créer `src/components/LoanRequestForm.tsx`**

```tsx
import { useState } from 'react'
import { Plus, Minus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { useCategories } from '../hooks/useCategories'
import type { Category } from '../lib/types'

interface CartItem { category: Category; quantity: number }

interface Props { onClose: () => void }

export function LoanRequestForm({ onClose }: Props) {
  const { data: categories } = useCategories()
  const qc = useQueryClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addCategory(cat: Category) {
    setCart(c => {
      const existing = c.find(i => i.category.id === cat.id)
      if (existing) return c.map(i => i.category.id === cat.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...c, { category: cat, quantity: 1 }]
    })
  }

  function removeCategory(id: string) {
    setCart(c => c.filter(i => i.category.id !== id))
  }

  function changeQty(id: string, delta: number) {
    setCart(c => c.map(i => {
      if (i.category.id !== id) return i
      const qty = i.quantity + delta
      return qty <= 0 ? i : { ...i, quantity: qty }
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!cart.length) { setError('Sélectionnez au moins un article.'); return }
    setLoading(true)
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await supabase.functions.invoke('create-loan-request', {
      body: {
        items: cart.map(i => ({ category_id: i.category.id, quantity: i.quantity })),
        due_date: dueDate || undefined,
      },
    })
    setLoading(false)
    if (res.error) { setError(res.error.message); return }
    qc.invalidateQueries({ queryKey: ['loan_requests'] })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">Nouvelle demande d'emprunt</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Ajouter des articles</p>
            <div className="flex flex-wrap gap-2">
              {categories?.map(cat => (
                <button key={cat.id} type="button" onClick={() => addCategory(cat)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm cursor-pointer">
                  + {cat.name}
                </button>
              ))}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {cart.map(item => (
                <div key={item.category.id} className="flex items-center justify-between px-4 py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-medium text-slate-700">{item.category.name}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => changeQty(item.category.id, -1)}
                      className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"><Minus size={12} /></button>
                    <span className="w-6 text-center text-sm font-mono">{item.quantity}</span>
                    <button type="button" onClick={() => changeQty(item.category.id, 1)}
                      className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"><Plus size={12} /></button>
                    <button type="button" onClick={() => removeCategory(item.category.id)}
                      className="p-1 text-red-400 hover:text-red-600 cursor-pointer"><X size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de retour prévue (optionnel)</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm bg-accent text-white rounded-lg cursor-pointer hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Envoi...' : 'Soumettre la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Créer `src/pages/student/CataloguePage.tsx`**

```tsx
import { useState } from 'react'
import { Package, Plus } from 'lucide-react'
import { useEquipment } from '../../hooks/useEquipment'
import { useCategories } from '../../hooks/useCategories'
import { LoanRequestForm } from '../../components/LoanRequestForm'
import type { EquipmentStatus } from '../../lib/types'

const statusLabel: Record<EquipmentStatus, { label: string; color: string }> = {
  available: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-800' },
  borrowed: { label: 'Emprunté', color: 'bg-amber-100 text-amber-800' },
  unavailable: { label: 'Indisponible', color: 'bg-red-100 text-red-800' },
}

export function CataloguePage() {
  const [filterCat, setFilterCat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { data: equipment, isLoading } = useEquipment({ categoryId: filterCat || undefined })
  const { data: categories } = useCategories()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Catalogue</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-accent text-white px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-emerald-700">
          <Plus size={14} /> Faire une demande
        </button>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat('')}
          className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${!filterCat ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>
          Tout
        </button>
        {categories?.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${filterCat === c.id ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {isLoading ? <p className="text-slate-500">Chargement...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {equipment?.map(eq => {
            const s = statusLabel[eq.status]
            return (
              <div key={eq.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <Package size={18} className="text-slate-400 mt-0.5" />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                </div>
                <p className="font-medium text-slate-800 text-sm">{eq.name}</p>
                <p className="text-xs text-slate-400 mt-1">{eq.category?.name}</p>
                {eq.serial_number && (
                  <p className="text-xs text-slate-300 font-mono mt-1">#{eq.serial_number}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && <LoanRequestForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/hooks/useLoanRequests.ts src/components/LoanRequestForm.tsx src/pages/student/CataloguePage.tsx
git commit -m "feat: student catalogue + loan request form"
```

---

## Task 9 : Edge Functions — approve, reject, close

**Files:**
- Create: `supabase/functions/approve-loan-request/index.ts`
- Create: `supabase/functions/reject-loan-request/index.ts`
- Create: `supabase/functions/close-loan/index.ts`

- [ ] **Créer `supabase/functions/approve-loan-request/index.ts`**

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Assignment { loan_item_id: string; equipment_id: string }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return new Response('Forbidden', { status: 403 })

    const { loan_id, assignments }: { loan_id: string; assignments: Assignment[] } = await req.json()

    for (const a of assignments) {
      await supabase.from('loan_items').update({ equipment_id: a.equipment_id }).eq('id', a.loan_item_id)
      await supabase.from('equipment').update({ status: 'borrowed' }).eq('id', a.equipment_id)
    }

    await supabase.from('loan_requests').update({ status: 'active' }).eq('id', loan_id)

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
```

- [ ] **Créer `supabase/functions/reject-loan-request/index.ts`**

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return new Response('Forbidden', { status: 403 })

    const { loan_id, admin_note }: { loan_id: string; admin_note?: string } = await req.json()

    await supabase.from('loan_requests')
      .update({ status: 'rejected', admin_note: admin_note ?? null })
      .eq('id', loan_id)

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
```

- [ ] **Créer `supabase/functions/close-loan/index.ts`**

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return new Response('Forbidden', { status: 403 })

    const { loan_id }: { loan_id: string } = await req.json()
    const now = new Date().toISOString()

    const { data: items } = await supabase
      .from('loan_items').select('id, equipment_id').eq('loan_id', loan_id)

    if (!items) throw new Error('Loan items not found')

    await supabase.from('loan_items').update({ returned_at: now }).eq('loan_id', loan_id)

    const equipmentIds = items.filter(i => i.equipment_id).map(i => i.equipment_id as string)
    if (equipmentIds.length > 0) {
      await supabase.from('equipment').update({ status: 'available' }).in('id', equipmentIds)
    }

    await supabase.from('loan_requests')
      .update({ status: 'closed', closed_at: now })
      .eq('id', loan_id)

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
```

- [ ] **Déployer les 3 fonctions**

```bash
supabase functions deploy approve-loan-request --no-verify-jwt
supabase functions deploy reject-loan-request --no-verify-jwt
supabase functions deploy close-loan --no-verify-jwt
```

- [ ] **Commit**

```bash
git add supabase/functions/
git commit -m "feat: edge functions approve, reject, close-loan — JALON 2"
```

---

## Task 10 : Admin — page demandes (validation)

**Files:**
- Create: `src/pages/admin/DemandesPage.tsx`

- [ ] **Créer `src/pages/admin/DemandesPage.tsx`**

```tsx
import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useAllLoanRequests } from '../../hooks/useLoanRequests'
import { useEquipment } from '../../hooks/useEquipment'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import type { LoanRequest, LoanItem } from '../../lib/types'

function ApproveModal({ loan, onClose }: { loan: LoanRequest; onClose: () => void }) {
  const qc = useQueryClient()
  const { data: equipment } = useEquipment({ status: 'available' })
  // assignments: { loan_item_id -> equipment_id }
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    const items = loan.items ?? []
    if (Object.keys(assignments).length !== items.length) {
      setError('Assignez un équipement à chaque article.')
      return
    }
    setLoading(true)
    const res = await supabase.functions.invoke('approve-loan-request', {
      body: {
        loan_id: loan.id,
        assignments: Object.entries(assignments).map(([loan_item_id, equipment_id]) => ({ loan_item_id, equipment_id })),
      },
    })
    setLoading(false)
    if (res.error) { setError(res.error.message); return }
    qc.invalidateQueries({ queryKey: ['loan_requests'] })
    qc.invalidateQueries({ queryKey: ['equipment'] })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="font-bold text-slate-800 mb-1">Valider la demande</h2>
        <p className="text-sm text-slate-500 mb-4">Étudiant : {loan.student?.full_name}</p>
        <div className="space-y-3">
          {loan.items?.map((item: LoanItem) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-sm text-slate-700 flex-1">{item.category?.name}</span>
              <select
                value={assignments[item.id] ?? ''}
                onChange={e => setAssignments(a => ({ ...a, [item.id]: e.target.value }))}
                className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Choisir un item...</option>
                {equipment
                  ?.filter(eq => eq.category_id === item.category_id)
                  .map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}{eq.serial_number ? ` #${eq.serial_number}` : ''}
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>
        {error && <p role="alert" className="text-red-600 text-sm mt-3">{error}</p>}
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">Annuler</button>
          <button onClick={submit} disabled={loading} className="px-4 py-2 text-sm bg-accent text-white rounded-lg cursor-pointer hover:bg-emerald-700 disabled:opacity-50">
            {loading ? 'Validation...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function DemandesPage() {
  const { data: requests, isLoading } = useAllLoanRequests('pending')
  const qc = useQueryClient()
  const [approving, setApproving] = useState<LoanRequest | null>(null)

  async function reject(loan: LoanRequest) {
    const note = window.prompt('Motif du refus (optionnel)')
    await supabase.functions.invoke('reject-loan-request', {
      body: { loan_id: loan.id, admin_note: note ?? undefined },
    })
    qc.invalidateQueries({ queryKey: ['loan_requests'] })
  }

  if (isLoading) return <p className="text-slate-500">Chargement...</p>

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Demandes en attente</h1>
      {requests?.length === 0 && <p className="text-slate-400">Aucune demande en attente.</p>}
      <div className="space-y-3">
        {requests?.map(req => (
          <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start justify-between">
            <div>
              <p className="font-medium text-slate-800">{req.student?.full_name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {req.items?.map(i => `${i.category?.name}`).join(', ')}
                {' '}<span className="text-xs text-slate-400">({req.items?.length} item(s))</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(req.created_at).toLocaleDateString('fr-FR')}
                {req.due_date && ` · Retour prévu le ${new Date(req.due_date).toLocaleDateString('fr-FR')}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setApproving(req)}
                className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-lg text-sm cursor-pointer hover:bg-emerald-700">
                <Check size={14} /> Valider
              </button>
              <button onClick={() => reject(req)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm cursor-pointer hover:bg-red-200">
                <X size={14} /> Refuser
              </button>
            </div>
          </div>
        ))}
      </div>
      {approving && <ApproveModal loan={approving} onClose={() => setApproving(null)} />}
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/pages/admin/DemandesPage.tsx
git commit -m "feat: admin loan validation page"
```

---

## Task 11 : Admin — emprunts actifs + clôture

**Files:**
- Create: `src/pages/admin/EmpruntsActifsPage.tsx`

- [ ] **Créer `src/pages/admin/EmpruntsActifsPage.tsx`**

```tsx
import { CheckCircle } from 'lucide-react'
import { useAllLoanRequests } from '../../hooks/useLoanRequests'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export function EmpruntsActifsPage() {
  const { data: loans, isLoading } = useAllLoanRequests('active')
  const qc = useQueryClient()

  async function closeLoan(loanId: string) {
    if (!window.confirm('Confirmer le retour de cet emprunt ?')) return
    await supabase.functions.invoke('close-loan', { body: { loan_id: loanId } })
    qc.invalidateQueries({ queryKey: ['loan_requests'] })
    qc.invalidateQueries({ queryKey: ['equipment'] })
  }

  if (isLoading) return <p className="text-slate-500">Chargement...</p>

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Emprunts actifs</h1>
      {loans?.length === 0 && <p className="text-slate-400">Aucun emprunt en cours.</p>}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Étudiant</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Matériel</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Depuis</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Retour prévu</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loans?.map(loan => {
              const isLate = loan.due_date && new Date(loan.due_date) < new Date()
              return (
                <tr key={loan.id} className={`border-b border-slate-100 ${isLate ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">{loan.student?.full_name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(loan.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    {loan.due_date
                      ? <span className={isLate ? 'text-amber-700 font-medium' : 'text-slate-500'}>
                          {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                          {isLate && ' ⚠'}
                        </span>
                      : <span className="text-slate-400">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => closeLoan(loan.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs cursor-pointer hover:bg-slate-700">
                      <CheckCircle size={12} /> Retour enregistré
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/pages/admin/EmpruntsActifsPage.tsx
git commit -m "feat: active loans page + close loan"
```

---

## Task 12 : Pages historique (étudiant + admin)

**Files:**
- Create: `src/pages/student/HistoriquePage.tsx`
- Create: `src/pages/admin/HistoriquePage.tsx`
- Create: `src/pages/student/MesDemandesPage.tsx`

- [ ] **Créer `src/pages/student/MesDemandesPage.tsx`**

```tsx
import { useMyLoanRequests } from '../../hooks/useLoanRequests'
import type { LoanStatus } from '../../lib/types'

const statusLabel: Record<LoanStatus, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-slate-100 text-slate-600' },
  active: { label: 'En cours', color: 'bg-amber-100 text-amber-700' },
  closed: { label: 'Clôturé', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700' },
}

export function MesDemandesPage() {
  const { data: requests, isLoading } = useMyLoanRequests()

  if (isLoading) return <p className="text-slate-500">Chargement...</p>

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Mes demandes</h1>
      {requests?.length === 0 && <p className="text-slate-400">Aucune demande.</p>}
      <div className="space-y-3">
        {requests?.map(req => {
          const s = statusLabel[req.status]
          return (
            <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-800 text-sm">
                    {req.items?.map(i => i.category?.name).join(', ')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Demandé le {new Date(req.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  {req.items?.some(i => i.equipment_id) && (
                    <p className="text-xs text-slate-500 mt-1">
                      Items : {req.items.map(i => i.equipment?.name).filter(Boolean).join(', ')}
                    </p>
                  )}
                  {req.admin_note && (
                    <p className="text-xs text-red-500 mt-1">Note : {req.admin_note}</p>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Créer `src/pages/student/HistoriquePage.tsx`**

```tsx
import { useMyLoanRequests } from '../../hooks/useLoanRequests'

export function StudentHistorique() {
  const { data: all } = useMyLoanRequests()
  const closed = all?.filter(r => r.status === 'closed') ?? []

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Mon historique</h1>
      {closed.length === 0 && <p className="text-slate-400">Aucun emprunt clôturé.</p>}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Matériel</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Emprunté le</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Retourné le</th>
            </tr>
          </thead>
          <tbody>
            {closed.map(loan => (
              <tr key={loan.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">
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
      </div>
    </div>
  )
}
```

- [ ] **Créer `src/pages/admin/HistoriquePage.tsx`**

```tsx
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
```

- [ ] **Commit**

```bash
git add src/pages/student/ src/pages/admin/HistoriquePage.tsx
git commit -m "feat: historique pages (student + admin) + mes demandes"
```

---

## Task 13 : Dashboard admin + KPICard + StatusDonut

**Files:**
- Create: `src/hooks/useDashboard.ts`
- Create: `src/components/KPICard.tsx`
- Create: `src/components/StatusDonut.tsx`
- Create: `src/components/LoanTable.tsx`
- Create: `src/pages/admin/DashboardPage.tsx`

- [ ] **Créer `src/hooks/useDashboard.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [
        { count: total },
        { count: available },
        { count: borrowed },
        { count: unavailable },
        { count: pending },
        { data: activeLate },
      ] = await Promise.all([
        supabase.from('equipment').select('*', { count: 'exact', head: true }),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'borrowed'),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'unavailable'),
        supabase.from('loan_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('loan_requests')
          .select('id, due_date')
          .eq('status', 'active')
          .lt('due_date', new Date().toISOString().split('T')[0]),
      ])

      return {
        total: total ?? 0,
        available: available ?? 0,
        borrowed: borrowed ?? 0,
        unavailable: unavailable ?? 0,
        pending: pending ?? 0,
        late: activeLate?.length ?? 0,
      }
    },
  })
}
```

- [ ] **Créer `src/components/KPICard.tsx`**

```tsx
interface Props {
  label: string
  value: number
  color?: 'green' | 'amber' | 'red' | 'slate'
}

const colors = {
  green: 'border-l-emerald-500 text-emerald-600',
  amber: 'border-l-amber-500 text-amber-600',
  red: 'border-l-red-500 text-red-600',
  slate: 'border-l-slate-400 text-slate-600',
}

export function KPICard({ label, value, color = 'slate' }: Props) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${colors[color]} p-4`}>
      <p className="text-2xl font-bold font-mono">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  )
}
```

- [ ] **Créer `src/components/StatusDonut.tsx`**

```tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  available: number
  borrowed: number
  unavailable: number
}

const COLORS = ['#059669', '#F59E0B', '#DC2626']

export function StatusDonut({ available, borrowed, unavailable }: Props) {
  const data = [
    { name: 'Disponible', value: available },
    { name: 'Emprunté', value: borrowed },
    { name: 'Indisponible', value: unavailable },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="font-medium text-slate-700 mb-3 text-sm">Répartition des statuts</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Pie>
          <Tooltip formatter={(v: number) => [`${v} item(s)`]} />
          <Legend iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Créer `src/components/LoanTable.tsx`**

```tsx
import type { LoanRequest } from '../lib/types'

interface Props { loans: LoanRequest[] }

export function LoanTable({ loans }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <p className="font-medium text-slate-700 px-4 py-3 border-b border-slate-100 text-sm">Emprunts actifs</p>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-4 py-2 font-medium text-slate-600 text-xs">Étudiant</th>
            <th className="text-left px-4 py-2 font-medium text-slate-600 text-xs">Matériel</th>
            <th className="text-left px-4 py-2 font-medium text-slate-600 text-xs">Retour prévu</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => {
            const isLate = loan.due_date && new Date(loan.due_date) < new Date()
            return (
              <tr key={loan.id} className={`border-b border-slate-100 ${isLate ? 'bg-amber-50' : ''}`}>
                <td className="px-4 py-2 text-slate-700">{loan.student?.full_name}</td>
                <td className="px-4 py-2 text-slate-500 text-xs">
                  {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
                </td>
                <td className="px-4 py-2">
                  {loan.due_date
                    ? <span className={isLate ? 'text-amber-700 font-medium text-xs' : 'text-slate-500 text-xs'}>
                        {new Date(loan.due_date).toLocaleDateString('fr-FR')}{isLate && ' ⚠'}
                      </span>
                    : <span className="text-slate-400 text-xs">—</span>
                  }
                </td>
              </tr>
            )
          })}
          {loans.length === 0 && (
            <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-sm">Aucun emprunt actif.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Créer `src/pages/admin/DashboardPage.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useDashboardStats } from '../../hooks/useDashboard'
import { useAllLoanRequests } from '../../hooks/useLoanRequests'
import { KPICard } from '../../components/KPICard'
import { StatusDonut } from '../../components/StatusDonut'
import { LoanTable } from '../../components/LoanTable'

export function AdminDashboard() {
  const { data: stats } = useDashboardStats()
  const { data: activeLoans } = useAllLoanRequests('active')
  const { data: pendingLoans } = useAllLoanRequests('pending')

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Tableau de bord</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total matériels" value={stats?.total ?? 0} color="slate" />
        <KPICard label="Empruntés" value={stats?.borrowed ?? 0} color="amber" />
        <KPICard label="En retard" value={stats?.late ?? 0} color="red" />
        <KPICard label="Demandes en attente" value={stats?.pending ?? 0} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatusDonut
          available={stats?.available ?? 0}
          borrowed={stats?.borrowed ?? 0}
          unavailable={stats?.unavailable ?? 0}
        />
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-slate-700 text-sm">Dernières demandes en attente</p>
            <Link to="/admin/demandes" className="text-xs text-accent flex items-center gap-1 hover:underline">
              Voir toutes <ArrowRight size={12} />
            </Link>
          </div>
          {pendingLoans?.slice(0, 4).map(req => (
            <div key={req.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-700">{req.student?.full_name}</span>
              <span className="text-xs text-slate-400">
                {req.items?.map(i => `${i.category?.name}`).join(', ')}
              </span>
            </div>
          ))}
          {pendingLoans?.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Aucune demande en attente.</p>}
        </div>
      </div>

      <LoanTable loans={activeLoans ?? []} />
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/hooks/useDashboard.ts src/components/KPICard.tsx src/components/StatusDonut.tsx src/components/LoanTable.tsx src/pages/admin/DashboardPage.tsx
git commit -m "feat: admin dashboard with KPIs, donut chart, loan table — JALON 3"
```

---

## Task 14 : Dashboard étudiant

**Files:**
- Create: `src/pages/student/DashboardPage.tsx`

- [ ] **Créer `src/pages/student/DashboardPage.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useMyLoanRequests } from '../../hooks/useLoanRequests'
import { useAuth } from '../../hooks/useAuth'
import type { LoanStatus } from '../../lib/types'

const statusLabel: Record<LoanStatus, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-slate-100 text-slate-600' },
  active: { label: 'En cours', color: 'bg-amber-100 text-amber-700' },
  closed: { label: 'Clôturé', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700' },
}

export function StudentDashboard() {
  const { profile } = useAuth()
  const { data: requests } = useMyLoanRequests()

  const active = requests?.filter(r => r.status === 'active') ?? []
  const pending = requests?.filter(r => r.status === 'pending') ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Bonjour, {profile?.full_name} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Bienvenue sur IcamTrack</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 border-l-4 border-l-amber-500">
          <p className="text-2xl font-bold font-mono text-amber-600">{active.length}</p>
          <p className="text-sm text-slate-500 mt-1">Emprunt(s) en cours</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 border-l-4 border-l-slate-400">
          <p className="text-2xl font-bold font-mono text-slate-600">{pending.length}</p>
          <p className="text-sm text-slate-500 mt-1">Demande(s) en attente</p>
        </div>
      </div>

      {active.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-slate-700 text-sm">Mes emprunts actifs</p>
            <Link to="/mes-demandes" className="text-xs text-accent hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          {active.map(loan => (
            <div key={loan.id} className="py-2 border-b border-slate-100 last:border-0">
              <p className="text-sm text-slate-700">
                {loan.items?.map(i => i.equipment?.name ?? i.category?.name).join(', ')}
              </p>
              {loan.due_date && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Retour prévu le {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="font-medium text-slate-700 text-sm mb-3">Dernières demandes</p>
        {requests?.slice(0, 5).map(req => {
          const s = statusLabel[req.status]
          return (
            <div key={req.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm text-slate-700">
                  {req.items?.map(i => i.category?.name).join(', ')}
                </p>
                <p className="text-xs text-slate-400">{new Date(req.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
            </div>
          )
        })}
        {!requests?.length && <p className="text-slate-400 text-sm text-center py-4">Aucune demande pour l'instant.</p>}
      </div>
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/pages/student/DashboardPage.tsx
git commit -m "feat: student dashboard"
```

---

## Task 15 : Gestion des utilisateurs (admin)

**Files:**
- Create: `src/pages/admin/UtilisateursPage.tsx`

- [ ] **Créer `src/pages/admin/UtilisateursPage.tsx`**

```tsx
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
```

- [ ] **Commit**

```bash
git add src/pages/admin/UtilisateursPage.tsx
git commit -m "feat: user management page (admin)"
```

---

## Task 16 : Vérification finale + déploiement

- [ ] **Vérifier que tous les imports dans `App.tsx` correspondent aux exports des pages créées**

Chaque page doit exporter une fonction nommée correspondant à l'import dans `App.tsx` :
- `StudentDashboard`, `CataloguePage`, `MesDemandesPage`, `StudentHistorique`
- `AdminDashboard`, `MaterielPage`, `CategoriesPage`, `DemandesPage`, `EmpruntsActifsPage`, `AdminHistorique`, `UtilisateursPage`

- [ ] **Lancer les tests**

```bash
npx vitest run
```
Attendu : tous les tests passent.

- [ ] **Build de production**

```bash
npm run build
```
Attendu : `dist/` généré sans erreur TypeScript.

- [ ] **Déployer sur Vercel** (si compte Vercel configuré)

```bash
npx vercel --prod
```
Variables d'environnement à ajouter dans Vercel : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

- [ ] **Créer un compte admin de test** via Supabase Dashboard → Authentication → Add user, puis mettre à jour le rôle manuellement en SQL :

```sql
update profiles set role = 'admin' where email = 'admin@icam.fr';
```

- [ ] **Smoke test manuel** : se connecter en admin, créer une catégorie, créer un équipement, se connecter en étudiant, faire une demande, re-connecter en admin, valider, puis clôturer.

- [ ] **Commit final**

```bash
git add .
git commit -m "feat: IcamTrack v1.0 — all features complete (JALON 4)"
```
