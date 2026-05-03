'use client'

import { Input } from '@/components/ui/input'
import { TiptapEditor } from '@/components/ui/tiptap'
import type { FreeLayoutContent } from '@/types/slides'

interface Props { content: FreeLayoutContent; onChange: (c: FreeLayoutContent) => void }

export function FreeLayoutEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Input
        label="Titre"
        value={content.title}
        onChange={(e) => onChange({ ...content, title: e.target.value })}
        placeholder="Titre du slide"
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Contenu libre</label>
        <TiptapEditor
          content={content.body}
          onChange={(html) => onChange({ ...content, body: html })}
          placeholder="Canvas libre — titres, listes, code, citations…"
          minHeight="240px"
        />
      </div>
    </div>
  )
}
