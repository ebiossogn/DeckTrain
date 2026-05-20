'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Zap, Monitor, BookOpen, Users, ArrowRight, Calendar,
  BarChart2, Shield, FileDown, Globe, Cpu, Star, Wifi,
} from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { PricingSection } from '@/components/landing/pricing-section'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' },
  }),
}

const why = [
  { icon: Zap,       title: 'Tout-en-un',             desc: 'Slides · exercices · agenda · sondages — une seule plateforme, zéro friction.' },
  { icon: Wifi,      title: 'Fonctionne hors-ligne',  desc: 'Hébergeable localement sur votre réseau interne, sans dépendance cloud.' },
  { icon: Globe,     title: 'Prix accessible',         desc: 'Adapté aux budgets africains. Pas de licence mensuelle cachée.' },
  { icon: BookOpen,  title: '100 % en français',       desc: 'Interface, support et documentation entièrement en français.' },
  { icon: BarChart2, title: 'Interactif',              desc: 'QCM en direct, sondages live, word cloud — vos apprenants participent.' },
  { icon: Shield,    title: 'Sécurisé',                desc: 'Vos données restent chez vous. RBAC, rate limiting, logs complets.' },
]

const features = [
  { icon: Monitor,   title: 'Présentation',   desc: '7 types de slides, 10 transitions Framer Motion, minuteur, notes.',       badge: '7 types' },
  { icon: BookOpen,  title: 'Exercices',       desc: 'QCM interactifs et ateliers pratiques avec correction instantanée.',      badge: 'QCM + Atelier' },
  { icon: BarChart2, title: 'Sondages live',   desc: '5 types de questions, QR code, polling 2s, word cloud, export CSV.',     badge: '5 types' },
  { icon: Calendar,  title: 'Agenda',          desc: 'Planning des sessions avec vue calendrier et timeline mensuelle.',        badge: 'Calendrier' },
  { icon: Users,     title: "Équipe",          desc: '5 niveaux de rôles admin, invitations sécurisées, RBAC granulaire.',     badge: 'RBAC' },
  { icon: FileDown,  title: 'Export',          desc: 'Exportez vos modules en PPTX ou PDF en un clic.',                        badge: 'PPTX + PDF' },
  { icon: Shield,    title: 'Sécurité',        desc: 'Rate limiting, blocage compte, logs de connexion, timeout 30 min.',      badge: 'Enterprise' },
  { icon: Cpu,       title: 'Tech-first',      desc: "Coloration syntaxique Shiki, éditeur Tiptap, Recharts, Framer Motion.", badge: 'Stack moderne' },
]


