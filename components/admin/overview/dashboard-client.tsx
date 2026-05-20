'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  BookOpen, PenTool, Calendar, Layers, Monitor,
  Plus, ArrowRight, CheckSquare, Settings,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/* ── Types ── */
export interface ChartSlice  { name: string; value: number; color: string }
export interface ModuleBar   { name: string; slides: number; exercices: number }

export interface DashboardData {
  stats: {
    modules: number
    slides: number
    exercises: number
    events: number
    upcomingEvents: number
    qcmCount: number
    atelierCount: number
    avgSlides: number
  }
  moduleData:    ModuleBar[]
  slideTypeData: ChartSlice[]
  difficultyData:ChartSlice[]
  agendaTypeData:ChartSlice[]
}

/* ── Tooltip personnalisé (thème sombre) ── */
function DarkTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color?: string; fill?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-dark-text/10 bg-dark-surface px-3 py-2.5 shadow-2xl text-xs backdrop-blur">
      {label && <p className="font-semibold text-dark-text/55 mb-2 uppercase tracking-wider text-[10px]">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-dark-text/60">{p.name}</span>
          <span className="font-bold text-dark-text ml-auto pl-3">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Donut avec label centré ── */
function DonutCenterLabel({ viewBox, value, label }: { viewBox?: { cx: number; cy: number }; value: number; label: string }) {
  const { cx = 0, cy = 0 } = viewBox ?? {}
  return (
    <text textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} y={cy - 9} fontSize={22} fontWeight={700} fill="#E8F4FF">{value}</tspan>
      <tspan x={cx} y={cy + 11} fontSize={10} fill="rgba(232,244,255,0.4)">{label}</tspan>
    </text>
  )
}

/* ── Carte KPI ── */
function KpiCard({
  icon: Icon, label, value, sub, color, delay,
}: {
  icon: React.ElementType; label: string; value: number; sub: string; color: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="p-5 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-light-text/45 dark:text-dark-text/45 uppercase tracking-wider mb-2">{label}</p>
            <p className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">{value}</p>
            <p className="text-xs text-light-text/40 dark:text-dark-text/40 mt-1.5">{sub}</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18', color }}>
            <Icon size={20} />
          </div>
        </div>
        {/* Glow de fond */}
        <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-xl" style={{ backgroundColor: color }} />
      </Card>
    </motion.div>
  )
}

/* ── Carte de graphique ── */
function ChartCard({ title, badge, children, empty }: {
  title: string; badge?: string; children: React.ReactNode; empty?: boolean
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-syne font-semibold text-sm text-light-text dark:text-dark-text">{title}</h3>
        {badge && <Badge variant="muted" className="text-[10px]">{badge}</Badge>}
      </div>
      {empty ? (
        <div className="flex items-center justify-center h-48 text-light-text/25 dark:text-dark-text/25 text-xs">
          Aucune donnée
        </div>
      ) : children}
    </Card>
  )
}

/* ── Couleurs Recharts globales ── */
const AXIS_COLOR = 'rgba(232,244,255,0.3)'
const GRID_COLOR = 'rgba(232,244,255,0.05)'

