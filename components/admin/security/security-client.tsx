'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Clock, User, Unlock, Activity,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LoginLog {
  id: string
  email: string
  ip: string
  success: boolean
  userAgent: string | null
  createdAt: string
}

interface BlockedUser {
  id: string
  email: string
  createdAt: string
}

interface SecurityStats {
  totalLogs: number
  failedLast24h: number
  failedLast15m: number
  blockedCount: number
}

interface SecurityData {
  logs: LoginLog[]
  stats: SecurityStats
  blockedUsers: BlockedUser[]
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp  = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `il y a ${d}j`
  if (h > 0) return `il y a ${h}h`
  if (m > 0) return `il y a ${m}min`
  return "à l'instant"
}

export function SecurityClient({ initial }: { initial: SecurityData }) {
  const [data, setData]       = useState(initial)
  const [unlocking, setUnlocking] = useState<string | null>(null)

  const refresh = async () => {
    const res = await fetch('/api/admin/security')
    if (res.ok) setData(await res.json())
  }

  const handleUnblock = async (userId: string, email: string) => {
    setUnlocking(userId)
    try {
      const res = await fetch('/api/admin/security/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Compte ${email} débloqué`)
      await refresh()
    } catch {
      toast.error('Erreur lors du déblocage')
    } finally {
      setUnlocking(null)
    }
  }

  const { stats, logs, blockedUsers } = data

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── En-tête ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <div className="flex items-center gap-3 mb-1">
          <Shield size={22} className="text-accent" />
          <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">Sécurité</h1>
        </div>
        <p className="text-light-text/50 dark:text-dark-text/50">
          Journaux de connexion, détection d&apos;intrusion et gestion des comptes bloqués.
        </p>
      </motion.div>

      {/* ── KPI Cards ── */}
      <motion.div
        variants={stagger} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Tentatives totales', value: stats.totalLogs,      icon: Activity,       color: '#00D4FF' },
          { label: 'Échecs (24h)',        value: stats.failedLast24h,  icon: XCircle,        color: '#f43f5e' },
          { label: 'Échecs (15 min)',     value: stats.failedLast15m,  icon: AlertTriangle,  color: '#f59e0b' },
          { label: 'Comptes bloqués',     value: stats.blockedCount,   icon: Shield,         color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} variants={fadeUp}>
            <Card className="p-4 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] text-light-text/40 dark:text-dark-text/40 uppercase tracking-wider mb-1.5">{label}</p>
                  <p className="font-syne text-2xl font-bold text-light-text dark:text-dark-text">{value}</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: color + '18', color }}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full opacity-10 blur-xl" style={{ backgroundColor: color }} />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Comptes bloqués ── */}
      {blockedUsers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 border border-red-500/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={15} className="text-red-400" />
              <h2 className="font-syne font-semibold text-sm text-light-text dark:text-dark-text">
                Comptes bloqués ({blockedUsers.length})
              </h2>
            </div>
            <div className="space-y-2">
              {blockedUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-red-400 flex-shrink-0" />
                    <span className="text-sm text-light-text dark:text-dark-text font-medium">{u.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnblock(u.id, u.email)}
                    disabled={unlocking === u.id}
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                  >
                    <Unlock size={13} />
                    {unlocking === u.id ? 'Déblocage…' : 'Débloquer'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Journal de connexions ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-accent" />
              <h2 className="font-syne font-semibold text-sm text-light-text dark:text-dark-text">
                Journaux de connexion
              </h2>
            </div>
            <Badge variant="muted" className="text-[10px]">{logs.length} entrées</Badge>
          </div>

          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-light-text/25 dark:text-dark-text/25 text-xs">
              Aucune tentative enregistrée
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-light-text/35 dark:text-dark-text/35 uppercase tracking-wider border-b border-light-text/8 dark:border-dark-text/8">
                    <th className="pb-2 px-2 font-medium">Statut</th>
                    <th className="pb-2 px-2 font-medium">Email</th>
                    <th className="pb-2 px-2 font-medium">IP</th>
                    <th className="pb-2 px-2 font-medium hidden md:table-cell">User-Agent</th>
                    <th className="pb-2 px-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-text/5 dark:divide-dark-text/5">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className={cn(
                        'transition-colors',
                        log.success
                          ? 'hover:bg-emerald-500/3'
                          : 'hover:bg-red-500/5'
                      )}
                    >
                      <td className="py-2.5 px-2">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                          log.success
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        )}>
                          {log.success
                            ? <><CheckCircle size={9} /> Succès</>
                            : <><XCircle size={9} /> Échec</>
                          }
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-light-text/75 dark:text-dark-text/75">
                        {log.email}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-light-text/55 dark:text-dark-text/55">
                        {log.ip}
                      </td>
                      <td className="py-2.5 px-2 text-light-text/35 dark:text-dark-text/35 hidden md:table-cell max-w-[200px] truncate">
                        {log.userAgent?.split(' ')[0] ?? '—'}
                      </td>
                      <td className="py-2.5 px-2 text-light-text/45 dark:text-dark-text/45 whitespace-nowrap" suppressHydrationWarning>
                        {timeAgo(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Règles actives ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={15} className="text-accent" />
            <h2 className="font-syne font-semibold text-sm text-light-text dark:text-dark-text">
              Règles de protection actives
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Rate limiting par IP',      desc: '5 tentatives / 15 min',          active: true },
              { label: 'Blocage de compte',          desc: '10 échecs consécutifs → blocage', active: true },
              { label: 'Journalisation',             desc: 'Toutes les tentatives loguées',   active: true },
              { label: 'Timeout de session',         desc: 'Déconnexion après 30 min',        active: true },
              { label: 'En-têtes HTTP sécurisés',    desc: 'X-Frame, CORS, CSP headers',     active: true },
              { label: 'Mots de passe hashés',       desc: 'bcrypt 12 rounds',                active: true },
            ].map(({ label, desc, active }) => (
              <div key={label} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-light-text/3 dark:bg-dark-text/3">
                <div className={cn('w-2 h-2 rounded-full flex-shrink-0', active ? 'bg-emerald-400' : 'bg-red-400')} />
                <div>
                  <p className="text-xs font-medium text-light-text/80 dark:text-dark-text/80">{label}</p>
                  <p className="text-[10px] text-light-text/40 dark:text-dark-text/40">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

    </div>
  )
}
