import type { SlideElement, TextProps, ImageProps, ShapeProps, IconProps, CodeProps, LineProps } from '@/types/slides'

export function getDefaultProps(type: SlideElement['type'], iconName?: string): SlideElement['props'] {
  switch (type) {
    case 'text':
      return {
        content: 'Votre texte ici',
        fontSize: 36,
        fontFamily: 'Syne, sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        textAlign: 'left',
        lineHeight: 1.4,
        letterSpacing: 0,
        padding: 0,
        borderRadius: 0,
      } satisfies TextProps

    case 'image':
      return {
        src: '',
        alt: '',
        objectFit: 'cover',
        borderRadius: 8,
        border: 'none',
        shadow: 'none',
      } satisfies ImageProps

    case 'shape':
      return {
        shapeType: 'rectangle',
        fill: '#00D4FF',
        stroke: 'transparent',
        strokeWidth: 0,
        borderRadius: 8,
        shadow: 'none',
      } satisfies ShapeProps

    case 'icon':
      return {
        iconName: iconName ?? 'Star',
        color: '#00D4FF',
        size: 64,
      } satisfies IconProps

    case 'code':
      return {
        code: '// Votre code ici\nconsole.log("Hello DeckTrain!")',
        language: 'javascript',
        showLineNumbers: false,
      } satisfies CodeProps

    case 'line':
      return {
        orientation: 'horizontal',
        color: '#2E2E2E',
        thickness: 2,
        style: 'solid',
      } satisfies LineProps
  }
}

export const DEFAULT_ELEMENT_SIZES: Record<SlideElement['type'], { width: number; height: number }> = {
  text:  { width: 45, height: 15 },
  image: { width: 40, height: 40 },
  shape: { width: 25, height: 25 },
  icon:  { width: 8,  height: 14 },
  code:  { width: 60, height: 45 },
  line:  { width: 50, height: 2  },
}
