'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { ModuleWithCount } from '@/types/slides'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (module: ModuleWithCount) => void
  initial?: ModuleWithCount | null
}

export function ModuleFormModal({ open, onClose, onSave, initial }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '')
      setDescription(initial?.description ?? '')
      setError('')
    }
  }, [open, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Le titre est requis.'); return }
    setLoading(true)
    setError('')

    const url = initial ? `/api/modules/${initial.id}` : '/api/modules'
    const method = initial ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })

    if (res.ok) {
      const module: ModuleWithCount = await res.json()
      onSave(module)
      onClose()
    } else {
      setError('Une erreur est survenue.')
    }
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Modifier le module' : 'Nouveau module'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Titre *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex : Introduction à Docker"
          autoFocus
          error={error}
        />
        <Textarea
          label="Description (optionnelle)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brève description du module…"
          rows={3}
        />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" size="md" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={loading} className="flex-1">
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {initial ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
