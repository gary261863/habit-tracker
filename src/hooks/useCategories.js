import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    setCategories(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const create = async ({ name, color, emoji }) => {
    const { error } = await supabase.from('categories').insert({
      user_id: user.id, name, color, emoji,
    })
    if (!error) fetch()
    return { error }
  }

  const update = async (id, fields) => {
    const { error } = await supabase.from('categories').update(fields).eq('id', id).eq('user_id', user.id)
    if (!error) fetch()
    return { error }
  }

  const remove = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', user.id)
    if (!error) fetch()
    return { error }
  }

  return { categories, loading, create, update, remove, refresh: fetch }
}
