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

/* ── Config devises ─────────────────────────────────────────────── */
const CURRENCIES: Currency[] = [
  { code: 'fcfa', label: 'FCFA',  flag: '🌍', prefix: '',  suffix: ' FCFA', decimals: 0, locale: 'fr-FR' },
  { code: 'gnf',  label: 'GNF',   flag: '🇬🇳', prefix: '',  suffix: ' GNF',  decimals: 0, locale: 'fr-FR' },
  { code: 'eur',  label: 'EUR',   flag: '🇪🇺', prefix: '',  suffix: ' €',    decimals: 0, locale: 'fr-FR' },
  { code: 'usd',  label: 'USD',   flag: '🇺🇸', prefix: '$', suffix: '',      decimals: 0, locale: 'en-US' },
]

/* ── Prix de base en FCFA ───────────────────────────────────────── */
const PLANS = [
  {
    name: 'Gratuit',
    baseFCFA: 0,
    isFree: true,
    isCustom: false,
    desc: '1 formateur, 3 modules maximum.',
    highlight: false,
    features: ['1 formateur', '3 modules, 30 slides', '2 sondages', '10 participants', 'Export PDF', 'Support communautaire'],
    cta: 'Commencer gratuitement',
    href: '/login',
    variant: 'ghost' as const,
  },
  {
    name: 'Pro',
    baseFCFA: 29_000,
    isFree: false,
    isCustom: false,
    desc: 'Tout débloqué pour votre équipe.',
    highlight: true,
    features: ['Modules & slides illimités', 'Sondages illimités', '100 participants', 'Export PDF + PPTX', '5 admins + RBAC', 'Sécurité avancée', 'Support prioritaire'],
    cta: 'Essai 14 jours',
    href: '/login',
    variant: 'primary' as const,
  },
  {
    name: 'Entreprise',
    baseFCFA: null,
    isFree: false,
    isCustom: true,
    desc: 'Hébergement privé, support dédié.',
    highlight: false,
    features: ['Tout ce qui est dans Pro', 'Participants illimités', 'Hébergement on-premise', 'SSO / LDAP', 'SLA garanti', 'Intégration LMS', 'Formation & onboarding'],
    cta: 'Nous contacter',
    href: 'mailto:christtangbe@ebiosso.com',
    variant: 'secondary' as const,
  },
]

/* ── Conversion ─────────────────────────────────────────────────── */
function convert(baseFCFA: number, code: CurrencyCode, rates: Rates): number {
  switch (code) {
    case 'fcfa': return baseFCFA
    case 'gnf':  return baseFCFA * rates.gnf
    case 'eur':  return baseFCFA * rates.eur
    case 'usd':  return baseFCFA * rates.usd
  }
}

function formatPrice(value: number, currency: Currency): string {
  const rounded = currency.decimals === 0 ? Math.round(value) : +value.toFixed(currency.decimals)
  return currency.prefix + rounded.toLocaleString(currency.locale) + currency.suffix
}

/* ── Composant prix animé ───────────────────────────────────────── */
function AnimatedPrice({ value, currencyCode }: { value: string; currencyCode: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={`${value}-${currencyCode}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="font-display font-light text-3xl text-white"
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
  }, [fetchRates])

  const currency = CURRENCIES.find((c) => c.code === selected)!

  return (
    <section className="relative z-10 bg-light-surface/80 dark:bg-dark-surface/50 border-y border-light-border dark:border-dark-border py-24 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">

        {/* Titre */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10">
          <p className="label-dt text-text-secondary mb-3">Tarifs</p>
          <h2 className="font-display text-3xl font-light text-white mb-3">Simple et transparent</h2>
          <p className="text-sm text-text-secondary">Commencez gratuitement. Évoluez selon vos besoins.</p>
        </motion.div>

        {/* Sélecteur de devise */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col items-center gap-3 mb-10"
        >
          <div className="flex items-center gap-1.5 bg-dark-bg/60 border border-dark-border rounded-xl p-1">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelected(c.code)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  selected === c.code
                    ? 'bg-accent text-[#111111] shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                    : 'text-dark-text/60 hover:text-dark-text hover:bg-dark-text/5'
                )}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* Indicateur de fraîcheur */}
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            {rates.fallback ? (
              <>
                <AlertCircle size={11} className="text-or" />
                <span className="text-or/70">Taux indicatifs (API indisponible)</span>
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
              className="text-text-muted hover:text-accent transition-colors disabled:opacity-40"
              title="Actualiser les taux"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </motion.div>

        {/* Grille de plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => {
            const convertedValue = plan.baseFCFA !== null
              ? convert(plan.baseFCFA, selected, rates)
              : null
            const priceDisplay = plan.isCustom
              ? 'Sur devis'
              : plan.isFree
              ? currency.prefix + '0' + currency.suffix
              : formatPrice(convertedValue!, currency)

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={cn(
                  'relative flex flex-col h-full rounded-2xl border-2 p-6 bg-dark-bg',
                  plan.highlight
                    ? 'border-or shadow-[0_0_40px_rgba(200,184,154,0.12)]'
                    : 'border-dark-border'
                )}>
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-or text-[#111111] text-[10px] font-bold px-3 py-1 rounded-full label-dt">
                        RECOMMANDÉ
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="font-display font-semibold text-or text-xl">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2 h-10 overflow-hidden">
                      {plan.isCustom ? (
                        <span className="font-display font-light text-2xl text-white">Sur devis</span>
                      ) : (
                        <AnimatedPrice value={priceDisplay} currencyCode={selected} />
                      )}
                    </div>
                    {!plan.isCustom && !plan.isFree && (
                      <p className="text-[11px] text-text-muted mt-0.5 label-dt">par mois</p>
                    )}
                    <p className="text-xs text-text-secondary mt-1">{plan.desc}</p>
                  </div>

                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm text-dark-text">
                        <CheckCircle2 size={13} className="text-accent mt-0.5 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href}>
                    <Button variant={plan.variant} size="md" className="w-full">
                      {plan.cta}
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
          className="text-center text-xs text-text-muted mt-8"
        >
          Tous les prix sont hors taxes. La conversion est indicative et basée sur les taux du marché.
          Le paiement s'effectue en FCFA ou par virement bancaire.
        </motion.p>
      </div>
    </section>
  )
}
