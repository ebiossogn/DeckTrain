'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/store/theme-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    root.style.transition = 'background-color 300ms ease, color 300ms ease, border-color 300ms ease'
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  return <>{children}</>
}
