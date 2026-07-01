import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

export function useLogs(dateStr) {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user || !dateStr) return
    setLoading(true)
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr)
    setLogs(data || [])
    setLoading(false)
  }, [user, dateStr])

  useEffect(() => { fetch() }, [fetch])

  const toggle = async (habitId, currentlyCompleted) => {
    if (currentlyCompleted) {
      await supabase
        .from('habit_logs')
        .delete()
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .eq('date', dateStr)
    } else {
      await supabase
        .from('habit_logs')
        .upsert({ user_id: user.id, habit_id: habitId, date: dateStr, completed: true },
          { onConflict: 'user_id,habit_id,date' })
    }
    fetch()
  }

  const isCompleted = (habitId) => logs.some(l => l.habit_id === habitId && l.completed)

  return { logs, loading, toggle, isCompleted, refresh: fetch }
}

// Fetch logs for a date range (for stats)
export async function fetchLogsRange(userId, from, to, habitId = null) {
  let query = supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .eq('completed', true)

  if (habitId) query = query.eq('habit_id', habitId)

  const { data } = await query
  return data || []
}
