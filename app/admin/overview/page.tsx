import { prisma } from '@/lib/prisma'
import { DashboardClient } from '@/components/admin/overview/dashboard-client'
import type { DashboardData } from '@/components/admin/overview/dashboard-client'
import { SLIDE_TYPE_LABELS } from '@/types/slides'

/* ── Couleurs par type de slide ── */
const SLIDE_TYPE_COLORS: Record<string, string> = {
  'title-text':    '#00D4FF',
  'title-bullets': '#3b82f6',
  'title-code':    '#8b5cf6',
  'title-image':   '#10b981',
  'quote':         '#f59e0b',
  'comparison':    '#f43f5e',
  'free-layout':   '#94a3b8',
}

/* ── Couleurs par type agenda ── */
const AGENDA_TYPE_COLORS: Record<string, string> = {
  formation:  '#00D4FF',
  examen:     '#f59e0b',
  reunion:    '#8b5cf6',
  atelier:    '#3b82f6',
  conference: '#10b981',
  autre:      '#94a3b8',
}
const AGENDA_TYPE_LABELS: Record<string, string> = {
  formation: 'Formation', examen: 'Examen', reunion: 'Réunion',
  atelier: 'Atelier', conference: 'Conférence', autre: 'Autre',
}

export default async function AdminOverviewPage() {
  const [modules, allSlides, allExercises, allEvents] = await Promise.all([
    prisma.module.findMany({
      where: { isDeleted: false },
      orderBy: { order: 'asc' },
      include: { _count: { select: { slides: true, exercises: true } } },
    }),
    prisma.slide.findMany({ where: { isDeleted: false }, select: { type: true } }),
    prisma.exercise.findMany({ where: { isDeleted: false }, select: { type: true, difficulty: true } }),
    prisma.agendaSession.findMany({ where: { isDeleted: false }, select: { type: true, status: true } }),
  ])

  /* ── Stats KPI ── */
  const totalSlides    = allSlides.length
  const totalExercises = allExercises.length
  const totalEvents    = allEvents.length
  const qcmCount       = allExercises.filter((e) => e.type === 'qcm').length
  const atelierCount   = allExercises.filter((e) => e.type === 'atelier').length
  const upcomingEvents = allEvents.filter((e) => e.status === 'planifie' || e.status === 'en_cours').length
  const avgSlides      = modules.length ? Math.round(totalSlides / modules.length) : 0

  /* ── Données bar modules ── */
  const moduleData = modules.map((m) => ({
    name: m.title.length > 14 ? m.title.slice(0, 14) + '…' : m.title,
    slides:    m._count.slides,
    exercices: m._count.exercises,
  }))

  /* ── Données donut types de slides ── */
  const slideCounts: Record<string, number> = {}
  for (const s of allSlides) slideCounts[s.type] = (slideCounts[s.type] ?? 0) + 1
  const slideTypeData = Object.entries(slideCounts)
    .map(([type, value]) => ({
      name:  SLIDE_TYPE_LABELS[type as keyof typeof SLIDE_TYPE_LABELS] ?? type,
      value,
      color: SLIDE_TYPE_COLORS[type] ?? '#94a3b8',
    }))
    .sort((a, b) => b.value - a.value)

  /* ── Données bar difficulté exercices ── */
  const difficultyData = [
    { name: 'Facile',        value: allExercises.filter((e) => e.difficulty === 'facile').length,        color: '#10b981' },
    { name: 'Intermédiaire', value: allExercises.filter((e) => e.difficulty === 'intermediaire').length, color: '#f59e0b' },
    { name: 'Avancé',        value: allExercises.filter((e) => e.difficulty === 'avance').length,        color: '#f43f5e' },
  ].filter((d) => d.value > 0)

  /* ── Données donut agenda par type ── */
  const agendaCounts: Record<string, number> = {}
  for (const e of allEvents) agendaCounts[e.type] = (agendaCounts[e.type] ?? 0) + 1
  const agendaTypeData = Object.entries(agendaCounts)
    .map(([type, value]) => ({
      name:  AGENDA_TYPE_LABELS[type] ?? type,
      value,
      color: AGENDA_TYPE_COLORS[type] ?? '#94a3b8',
    }))
    .filter((d) => d.value > 0)

  const data: DashboardData = {
    stats: {
      modules:       modules.length,
      slides:        totalSlides,
      exercises:     totalExercises,
      events:        totalEvents,
      upcomingEvents,
      qcmCount,
      atelierCount,
      avgSlides,
    },
    moduleData,
    slideTypeData,
    difficultyData,
    agendaTypeData,
  }

  return <DashboardClient data={data} />
}
