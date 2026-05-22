'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPWABanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('pwa-banner-dismissed')
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      // Afficher la bannière après 30 secondes
      setTimeout(() => setVisible(true), 30_000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    setInstalling(true)
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome === 'accepted') {
      setVisible(false)
    }
    setInstalling(false)
    setPrompt(null)
  }

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem('pwa-banner-dismissed', '1')
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 rounded-2xl border bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border shadow-2xl p-4"
        >
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:bg-light-text/8 dark:hover:bg-dark-text/8 transition-colors"
          >
            <X size={13} />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
              <Smartphone size={18} />
            </div>
            <div className="flex-1 pr-4">
              <p className="text-sm font-semibold text-light-text dark:text-dark-text mb-0.5">
                Installer DeckTrain
              </p>
              <p className="text-xs text-light-text/55 dark:text-dark-text/55 leading-relaxed mb-3">
                Ajoutez l'app à votre écran d'accueil pour un accès rapide, même hors ligne.
              </p>
              <button
                onClick={install}
                disabled={installing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-dark-bg text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60"
              >
                <Download size={12} />
                {installing ? 'Installation…' : 'Installer'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
