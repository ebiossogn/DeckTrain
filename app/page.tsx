'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Zap, Monitor, BookOpen, Users, ArrowRight, Settings, Calendar,
  BarChart2, Shield, FileDown, CheckCircle2, Globe, Cpu, Star,
} from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.09, duration: 0.5, ease: 'easeOut' },
  }),
}

const features = [
  { icon: Monitor,    title: 'Présentation Live',    desc: 'Slides plein écran avec 10 transitions animées, navigation clavier/swipe, minuteur et notes présentateur.', badge: '7 types' },
  { icon: BookOpen,   title: 'Exercices Intégrés',   desc: 'QCM interactifs et ateliers pratiques avec correction instantanée, niveaux de difficulté et suivi.', badge: 'QCM + Ateliers' },
  { icon: BarChart2,  title: 'Sondages Live',         desc: 'Mentimeter-like : 5 types de questions, affichage temps réel, QR code et export CSV/PDF.', badge: '5 types' },
  { icon: Calendar,   title: 'Agenda Dynamique',      desc: 'Planning visuel des sessions avec statuts, filtres par module et export.', badge: 'Timeline' },
  { icon: Users,      title: "Gestion d'Équipe",      desc: '5 niveaux de rôles admin, invitations sécurisées, permissions granulaires par module.', badge: 'RBAC' },
  { icon: Shield,     title: 'Sécurité Avancée',      desc: 'Rate limiting, blocage après 10 tentatives, logs de connexion, timeout de session 30 min.', badge: 'Enterprise-ready' },
  { icon: FileDown,   title: 'Export PDF / PPTX',     desc: 'Exportez chaque module en présentation PowerPoint ou PDF prêt à imprimer en un clic.', badge: 'Nouveau' },
  { icon: Globe,      title: 'Multi-appareil',        desc: 'Responsive mobile-first, PWA-ready. Formateur sur laptop, participants sur smartphones.', badge: 'PWA' },
]

const stats = [
  { value: '7',   label: 'Types de slides' },
  { value: '10',  label: 'Transitions' },
  { value: '5',   label: 'Types de sondages' },
  { value: '∞',   label: 'Participants' },
]

const pricing = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: '',
    desc: 'Parfait pour tester TrainDeck avec une petite équipe.',
    color: 'border-dark-text/10',
    badge: '',
    features: [
      '3 modules, 30 slides',
      '2 sondages simultanés',
      '10 participants max',
      'Export PDF',
      'Support communautaire',
    ],
    cta: 'Commencer gratuitement',
    ctaVariant: 'secondary' as const,
    href: '/login',
  },
  {
    name: 'Pro',
    price: '29 000',
    period: '/ mois · FCFA',
    desc: 'Pour les équipes de formation en croissance.',
    color: 'border-accent',
    badge: 'Populaire',
    features: [
      'Modules & slides illimités',
      'Sondages illimités',
      '100 participants',
      'Export PDF + PPTX',
      '5 admins, rôles RBAC',
      'Sécurité avancée',
      'Support prioritaire',
    ],
    cta: 'Essai 14 jours',
    ctaVariant: 'primary' as const,
    href: '/login',
  },
  {
    name: 'Enterprise',
    price: 'Sur devis',
    period: '',
    desc: 'Déploiement on-premise pour grandes organisations.',
    color: 'border-dark-text/10',
    badge: '',
    features: [
      'Tout ce qui est dans Pro',
      'Participants illimités',
      'Hébergement on-premise',
      'SSO / LDAP',
      'SLA garanti',
      'Intégration LMS',
      'Formation & onboarding',
    ],
    cta: 'Nous contacter',
    ctaVariant: 'secondary' as const,
    href: 'mailto:christtangbe@ebiosso.com',
  },
]

