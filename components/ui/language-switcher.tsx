'use client'

import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/language-context'
import type { Locale } from '@/lib/i18n/translations'

const LOCALES = [
  { code: 'fr' as Locale, label: 'FR', flag: '🇫🇷' },
  { code: 'en' as Locale, label: 'EN', flag: '🇬🇧' },
] as const

interface LanguageSwitcherProps {
  current?: string
  compact?: boolean
}

export function LanguageSwitcher({ current, compact = false }: LanguageSwitcherProps) {
  const { locale: ctxLocale, changeLocale } = useLanguage()
  const [pending, startTransition] = useTransition()

  const active = current ?? ctxLocale

  const setLocale = (locale: Locale) => {
    startTransition(() => { changeLocale(locale) })
  }

  if (compact) {
    return (
      <div className="flex items-center gap-0.5">
        {LOCALES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setLocale(code)}
            disabled={pending}
            className={cn(
              'px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors',
              active === code
                ? 'bg-accent/12 text-accent'
                : 'text-light-text/40 dark:text-dark-text/40 hover:text-light-text dark:hover:text-dark-text hover:bg-light-text/5 dark:hover:bg-dark-text/5'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-xl border border-light-text/10 dark:border-dark-text/10 bg-light-bg dark:bg-dark-bg">
      {LOCALES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          disabled={pending}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            active === code
              ? 'bg-accent text-dark-bg shadow-sm'
              : 'text-light-text/55 dark:text-dark-text/55 hover:text-light-text dark:hover:text-dark-text'
          )}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
