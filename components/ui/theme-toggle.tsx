'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/lib/store/theme-store'

export function ThemeToggle() {
  const { isDark, toggle } = useThemeStore()

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label="Basculer le thème"
      className={[
        'relative w-10 h-10 rounded-xl flex items-center justify-center',
        'border transition-colors duration-200',
        'bg-light-text/5 dark:bg-dark-text/5',
        'border-light-text/10 dark:border-dark-text/10',
        'text-light-text/60 dark:text-dark-text/60',
        'hover:text-accent hover:border-accent/30',
      ].join(' ')}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.18 }}
          >
            <Sun size={16} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.18 }}
          >
            <Moon size={16} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
