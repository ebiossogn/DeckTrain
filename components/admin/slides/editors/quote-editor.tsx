'use client'

import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import type { QuoteContent } from '@/types/slides'

const BG_OPTIONS: { value: QuoteContent['background']; label: string; class: string }[] = [
  { value: 'cyan', label: 'Cyan', class: 'bg-gradient-to-br from-cyan-900 to-dark-bg border-cyan-500/30' },
  { value: 'purple', label: 'Violet', class: 'bg-gradient-to-br from-purple-900 to-dark-bg border-purple-500/30' },
  { value: 'amber', label: 'Ambre', class: 'bg-gradient-to-br from-amber-900 to-dark-bg border-amber-500/30' },
  { value: 'dark', label: 'Sombre', class: 'bg-dark-surface border-dark-text/20' },
]

interface Props { content: QuoteContent; onChange: (c: QuoteContent) => void }

export function QuoteEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Textarea
        label="Citation"
        value={content.quote}
        onChange={(e) => onChange({ ...content, quote: e.target.value })}
        placeholder="Votre citation inspirante ici…"
        rows={4}
      />
      <Input
        label="Auteur / Attribution"
        value={content.author}
        onChange={(e) => onChange({ ...content, author: e.target.value })}
        placeholder="— Auteur"
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Fond</label>
        <div className="grid grid-cols-2 gap-2">
          {BG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...content, background: opt.value })}
              className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${opt.class} ${
                content.background === opt.value ? 'ring-2 ring-accent scale-[1.02]' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span className="text-white/80">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
