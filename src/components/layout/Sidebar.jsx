import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CalendarDays, BarChart2, Settings, LogOut, History } from 'lucide-react'

const nav = [
  { to: '/',         icon: CalendarDays, label: 'Hoy' },
  { to: '/historial', icon: History,     label: 'Historial' },
  { to: '/stats',    icon: BarChart2,    label: 'Estadísticas' },
  { to: '/ajustes',  icon: Settings,     label: 'Ajustes' },
]

export default function Sidebar() {
  const { signOut, user } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-surface-200 flex flex-col z-20 hidden md:flex">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="font-semibold text-ink">Hábitos</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-ink-soft hover:bg-surface-100 hover:text-ink'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-surface-100">
        <p className="text-xs text-ink-muted px-3 mb-2 truncate">{user?.email}</p>
        <button onClick={signOut} className="btn-ghost w-full justify-start text-ink-muted hover:text-danger">
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

// Mobile bottom nav
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 flex md:hidden z-20">
      {nav.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to} to={to} end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-accent' : 'text-ink-muted'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
