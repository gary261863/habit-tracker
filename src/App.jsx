import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import AuthPage from './pages/AuthPage'
import TodayPage from './pages/TodayPage'
import HistoryPage from './pages/HistoryPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoutes() {
  const { user, loading, isActive } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/auth" replace />
  if (!isActive) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 max-w-sm text-center">
        <p className="text-3xl mb-3">🔒</p>
        <p className="font-semibold text-ink mb-1">Cuenta desactivada</p>
        <p className="text-sm text-ink-muted">Tu cuenta ha sido desactivada. Contacta al administrador.</p>
      </div>
    </div>
  )
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<TodayPage />} />
        <Route path="historial" element={<HistoryPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}

function AuthRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
