'use client'

import type { SlideWithContent } from '@/types/slides'
import type { TitleTextContent, TitleImageContent, TitleCodeContent, TitleBulletsContent, QuoteContent, ComparisonContent, FreeLayoutContent } from '@/types/slides'
import { TitleTextSlide }    from './renderers/title-text'
import { TitleImageSlide }   from './renderers/title-image'
import { TitleCodeSlide }    from './renderers/title-code'
import { TitleBulletsSlide } from './renderers/title-bullets'
import { QuoteSlide }        from './renderers/quote'
import { ComparisonSlide }   from './renderers/comparison'
import { FreeLayoutSlide }   from './renderers/free-layout'
import { CanvasSlide }       from './renderers/canvas-renderer'

export function SlideRenderer({ slide }: { slide: SlideWithContent }) {
  switch (slide.type) {
    case 'title-text':    return <TitleTextSlide    content={slide.content as TitleTextContent}    />
    case 'title-image':   return <TitleImageSlide   content={slide.content as TitleImageContent}   />
    case 'title-code':    return <TitleCodeSlide    content={slide.content as TitleCodeContent}    />
    case 'title-bullets': return <TitleBulletsSlide content={slide.content as TitleBulletsContent} />
    case 'quote':         return <QuoteSlide        content={slide.content as QuoteContent}        />
    case 'comparison':    return <ComparisonSlide   content={slide.content as ComparisonContent}   />
    case 'free-layout':   return <FreeLayoutSlide   content={slide.content as FreeLayoutContent}   />
    case 'canvas':        return <CanvasSlide       content={slide.content as any}                 />
    default:              return null
  }
}
