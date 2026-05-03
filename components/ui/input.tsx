import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div suppressHydrationWarning className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
          {label}
        </label>
      )}
      <div suppressHydrationWarning className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text/40 dark:text-dark-text/40 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          suppressHydrationWarning
          className={cn(
            'w-full rounded-xl py-3 px-4 text-sm',
            'bg-light-text/5 dark:bg-dark-text/5',
            'border border-light-text/10 dark:border-dark-text/10',
            'text-light-text dark:text-dark-text',
            'placeholder:text-light-text/30 dark:placeholder:text-dark-text/30',
            'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40',
            'transition-all duration-200',
            icon && 'pl-10',
            error && 'border-red-500/40 focus:ring-red-500/25',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)

Input.displayName = 'Input'
