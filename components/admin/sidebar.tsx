'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Menu,
  X,
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
  const [isOpen, setIsOpen] = useState(false)

  const close = () => setIsOpen(false)

  return (
    <>
      {/* ── Bouton hamburger mobile ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text shadow-md transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} />
        </button>
      )}

      {/* ── Backdrop mobile ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside className={cn(
        'w-64 h-screen flex flex-col bg-light-surface dark:bg-dark-bg border-r border-light-border dark:border-dark-border flex-shrink-0 transition-all duration-300',
        'fixed md:sticky top-0 left-0 z-50',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <Link
            href="/"
            onClick={close}
            className="flex items-center gap-2 font-display font-bold text-lg hover:opacity-85 transition-opacity"
          >
            <Zap className="text-accent" size={18} />
            <span className="text-light-text dark:text-white">Deck</span><span className="text-light-gold dark:text-or">Train</span>
          </Link>
          {/* Bouton fermeture mobile */}
          <button
            onClick={close}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg text-light-text-muted dark:text-text-secondary hover:bg-light-text/8 dark:hover:bg-white/8 transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-[10px] text-light-text-muted dark:text-text-secondary px-5 pb-2 label-dt -mt-1">
          Administration
        </p>

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
                  onClick={close}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-accent/8 text-accent border-l-2 border-accent pl-[10px]'
                      : 'text-light-text-secondary dark:text-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-text/5 dark:hover:bg-white/4'
                  )}
                >
                  <item.icon size={16} className="flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight size={13} className="text-accent/60" />
                  )}
                </Link>
              </motion.div>
            )
          })}

          {/* Séparateur */}
          <div className="pt-3 pb-1">
            <div className="border-t border-light-border dark:border-dark-border" />
          </div>

          {/* Lien présentation */}
          <Link
            href="/present"
            target="_blank"
            onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-light-text-secondary dark:text-text-secondary hover:bg-accent/6 hover:text-accent transition-all duration-200"
          >
            <Monitor size={16} className="flex-shrink-0" />
            <span className="flex-1">Mode présentation</span>
            <ExternalLink size={12} className="opacity-40" />
          </Link>
        </nav>

        {/* Bas : thème + user + logout */}
        <div className="px-3 py-4 border-t border-light-border dark:border-dark-border space-y-2">
          {/* Toggle thème */}
          <div className="flex items-center gap-3 px-3 py-1">
            <span className="text-[10px] text-light-text-muted dark:text-text-secondary flex-1 label-dt">Thème</span>
            <ThemeToggle />
          </div>

          {/* Email + rôle */}
          <div className="px-3 py-1">
            <p className="text-xs text-light-text-muted dark:text-text-secondary truncate">{userEmail ?? 'admin'}</p>
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
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-light-text-secondary dark:text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  )
}