const testimonials = [
  { name: 'Ingrid M.',   role: 'Responsable RH, Dakar',    text: "DeckTrain a transformé nos sessions d'intégration. Les sondages live changent vraiment la dynamique de groupe.", stars: 5 },
  { name: 'Kofi A.',     role: 'CTO, Accra',               text: 'Enfin une alternative sérieuse aux outils occidentaux qui comprend nos contraintes réseau. Rapide, élégant.', stars: 5 },
  { name: 'Aminata D.',  role: 'Formatrice, Abidjan',      text: "L'export PPTX m'a sauvé la mise quand le projecteur ne reconnaissait pas mon laptop. Parfait backup !", stars: 5 },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
      <Navbar />

      <main className="flex-1 relative overflow-hidden">

        {/* ── Déco fond ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-accent/3 blur-[120px]" />
          <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-or/3 blur-[100px] rounded-full" />
          <div className="absolute inset-0 opacity-[0.018]"
            style={{ backgroundImage: 'linear-gradient(rgba(200,184,154,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(200,184,154,0.6) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
        </div>

        {/* ── HERO ── */}
        <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-24">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/25 bg-accent/6 text-accent text-sm mb-10 label-dt">
            <Globe size={12} />
            Conçu pour l'Afrique · Formation Tech
          </motion.div>

          {/* Logo display */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="font-display font-light leading-none mb-6 tracking-tight"
            style={{ fontSize: 'clamp(72px, 10vw, 110px)' }}>
            <span className="text-white">Deck</span><span className="text-or">Train</span>
          </motion.div>

          {/* Tagline */}
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="font-display text-2xl md:text-3xl font-light text-white mb-3 max-w-2xl">
            La formation interactive
            <br className="hidden md:block" /> pensée pour l'Afrique
          </motion.p>

          <motion.p custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="text-sm font-sans text-or mb-2 tracking-wide">
            Slides · Exercices · Sondages · Agenda
          </motion.p>

          <motion.p custom={4} variants={fadeUp} initial="hidden" animate="visible"
            className="text-sm text-text-secondary max-w-lg mx-auto mb-10 leading-relaxed">
            Une alternative moderne à PowerPoint — interactive, sécurisée, adaptée aux
            réalités du terrain pour les formateurs de Dakar à Kinshasa.
          </motion.p>

          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
            className="flex flex-wrap gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="primary" className="group">
                Commencer maintenant
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/present">
              <Button size="lg" variant="secondary">
                Voir la démo
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible"
            className="flex flex-wrap gap-10 justify-center mt-16">
            {[
              { v: '7',  l: 'Types de slides' },
              { v: '10', l: 'Transitions' },
              { v: '5',  l: 'Types de sondages' },
              { v: '∞',  l: 'Participants' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="font-display font-light text-5xl text-or mb-1">{s.v}</div>
                <div className="label-dt text-text-secondary">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── POURQUOI DECKTRAIN ── */}
        <section className="relative z-10 bg-light-surface/80 dark:bg-dark-surface/50 border-y border-light-border dark:border-dark-border py-20 px-6 transition-colors duration-300">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-14">
              <p className="label-dt text-text-secondary mb-3">Pourquoi DeckTrain ?</p>
              <h2 className="font-display text-3xl font-light text-white">6 bonnes raisons de changer</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {why.map((w, i) => (
                <motion.div key={w.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}>
                  <div className="bg-dark-bg border border-dark-border rounded-2xl p-5 h-full group hover:border-accent/30 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-or/8 text-or flex items-center justify-center mb-3 group-hover:bg-or/15 transition-colors">
                      <w.icon size={18} />
                    </div>
                    <h3 className="font-display font-semibold text-or text-lg mb-1">{w.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{w.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FONCTIONNALITÉS ── */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <p className="label-dt text-text-secondary mb-3">Fonctionnalités</p>
            <h2 className="font-display text-3xl font-light text-white mb-3">Tout ce dont vous avez besoin</h2>
            <p className="text-sm text-text-secondary max-w-lg mx-auto">
              Une plateforme complète pour créer, animer et évaluer vos formations techniques.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}>
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 h-full group hover:border-accent/25 hover:shadow-[0_0_20px_rgba(0,212,255,0.06)] transition-all">
                  <div className="w-9 h-9 rounded-xl bg-accent/8 text-accent flex items-center justify-center mb-3 group-hover:bg-accent/15 transition-colors">
                    <f.icon size={18} />
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-display font-semibold text-or text-base">{f.title}</h3>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-2">{f.desc}</p>
                  <span className="label-dt text-accent/70">{f.badge}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <PricingSection />

        {/* ── TÉMOIGNAGES ── */}
        <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-12">
            <p className="label-dt text-text-secondary mb-3">Témoignages</p>
            <h2 className="font-display text-3xl font-light text-white">Ils nous font confiance</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 h-full">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} size={13} className="text-or fill-or" />
                    ))}
                  </div>
                  <p className="text-sm text-dark-text leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div>
                    <p className="text-sm font-semibold text-white font-sans">{t.name}</p>
                    <p className="text-xs text-text-secondary">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="relative z-10 px-6 pb-24">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center border border-or/20 bg-or/3 rounded-3xl px-8 py-14">
            <div className="w-14 h-14 rounded-2xl bg-or/10 text-or flex items-center justify-center mx-auto mb-5">
              <Zap size={26} />
            </div>
            <h2 className="font-display text-3xl font-light text-white mb-3">
              Prêt à transformer vos formations ?
            </h2>
            <p className="font-display text-lg text-or mb-2">DeckTrain — Fait pour l'Afrique, par l'Afrique.</p>
            <p className="text-sm text-text-secondary mb-8">
              Rejoignez les formateurs africains qui ont déjà adopté DeckTrain.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" variant="primary" className="shadow-[0_0_20px_rgba(0,212,255,0.25)]">
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
