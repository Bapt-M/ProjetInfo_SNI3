import { useState } from 'react'
import { Package, ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react'
import { useEquipment } from '../../hooks/useEquipment'
import { useCategories } from '../../hooks/useCategories'
import { usePacks } from '../../hooks/usePacks'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import type { EquipmentStatus } from '../../lib/types'

const statusLabel: Record<EquipmentStatus, { label: string; color: string }> = {
  available:   { label: 'Disponible',   color: 'border border-success text-success' },
  borrowed:    { label: 'Emprunté',     color: 'border border-yellow-text text-yellow-text' },
  unavailable: { label: 'Indisponible', color: 'border border-pink text-pink' },
}

interface CartItem { category_id: string; category_name: string; quantity: number }

export function CataloguePage() {
  const [filterCat, setFilterCat] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [dueDate, setDueDate] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: equipment, isLoading } = useEquipment({ categoryId: filterCat || undefined })
  const { data: categories } = useCategories()
  const { data: packs } = usePacks()
  const qc = useQueryClient()

  function addToCart(items: CartItem[]) {
    setCart(prev => {
      const next = [...prev]
      for (const item of items) {
        const existing = next.find(i => i.category_id === item.category_id)
        if (existing) existing.quantity += item.quantity
        else next.push({ ...item })
      }
      return next
    })
  }

  function removeFromCart(category_id: string) {
    setCart(c => c.filter(i => i.category_id !== category_id))
  }

  function changeQty(category_id: string, delta: number) {
    setCart(c => c.map(i =>
      i.category_id !== category_id ? i : { ...i, quantity: Math.max(1, i.quantity + delta) }
    ))
  }

  async function submitCart(e: React.FormEvent) {
    e.preventDefault()
    if (!cart.length) return
    setLoading(true)
    setError(null)
    const res = await supabase.functions.invoke('create-loan-request', {
      body: {
        items: cart.map(i => ({ category_id: i.category_id, quantity: i.quantity })),
        due_date: dueDate || undefined,
      },
    })
    setLoading(false)
    if (res.error) { setError(res.error.message); return }
    qc.invalidateQueries({ queryKey: ['loan_requests'] })
    setCart([])
    setDueDate('')
    setCartOpen(false)
  }

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)
  const today = new Date().toISOString().split('T')[0]

  const cartPanel = (
    <form onSubmit={submitCart} className="bg-surface border-2 border-fg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[3px] text-muted">Panier</span>
        <span className="font-mono text-xs font-bold text-fg">{totalItems} article{totalItems > 1 ? 's' : ''}</span>
      </div>

      {cart.length === 0 && (
        <p className="text-muted text-[11px] font-bold uppercase tracking-[2px] py-4 text-center border border-dashed border-border">
          Panier vide
        </p>
      )}

      {cart.map(item => (
        <div key={item.category_id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
          <span className="text-xs font-bold uppercase tracking-wide text-fg flex-1 min-w-0 truncate">{item.category_name}</span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <button type="button" onClick={() => changeQty(item.category_id, -1)}
              className="p-1 text-muted hover:text-fg cursor-pointer transition-colors"><Minus size={11} /></button>
            <span className="w-5 text-center text-xs font-mono font-bold text-fg">{item.quantity}</span>
            <button type="button" onClick={() => changeQty(item.category_id, 1)}
              className="p-1 text-muted hover:text-fg cursor-pointer transition-colors"><Plus size={11} /></button>
            <button type="button" onClick={() => removeFromCart(item.category_id)}
              className="p-1 text-muted hover:text-pink cursor-pointer transition-colors"><Trash2 size={11} /></button>
          </div>
        </div>
      ))}

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-1.5">
          Retour prévu (optionnel)
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          min={today}
          className="w-full border-2 border-border bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg transition-colors"
        />
      </div>

      {error && <p role="alert" className="text-pink text-[10px] font-bold uppercase">{error}</p>}

      <button
        type="submit"
        disabled={!cart.length || loading}
        className="w-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg disabled:opacity-40 cursor-pointer transition-colors"
      >
        {loading ? 'Envoi...' : 'Soumettre la demande'}
      </button>
    </form>
  )

  return (
    <div>
      {/* Section packs */}
      {packs && packs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[3px] text-muted mb-3">Packs disponibles</h2>
          <div className="flex flex-col gap-2">
            {packs.map(pack => (
              <div key={pack.id} className="bg-bg border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-surface transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-bold uppercase text-xs tracking-wide text-fg">{pack.name}</p>
                  {pack.description && <p className="text-[10px] text-muted mt-0.5">{pack.description}</p>}
                  <p className="text-[10px] text-muted font-mono mt-1">
                    {pack.items?.map(i => `${i.category?.name} ×${i.quantity}`).join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(
                    (pack.items ?? []).map(i => ({
                      category_id: i.category_id,
                      category_name: i.category?.name ?? '',
                      quantity: i.quantity,
                    }))
                  )}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] border-2 border-fg text-fg hover:bg-fg hover:text-yellow cursor-pointer transition-colors"
                >
                  <ShoppingCart size={12} /> Ajouter au panier
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* Catalogue */}
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg mb-4">Catalogue</h1>

          <div className="mb-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCat('')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 cursor-pointer transition-colors ${!filterCat ? 'bg-fg text-yellow border-fg' : 'border-border text-muted hover:border-fg hover:text-fg'}`}
            >
              Tout
            </button>
            {categories?.map(c => (
              <button
                key={c.id}
                onClick={() => setFilterCat(c.id)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 cursor-pointer transition-colors ${filterCat === c.id ? 'bg-fg text-yellow border-fg' : 'border-border text-muted hover:border-fg hover:text-fg'}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-muted text-[11px] font-bold uppercase">Chargement...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {equipment?.map(eq => {
                const s = statusLabel[eq.status]
                return (
                  <div key={eq.id} className="bg-bg border border-border p-4 hover:bg-surface transition-colors flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <Package size={18} className="text-muted mt-0.5" />
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] ${s.color}`}>{s.label}</span>
                    </div>
                    <p className="font-bold uppercase text-xs tracking-wide text-fg">{eq.name}</p>
                    <p className="text-[10px] text-muted mt-1">{eq.category?.name}</p>
                    {eq.serial_number && <p className="text-[10px] text-muted font-mono mt-1">#{eq.serial_number}</p>}
                    {eq.status === 'available' && (
                      <button
                        type="button"
                        onClick={() => addToCart([{
                          category_id: eq.category_id,
                          category_name: eq.category?.name ?? '',
                          quantity: 1,
                        }])}
                        className="mt-auto pt-3 w-full text-[9px] font-bold uppercase tracking-[1px] border border-border text-muted hover:border-fg hover:text-fg px-2 py-1 cursor-pointer transition-colors"
                      >
                        + Panier
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Panier sticky — desktop */}
        <div className="hidden lg:block sticky top-24">
          {cartPanel}
        </div>
      </div>

      {/* Bouton flottant panier — mobile */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 right-4 lg:hidden flex items-center gap-2 px-4 py-3 bg-fg text-yellow font-bold text-[11px] uppercase tracking-[2px] shadow-lg z-30 cursor-pointer"
        >
          <ShoppingCart size={14} /> Panier ({totalItems})
        </button>
      )}

      {/* Drawer panier — mobile */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden max-h-[80vh] overflow-y-auto bg-bg border-t-2 border-fg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-[10px] font-bold uppercase tracking-[3px] text-muted">Mon panier</span>
              <button onClick={() => setCartOpen(false)} className="text-muted hover:text-fg cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              {cartPanel}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
