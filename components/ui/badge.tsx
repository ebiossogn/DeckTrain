import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-accent/10 text-accent border-accent/25',
  success: 'bg-green-500/10 text-green-400 border-green-500/25',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  danger: 'bg-red-500/10 text-red-400 border-red-500/25',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  muted: 'bg-light-text/5 dark:bg-white/5 text-light-text/50 dark:text-dark-text/50 border-light-text/10 dark:border-white/10',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
