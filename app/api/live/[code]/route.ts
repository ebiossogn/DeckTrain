import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { code: string } }

// GET — état public de la session + slides du module
export async function GET(_req: Request, { params }: Ctx) {
  const live = await prisma.liveSession.findUnique({
    where: { code: params.code },
    include: {
      module: {
        include: { slides: { orderBy: { order: 'asc' } } },
      },
    },
  })

  if (!live) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })

  return NextResponse.json({
    code: live.code,
    moduleId: live.moduleId,
    moduleTitle: live.module.title,
    currentSlideIndex: live.currentSlideIndex,
    isActive: live.isActive,
    isBlurred: live.isBlurred,
    isBlackScreen: live.isBlackScreen,
    viewerCount: live.viewerCount,
    totalSlides: live.module.slides.length,
    slides: live.module.slides.map((s) => ({
      id: s.id,
      type: s.type,
      order: s.order,
      content: JSON.parse(s.content),
      transition: s.transition ?? null,
    })),
  })
}

// PATCH — mettre à jour l'état (host uniquement)
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const live = await prisma.liveSession.findUnique({ where: { code: params.code } })
  if (!live) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
  if (live.hostId !== session.user.id) {
    return NextResponse.json({ error: 'Réservé au host de la session' }, { status: 403 })
  }
  if (!live.isActive) {
    return NextResponse.json({ error: 'Session terminée' }, { status: 410 })
  }

  const body = await req.json() as {
    currentSlideIndex?: number
    isBlurred?: boolean
    isBlackScreen?: boolean
  }

  const updated = await prisma.liveSession.update({
    where: { code: params.code },
    data: {
      ...(body.currentSlideIndex !== undefined && { currentSlideIndex: body.currentSlideIndex }),
      ...(body.isBlurred       !== undefined && { isBlurred: body.isBlurred }),
      ...(body.isBlackScreen   !== undefined && { isBlackScreen: body.isBlackScreen }),
    },
  })

  return NextResponse.json({ ok: true, currentSlideIndex: updated.currentSlideIndex })
}

// DELETE — terminer la session (host uniquement)
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const live = await prisma.liveSession.findUnique({ where: { code: params.code } })
  if (!live) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
  if (live.hostId !== session.user.id && session.user.userType !== 'admin') {
    return NextResponse.json({ error: 'Réservé au host de la session' }, { status: 403 })
  }

  await prisma.liveSession.update({
    where: { code: params.code },
    data: { isActive: false, endedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
