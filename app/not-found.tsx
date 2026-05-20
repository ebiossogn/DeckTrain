'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center px-6 text-center">
      {/* Glow décoratif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent/6 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 space-y-6 max-w-md"
      >
        {/* Code d'erreur */}
        <div className="font-syne font-bold text-8xl text-accent/20 select-none leading-none">
          404
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 -mt-2">
          <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
            <span className="font-display font-bold text-accent text-xs">DT</span>
          </div>
          <span className="font-display font-bold text-white">Deck</span><span className="font-display font-bold text-or">Train</span>
        </div>

        <div>
          <h1 className="font-syne text-2xl font-bold text-dark-text mb-2">
            Page introuvable
          </h1>
          <p className="text-dark-text/45 text-sm leading-relaxed">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="primary" size="md">
              <Home size={15} />
              Accueil
            </Button>
          </Link>
          <button onClick={() => window.history.back()}>
            <Button variant="ghost" size="md">
              <ArrowLeft size={15} />
              Retour
            </Button>
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-6 text-xs text-dark-text/20 font-inter">
        © CHRIST J. — DeckTrain
      </div>
    </div>
  )
}
