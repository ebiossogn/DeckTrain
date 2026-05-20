'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, RefreshCw, Zap, Clock } from 'lucide-react'

function maskEmail(email: string): string {
  if (!email.includes('@')) return email
  const [local, domain] = email.split('@')
  const masked = local.length <= 2 ? local[0] + '*' : local.slice(0, 2) + '***'
  return `${masked}@${domain}`
}

function RegisterSuccessContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const handleResend = async () => {
    if (cooldown > 0 || !email || resending) return
    setResending(true)
    setResendMsg('')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setResendMsg('Email renvoyé ! Vérifiez votre boîte.')
        setCooldown(60)
      } else {
        setResendMsg('Impossible de renvoyer. Réessayez plus tard.')
      }
    } catch {
      setResendMsg('Impossible de renvoyer. Réessayez plus tard.')
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-accent/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-or/4 rounded-full blur-3xl" />
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
          <div className="flex items-center gap-2 font-display font-bold text-xl mb-8">
            <Zap className="text-accent" size={20} />
            <span className="text-light-text dark:text-white">Deck</span>
            <span className="text-light-gold dark:text-or">Train</span>
          </div>

          <div className="flex flex-col items-center text-center gap-6">
            {/* Icône email animée */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center"
            >
              <Mail size={36} className="text-accent" />
            </motion.div>

            <div>
              <h1 className="font-display text-2xl font-semibold text-light-text dark:text-dark-text mb-2">
                Vérifiez votre boîte mail
              </h1>
              <p className="text-sm text-light-text-muted dark:text-text-secondary leading-relaxed">
                Un email de confirmation a été envoyé à
              </p>
              <p className="text-sm font-semibold text-light-text dark:text-dark-text mt-0.5">
                {maskEmail(email) || '—'}
              </p>
            </div>

            <div className="w-full bg-light-text/3 dark:bg-dark-text/4 border border-light-border dark:border-dark-border rounded-xl px-4 py-4 text-left space-y-2.5">
              <p className="text-sm text-light-text-muted dark:text-text-secondary flex items-start gap-2">
                <span className="text-accent flex-shrink-0 mt-0.5">•</span>
                Cliquez sur le lien dans l'email pour activer votre compte.
              </p>
              <p className="text-sm text-light-text-muted dark:text-text-secondary flex items-start gap-2">
                <Clock size={13} className="text-light-gold dark:text-or flex-shrink-0 mt-0.5" />
                Le lien expire dans{' '}
                <strong className="text-light-text dark:text-dark-text ml-0.5">24 heures</strong>.
              </p>
              <p className="text-sm text-light-text-muted dark:text-text-secondary flex items-start gap-2">
                <span className="text-accent flex-shrink-0 mt-0.5">•</span>
                Vérifiez vos spams si l'email n'arrive pas.
              </p>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="flex items-center gap-2 text-sm text-accent hover:underline disabled:opacity-40 disabled:no-underline transition-opacity"
              >
                <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : "Renvoyer l'email de confirmation"}
              </button>
              {resendMsg && (
                <p className="text-xs text-light-text-muted dark:text-text-secondary">{resendMsg}</p>
              )}
            </div>

            <Link
              href="/login"
              className="text-sm text-light-text-muted dark:text-text-secondary hover:text-accent transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
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

export default function RegisterSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
        </div>
      }
    >
      <RegisterSuccessContent />
    </Suspense>
  )
}
