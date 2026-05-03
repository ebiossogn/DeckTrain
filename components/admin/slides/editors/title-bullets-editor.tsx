'use client'

import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { TitleBulletsContent, BulletItem } from '@/types/slides'

interface Props { content: TitleBulletsContent; onChange: (c: TitleBulletsContent) => void }

let _id = 0
const uid = () => `bullet-${Date.now()}-${++_id}`

export function TitleBulletsEditor({ content, onChange }: Props) {
  const update = (bullets: BulletItem[]) => onChange({ ...content, bullets })

  const addBullet = () => update([...content.bullets, { id: uid(), text: '' }])

  const removeBullet = (id: string) => update(content.bullets.filter((b) => b.id !== id))

  const editBullet = (id: string, text: string) =>
    update(content.bullets.map((b) => (b.id === id ? { ...b, text } : b)))

  const moveBullet = (from: number, to: number) => {
    const arr = [...content.bullets]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    update(arr)
  }

  return (
    <div className="space-y-4">
      <Input
        label="Titre"
        value={content.title}
        onChange={(e) => onChange({ ...content, title: e.target.value })}
        placeholder="Points clés"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
          Points ({content.bullets.length})
        </label>
        <div className="space-y-2">
          {content.bullets.map((bullet, i) => (
            <div key={bullet.id} className="flex items-center gap-2 group">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => i > 0 && moveBullet(i, i - 1)}
                  disabled={i === 0}
                  className="w-5 h-4 flex items-center justify-center text-light-text/20 dark:text-dark-text/20 hover:text-accent disabled:opacity-30 transition-colors text-[10px]"
                >▲</button>
                <button
                  type="button"
                  onClick={() => i < content.bullets.length - 1 && moveBullet(i, i + 1)}
                  disabled={i === content.bullets.length - 1}
                  className="w-5 h-4 flex items-center justify-center text-light-text/20 dark:text-dark-text/20 hover:text-accent disabled:opacity-30 transition-colors text-[10px]"
                >▼</button>
              </div>
              <span className="text-xs text-light-text/30 dark:text-dark-text/30 w-4 text-center">{i + 1}</span>
              <input
                value={bullet.text}
                onChange={(e) => editBullet(bullet.id, e.target.value)}
                placeholder={`Point ${i + 1}`}
                className="flex-1 rounded-xl px-3 py-2 text-sm bg-light-text/5 dark:bg-dark-text/5 border border-light-text/10 dark:border-dark-text/10 text-light-text dark:text-dark-text placeholder:text-light-text/30 dark:placeholder:text-dark-text/30 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              />
              <button
                type="button"
                onClick={() => removeBullet(bullet.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/30 dark:text-dark-text/30 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addBullet} className="self-start mt-1">
          <Plus size={13} />
          Ajouter un point
        </Button>
      </div>
    </div>
  )
}
