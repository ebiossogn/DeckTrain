'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Monitor, ExternalLink, Radio } from 'lucide-react'
import { LiveModal } from '@/components/live/live-modal'

interface ModuleItem {
  id: string
  title: string
  description: string | null
  slidesCount: number
  exercisesCount: number
  liveCode: string | null
}

export function FormateurModulesClient({ modules }: { modules: ModuleItem[] }) {
  const [liveTarget, setLiveTarget] = useState<ModuleItem | null>(null)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-light-text dark:text-white mb-1">
          Mes modules
        </h1>
        <p className="text-text-secondary text-sm">
          {modules.length} module{modules.length !== 1 ? 's' : ''} disponible{modules.length !== 1 ? 's' : ''}
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-16 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-secondary mb-1">Aucun module ne vous a encore été assigné.</p>
          <p className="text-xs text-text-muted">Contactez votre administrateur pour obtenir l'accès à des modules.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <div key={mod.id}
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5 group hover:border-accent/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.06)] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/8 text-accent flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                  <BookOpen size={18} />
                </div>
                <div className="flex items-center gap-2">
                  {mod.liveCode && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/12 text-red-400 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      LIVE · {mod.liveCode}
                    </span>
                  )}
                  <span className="label-dt text-text-muted">{mod.slidesCount} slides</span>
                  <span className="label-dt text-text-muted">·</span>
                  <span className="label-dt text-text-muted">{mod.exercisesCount} exos</span>
                </div>
              </div>

              <h3 className="font-display font-semibold text-or mb-1">{mod.title}</h3>
              {mod.description && (
                <p className="text-xs text-text-secondary mb-4 line-clamp-2">{mod.description}</p>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-light-border dark:border-dark-border flex-wrap">
                <Link
                  href={`/present/${mod.id}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-[#111] text-xs font-semibold hover:bg-accent-dark transition-colors"
                >
                  <Monitor size={12} />
                  Présenter
                </Link>

                <button
                  onClick={() => setLiveTarget(mod)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/8 text-red-400 text-xs font-semibold hover:bg-red-500/15 transition-colors"
                >
                  <Radio size={12} />
                  {mod.liveCode ? 'Session live' : 'Présenter en live'}
                </button>

                <Link
                  href={`/print/${mod.id}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border text-xs text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
                >
                  <ExternalLink size={12} />
                  PDF
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {liveTarget && (
          <LiveModal
            moduleId={liveTarget.id}
            moduleTitle={liveTarget.title}
            onClose={() => setLiveTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
