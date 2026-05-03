'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Plus, PenTool, GripVertical, Pencil, Trash2, BookOpen,
  CheckCircle, X, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { TiptapEditor } from '@/components/ui/tiptap'
import { cn } from '@/lib/utils'
import {
  DIFFICULTY_LABELS, DIFFICULTY_COLORS,
  type ExerciseWithContent, type ExerciseType, type Difficulty,
  type QcmContent, type QcmChoice,
} from '@/types/exercises'
import type { ModuleWithCount } from '@/types/slides'

/* ── Couleurs par type ── */
const TYPE_STYLES: Record<ExerciseType, string> = {
  qcm: 'text-violet-400 bg-violet-400/10 border-violet-400/25',
  atelier: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
}
const TYPE_LABELS: Record<ExerciseType, string> = { qcm: 'QCM', atelier: 'Atelier' }

/* ── État initial du formulaire ── */
function emptyForm() {
  return {
    title: '',
    type: 'qcm' as ExerciseType,
    difficulty: 'facile' as Difficulty,
    question: '',
    choices: [
      { id: '1', text: '', correct: true },
      { id: '2', text: '', correct: false },
      { id: '3', text: '', correct: false },
      { id: '4', text: '', correct: false },
    ] as QcmChoice[],
    explanation: '',
    description: '',
    solution: '',
  }
}

/* ── Formulaire depuis un exercice existant ── */
function formFromExercise(ex: ExerciseWithContent) {
  const base = { title: ex.title, type: ex.type, difficulty: ex.difficulty, solution: ex.solution ?? '' }
  if (ex.type === 'qcm') {
    const c = ex.content as QcmContent
    return {
      ...emptyForm(),
      ...base,
      question: c.question || '',
      choices: c.choices?.length
        ? c.choices
        : emptyForm().choices,
      explanation: c.explanation || '',
    }
  }
  return { ...emptyForm(), ...base, description: (ex.content as { description: string }).description || '' }
}

interface Props {
  initialModules: ModuleWithCount[]
}

