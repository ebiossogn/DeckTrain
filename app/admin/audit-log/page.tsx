'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield, Download, Search, Filter, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type AuditEntry = {
  id: string
  userEmail: string | null
  userRole: string | null
  action: string
  resource: string
  resourceId: string | null
  details: string | null
  ip: string | null
  createdAt: string
}

const ACTION_STYLES: Record<string, { label: string; class: string }> = {
  CREATE:       { label: 'Créer',      class: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  UPDATE:       { label: 'Modifier',   class: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  DELETE:       { label: 'Supprimer',  class: 'text-red-400 bg-red-400/10 border-red-400/20' },
  RESTORE:      { label: 'Restaurer',  class: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  LOGIN:        { label: 'Connexion',  class: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  LOGOUT:       { label: 'Déconnex.', class: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
  EXPORT:       { label: 'Export',     class: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
  IMPORT:       { label: 'Import',     class: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  GENERATE_AI:  { label: 'IA',         class: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
  PASSWORD_RESET:{ label: 'Mdp reset', class: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  INVITE_ADMIN: { label: 'Invitation', class: 'text-accent bg-accent/10 border-accent/20' },
}

const ACTION_OPTIONS = ['', 'CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'EXPORT', 'GENERATE_AI', 'INVITE_ADMIN']

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('')
  const [filterEmail, setFilterEmail] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterAction) params.set('action', filterAction)
    if (filterEmail) params.set('userEmail', filterEmail)
    if (filterDateFrom) params.set('dateFrom', filterDateFrom)
    if (filterDateTo) params.set('dateTo', filterDateTo)
    const res = await fetch(`/api/audit?${params}`)
    if (res.ok) setLogs(await res.json())
    setLoading(false)
  }, [filterAction, filterEmail, filterDateFrom, filterDateTo])

  useEffect(() => { load() }, [load])

  const exportCSV = () => {
    const header = ['Date', 'Utilisateur', 'Rôle', 'Action', 'Ressource', 'ID', 'Détails', 'IP']
    const rows = logs.map((l) => [
      new Date(l.createdAt).toLocaleString('fr-FR'),
      l.userEmail ?? '',
      l.userRole ?? '',
      l.action,
      l.resource,
      l.resourceId ?? '',
      l.details ?? '',
      l.ip ?? '',
    ])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Shield size={22} className="text-accent" />
            <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">Journal d'audit</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              SUPER ADMIN
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                showFilters
                  ? 'bg-accent/10 text-accent border-accent/20'
                  : 'text-light-text/60 dark:text-dark-text/60 border-light-text/15 dark:border-dark-text/15 hover:bg-light-text/5 dark:hover:bg-dark-text/5'
              )}
            >
              <Filter size={13} />
              Filtres
            </button>
            <button
              onClick={load}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-light-text/60 dark:text-dark-text/60 border border-light-text/15 dark:border-dark-text/15 hover:bg-light-text/5 dark:hover:bg-dark-text/5 transition-colors"
            >
              <RefreshCw size={13} />
              Actualiser
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-violet-400 bg-violet-400/8 hover:bg-violet-400/15 border border-violet-400/20 transition-colors"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>
        <p className="text-sm text-light-text/50 dark:text-dark-text/50 mb-6">
          Historique des 500 dernières actions sur la plateforme.
        </p>
      </motion.div>

      {/* Filtres */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl border bg-light-surface dark:bg-dark-surface border-light-text/8 dark:border-dark-text/8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <div>
            <label className="block text-xs text-light-text/50 dark:text-dark-text/50 mb-1">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full text-sm bg-light-bg dark:bg-dark-bg border border-light-text/15 dark:border-dark-text/15 rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            >
              <option value="">Toutes</option>
              {ACTION_OPTIONS.filter(Boolean).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-light-text/50 dark:text-dark-text/50 mb-1">Utilisateur (email)</label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text/30 dark:text-dark-text/30" />
              <input
                type="text"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="Rechercher..."
                className="w-full text-sm bg-light-bg dark:bg-dark-bg border border-light-text/15 dark:border-dark-text/15 rounded-lg pl-8 pr-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-accent placeholder:text-light-text/25 dark:placeholder:text-dark-text/25"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-light-text/50 dark:text-dark-text/50 mb-1">Date début</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full text-sm bg-light-bg dark:bg-dark-bg border border-light-text/15 dark:border-dark-text/15 rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-light-text/50 dark:text-dark-text/50 mb-1">Date fin</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full text-sm bg-light-bg dark:bg-dark-bg border border-light-text/15 dark:border-dark-text/15 rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>
        </motion.div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">Aucun log trouvé</p>
          <p className="text-sm text-light-text/45 dark:text-dark-text/45">Modifiez les filtres ou attendez des actions.</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-light-text/8 dark:border-dark-text/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-text/8 dark:border-dark-text/8 bg-light-surface dark:bg-dark-surface">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-light-text/50 dark:text-dark-text/50 whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-light-text/50 dark:text-dark-text/50">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-light-text/50 dark:text-dark-text/50">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-light-text/50 dark:text-dark-text/50">Ressource</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-light-text/50 dark:text-dark-text/50">Détails</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-light-text/50 dark:text-dark-text/50">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => {
                  const style = ACTION_STYLES[log.action] ?? { label: log.action, class: 'text-light-text/60 bg-light-text/5 border-light-text/10' }
                  let details = ''
                  try { details = log.details ? JSON.stringify(JSON.parse(log.details), null, 0) : '' } catch { details = log.details ?? '' }
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.01, 0.3) }}
                      className="border-b border-light-text/5 dark:border-dark-text/5 hover:bg-light-text/2 dark:hover:bg-dark-text/2 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-light-text/50 dark:text-dark-text/50 font-mono">
                        {new Date(log.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <p className="text-xs text-light-text dark:text-dark-text truncate max-w-[140px]">
                          {log.userEmail ?? <span className="text-light-text/30 dark:text-dark-text/30 italic">Système</span>}
                        </p>
                        {log.userRole && (
                          <p className="text-[10px] text-light-text/35 dark:text-dark-text/35">{log.userRole}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full border', style.class)}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-light-text dark:text-dark-text">{log.resource}</p>
                        {log.resourceId && (
                          <p className="text-[10px] text-light-text/30 dark:text-dark-text/30 font-mono truncate max-w-[100px]">{log.resourceId}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-[10px] text-light-text/45 dark:text-dark-text/45 truncate font-mono">{details || '—'}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-light-text/40 dark:text-dark-text/40 font-mono">
                        {log.ip ?? '—'}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <p className="text-xs text-light-text/30 dark:text-dark-text/30 text-center mt-12">
        © CHRIST J. — Tous droits réservés
      </p>
    </div>
  )
}
