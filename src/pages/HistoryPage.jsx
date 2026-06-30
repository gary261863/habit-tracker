import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHabits } from '../hooks/useHabits'
import { useLogs } from '../hooks/useLogs'
import { useToday } from '../hooks/useToday'
import HabitRow from '../components/habits/HabitRow'

export default function HistoryPage() {
  const [date, setDate] = useState(new Date())
  const dateStr = format(date, 'yyyy-MM-dd')
  const todayStr = useToday()

  const { habits, loading: habitsLoading } = useHabits()
  const { isCompleted, toggle, loading: logsLoading } = useLogs(dateStr)

  const prev = () => setDate(d => subDays(d, 1))
  const next = () => setDate(d => {
    const tomorrow = new Date(d)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (format(tomorrow, 'yyyy-MM-dd') > todayStr) return d
    return tomorrow
  })

  const isToday = dateStr === todayStr
  const label = isToday
    ? 'Hoy'
    : format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })

  const totalDone = habits.filter(h => isCompleted(h.id)).length
  const total = habits.length

  // Group by category
  const grouped = habits.reduce((acc, habit) => {
    const cat = habit.categories
    const key = cat?.id || 'sin-categoria'
    if (!acc[key]) acc[key] = { label: cat?.name || 'Sin categoría', color: cat?.color || '#888', emoji: cat?.emoji || '', habits: [] }
    acc[key].habits.push(habit)
    return acc
  }, {})

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-6">Historial</h1>

      {/* Date nav */}
      <div className="card p-3 flex items-center justify-between mb-6">
        <button onClick={prev} className="btn-ghost px-2 py-1">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-ink capitalize">{label}</p>
          {total > 0 && (
            <p className="text-xs text-ink-muted">{totalDone}/{total} hábitos</p>
          )}
        </div>
        <button onClick={next} disabled={isToday} className="btn-ghost px-2 py-1 disabled:opacity-30">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Habits */}
      {habitsLoading || logsLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-surface-100 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([key, group]) => (
            <div key={key}>
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
