import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('habits')
      .select('*, categories(id, name, color, emoji)')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('order_index', { ascending: true })
    setHabits(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const create = async ({ name, emoji, category_id }) => {
    const maxOrder = habits.length > 0 ? Math.max(...habits.map(h => h.order_index || 0)) : 0
    const { error } = await supabase.from('habits').insert({
      user_id: user.id, name, emoji, category_id, order_index: maxOrder + 1,
    })
    if (!error) fetch()
    return { error }
  }

  const update = async (id, fields) => {
    const { error } = await supabase.from('habits').update(fields).eq('id', id).eq('user_id', user.id)
    if (!error) fetch()
    return { error }
  }

  const archive = async (id) => update(id, { is_archived: true })

  const remove = async (id) => {
    const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user.id)
    if (!error) fetch()
    return { error }
  }

  return { habits, loading, create, update, archive, remove, refresh: fetch }
}
