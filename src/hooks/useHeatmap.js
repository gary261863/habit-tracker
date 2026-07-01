import { useEffect, useState, useCallback } from 'react'
import { eachDayOfInterval, endOfYear, isAfter, parseISO } from 'date-fns'
import { format, toZonedTime } from 'date-fns-tz'
import { fetchLogsRange } from './useLogs'
import { useAuth } from '../context/AuthContext'

// Devuelve la fecha actual en la zona horaria dada como string 'yyyy-MM-dd'
export function getTodayInTimezone(timezone = 'UTC') {
  const now = new Date()
  const zoned = toZonedTime(now, timezone)
  return format(zoned, 'yyyy-MM-dd', { timeZone: timezone })
}

// Función pura extraída para facilitar testing
export function buildHeatmapData(year, logs, todayStr) {
  const completedSet = new Set(logs.map(l => l.date))
  const allDays = eachDayOfInterval({
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
  })
  return allDays.map(day => {
    const d = format(day, 'yyyy-MM-dd', { timeZone: 'UTC' })
    const isFuture = d > todayStr
    return {
      date: d,
      done: isFuture ? false : completedSet.has(d),
      future: isFuture,
    }
  })
}

export function buildDateRange(year, todayStr) {
  const from = `${year}-01-01`
  const yearEnd = `${year}-12-31`
  const to = todayStr < yearEnd ? todayStr : yearEnd
  return { from, to }
}

export function useHeatmap(habitId, year) {
  const { user, profile } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const compute = useCallback(async () => {
    if (!user || !habitId || !year) return
    setLoading(true)

    const timezone = profile?.timezone || 'UTC'
    const todayStr = getTodayInTimezone(timezone)
    const { from, to } = buildDateRange(year, todayStr)
    const logs = await fetchLogsRange(user.id, from, to, habitId)

    setData(buildHeatmapData(year, logs, todayStr))
    setLoading(false)
  }, [user, profile, habitId, year])

  useEffect(() => { compute() }, [compute])

  return { data, loading }
}
