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
  if (user && !profile && !loading) {
    return <Navigate to="/login" replace />
  }
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to={profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
  }
  return <>{children}</>
}
