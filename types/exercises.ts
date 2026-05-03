export type ExerciseType = 'qcm' | 'atelier'
export type Difficulty = 'facile' | 'intermediaire' | 'avance'

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facile: 'Facile',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  facile: 'text-emerald-400 border-emerald-400/25 bg-emerald-400/8',
  intermediaire: 'text-amber-400 border-amber-400/25 bg-amber-400/8',
  avance: 'text-red-400 border-red-400/25 bg-red-400/8',
}

export interface QcmChoice {
  id: string
  text: string
  correct: boolean
}

export interface QcmContent {
  question: string
  choices: QcmChoice[]
  explanation?: string
}

export interface AtelierContent {
  description: string
}

export type ExerciseContent = QcmContent | AtelierContent

export interface ExerciseWithContent {
  id: string
  moduleId: string
  type: ExerciseType
  title: string
  content: ExerciseContent
  difficulty: Difficulty
  solution: string | null
  order: number
  createdAt: string
}
