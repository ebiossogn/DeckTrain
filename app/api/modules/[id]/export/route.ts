import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import { generatePptx } from '@/lib/export-pptx'
import type { SlideWithContent } from '@/types/slides'
import { auditLog } from '@/lib/audit'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const err = await assertAuth()
  if (err) return err

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') ?? 'pptx'

  const module = await prisma.module.findUnique({
    where: { id: params.id },
    include: { slides: { orderBy: { order: 'asc' } } },
  })
  if (!module) return NextResponse.json({ error: 'Module introuvable' }, { status: 404 })

  const slides: SlideWithContent[] = module.slides.map((s) => ({
    id: s.id,
    moduleId: s.moduleId,
    type: s.type as SlideWithContent['type'],
    order: s.order,
    content: JSON.parse(s.content),
    speakerNotes: s.speakerNotes,
    timerMinutes: s.timerMinutes,
    transition: s.transition as SlideWithContent['transition'],
    createdAt: s.createdAt.toISOString(),
  }))

  if (format === 'pptx') {
    let buffer: Buffer
    try {
      buffer = await generatePptx(module.title, slides)
    } catch (e) {
      console.error('[PPTX] generatePptx failed:', e)
      return NextResponse.json({ error: 'Erreur génération PPTX', detail: String(e) }, { status: 500 })
    }
    await auditLog('EXPORT', 'MODULE', params.id, { title: module.title, format: 'pptx' })
    const safe = module.title.replace(/[^a-z0-9]/gi, '_').slice(0, 50)
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${safe}.pptx"`,
      },
    })
  }

  return NextResponse.json({ error: 'Format non supporté' }, { status: 400 })
}
