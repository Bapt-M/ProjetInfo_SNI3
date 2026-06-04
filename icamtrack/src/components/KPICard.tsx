import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  label: string
  value: number
  color?: 'default' | 'yellow' | 'pink' | 'cyan' | 'orange' | 'purple'
}

const colorMap = {
  default: { bar: '#09090B', value: 'text-fg',       sub: 'text-muted' },
  yellow:  { bar: '#DFE104', value: 'text-fg',        sub: 'text-yellow-text' },
  pink:    { bar: '#FF2D78', value: 'text-pink',      sub: 'text-pink' },
  cyan:    { bar: '#00C8E0', value: 'text-fg',        sub: 'text-cyan' },
  orange:  { bar: '#FF6B00', value: 'text-orange',    sub: 'text-orange' },
  purple:  { bar: '#7C3AED', value: 'text-purple',    sub: 'text-purple' },
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 700
    const start = Date.now()
    const timer = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1)
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <>{display}</>
}

export function KPICard({ label, value, color = 'default' }: Props) {
  const c = colorMap[color]
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
      }}
      whileHover={{ y: -2, transition: { duration: 0.12 } }}
      className="bg-bg border-r border-border p-7 cursor-default relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: c.bar }} />
      <div className="text-[11px] font-bold uppercase tracking-[3px] text-muted mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: c.bar }} />
        {label}
      </div>
      <div className={`text-6xl font-bold font-mono leading-none tabular-nums ${c.value}`}>
        <AnimatedCounter value={value} />
      </div>
    </motion.div>
  )
}
