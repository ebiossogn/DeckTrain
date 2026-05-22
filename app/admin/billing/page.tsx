'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard, Users, TrendingUp, Zap, CheckCircle2, XCircle,
  Crown, Package, Star, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Plan {
  id: string; name: string; slug: string; priceFCFA: number
  maxModules: number; maxSlides: number; maxParticipants: number
  maxSurveys: number; maxAdmins: number; features: string[]
  isHighlighted: boolean; isActive: boolean; sortOrder: number
}

interface Subscription {
  id: string; status: string; startedAt: string; expiresAt: string | null
  user: { id: string; name: string; email: string; type: string; createdAt: string }
  plan: { id: string; name: string; slug: string; priceFCFA: number }
}

interface BillingData {
  plans: Plan[]
  subscriptions: Subscription[]
  stats: { totalUsers: number; activeSubscriptions: number; freeUsers: number; planCounts: { planId: string; count: number }[] }
}

const PLAN_ICONS: Record<string, typeof Zap> = { free: Package, pro: Star, enterprise: Crown }
const PLAN_COLORS: Record<string, string> = { free: '#6b7280', pro: '#00D4FF', enterprise: '#B8966A' }
const STATUS_LABELS: Record<string, string> = { active: 'Actif', cancelled: 'Annulé', expired: 'Expiré' }

function formatFCFA(v: number) {
  if (v === -1) return 'Sur devis'
  if (v === 0) return 'Gratuit'
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA / mois'
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: typeof Zap; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-light-text dark:text-dark-text font-display">{value}</p>
      <p className="text-sm text-light-text-muted dark:text-text-secondary mt-0.5">{label}</p>
      {sub && <p className="text-xs text-light-text-muted dark:text-text-secondary mt-1">{sub}</p>}
    </div>
  )
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/billing')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
      </div>
    )
  }

  if (!data) return <p className="p-8 text-red-400">Erreur de chargement.</p>

  const { plans, subscriptions, stats } = data

  const getPlanCount = (planId: string) =>
    stats.planCounts.find(pc => pc.planId === planId)?.count ?? 0

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-light-text dark:text-dark-text">Facturation</h1>
          <p className="text-sm text-light-text-muted dark:text-text-secondary mt-1">Plans tarifaires · Abonnements</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-light-border dark:border-dark-border text-sm text-light-text-muted dark:text-text-secondary hover:text-accent hover:border-accent/30 transition-colors">
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatCard icon={Users} label="Utilisateurs total" value={stats.totalUsers} color="#6b7280" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
          <StatCard icon={CreditCard} label="Abonnés payants" value={stats.activeSubscriptions} color="#00D4FF" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <StatCard icon={Package} label="Plan Gratuit" value={stats.freeUsers} color="#6b7280" sub="sans abonnement actif" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
          <StatCard icon={TrendingUp} label="Taux conversion" value={stats.totalUsers > 0 ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) + '%' : '0%'} color="#10b981" />
        </motion.div>
      </div>

      {/* Plans */}
      <section>
        <h2 className="font-display text-lg font-semibold text-light-text dark:text-dark-text mb-4">Plans tarifaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => {
            const PlanIcon = PLAN_ICONS[plan.slug] ?? Package
            const color = PLAN_COLORS[plan.slug] ?? '#6b7280'
            const count = getPlanCount(plan.id)
            return (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div className={cn(
                  'rounded-2xl border p-5 h-full transition-all',
                  plan.isHighlighted
                    ? 'border-accent/40 bg-accent/3 dark:bg-accent/5'
                    : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface'
                )}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
                      <PlanIcon size={18} style={{ color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-light-text dark:text-dark-text text-sm">{plan.name}</p>
                      <p className="text-xs text-light-text-muted dark:text-text-secondary">{formatFCFA(plan.priceFCFA)}</p>
                    </div>
                    {plan.isHighlighted && (
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent">PRO</span>
                    )}
                  </div>

                  <div className="text-center py-3 mb-4 rounded-xl bg-light-text/3 dark:bg-dark-text/3">
                    <p className="text-2xl font-bold font-display" style={{ color }}>{count}</p>
                    <p className="text-xs text-light-text-muted dark:text-text-secondary">abonné{count > 1 ? 's' : ''}</p>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { label: 'Modules', val: plan.maxModules },
                      { label: 'Participants', val: plan.maxParticipants },
                      { label: 'Sondages', val: plan.maxSurveys },
                      { label: 'Admins', val: plan.maxAdmins },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="text-light-text-muted dark:text-text-secondary">{label}</span>
                        <span className="font-medium text-light-text dark:text-dark-text">{val === -1 ? '∞' : val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Abonnements */}
      <section>
        <h2 className="font-display text-lg font-semibold text-light-text dark:text-dark-text mb-4">
          Abonnements actifs
          <span className="ml-2 text-sm font-normal text-light-text-muted dark:text-text-secondary">({subscriptions.length})</span>
        </h2>

        {subscriptions.length === 0 ? (
          <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface p-10 text-center">
            <CreditCard size={28} className="text-light-text-muted dark:text-text-secondary mx-auto mb-3" />
            <p className="text-sm text-light-text-muted dark:text-text-secondary">Aucun abonnement pour l'instant.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-light-text/2 dark:bg-dark-text/2">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-light-text-muted dark:text-text-secondary">Utilisateur</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-light-text-muted dark:text-text-secondary hidden sm:table-cell">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-light-text-muted dark:text-text-secondary hidden md:table-cell">Depuis</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-light-text-muted dark:text-text-secondary">Statut</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub, i) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-light-border dark:border-dark-border last:border-0 hover:bg-light-text/2 dark:hover:bg-dark-text/2 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-light-text dark:text-dark-text">{sub.user.name}</p>
                      <p className="text-xs text-light-text-muted dark:text-text-secondary">{sub.user.email}</p>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: (PLAN_COLORS[sub.plan.slug] ?? '#6b7280') + '18', color: PLAN_COLORS[sub.plan.slug] ?? '#6b7280' }}>
                        {sub.plan.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-light-text-muted dark:text-text-secondary">
                        {new Date(sub.startedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {sub.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 size={12} /> {STATUS_LABELS[sub.status]}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400">
                          <XCircle size={12} /> {STATUS_LABELS[sub.status] ?? sub.status}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Footer */}
      <p className="text-center text-xs text-light-text/30 dark:text-dark-text/30 pt-4">
        © CHRIST J. — Tous droits réservés
      </p>
    </div>
  )
}
