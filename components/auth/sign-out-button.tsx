'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-red-400 transition-colors"
    >
      <LogOut size={14} />
      Déconnexion
    </button>
  )
}
