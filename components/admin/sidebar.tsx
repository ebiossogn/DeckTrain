'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  Calendar,
  Settings,
  Shield,
  Users,
  UserCircle,
  LogOut,
  Zap,
  Monitor,
  ChevronRight,
  ExternalLink,
  BarChart2,
} from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '@/types/roles'
import type { AdminRole } from '@/types/roles'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/overview',  icon: LayoutDashboard, label: "Vue d'ensemble" },
  { href: '/admin/modules',   icon: BookOpen,        label: 'Modules & Slides' },
  { href: '/admin/exercises', icon: PenTool,         label: 'Exercices' },
  { href: '/admin/agenda',    icon: Calendar,        label: 'Agenda' },
  { href: '/admin/surveys',   icon: BarChart2,       label: 'Sondages' },
  { href: '/admin/team',      icon: Users,           label: 'Équipe' },
  { href: '/admin/users',     icon: UserCircle,      label: 'Utilisateurs' },
  { href: '/admin/security',  icon: Shield,          label: 'Sécurité' },
  { href: '/admin/settings',  icon: Settings,        label: 'Paramètres' },
]

interface AdminSidebarProps {
  userEmail?: string | null
  userRole?: AdminRole
}

export function AdminSidebar({ userEmail, userRole }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen flex flex-col bg-light-surface dark:bg-dark-surface border-r border-light-text/8 dark:border-dark-text/8 sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-light-text/8 dark:border-dark-text/8">
        <Link
          href="/"
          className="flex items-center gap-2 font-syne font-bold text-lg text-light-text dark:text-dark-text hover:opacity-80 transition-opacity"
        >
          <Zap className="text-accent" size={18} />
          Train<span className="text-accent">Deck</span>
        </Link>
        <p className="text-[11px] text-light-text/35 dark:text-dark-text/35 mt-0.5 ml-[26px]">
          Administration
        </p>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-light-text/55 dark:text-dark-text/55 hover:bg-light-text/5 dark:hover:bg-dark-text/5 hover:text-light-text dark:hover:text-dark-text'
                )}
              >
                <item.icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight size={13} className="text-accent/70" />
                )}
              </Link>
            </motion.div>
          )
        })}

        {/* Séparateur */}
        <div className="pt-3 pb-1">
          <div className="border-t border-light-text/8 dark:border-dark-text/8" />
        </div>

        {/* Lien présentation */}
        <Link
          href="/present"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-light-text/55 dark:text-dark-text/55 hover:bg-accent/8 hover:text-accent transition-all duration-200"
        >
          <Monitor size={16} className="flex-shrink-0" />
          <span className="flex-1">Mode présentation</span>
          <ExternalLink size={12} className="opacity-50" />
        </Link>
      </nav>

      {/* Bas : thème + user + logout */}
      <div className="px-3 py-4 border-t border-light-text/8 dark:border-dark-text/8 space-y-2">
        {/* Toggle thème */}
        <div className="flex items-center gap-3 px-3 py-1">
          <span className="text-xs text-light-text/40 dark:text-dark-text/40 flex-1">
            Thème
          </span>
          <ThemeToggle />
        </div>

        {/* Email + rôle */}
        <div className="px-3 py-1">
          <p className="text-xs text-light-text/40 dark:text-dark-text/40 truncate">
            {userEmail ?? 'admin'}
          </p>
          {userRole && (
            <span className="inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: ROLE_COLORS[userRole] + '18', color: ROLE_COLORS[userRole] }}>
              {ROLE_LABELS[userRole]}
            </span>
          )}
        </div>

        {/* Déconnexion */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-light-text/55 dark:text-dark-text/55 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
