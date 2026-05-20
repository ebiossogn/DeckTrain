'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Users, Plus, X, Shield, Check, ChevronDown, ToggleLeft, ToggleRight,
  Trash2, Copy, Eye, EyeOff, Crown,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  ROLE_LABELS, ROLE_COLORS, ROLE_PERMISSIONS, PERMISSION_LABELS, ALL_PERMISSIONS,
  resolvePermissions,
} from '@/types/roles'
import type { AdminRole, Permission } from '@/types/roles'

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: AdminRole
  permissions: string | null
  isBlocked: boolean
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

const ALL_ROLES: AdminRole[] = ['SUPER_ADMIN', 'SENIOR_ADMIN', 'JUNIOR_ADMIN', 'DEBUTANT_ADMIN', 'CUSTOM_ADMIN']

function timeAgo(iso: string | null): string {
  if (!iso) return 'Jamais'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24)
  if (d > 30) return new Date(iso).toLocaleDateString('fr-FR')
  if (d > 0) return `il y a ${d}j`
  if (h > 0) return `il y a ${h}h`
  if (m > 0) return `il y a ${m}min`
  return "à l'instant"
}

function RoleBadge({ role }: { role: AdminRole }) {
  const color = ROLE_COLORS[role]
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ backgroundColor: color + '18', color }}>
      {role === 'SUPER_ADMIN' && <Crown size={9} />}
      {ROLE_LABELS[role]}
    </span>
  )
}

