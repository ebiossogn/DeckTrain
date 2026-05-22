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
  | 'canvas'

// ── Legacy form-based content types ──────────────────────────────────────────
export interface TitleTextContent { title: string; body: string }
export interface TitleImageContent { title: string; imageUrl: string; altText: string; position: 'center' | 'left' | 'right' }
export interface TitleCodeContent { title: string; code: string; language: string; highlightedHtml?: string }
export type BulletItem = { id: string; text: string }
export interface TitleBulletsContent { title: string; bullets: BulletItem[] }
export interface QuoteContent { quote: string; author: string; background: 'cyan' | 'purple' | 'dark' | 'amber' }
export interface ComparisonContent { leftTitle: string; leftContent: string; rightTitle: string; rightContent: string; dividerLabel: string }
export interface FreeLayoutContent { title: string; body: string }

// ── Canvas element types ──────────────────────────────────────────────────────
export interface TextProps {
  content: string
  fontSize: number
  fontFamily: string
  fontWeight: string
  fontStyle: string
  color: string
  backgroundColor: string
  textAlign: 'left' | 'center' | 'right'
  lineHeight: number
  letterSpacing: number
  padding: number
  borderRadius: number
}

export interface ImageProps {
  src: string
  alt: string
  objectFit: 'cover' | 'contain' | 'fill'
  borderRadius: number
  border: string
  shadow: string
}

export interface ShapeProps {
  shapeType: 'rectangle' | 'circle' | 'triangle'
  fill: string
  stroke: string
  strokeWidth: number
  borderRadius: number
  shadow: string
}

export interface IconProps {
  iconName: string
  color: string
  size: number
}

export interface CodeProps {
  code: string
  language: string
  showLineNumbers: boolean
}

export interface LineProps {
  orientation: 'horizontal' | 'vertical'
  color: string
  thickness: number
  style: 'solid' | 'dashed' | 'dotted'
}

export type ElementProps = TextProps | ImageProps | ShapeProps | IconProps | CodeProps | LineProps

export interface SlideElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'icon' | 'code' | 'line'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  opacity: number
  locked: boolean
  props: ElementProps
}

export interface SlideBackground {
  type: 'color' | 'gradient' | 'image'
  value: string
  gradientTo?: string
  gradientDirection?: string
}

export interface SlideCanvas {
  id: string
  elements: SlideElement[]
  background: SlideBackground
  speakerNotes: string | null
  timerMinutes: number | null
  transition: TransitionType | null
}

export type SlideContent =
  | TitleTextContent | TitleImageContent | TitleCodeContent
  | TitleBulletsContent | QuoteContent | ComparisonContent
  | FreeLayoutContent | SlideCanvas

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
  visibility?: string | null
  publishAt?: string | null
  countdownMessage?: string | null
  createdBy?: string | null
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
  'canvas': 'Canvas visuel',
}

export const SLIDE_TYPE_DESCRIPTIONS: Record<SlideType, string> = {
  'title-text': 'Titre et corps de texte riche',
  'title-image': 'Titre avec image positionnée',
  'title-code': 'Titre avec bloc de code coloré',
  'title-bullets': 'Titre avec liste à puces',
  'quote': 'Citation plein écran avec fond coloré',
  'comparison': 'Deux colonnes côte à côte',
  'free-layout': 'Canvas libre avec éditeur riche',
  'canvas': 'Éditeur visuel drag & drop style Canva',
}

let _uid = 0
function uid() { return `b${Date.now()}-${++_uid}` }

export function getDefaultContent(type: SlideType): SlideContent {
  switch (type) {
    case 'title-text':    return { title: 'Titre du slide', body: '<p>Contenu du slide.</p>' }
    case 'title-image':   return { title: 'Titre du slide', imageUrl: '', altText: '', position: 'center' }
    case 'title-code':    return { title: 'Exemple de code', code: '// Votre code ici\nconsole.log("Hello, DeckTrain!")\n', language: 'javascript' }
    case 'title-bullets': return { title: 'Points clés', bullets: [{ id: uid(), text: 'Premier point' }, { id: uid(), text: 'Deuxième point' }] }
    case 'quote':         return { quote: 'Votre citation inspirante ici.', author: 'Auteur', background: 'cyan' }
    case 'comparison':    return { leftTitle: 'Avant', leftContent: '<p>Situation initiale</p>', rightTitle: 'Après', rightContent: '<p>Situation améliorée</p>', dividerLabel: 'VS' }
    case 'free-layout':   return { title: 'Slide libre', body: '<p>Contenu libre.</p>' }
    case 'canvas':        return { id: '', elements: [], background: { type: 'color', value: '#111111' }, speakerNotes: null, timerMinutes: null, transition: null }
  }
}
