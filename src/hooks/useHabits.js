import { useHabitsContext } from '../context/HabitsContext'

export function useHabits() {
  const { habits, loading, create, update, archive, remove, refresh } = useHabitsContext()
  return { habits, loading, create, update, archive, remove, refresh }
}

export function useArchivedHabits() {
  const { archivedHabits, restore, remove, refresh } = useHabitsContext()
  return { archivedHabits, restore, remove: (id) => remove(id), refresh }
}
