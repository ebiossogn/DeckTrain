'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, Loader2, Save, ArrowLeft, Clock, FileText, Layers, SlidersHorizontal, Zap, FileDown, Printer } from 'lucide-react'
import type { SlideWithContent, SlideType, SlideContent, TransitionType } from '@/types/slides'
import { getDefaultContent, TRANSITION_LABELS } from '@/types/slides'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SlideEditor } from './slide-editor'
import { SlideTypeSelector } from './slide-type-selector'
import { SlideThumbnail } from './slide-thumbnail'

interface Module { id: string; title: string; description: string | null }

interface Props {
  module: Module
  initialSlides: SlideWithContent[]
}

export function SlideManager({ module, initialSlides }: Props) {
  const router = useRouter()
  const [slides, setSlides] = useState<SlideWithContent[]>(initialSlides)
  const [selectedId, setSelectedId] = useState<string | null>(initialSlides[0]?.id ?? null)
  const [isPickingType, setIsPickingType] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [editingSlide, setEditingSlide] = useState<SlideWithContent | null>(initialSlides[0] ?? null)

  const selectSlide = (slide: SlideWithContent) => {
    setSelectedId(slide.id)
    setEditingSlide({ ...slide })
    setIsPickingType(false)
    setIsDirty(false)
  }

  const handleContentChange = (content: SlideContent) => {
    if (!editingSlide) return
    setEditingSlide((prev) => prev ? { ...prev, content } : prev)
    setIsDirty(true)
  }

  const handleNotesChange = (notes: string) => {
    if (!editingSlide) return
    setEditingSlide((prev) => prev ? { ...prev, speakerNotes: notes } : prev)
    setIsDirty(true)
  }

  const handleTimerChange = (val: string) => {
    if (!editingSlide) return
    const num = val === '' ? null : parseInt(val, 10)
    setEditingSlide((prev) => prev ? { ...prev, timerMinutes: isNaN(num as number) ? null : num } : prev)
    setIsDirty(true)
  }

  const handleTransitionChange = (t: TransitionType | '') => {
    if (!editingSlide) return
    setEditingSlide((prev) => prev ? { ...prev, transition: t === '' ? null : t } : prev)
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (!editingSlide) return
    setIsSaving(true)
    const res = await fetch(`/api/modules/${module.id}/slides/${editingSlide.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: editingSlide.content,
        speakerNotes: editingSlide.speakerNotes,
        timerMinutes: editingSlide.timerMinutes,
        transition: editingSlide.transition ?? null,
      }),
    })
    if (res.ok) {
      const updated: SlideWithContent = await res.json()
      setSlides((prev) => prev.map((s) => s.id === updated.id ? updated : s))
      setEditingSlide({ ...updated })
      setIsDirty(false)
    }
    setIsSaving(false)
  }

  const handleCreateSlide = async (type: SlideType) => {
    const res = await fetch(`/api/modules/${module.id}/slides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content: getDefaultContent(type), speakerNotes: '', timerMinutes: null }),
    })
    if (!res.ok) return
    const slide: SlideWithContent = await res.json()
    setSlides((prev) => [...prev, slide])
    selectSlide(slide)
  }

  const handleDeleteSlide = async (slideId: string) => {
    if (!window.confirm('Supprimer ce slide ?')) return
    const res = await fetch(`/api/modules/${module.id}/slides/${slideId}`, { method: 'DELETE' })
    if (!res.ok) return
    const remaining = slides.filter((s) => s.id !== slideId)
    setSlides(remaining)
    if (selectedId === slideId) {
      const next = remaining[0] ?? null
      setSelectedId(next?.id ?? null)
      setEditingSlide(next ? { ...next } : null)
      setIsDirty(false)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return
    const reordered = Array.from(slides)
    const [item] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, item)
    setSlides(reordered)
    await fetch(`/api/modules/${module.id}/slides/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((s) => s.id) }),
    })
  }

  return (
    <div className="flex h-full gap-0 -mx-8 -mt-8">
      {/* ── Panneau gauche : liste des slides ── */}
      <aside className="w-72 flex-shrink-0 h-full flex flex-col border-r border-light-text/8 dark:border-dark-text/8 bg-light-surface dark:bg-dark-surface">
        {/* Header */}
        <div className="px-4 py-4 border-b border-light-text/8 dark:border-dark-text/8">
          <Link
            href="/admin/modules"
            className="flex items-center gap-1.5 text-xs text-light-text/45 dark:text-dark-text/45 hover:text-accent transition-colors mb-3"
          >
            <ArrowLeft size={12} /> Modules
          </Link>
          <h1 className="font-syne font-bold text-sm text-light-text dark:text-dark-text leading-snug mb-1 truncate">
            {module.title}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="muted" className="text-[10px]">
              <Layers size={9} /> {slides.length} slide{slides.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <a
              href={`/print/${module.id}`}
              target="_blank"
              className="flex items-center gap-1 text-[10px] text-light-text/45 dark:text-dark-text/45 hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-accent/8"
            >
              <Printer size={11} /> PDF
            </a>
            <button
              onClick={async () => {
                const res = await fetch(`/api/modules/${module.id}/export?format=pptx`)
                if (!res.ok) return
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = `${module.title}.pptx`; a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-1 text-[10px] text-light-text/45 dark:text-dark-text/45 hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-accent/8"
            >
              <FileDown size={11} /> PPTX
            </button>
          </div>
        </div>

        {/* Bouton nouveau slide */}
        <div className="px-3 py-3 border-b border-light-text/8 dark:border-dark-text/8">
          <Button
            variant={isPickingType ? 'secondary' : 'primary'}
            size="sm"
            className="w-full"
            onClick={() => setIsPickingType((v) => !v)}
          >
            <Plus size={13} />
            {isPickingType ? 'Annuler' : 'Nouveau slide'}
          </Button>
        </div>

        {/* Liste DnD */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {slides.length === 0 ? (
            <p className="text-xs text-center text-light-text/35 dark:text-dark-text/35 py-8">
              Aucun slide — créez le premier !
            </p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="slides">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-0.5">
                    {slides.map((slide, i) => (
                      <Draggable key={slide.id} draggableId={slide.id} index={i}>
                        {(drag) => (
                          <div ref={drag.innerRef} {...drag.draggableProps}>
                            <SlideThumbnail
                              slide={slide}
                              index={i}
                              selected={selectedId === slide.id}
                              onSelect={() => selectSlide(slide)}
                              onDelete={() => handleDeleteSlide(slide.id)}
                              dragHandleProps={drag.dragHandleProps as unknown as Record<string, unknown>}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </aside>

      {/* ── Panneau droit : éditeur ── */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Sélecteur de type */}
          {isPickingType ? (
            <motion.div
              key="type-selector"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-8 max-w-lg"
            >
              <SlideTypeSelector
                onSelect={handleCreateSlide}
                onCancel={() => setIsPickingType(false)}
              />
            </motion.div>
          ) : editingSlide ? (
            /* Éditeur de slide */
            <motion.div
              key={editingSlide.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-8 max-w-3xl space-y-8"
            >
              {/* Barre type + save */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-accent" />
                  <span className="text-xs font-medium text-light-text/55 dark:text-dark-text/55 uppercase tracking-wide">
                    {editingSlide.type}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className="gap-1.5"
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {isSaving ? 'Sauvegarde…' : isDirty ? 'Enregistrer *' : 'Enregistré'}
                </Button>
              </div>

              {/* Éditeur spécifique au type */}
              <div>
                <SlideEditor
                  slide={editingSlide}
                  onChange={handleContentChange}
                />
              </div>

              {/* Notes présentateur */}
              <div className="pt-4 border-t border-light-text/8 dark:border-dark-text/8 space-y-4">
                <div className="flex items-center gap-2 text-xs font-medium text-light-text/45 dark:text-dark-text/45 uppercase tracking-wide">
                  <FileText size={12} />
                  Notes présentateur
                </div>
                <Textarea
                  value={editingSlide.speakerNotes ?? ''}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Notes visibles uniquement en mode présentateur (touche P)…"
                  rows={3}
                />
              </div>

              {/* Minuteur */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-light-text/45 dark:text-dark-text/45 uppercase tracking-wide">
                  <Clock size={12} />
                  Minuteur
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={editingSlide.timerMinutes ?? ''}
                    onChange={(e) => handleTimerChange(e.target.value)}
                    placeholder="—"
                    className="w-20 rounded-lg px-3 py-1.5 text-sm bg-light-text/5 dark:bg-dark-text/5 border border-light-text/10 dark:border-dark-text/10 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all text-center"
                  />
                  <span className="text-xs text-light-text/40 dark:text-dark-text/40">minutes</span>
                </div>
              </div>

              {/* Transition */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-light-text/45 dark:text-dark-text/45 uppercase tracking-wide flex-shrink-0">
                  <Zap size={12} />
                  Transition
                </div>
                <select
                  value={editingSlide.transition ?? ''}
                  onChange={(e) => handleTransitionChange(e.target.value as TransitionType | '')}
                  className="flex-1 max-w-xs rounded-lg px-3 py-1.5 text-sm bg-light-text/5 dark:bg-dark-text/5 border border-light-text/10 dark:border-dark-text/10 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                >
                  <option value="">— Par défaut (glissement)</option>
                  {(Object.keys(TRANSITION_LABELS) as TransitionType[]).map((t) => (
                    <option key={t} value={t}>{TRANSITION_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          ) : (
            /* État vide */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-96 text-center px-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Layers size={24} />
              </div>
              <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">
                Aucun slide
              </p>
              <p className="text-sm text-light-text/45 dark:text-dark-text/45 mb-5">
                Créez votre premier slide pour commencer
              </p>
              <Button variant="primary" size="md" onClick={() => setIsPickingType(true)}>
                <Plus size={15} /> Nouveau slide
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
