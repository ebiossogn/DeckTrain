import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import type { SlideWithContent } from '@/types/slides'
import { validateBody } from '@/lib/api-validator'
import { createSlideSchema } from '@/lib/validations'

function parse(s: { id: string; moduleId: string; type: string; order: number; content: string; speakerNotes: string | null; timerMinutes: number | null; transition: string | null; createdAt: Date }): SlideWithContent {
  return { ...s, content: JSON.parse(s.content), createdAt: s.createdAt.toISOString() } as SlideWithContent
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const err = await assertAuth()
  if (err) return err
  const slides = await prisma.slide.findMany({
    where: { moduleId: params.id, isDeleted: false },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(slides.map(parse))
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const err = await assertAuth()
  if (err) return err
  const body = await req.json()
  const v = validateBody(createSlideSchema, body)
  if ('error' in v) return v.error
  const { type, content, speakerNotes, timerMinutes } = v.data
  const max = await prisma.slide.aggregate({ where: { moduleId: params.id, isDeleted: false }, _max: { order: true } })
  const slide = await prisma.slide.create({
    data: {
      moduleId: params.id,
      type,
      order: (max._max.order ?? 0) + 1,
      content: JSON.stringify(content),
      speakerNotes: speakerNotes ?? null,
      timerMinutes: timerMinutes ?? null,
    },
  })
  return NextResponse.json(parse(slide), { status: 201 })
}
