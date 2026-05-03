'use client'

import { motion } from 'framer-motion'
import { Type, Image, Code2, List, Quote, Columns2, Layout, X } from 'lucide-react'
import type { SlideType } from '@/types/slides'
import { SLIDE_TYPE_LABELS, SLIDE_TYPE_DESCRIPTIONS } from '@/types/slides'

const ICONS: Record<SlideType, React.ElementType> = {
  'title-text': Type,
  'title-image': Image,
  'title-code': Code2,
  'title-bullets': List,
  'quote': Quote,
  'comparison': Columns2,
  'free-layout': Layout,
}

const ORDER: SlideType[] = ['title-text', 'title-image', 'title-code', 'title-bullets', 'quote', 'comparison', 'free-layout']

interface Props {
  onSelect: (type: SlideType) => void
  onCancel: () => void
}

export function SlideTypeSelector({ onSelect, onCancel }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-syne font-semibold text-light-text dark:text-dark-text">Choisir le type de slide</h3>
        <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:bg-light-text/5 dark:hover:bg-dark-text/5 transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {ORDER.map((type, i) => {
          const Icon = ICONS[type]
          return (
            <motion.button
              key={type}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              onClick={() => onSelect(type)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left border border-light-text/8 dark:border-dark-text/8 bg-light-surface dark:bg-dark-surface hover:border-accent/35 hover:bg-accent/5 transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
                <Icon size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-light-text dark:text-dark-text">{SLIDE_TYPE_LABELS[type]}</div>
                <div className="text-xs text-light-text/45 dark:text-dark-text/45 truncate">{SLIDE_TYPE_DESCRIPTIONS[type]}</div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
