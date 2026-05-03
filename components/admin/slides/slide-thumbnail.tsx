'use client'

import { Type, Image, Code2, List, Quote, Columns2, Layout, GripVertical, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SlideWithContent, SlideType } from '@/types/slides'
import { SLIDE_TYPE_LABELS } from '@/types/slides'

const ICONS: Record<SlideType, React.ElementType> = {
  'title-text': Type,
  'title-image': Image,
  'title-code': Code2,
  'title-bullets': List,
  'quote': Quote,
  'comparison': Columns2,
  'free-layout': Layout,
}

function getTitle(slide: SlideWithContent): string {
  const c = slide.content as unknown as Record<string, unknown>
  if (c.title) return String(c.title)
  if (c.quote) return String(c.quote).slice(0, 40) + '…'
  return 'Sans titre'
}

interface Props {
  slide: SlideWithContent
  index: number
  selected: boolean
  onSelect: () => void
  onDelete: () => void
  dragHandleProps?: Record<string, unknown>
}

export function SlideThumbnail({ slide, index, selected, onSelect, onDelete, dragHandleProps }: Props) {
  const Icon = ICONS[slide.type]

  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer group transition-all duration-150',
        selected
          ? 'bg-accent/10 border border-accent/30'
          : 'border border-transparent hover:bg-light-text/5 dark:hover:bg-dark-text/5'
      )}
    >
      {/* Drag handle */}
      <div
        {...(dragHandleProps as Record<string, unknown>)}
        className="text-light-text/20 dark:text-dark-text/20 hover:text-light-text/50 dark:hover:text-dark-text/50 cursor-grab active:cursor-grabbing flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={13} />
      </div>

      {/* Numéro */}
      <span className={cn('text-[11px] font-mono w-4 text-center flex-shrink-0', selected ? 'text-accent' : 'text-light-text/35 dark:text-dark-text/35')}>
        {index + 1}
      </span>

      {/* Icône + info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon size={11} className={selected ? 'text-accent' : 'text-light-text/40 dark:text-dark-text/40'} />
          <span className="text-[10px] text-light-text/40 dark:text-dark-text/40 uppercase tracking-wide">{SLIDE_TYPE_LABELS[slide.type]}</span>
        </div>
        <div className="text-xs font-medium text-light-text dark:text-dark-text truncate">{getTitle(slide)}</div>
      </div>

      {/* Supprimer */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 text-light-text/30 dark:text-dark-text/30 hover:bg-red-500/10 hover:text-red-400 transition-all flex-shrink-0"
      >
        <Trash2 size={11} />
      </button>
    </div>
  )
}
