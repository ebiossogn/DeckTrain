'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Send, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_ICONS } from '@/types/surveys'
import type { QuestionType, McqOptions, SliderOptions } from '@/types/surveys'

interface Question {
  id: string
  type: QuestionType
  title: string
  options: string | null
  multiple: boolean
}

interface Survey {
  id: string
  title: string
  description: string | null
  code: string
  isLive: boolean
  questions: Question[]
}

const RESPONDENT_KEY = 'dt_respondent_id'
function getRespondentId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(RESPONDENT_KEY)
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(RESPONDENT_KEY, id) }
  return id
}

/* ── Questions individuelles ── */
function McqQuestion({ question, value, onChange }: { question: Question; value: string; onChange: (v: string) => void }) {
  const parsed = question.options ? (JSON.parse(question.options) as McqOptions).choices : []
  const selected: string[] = value ? (question.multiple ? JSON.parse(value) : [value]) : []

  const toggle = (choice: string) => {
    if (question.multiple) {
      const arr = selected.includes(choice) ? selected.filter((x) => x !== choice) : [...selected, choice]
      onChange(arr.length > 0 ? JSON.stringify(arr) : '')
    } else {
      onChange(value === choice ? '' : choice)
    }
  }

  return (
    <div className="space-y-2">
      {parsed.map((c) => (
        <button key={c} onClick={() => toggle(c)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all duration-150',
            selected.includes(c)
              ? 'border-accent bg-accent/10 text-white'
              : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/8'
          )}>
          <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
            selected.includes(c) ? 'border-accent bg-accent' : 'border-white/30')}>
            {selected.includes(c) && <Check size={11} className="text-black" />}
          </div>
          <span className="font-medium text-sm">{c}</span>
        </button>
      ))}
    </div>
  )
}

function WordCloudQuestion({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      className="w-full bg-white/8 border-2 border-white/10 focus:border-accent rounded-2xl px-5 py-4 text-white text-lg placeholder-white/30 focus:outline-none transition-colors text-center font-syne"
      placeholder="Entrez un mot ou une idée…"
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, 50))}
      maxLength={50}
    />
  )
}

function RatingQuestion({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = Number(value) || 0
  return (
    <div className="flex items-center justify-center gap-3">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onClick={() => onChange(selected === s ? '' : String(s))}
          className="transition-all duration-150 hover:scale-110">
          <Star size={44}
            className={cn('transition-colors', s <= selected ? 'text-amber-400 fill-amber-400' : 'text-white/20')} />
        </button>
      ))}
    </div>
  )
}

function QaQuestion({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      className="w-full bg-white/8 border-2 border-white/10 focus:border-accent rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none transition-colors resize-none text-sm leading-relaxed"
      placeholder="Votre réponse…"
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={500}
    />
  )
}

function SliderQuestion({ question, value, onChange }: { question: Question; value: string; onChange: (v: string) => void }) {
  const opts = question.options ? (JSON.parse(question.options) as SliderOptions) : { min: 0, max: 100, leftLabel: '', rightLabel: '' }
  const num = value !== '' ? Number(value) : Math.round((opts.min + opts.max) / 2)
  return (
    <div className="space-y-4">
      <div className="text-center font-syne text-5xl font-bold text-accent">{num}</div>
      <input
        type="range"
        min={opts.min}
        max={opts.max}
        value={num}
        onChange={(e) => onChange(e.target.value)}
        className="w-full accent-[#00D4FF] h-2 rounded-full appearance-none bg-white/15 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-white/40">
        <span>{opts.leftLabel}</span>
        <span>{opts.rightLabel}</span>
      </div>
    </div>
  )
}

