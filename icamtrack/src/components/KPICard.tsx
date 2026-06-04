interface Props {
  label: string
  value: number
  color?: 'green' | 'amber' | 'red' | 'slate'
}

const colors = {
  green: 'border-l-emerald-500 text-emerald-600',
  amber: 'border-l-amber-500 text-amber-600',
  red: 'border-l-red-500 text-red-600',
  slate: 'border-l-slate-400 text-slate-600',
}

export function KPICard({ label, value, color = 'slate' }: Props) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${colors[color]} p-4`}>
      <p className="text-2xl font-bold font-mono">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  )
}
