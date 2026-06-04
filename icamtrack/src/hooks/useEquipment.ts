import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Equipment, EquipmentStatus } from '../lib/types'

export function useEquipment(filters?: { categoryId?: string; status?: EquipmentStatus }) {
  return useQuery({
    queryKey: ['equipment', filters],
    queryFn: async () => {
      let q = supabase.from('equipment').select('*, category:categories(id,name)').order('name')
      if (filters?.categoryId) q = q.eq('category_id', filters.categoryId)
      if (filters?.status) q = q.eq('status', filters.status)
      const { data, error } = await q
      if (error) throw error
      return data as Equipment[]
    },
  })
}

export function useCreateEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: Omit<Equipment, 'id' | 'created_at' | 'category'>) => {
      const { error } = await supabase.from('equipment').insert(values)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment'] }),
  })
}

export function useUpdateEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Equipment> & { id: string }) => {
      const { error } = await supabase.from('equipment').update(values).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment'] }),
  })
}

export function useDeleteEquipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('equipment').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipment'] }),
  })
}
