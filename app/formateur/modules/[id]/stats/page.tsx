import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Layers, PenTool, Zap, Users, Clock, ArrowLeft, BarChart2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const SLIDE_TYPE_LABELS: Record<string, string> = {
  title: 'Titre', content: 'Contenu', code: 'Code',
  quiz: 'Quiz', image: 'Image', video: 'Vidéo', blank: 'Vide', split: 'Double',
}

export default async function ModuleStatsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const appUser = await prisma.appUser.findUnique({
    where: { id: session.user.id },
    select: { moduleIds: true },
  })

  const assignedIds: string[] = appUser?.moduleIds
    ? (JSON.parse(appUser.moduleIds) as string[])
    : []

  // Vérifier l'accès au module
  if (assignedIds.length > 0 && !assignedIds.includes(params.id)) {
    notFound()
  }

  const [mod, liveSessions] = await Promise.all([
    prisma.module.findUnique({
      where: { id: params.id, isDeleted: false },
      include: {
        slides:    { where: { isDeleted: false }, select: { type: true, timerMinutes: true, order: true } },
        exercises: { where: { isDeleted: false }, select: { id: true, type: true, title: true, difficulty: true } },
        sessions:  { select: { id: true, title: true, startDate: true, status: true } },
      },
    }),
    prisma.liveSession.findMany({
      where: { moduleId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, code: true, viewerCount: true, isActive: true, createdAt: true, endedAt: true },
    }),
  ])

  if (!mod) notFound()

  const estimatedMinutes = mod.slides.reduce((s, sl) => s + (sl.timerMinutes ?? 3), 0)
  const totalViewers = liveSessions.reduce((s, ls) => s + ls.viewerCount, 0)

  // Répartition types de slides
  const typeCounts: Record<string, number> = {}
  mod.slides.forEach((s) => { typeCounts[s.type] = (typeCounts[s.type] ?? 0) + 1 })
  const typeBreakdown = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])

  // Répartition difficulté exercices
  const diffCounts: Record<string, number> = {}
  mod.exercises.forEach((e) => { diffCounts[e.difficulty] = (diffCounts[e.difficulty] ?? 0) + 1 })

  const DIFF_COLORS: Record<string, string> = {
    facile: 'text-emerald-400 bg-emerald-400/10',
    intermediaire: 'text-amber-400 bg-amber-400/10',
    avance: 'text-red-400 bg-red-400/10',
  }
  const DIFF_LABELS: Record<string, string> = {
    facile: 'Facile', intermediaire: 'Intermédiaire', avance: 'Avancé',
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <Link
          href="/formateur/modules"
          className="inline-flex items-center gap-1.5 text-xs text-light-text/45 dark:text-dark-text/45 hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          Retour aux modules
        </Link>
        <Badge variant="default" className="mb-3">Statistiques</Badge>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} />
          </div>
          <div>
            <h1 className="font-syne text-2xl font-bold text-light-text dark:text-dark-text">{mod.title}</h1>
            <p className="text-xs text-light-text/45 dark:text-dark-text/45">Statistiques détaillées du module</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Layers,   value: mod.slides.length,    label: 'Slides',          color: '#00D4FF' },
          { icon: PenTool,  value: mod.exercises.length, label: 'Exercices',       color: '#8b5cf6' },
          { icon: Zap,      value: liveSessions.length,  label: 'Sessions live',   color: '#10b981' },
          { icon: Users,    value: totalViewers,          label: 'Total participants', color: '#f59e0b' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: color + '18' }}>
              <Icon size={15} style={{ color }} />
            </div>
            <p className="text-2xl font-bold text-light-text dark:text-dark-text">{value}</p>
            <p className="text-xs text-light-text/45 dark:text-dark-text/45 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Temps estimé + types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Temps de présentation */}
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-accent" />
            <span className="text-sm font-semibold text-light-text dark:text-dark-text">Temps estimé</span>
          </div>
          <p className="text-4xl font-bold text-light-text dark:text-dark-text mb-1">
            {estimatedMinutes < 60
              ? `${estimatedMinutes} min`
              : `${Math.floor(estimatedMinutes / 60)}h${estimatedMinutes % 60 > 0 ? ` ${estimatedMinutes % 60}min` : ''}`
            }
          </p>
          <p className="text-xs text-light-text/40 dark:text-dark-text/40">
            Basé sur {mod.slides.length} slides (3 min/slide par défaut)
          </p>
        </div>

        {/* Types de slides */}
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-violet-400" />
            <span className="text-sm font-semibold text-light-text dark:text-dark-text">Types de slides</span>
          </div>
          {typeBreakdown.length === 0 ? (
            <p className="text-xs text-light-text/30 dark:text-dark-text/30">Aucun slide</p>
          ) : (
            <div className="space-y-2">
              {typeBreakdown.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-light-text/60 dark:text-dark-text/60 w-20 flex-shrink-0">
                    {SLIDE_TYPE_LABELS[type] ?? type}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-light-text/8 dark:bg-dark-text/8 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(count / mod.slides.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-light-text dark:text-dark-text w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exercices */}
      {mod.exercises.length > 0 && (
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PenTool size={15} className="text-violet-400" />
            <span className="text-sm font-semibold text-light-text dark:text-dark-text">
              Exercices ({mod.exercises.length})
            </span>
          </div>
          <div className="space-y-2">
            {mod.exercises.map((ex) => (
              <div key={ex.id} className="flex items-center gap-3 py-1.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIFF_COLORS[ex.difficulty] ?? 'text-light-text/50 bg-light-text/5'}`}>
                  {DIFF_LABELS[ex.difficulty] ?? ex.difficulty}
                </span>
                <span className="text-xs text-light-text/70 dark:text-dark-text/70 truncate flex-1">{ex.title}</span>
                <span className="text-[10px] text-light-text/35 dark:text-dark-text/35 uppercase">{ex.type}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4 pt-4 border-t border-light-text/5 dark:border-dark-text/5">
            {Object.entries(diffCounts).map(([diff, count]) => (
              <div key={diff} className="text-center">
                <p className="text-lg font-bold text-light-text dark:text-dark-text">{count}</p>
                <p className="text-[10px] text-light-text/40 dark:text-dark-text/40">{DIFF_LABELS[diff] ?? diff}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique sessions live */}
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={15} className="text-emerald-400" />
          <span className="text-sm font-semibold text-light-text dark:text-dark-text">
            Historique sessions live
          </span>
        </div>
        {liveSessions.length === 0 ? (
          <p className="text-xs text-light-text/30 dark:text-dark-text/30 py-6 text-center">
            Aucune session lancée sur ce module.
          </p>
        ) : (
          <div className="space-y-2">
            {liveSessions.map((ls) => (
              <div key={ls.id} className="flex items-center gap-3 py-2 border-b border-light-text/5 dark:border-dark-text/5 last:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ls.isActive ? 'bg-emerald-400' : 'bg-light-text/20 dark:bg-dark-text/20'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-light-text/50 dark:text-dark-text/50">#{ls.code}</p>
                  <p className="text-[10px] text-light-text/35 dark:text-dark-text/35">
                    {new Date(ls.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    {ls.endedAt && ` → ${new Date(ls.endedAt).toLocaleTimeString('fr-FR', { timeStyle: 'short' })}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={11} className="text-light-text/35 dark:text-dark-text/35" />
                  <span className="text-xs font-semibold text-light-text dark:text-dark-text">{ls.viewerCount}</span>
                </div>
                {ls.isActive && (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    En cours
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-light-text/25 dark:text-dark-text/25 text-center mt-4">
        © CHRIST J. — Tous droits réservés
      </p>
    </div>
  )
}
