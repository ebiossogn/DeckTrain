'use client'

import type { SlideWithContent, SlideContent } from '@/types/slides'
import { TitleTextEditor } from './editors/title-text-editor'
import { TitleImageEditor } from './editors/title-image-editor'
import { TitleCodeEditor } from './editors/title-code-editor'
import { TitleBulletsEditor } from './editors/title-bullets-editor'
import { QuoteEditor } from './editors/quote-editor'
import { ComparisonEditor } from './editors/comparison-editor'
import { FreeLayoutEditor } from './editors/free-layout-editor'
import type { TitleTextContent, TitleImageContent, TitleCodeContent, TitleBulletsContent, QuoteContent, ComparisonContent, FreeLayoutContent } from '@/types/slides'

interface SlideEditorProps {
  slide: SlideWithContent
  onChange: (content: SlideContent) => void
}

export function SlideEditor({ slide, onChange }: SlideEditorProps) {
  switch (slide.type) {
    case 'title-text':
      return <TitleTextEditor key={slide.id} content={slide.content as TitleTextContent} onChange={onChange} />
    case 'title-image':
      return <TitleImageEditor key={slide.id} content={slide.content as TitleImageContent} onChange={onChange} />
    case 'title-code':
      return <TitleCodeEditor key={slide.id} content={slide.content as TitleCodeContent} onChange={onChange} />
    case 'title-bullets':
      return <TitleBulletsEditor key={slide.id} content={slide.content as TitleBulletsContent} onChange={onChange} />
    case 'quote':
      return <QuoteEditor key={slide.id} content={slide.content as QuoteContent} onChange={onChange} />
    case 'comparison':
      return <ComparisonEditor key={slide.id} content={slide.content as ComparisonContent} onChange={onChange} />
    case 'free-layout':
      return <FreeLayoutEditor key={slide.id} content={slide.content as FreeLayoutContent} onChange={onChange} />
    default:
      return null
  }
}
