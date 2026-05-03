import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">{label}</label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-xl px-4 py-3 text-sm resize-none',
          'bg-light-text/5 dark:bg-dark-text/5',
          'border border-light-text/10 dark:border-dark-text/10',
          'text-light-text dark:text-dark-text',
          'placeholder:text-light-text/30 dark:placeholder:text-dark-text/30',
          'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40',
          'transition-all duration-200',
          error && 'border-red-500/40',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'