export function ExercisesClient({ initialModules }: Props) {
  const [modules] = useState<ModuleWithCount[]>(initialModules)
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModules[0]?.id ?? '')
  const [exercises, setExercises] = useState<ExerciseWithContent[]>([])
  const [loading, setLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ExerciseWithContent | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  /* ── Chargement des exercices ── */
  const loadExercises = useCallback(async (moduleId: string) => {
    if (!moduleId) return
    setLoading(true)
    const res = await fetch(`/api/modules/${moduleId}/exercises`)
    if (res.ok) setExercises(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { loadExercises(selectedModuleId) }, [selectedModuleId, loadExercises])

  /* ── Modal create/edit ── */
  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setError('')
    setModalOpen(true)
  }

  const openEdit = (ex: ExerciseWithContent) => {
    setEditing(ex)
    setForm(formFromExercise(ex))
    setError('')
    setModalOpen(true)
  }

  /* ── Helpers form ── */
  const setField = <K extends keyof ReturnType<typeof emptyForm>>(k: K, v: ReturnType<typeof emptyForm>[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const setChoice = (idx: number, text: string) =>
    setForm((f) => ({ ...f, choices: f.choices.map((c, i) => i === idx ? { ...c, text } : c) }))

  const setCorrect = (idx: number) =>
    setForm((f) => ({ ...f, choices: f.choices.map((c, i) => ({ ...c, correct: i === idx })) }))

  /* ── Validation ── */
  const validate = () => {
    if (!form.title.trim()) return 'Le titre est requis.'
    if (form.type === 'qcm') {
      if (!form.question.trim()) return 'La question est requise.'
      if (!form.choices.some((c) => c.correct)) return 'Marquez une réponse correcte.'
      if (form.choices.filter((c) => c.text.trim()).length < 2) return 'Au moins 2 choix sont requis.'
    }
    if (form.type === 'atelier' && !form.description.trim()) return 'La description est requise.'
    return ''
  }

  /* ── Sauvegarde ── */
  const handleSave = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setSaving(true)
    const content = form.type === 'qcm'
      ? { question: form.question, choices: form.choices.filter((c) => c.text.trim()), explanation: form.explanation }
      : { description: form.description }

    const url = editing
      ? `/api/modules/${selectedModuleId}/exercises/${editing.id}`
      : `/api/modules/${selectedModuleId}/exercises`
    const method = editing ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, type: form.type, content, difficulty: form.difficulty, solution: form.solution }),
    })
    if (res.ok) {
      const saved: ExerciseWithContent = await res.json()
      setExercises((prev) =>
        editing ? prev.map((e) => e.id === saved.id ? saved : e) : [...prev, saved]
      )
      setModalOpen(false)
    } else {
      setError('Erreur lors de la sauvegarde.')
    }
    setSaving(false)
  }

  /* ── Suppression ── */
  const handleDelete = async (ex: ExerciseWithContent) => {
    if (!window.confirm(`Supprimer "${ex.title}" ?`)) return
    const res = await fetch(`/api/modules/${selectedModuleId}/exercises/${ex.id}`, { method: 'DELETE' })
    if (res.ok) setExercises((prev) => prev.filter((e) => e.id !== ex.id))
  }

  /* ── Drag & Drop ── */
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return
    const reordered = Array.from(exercises)
    const [item] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, item)
    setExercises(reordered)
    await fetch(`/api/modules/${selectedModuleId}/exercises/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((e) => e.id) }),
    })
  }

  const selectedModule = modules.find((m) => m.id === selectedModuleId)

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── En-tête ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <PenTool size={22} className="text-violet-400" />
              <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">Exercices</h1>
            </div>
            <p className="text-sm text-light-text/50 dark:text-dark-text/50">
              QCM interactifs et ateliers pratiques par module
            </p>
          </div>
          <Button onClick={openCreate} disabled={!selectedModuleId} size="sm">
            <Plus size={15} />
            Nouvel exercice
          </Button>
        </div>
      </motion.div>

      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen size={32} className="text-light-text/20 dark:text-dark-text/20 mb-4" />
          <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">Aucun module</p>
          <p className="text-sm text-light-text/45 dark:text-dark-text/45">Créez d'abord un module dans Modules &amp; Slides.</p>
        </div>
      ) : (
        <>
          {/* ── Onglets modules ── */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-thin">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModuleId(m.id)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border',
                  m.id === selectedModuleId
                    ? 'bg-accent/12 border-accent/30 text-accent'
                    : 'border-light-text/8 dark:border-dark-text/8 text-light-text/55 dark:text-dark-text/55 hover:bg-light-text/5 dark:hover:bg-dark-text/5 hover:text-light-text dark:hover:text-dark-text'
                )}
              >
                {m.title}
              </button>
            ))}
          </div>

          {/* ── Liste des exercices ── */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
            </div>
          ) : exercises.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-400/10 text-violet-400 flex items-center justify-center mb-4">
                <PenTool size={20} />
              </div>
              <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">
                Aucun exercice pour {selectedModule?.title}
              </p>
              <p className="text-sm text-light-text/45 dark:text-dark-text/45 mb-5">
                Ajoutez un QCM ou un atelier pratique.
              </p>
              <Button onClick={openCreate} size="sm" variant="secondary">
                <Plus size={14} /> Créer le premier exercice
              </Button>
            </motion.div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="exercises">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {exercises.map((ex, i) => (
                      <Draggable key={ex.id} draggableId={ex.id} index={i}>
                        {(drag, snap) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            className={cn(
                              'flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-colors',
                              'bg-light-surface dark:bg-dark-surface border-light-text/8 dark:border-dark-text/8',
                              snap.isDragging && 'shadow-xl border-accent/20 bg-accent/4'
                            )}
                          >
                            <span {...drag.dragHandleProps} className="text-light-text/20 dark:text-dark-text/20 hover:text-light-text/50 dark:hover:text-dark-text/50 cursor-grab active:cursor-grabbing transition-colors">
                              <GripVertical size={16} />
                            </span>
                            <span className="font-mono text-xs text-light-text/30 dark:text-dark-text/30 w-5 text-center">{i + 1}</span>
                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0', TYPE_STYLES[ex.type])}>
                              {TYPE_LABELS[ex.type]}
                            </span>
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0', DIFFICULTY_COLORS[ex.difficulty])}>
                              {DIFFICULTY_LABELS[ex.difficulty]}
                            </span>
                            <span className="flex-1 text-sm font-medium text-light-text dark:text-dark-text truncate">{ex.title}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => openEdit(ex)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-accent hover:bg-accent/10 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(ex)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
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
        </>
      )}

      {/* ── Modal Create / Edit ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier l\'exercice' : 'Nouvel exercice'}
        size="xl"
      >
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Titre */}
          <Input
            label="Titre"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="ex: Qu'est-ce que le DNS ?"
          />

          {/* Type + Difficulté */}
          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Type</p>
              <div className="flex gap-2">
                {(['qcm', 'atelier'] as ExerciseType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setField('type', t)}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                      form.type === t
                        ? 'bg-accent/12 border-accent/30 text-accent'
                        : 'border-light-text/10 dark:border-dark-text/10 text-light-text/55 dark:text-dark-text/55 hover:border-accent/20'
                    )}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulté */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Difficulté</p>
              <div className="flex gap-1.5">
                {(['facile', 'intermediaire', 'avance'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setField('difficulty', d)}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs font-medium border transition-all',
                      form.difficulty === d
                        ? DIFFICULTY_COLORS[d]
                        : 'border-light-text/10 dark:border-dark-text/10 text-light-text/55 dark:text-dark-text/55 hover:border-current/20'
                    )}
                  >
                    {DIFFICULTY_LABELS[d]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Champs QCM ── */}
          <AnimatePresence mode="wait">
            {form.type === 'qcm' && (
              <motion.div
                key="qcm"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <Textarea
                  label="Question"
                  value={form.question}
                  onChange={(e) => setField('question', e.target.value)}
                  placeholder="Quelle est la différence entre TCP et UDP ?"
                  rows={2}
                />

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                    Choix <span className="text-light-text/35 dark:text-dark-text/35 text-xs">(cliquez le bouton ● pour marquer la bonne réponse)</span>
                  </p>
                  {form.choices.map((choice, i) => (
                    <div key={choice.id} className="flex items-center gap-2">
                      <button
                        onClick={() => setCorrect(i)}
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all',
                          choice.correct
                            ? 'border-accent bg-accent'
                            : 'border-light-text/20 dark:border-dark-text/20 hover:border-accent/50'
                        )}
                      >
                        {choice.correct && <CheckCircle size={12} className="text-dark-bg m-auto" />}
                      </button>
                      <input
                        value={choice.text}
                        onChange={(e) => setChoice(i, e.target.value)}
                        placeholder={`Choix ${i + 1}`}
                        className={cn(
                          'flex-1 rounded-xl px-3 py-2.5 text-sm',
                          'bg-light-text/5 dark:bg-dark-text/5',
                          'border border-light-text/10 dark:border-dark-text/10',
                          'text-light-text dark:text-dark-text placeholder:text-light-text/30 dark:placeholder:text-dark-text/30',
                          'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all',
                          choice.correct && 'border-accent/30'
                        )}
                      />
                    </div>
                  ))}
                </div>

                <Textarea
                  label="Explication (optionnel)"
                  value={form.explanation}
                  onChange={(e) => setField('explanation', e.target.value)}
                  placeholder="Affiché après la réponse — ex: TCP garantit la livraison, UDP privilégie la vitesse."
                  rows={2}
                />
              </motion.div>
            )}

            {/* ── Champs Atelier ── */}
            {form.type === 'atelier' && (
              <motion.div
                key="atelier"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Description</p>
                  <div className="rounded-xl border border-light-text/10 dark:border-dark-text/10 overflow-hidden">
                    <TiptapEditor
                      content={form.description}
                      onChange={(v) => setField('description', v)}
                      placeholder="Décrivez l'atelier pratique..."
                    />
                  </div>
                </div>

                <Textarea
                  label="Solution (optionnel)"
                  value={form.solution}
                  onChange={(e) => setField('solution', e.target.value)}
                  placeholder="Correction ou éléments de réponse attendus..."
                  rows={3}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Erreur + Actions ── */}
          {error && (
            <p className="text-sm text-red-400 flex items-center gap-2">
              <X size={14} />{error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-light-text/8 dark:border-dark-text/8">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
