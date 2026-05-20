'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Calendar, Pencil, Trash2, MapPin, Clock,
  X, BookOpen, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { TiptapEditor } from '@/components/ui/tiptap'
import { cn } from '@/lib/utils'
import type { ModuleWithCount } from '@/types/slides'
import { ConfirmModal } from '@/components/ui/confirm-modal'

/* ── Types ── */
export type EventType = 'formation' | 'examen' | 'reunion' | 'atelier' | 'conference' | 'autre'
type StatusKey = 'planifie' | 'en_cours' | 'termine' | 'annule'

export const TYPE_CONFIG: Record<EventType, { label: string; color: string }> = {
  formation:  { label: 'Formation',   color: '#00D4FF' },
  examen:     { label: 'Examen',      color: '#f59e0b' },
  reunion:    { label: 'Réunion',     color: '#8b5cf6' },
  atelier:    { label: 'Atelier',     color: '#3b82f6' },
  conference: { label: 'Conférence',  color: '#10b981' },
  autre:      { label: 'Autre',       color: '#94a3b8' },
}

const STATUS_CONFIG: Record<StatusKey, { label: string; cls: string }> = {
  planifie: { label: 'Planifié',  cls: 'text-accent bg-accent/10 border-accent/25' },
  en_cours: { label: 'En cours',  cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25' },
  termine:  { label: 'Terminé',   cls: 'text-dark-text/40 bg-dark-text/5 border-dark-text/10' },
  annule:   { label: 'Annulé',    cls: 'text-red-400 bg-red-400/10 border-red-400/25' },
}

const PRESET_COLORS = [
  '#00D4FF', '#f59e0b', '#8b5cf6', '#3b82f6',
  '#10b981', '#f43f5e', '#84cc16', '#f97316',
]

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

/* ── Helpers ── */
function toDateStr(iso: string) { return iso.slice(0, 10) }

function formatDateRange(startIso: string, endIso: string) {
  const s = new Date(startIso)
  const e = new Date(endIso)
  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  return toDateStr(startIso) === toDateStr(endIso) ? fmt(s) : `${fmt(s)} → ${fmt(e)}`
}

function emptyForm() {
  return {
    title: '', type: 'formation' as EventType,
    startDate: '', endDate: '',
    startTime: '', endTime: '',
    description: '', location: '',
    moduleId: '', status: 'planifie' as StatusKey,
    color: '',
  }
}

function formFrom(ev: AgendaEvent) {
  return {
    title: ev.title, type: ev.type,
    startDate: toDateStr(ev.startDate), endDate: toDateStr(ev.endDate),
    startTime: ev.startTime ?? '', endTime: ev.endTime ?? '',
    description: ev.description ?? '', location: ev.location ?? '',
    moduleId: ev.moduleId ?? '', status: ev.status as StatusKey,
    color: ev.color ?? '',
  }
}

/* ── Composant principal ── */
interface Props { initialEvents: AgendaEvent[]; modules: ModuleWithCount[] }

export function AgendaClient({ initialEvents, modules }: Props) {
  const [events, setEvents] = useState<AgendaEvent[]>(initialEvents)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AgendaEvent | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [evToDelete, setEvToDelete] = useState<AgendaEvent | null>(null)

  const sf = <K extends keyof ReturnType<typeof emptyForm>>(k: K, v: ReturnType<typeof emptyForm>[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setError(''); setModalOpen(true) }
  const openEdit   = (ev: AgendaEvent) => { setEditing(ev); setForm(formFrom(ev)); setError(''); setModalOpen(true) }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Le titre est requis.'); return }
    if (!form.startDate || !form.endDate) { setError('Les dates sont requises.'); return }
    if (form.endDate < form.startDate) { setError('La date de fin doit être ≥ la date de début.'); return }
    setSaving(true)
    const url = editing ? `/api/agenda/${editing.id}` : '/api/agenda'
    const res = await fetch(url, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, moduleId: form.moduleId || null, color: form.color || null }),
    })
    if (res.ok) {
      const saved: AgendaEvent = await res.json()
      setEvents((prev) =>
        (editing
          ? prev.map((e) => e.id === saved.id ? saved : e)
          : [...prev, saved]
        ).sort((a, b) => a.startDate.localeCompare(b.startDate))
      )
      setModalOpen(false)
    } else { setError('Erreur lors de la sauvegarde.') }
    setSaving(false)
  }

  const handleDelete = (ev: AgendaEvent) => setEvToDelete(ev)

  const confirmDelete = async () => {
    if (!evToDelete) return
    if ((await fetch(`/api/agenda/${evToDelete.id}`, { method: 'DELETE' })).ok)
      setEvents((prev) => prev.filter((e) => e.id !== evToDelete.id))
    setEvToDelete(null)
  }

  const inputCls = cn(
    'w-full rounded-xl px-4 py-3 text-sm',
    'bg-light-text/5 dark:bg-dark-text/5',
    'border border-light-text/10 dark:border-dark-text/10',
    'text-light-text dark:text-dark-text',
    'placeholder:text-light-text/30 dark:placeholder:text-dark-text/30',
    'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40',
    'transition-all duration-200 [color-scheme:dark]'
  )

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Calendar size={22} className="text-amber-400" />
              <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">Agenda</h1>
            </div>
            <p className="text-sm text-light-text/50 dark:text-dark-text/50">Agenda annuel — Formations, examens, réunions et ateliers</p>
          </div>
          <Button onClick={openCreate} size="sm"><Plus size={15} />Nouvel événement</Button>
        </div>
      </motion.div>

      {events.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4">
            <Calendar size={20} />
          </div>
          <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">Aucun événement</p>
          <p className="text-sm text-light-text/45 dark:text-dark-text/45 mb-5">Créez le premier événement de l'agenda.</p>
          <Button onClick={openCreate} size="sm" variant="secondary"><Plus size={14} />Créer un événement</Button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {events.map((ev, i) => {
            const typeColor = ev.color || TYPE_CONFIG[ev.type]?.color || '#00D4FF'
            const statusCfg = STATUS_CONFIG[ev.status as StatusKey] ?? STATUS_CONFIG.planifie
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl border bg-light-surface dark:bg-dark-surface border-light-text/8 dark:border-dark-text/8 hover:border-light-text/15 dark:hover:border-dark-text/15 transition-colors"
              >
                {/* Barre colorée */}
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: typeColor }} />

                {/* Dates */}
                <div className="w-36 flex-shrink-0">
                  <p className="text-xs font-medium text-accent font-mono">
                    {formatDateRange(ev.startDate, ev.endDate)}
                  </p>
                  {(ev.startTime || ev.endTime) && (
                    <p className="text-[11px] text-light-text/40 dark:text-dark-text/40 mt-0.5">
                      {ev.startTime}{ev.endTime && ` → ${ev.endTime}`}
                    </p>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate">{ev.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: typeColor, backgroundColor: typeColor + '18' }}>
                      {TYPE_CONFIG[ev.type]?.label ?? ev.type}
                    </span>
                    {ev.location && (
                      <span className="flex items-center gap-1 text-xs text-light-text/40 dark:text-dark-text/40">
                        <MapPin size={10} />{ev.location}
                      </span>
                    )}
                    {ev.module && (
                      <span className="flex items-center gap-1 text-xs text-light-text/40 dark:text-dark-text/40">
                        <BookOpen size={10} />{ev.module.title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Statut + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border', statusCfg.cls)}>
                    {statusCfg.label}
                  </span>
                  <button onClick={() => openEdit(ev)} className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-accent hover:bg-accent/10 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(ev)} className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'événement" : 'Nouvel événement'} size="xl">
        <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">

          {/* Titre */}
          <Input label="Titre" value={form.title} onChange={(e) => sf('title', e.target.value)} placeholder="ex: Introduction aux réseaux" />

          {/* Type */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Type</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TYPE_CONFIG) as EventType[]).map((t) => (
                <button key={t} onClick={() => sf('type', t)}
                  className="py-2 rounded-xl text-xs font-medium border transition-all"
                  style={form.type === t
                    ? { color: TYPE_CONFIG[t].color, backgroundColor: TYPE_CONFIG[t].color + '18', borderColor: TYPE_CONFIG[t].color + '40' }
                    : undefined
                  }
                >
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Date de début</label>
              <input type="date" value={form.startDate} onChange={(e) => { sf('startDate', e.target.value); if (!form.endDate) sf('endDate', e.target.value) }} suppressHydrationWarning className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Date de fin</label>
              <input type="date" value={form.endDate} onChange={(e) => sf('endDate', e.target.value)} suppressHydrationWarning className={inputCls} />
            </div>
          </div>

          {/* Heures */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Heure de début <span className="text-light-text/30 dark:text-dark-text/30 text-xs">(optionnel)</span></label>
              <input type="time" value={form.startTime} onChange={(e) => sf('startTime', e.target.value)} suppressHydrationWarning className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Heure de fin <span className="text-light-text/30 dark:text-dark-text/30 text-xs">(optionnel)</span></label>
              <input type="time" value={form.endTime} onChange={(e) => sf('endTime', e.target.value)} suppressHydrationWarning className={inputCls} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Description <span className="text-light-text/30 dark:text-dark-text/30 text-xs">(optionnel)</span></p>
            <div className="rounded-xl border border-light-text/10 dark:border-dark-text/10 overflow-hidden">
              <TiptapEditor content={form.description} onChange={(v) => sf('description', v)} placeholder="Détails, objectifs, prérequis..." />
            </div>
          </div>

          {/* Lieu */}
          <Input label="Lieu ou lien visio (optionnel)" value={form.location} onChange={(e) => sf('location', e.target.value)} placeholder="ex: Salle B2 ou https://meet.google.com/..." icon={<MapPin size={14} />} />

          {/* Module lié */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Module lié <span className="text-light-text/30 dark:text-dark-text/30 text-xs">(optionnel)</span></label>
            <select value={form.moduleId} onChange={(e) => sf('moduleId', e.target.value)} className={inputCls}>
              <option value="">— Aucun —</option>
              {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>

          {/* Statut */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">Statut</p>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(STATUS_CONFIG) as StatusKey[]).map((k) => (
                <button key={k} onClick={() => sf('status', k)}
                  className={cn('py-2 rounded-xl text-xs font-medium border transition-all', form.status === k ? STATUS_CONFIG[k].cls : 'border-light-text/10 dark:border-dark-text/10 text-light-text/50 dark:text-dark-text/50 hover:border-light-text/20 dark:hover:border-dark-text/20')}
                >
                  {STATUS_CONFIG[k].label}
                </button>
              ))}
            </div>
          </div>

          {/* Couleur personnalisée */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
              Couleur personnalisée <span className="text-light-text/30 dark:text-dark-text/30 text-xs">(optionnel — remplace la couleur du type)</span>
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button key={c} onClick={() => sf('color', form.color === c ? '' : c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: form.color === c ? 'white' : 'transparent' }}
                />
              ))}
              {form.color && (
                <button onClick={() => sf('color', '')} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-light-text/50 dark:text-dark-text/50 hover:text-red-400 hover:bg-red-400/10 transition-colors border border-light-text/10 dark:border-dark-text/10">
                  <X size={10} />Effacer
                </button>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-400 flex items-center gap-2"><X size={14} />{error}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-light-text/8 dark:border-dark-text/8">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!evToDelete}
        title="Supprimer cet événement ?"
        message="Cet événement agenda sera définitivement supprimé. Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setEvToDelete(null)}
      />
    </div>
  )
}
