export type TransitionType =
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'fade'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip'
  | 'bounce'
  | 'rotate'

export const TRANSITION_LABELS: Record<TransitionType, string> = {
  'slide-left':  '← Glissement gauche',
  'slide-right': '→ Glissement droite',
  'slide-up':    '↑ Glissement haut',
  'slide-down':  '↓ Glissement bas',
  'fade':        '✦ Fondu',
  'zoom-in':     '⊕ Zoom avant',
  'zoom-out':    '⊖ Zoom arrière',
  'flip':        '⟳ Retournement',
  'bounce':      '⬆ Rebond',
  'rotate':      '↺ Rotation',
}

export type SlideType =
  | 'title-text'
  | 'title-image'
  | 'title-code'
  | 'title-bullets'
  | 'quote'
  | 'comparison'
  | 'free-layout'

export interface TitleTextContent { title: string; body: string }
export interface TitleImageContent { title: string; imageUrl: string; altText: string; position: 'center' | 'left' | 'right' }
export interface TitleCodeContent { title: string; code: string; language: string; highlightedHtml?: string }
export type BulletItem = { id: string; text: string }
export interface TitleBulletsContent { title: string; bullets: BulletItem[] }
export interface QuoteContent { quote: string; author: string; background: 'cyan' | 'purple' | 'dark' | 'amber' }
export interface ComparisonContent { leftTitle: string; leftContent: string; rightTitle: string; rightContent: string; dividerLabel: string }
export interface FreeLayoutContent { title: string; body: string }

export type SlideContent =
  | TitleTextContent | TitleImageContent | TitleCodeContent
  | TitleBulletsContent | QuoteContent | ComparisonContent | FreeLayoutContent

export interface SlideWithContent {
  id: string
  moduleId: string
  type: SlideType
  order: number
  content: SlideContent
  speakerNotes: string | null
  timerMinutes: number | null
  transition: TransitionType | null
  createdAt: string
}

export interface ModuleWithCount {
  id: string
  title: string
  description: string | null
  order: number
  createdAt: string
  _count: { slides: number }
}

export const SLIDE_TYPE_LABELS: Record<SlideType, string> = {
  'title-text': 'Titre + Texte',
  'title-image': 'Titre + Image',
  'title-code': 'Titre + Code',
  'title-bullets': 'Titre + Liste',
  'quote': 'Citation',
  'comparison': 'Comparaison',
  'free-layout': 'Libre',
}

export const SLIDE_TYPE_DESCRIPTIONS: Record<SlideType, string> = {
  'title-text': 'Titre et corps de texte riche',
  'title-image': 'Titre avec image positionnée',
  'title-code': 'Titre avec bloc de code coloré',
  'title-bullets': 'Titre avec liste à puces',
  'quote': 'Citation plein écran avec fond coloré',
  'comparison': 'Deux colonnes côte à côte',
  'free-layout': 'Canvas libre avec éditeur riche',
}

let _uid = 0
function uid() { return `b${Date.now()}-${++_uid}` }

export function getDefaultContent(type: SlideType): SlideContent {
  switch (type) {
    case 'title-text':    return { title: 'Titre du slide', body: '<p>Contenu du slide.</p>' }
    case 'title-image':   return { title: 'Titre du slide', imageUrl: '', altText: '', position: 'center' }
    case 'title-code':    return { title: 'Exemple de code', code: '// Votre code ici\nconsole.log("Hello, TrainDeck!")\n', language: 'javascript' }
    case 'title-bullets': return { title: 'Points clés', bullets: [{ id: uid(), text: 'Premier point' }, { id: uid(), text: 'Deuxième point' }] }
    case 'quote':         return { quote: 'Votre citation inspirante ici.', author: 'Auteur', background: 'cyan' }
    case 'comparison':    return { leftTitle: 'Avant', leftContent: '<p>Situation initiale</p>', rightTitle: 'Après', rightContent: '<p>Situation améliorée</p>', dividerLabel: 'VS' }
    case 'free-layout':   return { title: 'Slide libre', body: '<p>Contenu libre.</p>' }
  }
}
