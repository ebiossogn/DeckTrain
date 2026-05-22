'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Notif = {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) setNotifications(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
    setOpen(false)
  }

  const unread = notifications.filter((n) => !n.isRead).length
  const recent = notifications.slice(0, 10)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-xl transition-colors',
          open
            ? 'bg-accent/10 text-accent'
            : 'text-light-text-secondary dark:text-text-secondary hover:bg-light-text/8 dark:hover:bg-white/8'
        )}
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-dark-bg text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-10 w-80 rounded-xl border bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-light-text dark:text-dark-text">Notifications</span>
                {unread > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">{unread}</span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAll}
                  className="flex items-center gap-1 text-[10px] text-accent hover:underline"
                >
                  <CheckCheck size={10} />
                  Tout lire
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <Bell size={20} className="text-light-text/20 dark:text-dark-text/20 mb-2" />
                  <p className="text-xs text-light-text/40 dark:text-dark-text/40">Aucune notification</p>
                </div>
              ) : (
                recent.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b border-light-text/5 dark:border-dark-text/5 last:border-0',
                      !notif.isRead && 'bg-accent/3'
                    )}
                  >
                    {!notif.isRead && (
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    )}
                    {notif.isRead && <div className="flex-shrink-0 w-1.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-light-text dark:text-dark-text leading-tight">{notif.title}</p>
                      <p className="text-[10px] text-light-text/50 dark:text-dark-text/50 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] text-light-text/30 dark:text-dark-text/30">
                          {new Date(notif.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        {notif.link && (
                          <Link href={notif.link} onClick={() => setOpen(false)}
                            className="flex items-center gap-1 text-[9px] text-accent hover:underline">
                            <ExternalLink size={8} />Voir
                          </Link>
                        )}
                      </div>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => markOne(notif.id)}
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-accent hover:bg-accent/10 transition-colors"
                        title="Marquer comme lu"
                      >
                        <Check size={11} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-light-border dark:border-dark-border">
              <Link
                href="/admin/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs text-accent hover:underline"
              >
                Voir toutes les notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
