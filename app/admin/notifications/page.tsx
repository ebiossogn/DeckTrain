'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Notif = {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  NEW_FORMATEUR: 'text-emerald-400 bg-emerald-400/10',
  MODULE_CREATED: 'text-accent bg-accent/10',
  SYSTEM: 'text-slate-400 bg-slate-400/10',
}

const FILTERS = ['Toutes', 'Non lues', 'Lues'] as const
type Filter = (typeof FILTERS)[number]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('Toutes')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/notifications')
    if (res.ok) setNotifications(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const markOne = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read_one', id }),
    })
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAll = async () => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read_all' }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'Non lues') return !n.isRead
    if (filter === 'Lues') return n.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Bell size={22} className="text-accent" />
            <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-accent bg-accent/8 hover:bg-accent/15 border border-accent/20 transition-colors"
            >
              <CheckCheck size={13} />
              Tout marquer comme lu
            </button>
          )}
        </div>
        <p className="text-sm text-light-text/50 dark:text-dark-text/50 mb-6">
          Historique des notifications de la plateforme.
        </p>
      </motion.div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              filter === f
                ? 'bg-accent/10 text-accent border-accent/20'
                : 'text-light-text/50 dark:text-dark-text/50 border-light-text/10 dark:border-dark-text/10 hover:bg-light-text/5 dark:hover:bg-dark-text/5'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-light-text/5 dark:bg-dark-text/5 flex items-center justify-center mb-4">
            <Bell size={24} className="text-light-text/20 dark:text-dark-text/20" />
          </div>
          <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">Aucune notification</p>
          <p className="text-sm text-light-text/45 dark:text-dark-text/45">
            {filter === 'Non lues' ? 'Tout est lu !' : 'Aucune notification pour le moment.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((notif, i) => {
              const colorClass = TYPE_COLORS[notif.type] ?? 'text-light-text/50 bg-light-text/5'
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'flex items-start gap-4 px-4 py-4 rounded-xl border transition-colors',
                    notif.isRead
                      ? 'bg-light-surface dark:bg-dark-surface border-light-text/8 dark:border-dark-text/8'
                      : 'bg-accent/4 border-accent/15'
                  )}
                >
                  <div className={cn('flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5', colorClass)}>
                    <Bell size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={cn('text-sm font-semibold', notif.isRead ? 'text-light-text dark:text-dark-text' : 'text-light-text dark:text-white')}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-light-text/55 dark:text-dark-text/55 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => markOne(notif.id)}
                          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-accent hover:bg-accent/10 transition-colors"
                          title="Marquer comme lu"
                        >
                          <Check size={13} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-light-text/35 dark:text-dark-text/35">
                        {new Date(notif.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          className="flex items-center gap-1 text-[10px] text-accent hover:underline"
                        >
                          <ExternalLink size={9} />
                          Voir
                        </Link>
                      )}
                      {!notif.isRead && (
                        <span className="text-[10px] font-semibold text-accent">• Nouveau</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <p className="text-xs text-light-text/30 dark:text-dark-text/30 text-center mt-12">
        © CHRIST J. — Tous droits réservés
      </p>
    </div>
  )
}
