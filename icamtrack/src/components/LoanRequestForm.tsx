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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">Nouvelle demande d'emprunt</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Ajouter des articles</p>
            <div className="flex flex-wrap gap-2">
              {categories?.map(cat => (
                <button key={cat.id} type="button" onClick={() => addCategory(cat)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm cursor-pointer">
                  + {cat.name}
                </button>
              ))}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {cart.map(item => (
                <div key={item.category.id} className="flex items-center justify-between px-4 py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-medium text-slate-700">{item.category.name}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => changeQty(item.category.id, -1)}
                      className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"><Minus size={12} /></button>
                    <span className="w-6 text-center text-sm font-mono">{item.quantity}</span>
                    <button type="button" onClick={() => changeQty(item.category.id, 1)}
                      className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"><Plus size={12} /></button>
                    <button type="button" onClick={() => removeCategory(item.category.id)}
                      className="p-1 text-red-400 hover:text-red-600 cursor-pointer"><X size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de retour prévue (optionnel)</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm bg-accent text-white rounded-lg cursor-pointer hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Envoi...' : 'Soumettre la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
