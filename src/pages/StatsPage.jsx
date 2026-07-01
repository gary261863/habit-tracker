import { useHabits } from '../hooks/useHabits'
import { useStats } from '../hooks/useStats'
import HabitHeatmap from '../components/charts/HabitHeatmap'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Flame, Trophy } from 'lucide-react'

function StreakCard({ habit, currentStreak, maxStreak, successRate }) {
  const color = habit.categories?.color || '#2D6A4F'
  return (
    <div className="card p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{habit.emoji || '⚪'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{habit.name}</p>
          <p className="text-xs text-ink-muted" style={{ color }}>{habit.categories?.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-orange-500 mb-0.5">
            <Flame size={13} />
            <span className="font-mono font-semibold text-lg">{currentStreak}</span>
          </div>
          <p className="text-[10px] text-ink-muted">racha actual</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-yellow-500 mb-0.5">
            <Trophy size={13} />
            <span className="font-mono font-semibold text-lg">{maxStreak}</span>
          </div>
          <p className="text-[10px] text-ink-muted">racha máx.</p>
        </div>
        <div>
          <div className="font-mono font-semibold text-lg text-accent mb-0.5">{successRate}%</div>
          <p className="text-[10px] text-ink-muted">éxito anual</p>
        </div>
      </div>
    </div>
  )
}

export default function StatsPage() {
  const { habits } = useHabits()
  const { stats, loading } = useStats(habits)

  if (loading) return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-6">Estadísticas</h1>
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-surface-100 rounded-lg animate-pulse" />)}
      </div>
    </div>
  )

  if (!stats) return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-6">Estadísticas</h1>
      <div className="card p-8 text-center">
        <p className="text-3xl mb-3">📊</p>
        <p className="text-ink font-medium mb-1">Aún no hay datos</p>
        <p className="text-sm text-ink-muted">Registra tus hábitos por al menos un día para ver estadísticas.</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-ink">Estadísticas</h1>

      {/* Daily completion chart */}
      <section>
        <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wider mb-3">Últimos 30 días</h2>
        <div className="card p-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.dailyRate} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9a9691' }} interval={6} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9a9691' }} unit="%" />
              <Tooltip
                formatter={(v) => [`${v}%`, 'Completado']}
                contentStyle={{ fontSize: 12, border: '1px solid #e4e2de', borderRadius: 6 }}
              />
              <Bar dataKey="pct" radius={[3,3,0,0]}>
                {stats.dailyRate.map((entry, i) => (
                  <Cell key={i} fill={entry.pct === 100 ? '#2D6A4F' : '#52B788'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Category success rate */}
      {stats.categoryStats.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wider mb-3">Por categoría</h2>
          <div className="card p-4 space-y-3">
            {stats.categoryStats.map(cat => (
              <div key={cat.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-ink">{cat.name}</span>
                  <span className="text-sm font-mono text-ink-soft">{cat.successRate}%</span>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${cat.successRate}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Streaks */}
      <section>
        <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wider mb-3">Rachas por hábito</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.habitStats.map(hs => (
            <StreakCard key={hs.id} habit={hs} currentStreak={hs.currentStreak} maxStreak={hs.maxStreak} successRate={hs.successRate} />
          ))}
        </div>
      </section>

      {/* Heatmaps */}
      <section>
        <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wider mb-3">Mapa de actividad anual</h2>
        <div className="space-y-4">
          {habits.map(habit => (
            <HabitHeatmap key={habit.id} habit={habit} />
          ))}
        </div>
      </section>
    </div>
  )
}
