'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { BarChart2, TrendingUp, Layers } from 'lucide-react'

type Stats = {
  sessionsByMonth: { month: string; sessions: number; viewers: number }[]
  recentSessions: { label: string; viewers: number; date: string }[]
  slidesByType: { type: string; count: number }[]
}

const SLIDE_TYPE_LABELS: Record<string, string> = {
  title:    'Titre',
  content:  'Contenu',
  code:     'Code',
  quiz:     'Quiz',
  image:    'Image',
  video:    'Vidéo',
  blank:    'Vide',
  split:    'Double',
}

const PIE_COLORS = ['#00D4FF', '#C8B89A', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

const tooltipStyle = {
  contentStyle: {
    background: '#1C1C1C',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#CCCCCC',
    fontSize: '12px',
  },
  cursor: { fill: 'rgba(0,212,255,0.06)' },
}

export function FormateurStatsCharts() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/formateur/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5 h-64 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  const hasSessionData = stats.sessionsByMonth.some((s) => s.sessions > 0)
  const hasViewerData = stats.recentSessions.length > 0
  const hasSlideData = stats.slidesByType.length > 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bar chart — Sessions par mois */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={15} className="text-accent" />
          <span className="text-sm font-semibold text-light-text dark:text-dark-text">Sessions live / mois</span>
        </div>
        {!hasSessionData ? (
          <Empty label="Aucune session lancée" />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.sessionsByMonth.slice(-6)} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="sessions" name="Sessions" fill="#00D4FF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="viewers" name="Participants" fill="#C8B89A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Line chart — Participants par session */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={15} className="text-violet-400" />
          <span className="text-sm font-semibold text-light-text dark:text-dark-text">Participants / session</span>
        </div>
        {!hasViewerData ? (
          <Empty label="Pas encore de données" />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats.recentSessions} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} allowDecimals={false} />
              <Tooltip
                {...tooltipStyle}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
              />
              <Line
                type="monotone"
                dataKey="viewers"
                name="Participants"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#8b5cf6' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Pie chart — Types de slides */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Layers size={15} className="text-emerald-400" />
          <span className="text-sm font-semibold text-light-text dark:text-dark-text">Types de slides</span>
        </div>
        {!hasSlideData ? (
          <Empty label="Aucun slide disponible" />
        ) : (
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie
                  data={stats.slidesByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={58}
                  paddingAngle={2}
                >
                  {stats.slidesByType.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle.contentStyle}
                  formatter={(v, name) => [v, SLIDE_TYPE_LABELS[name as string] ?? name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5 min-w-0">
              {stats.slidesByType.slice(0, 5).map((s, i) => (
                <div key={s.type} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[10px] text-light-text/60 dark:text-dark-text/60 truncate flex-1">
                    {SLIDE_TYPE_LABELS[s.type] ?? s.type}
                  </span>
                  <span className="text-[10px] font-semibold text-light-text dark:text-dark-text">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="h-44 flex items-center justify-center">
      <p className="text-xs text-light-text/30 dark:text-dark-text/30">{label}</p>
    </div>
  )
}
