'use client'

import { motion } from 'framer-motion'

interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
}

export function LoadingButton({
  loading,
  children,
  variant = 'primary',
  type = 'button',
  disabled,
  className = '',
  onClick,
}: LoadingButtonProps) {
  const variantClasses = {
    primary:   'bg-accent text-[#111111] hover:opacity-90',
    secondary: 'border border-light-gold/40 dark:border-or/40 text-light-gold dark:text-or hover:bg-light-gold/8 dark:hover:bg-or/8',
    danger:    'border border-red-500/50 text-red-400 hover:bg-red-500/10',
  }

  return (
    <motion.button
      type={type}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      disabled={loading || disabled}
      onClick={onClick}
      className={[
        'flex items-center justify-center gap-2',
        'px-6 py-3 rounded-xl font-medium text-sm',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-4 w-4 border-2 border-current border-t-transparent rounded-full flex-shrink-0"
        />
      )}
      {loading ? 'Chargement…' : children}
    </motion.button>
  )
}
