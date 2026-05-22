'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { translations, type Locale, type TranslationKey } from '@/lib/i18n/translations'

interface LanguageContextType {
  locale: Locale
  t: (key: TranslationKey | string) => string
  changeLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'fr',
  t: (key) => key,
  changeLocale: () => {},
})

function readCookieLocale(): Locale {
  if (typeof document === 'undefined') return 'fr'
  const match = document.cookie.match(/locale=([^;]+)/)
  const val = match?.[1]
  return val === 'en' ? 'en' : 'fr'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [locale, setLocale] = useState<Locale>('fr')

  useEffect(() => {
    setLocale(readCookieLocale())
  }, [])

  const t = useCallback((key: TranslationKey | string): string => {
    return (translations[locale] as Record<string, string>)[key]
      ?? (translations.fr as Record<string, string>)[key]
      ?? key
  }, [locale])

  const changeLocale = useCallback((newLocale: Locale) => {
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
    setLocale(newLocale)
    router.refresh()
  }, [router])

  return (
    <LanguageContext.Provider value={{ locale, t, changeLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
