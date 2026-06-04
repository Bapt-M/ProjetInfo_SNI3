import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [
        { count: total },
        { count: available },
        { count: borrowed },
        { count: unavailable },
        { count: pending },
        { data: activeLate },
      ] = await Promise.all([
        supabase.from('equipment').select('*', { count: 'exact', head: true }),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'borrowed'),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'unavailable'),
        supabase.from('loan_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('loan_requests')
          .select('id, due_date')
          .eq('status', 'active')
          .not('due_date', 'is', null)
          .lt('due_date', new Date().toISOString().split('T')[0]),
      ])

      return {
        total: total ?? 0,
        available: available ?? 0,
        borrowed: borrowed ?? 0,
        unavailable: unavailable ?? 0,
        pending: pending ?? 0,
        late: activeLate?.length ?? 0,
      }
    },
  })
}
