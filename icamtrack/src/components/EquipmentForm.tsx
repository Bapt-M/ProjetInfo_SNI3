import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCategories } from '../hooks/useCategories'
import type { Equipment } from '../lib/types'

const schema = z.object({
  name: z.string().min(1, 'Nom requis'),
  category_id: z.string().uuid('Catégorie requise'),
  serial_number: z.string().optional(),
  status: z.enum(['available', 'borrowed', 'unavailable']),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<Equipment>
  onSubmit: (values: FormValues) => Promise<void>
  onCancel: () => void
}

export function EquipmentForm({ defaultValues, onSubmit, onCancel }: Props) {
  const { data: categories } = useCategories()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      category_id: defaultValues?.category_id ?? '',
      serial_number: defaultValues?.serial_number ?? '',
      status: defaultValues?.status ?? 'available',
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">Nom *</label>
          <input {...register('name')}
            className="w-full border-2 border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors" />
          {errors.name && <p className="text-pink text-[10px] font-bold uppercase mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">Catégorie *</label>
          <select {...register('category_id')}
            className="w-full border-2 border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors">
            <option value="">Sélectionner...</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category_id && <p className="text-pink text-[10px] font-bold uppercase mt-1">{errors.category_id.message}</p>}
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">N° de série</label>
          <input {...register('serial_number')}
            className="w-full border-2 border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">Statut</label>
          <select {...register('status')}
            className="w-full border-2 border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors">
            <option value="available">Disponible</option>
            <option value="borrowed">Emprunté</option>
            <option value="unavailable">Indisponible</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">Notes</label>
        <textarea {...register('notes')} rows={2}
          className="w-full border-2 border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors" />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] border-2 border-border hover:border-fg cursor-pointer text-muted hover:text-fg transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={isSubmitting}
          className="px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg disabled:opacity-50 cursor-pointer transition-colors">
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
