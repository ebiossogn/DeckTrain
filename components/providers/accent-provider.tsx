'use client'

import { useEffect } from 'react'

export function AccentProvider({ accentColor }: { accentColor: string }) {
  useEffect(() => {
    applyAccent(accentColor)
  }, [accentColor])

  return null
}

export function applyAccent(hex: string) {
  const el = document.documentElement
  el.style.setProperty('--color-accent-rgb', hexToRgbSpace(hex))
  el.style.setProperty('--color-accent', hex)
  el.style.setProperty('--color-accent-dark', darken(hex, 30))
}

function hexToRgbSpace(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, ((n >> 16) & 255) - amount)
  const g = Math.max(0, ((n >> 8) & 255) - amount)
  const b = Math.max(0, (n & 255) - amount)
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}
