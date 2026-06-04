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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
          <input {...register('name')}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie *</label>
          <select {...register('category_id')}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Sélectionner...</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">N° de série</label>
          <input {...register('serial_number')}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
          <select {...register('status')}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="available">Disponible</option>
            <option value="borrowed">Emprunté</option>
            <option value="unavailable">Indisponible</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea {...register('notes')} rows={2}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
          Annuler
        </button>
        <button type="submit" disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
