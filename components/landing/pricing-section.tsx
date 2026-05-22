'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ── Types ─────────────────────────────────────────────────────── */
interface Rates {
  gnf: number
  eur: number
  usd: number
  updatedAt: string | null
  fallback: boolean
}

type CurrencyCode = 'fcfa' | 'gnf' | 'eur' | 'usd'

interface Currency {
  code: CurrencyCode
  label: string
  flag: string
  prefix: string
  suffix: string
  decimals: number
  locale: string
}

interface ApiPlan {
  id: string; name: string; slug: string; priceFCFA: number
  maxModules: number; maxParticipants: number; maxSurveys: number; maxAdmins: number
  features: string[]; isHighlighted: boolean
}

/* ── Config statique par slug ───────────────────────────────────── */
const PLAN_META: Record<string, { desc: string; cta: string; href: string; variant: 'ghost' | 'primary' | 'secondary' }> = {
  free:       { desc: '1 formateur, 3 modules maximum.',    cta: 'Commencer gratuitement', href: '/register', variant: 'ghost'     },
  pro:        { desc: 'Tout débloqué pour votre équipe.',   cta: 'Commencer avec Pro',     href: '/register', variant: 'primary'   },
  enterprise: { desc: 'Pour les grandes organisations.',    cta: 'Nous contacter',          href: '/login',    variant: 'secondary' },
}

/* ── Fallback hardcodé (si API indisponible) ────────────────────── */
const FALLBACK_PLANS: ApiPlan[] = [
  { id: 'free',       name: 'Gratuit',    slug: 'free',       priceFCFA: 0,      maxModules: 3,  maxParticipants: 10,  maxSurveys: 2,  maxAdmins: 1,  isHighlighted: false, features: ['1 formateur', '3 modules, 30 slides', '2 sondages', '10 participants', 'Export PDF', 'Support communautaire'] },
  { id: 'pro',        name: 'Pro',        slug: 'pro',        priceFCFA: 29_000, maxModules: -1, maxParticipants: 100, maxSurveys: -1, maxAdmins: 5,  isHighlighted: true,  features: ['Modules & slides illimités', 'Sondages illimités', '100 participants', 'Export PDF + PPTX', '5 admins + RBAC', 'Sécurité avancée', 'Support prioritaire'] },
  { id: 'enterprise', name: 'Entreprise', slug: 'enterprise', priceFCFA: -1,     maxModules: -1, maxParticipants: -1,  maxSurveys: -1, maxAdmins: -1, isHighlighted: false, features: ['Tout Pro inclus', 'Admins illimités', 'Participants illimités', 'Hébergement on-premise', 'SLA personnalisé', 'Formation incluse'] },
]

/* ── Config devises ─────────────────────────────────────────────── */
const CURRENCIES: Currency[] = [
  { code: 'fcfa', label: 'FCFA',  flag: '🌍', prefix: '',  suffix: ' FCFA', decimals: 0, locale: 'fr-FR' },
  { code: 'gnf',  label: 'GNF',   flag: '🇬🇳', prefix: '',  suffix: ' GNF',  decimals: 0, locale: 'fr-FR' },
  { code: 'eur',  label: 'EUR',   flag: '🇪🇺', prefix: '',  suffix: ' €',    decimals: 0, locale: 'fr-FR' },
  { code: 'usd',  label: 'USD',   flag: '🇺🇸', prefix: '$', suffix: '',      decimals: 0, locale: 'en-US' },
]

/* ── Helpers ─────────────────────────────────────────────────────── */
function convert(fcfa: number, code: CurrencyCode, rates: Rates): number {
  if (code === 'fcfa') return fcfa
  if (code === 'gnf') return Math.round(fcfa * rates.gnf)
  if (code === 'eur') return Math.round(fcfa * rates.eur)
  if (code === 'usd') return Math.round(fcfa * rates.usd)
  return fcfa
}

function formatPrice(value: number, currency: Currency): string {
  const formatted = new Intl.NumberFormat(currency.locale, { maximumFractionDigits: currency.decimals }).format(value)
  return currency.prefix + formatted + currency.suffix
}

