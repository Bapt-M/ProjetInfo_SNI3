import { useCallback, useMemo, useState } from 'react'
import type { Pack } from '../lib/types'

export interface CartLine {
  equipment_id: string
  equipment_name: string
  category_id: string
  quantity: number
}

export type CartEntry =
  | { kind: 'item'; equipment_name: string; category_id: string; quantity: number }
  | { kind: 'kit'; pack_id: string; pack_name: string; lines: CartLine[] }

/**
 * Panier du catalogue. Deux types d'entrées :
 *  - `item` : un composant ajouté seul, affiché par son nom et fusionné par nom.
 *  - `kit`  : un pack ajouté en bloc → un « sous-panier » dont on peut
 *             retirer/ajuster les lignes (catégories) individuellement.
 * `flatten()` aplatit le tout en `{ category_id, quantity }` pour la demande d'emprunt
 * (la demande reste par catégorie — l'admin assigne ensuite les unités physiques).
 */
export function useCart() {
  const [entries, setEntries] = useState<CartEntry[]>([])

  const addItem = useCallback((equipment_name: string, category_id: string) => {
    setEntries(prev => {
      const next = [...prev]
      const existing = next.find(
        (e): e is Extract<CartEntry, { kind: 'item' }> =>
          e.kind === 'item' && e.equipment_name === equipment_name
      )
      if (existing) existing.quantity += 1
      else next.push({ kind: 'item', equipment_name, category_id, quantity: 1 })
      return next
    })
  }, [])

  const addKit = useCallback((pack: Pack) => {
    const packLines: CartLine[] = (pack.items ?? []).map(i => ({
      equipment_id: i.equipment_id,
      equipment_name: i.equipment?.name ?? '',
      category_id: i.equipment?.category_id ?? '',
      quantity: i.quantity,
    }))
    setEntries(prev => {
      const next = [...prev]
      const existing = next.find(
        (e): e is Extract<CartEntry, { kind: 'kit' }> =>
          e.kind === 'kit' && e.pack_id === pack.id
      )
      if (existing) {
        // Incrémente le sous-panier existant ligne par ligne.
        existing.lines = [...existing.lines]
        for (const line of packLines) {
          const match = existing.lines.find(l => l.equipment_id === line.equipment_id)
          if (match) match.quantity += line.quantity
          else existing.lines.push({ ...line })
        }
      } else {
        next.push({ kind: 'kit', pack_id: pack.id, pack_name: pack.name, lines: packLines })
      }
      return next
    })
  }, [])

  const changeItemQty = useCallback((equipment_name: string, delta: number) => {
    setEntries(prev =>
      prev.map(e =>
        e.kind === 'item' && e.equipment_name === equipment_name
          ? { ...e, quantity: Math.max(1, e.quantity + delta) }
          : e
      )
    )
  }, [])

  const removeItem = useCallback((equipment_name: string) => {
    setEntries(prev => prev.filter(e => !(e.kind === 'item' && e.equipment_name === equipment_name)))
  }, [])

  const changeKitLineQty = useCallback((pack_id: string, equipment_id: string, delta: number) => {
    setEntries(prev =>
      prev.map(e => {
        if (e.kind !== 'kit' || e.pack_id !== pack_id) return e
        return {
          ...e,
          lines: e.lines.map(l =>
            l.equipment_id === equipment_id ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l
          ),
        }
      })
    )
  }, [])

  const removeKitLine = useCallback((pack_id: string, equipment_id: string) => {
    setEntries(prev =>
      prev.flatMap(e => {
        if (e.kind !== 'kit' || e.pack_id !== pack_id) return [e]
        const lines = e.lines.filter(l => l.equipment_id !== equipment_id)
        return lines.length ? [{ ...e, lines }] : []
      })
    )
  }, [])

  const removeKit = useCallback((pack_id: string) => {
    setEntries(prev => prev.filter(e => !(e.kind === 'kit' && e.pack_id === pack_id)))
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  const totalItems = useMemo(
    () =>
      entries.reduce(
        (sum, e) =>
          sum + (e.kind === 'item' ? e.quantity : e.lines.reduce((s, l) => s + l.quantity, 0)),
        0
      ),
    [entries]
  )

  const flatten = useCallback((): { category_id: string; quantity: number }[] => {
    const byCategory = new Map<string, number>()
    const add = (category_id: string, quantity: number) =>
      byCategory.set(category_id, (byCategory.get(category_id) ?? 0) + quantity)
    for (const e of entries) {
      if (e.kind === 'item') add(e.category_id, e.quantity)
      else for (const l of e.lines) add(l.category_id, l.quantity)
    }
    return [...byCategory].map(([category_id, quantity]) => ({ category_id, quantity }))
  }, [entries])

  return {
    entries,
    totalItems,
    addItem,
    addKit,
    changeItemQty,
    removeItem,
    changeKitLineQty,
    removeKitLine,
    removeKit,
    clear,
    flatten,
  }
}
