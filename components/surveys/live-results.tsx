'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import { Users, RefreshCw, Star } from 'lucide-react'
import { WordCloud } from './word-cloud'
import type { SurveyResults, QuestionResult } from '@/types/surveys'
import { QUESTION_TYPE_LABELS } from '@/types/surveys'
import { cn } from '@/lib/utils'

const COLORS = ['#00D4FF', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#f97316', '#84cc16']

function QuestionResultCard({ title, type, result, index }: {
  title: string
  type: string
  result: QuestionResult
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="bg-dark-surface/60 border border-dark-text/8 rounded-2xl p-5 space-y-4"
    >
      <div>
        <span className="text-[10px] text-dark-text/35 uppercase tracking-wider">
          {QUESTION_TYPE_LABELS[type as keyof typeof QUESTION_TYPE_LABELS] ?? type}
        </span>
        <h3 className="font-syne font-semibold text-dark-text mt-0.5">{title}</h3>
      </div>

      {result.type === 'mcq' && (
        <div className="space-y-2">
          {result.choices.map((c, i) => (
            <div key={c.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-dark-text/80 truncate max-w-[70%]">{c.label}</span>
                <span className="text-dark-text/50 font-mono">{c.count} <span className="text-dark-text/30">({c.pct}%)</span></span>
              </div>
              <div className="h-2 bg-dark-text/8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${c.pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
          <p className="text-[10px] text-dark-text/30 text-right">{result.total} réponse{result.total !== 1 ? 's' : ''}</p>
        </div>
      )}

      {result.type === 'wordcloud' && (
        <>
          <WordCloud words={result.words} />
          <p className="text-[10px] text-dark-text/30 text-right">{result.total} réponse{result.total !== 1 ? 's' : ''}</p>
        </>
      )}

      {result.type === 'rating' && (
        <div className="space-y-3">
          {/* Moyenne en grand */}
          <div className="flex items-center gap-3">
            <span className="font-syne text-4xl font-bold text-accent">{result.average}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  className={cn(s <= Math.round(result.average) ? 'text-amber-400 fill-amber-400' : 'text-dark-text/20')}
                />
              ))}
            </div>
          </div>
          {/* Distribution */}
          <div className="space-y-1">
            {result.distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-2 text-xs">
                <span className="text-dark-text/40 w-3">{d.star}</span>
                <Star size={10} className="text-amber-400/60" />
                <div className="flex-1 h-1.5 bg-dark-text/8 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: result.total > 0 ? `${(d.count / result.total) * 100}%` : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-dark-text/40 w-4 text-right">{d.count}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-dark-text/30 text-right">{result.total} vote{result.total !== 1 ? 's' : ''}</p>
        </div>
      )}

      {result.type === 'qa' && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {result.responses.length === 0 ? (
            <p className="text-dark-text/30 text-sm text-center py-4">En attente de réponses…</p>
          ) : (
            result.responses.map((r, i) => (
              <div key={i} className="px-3 py-2 rounded-xl bg-dark-text/5 text-dark-text/75 text-sm">
                {r}
              </div>
            ))
          )}
          <p className="text-[10px] text-dark-text/30 text-right">{result.total} réponse{result.total !== 1 ? 's' : ''}</p>
        </div>
      )}

      {result.type === 'slider' && (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-syne text-4xl font-bold text-accent">{result.average}</span>
            <span className="text-dark-text/40 text-sm">/ 100 moyenne</span>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={result.histogram} barSize={8} margin={{ top: 0, right: 0, left: -35, bottom: 0 }}>
              <XAxis dataKey="bucket" tick={{ fill: 'rgba(232,244,255,0.25)', fontSize: 8 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(232,244,255,0.25)', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#12121A', border: '1px solid rgba(232,244,255,0.1)', borderRadius: 8, color: '#E8F4FF', fontSize: 11 }} />
              <Bar dataKey="count" name="Réponses" radius={[3, 3, 0, 0]}>
                {result.histogram.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-dark-text/30 text-right">{result.total} réponse{result.total !== 1 ? 's' : ''}</p>
        </div>
      )}
    </motion.div>
  )
}

/* ── Composant principal ── */
interface LiveResultsProps {
  code: string
  pollInterval?: number
  compact?: boolean
}

export function LiveResults({ code, pollInterval = 2000, compact = false }: LiveResultsProps) {
  const [data, setData]       = useState<SurveyResults | null>(null)
  const [isLive, setIsLive]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`/api/surveys/public/${code}/results`)
      if (!res.ok) return
      const json = await res.json()
      setData(json)
      setIsLive(json.isLive)
      setLastUpdate(new Date())
    } catch {
      /* réseau indisponible, on ignore */
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    fetchResults()
    const id = setInterval(fetchResults, pollInterval)
    return () => clearInterval(id)
  }, [fetchResults, pollInterval])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="text-accent animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-dark-text/40">Sondage introuvable</div>
    )
  }

  return (
    <div className={cn('space-y-6', compact && 'space-y-4')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
            isLive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-dark-text/10 text-dark-text/40'
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', isLive ? 'bg-emerald-400 animate-pulse' : 'bg-dark-text/30')} />
            {isLive ? 'LIVE' : 'Hors ligne'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-dark-text/40">
            <Users size={12} />
            {data.totalRespondents} participant{data.totalRespondents !== 1 ? 's' : ''}
          </div>
        </div>
        {lastUpdate && (
          <span className="text-[10px] text-dark-text/25">
            Mis à jour {lastUpdate.toLocaleTimeString('fr-FR')}
          </span>
        )}
      </div>

      {/* Questions */}
      <AnimatePresence mode="popLayout">
        {data.questions.map((q, i) => (
          <QuestionResultCard
            key={q.questionId}
            title={q.title}
            type={q.type}
            result={q.result}
            index={i}
          />
        ))}
      </AnimatePresence>

      {data.questions.length === 0 && (
        <div className="text-center py-12 text-dark-text/30 text-sm">
          Aucune question dans ce sondage
        </div>
      )}
    </div>
  )
}
