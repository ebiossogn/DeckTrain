'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { TitleCodeContent } from '@/types/slides'

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'bash', 'sql',
  'html', 'css', 'json', 'yaml', 'go', 'rust', 'java',
  'php', 'markdown', 'dockerfile',
]

interface Props { content: TitleCodeContent; onChange: (c: TitleCodeContent) => void }

export function TitleCodeEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Input
        label="Titre"
        value={content.title}
        onChange={(e) => onChange({ ...content, title: e.target.value })}
        placeholder="Exemple de code"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Langage</label>
        <select
          value={content.language}
          onChange={(e) => onChange({ ...content, language: e.target.value })}
          className="w-full rounded-xl px-4 py-3 text-sm bg-light-text/5 dark:bg-dark-text/5 border border-light-text/10 dark:border-dark-text/10 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Code</label>
        <textarea
          value={content.code}
          onChange={(e) => onChange({ ...content, code: e.target.value })}
          rows={12}
          spellCheck={false}
          className={cn(
            'w-full rounded-xl px-4 py-3 text-sm font-mono resize-y',
            'bg-dark-surface text-dark-text',
            'border border-light-text/10 dark:border-dark-text/10',
            'focus:outline-none focus:ring-2 focus:ring-accent/40',
            'transition-all placeholder:text-dark-text/30'
          )}
          placeholder="// Votre code ici"
        />
      </div>
    </div>
  )
}
