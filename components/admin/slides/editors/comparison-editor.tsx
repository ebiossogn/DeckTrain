'use client'

import { Input } from '@/components/ui/input'
import { TiptapEditor } from '@/components/ui/tiptap'
import type { ComparisonContent } from '@/types/slides'

interface Props { content: ComparisonContent; onChange: (c: ComparisonContent) => void }

export function ComparisonEditor({ content, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Input
        label="Libellé du séparateur"
        value={content.dividerLabel}
        onChange={(e) => onChange({ ...content, dividerLabel: e.target.value })}
        placeholder="VS"
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Input
            label="Titre gauche"
            value={content.leftTitle}
            onChange={(e) => onChange({ ...content, leftTitle: e.target.value })}
            placeholder="Avant"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Contenu gauche</label>
            <TiptapEditor
              content={content.leftContent}
              onChange={(html) => onChange({ ...content, leftContent: html })}
              placeholder="Colonne gauche…"
              minHeight="100px"
            />
          </div>
        </div>
        <div className="space-y-3">
          <Input
            label="Titre droit"
            value={content.rightTitle}
            onChange={(e) => onChange({ ...content, rightTitle: e.target.value })}
            placeholder="Après"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Contenu droit</label>
            <TiptapEditor
              content={content.rightContent}
              onChange={(html) => onChange({ ...content, rightContent: html })}
              placeholder="Colonne droite…"
              minHeight="100px"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
