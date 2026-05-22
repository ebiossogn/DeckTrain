'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, RotateCcw, AlertTriangle, BookOpen, PenTool, Calendar, BarChart2, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { cn } from '@/lib/utils'

type TrashItem = { id: string; title?: string; type?: string; moduleId?: string; deletedAt: string }
type TrashData = {
  modules: TrashItem[]
  slides: TrashItem[]
  exercises: TrashItem[]
  agendaSessions: TrashItem[]
  surveys: TrashItem[]
}

function daysLeft(deletedAt: string) {
  const diff = 30 - Math.floor((Date.now() - new Date(deletedAt).getTime()) / 86400000)
  return Math.max(0, diff)
}

const SECTIONS = [
  { key: 'modules',       label: 'Modules',    icon: BookOpen,  color: 'text-accent' },
  { key: 'exercises',     label: 'Exercices',  icon: PenTool,   color: 'text-violet-400' },
  { key: 'slides',        label: 'Slides',     icon: Layers,    color: 'text-blue-400' },
  { key: 'agendaSessions',label: 'Agenda',     icon: Calendar,  color: 'text-emerald-400' },
  { key: 'surveys',       label: 'Sondages',   icon: BarChart2, color: 'text-amber-400' },
] as const

export default function TrashPage() {
  const [data, setData] = useState<TrashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState<{ type: string; id: string; action: 'restore' | 'purge'; label: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/trash')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const total = data ? Object.values(data).reduce((s, arr) => s + arr.length, 0) : 0

  const handleAction = async () => {
    if (!confirm) return
    await fetch('/api/trash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: confirm.action, type: confirm.type, id: confirm.id }),
    })
    setConfirm(null)
    load()
  }

  const itemLabel = (item: TrashItem, key: string) =>
    item.title ?? (key === 'slides' ? `Slide (${item.type ?? 'type inconnu'})` : item.id)

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <div className="flex items-center gap-3 mb-2">
          <Trash2 size={22} className="text-red-400" />
          <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">Corbeille</h1>
          {total > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-400/10 text-red-400 border border-red-400/20">
              {total}
            </span>
          )}
        </div>
        <p className="text-sm text-light-text/50 dark:text-dark-text/50 mb-8">
          Les éléments sont supprimés définitivement après 30 jours.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        </div>
      ) : total === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-light-text/5 dark:bg-dark-text/5 text-light-text/20 dark:text-dark-text/20 flex items-center justify-center mb-4">
            <Trash2 size={24} />
          </div>
          <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">Corbeille vide</p>
          <p className="text-sm text-light-text/45 dark:text-dark-text/45">Aucun élément supprimé.</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {SECTIONS.map(({ key, label, icon: Icon, color }) => {
            const items = (data?.[key as keyof TrashData] ?? []) as TrashItem[]
            if (items.length === 0) return null
            return (
              <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={15} className={color} />
                  <h2 className="text-sm font-semibold text-light-text dark:text-dark-text">{label}</h2>
                  <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', color, 'bg-current/10')}>{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => {
                    const days = daysLeft(item.deletedAt)
                    return (
                      <div key={item.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-light-surface dark:bg-dark-surface border-light-text/8 dark:border-dark-text/8">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">
                            {itemLabel(item, key)}
                          </p>
                          <p className="text-xs text-light-text/40 dark:text-dark-text/40 mt-0.5">
                            Supprimé le {new Date(item.deletedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={cn(
                          'flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full border',
                          days <= 3
                            ? 'text-red-400 bg-red-400/8 border-red-400/20'
                            : days <= 7
                              ? 'text-amber-400 bg-amber-400/8 border-amber-400/20'
                              : 'text-light-text/40 dark:text-dark-text/40 bg-light-text/5 dark:bg-dark-text/5 border-light-text/10 dark:border-dark-text/10'
                        )}>
                          {days}j restants
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => setConfirm({ type: key.replace(/s$/, '').replace('Session', ''), id: item.id, action: 'restore', label: itemLabel(item, key) })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-accent bg-accent/8 hover:bg-accent/15 border border-accent/20 transition-colors"
                          >
                            <RotateCcw size={11} />
                            Restaurer
                          </button>
                          <button
                            onClick={() => setConfirm({ type: key.replace(/s$/, '').replace('Session', ''), id: item.id, action: 'purge', label: itemLabel(item, key) })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-400/8 hover:bg-red-400/15 border border-red-400/20 transition-colors"
                          >
                            <Trash2 size={11} />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirm}
        title={confirm?.action === 'purge' ? 'Supprimer définitivement ?' : 'Restaurer cet élément ?'}
        message={
          confirm?.action === 'purge'
            ? `"${confirm?.label}" sera supprimé définitivement. Cette action est irréversible.`
            : `"${confirm?.label}" sera restauré et redeviendra visible.`
        }
        confirmLabel={confirm?.action === 'purge' ? 'Supprimer définitivement' : 'Restaurer'}
        onConfirm={handleAction}
        onCancel={() => setConfirm(null)}
      />

      <p className="text-xs text-light-text/30 dark:text-dark-text/30 text-center mt-12">
        © CHRIST J. — Tous droits réservés
      </p>
    </div>
  )
}
