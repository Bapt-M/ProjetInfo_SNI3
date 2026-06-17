import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Pack } from '../lib/types'

export function usePacks() {
  return useQuery({
    queryKey: ['packs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packs')
        .select('*, items:pack_items(*, category:categories(id,name))')
        .order('name')
      if (error) throw error
      return data as Pack[]
    },
  })
}

export function useCreatePack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: {
      name: string
      description: string
      items: { category_id: string; quantity: number }[]
    }) => {
      const { data: pack, error: packError } = await supabase
        .from('packs')
        .insert({ name: values.name, description: values.description || null })
        .select('id')
        .single()
      if (packError) throw packError
      if (values.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('pack_items')
          .insert(values.items.map(i => ({ pack_id: pack.id, category_id: i.category_id, quantity: i.quantity })))
        if (itemsError) throw itemsError
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packs'] }),
  })
}

export function useUpdatePack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: {
      id: string
      name: string
      description: string
      items: { category_id: string; quantity: number }[]
    }) => {
      const { error: packError } = await supabase
        .from('packs')
        .update({ name: values.name, description: values.description || null })
        .eq('id', values.id)
      if (packError) throw packError

      const { error: deleteError } = await supabase
        .from('pack_items')
        .delete()
        .eq('pack_id', values.id)
      if (deleteError) throw deleteError

      if (values.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('pack_items')
          .insert(values.items.map(i => ({ pack_id: values.id, category_id: i.category_id, quantity: i.quantity })))
        if (itemsError) throw itemsError
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packs'] }),
  })
}

export function useDeletePack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('packs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packs'] }),
  })
}
