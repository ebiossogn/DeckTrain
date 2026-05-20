'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, PenTool, Calendar, BarChart2,
  LogOut, Zap, Users,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/formateur',         icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/formateur/modules', icon: BookOpen,        label: 'Mes modules' },
  { href: '/exercises',         icon: PenTool,         label: 'Exercices' },
  { href: '/agenda',            icon: Calendar,        label: 'Agenda' },
  { href: '/surveys',           icon: BarChart2,       label: 'Sondages' },
]

interface FormateurSidebarProps {
  userName?: string | null
  userEmail?: string | null
}

export function FormateurSidebar({ userName, userEmail }: FormateurSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-60 h-screen flex flex-col bg-light-surface dark:bg-dark-bg border-r border-light-border dark:border-dark-border sticky top-0 flex-shrink-0 transition-colors duration-300">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-light-border dark:border-dark-border">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg hover:opacity-85 transition-opacity">
          <Zap className="text-accent" size={18} />
          <span className="text-light-text dark:text-white">Deck</span><span className="text-or">Train</span>
        </Link>
        <p className="text-[10px] text-text-secondary mt-0.5 ml-[26px] label-dt">Espace Formateur</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/formateur' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                active
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-light-text/55 dark:text-dark-text/55 hover:text-light-text dark:hover:text-dark-text hover:bg-light-text/5 dark:hover:bg-dark-text/5'
              )}
            >
              {active && (
                <motion.span
                  layoutId="formateur-active-pill"
                  className="absolute left-0 w-0.5 h-5 bg-accent rounded-r-full"
                />
              )}
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-light-border dark:border-dark-border space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
            {userName?.[0]?.toUpperCase() ?? 'F'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-light-text dark:text-dark-text truncate">{userName}</p>
            <p className="text-[10px] text-text-secondary truncate">{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-red-400 transition-colors"
          >
            <LogOut size={13} />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  )
}
