'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, Calendar, LayoutList,
  MapPin, Clock, Monitor, X, ExternalLink,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { sanitizeHtml } from '@/lib/sanitize'
import { cn } from '@/lib/utils'
import { TYPE_CONFIG, STATUS_CONFIG_PUBLIC, type AgendaEvent } from './agenda-types'

/* ── Re-exports depuis types partagés ── */
export type { AgendaEvent }

/* ── Helpers calendrier ── */
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function getCalendarGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const dow = first.getDay()
  const offset = dow === 0 ? -6 : 1 - dow
  const start = new Date(year, month, 1 + offset)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function isEventOnDay(ev: AgendaEvent, dayStr: string) {
  return ev.startDate.slice(0, 10) <= dayStr && dayStr <= ev.endDate.slice(0, 10)
}

function getEventColor(ev: AgendaEvent) {
  return ev.color || TYPE_CONFIG[ev.type]?.color || '#00D4FF'
}

function formatDateRange(ev: AgendaEvent) {
  const s = new Date(ev.startDate)
  const e = new Date(ev.endDate)
  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  if (ev.startDate.slice(0, 10) === ev.endDate.slice(0, 10)) return fmt(s)
  return `${fmt(s)} → ${fmt(e)}`
}

/* ── Modal détails événement ── */
function EventDetailModal({ event, onClose }: { event: AgendaEvent; onClose: () => void }) {
  const color = getEventColor(event)
  const statusCfg = STATUS_CONFIG_PUBLIC[event.status as keyof typeof STATUS_CONFIG_PUBLIC] ?? STATUS_CONFIG_PUBLIC.planifie
  const isLink = event.location?.startsWith('http')

  return (
    <Modal open onClose={onClose} size="md">
      <div className="space-y-4">
        {/* Barre colorée + titre */}
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-full rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: color, minHeight: 40 }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: color + '18' }}>
                {TYPE_CONFIG[event.type]?.label ?? event.type}
              </span>
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', statusCfg.cls)}>
                {statusCfg.label}
              </span>
            </div>
            <h3 className="font-syne font-bold text-lg text-light-text dark:text-dark-text leading-snug">{event.title}</h3>
          </div>
        </div>

        {/* Dates + heures */}
        <div className="flex items-center gap-2 text-sm text-light-text/70 dark:text-dark-text/70">
          <Calendar size={14} className="flex-shrink-0" style={{ color }} />
          <span>{formatDateRange(event)}</span>
        </div>
        {(event.startTime || event.endTime) && (
          <div className="flex items-center gap-2 text-sm text-light-text/70 dark:text-dark-text/70 -mt-2">
            <Clock size={14} className="flex-shrink-0" style={{ color }} />
            <span>{event.startTime}{event.endTime && ` → ${event.endTime}`}</span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div
            className="prose-presentation text-sm text-light-text/75 dark:text-dark-text/75 leading-relaxed p-3 rounded-xl bg-light-text/3 dark:bg-dark-text/3 border border-light-text/6 dark:border-dark-text/6"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
          />
        )}

        {/* Lieu */}
        {event.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="flex-shrink-0 text-light-text/50 dark:text-dark-text/50" />
            {isLink ? (
              <a href={event.location} target="_blank" rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-1">
                {event.location} <ExternalLink size={11} />
              </a>
            ) : (
              <span className="text-light-text/70 dark:text-dark-text/70">{event.location}</span>
            )}
          </div>
        )}

        {/* Module */}
        {event.module && (
          <Link href={`/present/${event.module.id}`}
            className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
          >
            <Monitor size={14} />
            Voir le module : {event.module.title}
          </Link>
        )}
      </div>
    </Modal>
  )
}

