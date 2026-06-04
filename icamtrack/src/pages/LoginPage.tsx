import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'

export function LoginPage() {
  const { signIn, signUp, profile } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) navigate(profile.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true })
  }, [profile, navigate])

  function switchMode(next: 'login' | 'signup') {
    setMode(next)
    setError(null)
    setFullName('')
    setEmail('')
    setPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      setLoading(false)
      if (error) setError('Email ou mot de passe incorrect.')
    } else {
      if (fullName.trim().length < 2) {
        setLoading(false)
        setError('Entrez votre nom complet.')
        return
      }
      const { error } = await signUp(email, password, fullName.trim())
      setLoading(false)
      if (error) {
        setError(error.message.includes('already registered')
          ? 'Cet email est déjà utilisé. Connectez-vous.'
          : 'Erreur lors de la création du compte.')
        return
      }
      // Auto sign-in après inscription
      const { error: loginErr } = await signIn(email, password)
      if (loginErr) setError('Compte créé. Connectez-vous maintenant.')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top bar */}
      <div className="bg-fg h-14 flex items-center px-8">
        <span className="font-mono font-bold text-yellow text-lg uppercase tracking-tight">IcamTrack</span>
        <span className="ml-4 text-[10px] font-bold uppercase tracking-[3px] text-muted">Gestion du matériel pédagogique</span>
      </div>

      {/* Marquee */}
      <div className="border-b-2 border-pink border-t-2 border-t-cyan h-8 overflow-hidden flex items-center bg-bg">
        <div className="flex whitespace-nowrap marquee-track">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-16 px-32 text-[10px] font-bold uppercase tracking-widest text-muted">
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
          {/* Mode tabs */}
          <div className="flex border-b-2 border-fg">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-[2px] cursor-pointer transition-colors ${
                mode === 'login' ? 'bg-fg text-yellow' : 'bg-bg text-muted hover:text-fg'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-[2px] cursor-pointer transition-colors border-l-2 border-fg ${
                mode === 'signup' ? 'bg-fg text-yellow' : 'bg-bg text-muted hover:text-fg'
              }`}
            >
              Créer un compte
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'signup' ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="px-7 py-6 space-y-5"
            >
              {mode === 'signup' && (
                <div>
                  <label htmlFor="fullName" className="block text-[10px] font-bold uppercase tracking-[2px] text-muted mb-2">
                    Nom complet *
                  </label>
                  <input
                    id="fullName" type="text" required
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Prénom Nom"
                    autoComplete="name"
                    className="w-full border-2 border-border bg-surface px-3 py-2.5 text-sm font-medium text-fg placeholder-muted focus:outline-none focus:border-fg transition-colors"
                  />
                </div>
              )}

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
                  Mot de passe *{mode === 'signup' && <span className="text-muted font-normal normal-case tracking-normal"> (min. 6 caractères)</span>}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={mode === 'signup' ? 6 : undefined}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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
                {loading
                  ? (mode === 'login' ? 'Connexion...' : 'Création...')
                  : (mode === 'login' ? 'Se connecter →' : 'Créer mon compte →')
                }
              </button>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
