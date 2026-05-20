'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Monitor, PenTool, Calendar } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavbarProps {
  showAdminLink?: boolean
}

export function Navbar({ showAdminLink = true }: NavbarProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 px-6 py-4 border-b border-light-border dark:border-dark-border bg-light-bg/90 dark:bg-dark-bg/90 backdrop-blur-xl transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-display font-bold text-xl hover:opacity-85 transition-opacity text-light-text dark:text-dark-text"
        >
          <Zap className="text-accent" size={20} />
          <span className="text-light-text dark:text-white">Deck</span><span className="text-light-gold dark:text-or">Train</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/present"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-light-text-secondary dark:text-text-secondary hover:text-accent hover:bg-accent/6 transition-all">
            <Monitor size={14} />
            <span className="hidden sm:inline">Modules</span>
          </Link>
          <Link href="/exercises"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-light-text-secondary dark:text-text-secondary hover:text-accent hover:bg-accent/6 transition-all">
            <PenTool size={14} />
            <span className="hidden sm:inline">Exercices</span>
          </Link>
          <Link href="/agenda"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-light-text-secondary dark:text-text-secondary hover:text-accent hover:bg-accent/6 transition-all">
            <Calendar size={14} />
            <span className="hidden sm:inline">Agenda</span>
          </Link>
          {showAdminLink && (
            <Link href="/login"
              className="px-3 py-2 rounded-lg text-sm text-light-text-secondary dark:text-text-secondary hover:text-accent hover:bg-accent/6 transition-all">
              Admin
            </Link>
          )}
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
