import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const exercises = await prisma.exercise.findMany({
    where: { moduleId: params.id },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(
    exercises.map((e) => ({
      ...e,
      content: JSON.parse(e.content),
      createdAt: e.createdAt.toISOString(),
    }))
  )
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const err = await assertAuth()
  if (err) return err
  const { title, type, content, difficulty, solution } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
  const max = await prisma.exercise.aggregate({
    where: { moduleId: params.id },
    _max: { order: true },
  })
  const exercise = await prisma.exercise.create({
    data: {
      moduleId: params.id,
      title: title.trim(),
      type: type || 'qcm',
      content: JSON.stringify(content || {}),
      difficulty: difficulty || 'facile',
      solution: solution?.trim() || null,
      order: (max._max.order ?? 0) + 1,
    },
  })
  return NextResponse.json(
    { ...exercise, content: JSON.parse(exercise.content), createdAt: exercise.createdAt.toISOString() },
    { status: 201 }
  )
}
