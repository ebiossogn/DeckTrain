import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PrintButton } from './print-button'
import type { SlideWithContent, SlideType } from '@/types/slides'
import type {
  TitleTextContent, TitleImageContent, TitleCodeContent,
  TitleBulletsContent, QuoteContent, ComparisonContent, FreeLayoutContent,
} from '@/types/slides'

interface Props { params: { moduleId: string } }

export default async function PrintPage({ params }: Props) {
  const module = await prisma.module.findUnique({
    where: { id: params.moduleId },
    include: { slides: { orderBy: { order: 'asc' } } },
  })
  if (!module) notFound()

  const slides: SlideWithContent[] = module.slides.map((s) => ({
    id: s.id,
    moduleId: s.moduleId,
    type: s.type as SlideType,
    order: s.order,
    content: JSON.parse(s.content),
    speakerNotes: s.speakerNotes,
    timerMinutes: s.timerMinutes,
    transition: s.transition as SlideWithContent['transition'],
    createdAt: s.createdAt.toISOString(),
  }))

  return (
    <>
      <style>{`
        @media print {
          @page { size: landscape; margin: 0; }
          body { margin: 0; background: #0C0C14; }
          .slide-page { page-break-after: always; }
          .no-print { display: none !important; }
        }
        body { background: #1a1a2e; font-family: 'Segoe UI', sans-serif; }
        .slide-page {
          width: 297mm; height: 167mm;
          background: #0C0C14; color: #E8F4FF;
          position: relative; overflow: hidden;
          box-sizing: border-box; padding: 20px 28px 16px;
          display: flex; flex-direction: column;
          margin: 0 auto 12px; border: 1px solid rgba(255,255,255,0.08);
        }
        .slide-title { font-size: 28pt; font-weight: 700; color: #E8F4FF; margin: 0 0 10px; line-height: 1.2; }
        .slide-body { font-size: 14pt; color: #A0B8CC; line-height: 1.6; flex: 1; overflow: hidden; }
        .accent-bar { width: 5px; height: 48px; background: #00D4FF; position: absolute; left: 0; top: 20px; border-radius: 0 3px 3px 0; }
        .slide-footer { display: flex; justify-content: space-between; font-size: 8pt; color: #3a4a5a; margin-top: auto; padding-top: 8px; }
        .code-block { background: #1A1A2E; border: 1px solid #00D4FF44; border-radius: 8px; padding: 16px; font-family: 'Courier New', monospace; font-size: 11pt; color: #A8DADC; white-space: pre-wrap; overflow: hidden; flex: 1; }
        .bullet-list { list-style: none; padding: 0; margin: 0; }
        .bullet-list li { padding: 6px 0 6px 24px; position: relative; font-size: 14pt; color: #A0B8CC; }
        .bullet-list li::before { content: ''; position: absolute; left: 0; top: 50%; width: 10px; height: 10px; border-radius: 50%; background: #00D4FF; transform: translateY(-50%); }
        .quote-slide { background: linear-gradient(135deg, #0A2A35 0%, #0C0C14 100%) !important; justify-content: center; align-items: center; text-align: center; }
        .quote-text { font-size: 20pt; font-style: italic; color: #E8F4FF; line-height: 1.5; }
        .quote-author { font-size: 12pt; color: #00D4FF; margin-top: 16px; }
        .quote-mark { font-size: 72pt; color: #00D4FF; line-height: 0.6; display: block; margin-bottom: 12px; }
        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; flex: 1; overflow: hidden; }
        .comp-left { background: #0E1622; padding: 16px; border-right: 2px solid rgba(232,244,255,0.1); }
        .comp-right { background: #0E2216; padding: 16px; }
        .comp-title { font-size: 16pt; font-weight: 700; margin-bottom: 10px; }
        .comp-body { font-size: 12pt; color: #A0B8CC; line-height: 1.5; }
      `}</style>

      <PrintButton title={module.title} count={slides.length} />

      <div style={{ paddingBottom: 32 }}>
        {slides.map((slide, i) => (
          <SlideCard key={slide.id} slide={slide} index={i} total={slides.length} />
        ))}
      </div>
    </>
  )
}

function SlideCard({ slide, index, total }: { slide: SlideWithContent; index: number; total: number }) {
  const c = slide.content
  const footer = (
    <div className="slide-footer">
      <span>© CHRIST J. — TrainDeck</span>
      <span>{index + 1} / {total}</span>
    </div>
  )

  if (slide.type === 'quote') {
    const q = c as QuoteContent
    const bgMap: Record<string, string> = { cyan: 'linear-gradient(135deg,#0A2A35,#0C0C14)', purple: 'linear-gradient(135deg,#1A0A35,#0C0C14)', dark: '#080810', amber: 'linear-gradient(135deg,#2A1A00,#0C0C14)' }
    return (
      <div className="slide-page quote-slide" style={{ background: bgMap[q.background] }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span className="quote-mark">"</span>
          <p className="quote-text">{q.quote}</p>
          {q.author && <p className="quote-author">— {q.author}</p>}
        </div>
        {footer}
      </div>
    )
  }

  if (slide.type === 'comparison') {
    const cp = c as ComparisonContent
    return (
      <div className="slide-page" style={{ padding: 0 }}>
        <div className="comparison-grid" style={{ flex: 1 }}>
          <div className="comp-left">
            <p className="comp-title" style={{ color: '#00D4FF' }}>{cp.leftTitle}</p>
            <div className="comp-body" dangerouslySetInnerHTML={{ __html: cp.leftContent }} />
          </div>
          <div className="comp-right">
            <p className="comp-title" style={{ color: '#10b981' }}>{cp.rightTitle}</p>
            <div className="comp-body" dangerouslySetInnerHTML={{ __html: cp.rightContent }} />
          </div>
        </div>
        <div style={{ padding: '8px 16px' }}>{footer}</div>
      </div>
    )
  }

  if (slide.type === 'title-code') {
    const tc = c as TitleCodeContent
    return (
      <div className="slide-page">
        <div className="accent-bar" />
        <h2 className="slide-title" style={{ paddingLeft: 18 }}>{tc.title}</h2>
        <pre className="code-block">{tc.code}</pre>
        {footer}
      </div>
    )
  }

  if (slide.type === 'title-bullets') {
    const tb = c as TitleBulletsContent
    return (
      <div className="slide-page">
        <div className="accent-bar" />
        <h2 className="slide-title" style={{ paddingLeft: 18 }}>{tb.title}</h2>
        <ul className="bullet-list" style={{ flex: 1 }}>
          {tb.bullets.map((b) => <li key={b.id}>{b.text}</li>)}
        </ul>
        {footer}
      </div>
    )
  }

  if (slide.type === 'title-image') {
    const ti = c as TitleImageContent
    return (
      <div className="slide-page">
        <div className="accent-bar" />
        <h2 className="slide-title" style={{ paddingLeft: 18 }}>{ti.title}</h2>
        {ti.imageUrl
          ? <img src={ti.imageUrl} alt={ti.altText} style={{ maxWidth: '100%', maxHeight: '110mm', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
          : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a4a5a', fontSize: 12 }}>[image]</div>
        }
        {footer}
      </div>
    )
  }

  /* title-text + free-layout */
  const tt = c as TitleTextContent | FreeLayoutContent
  return (
    <div className="slide-page">
      <div className="accent-bar" />
      <h2 className="slide-title" style={{ paddingLeft: 18 }}>{tt.title}</h2>
      <div className="slide-body" dangerouslySetInnerHTML={{ __html: tt.body }} style={{ flex: 1, overflow: 'hidden' }} />
      {footer}
    </div>
  )
}
