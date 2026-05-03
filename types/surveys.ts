export type QuestionType = 'mcq' | 'wordcloud' | 'rating' | 'qa' | 'slider'

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq:       'Choix multiple',
  wordcloud: 'Nuage de mots',
  rating:    'Vote étoiles (1-5)',
  qa:        'Q&A ouvert',
  slider:    'Curseur / Échelle',
}

export const QUESTION_TYPE_ICONS: Record<QuestionType, string> = {
  mcq:       '☑',
  wordcloud: '☁',
  rating:    '★',
  qa:        '✎',
  slider:    '⟺',
}

export interface McqOptions { choices: string[] }
export interface SliderOptions { min: number; max: number; leftLabel: string; rightLabel: string }

export interface SurveyQuestionData {
  id: string
  surveyId: string
  type: QuestionType
  order: number
  title: string
  options: string | null
  multiple: boolean
  createdAt: string
}

export interface SurveyData {
  id: string
  title: string
  description: string | null
  code: string
  isActive: boolean
  isLive: boolean
  questions: SurveyQuestionData[]
  createdAt: string
  _count?: { responses: number }
}

/* ── Résultats agrégés ── */
export interface McqResult     { type: 'mcq';       choices: { label: string; count: number; pct: number }[]; total: number }
export interface WordResult    { type: 'wordcloud'; words: { word: string; count: number }[]; total: number }
export interface RatingResult  { type: 'rating';    distribution: { star: number; count: number }[]; average: number; total: number }
export interface QaResult      { type: 'qa';        responses: string[]; total: number }
export interface SliderResult  { type: 'slider';    average: number; histogram: { bucket: string; count: number }[]; total: number }

export type QuestionResult = McqResult | WordResult | RatingResult | QaResult | SliderResult

export interface SurveyResults {
  surveyId: string
  questions: { questionId: string; title: string; type: QuestionType; result: QuestionResult }[]
  totalRespondents: number
}
