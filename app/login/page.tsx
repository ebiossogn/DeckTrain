'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, Zap, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { LoadingButton } from '@/components/ui/loading-button'
import { useTranslations } from 'next-intl'

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('auth')
  const verified = searchParams.get('verified') === '1'
  const tokenError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Vérifier si l'email appartient à un admin avant signIn (plus fiable que les erreurs NextAuth)
    const checkResp = await fetch('/api/auth/check-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const { isAdmin } = await checkResp.json()

    if (isAdmin) {
      toast.info("Compte administrateur détecté — redirection vers l'espace admin")
      await new Promise(r => setTimeout(r, 1500))
      router.push(`/admin/login?email=${encodeURIComponent(email)}`)
      return
    }

    const result = await signIn('credentials', { email, password, source: 'public', redirect: false })

    if (result?.error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      // Le token JWT est maintenant posé — laisser le serveur décider de la destination
      window.location.href = '/api/auth/redirect'
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/api/auth/redirect' })
  }

  const tokenErrorMessages: Record<string, string> = {
    token_manquant: 'Lien de vérification invalide.',
    token_invalide: 'Ce lien de vérification est invalide ou a déjà été utilisé.',
    token_expire: 'Ce lien a expiré. Inscrivez-vous à nouveau.',
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-500/4 rounded-full blur-3xl" />
      </div>

      {/* Lien retour */}
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
          {t('back_home')}
        </Link>
      </motion.div>

      {/* Carte principale */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-light-text/8 dark:border-dark-text/8 bg-light-surface dark:bg-dark-surface p-8 shadow-2xl shadow-black/20">
          {/* Logo */}
          <div className="flex items-center gap-2 font-syne font-bold text-xl mb-8">
            <Zap className="text-accent" size={20} />
            <span className="text-light-text dark:text-white">Deck</span><span className="text-or">Train</span>
          </div>

          {/* Message compte vérifié */}
          <AnimatePresence>
            {verified && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-accent/10 border border-accent/25 text-accent text-sm mb-5"
              >
                <CheckCircle2 size={15} className="flex-shrink-0" />
                Email confirmé. Vous pouvez maintenant vous connecter.
              </motion.div>
            )}
            {tokenError && tokenErrorMessages[tokenError] && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-5"
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                {tokenErrorMessages[tokenError]}
              </motion.div>
            )}
          </AnimatePresence>

          <h1 className="font-syne text-2xl font-bold text-light-text dark:text-dark-text mb-1">
            {t('login_title')}
          </h1>
          <p className="text-sm text-light-text/50 dark:text-dark-text/50 mb-6">
            {t('login_subtitle')}
          </p>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-light-text/12 dark:border-dark-text/12 bg-light-text/3 dark:bg-dark-text/3 hover:bg-light-text/6 dark:hover:bg-dark-text/6 text-light-text dark:text-dark-text text-sm font-medium transition-all duration-200 mb-5 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {t('google')}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-light-text/10 dark:bg-dark-text/10" />
            <span className="text-xs text-light-text/40 dark:text-dark-text/40">{t('or_continue')}</span>
            <div className="flex-1 h-px bg-light-text/10 dark:bg-dark-text/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t('email')}
              type="email"
              placeholder="admin@decktrain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={14} />}
              autoComplete="email"
              required
            />

            {/* Mot de passe avec toggle visibilité */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                {t('password')}
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
                  aria-label={showPassword ? t('hide_password') : t('show_password')}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
                >
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
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
              {t('login_btn')}
            </LoadingButton>

            <p className="text-center text-sm text-light-text/50 dark:text-dark-text/50">
              {t('no_account')}{' '}
              <Link href="/register" className="text-accent hover:underline">
                {t('register_link')}
              </Link>
            </p>
          </form>
        </div>
      </motion.div>

      {/* Footer copyright */}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
