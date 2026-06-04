import { motion } from 'framer-motion'

interface Props {
  available: number
  borrowed: number
  unavailable: number
}

export function StatusDonut({ available, borrowed, unavailable }: Props) {
  const total = available + borrowed + unavailable || 1
  const bars = [
    { label: 'Disponible',   value: available,   color: '#00C060', pct: Math.round(available / total * 100) },
    { label: 'Emprunté',     value: borrowed,    color: '#B8980A', pct: Math.round(borrowed  / total * 100) },
    { label: 'Indisponible', value: unavailable, color: '#FF2D78', pct: Math.round(unavailable / total * 100) },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="bg-bg border border-border p-6"
    >
      <p className="text-[10px] font-bold uppercase tracking-[3px] text-muted border-b border-border pb-3 mb-5">
        Répartition des statuts
      </p>
      <div className="space-y-4">
        {bars.map(bar => (
          <div key={bar.label}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: bar.color }}>
                {bar.label}
              </span>
              <span className="font-mono text-sm font-bold text-fg tabular-nums">{bar.value}</span>
            </div>
            <div className="h-[3px] bg-border w-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bar.pct}%` }}
                transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                className="h-full"
                style={{ background: bar.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
