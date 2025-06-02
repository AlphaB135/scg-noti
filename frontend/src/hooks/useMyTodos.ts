import useSWR from 'swr'
import { useAuth } from './use-auth'

// Helper to get YYYY-MM string for cache key
function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function useMyTodos(month?: string) {
  const { user } = useAuth()
  const monthKey = month || getMonthKey()
  const shouldFetch = !!user
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? [`/api/my-notifications`, monthKey] : null,
    async () => {
      const res = await fetch(`/api/my-notifications?month=${monthKey}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      // Filter: type === 'TODO' && createdBy === me
      return (json.data || []).filter(
        (n: any) => n.type === 'TODO' && n.createdBy === user?.id
      )
    },
    { revalidateOnFocus: false }
  )
  return {
    todos: data,
    isLoading,
    error,
    mutate
  }
}
