import { useState } from 'react'
import { Plus, Minus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { useCategories } from '../hooks/useCategories'
import type { Category } from '../lib/types'

interface CartItem { category: Category; quantity: number }
interface Props { onClose: () => void }

export function LoanRequestForm({ onClose }: Props) {
  const { data: categories } = useCategories()
  const qc = useQueryClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addCategory(cat: Category) {
    setCart(c => {
      const existing = c.find(i => i.category.id === cat.id)
      if (existing) return c.map(i => i.category.id === cat.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...c, { category: cat, quantity: 1 }]
    })
  }

  function removeCategory(id: string) {
    setCart(c => c.filter(i => i.category.id !== id))
  }

  function changeQty(id: string, delta: number) {
    setCart(c => c.map(i => {
      if (i.category.id !== id) return i
      const qty = i.quantity + delta
      return qty <= 0 ? i : { ...i, quantity: qty }
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!cart.length) { setError('Sélectionnez au moins un article.'); return }
    setLoading(true)
    setError(null)
    const res = await supabase.functions.invoke('create-loan-request', {
      body: {
        items: cart.map(i => ({ category_id: i.category.id, quantity: i.quantity })),
        due_date: dueDate || undefined,
      },
    })
    setLoading(false)
    if (res.error) { setError(res.error.message); return }
    qc.invalidateQueries({ queryKey: ['loan_requests'] })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-bg border-2 border-fg shadow-xl w-full max-w-lg">
        <div className="bg-fg px-6 py-4 flex items-center justify-between">
          <h2 className="font-mono text-yellow font-bold text-sm uppercase tracking-tight">Nouvelle demande</h2>
          <button onClick={onClose} className="text-muted hover:text-yellow cursor-pointer"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-muted mb-2">Ajouter des articles</p>
            <div className="flex flex-wrap gap-2">
              {categories?.map(cat => (
                <button key={cat.id} type="button" onClick={() => addCategory(cat)}
                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 border-border text-muted hover:border-fg hover:text-fg cursor-pointer transition-colors">
                  + {cat.name}
                </button>
              ))}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="border-2 border-border overflow-hidden">
              {cart.map(item => (
                <div key={item.category.id} className="flex items-center justify-between px-4 py-2 border-b border-border last:border-0">
                  <span className="text-xs font-bold uppercase tracking-wide text-fg">{item.category.name}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => changeQty(item.category.id, -1)}
                      className="p-1 text-muted hover:text-fg cursor-pointer transition-colors"><Minus size={12} /></button>
                    <span className="w-6 text-center text-sm font-mono font-bold text-fg">{item.quantity}</span>
                    <button type="button" onClick={() => changeQty(item.category.id, 1)}
                      className="p-1 text-muted hover:text-fg cursor-pointer transition-colors"><Plus size={12} /></button>
                    <button type="button" onClick={() => removeCategory(item.category.id)}
                      className="p-1 text-muted hover:text-pink cursor-pointer transition-colors"><X size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">Date de retour prévue (optionnel)</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border-2 border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors" />
          </div>

          {error && <p role="alert" className="text-pink text-[10px] font-bold uppercase">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] border-2 border-border text-muted hover:border-fg hover:text-fg cursor-pointer transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg cursor-pointer disabled:opacity-50 transition-colors">
              {loading ? 'Envoi...' : 'Soumettre la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
