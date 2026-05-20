import PptxGenJS from 'pptxgenjs'
import type { SlideWithContent, SlideType } from '@/types/slides'
import type {
  TitleTextContent, TitleImageContent, TitleCodeContent,
  TitleBulletsContent, QuoteContent, ComparisonContent, FreeLayoutContent,
} from '@/types/slides'

const BG = '0C0C14'
const ACCENT = '00D4FF'
const WHITE = 'E8F4FF'
const MUTED = '8899AA'

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
}

function addBackground(slide: PptxGenJS.Slide) {
  slide.background = { color: BG }
}

// Barre décorative verticale cyan — addText vide avec fill pour éviter addShape
function addAccentLine(slide: PptxGenJS.Slide, y = 0.18) {
  slide.addText(' ', { x: 0.5, y, w: 0.06, h: 0.55, fill: { color: ACCENT } })
}

function addFooter(slide: PptxGenJS.Slide, idx: number, total: number) {
  slide.addText(`© CHRIST J. — DeckTrain`, {
    x: 0.4, y: 7.0, w: 6, h: 0.2, fontSize: 7, color: '3a4a5a', align: 'left',
  })
  slide.addText(`${idx + 1} / ${total}`, {
    x: 8.6, y: 7.0, w: 0.8, h: 0.2, fontSize: 7, color: '3a4a5a', align: 'right',
  })
}

function renderTitleText(slide: PptxGenJS.Slide, c: TitleTextContent) {
  addAccentLine(slide)
  slide.addText(c.title, {
    x: 0.75, y: 0.2, w: 8.7, h: 0.7,
    fontSize: 28, bold: true, color: WHITE, fontFace: 'Calibri',
  })
  slide.addText(stripHtml(c.body), {
    x: 0.75, y: 1.1, w: 8.7, h: 5.5,
    fontSize: 16, color: 'A0B8CC', fontFace: 'Calibri', valign: 'top', wrap: true,
  })
}

function renderTitleBullets(slide: PptxGenJS.Slide, c: TitleBulletsContent) {
  addAccentLine(slide)
  slide.addText(c.title, {
    x: 0.75, y: 0.2, w: 8.7, h: 0.7,
    fontSize: 28, bold: true, color: WHITE, fontFace: 'Calibri',
  })
  const items = c.bullets.map((b) => ({
    text: b.text,
    options: { bullet: { type: 'number' as const }, color: 'A0B8CC', fontSize: 16, fontFace: 'Calibri' },
  }))
  slide.addText(items, { x: 0.75, y: 1.1, w: 8.7, h: 5.5, valign: 'top' })
}

function renderTitleCode(slide: PptxGenJS.Slide, c: TitleCodeContent) {
  addAccentLine(slide)
  slide.addText(c.title, {
    x: 0.75, y: 0.2, w: 8.7, h: 0.7,
    fontSize: 28, bold: true, color: WHITE, fontFace: 'Calibri',
  })
  // Fond du bloc code + texte en un seul addText (fill remplace addShape)
  slide.addText(c.code || '', {
    x: 0.5, y: 1.1, w: 9.2, h: 5.5,
    fontSize: 12, color: 'A8DADC', fontFace: 'Courier New', valign: 'top', wrap: true,
    fill: { color: '1A1A2E' },
    line: { color: ACCENT, width: 1, type: 'solid' },
  })
}