/* ── Modal invitation ── */
function InviteModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: AdminUser) => void }) {
  const [email, setEmail]   = useState('')
  const [name, setName]     = useState('')
  const [role, setRole]     = useState<AdminRole>('JUNIOR_ADMIN')
  const [customPerms, setCustomPerms] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ tempPassword: string; userEmail: string } | null>(null)
  const [showPass, setShowPass] = useState(false)

  const togglePerm = (p: Permission) => setCustomPerms((prev) =>
    prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
  )

  const handleSubmit = async () => {
    if (!email) { toast.error('Email requis'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role, permissions: customPerms }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      setResult({ tempPassword: data.tempPassword, userEmail: data.user.email })
      onCreated(data.user)
      toast.success(`Admin ${email} créé`)
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
        className="bg-dark-surface border border-dark-text/12 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-text/8">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-accent" />
            <h2 className="font-syne font-semibold text-dark-text">Inviter un admin</h2>
          </div>
          {!result && <button onClick={onClose}><X size={16} className="text-dark-text/40 hover:text-dark-text" /></button>}
        </div>

        <div className="p-6 space-y-4">
          {result ? (
            /* ── Résultat : mot de passe temporaire ── */
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/12 text-emerald-400 flex items-center justify-center mx-auto">
                <Check size={22} />
              </div>
              <p className="text-center text-sm text-dark-text/70">
                Compte créé pour <strong className="text-dark-text">{result.userEmail}</strong>.<br />
                Transmettez ce mot de passe temporaire :
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
              <p className="text-xs text-dark-text/35 text-center">
                Ce mot de passe n&apos;est affiché qu&apos;une seule fois.
              </p>
              <Button variant="primary" size="md" className="w-full" onClick={onClose}>
                Fermer
              </Button>
            </div>
          ) : (
            /* ── Formulaire d'invitation ── */
            <>
              <Input label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@exemple.com" />
              <Input label="Nom (optionnel)" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom Nom" />

              <div>
                <label className="block text-xs font-medium text-dark-text/55 uppercase tracking-wide mb-2">Rôle *</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {ALL_ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-xl border text-sm transition-all text-left',
                        role === r
                          ? 'border-accent/40 bg-accent/8 text-dark-text'
                          : 'border-dark-text/8 hover:border-dark-text/20 text-dark-text/60 hover:text-dark-text'
                      )}
                    >
                      <div>
                        <span className="font-medium">{ROLE_LABELS[r]}</span>
                        <p className="text-[10px] text-dark-text/40 mt-0.5">
                          {r === 'CUSTOM_ADMIN' ? 'Permissions personnalisées' : ROLE_PERMISSIONS[r].length + ' permissions'}
                        </p>
                      </div>
                      <RoleBadge role={r} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions CUSTOM */}
              {role === 'CUSTOM_ADMIN' && (
                <div>
                  <label className="block text-xs font-medium text-dark-text/55 uppercase tracking-wide mb-2">Permissions</label>
                  <div className="space-y-1">
                    {ALL_PERMISSIONS.map((p) => (
                      <button
                        key={p}
                        onClick={() => togglePerm(p)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-left',
                          customPerms.includes(p)
                            ? 'bg-accent/10 text-accent'
                            : 'text-dark-text/50 hover:bg-dark-text/5 hover:text-dark-text'
                        )}
                      >
                        <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                          customPerms.includes(p) ? 'bg-accent border-accent' : 'border-dark-text/25')}>
                          {customPerms.includes(p) && <Check size={10} className="text-dark-bg" />}
                        </div>
                        {PERMISSION_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="md" onClick={onClose} className="flex-1">Annuler</Button>
                <Button variant="primary" size="md" onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? 'Création…' : 'Créer le compte'}
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Modal édition rôle/permissions ── */
function EditRoleModal({ user, onClose, onUpdated }: { user: AdminUser; onClose: () => void; onUpdated: (u: AdminUser) => void }) {
  const [role, setRole]   = useState<AdminRole>(user.role)
  const [perms, setPerms] = useState<Permission[]>(resolvePermissions(user.role, user.permissions))
  const [loading, setLoading] = useState(false)

  const togglePerm = (p: Permission) => setPerms((prev) =>
    prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
  )

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/team/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, permissions: role === 'CUSTOM_ADMIN' ? perms : undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      toast.success('Rôle mis à jour')
      onUpdated(data)
      onClose()
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
        className="bg-dark-surface border border-dark-text/12 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-text/8">
          <h2 className="font-syne font-semibold text-dark-text">Modifier le rôle</h2>
          <button onClick={onClose}><X size={16} className="text-dark-text/40 hover:text-dark-text" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-dark-text/60">{user.email}</p>

          <div className="grid grid-cols-1 gap-1.5">
            {ALL_ROLES.map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-xl border text-sm transition-all',
                  role === r ? 'border-accent/40 bg-accent/8' : 'border-dark-text/8 hover:border-dark-text/20'
                )}
              >
                <span className={cn('font-medium', role === r ? 'text-dark-text' : 'text-dark-text/60')}>{ROLE_LABELS[r]}</span>
                <RoleBadge role={r} />
              </button>
            ))}
          </div>

          {role === 'CUSTOM_ADMIN' && (
            <div className="space-y-1 pt-1 border-t border-dark-text/8">
              <label className="block text-xs font-medium text-dark-text/55 uppercase tracking-wide mb-2">Permissions</label>
              {ALL_PERMISSIONS.map((p) => (
                <button key={p} onClick={() => togglePerm(p)}
                  className={cn('w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-left',
                    perms.includes(p) ? 'bg-accent/10 text-accent' : 'text-dark-text/50 hover:bg-dark-text/5 hover:text-dark-text'
                  )}
                >
                  <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                    perms.includes(p) ? 'bg-accent border-accent' : 'border-dark-text/25')}>
                    {perms.includes(p) && <Check size={10} className="text-dark-bg" />}
                  </div>
                  {PERMISSION_LABELS[p]}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="ghost" size="md" onClick={onClose} className="flex-1">Annuler</Button>
            <Button variant="primary" size="md" onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? 'Sauvegarde…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Composant principal ── */
export function TeamClient({ initial, currentUserId }: { initial: AdminUser[]; currentUserId: string }) {
  const [admins, setAdmins] = useState(initial)
  const [showInvite, setShowInvite] = useState(false)
  const [editUser, setEditUser]     = useState<AdminUser | null>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null)
  const [toggling, setToggling]     = useState<string | null>(null)
  const [expandPerms, setExpandPerms] = useState<string | null>(null)

  const handleToggleActive = async (user: AdminUser) => {
    setToggling(user.id)
    try {
      const res = await fetch(`/api/admin/team/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      setAdmins((prev) => prev.map((a) => a.id === user.id ? data : a))
      toast.success(data.isActive ? `${user.email} réactivé` : `${user.email} désactivé`)
    } catch { toast.error('Erreur réseau') }
    finally { setToggling(null) }
  }

  const handleDelete = (user: AdminUser) => setAdminToDelete(user)

  const confirmDelete = async () => {
    if (!adminToDelete) return
    setDeleting(adminToDelete.id)
    setAdminToDelete(null)
    try {
      const res = await fetch(`/api/admin/team/${adminToDelete.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      setAdmins((prev) => prev.filter((a) => a.id !== adminToDelete.id))
      toast.success('Admin supprimé')
    } catch { toast.error('Erreur réseau') }
    finally { setDeleting(null) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Badge variant="default" className="mb-3">Administration</Badge>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={22} className="text-accent" />
            <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text">Équipe admin</h1>
          </div>
          <Button variant="primary" size="md" onClick={() => setShowInvite(true)}>
            <Plus size={15} /> Inviter un admin
          </Button>
        </div>
        <p className="text-light-text/50 dark:text-dark-text/50 mt-1">
          Gestion des comptes administrateurs et de leurs permissions.
        </p>
      </motion.div>

      {/* ── Liste des admins ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="space-y-2"
      >
        {admins.map((admin) => {
          const perms = resolvePermissions(admin.role, admin.permissions)
          const isSelf = admin.id === currentUserId
          const isExpanded = expandPerms === admin.id

          return (
            <Card key={admin.id} className={cn('p-4 transition-opacity', !admin.isActive && 'opacity-55')}>
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-syne font-bold text-sm"
                  style={{ backgroundColor: ROLE_COLORS[admin.role] + '18', color: ROLE_COLORS[admin.role] }}>
                  {(admin.name ?? admin.email).charAt(0).toUpperCase()}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-light-text dark:text-dark-text truncate">
                      {admin.name ?? admin.email}
                    </span>
                    {isSelf && <span className="text-[10px] bg-accent/12 text-accent px-1.5 py-0.5 rounded-full">Vous</span>}
                    <RoleBadge role={admin.role} />
                    {admin.isBlocked && <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full">Bloqué</span>}
                    {!admin.isActive && <span className="text-[10px] bg-dark-text/10 text-dark-text/40 px-1.5 py-0.5 rounded-full">Désactivé</span>}
                  </div>
                  <p className="text-xs text-light-text/45 dark:text-dark-text/45 mt-0.5">{admin.email}</p>
                  <p className="text-[10px] text-light-text/30 dark:text-dark-text/30 mt-0.5" suppressHydrationWarning>
                    Dernière connexion : {timeAgo(admin.lastLoginAt)}
                  </p>
                </div>

                {/* Actions */}
                {!isSelf && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setEditUser(admin)}
                      className="text-light-text/50 dark:text-dark-text/50 hover:text-accent">
                      <Shield size={13} />
                    </Button>
                    <button
                      onClick={() => handleToggleActive(admin)}
                      disabled={toggling === admin.id}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-accent hover:bg-accent/8 transition-colors"
                      title={admin.isActive ? 'Désactiver' : 'Réactiver'}
                    >
                      {admin.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(admin)}
                      disabled={deleting === admin.id}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-red-400 hover:bg-red-400/8 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Permissions expandable */}
              <div className="mt-2 pl-14">
                <button
                  onClick={() => setExpandPerms(isExpanded ? null : admin.id)}
                  className="flex items-center gap-1 text-[10px] text-light-text/35 dark:text-dark-text/35 hover:text-accent transition-colors"
                >
                  <ChevronDown size={10} className={cn('transition-transform', isExpanded && 'rotate-180')} />
                  {perms.length} permission{perms.length !== 1 ? 's' : ''}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-1 mt-2">
                        {perms.length === 0
                          ? <span className="text-[10px] text-dark-text/30">Aucune permission</span>
                          : perms.map((p) => (
                            <span key={p} className="text-[9px] bg-dark-text/8 text-dark-text/50 px-1.5 py-0.5 rounded">
                              {PERMISSION_LABELS[p]}
                            </span>
                          ))
                        }
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          )
        })}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showInvite && (
          <InviteModal
            onClose={() => setShowInvite(false)}
            onCreated={(u) => setAdmins((prev) => [...prev, u as AdminUser])}
          />
        )}
        {editUser && (
          <EditRoleModal
            user={editUser}
            onClose={() => setEditUser(null)}
            onUpdated={(u) => setAdmins((prev) => prev.map((a) => a.id === u.id ? u : a))}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!adminToDelete}
        title="Supprimer cet administrateur ?"
        message={`Le compte admin de ${adminToDelete?.email ?? ''} sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setAdminToDelete(null)}
      />
    </div>
  )
}