/* ── Composant principal ── */
export function SurveyRespondent({ survey: initial }: { survey: Survey }) {
  const [survey, setSurvey]   = useState(initial)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const respondentId = useRef('')

  useEffect(() => { respondentId.current = getRespondentId() }, [])

  /* Polling toutes les 3s pour détecter si le sondage passe en live */
  useEffect(() => {
    if (survey.isLive) return
    const id = setInterval(async () => {
      const res = await fetch(`/api/surveys/public/${survey.code}`)
      if (res.ok) {
        const data = await res.json()
        if (data.isLive) setSurvey(data)
      }
    }, 3000)
    return () => clearInterval(id)
  }, [survey.isLive, survey.code])

  const setAnswer = (qId: string, val: string) => setAnswers((p) => ({ ...p, [qId]: val }))

  const handleSubmit = async () => {
    const responses = survey.questions
      .filter((q) => answers[q.id] !== undefined && answers[q.id] !== '')
      .map((q) => ({ questionId: q.id, value: answers[q.id] }))

    if (responses.length === 0) { return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/surveys/public/${survey.code}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, respondent: respondentId.current }),
      })
      if (res.ok) setSubmitted(true)
    } catch { /* silent */ }
    finally { setSubmitting(false) }
  }

  const q = survey.questions[currentIdx]
  const isLast = currentIdx === survey.questions.length - 1
  const answeredAll = survey.questions.every((q) => answers[q.id] && answers[q.id] !== '')

  if (!survey.isLive) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/8 flex items-center justify-center mx-auto">
          <span className="text-3xl">⏳</span>
        </div>
        <h2 className="font-syne text-xl font-bold text-white">Sondage pas encore ouvert</h2>
        <p className="text-white/45 text-sm">Le formateur lancera le sondage dans un moment. Cette page se met à jour automatiquement.</p>
        <div className="flex items-center justify-center gap-2 text-white/25 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white/25 animate-pulse" />
          En attente…
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
          <Check size={36} />
        </div>
        <h2 className="font-syne text-2xl font-bold text-white">Merci !</h2>
        <p className="text-white/50">Vos réponses ont été enregistrées.</p>
      </motion.div>
    )
  }

  if (survey.questions.length === 0) {
    return <div className="text-center text-white/40 py-12">Aucune question dans ce sondage.</div>
  }

  return (
    <div className="space-y-6">
      {/* Progression */}
      <div className="flex items-center gap-3">
        {survey.questions.map((_, i) => (
          <button key={i} onClick={() => setCurrentIdx(i)}
            className={cn('flex-1 h-1 rounded-full transition-all duration-200',
              i < currentIdx || answers[survey.questions[i].id] ? 'bg-accent' :
              i === currentIdx ? 'bg-accent/50' : 'bg-white/15')}>
          </button>
        ))}
      </div>
      <p className="text-white/30 text-xs text-right">{currentIdx + 1} / {survey.questions.length}</p>

      {/* Question courante */}
      <AnimatePresence mode="wait">
        <motion.div key={q.id}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
          className="space-y-6">
          <div>
            <span className="text-xs text-white/35 uppercase tracking-wider">
              {QUESTION_TYPE_ICONS[q.type]} {QUESTION_TYPE_LABELS[q.type]}
            </span>
            <h3 className="font-syne text-xl font-bold text-white mt-1 leading-snug">{q.title}</h3>
          </div>

          {q.type === 'mcq'       && <McqQuestion       question={q} value={answers[q.id] ?? ''} onChange={(v) => setAnswer(q.id, v)} />}
          {q.type === 'wordcloud' && <WordCloudQuestion  value={answers[q.id] ?? ''} onChange={(v) => setAnswer(q.id, v)} />}
          {q.type === 'rating'    && <RatingQuestion     value={answers[q.id] ?? ''} onChange={(v) => setAnswer(q.id, v)} />}
          {q.type === 'qa'        && <QaQuestion         value={answers[q.id] ?? ''} onChange={(v) => setAnswer(q.id, v)} />}
          {q.type === 'slider'    && <SliderQuestion     question={q} value={answers[q.id] ?? ''} onChange={(v) => setAnswer(q.id, v)} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((p) => p - 1)}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 disabled:opacity-0 transition-all">
          <ChevronLeft size={20} />
        </button>

        {isLast ? (
          <Button variant="primary" size="md" onClick={handleSubmit}
            disabled={submitting || !answeredAll}
            className="px-8 rounded-xl">
            <Send size={15} />
            {submitting ? 'Envoi…' : 'Soumettre'}
          </Button>
        ) : (
          <button onClick={() => setCurrentIdx((p) => p + 1)}
            className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent/15 text-accent hover:bg-accent/25 transition-colors">
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
