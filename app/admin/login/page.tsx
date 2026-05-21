'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, Zap, Eye, EyeOff, AlertCircle, Shield, ArrowLeft,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { LoadingButton } from '@/components/ui/loading-button'

function AdminLoginContent() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const prefillEmail = searchParams.get('email') ?? ''

  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      source: 'admin',
      redirect: false,
    })

    if (result?.error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      window.location.href = '/api/auth/redirect'
    }
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-or/4 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="absolute top-6 left-6"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-light-text/50 dark:text-dark-text/50 hover:text-accent transition-colors"
        >
          <ArrowLeft size={14} />
          Retour à l'accueil
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-light-text/8 dark:border-dark-text/8 bg-light-surface dark:bg-dark-surface p-8 shadow-2xl shadow-black/20">
          {/* Logo */}
          <div className="flex items-center gap-2 font-display font-bold text-xl mb-6">
            <Zap className="text-accent" size={20} />
            <span className="text-light-text dark:text-white">Deck</span>
            <span className="text-light-gold dark:text-or">Train</span>
          </div>

          {/* Badge admin */}
          <div className="flex items-start gap-2 mb-6 px-3 py-2.5 rounded-xl bg-light-gold/8 dark:bg-or/8 border border-light-gold/20 dark:border-or/20">
            <Shield size={14} className="text-light-gold dark:text-or flex-shrink-0 mt-0.5" />
            <p className="text-xs text-light-gold dark:text-or leading-relaxed">
              Accès réservé au personnel DeckTrain.<br />
              Vos identifiants vous ont été fournis par votre administrateur.
            </p>
          </div>

          <h1 className="font-display text-2xl font-semibold text-light-text dark:text-dark-text mb-1">
            Administration
          </h1>
          <p className="text-sm text-light-text-muted dark:text-text-secondary mb-6">
            Connectez-vous à votre espace administrateur.
          </p>

          <AnimatePresence>
            {urlError === 'admin_oauth_blocked' && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-5"
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                La connexion Google n'est pas disponible pour les comptes administrateurs.
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Adresse email"
              type="email"
              placeholder="admin@decktrain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={14} />}
              autoComplete="email"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text/40 dark:text-dark-text/40 pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl pl-10 pr-11 py-3 text-sm bg-light-text/5 dark:bg-dark-text/5 border border-light-text/10 dark:border-dark-text/10 text-light-text dark:text-dark-text placeholder:text-light-text/30 dark:placeholder:text-dark-text/30 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text/40 dark:text-dark-text/40 hover:text-accent transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
                >
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <LoadingButton
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-2 py-3"
            >
              Se connecter
            </LoadingButton>
          </form>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="absolute bottom-6 text-xs text-light-text/30 dark:text-dark-text/30"
      >
        © CHRIST J. — Tous droits réservés
      </motion.p>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  )
}