/* ── Sections de navigation ── */
const NAV_SECTIONS = [
  { href: '/admin/modules',   icon: BookOpen,   label: 'Modules & Slides',  desc: 'Créez et organisez les modules de formation.',            color: '#00D4FF' },
  { href: '/admin/exercises', icon: PenTool,    label: 'Exercices',         desc: 'Gérez les QCM et ateliers pratiques.',                   color: '#8b5cf6' },
  { href: '/admin/agenda',    icon: Calendar,   label: 'Agenda',            desc: 'Planifiez les sessions et événements annuels.',          color: '#f59e0b' },
  { href: '/admin/settings',  icon: Settings,   label: 'Paramètres',        desc: "Configurez l'application et les options globales.",      color: '#10b981' },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp  = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

/* ── Composant principal ── */
export function DashboardClient({ data }: { data: DashboardData }) {
  const { stats, moduleData, slideTypeData, difficultyData, agendaTypeData } = data

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── En-tête ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text mb-1">
          Vue d'ensemble
        </h1>
        <p className="text-light-text/50 dark:text-dark-text/50">
          Bienvenue dans le back-office DeckTrain — tableau de bord de formation.
        </p>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Layers}     label="Modules"    value={stats.modules}   sub={`${stats.avgSlides} slides en moy.`}              color="#00D4FF" delay={0.05} />
        <KpiCard icon={BookOpen}   label="Slides"     value={stats.slides}    sub={slideTypeData.length ? `${slideTypeData.length} types utilisés` : 'Aucun type'} color="#3b82f6" delay={0.10} />
        <KpiCard icon={CheckSquare}label="Exercices"  value={stats.exercises} sub={`${stats.qcmCount} QCM · ${stats.atelierCount} ateliers`} color="#8b5cf6" delay={0.15} />
        <KpiCard icon={Calendar}   label="Événements" value={stats.events}    sub={`${stats.upcomingEvents} à venir`}                  color="#f59e0b" delay={0.20} />
      </div>

      {/* ── Actions rapides ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="flex flex-wrap gap-3"
      >
        <Link href="/present" target="_blank">
          <Button variant="primary" size="md"><Monitor size={15} />Mode présentation</Button>
        </Link>
        <Link href="/admin/modules">
          <Button variant="secondary" size="md"><Plus size={15} />Nouveau module</Button>
        </Link>
        <Link href="/exercises" target="_blank">
          <Button variant="ghost" size="md"><PenTool size={15} />Exercices publics</Button>
        </Link>
      </motion.div>

      {/* ── Graphiques : ligne 1 ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-5"
      >
        {/* Bar chart modules (3/5) */}
        <div className="lg:col-span-3">
          <ChartCard title="Slides & exercices par module" badge={`${stats.modules} modules`} empty={moduleData.length === 0}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={moduleData} barSize={10} barGap={3}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="name" tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(232,244,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: AXIS_COLOR, paddingTop: 8 }} iconSize={8} iconType="circle" />
                <Bar dataKey="slides"    name="Slides"    fill="#00D4FF" radius={[4,4,0,0]} />
                <Bar dataKey="exercices" name="Exercices" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Donut types de slides (2/5) */}
        <div className="lg:col-span-2">
          <ChartCard title="Types de slides" badge={`${stats.slides} total`} empty={slideTypeData.length === 0}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={slideTypeData} cx="50%" cy="45%"
                  innerRadius={62} outerRadius={88}
                  dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270}
                >
                  {slideTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                  <DonutCenterLabel value={stats.slides} label="slides" />
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: AXIS_COLOR, paddingTop: 4 }} iconSize={8} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </motion.div>

      {/* ── Graphiques : ligne 2 ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.45 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {/* Bar difficulté exercices */}
        <ChartCard title="Exercices par difficulté" badge={`${stats.exercises} exercices`} empty={difficultyData.length === 0}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={difficultyData} barSize={28} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID_COLOR} />
              <XAxis dataKey="name" tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(232,244,255,0.03)' }} />
              <Bar dataKey="value" name="Exercices" radius={[6,6,0,0]}>
                {difficultyData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Donut agenda par type */}
        <ChartCard title="Agenda par type d'événement" badge={`${stats.events} événements`} empty={agendaTypeData.length === 0}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={agendaTypeData} cx="50%" cy="45%"
                innerRadius={52} outerRadius={76}
                dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270}
              >
                {agendaTypeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
                <DonutCenterLabel value={stats.events} label="événements" />
              </Pie>
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: AXIS_COLOR, paddingTop: 4 }} iconSize={8} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      {/* ── Navigation sections ── */}
      <motion.div
        variants={stagger} initial="hidden" animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {NAV_SECTIONS.map((s) => (
          <motion.div key={s.href} variants={fadeUp}>
            <Link href={s.href} className="block h-full">
              <Card hoverable className="p-5 h-full group">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ backgroundColor: s.color + '18', color: s.color }}>
                    <s.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-syne font-semibold text-sm text-light-text dark:text-dark-text mb-0.5">{s.label}</h3>
                    <p className="text-xs text-light-text/50 dark:text-dark-text/50 truncate">{s.desc}</p>
                  </div>
                  <ArrowRight size={15} className="text-light-text/20 dark:text-dark-text/20 group-hover:text-accent transition-colors flex-shrink-0" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

    </div>
  )
}
