'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Settings, Palette, User, Lock, Eye, EyeOff, Check, RefreshCw, Shield,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface AppSettings {
  id: string
  solutionsVisible: boolean
  accentColor: string
  trainingTitle: string
  trainingSubtitle: string
  trainerName: string
}

const PRESET_COLORS = [
  { label: 'Cyan',    value: '#00D4FF' },
  { label: 'Bleu',    value: '#3b82f6' },
  { label: 'Violet',  value: '#8b5cf6' },
  { label: 'Rose',    value: '#f43f5e' },
  { label: 'Ambre',   value: '#f59e0b' },
  { label: 'Émeraude', value: '#10b981' },
  { label: 'Orange',  value: '#f97316' },
  { label: 'Lime',    value: '#84cc16' },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp  = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export function SettingsClient({ initial }: { initial: AppSettings }) {
  const [app, setApp] = useState(initial)
  const [appSaving, setAppSaving] = useState(false)

  /* Compte */
  const [currentPassword, setCurrentPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [accountSaving, setAccountSaving] = useState(false)

  /* ── Sauvegarder les paramètres app ── */
  const saveApp = async () => {
    setAppSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(app),
      })
      if (!res.ok) throw new Error()
      toast.success('Paramètres sauvegardés')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setAppSaving(false)
    }
  }

  /* ── Mettre à jour le compte ── */
  const saveAccount = async () => {
    if (!currentPassword) { toast.error('Saisissez votre mot de passe actuel'); return }
    if (newPassword && newPassword !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return }
    if (newPassword && newPassword.length < 8) { toast.error('Le mot de passe doit comporter au moins 8 caractères'); return }

    setAccountSaving(true)
    try {
      const res = await fetch('/api/settings/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newEmail: newEmail || undefined, newPassword: newPassword || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      toast.success('Compte mis à jour')
      setCurrentPassword(''); setNewEmail(''); setNewPassword(''); setConfirmPassword('')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setAccountSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* ── En-tête ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <div className="flex items-center gap-3 mb-1">
          <Settings size={22} className="text-accent" />
          <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">Paramètres</h1>
        </div>
        <p className="text-light-text/50 dark:text-dark-text/50">
          Configuration globale de la plateforme TrainDeck.
        </p>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">

        {/* ── Paramètres plateforme ── */}
        <motion.div variants={fadeUp}>
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Palette size={16} className="text-accent" />
              <h2 className="font-syne font-semibold text-light-text dark:text-dark-text">Plateforme</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Titre de la formation"
                value={app.trainingTitle}
                onChange={(e) => setApp((p) => ({ ...p, trainingTitle: e.target.value }))}
                placeholder="Formation Tech"
              />
              <Input
                label="Sous-titre"
                value={app.trainingSubtitle}
                onChange={(e) => setApp((p) => ({ ...p, trainingSubtitle: e.target.value }))}
                placeholder="Mai 2026"
              />
            </div>

            <Input
              label="Nom du formateur"
              value={app.trainerName}
              onChange={(e) => setApp((p) => ({ ...p, trainerName: e.target.value }))}
              placeholder="CHRIST J."
            />

            {/* Couleur d'accentuation */}
            <div>
              <label className="block text-xs font-medium text-light-text/55 dark:text-dark-text/55 uppercase tracking-wide mb-3">
                Couleur d&apos;accentuation
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setApp((p) => ({ ...p, accentColor: c.value }))}
                    title={c.label}
                    className="w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center"
                    style={{
                      backgroundColor: c.value,
                      borderColor: app.accentColor === c.value ? c.value : 'transparent',
                      boxShadow: app.accentColor === c.value ? `0 0 0 2px rgba(255,255,255,0.2)` : 'none',
                    }}
                  >
                    {app.accentColor === c.value && <Check size={12} className="text-white" />}
                  </button>
                ))}
                {/* Couleur personnalisée */}
                <label className="w-8 h-8 rounded-lg border-2 border-dashed border-light-text/20 dark:border-dark-text/20 flex items-center justify-center cursor-pointer hover:border-accent transition-colors" title="Couleur personnalisée">
                  <input
                    type="color"
                    value={app.accentColor}
                    onChange={(e) => setApp((p) => ({ ...p, accentColor: e.target.value }))}
                    className="w-0 h-0 opacity-0 absolute"
                  />
                  <Palette size={12} className="text-light-text/40 dark:text-dark-text/40" />
                </label>
                <span className="text-xs text-light-text/40 dark:text-dark-text/40 font-mono">{app.accentColor}</span>
              </div>
            </div>

            {/* Toggle solutions */}
            <div className="flex items-center justify-between py-3 border-t border-light-text/8 dark:border-dark-text/8">
              <div>
                <p className="text-sm font-medium text-light-text dark:text-dark-text">Solutions des exercices</p>
                <p className="text-xs text-light-text/45 dark:text-dark-text/45 mt-0.5">
                  Rendre les solutions visibles publiquement
                </p>
              </div>
              <button
                onClick={() => setApp((p) => ({ ...p, solutionsVisible: !p.solutionsVisible }))}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${app.solutionsVisible ? 'bg-accent' : 'bg-light-text/15 dark:bg-dark-text/15'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${app.solutionsVisible ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>

            <div className="pt-1">
              <Button variant="primary" size="md" onClick={saveApp} disabled={appSaving}>
                {appSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                {appSaving ? 'Sauvegarde…' : 'Enregistrer les paramètres'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* ── Paramètres compte ── */}
        <motion.div variants={fadeUp}>
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-accent" />
              <h2 className="font-syne font-semibold text-light-text dark:text-dark-text">Sécurité du compte</h2>
            </div>

            <div className="relative">
              <Input
                label="Mot de passe actuel"
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Requis pour toute modification"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                className="absolute right-3 bottom-2.5 text-light-text/40 dark:text-dark-text/40 hover:text-accent transition-colors"
              >
                {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-light-text/8 dark:border-dark-text/8">
              <Input
                label="Nouvel e-mail (optionnel)"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nouveau@exemple.com"
              />
              <div />
              <Input
                label="Nouveau mot de passe"
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8 caractères minimum"
              />
              <Input
                label="Confirmer le mot de passe"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répéter le nouveau mot de passe"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button variant="primary" size="md" onClick={saveAccount} disabled={accountSaving || !currentPassword}>
                {accountSaving ? <RefreshCw size={14} className="animate-spin" /> : <User size={14} />}
                {accountSaving ? 'Mise à jour…' : 'Mettre à jour le compte'}
              </Button>
              <p className="text-xs text-light-text/35 dark:text-dark-text/35">
                Laissez vide les champs que vous ne souhaitez pas modifier.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* ── Informations système ── */}
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-accent" />
              <h2 className="font-syne font-semibold text-light-text dark:text-dark-text">Informations système</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Plateforme', 'TrainDeck v1.0'],
                ['Framework', 'Next.js 14 (App Router)'],
                ['Base de données', 'SQLite (Prisma)'],
                ['Authentification', 'NextAuth.js JWT'],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-xs text-light-text/40 dark:text-dark-text/40 uppercase tracking-wider">{label}</span>
                  <span className="text-light-text/80 dark:text-dark-text/80 font-mono text-xs">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  )
}
