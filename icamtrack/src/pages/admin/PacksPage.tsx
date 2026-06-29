import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { usePacks, useCreatePack, useUpdatePack, useDeletePack } from '../../hooks/usePacks'
import { PackForm } from '../../components/PackForm'
import type { Pack } from '../../lib/types'

export function PacksPage() {
  const { data: packs, isLoading } = usePacks()
  const create = useCreatePack()
  const update = useUpdatePack()
  const del = useDeletePack()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Pack | null>(null)

  function openCreate() { setEditing(null); setShowForm(true) }
  function openEdit(pack: Pack) { setEditing(pack); setShowForm(true) }
  function cancel() { setShowForm(false); setEditing(null) }

  async function handleSubmit(values: { name: string; description: string; items: { equipment_id: string; quantity: number }[] }) {
    if (editing) await update.mutateAsync({ id: editing.id, ...values })
    else await create.mutateAsync(values)
    cancel()
  }

  if (isLoading) return <p className="text-muted p-8 text-[11px] font-bold uppercase">Chargement...</p>

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-[-0.5px] text-fg">Packs</h1>
          <p className="text-muted text-[11px] font-bold uppercase tracking-[2px] mt-1">
            {packs?.length ?? 0} pack(s)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] bg-fg text-yellow hover:bg-yellow hover:text-black border-2 border-fg cursor-pointer transition-colors"
        >
          <Plus size={14} /> Nouveau pack
        </button>
      </div>

      {showForm && (
        <div className="bg-surface border-2 border-border p-4 mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[3px] text-muted mb-3">
            {editing ? 'Modifier le pack' : 'Nouveau pack'}
          </h2>
          <PackForm
            key={editing?.id ?? 'new'}
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={cancel}
          />
        </div>
      )}

      <div className="bg-bg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Nom</th>
              <th className="hidden sm:table-cell text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Description</th>
              <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[2px] text-muted">Articles</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {packs?.map(pack => (
              <tr key={pack.id} className="border-b border-border hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-bold uppercase text-xs tracking-wide text-fg">{pack.name}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-muted text-xs">{pack.description ?? '—'}</td>
                <td className="px-4 py-3 text-muted text-xs font-mono">{pack.items?.length ?? 0} article(s)</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(pack)} className="p-1.5 text-muted hover:text-fg cursor-pointer transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => del.mutate(pack.id)} className="p-1.5 text-muted hover:text-pink cursor-pointer transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {packs?.length === 0 && (
          <p className="text-center text-muted py-8 text-[11px] font-bold uppercase tracking-[2px]">Aucun pack.</p>
        )}
      </div>
    </div>
  )
}
