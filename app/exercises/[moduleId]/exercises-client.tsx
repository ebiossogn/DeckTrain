'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Lightbulb, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/types/exercises'
import type { ExerciseWithContent, QcmContent, AtelierContent } from '@/types/exercises'
import { sanitizeHtml } from '@/lib/sanitize'

/* ── Carte QCM interactive ── */
function QcmCard({
  exercise,
  index,
}: {
  exercise: ExerciseWithContent
  index: number
}) {
  const content = exercise.content as QcmContent
  const [selected, setSelected] = useState<string | null>(null)
  const answered = selected !== null
  const isCorrect = answered && content.choices.find((c) => c.id === selected)?.correct

  const reset = () => setSelected(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="rounded-2xl border bg-light-surface dark:bg-dark-surface border-light-text/8 dark:border-dark-text/8 overflow-hidden"
    >
      {/* En-tête */}
      <div className="px-6 pt-5 pb-4 border-b border-light-text/6 dark:border-dark-text/6">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs text-light-text/30 dark:text-dark-text/30">{index + 1}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border text-violet-400 bg-violet-400/10 border-violet-400/25">
            QCM
          </span>
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border', DIFFICULTY_COLORS[exercise.difficulty])}>
            {DIFFICULTY_LABELS[exercise.difficulty]}
          </span>
        </div>
        <h3 className="font-syne font-bold text-light-text dark:text-dark-text mb-1">{exercise.title}</h3>
        <p className="text-sm text-light-text/70 dark:text-dark-text/70 leading-relaxed">{content.question}</p>
      </div>

      {/* Choix */}
      <div className="px-6 py-4 space-y-2.5">
        {content.choices.map((choice) => {
          const isSelected = selected === choice.id
          const showResult = answered
          const correct = choice.correct
          return (
            <button
              key={choice.id}
              onClick={() => !answered && setSelected(choice.id)}
              disabled={answered}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200',
                !answered && 'hover:border-accent/40 hover:bg-accent/5 cursor-pointer',
                !answered && 'border-light-text/10 dark:border-dark-text/10 text-light-text dark:text-dark-text',
                showResult && correct && 'border-emerald-400/40 bg-emerald-400/8 text-emerald-400',
                showResult && isSelected && !correct && 'border-red-400/40 bg-red-400/8 text-red-400',
                showResult && !isSelected && !correct && 'border-light-text/6 dark:border-dark-text/6 text-light-text/40 dark:text-dark-text/40'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                  !answered && 'border-light-text/20 dark:border-dark-text/20',
                  showResult && correct && 'border-emerald-400 bg-emerald-400',
                  showResult && isSelected && !correct && 'border-red-400 bg-red-400',
                  showResult && !isSelected && !correct && 'border-light-text/15 dark:border-dark-text/15'
                )}>
                  {showResult && correct && <CheckCircle size={11} className="text-dark-bg" />}
                  {showResult && isSelected && !correct && <XCircle size={11} className="text-white" />}
                </span>
                {choice.text}
              </div>
            </button>
          )
        })}
      </div>

      {/* Feedback + reset */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 space-y-3">
              <div className={cn(
                'flex items-center gap-2 text-sm font-medium',
                isCorrect ? 'text-emerald-400' : 'text-red-400'
              )}>
                {isCorrect
                  ? <><CheckCircle size={16} /> Bonne réponse !</>
                  : <><XCircle size={16} /> Mauvaise réponse — la bonne réponse est surlignée en vert.</>
                }
              </div>

              {content.explanation && (
                <div className="flex gap-2 p-3 rounded-xl bg-accent/6 border border-accent/15">
                  <Lightbulb size={14} className="text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-light-text/70 dark:text-dark-text/70 leading-relaxed">{content.explanation}</p>
                </div>
              )}

              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-light-text/40 dark:text-dark-text/40 hover:text-accent transition-colors"
              >
                <RotateCcw size={12} /> Réessayer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Carte Atelier ── */
function AtelierCard({
  exercise,
  index,
  defaultSolutionVisible,
}: {
  exercise: ExerciseWithContent
  index: number
  defaultSolutionVisible: boolean
}) {
  const content = exercise.content as AtelierContent
  const [showSolution, setShowSolution] = useState(defaultSolutionVisible)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="rounded-2xl border bg-light-surface dark:bg-dark-surface border-light-text/8 dark:border-dark-text/8 overflow-hidden"
    >
      {/* En-tête */}
      <div className="px-6 pt-5 pb-4 border-b border-light-text/6 dark:border-dark-text/6">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs text-light-text/30 dark:text-dark-text/30">{index + 1}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border text-blue-400 bg-blue-400/10 border-blue-400/25">
            Atelier
          </span>
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border', DIFFICULTY_COLORS[exercise.difficulty])}>
            {DIFFICULTY_LABELS[exercise.difficulty]}
          </span>
        </div>
        <h3 className="font-syne font-bold text-light-text dark:text-dark-text">{exercise.title}</h3>
      </div>

      {/* Description */}
      <div className="px-6 py-4">
        <div
          className="prose-presentation text-sm text-light-text/80 dark:text-dark-text/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.description) }}
        />
      </div>

      {/* Solution toggle */}
      {exercise.solution && (
        <div className="px-6 pb-5">
          <button
            onClick={() => setShowSolution((v) => !v)}
            className="flex items-center gap-2 text-xs font-medium text-accent hover:text-accent/80 transition-colors mb-2"
          >
            <Lightbulb size={13} />
            {showSolution ? 'Masquer la solution' : 'Voir la solution'}
            {showSolution ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <AnimatePresence>
            {showSolution && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-accent/6 border border-accent/15">
                  <p className="text-xs text-light-text/70 dark:text-dark-text/70 whitespace-pre-wrap leading-relaxed">
                    {exercise.solution}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

/* ── Composant principal ── */
export function ExercisesPageClient({
  exercises,
  defaultSolutionVisible,
}: {
  exercises: ExerciseWithContent[]
  defaultSolutionVisible: boolean
}) {
  return (
    <div className="space-y-4">
      {exercises.map((ex, i) =>
        ex.type === 'qcm' ? (
          <QcmCard key={ex.id} exercise={ex} index={i} />
        ) : (
          <AtelierCard key={ex.id} exercise={ex} index={i} defaultSolutionVisible={defaultSolutionVisible} />
        )
      )}
    </div>
  )
}
