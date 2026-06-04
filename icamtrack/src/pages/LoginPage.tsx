import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { motion } from 'framer-motion'

export function LoginPage() {
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) navigate(profile.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true })
  }, [profile, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError('Email ou mot de passe incorrect.')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top bar */}
      <div className="bg-fg border-b-2 border-fg h-14 flex items-center px-8">
        <span className="font-mono font-bold text-yellow text-lg uppercase tracking-tight">IcamTrack</span>
        <span className="ml-4 text-[10px] font-bold uppercase tracking-[3px] text-muted">Gestion du matériel pédagogique</span>
      </div>
      {/* Marquee */}
      <div className="border-b-2 border-pink border-t-2 border-t-cyan h-8 overflow-hidden flex items-center bg-bg">
        <div className="flex whitespace-nowrap marquee-track">
          {[1,2].map(i => (
            <div key={i} className="flex items-center gap-8 px-12 text-[10px] font-bold uppercase tracking-widest text-muted">
              <span className="border border-cyan/40 text-cyan px-2 py-0.5">ICAM — Dépt. Informatique</span>
              <span className="border border-success/40 text-success px-2 py-0.5">Inventaire centralisé</span>
              <span className="border border-pink/40 text-pink px-2 py-0.5">Emprunts en temps réel</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm border-2 border-fg bg-bg"
        >
          {/* Card header */}
          <div className="bg-fg px-7 py-5 border-b-2 border-fg">
            <h1 className="font-mono text-yellow font-bold text-xl uppercase tracking-tight">Connexion</h1>
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-muted mt-1">Espace personnel ICAM</p>
          </div>

          <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-2">
                Email *
              </label>
              <input
                id="email" type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@icam.fr"
                className="w-full border-2 border-border bg-surface px-3 py-2.5 text-sm font-medium text-fg placeholder-muted focus:outline-none focus:border-fg transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  id="password" type={showPwd ? 'text' : 'password'} required autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-2 border-border bg-surface px-3 py-2.5 text-sm font-medium text-fg placeholder-muted focus:outline-none focus:border-fg transition-colors pr-16"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-0 top-0 h-full px-3 text-[9px] font-bold uppercase tracking-wider text-muted hover:text-fg cursor-pointer border-l-2 border-border">
                  {showPwd ? 'Cacher' : 'Voir'}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                role="alert"
                className="border-2 border-pink bg-pink/5 px-3 py-2 text-sm font-bold text-pink"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-fg text-yellow font-mono font-bold text-sm uppercase tracking-wider py-3 hover:bg-yellow hover:text-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-2 border-fg"
            >
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
