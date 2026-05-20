'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Zap, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const RULES = [
  { label: '8 caractères minimum',      test: (p: string) => p.length >= 8 },
  { label: '1 lettre majuscule',         test: (p: string) => /[A-Z]/.test(p) },
  { label: '1 chiffre',                  test: (p: string) => /[0-9]/.test(p) },
  { label: '1 caractère spécial',        test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function ChangePasswordPage() {
  const { update } = useSession()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const allRulesPassed = RULES.every((r) => r.test(password))
  const canSubmit = allRulesPassed && password === confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/change-password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    const data = await res.json()
    setDone(true)

    // 1. Mettre à jour le token JWT côté client
    await update({ mustChangePassword: false })
    // 2. Laisser le temps à la session de se propager
    await new Promise((r) => setTimeout(r, 500))
    // 3. Rechargement complet → middleware relira le nouveau token
    window.location.href = data.redirectTo
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Décorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-or/4 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-light-text/8 dark:border-dark-text/8 bg-light-surface dark:bg-dark-surface p-8 shadow-2xl shadow-black/20">
          {/* Logo */}
          <div className="flex items-center gap-2 font-syne font-bold text-xl mb-8">
            <Zap className="text-accent" size={20} />
            <span className="text-light-text dark:text-white">Deck</span><span className="text-or">Train</span>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-4 py-6"
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-accent" />
                </div>
                <h2 className="font-syne text-xl font-bold text-light-text dark:text-dark-text">
                  Mot de passe mis à jour
                </h2>
                <p className="text-sm text-text-secondary">Redirection en cours…</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-6">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-or/8 border border-or/20 mb-4">
                    <Lock size={14} className="text-or flex-shrink-0" />
                    <p className="text-xs text-or">Vous devez définir un nouveau mot de passe avant de continuer.</p>
                  </div>
                  <h1 className="font-syne text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                    Nouveau mot de passe
                  </h1>
                  <p className="text-sm text-text-secondary">Choisissez un mot de passe sécurisé.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Champ mot de passe */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Nouveau mot de passe</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text/40 dark:text-dark-text/40 pointer-events-none">
                        <Lock size={14} />
                      </span>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        className="w-full rounded-xl pl-10 pr-11 py-3 text-sm bg-light-text/5 dark:bg-dark-text/5 border border-light-text/10 dark:border-dark-text/10 text-light-text dark:text-dark-text placeholder:text-light-text/30 dark:placeholder:text-dark-text/30 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text/40 dark:text-dark-text/40 hover:text-accent transition-colors"
                        tabIndex={-1}
                      >
                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Règles de complexité */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-2 gap-1.5"
                    >
                      {RULES.map((rule) => (
                        <div key={rule.label} className={`flex items-center gap-1.5 text-xs transition-colors ${rule.test(password) ? 'text-accent' : 'text-text-muted'}`}>
                          <Check size={11} className={rule.test(password) ? 'opacity-100' : 'opacity-30'} />
                          {rule.label}
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Confirmation */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Confirmer le mot de passe</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text/40 dark:text-dark-text/40 pointer-events-none">
                        <Lock size={14} />
                      </span>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        required
                        className={`w-full rounded-xl pl-10 py-3 text-sm bg-light-text/5 dark:bg-dark-text/5 border text-light-text dark:text-dark-text placeholder:text-light-text/30 dark:placeholder:text-dark-text/30 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all ${
                          confirm && password !== confirm
                            ? 'border-red-500/40'
                            : 'border-light-text/10 dark:border-dark-text/10'
                        }`}
                        placeholder="Répétez le mot de passe"
                      />
                    </div>
                    {confirm && password !== confirm && (
                      <p className="text-xs text-red-400">Les mots de passe ne correspondent pas.</p>
                    )}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
                      >
                        <AlertCircle size={15} className="flex-shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    disabled={loading || !canSubmit}
                  >
                    {loading ? (
                      <><Loader2 size={15} className="animate-spin" />Enregistrement…</>
                    ) : (
                      'Définir le nouveau mot de passe'
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 text-xs text-light-text/30 dark:text-dark-text/30"
      >
        © CHRIST J. — Tous droits réservés
      </motion.p>
    </div>
  )
}
