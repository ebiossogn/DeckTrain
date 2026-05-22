import type { SlideElement, SlideBackground } from '@/types/slides'

export interface SlideTemplate {
  id: string
  name: string
  preview: string
  background: SlideBackground
  elements: Omit<SlideElement, 'id'>[]
}

const TEXT_DEFAULTS: Pick<import('@/types/slides').TextProps, 'fontStyle' | 'letterSpacing' | 'padding' | 'borderRadius' | 'backgroundColor' | 'lineHeight'> = {
  fontStyle: 'normal',
  letterSpacing: 0,
  padding: 0,
  borderRadius: 0,
  backgroundColor: 'transparent',
  lineHeight: 1.3,
}

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: 'blank',
    name: 'Vide',
    preview: '□',
    background: { type: 'color', value: '#111111' },
    elements: [],
  },
  {
    id: 'title-only',
    name: 'Titre seul',
    preview: 'T',
    background: { type: 'color', value: '#111111' },
    elements: [
      {
        type: 'text',
        x: 10, y: 35, width: 80, height: 30,
        rotation: 0, zIndex: 1, opacity: 1, locked: false,
        props: {
          content: 'Titre de la slide',
          fontSize: 72, fontFamily: 'Syne, sans-serif',
          fontWeight: 'bold', color: '#FFFFFF',
          textAlign: 'center', ...TEXT_DEFAULTS,
        },
      },
    ],
  },
  {
    id: 'title-subtitle',
    name: 'Titre + Sous-titre',
    preview: 'T/S',
    background: { type: 'color', value: '#111111' },
    elements: [
      {
        type: 'shape',
        x: 5, y: 22, width: 0.5, height: 56,
        rotation: 0, zIndex: 1, opacity: 1, locked: false,
        props: { shapeType: 'rectangle', fill: '#00D4FF', stroke: 'transparent', strokeWidth: 0, borderRadius: 2, shadow: 'none' },
      },
      {
        type: 'text',
        x: 8, y: 25, width: 70, height: 25,
        rotation: 0, zIndex: 2, opacity: 1, locked: false,
        props: {
          content: 'Titre principal',
          fontSize: 60, fontFamily: 'Syne, sans-serif',
          fontWeight: 'bold', color: '#FFFFFF',
          textAlign: 'left', ...TEXT_DEFAULTS,
        },
      },
      {
        type: 'text',
        x: 8, y: 56, width: 65, height: 16,
        rotation: 0, zIndex: 2, opacity: 1, locked: false,
        props: {
          content: 'Sous-titre ou description courte',
          fontSize: 24, fontFamily: 'Inter, sans-serif',
          fontWeight: 'normal', color: '#888888',
          textAlign: 'left', ...TEXT_DEFAULTS,
        },
      },
    ],
  },
  {
    id: 'two-columns',
    name: '2 Colonnes',
    preview: '||',
    background: { type: 'color', value: '#111111' },
    elements: [
      {
        type: 'text',
        x: 5, y: 10, width: 90, height: 18,
        rotation: 0, zIndex: 1, opacity: 1, locked: false,
        props: {
          content: 'Titre comparaison',
          fontSize: 44, fontFamily: 'Syne, sans-serif',
          fontWeight: 'bold', color: '#FFFFFF',
          textAlign: 'center', ...TEXT_DEFAULTS,
        },
      },
      {
        type: 'shape',
        x: 5, y: 30, width: 42, height: 60,
        rotation: 0, zIndex: 1, opacity: 1, locked: false,
        props: { shapeType: 'rectangle', fill: '#1C1C1C', stroke: '#2E2E2E', strokeWidth: 1, borderRadius: 12, shadow: 'none' },
      },
      {
        type: 'text',
        x: 8, y: 35, width: 36, height: 50,
        rotation: 0, zIndex: 2, opacity: 1, locked: false,
        props: {
          content: 'Colonne gauche\n\n• Point A\n• Point B\n• Point C',
          fontSize: 20, fontFamily: 'Inter, sans-serif',
          fontWeight: 'normal', color: '#CCCCCC',
          textAlign: 'left', ...TEXT_DEFAULTS,
        },
      },
      {
        type: 'shape',
        x: 53, y: 30, width: 42, height: 60,
        rotation: 0, zIndex: 1, opacity: 1, locked: false,
        props: { shapeType: 'rectangle', fill: '#001820', stroke: '#00D4FF', strokeWidth: 1, borderRadius: 12, shadow: 'none' },
      },
      {
        type: 'text',
        x: 56, y: 35, width: 36, height: 50,
        rotation: 0, zIndex: 2, opacity: 1, locked: false,
        props: {
          content: 'Colonne droite\n\n• Point X\n• Point Y\n• Point Z',
          fontSize: 20, fontFamily: 'Inter, sans-serif',
          fontWeight: 'normal', color: '#00D4FF',
          textAlign: 'left', ...TEXT_DEFAULTS,
        },
      },
    ],
  },
  {
    id: 'quote',
    name: 'Citation',
    preview: '"',
    background: { type: 'color', value: '#0A1A20' },
    elements: [
      {
        type: 'text',
        x: 10, y: 8, width: 12, height: 30,
        rotation: 0, zIndex: 1, opacity: 0.15, locked: false,
        props: {
          content: '"',
          fontSize: 200, fontFamily: 'Georgia, serif',
          fontWeight: 'bold', color: '#00D4FF',
          textAlign: 'left', ...TEXT_DEFAULTS,
        },
      },
      {
        type: 'text',
        x: 10, y: 28, width: 80, height: 35,
        rotation: 0, zIndex: 2, opacity: 1, locked: false,
        props: {
          content: 'Votre citation inspirante ici. Une phrase qui résume tout.',
          fontSize: 36, fontFamily: 'Georgia, serif',
          fontWeight: 'normal', color: '#FFFFFF',
          textAlign: 'center' as const, lineHeight: 1.6,
          fontStyle: 'normal', letterSpacing: 0, padding: 0, borderRadius: 0, backgroundColor: 'transparent',
        },
      },
      {
        type: 'text',
        x: 30, y: 70, width: 40, height: 12,
        rotation: 0, zIndex: 2, opacity: 1, locked: false,
        props: {
          content: '— Auteur',
          fontSize: 18, fontFamily: 'Inter, sans-serif',
          fontWeight: 'normal', color: '#00D4FF',
          textAlign: 'center', ...TEXT_DEFAULTS,
        },
      },
    ],
  },
  {
    id: 'code-slide',
    name: 'Titre + Code',
    preview: '</>',
    background: { type: 'color', value: '#0D1117' },
    elements: [
      {
        type: 'text',
        x: 5, y: 5, width: 70, height: 14,
        rotation: 0, zIndex: 1, opacity: 1, locked: false,
        props: {
          content: 'Exemple de code',
          fontSize: 40, fontFamily: 'Syne, sans-serif',
          fontWeight: 'bold', color: '#FFFFFF',
          textAlign: 'left', ...TEXT_DEFAULTS,
        },
      },
      {
        type: 'code',
        x: 5, y: 22, width: 90, height: 68,
        rotation: 0, zIndex: 1, opacity: 1, locked: false,
        props: {
          code: '// Votre code ici\nconst greet = (name: string) => {\n  return `Hello, ${name}!`\n}\n\nconsole.log(greet("DeckTrain"))',
          language: 'typescript',
          showLineNumbers: true,
        },
      },
    ],
  },
]
