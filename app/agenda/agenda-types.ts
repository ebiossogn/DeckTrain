import type { EventType } from '@/components/admin/agenda/agenda-client'

export type { EventType }

export const TYPE_CONFIG: Record<EventType, { label: string; color: string }> = {
  formation:  { label: 'Formation',   color: '#00D4FF' },
  examen:     { label: 'Examen',      color: '#f59e0b' },
  reunion:    { label: 'Réunion',     color: '#8b5cf6' },
  atelier:    { label: 'Atelier',     color: '#3b82f6' },
  conference: { label: 'Conférence',  color: '#10b981' },
  autre:      { label: 'Autre',       color: '#94a3b8' },
}

export const STATUS_CONFIG_PUBLIC = {
  planifie: { label: 'Planifié',  cls: 'text-accent border-accent/25 bg-accent/8' },
  en_cours: { label: 'En cours',  cls: 'text-emerald-400 border-emerald-400/25 bg-emerald-400/8' },
  termine:  { label: 'Terminé',   cls: 'text-dark-text/40 border-dark-text/10 bg-dark-text/5' },
  annule:   { label: 'Annulé',    cls: 'text-red-400 border-red-400/25 bg-red-400/8' },
}

export interface AgendaEvent {
  id: string
  title: string
  type: EventType
  startDate: string
  endDate: string
  startTime: string | null
  endTime: string | null
  description: string | null
  location: string | null
  status: string
  color: string | null
  moduleId: string | null
  module: { id: string; title: string } | null
  createdAt: string
}
