import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useAdmin() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [allowedEmails, setAllowedEmails] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.rpc('get_all_profiles')
    setUsers(data || [])
    setLoading(false)
  }, [])

  const fetchAllowedEmails = useCallback(async () => {
    const { data } = await supabase
      .from('allowed_emails')
      .select('*')
      .order('created_at', { ascending: false })
    setAllowedEmails(data || [])
  }, [])

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchAllowedEmails()])
  }, [fetchUsers, fetchAllowedEmails])

  const toggleActive = async (userId, currentValue) => {
    await supabase.rpc('admin_set_user_active', {
      target_user_id: userId,
      new_value: !currentValue
    })
    fetchUsers()
  }

  const deleteUser = async (userId) => {
    await supabase.rpc('admin_delete_user', { target_user_id: userId })
    fetchUsers()
  }

  const addAllowedEmail = async (email) => {
    const { error } = await supabase
      .from('allowed_emails')
      .insert({ email: email.toLowerCase().trim(), added_by: user.id })
    if (!error) fetchAllowedEmails()
    return { error }
  }

  const removeAllowedEmail = async (id) => {
    await supabase.from('allowed_emails').delete().eq('id', id)
    fetchAllowedEmails()
  }

  const fetchGlobalStats = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_admin_stats')
    if (error || !data) return null
    return data
  }, [])

  return {
    users, allowedEmails, loading,
    fetchAll, fetchUsers, fetchAllowedEmails,
    toggleActive, deleteUser,
    addAllowedEmail, removeAllowedEmail,
    fetchGlobalStats,
  }
}