function AnimatedPrice({ value, currencyCode }: { value: string; currencyCode: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={`${value}-${currencyCode}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="font-display font-light text-3xl text-light-text dark:text-white"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}

/* ── Composant principal ─────────────────────────────────────────── */
export function PricingSection() {
  const [selected, setSelected] = useState<CurrencyCode>('fcfa')
  const [rates, setRates] = useState<Rates>({
    gnf: 13.18, eur: 0.001525, usd: 0.001658, updatedAt: null, fallback: true,
  })
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<ApiPlan[]>(FALLBACK_PLANS)

  const fetchRates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/currency')
      if (res.ok) setRates(await res.json())
    } catch {
      // garde les taux de secours
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRates()
    fetch('/api/plans').then(r => r.ok ? r.json() : null).then(data => {
      if (Array.isArray(data) && data.length > 0) setPlans(data)
    }).catch(() => {})
  }, [fetchRates])

  const currency = CURRENCIES.find((c) => c.code === selected)!

  return (
    <section className="relative z-10 bg-light-surface/80 dark:bg-dark-surface/50 border-y border-light-border dark:border-dark-border py-24 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">

        {/* Titre */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10">
          <p className="label-dt text-light-text-muted dark:text-text-secondary mb-3">Tarifs</p>
          <h2 className="font-display text-3xl font-light text-light-text dark:text-white mb-3">Simple et transparent</h2>
          <p className="text-sm text-light-text-muted dark:text-text-secondary">Commencez gratuitement. Évoluez selon vos besoins.</p>
        </motion.div>

        {/* Sélecteur de devise */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col items-center gap-3 mb-10"
        >
          <div className="flex items-center gap-1.5 bg-light-text/5 dark:bg-dark-bg/60 border border-light-border dark:border-dark-border rounded-xl p-1">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelected(c.code)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  selected === c.code
                    ? 'bg-accent text-[#111111] shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                    : 'text-light-text-secondary dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text hover:bg-light-text/5 dark:hover:bg-dark-text/5'
                )}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* Indicateur de fraîcheur */}
          <div className="flex items-center gap-2 text-[11px] text-light-text-muted dark:text-text-muted">
            {rates.fallback ? (
              <>
                <AlertCircle size={11} className="text-light-gold dark:text-or" />
                <span className="text-light-gold/80 dark:text-or/70">Taux indicatifs (API indisponible)</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                <span>
                  Taux mis à jour le{' '}
                  {rates.updatedAt
                    ? new Date(rates.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </>
            )}
            <button
              onClick={fetchRates}
              disabled={loading}
              className="text-light-text-muted dark:text-text-muted hover:text-accent transition-colors disabled:opacity-40"
              title="Actualiser les taux"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </motion.div>

        {/* Grille de plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => {
            const isCustom = plan.priceFCFA === -1
            const isFree = plan.priceFCFA === 0
            const meta = PLAN_META[plan.slug] ?? PLAN_META.free
            const convertedValue = !isCustom ? convert(plan.priceFCFA, selected, rates) : 0
            const priceDisplay = isCustom
              ? 'Sur devis'
              : isFree
              ? currency.prefix + '0' + currency.suffix
              : formatPrice(convertedValue, currency)

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={cn(
                  'relative flex flex-col h-full rounded-2xl border-2 p-6 bg-light-surface dark:bg-dark-bg',
                  plan.isHighlighted
                    ? 'border-light-gold dark:border-or shadow-[0_0_40px_rgba(200,184,154,0.12)]'
                    : 'border-light-border dark:border-dark-border'
                )}>
                  {plan.isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-light-gold dark:bg-or text-[#111111] text-[10px] font-bold px-3 py-1 rounded-full label-dt">
                        RECOMMANDÉ
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="font-display font-semibold text-light-gold dark:text-or text-xl">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2 h-10 overflow-hidden">
                      {isCustom ? (
                        <span className="font-display font-light text-2xl text-light-text dark:text-white">Sur devis</span>
                      ) : (
                        <AnimatedPrice value={priceDisplay} currencyCode={selected} />
                      )}
                    </div>
                    {!isCustom && !isFree && (
                      <p className="text-[11px] text-light-text-muted dark:text-text-muted mt-0.5 label-dt">par mois</p>
                    )}
                    <p className="text-xs text-light-text-muted dark:text-text-secondary mt-1">{meta.desc}</p>
                  </div>

                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm text-light-text dark:text-dark-text">
                        <CheckCircle2 size={13} className="text-accent mt-0.5 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link href={meta.href}>
                    <Button variant={meta.variant} size="md" className="w-full">
                      {meta.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Note de bas de section */}
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center text-xs text-light-text-muted dark:text-text-muted mt-8"
        >
          Tous les prix sont hors taxes. La conversion est indicative et basée sur les taux du marché.
          Le paiement s'effectue en FCFA ou par virement bancaire.
        </motion.p>
      </div>
    </section>
  )
}
