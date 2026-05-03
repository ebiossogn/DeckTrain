'use client'

import { Input } from '@/components/ui/input'
import { TiptapEditor } from '@/components/ui/tiptap'
import type { TitleTextContent } from '@/types/slides'

interface Props { content: TitleTextContent; onChange: (c: TitleTextContent) => void }

export function TitleTextEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Input
        label="Titre"
        value={content.title}
        onChange={(e) => onChange({ ...content, title: e.target.value })}
        placeholder="Titre du slide"
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Corps du texte</label>
        <TiptapEditor
          key={content.title}
          content={content.body}
          onChange={(html) => onChange({ ...content, body: html })}
          placeholder="Contenu du slide…"
          minHeight="160px"
        />
      </div>
    </div>
  )
}
