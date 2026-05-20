'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ModuleCard } from './module-card'
import { ModuleFormModal } from './module-form-modal'
import type { ModuleWithCount } from '@/types/slides'

interface Props {
  initialModules: ModuleWithCount[]
  liveMap?: Record<string, string>
}

export function ModulesClient({ initialModules, liveMap = {} }: Props) {
  const [modules, setModules] = useState<ModuleWithCount[]>(initialModules)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ModuleWithCount | null>(null)

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (m: ModuleWithCount) => { setEditing(m); setModalOpen(true) }

  const handleSave = (saved: ModuleWithCount) => {
    setModules((prev) =>
      editing
        ? prev.map((m) => m.id === saved.id ? saved : m)
        : [...prev, saved]
    )
  }

  const handleDelete = async (id: string) => {
    const m = modules.find((m) => m.id === id)
    if (!window.confirm(`Supprimer "${m?.title}" et tous ses slides ?`)) return
    const res = await fetch(`/api/modules/${id}`, { method: 'DELETE' })
    if (res.ok) setModules((prev) => prev.filter((m) => m.id !== id))
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return
    const reordered = Array.from(modules)
    const [item] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, item)
    setModules(reordered)
    await fetch('/api/modules/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((m) => m.id) }),
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* En-tête */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text mb-1">
              Modules &amp; Slides
            </h1>
            <p className="text-light-text/55 dark:text-dark-text/55 text-sm">
              {modules.length} module{modules.length !== 1 ? 's' : ''} — glissez pour réordonner
            </p>
          </div>
          <Button variant="primary" size="md" onClick={openCreate}>
            <Plus size={15} /> Nouveau module
          </Button>
        </div>
      </motion.div>

      {/* Liste DnD */}
      {modules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
            <BookOpen size={24} />
          </div>
          <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">Aucun module</p>
          <p className="text-sm text-light-text/45 dark:text-dark-text/45 mb-6">
            Créez votre premier module de formation
          </p>
          <Button variant="primary" onClick={openCreate}>
            <Plus size={15} /> Créer le premier module
          </Button>
        </motion.div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="modules">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {modules.map((m, i) => (
                  <Draggable key={m.id} draggableId={m.id} index={i}>
                    {(drag) => (
                      <motion.div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                      >
                        <ModuleCard
                          module={m}
                          dragHandleProps={drag.dragHandleProps as unknown as Record<string, unknown>}
                          onEdit={() => openEdit(m)}
                          onDelete={() => handleDelete(m.id)}
                          liveCode={liveMap[m.id] ?? null}
                        />
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <ModuleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}
