export type AdminRole =
  | 'SUPER_ADMIN'
  | 'SENIOR_ADMIN'
  | 'JUNIOR_ADMIN'
  | 'DEBUTANT_ADMIN'
  | 'CUSTOM_ADMIN'

export type Permission =
  | 'modules.write'
  | 'slides.write'
  | 'exercises.write'
  | 'agenda.write'
  | 'surveys.write'
  | 'users.read'
  | 'users.write'
  | 'team.manage'
  | 'security.read'
  | 'settings.write'

export const PERMISSION_LABELS: Record<Permission, string> = {
  'modules.write':   'Créer / supprimer des modules',
  'slides.write':    'Ajouter / modifier des slides',
  'exercises.write': 'Gérer les exercices',
  'agenda.write':    'Gérer l\'agenda',
  'surveys.write':   'Gérer les sondages',
  'users.read':      'Voir les utilisateurs',
  'users.write':     'Gérer les utilisateurs',
  'team.manage':     'Gérer l\'équipe admin',
  'security.read':   'Accéder aux logs sécurité',
  'settings.write':  'Modifier les paramètres',
}

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as Permission[]

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN:    ALL_PERMISSIONS,
  SENIOR_ADMIN:   ['modules.write', 'slides.write', 'exercises.write', 'agenda.write', 'surveys.write', 'users.read'],
  JUNIOR_ADMIN:   ['modules.write', 'slides.write', 'exercises.write'],
  DEBUTANT_ADMIN: ['slides.write'],
  CUSTOM_ADMIN:   [],
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN:    'Super Admin',
  SENIOR_ADMIN:   'Senior Admin',
  JUNIOR_ADMIN:   'Junior Admin',
  DEBUTANT_ADMIN: 'Débutant Admin',
  CUSTOM_ADMIN:   'Custom Admin',
}

export const ROLE_COLORS: Record<AdminRole, string> = {
  SUPER_ADMIN:    '#00D4FF',
  SENIOR_ADMIN:   '#3b82f6',
  JUNIOR_ADMIN:   '#8b5cf6',
  DEBUTANT_ADMIN: '#10b981',
  CUSTOM_ADMIN:   '#f59e0b',
}

/** Résout les permissions effectives d'un utilisateur */
export function resolvePermissions(role: AdminRole, customJson?: string | null): Permission[] {
  if (role === 'CUSTOM_ADMIN') {
    try { return JSON.parse(customJson ?? '[]') as Permission[] }
    catch { return [] }
  }
  return ROLE_PERMISSIONS[role] ?? []
}

export function hasPermission(permissions: Permission[], permission: Permission): boolean {
  return permissions.includes(permission)
}
