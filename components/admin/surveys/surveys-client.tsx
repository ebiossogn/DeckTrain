'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  BarChart2, Plus, X, Radio, RadioTower, Trash2, QrCode,
  Download, ChevronRight, ArrowLeft, Eye, Plus as PlusIcon,
  GripVertical, Check, Star,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LiveResults } from '@/components/surveys/live-results'
import { exportResultsCSV } from '@/lib/survey-utils'
import type { SurveyData, SurveyQuestionData, QuestionType, SurveyResults } from '@/types/surveys'
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_ICONS } from '@/types/surveys'
import { cn } from '@/lib/utils'
import { ConfirmModal } from '@/components/ui/confirm-modal'

const ALL_TYPES: QuestionType[] = ['mcq', 'wordcloud', 'rating', 'qa', 'slider']

/* ── Builder de question ── */
interface DraftQuestion {
  key: string
  type: QuestionType
  title: string
  options?: string
  multiple?: boolean
}

function newDraft(type: QuestionType): DraftQuestion {
  const key = Date.now().toString()
  if (type === 'mcq') return { key, type, title: '', options: JSON.stringify({ choices: ['', ''] }), multiple: false }
  if (type === 'slider') return { key, type, title: '', options: JSON.stringify({ min: 0, max: 100, leftLabel: 'Pas du tout', rightLabel: 'Totalement' }) }
  return { key, type, title: '' }
}

