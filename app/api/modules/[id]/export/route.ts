import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import { generatePptx } from '@/lib/export-pptx'
import type { SlideWithContent } from '@/types/slides'

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
    const buffer = await generatePptx(module.title, slides)
    const safe = module.title.replace(/[^a-z0-9]/gi, '_').slice(0, 50)
    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${safe}.pptx"`,
      },
    })
  }

  return NextResponse.json({ error: 'Format non supporté' }, { status: 400 })
}
