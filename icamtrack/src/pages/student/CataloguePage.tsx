import { useMemo, useState } from 'react'
import { Package, ShoppingCart, Plus, Minus, Trash2, X, Boxes } from 'lucide-react'
import { useEquipment } from '../../hooks/useEquipment'
import { useCategories } from '../../hooks/useCategories'
import { usePacks } from '../../hooks/usePacks'
import { useCart } from '../../hooks/useCart'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

const KITS_TAB = '__kits__'

export function CataloguePage() {
  const [filterCat, setFilterCat] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const showKits = filterCat === KITS_TAB
  const { data: equipment, isLoading } = useEquipment({
    categoryId: showKits ? undefined : filterCat || undefined,
  })
  const { data: categories } = useCategories()
  const { data: packs } = usePacks()
  const cart = useCart()
  const qc = useQueryClient()

  // Regroupe les unités par produit (nom) et compte le stock disponible.
  const products = useMemo(() => {
    const map = new Map<string, { name: string; category_id: string; category_name: string; total: number; available: number }>()
    for (const eq of equipment ?? []) {
      const g = map.get(eq.name) ?? {
        name: eq.name,
        category_id: eq.category_id,
        category_name: eq.category?.name ?? '',
        total: 0,
        available: 0,
      }
      g.total += 1
      if (eq.status === 'available') g.available += 1
      map.set(eq.name, g)
    }
    return [...map.values()]
  }, [equipment])

  async function submitCart(e: React.FormEvent) {
    e.preventDefault()
    const items = cart.flatten()
    if (!items.length) return
    setLoading(true)
    setError(null)
    const res = await supabase.functions.invoke('create-loan-request', {
      body: { items, due_date: dueDate || undefined },
    })
    setLoading(false)
    if (res.error) { setError(res.error.message); return }
    qc.invalidateQueries({ queryKey: ['loan_requests'] })
    cart.clear()
    setDueDate('')
    setCartOpen(false)
  }

  const today = new Date().toISOString().split('T')[0]

  const cartPanel = (
    <form onSubmit={submitCart} className="bg-surface border-2 border-fg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[3px] text-muted">Panier</span>
        <span className="font-mono text-xs font-bold text-fg">{cart.totalItems} article{cart.totalItems > 1 ? 's' : ''}</span>
      </div>

      {cart.entries.length === 0 && (
        <p className="text-muted text-[11px] font-bold uppercase tracking-[2px] py-4 text-center border border-dashed border-border">
          Panier vide
        </p>
      )}

      {cart.entries.map(entry =>
        entry.kind === 'item' ? (
          <div key={`item-${entry.equipment_name}`} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
            <span className="text-xs font-bold uppercase tracking-wide text-fg flex-1 min-w-0 truncate">{entry.equipment_name}</span>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <button type="button" onClick={() => cart.changeItemQty(entry.equipment_name, -1)}
                className="p-1 text-muted hover:text-fg cursor-pointer transition-colors"><Minus size={11} /></button>
              <span className="w-5 text-center text-xs font-mono font-bold text-fg">{entry.quantity}</span>
              <button type="button" onClick={() => cart.changeItemQty(entry.equipment_name, 1)}
                className="p-1 text-muted hover:text-fg cursor-pointer transition-colors"><Plus size={11} /></button>
              <button type="button" onClick={() => cart.removeItem(entry.equipment_name)}
                className="p-1 text-muted hover:text-pink cursor-pointer transition-colors"><Trash2 size={11} /></button>
            </div>
          </div>
        ) : (
          <div key={`kit-${entry.pack_id}`} className="border border-fg bg-bg p-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-fg flex items-center gap-1.5 min-w-0">
                <Boxes size={12} className="shrink-0" />
                <span className="truncate">{entry.pack_name}</span>
              </span>
              <button type="button" onClick={() => cart.removeKit(entry.pack_id)}
                className="p-1 text-muted hover:text-pink cursor-pointer transition-colors shrink-0" title="Retirer le pack"><X size={12} /></button>
            </div>
            {entry.lines.map(line => (
              <div key={line.equipment_id} className="flex items-center justify-between pl-2 border-l border-border">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted flex-1 min-w-0 truncate">{line.equipment_name}</span>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <button type="button" onClick={() => cart.changeKitLineQty(entry.pack_id, line.equipment_id, -1)}
                    className="p-1 text-muted hover:text-fg cursor-pointer transition-colors"><Minus size={10} /></button>
                  <span className="w-5 text-center text-xs font-mono font-bold text-fg">{line.quantity}</span>
                  <button type="button" onClick={() => cart.changeKitLineQty(entry.pack_id, line.equipment_id, 1)}
                    className="p-1 text-muted hover:text-fg cursor-pointer transition-colors"><Plus size={10} /></button>
                  <button type="button" onClick={() => cart.removeKitLine(entry.pack_id, line.equipment_id)}
                    className="p-1 text-muted hover:text-pink cursor-pointer transition-colors" title="Retirer l'article du pack"><Trash2 size={10} /></button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

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
        disabled={cart.totalItems === 0 || loading}
        className="w-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg disabled:opacity-40 cursor-pointer transition-colors"
      >
        {loading ? 'Envoi...' : 'Soumettre la demande'}
      </button>
    </form>
  )

  const hasKits = !!packs && packs.length > 0

  return (
    <div>
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
            {hasKits && (
              <button
                onClick={() => setFilterCat(KITS_TAB)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] border-2 cursor-pointer transition-colors ${showKits ? 'bg-fg text-yellow border-fg' : 'border-border text-muted hover:border-fg hover:text-fg'}`}
              >
                <Boxes size={12} /> Packs
              </button>
            )}
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

          {showKits ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {packs?.map(pack => (
                <div key={pack.id} className="bg-bg border border-border p-4 hover:bg-surface transition-colors flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <Boxes size={18} className="text-muted mt-0.5" />
                  </div>
                  <p className="font-bold uppercase text-xs tracking-wide text-fg">{pack.name}</p>
                  {pack.description && <p className="text-[10px] text-muted mt-0.5">{pack.description}</p>}
                  <ul className="mt-2 flex flex-col gap-1">
                    {pack.items?.map(i => (
                      <li key={i.id} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-muted border-b border-border pb-1 last:border-0">
                        <span className="truncate">{i.equipment?.name}</span>
                        <span className="font-mono shrink-0 ml-2 text-fg">×{i.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => cart.addKit(pack)}
                    className="mt-3 w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[2px] border-2 border-fg text-fg hover:bg-fg hover:text-yellow px-4 py-2 cursor-pointer transition-colors"
                  >
                    <ShoppingCart size={12} /> Ajouter au panier
                  </button>
                </div>
              ))}
            </div>
          ) : isLoading ? (
            <p className="text-muted text-[11px] font-bold uppercase">Chargement...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {products.map(p => (
                <div key={p.name} className="bg-bg border border-border p-4 hover:bg-surface transition-colors flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <Package size={18} className="text-muted mt-0.5" />
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] ${p.available > 0 ? 'border border-success text-success' : 'border border-pink text-pink'}`}>
                      {p.available > 0 ? 'Disponible' : 'Épuisé'}
                    </span>
                  </div>
                  <p className="font-bold uppercase text-xs tracking-wide text-fg">{p.name}</p>
                  <p className="text-[10px] text-muted mt-1">{p.category_name}</p>
                  <p className="text-[10px] text-muted font-mono mt-1">
                    {p.available} / {p.total} disponible{p.total > 1 ? 's' : ''}
                  </p>
                  {p.available > 0 && (
                    <button
                      type="button"
                      onClick={() => cart.addItem(p.name, p.category_id)}
                      className="mt-auto pt-3 w-full text-[9px] font-bold uppercase tracking-[1px] border border-border text-muted hover:border-fg hover:text-fg px-2 py-1 cursor-pointer transition-colors"
                    >
                      + Panier
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panier sticky — desktop */}
        <div className="hidden lg:block sticky top-24">
          {cartPanel}
        </div>
      </div>

      {/* Bouton flottant panier — mobile */}
      {cart.totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 right-4 lg:hidden flex items-center gap-2 px-4 py-3 bg-fg text-yellow font-bold text-[11px] uppercase tracking-[2px] shadow-lg z-30 cursor-pointer"
        >
          <ShoppingCart size={14} /> Panier ({cart.totalItems})
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
