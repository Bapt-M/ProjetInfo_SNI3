import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { LoanRequest } from '../lib/types'
import { useAuth } from './useAuth'

export function useMyLoanRequests() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['loan_requests', 'mine', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_requests')
        .select('*, items:loan_items(*, category:categories(id,name), equipment:equipment(id,name,serial_number))')
        .eq('student_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as LoanRequest[]
    },
  })
}

export function useAllLoanRequests(statusFilter?: string) {
  return useQuery({
    queryKey: ['loan_requests', 'all', statusFilter],
    queryFn: async () => {
      let q = supabase
        .from('loan_requests')
        .select('*, student:profiles(id,full_name,email), items:loan_items(*, category:categories(id,name), equipment:equipment(id,name,serial_number))')
        .order('created_at', { ascending: false })
      if (statusFilter) q = q.eq('status', statusFilter)
      const { data, error } = await q
      if (error) throw error
      return data as LoanRequest[]
    },
  })
}
