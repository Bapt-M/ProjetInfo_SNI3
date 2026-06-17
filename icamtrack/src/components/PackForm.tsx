import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import type { Pack } from '../lib/types'

interface PackFormItem { category_id: string; quantity: number }

interface Props {
  defaultValues?: Pack
  onSubmit: (values: { name: string; description: string; items: PackFormItem[] }) => Promise<void>
  onCancel: () => void
}

export function PackForm({ defaultValues, onSubmit, onCancel }: Props) {
  const { data: categories } = useCategories()
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [items, setItems] = useState<PackFormItem[]>(
    defaultValues?.items?.map(i => ({ category_id: i.category_id, quantity: i.quantity })) ?? []
  )
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function addItem() {
    const firstUnused = categories?.find(c => !items.some(i => i.category_id === c.id))
    if (!firstUnused) return
    setItems(prev => [...prev, { category_id: firstUnused.id, quantity: 1 }])
  }

  function updateCategory(index: number, category_id: string) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, category_id } : item))
  }

  function changeQty(index: number, delta: number) {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ))
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!name.trim()) { setFormError('Le nom est requis.'); return }
    if (items.length === 0) { setFormError('Ajoutez au moins un article.'); return }
    const hasDuplicate = items.some(
      (item, i) => items.findIndex(x => x.category_id === item.category_id) !== i
    )
    if (hasDuplicate) { setFormError('Deux articles ne peuvent pas avoir la même catégorie.'); return }
    setSubmitting(true)
    await onSubmit({ name: name.trim(), description: description.trim(), items })
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">Nom *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border-2 border-border bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">Description</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border-2 border-border bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted">Articles du pack</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[2px] text-fg border border-border hover:border-fg px-2 py-1 cursor-pointer transition-colors"
          >
            <Plus size={11} /> Ajouter
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-muted text-[11px] font-bold uppercase py-3 border border-dashed border-border text-center">
            Aucun article — cliquez sur Ajouter
          </p>
        )}

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 border border-border p-2">
              <select
                value={item.category_id}
                onChange={e => updateCategory(index, e.target.value)}
                className="flex-1 bg-bg border-2 border-border px-2 py-1.5 text-sm text-fg focus:outline-none focus:border-fg transition-colors"
              >
                {categories?.map(c => (
                  <option
                    key={c.id}
                    value={c.id}
                    disabled={c.id !== item.category_id && items.some(i => i.category_id === c.id)}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => changeQty(index, -1)}
                  className="w-7 h-7 flex items-center justify-center border border-border text-muted hover:text-fg cursor-pointer transition-colors text-sm"
                >−</button>
                <span className="w-6 text-center text-sm font-mono font-bold text-fg">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQty(index, 1)}
                  className="w-7 h-7 flex items-center justify-center border border-border text-muted hover:text-fg cursor-pointer transition-colors text-sm"
                >+</button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-1.5 text-muted hover:text-pink cursor-pointer transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {formError && <p role="alert" className="text-pink text-[10px] font-bold uppercase">{formError}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] border-2 border-border text-muted hover:border-fg hover:text-fg cursor-pointer transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg disabled:opacity-50 cursor-pointer transition-colors"
        >
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
