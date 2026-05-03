import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import type { SlideWithContent } from '@/types/slides'

function parse(s: { id: string; moduleId: string; type: string; order: number; content: string; speakerNotes: string | null; timerMinutes: number | null; transition: string | null; createdAt: Date }): SlideWithContent {
  return { ...s, content: JSON.parse(s.content), createdAt: s.createdAt.toISOString() } as SlideWithContent
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string; slideId: string } }
) {
  const err = await assertAuth()
  if (err) return err
  const { content, speakerNotes, timerMinutes, transition } = await req.json()
  const slide = await prisma.slide.update({
    where: { id: params.slideId },
    data: {
      content: JSON.stringify(content),
      speakerNotes: speakerNotes ?? null,
      timerMinutes: timerMinutes ? Number(timerMinutes) : null,
      transition: transition ?? null,
    },
  })
  return NextResponse.json(parse(slide))
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; slideId: string } }
) {
  const err = await assertAuth()
  if (err) return err
  await prisma.slide.delete({ where: { id: params.slideId } })
  return NextResponse.json({ ok: true })
}
