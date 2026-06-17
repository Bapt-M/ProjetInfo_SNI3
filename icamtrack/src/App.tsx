import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './router/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { StudentLayout } from './components/layout/StudentLayout'
import { LoginPage } from './pages/LoginPage'

const StudentDashboard = lazy(() => import('./pages/student/DashboardPage').then(m => ({ default: m.StudentDashboard })))
const CataloguePage = lazy(() => import('./pages/student/CataloguePage').then(m => ({ default: m.CataloguePage })))
const MesDemandesPage = lazy(() => import('./pages/student/MesDemandesPage').then(m => ({ default: m.MesDemandesPage })))
const StudentHistorique = lazy(() => import('./pages/student/HistoriquePage').then(m => ({ default: m.StudentHistorique })))
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage').then(m => ({ default: m.AdminDashboard })))
const MaterielPage = lazy(() => import('./pages/admin/MaterielPage').then(m => ({ default: m.MaterielPage })))
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage').then(m => ({ default: m.CategoriesPage })))
const PacksPage = lazy(() => import('./pages/admin/PacksPage').then(m => ({ default: m.PacksPage })))
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

              {/* Student routes */}
              <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/catalogue" element={<CataloguePage />} />
                <Route path="/mes-demandes" element={<MesDemandesPage />} />
                <Route path="/historique" element={<StudentHistorique />} />
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/materiel" element={<MaterielPage />} />
                <Route path="/admin/categories" element={<CategoriesPage />} />
                <Route path="/admin/packs" element={<PacksPage />} />
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