function isAbsoluteUrl(url: string): boolean {
  try { return /^https?:\/\//.test(url) } catch { return false }
}

function renderTitleImage(slide: PptxGenJS.Slide, c: TitleImageContent) {
  addAccentLine(slide)
  slide.addText(c.title, {
    x: 0.75, y: 0.2, w: 8.7, h: 0.7,
    fontSize: 28, bold: true, color: WHITE, fontFace: 'Calibri',
  })
  if (c.imageUrl && isAbsoluteUrl(c.imageUrl)) {
    slide.addImage({ path: c.imageUrl, x: 1.5, y: 1.2, w: 7, h: 5, sizing: { type: 'contain', w: 7, h: 5 } })
  } else {
    slide.addText(c.imageUrl ? `[Image: ${c.altText || c.imageUrl}]` : '[Image placeholder]', {
      x: 1.5, y: 1.2, w: 7, h: 5, fontSize: 14, color: MUTED, align: 'center', valign: 'middle',
    })
  }
}

function renderQuote(slide: PptxGenJS.Slide, c: QuoteContent) {
  const bgMap: Record<string, string> = { cyan: '0A2A35', purple: '1A0A35', dark: '080810', amber: '2A1A00' }
  slide.background = { color: bgMap[c.background] ?? BG }
  slide.addText('"', {
    x: 0.4, y: 0.3, w: 1.5, h: 1.5, fontSize: 96, color: ACCENT, fontFace: 'Georgia',
  })
  slide.addText(c.quote, {
    x: 0.8, y: 1.5, w: 8.6, h: 4,
    fontSize: 22, italic: true, color: WHITE, fontFace: 'Georgia', align: 'center', valign: 'middle', wrap: true,
  })
  if (c.author) {
    slide.addText(`— ${c.author}`, {
      x: 0.8, y: 5.7, w: 8.6, h: 0.4,
      fontSize: 13, color: ACCENT, fontFace: 'Calibri', align: 'center',
    })
  }
}

function renderComparison(slide: PptxGenJS.Slide, c: ComparisonContent) {
  // Colonnes de fond via addText vide avec fill (remplace addShape)
  slide.addText(' ', { x: 0, y: 0, w: 4.7, h: 7.5, fill: { color: '0E1622' } })
  slide.addText(' ', { x: 5.1, y: 0, w: 5.1, h: 7.5, fill: { color: '0E2216' } })
  slide.addText(c.dividerLabel, {
    x: 4.2, y: 3.2, w: 0.9, h: 0.7,
    fontSize: 11, bold: true, color: WHITE, align: 'center', fontFace: 'Calibri',
  })
  slide.addText(c.leftTitle, { x: 0.3, y: 0.4, w: 4.0, h: 0.5, fontSize: 18, bold: true, color: ACCENT, fontFace: 'Calibri' })
  slide.addText(stripHtml(c.leftContent), { x: 0.3, y: 1.1, w: 4.0, h: 5.5, fontSize: 14, color: 'A0B8CC', fontFace: 'Calibri', valign: 'top', wrap: true })
  slide.addText(c.rightTitle, { x: 5.4, y: 0.4, w: 4.0, h: 0.5, fontSize: 18, bold: true, color: '10b981', fontFace: 'Calibri' })
  slide.addText(stripHtml(c.rightContent), { x: 5.4, y: 1.1, w: 4.0, h: 5.5, fontSize: 14, color: 'A0B8CC', fontFace: 'Calibri', valign: 'top', wrap: true })
}

function renderFreeLayout(slide: PptxGenJS.Slide, c: FreeLayoutContent) {
  addAccentLine(slide)
  slide.addText(c.title, {
    x: 0.75, y: 0.2, w: 8.7, h: 0.7,
    fontSize: 28, bold: true, color: WHITE, fontFace: 'Calibri',
  })
  slide.addText(stripHtml(c.body), {
    x: 0.75, y: 1.1, w: 8.7, h: 5.5,
    fontSize: 16, color: 'A0B8CC', fontFace: 'Calibri', valign: 'top', wrap: true,
  })
}

const RENDERERS: Partial<Record<SlideType, (s: PptxGenJS.Slide, c: any) => void>> = {
  'title-text':    renderTitleText,
  'title-bullets': renderTitleBullets,
  'title-code':    renderTitleCode,
  'title-image':   renderTitleImage,
  'quote':         renderQuote,
  'comparison':    renderComparison,
  'free-layout':   renderFreeLayout,
}

export async function generatePptx(moduleTitle: string, slides: SlideWithContent[]): Promise<Buffer> {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = 'CHRIST J.'
  pptx.company = 'DeckTrain'
  pptx.subject = moduleTitle
  pptx.title = moduleTitle

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i]
    const slide = pptx.addSlide()
    addBackground(slide)

    const renderer = RENDERERS[s.type]
    if (renderer) renderer(slide, s.content)

    if (s.speakerNotes) {
      slide.addNotes(s.speakerNotes)
    }

    addFooter(slide, i, slides.length)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await (pptx as any).write('nodebuffer')) as Buffer
}
