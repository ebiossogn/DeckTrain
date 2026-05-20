'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-red-500/6 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 space-y-6 max-w-md"
      >
        <div className="font-syne font-bold text-8xl text-red-500/20 select-none leading-none">
          500
        </div>

        <div className="flex items-center justify-center gap-2 -mt-2">
          <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
            <span className="font-display font-bold text-accent text-xs">DT</span>
          </div>
          <span className="font-display font-bold text-white">Deck</span><span className="font-display font-bold text-or">Train</span>
        </div>

        <div>
          <h1 className="font-syne text-2xl font-bold text-dark-text mb-2">
            Une erreur est survenue
          </h1>
          <p className="text-dark-text/45 text-sm leading-relaxed">
            Quelque chose s&apos;est mal passé. Veuillez réessayer ou retourner à l&apos;accueil.
          </p>
          {error.digest && (
            <p className="text-dark-text/25 text-xs mt-2 font-mono">
              Réf : {error.digest}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" size="md" onClick={reset}>
            <RefreshCw size={15} />
            Réessayer
          </Button>
          <Link href="/">
            <Button variant="ghost" size="md">
              <Home size={15} />
              Accueil
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="absolute bottom-6 text-xs text-dark-text/20 font-inter">
        © CHRIST J. — DeckTrain
      </div>
    </div>
  )
}
