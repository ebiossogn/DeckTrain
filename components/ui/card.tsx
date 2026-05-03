'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLMotionProps<'div'> {
  hoverable?: boolean
  glass?: boolean
}

export function Card({ children, className, hoverable = false, glass = false, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={
        hoverable
          ? { y: -3, boxShadow: '0 12px 40px rgba(0,212,255,0.12)' }
          : undefined
      }
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-2xl border',
        glass
          ? 'bg-white/5 backdrop-blur-xl border-white/10 dark:bg-white/5 dark:border-white/10'
          : 'bg-light-surface dark:bg-dark-surface border-light-text/8 dark:border-dark-text/8',
        hoverable && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
