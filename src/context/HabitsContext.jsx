import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const HabitsContext = createContext(null)

export function HabitsProvider({ children }) {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [archivedHabits, setArchivedHabits] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('habits')
      .select('*, categories(id, name, color, emoji)')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true })
    const all = data || []
    setHabits(all.filter(h => !h.is_archived))
    setArchivedHabits(all.filter(h => h.is_archived))
    setLoading(false)
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  const create = async ({ name, emoji, category_id }) => {
    const maxOrder = habits.length > 0 ? Math.max(...habits.map(h => h.order_index || 0)) : 0
    const { error } = await supabase.from('habits').insert({
      user_id: user.id, name, emoji, category_id, order_index: maxOrder + 1,
    })
    if (!error) fetchAll()
    return { error }
  }

  const update = async (id, fields) => {
    const { error } = await supabase.from('habits').update(fields).eq('id', id).eq('user_id', user.id)
    if (!error) fetchAll()
    return { error }
  }

  const archive = async (id) => update(id, { is_archived: true })
  const restore = async (id) => update(id, { is_archived: false })

  const remove = async (id) => {
    const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user.id)
    if (!error) fetchAll()
    return { error }
  }

  return (
    <HabitsContext.Provider value={{
      habits, archivedHabits, loading,
      create, update, archive, restore, remove,
      refresh: fetchAll,
    }}>
      {children}
    </HabitsContext.Provider>
  )
}

export const useHabitsContext = () => useContext(HabitsContext)
