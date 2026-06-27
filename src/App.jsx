import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import AuthPage from './pages/AuthPage'
import TodayPage from './pages/TodayPage'
import HistoryPage from './pages/HistoryPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoutes() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/auth" replace />
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<TodayPage />} />
        <Route path="historial" element={<HistoryPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
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
