import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CalendarDays, BarChart2, Settings, LogOut, History, Menu, X, ShieldCheck, User } from 'lucide-react'

const navBase = [
  { to: '/',          icon: CalendarDays, label: 'Hoy' },
  { to: '/historial', icon: History,      label: 'Historial' },
  { to: '/stats',     icon: BarChart2,    label: 'Estadísticas' },
  { to: '/perfil',    icon: User,         label: 'Mi perfil' },
  { to: '/ajustes',   icon: Settings,     label: 'Ajustes' },
]

function NavLinks({ items, onClick }) {
  return items.map(({ to, icon: Icon, label, admin }) => (
    <NavLink
      key={to} to={to} end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all ${
          isActive
            ? admin ? 'bg-yellow-50 text-yellow-700' : 'bg-accent/10 text-accent'
            : 'text-ink-soft hover:bg-surface-100 hover:text-ink'
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  ))
}

function Avatar({ profile, user, size = 28 }) {
  const initial = (profile?.display_name || user?.email || '?')[0].toUpperCase()
  return (
    <div
      className="rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="font-medium text-accent" style={{ fontSize: size * 0.4 }}>{initial}</span>
      )}
    </div>
  )
}

export default function Sidebar() {
  const { signOut, user, profile, isAdmin } = useAuth()
  const nav = isAdmin
    ? [...navBase, { to: '/admin', icon: ShieldCheck, label: 'Admin', admin: true }]
    : navBase

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-surface-200 flex-col z-20 hidden md:flex">
      <div className="px-5 py-5 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="font-semibold text-ink">Hábitos</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLinks items={nav} />
      </nav>
      <div className="px-3 py-4 border-t border-surface-100">
        <div className="flex items-center gap-2 px-1 mb-2">
          <Avatar profile={profile} user={user} size={28} />
          <p className="text-xs text-ink-muted truncate flex-1">{profile?.display_name || user?.email}</p>
        </div>
        <button onClick={signOut} className="btn-ghost w-full justify-start text-ink-muted hover:text-danger">
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export function MobileHeader() {
  const { signOut, user, profile, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const nav = isAdmin
    ? [...navBase, { to: '/admin', icon: ShieldCheck, label: 'Admin', admin: true }]
    : navBase

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-surface-200 flex items-center justify-between px-4 z-30 md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌱</span>
          <span className="font-semibold text-ink">Hábitos</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 rounded hover:bg-surface-100 transition-colors">
          <Menu size={20} className="text-ink-soft" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-xl">
            <div className="px-5 py-5 border-b border-surface-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌱</span>
                <span className="font-semibold text-ink">Hábitos</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-surface-100">
                <X size={18} className="text-ink-muted" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              <NavLinks items={nav} onClick={() => setOpen(false)} />
            </nav>
            <div className="px-3 py-4 border-t border-surface-100">
              <div className="flex items-center gap-2 px-1 mb-2">
                <Avatar profile={profile} user={user} size={28} />
                <p className="text-xs text-ink-muted truncate flex-1">{profile?.display_name || user?.email}</p>
              </div>
              <button onClick={signOut} className="btn-ghost w-full justify-start text-ink-muted hover:text-danger">
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
