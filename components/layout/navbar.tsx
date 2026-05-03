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
      className={[
        'sticky top-0 z-50 px-6 py-4',
        'border-b border-light-text/8 dark:border-dark-text/8',
        'bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-xl',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-syne font-bold text-xl text-light-text dark:text-dark-text hover:opacity-80 transition-opacity"
        >
          <Zap className="text-accent" size={20} />
          Train<span className="text-accent">Deck</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/present"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-light-text/50 dark:text-dark-text/50 hover:text-accent hover:bg-accent/8 transition-all"
          >
            <Monitor size={14} />
            <span className="hidden sm:inline">Modules</span>
          </Link>
          <Link
            href="/exercises"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-light-text/50 dark:text-dark-text/50 hover:text-accent hover:bg-accent/8 transition-all"
          >
            <PenTool size={14} />
            <span className="hidden sm:inline">Exercices</span>
          </Link>
          <Link
            href="/agenda"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-light-text/50 dark:text-dark-text/50 hover:text-accent hover:bg-accent/8 transition-all"
          >
            <Calendar size={14} />
            <span className="hidden sm:inline">Agenda</span>
          </Link>
          {showAdminLink && (
            <Link
              href="/login"
              className="px-3 py-2 rounded-lg text-sm text-light-text/50 dark:text-dark-text/50 hover:text-accent hover:bg-accent/8 transition-all"
            >
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