function QuestionBuilder({ q, onChange, onRemove, index }: {
  q: DraftQuestion
  onChange: (q: DraftQuestion) => void
  onRemove: () => void
  index: number
}) {
  const choices = q.type === 'mcq' ? (JSON.parse(q.options ?? '{"choices":[]}') as { choices: string[] }).choices : []
  const sliderOpts = q.type === 'slider' ? (JSON.parse(q.options ?? '{}') as { min: number; max: number; leftLabel: string; rightLabel: string }) : null

  const setChoices = (arr: string[]) => onChange({ ...q, options: JSON.stringify({ choices: arr }) })
  const setSlider = (k: string, v: string | number) => onChange({ ...q, options: JSON.stringify({ ...sliderOpts, [k]: v }) })

  return (
    <div className="border border-dark-text/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="text-dark-text/25 flex-shrink-0" />
        <span className="text-[10px] text-dark-text/40 uppercase tracking-wider flex-1">
          {QUESTION_TYPE_ICONS[q.type]} Q{index + 1} — {QUESTION_TYPE_LABELS[q.type]}
        </span>
        <button onClick={onRemove} className="text-dark-text/30 hover:text-red-400 transition-colors">
          <X size={13} />
        </button>
      </div>

      <input
        className="w-full bg-transparent border-b border-dark-text/15 pb-1.5 text-sm text-dark-text focus:outline-none focus:border-accent transition-colors placeholder-dark-text/30"
        placeholder="Énoncé de la question…"
        value={q.title}
        onChange={(e) => onChange({ ...q, title: e.target.value })}
      />

      {q.type === 'mcq' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button onClick={() => onChange({ ...q, multiple: !q.multiple })}
              className={cn('flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors',
                q.multiple ? 'bg-accent/12 text-accent' : 'bg-dark-text/5 text-dark-text/45 hover:bg-dark-text/8')}>
              <div className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center',
                q.multiple ? 'bg-accent border-accent' : 'border-dark-text/30')}>
                {q.multiple && <Check size={9} className="text-dark-bg" />}
              </div>
              Choix multiples
            </button>
          </div>
          {choices.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-dark-text/20 flex-shrink-0" />
              <input
                className="flex-1 bg-transparent text-sm text-dark-text focus:outline-none border-b border-dark-text/10 pb-0.5 placeholder-dark-text/30"
                placeholder={`Option ${i + 1}`}
                value={c}
                onChange={(e) => { const n = [...choices]; n[i] = e.target.value; setChoices(n) }}
              />
              {choices.length > 2 && (
                <button onClick={() => setChoices(choices.filter((_, j) => j !== i))} className="text-dark-text/25 hover:text-red-400">
                  <X size={11} />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setChoices([...choices, ''])}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent/70 transition-colors">
            <PlusIcon size={11} /> Ajouter une option
          </button>
        </div>
      )}

      {q.type === 'slider' && sliderOpts && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="text-[10px] text-dark-text/35 uppercase">Label gauche</label>
            <input className="w-full bg-transparent border-b border-dark-text/15 pb-1 text-dark-text focus:outline-none focus:border-accent text-sm mt-1"
              value={sliderOpts.leftLabel} onChange={(e) => setSlider('leftLabel', e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] text-dark-text/35 uppercase">Label droite</label>
            <input className="w-full bg-transparent border-b border-dark-text/15 pb-1 text-dark-text focus:outline-none focus:border-accent text-sm mt-1"
              value={sliderOpts.rightLabel} onChange={(e) => setSlider('rightLabel', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Modal création / édition sondage ── */
function SurveyModal({ survey, onClose, onSaved }: {
  survey?: SurveyData
  onClose: () => void
  onSaved: (s: SurveyData) => void
}) {
  const isEdit = !!survey
  const [title, setTitle]   = useState(survey?.title ?? '')
  const [desc, setDesc]     = useState(survey?.description ?? '')
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    survey?.questions.map((q) => ({ key: q.id, type: q.type as QuestionType, title: q.title, options: q.options ?? undefined, multiple: q.multiple })) ?? []
  )
  const [loading, setLoading] = useState(false)

  const addQuestion = (type: QuestionType) => setQuestions((p) => [...p, newDraft(type)])
  const updateQ     = (key: string, q: DraftQuestion) => setQuestions((p) => p.map((x) => x.key === key ? q : x))
  const removeQ     = (key: string) => setQuestions((p) => p.filter((x) => x.key !== key))

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Titre requis'); return }
    const qs = questions.filter((q) => q.title.trim())
    setLoading(true)
    try {
      const url    = isEdit ? `/api/surveys/${survey!.id}` : '/api/surveys'
      const method = isEdit ? 'PATCH' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: desc || null, questions: qs }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      toast.success(isEdit ? 'Sondage mis à jour' : 'Sondage créé')
      onSaved(data)
      onClose()
    } catch { toast.error('Erreur réseau') }
    finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        className="bg-dark-surface border border-dark-text/12 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-text/8 flex-shrink-0">
          <h2 className="font-syne font-semibold text-dark-text">{isEdit ? 'Modifier le sondage' : 'Nouveau sondage'}</h2>
          <button onClick={onClose}><X size={16} className="text-dark-text/40 hover:text-dark-text" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <Input label="Titre *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Évaluation de la formation" />
          <Input label="Description (optionnel)" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Sous-titre ou instructions" />

          <div>
            <p className="text-xs font-medium text-dark-text/55 uppercase tracking-wide mb-3">
              Questions ({questions.length})
            </p>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <QuestionBuilder key={q.key} q={q} index={i}
                  onChange={(updated) => updateQ(q.key, updated)}
                  onRemove={() => removeQ(q.key)}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {ALL_TYPES.map((t) => (
                <button key={t} onClick={() => addQuestion(t)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-dark-text/12 text-dark-text/55 hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-all">
                  <Plus size={10} /> {QUESTION_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-dark-text/8 flex gap-2 flex-shrink-0">
          <Button variant="ghost" size="md" onClick={onClose} className="flex-1">Annuler</Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? 'Sauvegarde…' : isEdit ? 'Enregistrer' : 'Créer le sondage'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Panel détail sondage ── */
function SurveyDetailPanel({ survey, onBack, onUpdated, onDeleted }: {
  survey: SurveyData
  onBack: () => void
  onUpdated: (s: SurveyData) => void
  onDeleted: (id: string) => void
}) {
  const [isLive, setIsLive]     = useState(survey.isLive)
  const [toggling, setToggling] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showQR, setShowQR]     = useState(false)
  const [results, setResults]   = useState<SurveyResults | null>(null)
  const [tab, setTab]           = useState<'results' | 'qr'>('results')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const base = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    const fetchR = async () => {
      const res = await fetch(`/api/surveys/${survey.id}/results`)
      if (res.ok) setResults(await res.json())
    }
    fetchR()
    const id = setInterval(fetchR, 2000)
    return () => clearInterval(id)
  }, [survey.id])

  const toggleLive = async () => {
    setToggling(true)
    try {
      const res = await fetch(`/api/surveys/${survey.id}/live`, { method: 'POST' })
      if (!res.ok) { toast.error('Erreur'); return }
      const data = await res.json()
      setIsLive(data.isLive)
      toast.success(data.isLive ? '🔴 Sondage en direct !' : 'Sondage arrêté')
    } catch { toast.error('Erreur réseau') }
    finally { setToggling(false) }
  }

  const handleDelete = () => setConfirmDelete(true)

  const doDelete = async () => {
    setConfirmDelete(false)
    const res = await fetch(`/api/surveys/${survey.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Sondage supprimé'); onDeleted(survey.id) }
  }

  const exportCSV = () => {
    if (!results) { toast.error('Pas encore de données'); return }
    const csv = exportResultsCSV(survey.title, results.questions)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `sondage-${survey.code}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success('Export CSV téléchargé')
  }

  const printPDF = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Barre du haut */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-dark-text/45 hover:text-accent transition-colors">
          <ArrowLeft size={13} /> Retour
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-syne font-bold text-lg text-light-text dark:text-dark-text truncate">{survey.title}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-sm text-accent font-bold tracking-widest">{survey.code}</span>
            <span className="text-dark-text/30 text-xs">{survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle Live */}
          <Button
            variant={isLive ? 'danger' : 'primary'}
            size="sm"
            onClick={toggleLive}
            disabled={toggling}
            className="gap-1.5"
          >
            {isLive ? <RadioTower size={13} className="animate-pulse" /> : <Radio size={13} />}
            {isLive ? 'Arrêter' : 'Lancer en live'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}><Eye size={13} /></Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-400 hover:bg-red-400/10">
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      {/* Statut live */}
      {isLive && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-400">Sondage en cours</p>
            <p className="text-xs text-emerald-400/60">
              Participants → <span className="font-mono font-bold">{base}/surveys/{survey.code}</span>
            </p>
          </div>
          <a href={`/present/survey/${survey.code}`} target="_blank"
            className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-400/30 px-2 py-1 rounded-lg">
            Vue présentation ↗
          </a>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark-text/8">
        {([
          { key: 'results', label: 'Résultats live' },
          { key: 'qr', label: 'QR Code' },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === key ? 'border-accent text-accent' : 'border-transparent text-dark-text/45 hover:text-dark-text')}>
            {label}
          </button>
        ))}
        <div className="flex-1" />
        {/* Export buttons */}
        <div className="flex items-center gap-1 pb-1">
          <Button variant="ghost" size="sm" onClick={exportCSV} title="Export CSV">
            <Download size={13} /> CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={printPDF} title="Imprimer PDF">
            <Download size={13} /> PDF
          </Button>
        </div>
      </div>

      {tab === 'results' && (
        <div className="print:block">
          <div className="print:hidden">
            <LiveResults code={survey.code} pollInterval={2000} />
          </div>
          {/* Print version */}
          <div className="hidden print:block space-y-4">
            <h1 className="text-2xl font-bold">{survey.title}</h1>
            <p>Code : {survey.code} — {results?.totalRespondents ?? 0} participants</p>
            {results?.questions.map((q) => (
              <div key={q.questionId} className="border p-4 rounded">
                <h3 className="font-bold">{q.title}</h3>
                <p>Réponses : {q.result.total}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'qr' && (
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="p-6 bg-white rounded-2xl shadow-xl">
            <QRCodeSVG
              value={`${base}/surveys/${survey.code}`}
              size={200}
              bgColor="#ffffff"
              fgColor="#0A0A0F"
              level="M"
            />
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-mono font-bold text-accent tracking-[0.3em]">{survey.code}</p>
            <p className="text-sm text-dark-text/45">
              {base}/surveys/{survey.code}
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => {
            const canvas = document.querySelector('canvas') as HTMLCanvasElement | null
            if (canvas) {
              const a = document.createElement('a')
              a.href = canvas.toDataURL('image/png')
              a.download = `qr-${survey.code}.png`
              a.click()
            } else {
              toast.info('Faites clic droit sur le QR code pour télécharger')
            }
          }}>
            <Download size={14} /> Télécharger le QR Code
          </Button>
        </div>
      )}

      <AnimatePresence>
        {showEdit && (
          <SurveyModal
            survey={survey}
            onClose={() => setShowEdit(false)}
            onSaved={(s) => { onUpdated(s); setShowEdit(false) }}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmDelete}
        title="Supprimer ce sondage ?"
        message="Ce sondage et toutes ses réponses seront définitivement supprimés. Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

/* ── Composant principal ── */
export function SurveysClient({ initial }: { initial: SurveyData[] }) {
  const [surveys, setSurveys]     = useState(initial)
  const [selected, setSelected]   = useState<SurveyData | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 size={22} className="text-accent" />
            <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">Sondages</h1>
          </div>
          {!selected && (
            <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Nouveau sondage
            </Button>
          )}
        </div>
        <p className="text-light-text/50 dark:text-dark-text/50 mt-1">
          Créez des sondages interactifs et collectez des réponses en temps réel.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <SurveyDetailPanel
              survey={selected}
              onBack={() => setSelected(null)}
              onUpdated={(s) => { setSurveys((p) => p.map((x) => x.id === s.id ? s : x)); setSelected(s) }}
              onDeleted={(id) => { setSurveys((p) => p.filter((x) => x.id !== id)); setSelected(null) }}
            />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {surveys.length === 0 ? (
              <Card className="p-16 text-center">
                <BarChart2 size={36} className="mx-auto text-light-text/15 dark:text-dark-text/15 mb-4" />
                <p className="font-syne font-semibold text-light-text/50 dark:text-dark-text/50 mb-1">Aucun sondage</p>
                <p className="text-sm text-light-text/30 dark:text-dark-text/30 mb-5">
                  Créez votre premier sondage pour collecter des avis en temps réel.
                </p>
                <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
                  <Plus size={15} /> Créer un sondage
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surveys.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card hoverable className="p-5 cursor-pointer group" onClick={() => setSelected(s)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-syne font-semibold text-sm text-light-text dark:text-dark-text truncate">{s.title}</h3>
                            {s.isLive && (
                              <span className="flex items-center gap-1 text-[9px] font-bold bg-emerald-500/12 text-emerald-400 px-1.5 py-0.5 rounded-full">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />LIVE
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-xs text-accent font-bold tracking-widest mb-2">{s.code}</p>
                          <div className="flex items-center gap-2 text-xs text-light-text/40 dark:text-dark-text/40">
                            <span>{s.questions.length} question{s.questions.length !== 1 ? 's' : ''}</span>
                            {s.description && <span className="truncate">{s.description}</span>}
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-light-text/20 dark:text-dark-text/20 group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreate && (
          <SurveyModal
            onClose={() => setShowCreate(false)}
            onSaved={(s) => setSurveys((p) => [s, ...p])}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
