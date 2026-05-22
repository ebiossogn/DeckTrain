import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import { validateBody } from '@/lib/api-validator'
import { createExerciseSchema } from '@/lib/validations'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const exercises = await prisma.exercise.findMany({
    where: { moduleId: params.id, isDeleted: false },
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
  const body = await req.json()
  const v = validateBody(createExerciseSchema, body)
  if ('error' in v) return v.error
  const { title, type, content, difficulty, solution } = v.data
  const max = await prisma.exercise.aggregate({
    where: { moduleId: params.id, isDeleted: false },
    _max: { order: true },
  })
  const exercise = await prisma.exercise.create({
    data: {
      moduleId: params.id,
      title,
      type,
      content: JSON.stringify(content || {}),
      difficulty,
      solution: solution?.trim() || null,
      order: (max._max.order ?? 0) + 1,
    },
  })
  return NextResponse.json(
    { ...exercise, content: JSON.parse(exercise.content), createdAt: exercise.createdAt.toISOString() },
    { status: 201 }
  )
}