const testimonials = [
  { name: 'Ingrid M.', role: 'Responsable RH, Dakar', text: "TrainDeck a transformé nos sessions d'intégration. Les sondages live changent vraiment la dynamique de groupe.", stars: 5 },
  { name: 'Kofi A.',   role: 'CTO, Accra',            text: 'Enfin une alternative aux outils occidentaux qui comprend nos contraintes réseau. Rapide, élégant, efficace.', stars: 5 },
  { name: 'Aminata D.', role: 'Formatrice, Abidjan',  text: "L'export PPTX m'a sauvé la mise quand le projecteur ne reconnaissait pas mon laptop. Parfait backup !", stars: 5 },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 relative overflow-hidden">
        {/* Arrière-plan décoratif */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-60 left-1/4 w-[700px] h-[700px] bg-accent/4 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-500/3 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)', backgroundSize: '64px 64px' }}
          />
        </div>

        {/* ── HERO ── */}
        <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/8 text-accent text-sm font-medium mb-8">
            <Globe size={13} />
            Conçu pour l'Afrique · Formation Tech · Mai 2026
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="font-syne text-7xl md:text-9xl font-bold leading-none mb-6 tracking-tight">
            Train<span className="text-accent drop-shadow-[0_0_40px_rgba(0,212,255,0.6)]">Deck</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="text-xl md:text-2xl text-light-text/65 dark:text-dark-text/65 mb-3 font-inter max-w-2xl">
            La plateforme de formation interactive pensée pour les équipes tech africaines
          </motion.p>

          <motion.p custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="text-base text-light-text/45 dark:text-dark-text/45 max-w-xl mx-auto mb-10 leading-relaxed">
            Slides interactifs · Exercices en temps réel · Sondages live · Export PPTX/PDF.
            <br className="hidden md:block" /> Fini PowerPoint, bienvenue dans l'ère de la formation engageante.
          </motion.p>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
            className="flex flex-wrap gap-4 justify-center">
            <Link href="/present">
              <Button size="lg" variant="primary" className="group shadow-[0_0_24px_rgba(0,212,255,0.25)]">
                <Monitor size={18} />
                Voir les modules
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                <Settings size={18} />
                Administration
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
            className="flex flex-wrap gap-8 justify-center mt-16">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-syne text-4xl font-bold text-accent mb-1">{s.value}</div>
                <div className="text-xs text-light-text/40 dark:text-dark-text/40 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── AFRICA STRIP ── */}
        <section className="relative z-10 bg-accent/5 border-y border-accent/10 py-10 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Cpu size={16} className="text-accent" />
                <span className="font-syne font-bold text-light-text dark:text-dark-text text-lg">
                  Construit pour le contexte africain
                </span>
              </div>
              <p className="text-sm text-light-text/55 dark:text-dark-text/55 max-w-2xl mx-auto leading-relaxed">
                Fonctionne hors-ligne, optimisé pour les connexions lentes, interface en français,
                tarification en FCFA. TrainDeck comprend les réalités du terrain pour les formateurs
                de Dakar à Kinshasa, d'Abidjan à Nairobi.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── FONCTIONNALITÉS ── */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="text-center mb-14">
            <Badge variant="muted" className="mb-4">Fonctionnalités</Badge>
            <h2 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text mb-3">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-light-text/50 dark:text-dark-text/50 max-w-xl mx-auto">
              Une plateforme complète pour créer, animer et évaluer vos formations techniques.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}>
                <Card hoverable className="p-5 h-full group">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                    <f.icon size={20} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-syne font-semibold text-sm text-light-text dark:text-dark-text">{f.title}</h3>
                    {f.badge === 'Nouveau' && <Badge variant="default" className="text-[9px]">NEW</Badge>}
                  </div>
                  <p className="text-xs text-light-text/55 dark:text-dark-text/55 leading-relaxed">{f.desc}</p>
                  <p className="text-[10px] text-accent/60 mt-2 font-medium">{f.badge}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="relative z-10 bg-light-surface/50 dark:bg-dark-surface/50 border-y border-light-text/8 dark:border-dark-text/8 py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-14">
              <Badge variant="muted" className="mb-4">Tarifs</Badge>
              <h2 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text mb-3">
                Simple et transparent
              </h2>
              <p className="text-light-text/50 dark:text-dark-text/50">
                Commencez gratuitement. Évoluez selon vos besoins.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricing.map((plan, i) => (
                <motion.div key={plan.name}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}>
                  <div className={cn(
                    'relative flex flex-col h-full rounded-2xl border-2 p-6',
                    'bg-light-surface dark:bg-dark-surface',
                    plan.color,
                    plan.badge && 'shadow-[0_0_30px_rgba(0,212,255,0.12)]'
                  )}>
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-accent text-black text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>
                      </div>
                    )}

                    <div className="mb-5">
                      <h3 className="font-syne font-bold text-light-text dark:text-dark-text text-lg">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="font-syne font-bold text-3xl text-light-text dark:text-dark-text">{plan.price}</span>
                        {plan.period && <span className="text-xs text-light-text/45 dark:text-dark-text/45">{plan.period}</span>}
                      </div>
                      <p className="text-xs text-light-text/50 dark:text-dark-text/50 mt-1">{plan.desc}</p>
                    </div>

                    <ul className="space-y-2.5 flex-1 mb-6">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm text-light-text/75 dark:text-dark-text/75">
                          <CheckCircle2 size={14} className="text-accent mt-0.5 flex-shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <Link href={plan.href}>
                      <Button variant={plan.ctaVariant} size="md" className="w-full">
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TÉMOIGNAGES ── */}
        <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-12">
            <Badge variant="muted" className="mb-4">Témoignages</Badge>
            <h2 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">
              Ils nous font confiance
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <Card className="p-5 h-full">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-light-text/70 dark:text-dark-text/70 leading-relaxed mb-4 italic">
                    "{t.text}"
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-light-text dark:text-dark-text">{t.name}</p>
                    <p className="text-xs text-light-text/40 dark:text-dark-text/40">{t.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="relative z-10 px-6 pb-24">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center bg-accent/5 border border-accent/20 rounded-3xl px-8 py-14">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mx-auto mb-5">
              <Zap size={26} />
            </div>
            <h2 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text mb-3">
              Prêt à transformer vos formations ?
            </h2>
            <p className="text-light-text/55 dark:text-dark-text/55 mb-8">
              Rejoignez les formateurs africains qui ont déjà adopté TrainDeck pour leurs équipes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" variant="primary" className="shadow-[0_0_24px_rgba(0,212,255,0.3)]">
                  Commencer maintenant
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/agenda">
                <Button size="lg" variant="secondary">
                  <Calendar size={16} />
                  Voir l'agenda
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