/* ── Vue Calendrier ── */
function CalendarView({
  events, onSelect,
}: {
  events: AgendaEvent[]
  onSelect: (ev: AgendaEvent) => void
}) {
  const today = new Date()
  const todayStr = toDateStr(today)
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const grid = useMemo(() => getCalendarGrid(year, month), [year, month])

  const prev = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()) }

  return (
    <div>
      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-xl bg-light-text/5 dark:bg-dark-text/5 hover:bg-accent/10 hover:text-accent transition-colors">
            <ChevronLeft size={16} />
          </button>
          <h2 className="font-syne font-bold text-lg text-light-text dark:text-dark-text min-w-[180px] text-center">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-xl bg-light-text/5 dark:bg-dark-text/5 hover:bg-accent/10 hover:text-accent transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <button onClick={goToday} className="px-3 py-1.5 rounded-xl text-xs font-medium border border-accent/30 text-accent hover:bg-accent/10 transition-colors">
          Aujourd'hui
        </button>
      </div>

      {/* En-têtes jours */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-light-text/35 dark:text-dark-text/35 py-2">{d}</div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-px bg-light-text/8 dark:bg-dark-text/8 rounded-2xl overflow-hidden border border-light-text/8 dark:border-dark-text/8">
        {grid.map((day, idx) => {
          const dayStr = toDateStr(day)
          const isCurrentMonth = day.getMonth() === month
          const isToday = dayStr === todayStr
          const dayEvents = events.filter((ev) => isEventOnDay(ev, dayStr))
          const shown = dayEvents.slice(0, 2)
          const overflow = dayEvents.length - 2

          return (
            <div
              key={idx}
              className={cn(
                'bg-light-surface dark:bg-dark-surface p-1.5 min-h-[88px]',
                !isCurrentMonth && 'opacity-35',
              )}
            >
              <div className={cn(
                'w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 mx-auto',
                isToday
                  ? 'bg-accent text-dark-bg font-bold'
                  : 'text-light-text/70 dark:text-dark-text/70'
              )}>
                {day.getDate()}
              </div>
              <div className="space-y-0.5">
                {shown.map((ev) => {
                  const c = getEventColor(ev)
                  return (
                    <button
                      key={ev.id}
                      onClick={() => onSelect(ev)}
                      className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate transition-opacity hover:opacity-80"
                      style={{ backgroundColor: c + '22', color: c }}
                    >
                      {ev.title}
                    </button>
                  )
                })}
                {overflow > 0 && (
                  <p className="text-[10px] text-center text-light-text/40 dark:text-dark-text/40 font-medium">
                    +{overflow}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Vue Timeline ── */
function TimelineView({
  events, onSelect,
}: {
  events: AgendaEvent[]
  onSelect: (ev: AgendaEvent) => void
}) {
  const todayStr = toDateStr(new Date())

  /* Grouper par mois */
  const grouped = useMemo(() => {
    const map: Record<string, AgendaEvent[]> = {}
    for (const ev of events) {
      const key = ev.startDate.slice(0, 7) // 'YYYY-MM'
      if (!map[key]) map[key] = []
      map[key].push(ev)
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [events])

  if (grouped.length === 0) return (
    <div className="text-center py-16 text-light-text/40 dark:text-dark-text/40">
      <Calendar size={28} className="mx-auto mb-3 opacity-40" />
      <p>Aucun événement à afficher.</p>
    </div>
  )

  return (
    <div className="space-y-8">
      {grouped.map(([monthKey, monthEvents]) => {
        const [y, m] = monthKey.split('-').map(Number)
        return (
          <div key={monthKey}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="font-syne font-bold text-sm text-light-text/60 dark:text-dark-text/60 uppercase tracking-wider">
                {MONTHS[m - 1]} {y}
              </h3>
              <div className="flex-1 h-px bg-light-text/8 dark:bg-dark-text/8" />
            </div>
            <div className="pl-5 border-l-2 border-light-text/8 dark:border-dark-text/8 space-y-2.5">
              {monthEvents.map((ev) => {
                const color = getEventColor(ev)
                const isPast = ev.endDate.slice(0, 10) < todayStr && ev.status !== 'en_cours'
                const statusCfg = STATUS_CONFIG_PUBLIC[ev.status as keyof typeof STATUS_CONFIG_PUBLIC] ?? STATUS_CONFIG_PUBLIC.planifie
                return (
                  <button
                    key={ev.id}
                    onClick={() => onSelect(ev)}
                    className={cn(
                      'relative w-full text-left flex gap-4 rounded-2xl border p-4 transition-all',
                      'bg-light-surface dark:bg-dark-surface border-light-text/8 dark:border-dark-text/8',
                      'hover:border-light-text/20 dark:hover:border-dark-text/20 hover:shadow-sm',
                      isPast && 'opacity-60'
                    )}
                  >
                    {/* Dot sur la ligne */}
                    <div
                      className="absolute -left-[22px] top-5 w-3 h-3 rounded-full border-2 border-light-bg dark:border-dark-bg"
                      style={{ backgroundColor: color }}
                    />
                    {/* Barre colorée */}
                    <div className="w-1 rounded-full flex-shrink-0 self-stretch" style={{ backgroundColor: color }} />
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={cn('font-syne font-bold text-sm text-light-text dark:text-dark-text', ev.status === 'annule' && 'line-through opacity-50')}>
                          {ev.title}
                        </p>
                        <span className={cn('flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border', statusCfg.cls)}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-light-text/50 dark:text-dark-text/50">
                        <span style={{ color }}>{TYPE_CONFIG[ev.type]?.label ?? ev.type}</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDateRange(ev)}
                          {ev.startTime && <span className="ml-1">· {ev.startTime}{ev.endTime && `→${ev.endTime}`}</span>}
                        </span>
                        {ev.location && <span className="flex items-center gap-1"><MapPin size={10} />{ev.location}</span>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Composant principal ── */
interface Props { events: AgendaEvent[] }

export function AgendaPublicClient({ events }: Props) {
  const [view, setView] = useState<'calendar' | 'timeline'>('calendar')
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set())
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null)

  const toggleType = (t: string) => setActiveTypes((prev) => {
    const s = new Set(prev)
    s.has(t) ? s.delete(t) : s.add(t)
    return s
  })

  const filtered = activeTypes.size === 0
    ? events
    : events.filter((e) => activeTypes.has(e.type))

  const upcoming = events.filter((e) => e.startDate.slice(0, 10) >= toDateStr(new Date())).length

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-14">
      {/* ── En-tête ── */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/8 text-amber-400 text-xs font-medium mb-5">
          <Calendar size={12} />
          Agenda annuel
        </div>
        <h1 className="font-syne text-4xl font-bold text-light-text dark:text-dark-text mb-2">
          Calendrier des formations
        </h1>
        <p className="text-light-text/55 dark:text-dark-text/55 mb-6">
          Formations, examens, réunions et ateliers — toute l'année.
        </p>
        {events.length > 0 && (
          <div className="flex gap-6">
            <div>
              <span className="font-syne text-2xl font-bold text-accent">{events.length}</span>
              <span className="text-xs text-light-text/40 dark:text-dark-text/40 ml-2 uppercase tracking-wider">événement{events.length !== 1 ? 's' : ''}</span>
            </div>
            <div>
              <span className="font-syne text-2xl font-bold text-amber-400">{upcoming}</span>
              <span className="text-xs text-light-text/40 dark:text-dark-text/40 ml-2 uppercase tracking-wider">à venir</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Contrôles ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Switcher vue */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-light-text/5 dark:bg-dark-text/5 border border-light-text/8 dark:border-dark-text/8 self-start">
          {([['calendar', Calendar, 'Calendrier'], ['timeline', LayoutList, 'Liste']] as const).map(([v, Icon, label]) => (
            <button key={v} onClick={() => setView(v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                view === v ? 'bg-accent/15 text-accent' : 'text-light-text/55 dark:text-dark-text/55 hover:text-light-text dark:hover:text-dark-text'
              )}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* Filtres par type */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {activeTypes.size > 0 && (
            <button onClick={() => setActiveTypes(new Set())}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-light-text/10 dark:border-dark-text/10 text-light-text/50 dark:text-dark-text/50 hover:text-red-400 hover:border-red-400/25 transition-colors">
              <X size={11} />Tout afficher
            </button>
          )}
          {(Object.entries(TYPE_CONFIG) as [string, { label: string; color: string }][]).map(([key, cfg]) => {
            const active = activeTypes.has(key)
            const count = events.filter((e) => e.type === key).length
            if (count === 0) return null
            return (
              <button key={key} onClick={() => toggleType(key)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={active ? { color: cfg.color, backgroundColor: cfg.color + '18', borderColor: cfg.color + '40' } : undefined}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
                <span className="opacity-50">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Vue ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'calendar'
            ? <CalendarView events={filtered} onSelect={setSelectedEvent} />
            : <TimelineView events={filtered} onSelect={setSelectedEvent} />
          }
        </motion.div>
      </AnimatePresence>

      {/* ── Modal détails ── */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  )
}
