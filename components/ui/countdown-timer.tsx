'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

function calcTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1000),
  }
}

const DEFAULT_MESSAGE =
  '✨ Cette formation arrive bientôt — Préparez-vous à transformer vos compétences. Ne manquez pas le rendez-vous.'

export function CountdownTimer({
  publishAt,
  message,
  moduleTitle,
  showCta = true,
}: {
  publishAt: string | Date
  message?: string | null
  moduleTitle: string
  showCta?: boolean
}) {
  const target = new Date(publishAt)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calcTimeLeft(target))

  useEffect(() => {
    const id = setInterval(() => {
      const t = calcTimeLeft(target)
      setTimeLeft(t)
      if (!t) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [target.getTime()])

  if (!timeLeft) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/30 text-accent text-sm font-medium"
      >
        <Sparkles size={14} />
        Formation disponible maintenant !
      </motion.div>
    )
  }

  const units = [
    { value: timeLeft.days,    label: 'Jours' },
    { value: timeLeft.hours,   label: 'Heures' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 text-center"
    >
      <p className="text-sm text-light-text-muted dark:text-text-secondary mb-1 italic">
        {message || DEFAULT_MESSAGE}
      </p>
      <p className="text-xs text-light-text-muted dark:text-text-secondary mb-5">
        La formation{' '}
        <strong className="text-light-text dark:text-dark-text">"{moduleTitle}"</strong>{' '}
        sera disponible dans :
      </p>

      <div className="flex items-end justify-center gap-2 mb-5">
        {units.map((u, i) => (
          <div key={u.label} className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={u.value}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-14 h-14 rounded-xl bg-light-bg dark:bg-dark-bg border border-accent/20 flex items-center justify-center text-xl font-bold text-accent font-mono"
              >
                {String(u.value).padStart(2, '0')}
              </motion.div>
            </AnimatePresence>
            <span className="text-[10px] text-light-text-muted dark:text-text-secondary mt-1 label-dt">{u.label}</span>
            {i < units.length - 1 && (
              <span className="absolute text-accent/50 text-lg font-bold select-none" style={{ transform: 'translateX(72px) translateY(-28px)' }}>:</span>
            )}
          </div>
        ))}
      </div>

      {showCta && (
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-light-border dark:border-dark-border">
          <p className="text-xs text-light-text-muted dark:text-text-secondary">
            Inscrivez-vous pour être notifié dès l'ouverture
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-[#111] text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            <Bell size={13} />
            Me notifier
          </Link>
        </div>
      )}
    </motion.div>
  )
}
