'use client'

import Link from 'next/link'
import { GripVertical, Pencil, Trash2, ChevronRight, Layers } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ModuleWithCount } from '@/types/slides'

interface Props {
  module: ModuleWithCount
  dragHandleProps?: Record<string, unknown>
  onEdit: () => void
  onDelete: () => void
  liveCode?: string | null
}

export function ModuleCard({ module, dragHandleProps, onEdit, onDelete, liveCode }: Props) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-light-text/8 dark:border-dark-text/8 bg-light-surface dark:bg-dark-surface hover:border-accent/20 transition-colors group">
      {/* Drag handle */}
      <div
        {...(dragHandleProps as Record<string, unknown>)}
        className="text-light-text/20 dark:text-dark-text/20 hover:text-light-text/50 dark:hover:text-dark-text/50 cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5"
      >
        <GripVertical size={16} />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3 className="font-syne font-semibold text-light-text dark:text-dark-text truncate">
            {module.title}
          </h3>
          <Badge variant="muted" className="text-[10px] flex-shrink-0">
            <Layers size={9} /> {module._count.slides} slide{module._count.slides !== 1 ? 's' : ''}
          </Badge>
          {liveCode && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/12 text-red-400 text-[10px] font-semibold flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE · {liveCode}
            </span>
          )}
        </div>
        {module.description && (
          <p className="text-xs text-light-text/45 dark:text-dark-text/45 truncate">{module.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/35 dark:text-dark-text/35 hover:bg-light-text/8 dark:hover:bg-dark-text/8 hover:text-light-text dark:hover:text-dark-text transition-colors"
          title="Modifier"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/35 dark:text-dark-text/35 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          title="Supprimer"
        >
          <Trash2 size={13} />
        </button>
        <Link
          href={`/admin/modules/${module.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-accent/10 text-accent hover:bg-accent/15 transition-colors"
        >
          Slides <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  )
}
