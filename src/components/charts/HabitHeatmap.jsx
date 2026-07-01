import { useState } from 'react'
import { useHeatmap } from '../../hooks/useHeatmap'
import { useAuth } from '../../context/AuthContext'
import HeatMap from './HeatMap'

export default function HabitHeatmap({ habit }) {
  const { profile } = useAuth()
  const currentYear = new Date().getFullYear()

  // Año de registro del usuario (fallback al año actual si no hay perfil aún)
  const joinYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : currentYear

  // Generar lista de años desde el año de registro hasta el actual
  const years = []
  for (let y = currentYear; y >= joinYear; y--) years.push(y)

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const { data, loading } = useHeatmap(habit.id, selectedYear)

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span>{habit.emoji || '⚪'}</span>
          <span className="text-sm font-medium text-ink">{habit.name}</span>
        </div>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="text-xs border border-surface-200 rounded px-2 py-1 text-ink-soft bg-white focus:outline-none focus:ring-1 focus:ring-accent/30"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-20 bg-surface-100 rounded animate-pulse" />
      ) : (
        <HeatMap data={data} color={habit.categories?.color || '#2D6A4F'} />
      )}
    </div>
  )
}
