'use client'

import { useState, useEffect } from 'react'
import { Loader2, Globe, Lock, Timer } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ModuleWithCount } from '@/types/slides'

type Visibility = 'private' | 'public' | 'countdown'

const VISIBILITY_OPTIONS = [
  { value: 'private'   as Visibility, icon: Lock,  label: 'Privé',            desc: 'Participants assignés uniquement' },
  { value: 'public'    as Visibility, icon: Globe, label: 'Public',            desc: 'Visible par tous' },
  { value: 'countdown' as Visibility, icon: Timer, label: 'Compte à rebours',  desc: 'Publie à une date précise' },
]

const COUNTDOWN_SUGGESTIONS = [
  "✨ Quelque chose d'extraordinaire se prépare. Cette formation va transformer votre façon de travailler !",
  "⚡ Places limitées ! Inscrivez-vous maintenant pour ne pas manquer l'ouverture.",
  "🎯 Votre prochaine montée en compétences commence ici. Préparez-vous !",
  "🌍 Rejoignez des centaines de professionnels. Soyez parmi les premiers inscrits !",
]

interface Props {
  open: boolean
  onClose: () => void
  onSave: (module: ModuleWithCount) => void
  initial?: ModuleWithCount | null
}

export function ModuleFormModal({ open, onClose, onSave, initial }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('private')
  const [publishAt, setPublishAt] = useState('')
  const [countdownMessage, setCountdownMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '')
      setDescription(initial?.description ?? '')
      setVisibility((initial?.visibility as Visibility) ?? 'private')
      setPublishAt(
        initial?.publishAt
          ? new Date(initial.publishAt).toISOString().slice(0, 16)
          : ''
      )
      setCountdownMessage(initial?.countdownMessage ?? '')
      setError('')
    }
  }, [open, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Le titre est requis.'); return }
    if (visibility === 'countdown' && !publishAt) { setError('La date de publication est requise pour le compte à rebours.'); return }
    setLoading(true)
    setError('')

    const url = initial ? `/api/modules/${initial.id}` : '/api/modules'
    const method = initial ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        visibility,
        publishAt: publishAt ? new Date(publishAt).toISOString() : null,
        countdownMessage: countdownMessage.trim() || null,
      }),
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Titre *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex : Introduction à Docker"
          autoFocus
          error={error && !title.trim() ? error : ''}
        />
        <Textarea
          label="Description (optionnelle)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brève description du module…"
          rows={2}
        />

        {/* Visibilité */}
        <div>
          <p className="text-xs font-semibold text-light-text-muted dark:text-text-secondary label-dt mb-3">
            Visibilité du module
          </p>
          <div className="grid grid-cols-3 gap-2">
            {VISIBILITY_OPTIONS.map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setVisibility(value)}
                className={cn(
                  'p-3 rounded-xl border text-center transition-all',
                  visibility === value
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-light-border dark:border-dark-border text-light-text-muted dark:text-text-secondary hover:border-accent/40'
                )}
              >
                <Icon size={16} className="mx-auto mb-1" />
                <div className="text-xs font-bold">{label}</div>
                <div className="text-[10px] mt-0.5 opacity-70 leading-tight">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Options countdown */}
        <AnimatePresence>
          {visibility === 'countdown' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 p-4 rounded-xl border border-or/20 bg-or/5"
            >
              <div>
                <label className="text-xs text-light-text-muted dark:text-text-secondary block mb-1.5 label-dt">
                  Date et heure de publication *
                </label>
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-xl px-3 py-2 text-sm bg-light-text/5 dark:bg-dark-text/5 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
              <div>
                <label className="text-xs text-light-text-muted dark:text-text-secondary block mb-1.5 label-dt">
                  Message d'annonce (optionnel)
                </label>
                <textarea
                  value={countdownMessage}
                  onChange={(e) => setCountdownMessage(e.target.value)}
                  placeholder="Message affiché pendant le compte à rebours…"
                  rows={2}
                  className="w-full rounded-xl px-3 py-2 text-sm bg-light-text/5 dark:bg-dark-text/5 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text placeholder:text-light-text-muted dark:placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                />
                <p className="text-[10px] text-light-text-muted dark:text-text-secondary mt-2 mb-1 label-dt">Suggestions :</p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {COUNTDOWN_SUGGESTIONS.map((msg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCountdownMessage(msg)}
                      className="w-full text-left text-[10px] text-light-text-muted dark:text-text-secondary hover:text-light-text dark:hover:text-dark-text bg-light-text/3 dark:bg-dark-text/3 hover:bg-light-text/6 dark:hover:bg-dark-text/6 border border-light-border dark:border-dark-border rounded-lg p-2 transition-all truncate"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="text-xs text-red-400 px-1">{error}</p>
        )}

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
