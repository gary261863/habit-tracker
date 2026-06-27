import { useEffect, useState, useCallback } from 'react'
import { subDays, format, parseISO, differenceInDays, eachDayOfInterval, subYears } from 'date-fns'
import { fetchLogsRange } from './useLogs'
import { useAuth } from '../context/AuthContext'

export function useStats(habits) {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const compute = useCallback(async () => {
    if (!user || habits.length === 0) { setLoading(false); return }
    setLoading(true)

    const today = new Date()
    const yearAgo = subYears(today, 1)
    const logs = await fetchLogsRange(
      user.id,
      format(yearAgo, 'yyyy-MM-dd'),
      format(today, 'yyyy-MM-dd')
    )

    // Build a set for fast lookup
    const completedSet = new Set(logs.map(l => `${l.habit_id}__${l.date}`))

    // Per habit streaks and success rate
    const habitStats = habits.map(habit => {
      const days = eachDayOfInterval({ start: yearAgo, end: today })
      let currentStreak = 0
      let maxStreak = 0
      let tempStreak = 0
      let completed = 0

      // current streak: go backwards from today
      for (let i = days.length - 1; i >= 0; i--) {
        const d = format(days[i], 'yyyy-MM-dd')
        if (completedSet.has(`${habit.id}__${d}`)) {
          currentStreak++
        } else {
          break
        }
      }

      // max streak and total
      for (const day of days) {
        const d = format(day, 'yyyy-MM-dd')
        if (completedSet.has(`${habit.id}__${d}`)) {
          tempStreak++
          completed++
          if (tempStreak > maxStreak) maxStreak = tempStreak
        } else {
          tempStreak = 0
        }
      }

      const successRate = days.length > 0 ? Math.round((completed / days.length) * 100) : 0

      return {
        ...habit,
        currentStreak,
        maxStreak,
        successRate,
        totalCompleted: completed,
      }
    })

    // Daily completion rate (last 30 days)
    const last30 = eachDayOfInterval({ start: subDays(today, 29), end: today })
    const dailyRate = last30.map(day => {
      const d = format(day, 'yyyy-MM-dd')
      const done = habits.filter(h => completedSet.has(`${h.id}__${d}`)).length
      return {
        date: d,
        label: format(day, 'dd/MM'),
        completed: done,
        total: habits.length,
        pct: habits.length > 0 ? Math.round((done / habits.length) * 100) : 0,
      }
    })

    // Heatmap data (last year, per habit)
    const heatmapByHabit = {}
    for (const habit of habits) {
      heatmapByHabit[habit.id] = eachDayOfInterval({ start: yearAgo, end: today }).map(day => {
        const d = format(day, 'yyyy-MM-dd')
        return { date: d, done: completedSet.has(`${habit.id}__${d}`) }
      })
    }

    // Category success rate
    const categoryIds = [...new Set(habits.map(h => h.category_id).filter(Boolean))]
    const categoryStats = categoryIds.map(catId => {
      const catHabits = habits.filter(h => h.category_id === catId)
      const cat = catHabits[0]?.categories
      const avg = catHabits.length > 0
        ? Math.round(catHabits.reduce((s, h) => s + (habitStats.find(hs => hs.id === h.id)?.successRate || 0), 0) / catHabits.length)
        : 0
      return { id: catId, name: cat?.name || 'Sin categoría', color: cat?.color || '#888', successRate: avg }
    })

    setStats({ habitStats, dailyRate, heatmapByHabit, categoryStats })
    setLoading(false)
  }, [user, habits])

  useEffect(() => { compute() }, [compute])

  return { stats, loading, refresh: compute }
}
