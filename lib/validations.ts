import { z } from 'zod'

// ── Module ────────────────────────────────────────────────────────────────────
export const createModuleSchema = z.object({
  title: z.string()
    .min(1, 'Le titre est obligatoire')
    .max(200, 'Titre trop long')
    .trim()
    .regex(/^[^<>{}|\\]+$/, 'Caractères invalides'),
  description: z.string()
    .max(1000, 'Description trop longue')
    .optional(),
})

// ── Slide ─────────────────────────────────────────────────────────────────────
export const createSlideSchema = z.object({
  type: z.enum([
    'title-text', 'title-image', 'title-code',
    'title-bullets', 'quote', 'comparison', 'free',
  ]),
  content: z.record(z.string(), z.unknown()),
  order: z.number().int().min(0).optional(),
  speakerNotes: z.string().max(2000).optional(),
  timerMinutes: z.number().int().min(1).max(180).optional(),
})

// ── Inscription ───────────────────────────────────────────────────────────────
const BLOCKED_DOMAINS = [
  'mailinator.com', 'tempmail.com', 'guerrillamail.com',
  'throwaway.email', 'yopmail.com', '10minutemail.com',
]

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nom trop court')
    .max(100, 'Nom trop long')
    .trim(),
  email: z.string()
    .email('Email invalide')
    .toLowerCase()
    .refine((email) => {
      const domain = email.split('@')[1] ?? ''
      return !BLOCKED_DOMAINS.includes(domain)
    }, { message: 'Email temporaire non autorisé' }),
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins 1 majuscule')
    .regex(/[0-9]/, 'Au moins 1 chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins 1 caractère spécial'),
  _honey: z.string().max(0, 'Bot détecté').optional(),
})

// ── Exercice ──────────────────────────────────────────────────────────────────
export const createExerciseSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire').max(300).trim(),
  type: z.enum(['qcm', 'atelier']),
  difficulty: z.enum(['facile', 'intermediaire', 'avance']),
  content: z.record(z.string(), z.unknown()),
  solution: z.string().max(5000).optional(),
})

// ── Agenda ────────────────────────────────────────────────────────────────────
export const createAgendaSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire').max(300).trim(),
  type: z.enum(['formation', 'examen', 'reunion', 'atelier', 'conference', 'autre']),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  description: z.string().max(1000).optional(),
  location: z.string().max(500).optional(),
  status: z.enum(['planifie', 'en_cours', 'termine', 'annule']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')).or(z.null()),
  moduleId: z.string().optional().nullable(),
})

// ── Sondage ───────────────────────────────────────────────────────────────────
export const createSurveySchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire').max(300).trim(),
  description: z.string().max(1000).optional(),
  questions: z.array(
    z.object({
      title: z.string().min(1, 'Question obligatoire').max(500),
      type: z.enum(['mcq', 'wordcloud', 'rating', 'qa', 'slider']),
      options: z.string().max(2000).optional().nullable(),
      multiple: z.boolean().optional(),
    })
  ).min(1, 'Au moins une question').max(20, 'Maximum 20 questions'),
})

// ── Paramètres ────────────────────────────────────────────────────────────────
export const updateSettingsSchema = z.object({
  platformTitle: z.string().max(100).optional(),
  trainingTitle: z.string().max(200).optional(),
  trainingSubtitle: z.string().max(200).optional(),
  trainerName: z.string().max(100).optional(),
  accentColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide')
    .optional(),
  solutionsVisible: z.boolean().optional(),
})

// ── Invitation admin ──────────────────────────────────────────────────────────
export const inviteAdminSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(2).max(100).trim(),
  role: z.enum([
    'SUPER_ADMIN', 'SENIOR_ADMIN', 'JUNIOR_ADMIN',
    'DEBUTANT_ADMIN', 'CUSTOM_ADMIN',
  ]),
  permissions: z.array(z.string()).optional(),
})

// ── Changement mot de passe ───────────────────────────────────────────────────
export const changePasswordSchema = z.object({
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins 1 majuscule')
    .regex(/[0-9]/, 'Au moins 1 chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins 1 caractère spécial'),
})
