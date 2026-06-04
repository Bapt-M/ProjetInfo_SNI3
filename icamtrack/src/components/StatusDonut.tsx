import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  available: number
  borrowed: number
  unavailable: number
}

const COLORS = ['#059669', '#F59E0B', '#DC2626']

export function StatusDonut({ available, borrowed, unavailable }: Props) {
  const data = [
    { name: 'Disponible', value: available },
    { name: 'Emprunté', value: borrowed },
    { name: 'Indisponible', value: unavailable },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="font-medium text-slate-700 mb-3 text-sm">Répartition des statuts</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
            {data.map((_, i) => <Cell key={String(i)} fill={COLORS[i]} />)}
          </Pie>
          <Tooltip formatter={(v: unknown) => [`${v} item(s)`, '']} />
          <Legend iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
