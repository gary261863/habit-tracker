import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useHabits } from '../hooks/useHabits'
import { useLogs } from '../hooks/useLogs'
import { useToday } from '../hooks/useToday'
import { useAuth } from '../context/AuthContext'
import HabitRow from '../components/habits/HabitRow'
import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'

export default function TodayPage() {
  const today = useToday()
  const todayLabel = format(new Date(today + 'T00:00:00'), "EEEE, d 'de' MMMM", { locale: es })

  const { profile } = useAuth()
  const firstName = profile?.display_name?.trim().split(' ')[0]

  const { habits, loading: habitsLoading } = useHabits()
  const { isCompleted, toggle, loading: logsLoading } = useLogs(today)

  const loading = habitsLoading || logsLoading

  // Group by category
  const grouped = habits.reduce((acc, habit) => {
    const cat = habit.categories
    const key = cat?.id || 'sin-categoria'
    if (!acc[key]) acc[key] = { label: cat?.name || 'Sin categoría', color: cat?.color || '#888', emoji: cat?.emoji || '', habits: [] }
    acc[key].habits.push(habit)
    return acc
  }, {})

  const totalDone = habits.filter(h => isCompleted(h.id)).length
  const total = habits.length
  const pct = total > 0 ? Math.round((totalDone / total) * 100) : 0

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-ink-muted capitalize">{todayLabel}</p>
        <h1 className="text-2xl font-semibold text-ink mt-0.5">
          Buenos días{firstName ? `, ${firstName}` : ''} 🌤
        </h1>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink">Progreso de hoy</span>
            <span className="font-mono text-sm text-accent font-medium">{totalDone}/{total}</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct === 100 && (
            <p className="text-xs text-accent mt-2 font-medium">¡Todos los hábitos completados! 🎉</p>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && habits.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-3xl mb-3">🌱</p>
          <p className="text-ink font-medium mb-1">Aún no hay hábitos</p>
          <p className="text-sm text-ink-muted mb-4">Ve a Ajustes para crear tus primeras categorías y hábitos.</p>
          <Link to="/ajustes" className="btn-primary inline-flex">
            <Settings size={15} /> Ir a ajustes
          </Link>
        </div>
      )}

      {/* Habits grouped by category */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-12 bg-surface-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([key, group]) => (
            <div key={key}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                  {group.emoji} {group.label}
                </span>
              </div>
              <div className="space-y-2">
                {group.habits.map(habit => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    completed={isCompleted(habit.id)}
                    onToggle={() => toggle(habit.id, isCompleted(habit.id))}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
