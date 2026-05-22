export const translations = {
  fr: {
    // Navigation admin
    'admin.nav.overview':   'Tableau de bord',
    'admin.nav.modules':    'Modules & Slides',
    'admin.nav.exercises':  'Exercices',
    'admin.nav.agenda':     'Agenda',
    'admin.nav.surveys':    'Sondages',
    'admin.nav.team':       'Équipe',
    'admin.nav.users':      'Utilisateurs',
    'admin.nav.trash':      'Corbeille',
    'admin.nav.billing':    'Facturation',
    'admin.nav.security':   'Sécurité',
    'admin.nav.settings':   'Paramètres',
    'admin.nav.audit':      "Journal d'audit",
    'admin.nav.present':    'Mode présentation',
    'admin.label':          'Administration',

    // Actions
    'action.save':     'Enregistrer',
    'action.cancel':   'Annuler',
    'action.delete':   'Supprimer',
    'action.edit':     'Modifier',
    'action.create':   'Créer',
    'action.add':      'Ajouter',
    'action.loading':  'Chargement…',
    'action.confirm':  'Confirmer',
    'action.search':   'Rechercher…',
    'action.logout':   'Se déconnecter',

    // Modules
    'module.create':        'Nouveau module',
    'module.edit':          'Modifier le module',
    'module.delete':        'Supprimer le module',
    'module.visibility':    'Visibilité',
    'module.private':       'Privé',
    'module.public':        'Public',
    'module.countdown':     'Compte à rebours',
    'module.slides':        'slides',
    'module.manage_slides': 'Gérer les slides',

    // Slides
    'slide.new':        'Nouvelle slide',
    'slide.type':       'Type de slide',
    'slide.notes':      'Notes présentateur',
    'slide.timer':      'Minuteur (minutes)',
    'slide.transition': 'Transition',

    // Exercices
    'exercise.create':             'Nouvel exercice',
    'exercise.type.workshop':      'Atelier',
    'exercise.type.quiz':          'QCM',
    'exercise.difficulty.easy':    'Facile',
    'exercise.difficulty.medium':  'Intermédiaire',
    'exercise.difficulty.hard':    'Avancé',

    // Utilisateurs
    'user.invite':          'Inviter un admin',
    'user.role':            'Rôle',
    'user.status.active':   'Actif',
    'user.status.inactive': 'Inactif',

    // Messages
    'msg.success.saved':   'Sauvegardé avec succès',
    'msg.success.deleted': 'Supprimé avec succès',
    'msg.error.generic':   'Une erreur est survenue',
    'msg.confirm.delete':  'Confirmer la suppression ?',

    // Interface
    'ui.interface':  'Interface',
    'ui.search':     'Recherche globale…',

    // Footer
    'footer.copyright': '© CHRIST J. — Tous droits réservés',
  },

  en: {
    // Navigation admin
    'admin.nav.overview':   'Dashboard',
    'admin.nav.modules':    'Modules & Slides',
    'admin.nav.exercises':  'Exercises',
    'admin.nav.agenda':     'Schedule',
    'admin.nav.surveys':    'Surveys',
    'admin.nav.team':       'Team',
    'admin.nav.users':      'Users',
    'admin.nav.trash':      'Trash',
    'admin.nav.billing':    'Billing',
    'admin.nav.security':   'Security',
    'admin.nav.settings':   'Settings',
    'admin.nav.audit':      'Audit Log',
    'admin.nav.present':    'Presentation mode',
    'admin.label':          'Administration',

    // Actions
    'action.save':     'Save',
    'action.cancel':   'Cancel',
    'action.delete':   'Delete',
    'action.edit':     'Edit',
    'action.create':   'Create',
    'action.add':      'Add',
    'action.loading':  'Loading…',
    'action.confirm':  'Confirm',
    'action.search':   'Search…',
    'action.logout':   'Sign out',

    // Modules
    'module.create':        'New module',
    'module.edit':          'Edit module',
    'module.delete':        'Delete module',
    'module.visibility':    'Visibility',
    'module.private':       'Private',
    'module.public':        'Public',
    'module.countdown':     'Countdown',
    'module.slides':        'slides',
    'module.manage_slides': 'Manage slides',

    // Slides
    'slide.new':        'New slide',
    'slide.type':       'Slide type',
    'slide.notes':      'Speaker notes',
    'slide.timer':      'Timer (minutes)',
    'slide.transition': 'Transition',

    // Exercices
    'exercise.create':             'New exercise',
    'exercise.type.workshop':      'Workshop',
    'exercise.type.quiz':          'Quiz',
    'exercise.difficulty.easy':    'Easy',
    'exercise.difficulty.medium':  'Intermediate',
    'exercise.difficulty.hard':    'Advanced',

    // Utilisateurs
    'user.invite':          'Invite admin',
    'user.role':            'Role',
    'user.status.active':   'Active',
    'user.status.inactive': 'Inactive',

    // Messages
    'msg.success.saved':   'Saved successfully',
    'msg.success.deleted': 'Deleted successfully',
    'msg.error.generic':   'An error occurred',
    'msg.confirm.delete':  'Confirm deletion?',

    // Interface
    'ui.interface':  'Interface',
    'ui.search':     'Global search…',

    // Footer
    'footer.copyright': '© CHRIST J. — All rights reserved',
  },
} as const

export type Locale = keyof typeof translations
export type TranslationKey = keyof typeof translations.fr
