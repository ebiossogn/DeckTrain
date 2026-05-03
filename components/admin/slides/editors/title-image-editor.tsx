'use client'

import { useRef } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { TitleImageContent } from '@/types/slides'

const positions = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centre' },
  { value: 'right', label: 'Droite' },
] as const

interface Props { content: TitleImageContent; onChange: (c: TitleImageContent) => void }

export function TitleImageEditor({ content, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      onChange({ ...content, imageUrl: url })
    }
  }

  return (
    <div className="space-y-4">
      <Input
        label="Titre"
        value={content.title}
        onChange={(e) => onChange({ ...content, title: e.target.value })}
        placeholder="Titre du slide"
      />

      {/* Zone d'upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Image</label>
        {content.imageUrl ? (
          <div className="relative group rounded-xl overflow-hidden border border-light-text/10 dark:border-dark-text/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.imageUrl} alt={content.altText} className="w-full h-40 object-cover" />
            <button
              onClick={() => onChange({ ...content, imageUrl: '' })}
              className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-light-text/15 dark:border-dark-text/15 text-light-text/40 dark:text-dark-text/40 hover:border-accent/40 hover:text-accent transition-colors"
          >
            <Upload size={20} />
            <span className="text-xs">Cliquer pour importer (max 5 Mo)</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
        />
      </div>

      <Input
        label="Texte alternatif"
        value={content.altText}
        onChange={(e) => onChange({ ...content, altText: e.target.value })}
        placeholder="Description de l'image"
        icon={<ImageIcon size={14} />}
      />

      {/* Position */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Position</label>
        <div className="flex gap-2">
          {positions.map((p) => (
            <button
              key={p.value}
              onClick={() => onChange({ ...content, position: p.value })}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                content.position === p.value
                  ? 'bg-accent/15 border-accent/40 text-accent'
                  : 'border-light-text/10 dark:border-dark-text/10 text-light-text/55 dark:text-dark-text/55 hover:border-accent/20'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
