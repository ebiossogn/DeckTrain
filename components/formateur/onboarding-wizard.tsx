'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, User, BookOpen, Users, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    id: 0,
    icon: Zap,
    color: 'text-accent',
    bg: 'bg-accent/10',
    title: 'Bienvenue sur DeckTrain !',
    subtitle: 'La plateforme de formation interactive.',
    description: 'DeckTrain vous permet de créer et animer des formations dynamiques avec slides, exercices, sondages et agenda — le tout en une seule interface.',
    cta: 'Commencer le tour',
  },
  {
    id: 1,
    icon: User,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    title: 'Votre profil formateur',
    subtitle: 'Vous êtes identifié sur la plateforme.',
    description: 'Votre nom et votre adresse e-mail sont visibles par les administrateurs. Vous pouvez les modifier dans vos paramètres à tout moment.',
    cta: 'Continuer',
  },
  {
    id: 2,
    icon: BookOpen,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    title: 'Vos modules de formation',
    subtitle: 'Accédez à vos contenus assignés.',
    description: 'Les administrateurs vous assignent des modules. Chaque module contient des slides, des exercices interactifs et peut être présenté en mode plein écran.',
    cta: 'Continuer',
  },
  {
    id: 3,
    icon: Users,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    title: 'Les participants',
    subtitle: 'Suivez votre audience en direct.',
    description: 'Pendant vos sessions, les participants rejoignent via un code ou un lien. Vous pouvez lancer des sondages et des exercices en temps réel.',
    cta: 'Continuer',
  },
  {
    id: 4,
    icon: CheckCircle2,
    color: 'text-accent',
    bg: 'bg-accent/10',
    title: 'Vous êtes prêt !',
    subtitle: 'Votre espace est configuré.',
    description: 'Explorez vos modules, consultez l\'agenda et lancez votre première présentation. Bonne formation !',
    cta: 'Accéder au tableau de bord',
  },
]

interface OnboardingWizardProps {
  initialStep?: number
}

export function OnboardingWizard({ initialStep = 0 }: OnboardingWizardProps) {
  const [step, setStep] = useState(initialStep)
  const [visible, setVisible] = useState(true)
  const [completing, setCompleting] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const advance = async () => {
    if (isLast) {
      setCompleting(true)
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complete: true }),
      })
      setVisible(false)
      return
    }
    const next = step + 1
    setStep(next)
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: next }),
    })
  }

  const skip = async () => {
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complete: true }),
    })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -16 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-2xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="h-1 bg-light-text/5 dark:bg-dark-text/5">
            <motion.div
              className="h-full bg-accent"
              initial={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
              animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="px-8 py-8">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6', current.bg)}
            >
              <current.icon size={26} className={current.color} />
            </motion.div>

            {/* Dots */}
            <div className="flex gap-1.5 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === step ? 'w-6 bg-accent' : i < step ? 'w-3 bg-accent/40' : 'w-3 bg-light-text/10 dark:bg-dark-text/10'
                  )}
                />
              ))}
            </div>

            {/* Content */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <p className="text-xs font-semibold text-light-text/40 dark:text-dark-text/40 uppercase tracking-widest mb-1">
                Étape {step + 1} sur {STEPS.length}
              </p>
              <h2 className="font-syne text-xl font-bold text-light-text dark:text-dark-text mb-1">
                {current.title}
              </h2>
              <p className="text-sm font-medium text-accent mb-4">{current.subtitle}</p>
              <p className="text-sm text-light-text/60 dark:text-dark-text/60 leading-relaxed">
                {current.description}
              </p>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex items-center justify-between gap-3">
            {step < STEPS.length - 1 ? (
              <button
                onClick={skip}
                className="text-xs text-light-text/35 dark:text-dark-text/35 hover:text-light-text/60 dark:hover:text-dark-text/60 transition-colors"
              >
                Passer l'intro
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={advance}
              disabled={completing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-dark-bg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60"
            >
              {current.cta}
              {isLast ? <CheckCircle2 size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
