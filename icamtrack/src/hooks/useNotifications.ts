import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { AppNotification } from '../lib/types'

/**
 * Notifications in-app de l'utilisateur courant.
 * Requête initiale + abonnement Realtime (INSERT/UPDATE filtré sur user_id)
 * pour alimenter la cloche en temps réel.
 */
export function useNotifications() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)
      if (error) throw error
      return data as AppNotification[]
    },
  })

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ['notifications', user.id] }),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, qc])

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  })

  const notifications = query.data ?? []
  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, unreadCount, isLoading: query.isLoading, markRead, markAllRead }
}
