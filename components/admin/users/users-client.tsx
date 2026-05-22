'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  UserCircle, Plus, X, Check, Trash2, ToggleLeft, ToggleRight, Eye, EyeOff, Copy,
  GraduationCap, BookOpen, Award,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IssueCertificateModal } from '@/components/admin/users/issue-certificate-modal'
import { cn } from '@/lib/utils'

interface AppUserRecord {
  id: string
  email: string
  name: string
  type: 'formateur' | 'participant'
  isActive: boolean
  moduleIds: string | null
  createdAt: string
}

interface Module {
  id: string
  title: string
}

const TYPE_CONFIG = {
  formateur:   { label: 'Formateur',   icon: GraduationCap, color: '#00D4FF' },
  participant: { label: 'Participant', icon: BookOpen,       color: '#8b5cf6' },
}

function TypeBadge({ type }: { type: 'formateur' | 'participant' }) {
  const { label, color } = TYPE_CONFIG[type]
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ backgroundColor: color + '18', color }}>
      {label}
    </span>
  )
}

/* ── Modal création AppUser ── */
function CreateUserModal({
  modules, onClose, onCreated,
}: {
  modules: Module[]
  onClose: () => void
  onCreated: (u: AppUserRecord) => void
}) {
  const [email, setEmail]     = useState('')
  const [name, setName]       = useState('')
  const [type, setType]       = useState<'formateur' | 'participant'>('participant')
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<{ tempPassword: string } | null>(null)
  const [showPass, setShowPass] = useState(false)

  const toggleModule = (id: string) => setSelectedModules((p) =>
    p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
  )

  const handleSubmit = async () => {
    if (!email || !name) { toast.error('Email et nom requis'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, name, type,
          moduleIds: type === 'formateur' ? selectedModules : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      setResult({ tempPassword: data.tempPassword })
      onCreated(data.user)
      toast.success(`Compte ${email} créé`)
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const copy = (txt: string) => { navigator.clipboard.writeText(txt); toast.success('Copié !') }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && !result && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        className="bg-dark-surface border border-dark-text/12 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-text/8">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-accent" />
            <h2 className="font-syne font-semibold text-dark-text">Nouveau compte</h2>
          </div>
          {!result && <button onClick={onClose}><X size={16} className="text-dark-text/40 hover:text-dark-text" /></button>}
        </div>

        <div className="p-6 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/12 text-emerald-400 flex items-center justify-center mx-auto">
                <Check size={22} />
              </div>
              <p className="text-center text-sm text-dark-text/70">
                Compte créé. Mot de passe temporaire :
              </p>
              <div className="flex items-center gap-2 bg-dark-bg rounded-xl px-4 py-3">
                <code className="flex-1 font-mono text-accent text-sm">
                  {showPass ? result.tempPassword : '•'.repeat(result.tempPassword.length)}
                </code>
                <button onClick={() => setShowPass((v) => !v)} className="text-dark-text/40 hover:text-dark-text">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => copy(result.tempPassword)} className="text-dark-text/40 hover:text-accent transition-colors">
                  <Copy size={14} />
                </button>
              </div>
              <Button variant="primary" size="md" className="w-full" onClick={onClose}>Fermer</Button>
            </div>
          ) : (
            <>
              <Input label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@exemple.com" />
              <Input label="Nom complet *" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom Nom" />

              <div>
                <label className="block text-xs font-medium text-dark-text/55 uppercase tracking-wide mb-2">Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['participant', 'formateur'] as const).map((t) => {
                    const { label, icon: Icon, color } = TYPE_CONFIG[t]
                    return (
                      <button key={t} onClick={() => setType(t)}
                        className={cn('flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                          type === t ? 'border-accent/40 bg-accent/8' : 'border-dark-text/8 hover:border-dark-text/20'
                        )}
                      >
                        <Icon size={18} style={{ color: type === t ? color : undefined }} className={type !== t ? 'text-dark-text/40' : ''} />
                        <span className={cn('text-sm font-medium', type === t ? 'text-dark-text' : 'text-dark-text/55')}>{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Accès modules pour formateur */}
              {type === 'formateur' && modules.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-dark-text/55 uppercase tracking-wide mb-2">
                    Modules accessibles
                  </label>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {modules.map((m) => (
                      <button key={m.id} onClick={() => toggleModule(m.id)}
                        className={cn('w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-left',
                          selectedModules.includes(m.id) ? 'bg-accent/10 text-accent' : 'text-dark-text/50 hover:bg-dark-text/5 hover:text-dark-text'
                        )}>
                        <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                          selectedModules.includes(m.id) ? 'bg-accent border-accent' : 'border-dark-text/25')}>
                          {selectedModules.includes(m.id) && <Check size={10} className="text-dark-bg" />}
                        </div>
                        {m.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="md" onClick={onClose} className="flex-1">Annuler</Button>
                <Button variant="primary" size="md" onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? 'Création…' : 'Créer'}
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Composant principal ── */
export function UsersClient({ initial, modules }: { initial: AppUserRecord[]; modules: Module[] }) {
  const [users, setUsers]   = useState(initial)
  const [showCreate, setShowCreate] = useState(false)
  const [toggling, setToggling]     = useState<string | null>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [userToDelete, setUserToDelete] = useState<AppUserRecord | null>(null)
  const [certTarget, setCertTarget] = useState<AppUserRecord | null>(null)
  const [filter, setFilter]         = useState<'all' | 'formateur' | 'participant'>('all')

  const filtered = users.filter((u) => filter === 'all' || u.type === filter)

  const handleToggle = async (user: AppUserRecord) => {
    setToggling(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      if (!res.ok) { toast.error('Erreur'); return }
      const updated = await res.json()
      setUsers((p) => p.map((u) => u.id === updated.id ? updated : u))
      toast.success(updated.isActive ? 'Compte réactivé' : 'Compte désactivé')
    } catch { toast.error('Erreur réseau') }
    finally { setToggling(null) }
  }

  const handleDelete = (user: AppUserRecord) => setUserToDelete(user)

  const confirmDelete = async () => {
    if (!userToDelete) return
    setDeleting(userToDelete.id)
    setUserToDelete(null)
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Erreur'); return }
      setUsers((p) => p.filter((u) => u.id !== userToDelete.id))
      toast.success('Compte supprimé')
    } catch { toast.error('Erreur réseau') }
    finally { setDeleting(null) }
  }

  const formateurs   = users.filter((u) => u.type === 'formateur').length
  const participants = users.filter((u) => u.type === 'participant').length

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle size={22} className="text-accent" />
            <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">Utilisateurs</h1>
          </div>
          <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Nouveau compte
          </Button>
        </div>
        <p className="text-light-text/50 dark:text-dark-text/50 mt-1">
          Comptes formateurs et participants de la plateforme.
        </p>
      </motion.div>

      {/* Stats rapides */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="flex items-center gap-3">
        {([
          { key: 'all',         label: `Tous (${users.length})` },
          { key: 'formateur',   label: `Formateurs (${formateurs})` },
          { key: 'participant', label: `Participants (${participants})` },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
              filter === key ? 'bg-accent/12 text-accent' : 'text-light-text/45 dark:text-dark-text/45 hover:bg-light-text/5 dark:hover:bg-dark-text/5'
            )}>
            {label}
          </button>
        ))}
      </motion.div>

      {/* Liste */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <UserCircle size={32} className="mx-auto text-light-text/20 dark:text-dark-text/20 mb-3" />
            <p className="text-sm text-light-text/40 dark:text-dark-text/40">
              Aucun compte {filter !== 'all' ? TYPE_CONFIG[filter as 'formateur'|'participant'].label.toLowerCase() : ''}
            </p>
          </Card>
        ) : filtered.map((user) => {
          const moduleList = user.moduleIds ? JSON.parse(user.moduleIds) as string[] : []
          const moduleNames = moduleList.map((id) => modules.find((m) => m.id === id)?.title ?? id).filter(Boolean)
          const { color } = TYPE_CONFIG[user.type]

          return (
            <Card key={user.id} className={cn('p-4 transition-opacity', !user.isActive && 'opacity-55')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-syne font-bold text-sm"
                  style={{ backgroundColor: color + '18', color }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-light-text dark:text-dark-text">{user.name}</span>
                    <TypeBadge type={user.type} />
                    {!user.isActive && <span className="text-[10px] bg-dark-text/10 text-dark-text/40 px-1.5 py-0.5 rounded-full">Désactivé</span>}
                  </div>
                  <p className="text-xs text-light-text/45 dark:text-dark-text/45 mt-0.5">{user.email}</p>
                  {user.type === 'formateur' && (
                    <p className="text-[10px] text-light-text/30 dark:text-dark-text/30 mt-0.5">
                      {moduleNames.length > 0 ? moduleNames.join(', ') : 'Accès à tous les modules'}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setCertTarget(user)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-amber-400 hover:bg-amber-400/8 transition-colors"
                    title="Émettre un certificat"
                  >
                    <Award size={14} />
                  </button>
                  <button onClick={() => handleToggle(user)} disabled={toggling === user.id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-accent hover:bg-accent/8 transition-colors"
                    title={user.isActive ? 'Désactiver' : 'Réactiver'}>
                    {user.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => handleDelete(user)} disabled={deleting === user.id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-red-400 hover:bg-red-400/8 transition-colors"
                    title="Supprimer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </motion.div>

      <AnimatePresence>
        {showCreate && (
          <CreateUserModal
            modules={modules}
            onClose={() => setShowCreate(false)}
            onCreated={(u) => setUsers((p) => [u, ...p])}
          />
        )}
        {certTarget && (
          <IssueCertificateModal
            participant={{ id: certTarget.id, name: certTarget.name, email: certTarget.email }}
            modules={modules}
            onClose={() => setCertTarget(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!userToDelete}
        title="Supprimer ce compte ?"
        message={`Le compte de ${userToDelete?.name ?? ''} sera définitivement supprimé. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  )
}
