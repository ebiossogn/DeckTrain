import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const MAX_VIEWERS = 500
const POLL_MS     = 1000

type Ctx = { params: { code: string } }

export async function GET(req: NextRequest, { params }: Ctx) {
  const { code } = params

  // Vérifier que la session existe avant d'ouvrir le stream
  const initial = await prisma.liveSession.findUnique({
    where: { code },
    select: { id: true, isActive: true, viewerCount: true },
  })
  if (!initial) {
    return new Response('Session introuvable', { status: 404 })
  }
  if (initial.viewerCount >= MAX_VIEWERS) {
    return new Response('Capacité maximale atteinte', { status: 503 })
  }

  // Incrémenter le compteur à la connexion
  await prisma.liveSession.update({
    where: { code },
    data: { viewerCount: { increment: 1 } },
  }).catch(() => null)

  const encoder = new TextEncoder()
  let interval: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch { /* client déconnecté */ }
      }

      // Ping initial
      send('init', { code, connected: true })

      interval = setInterval(async () => {
        try {
          const s = await prisma.liveSession.findUnique({
            where: { code },
            select: {
              currentSlideIndex: true,
              isBlurred: true,
              isBlackScreen: true,
              isActive: true,
              viewerCount: true,
            },
          })

          if (!s) {
            send('error', { message: 'Session supprimée' })
            cleanup(controller)
            return
          }

          if (!s.isActive) {
            send('ended', { message: 'Présentation terminée' })
            cleanup(controller)
            return
          }

          send('state', {
            currentSlideIndex: s.currentSlideIndex,
            isBlurred:         s.isBlurred,
            isBlackScreen:     s.isBlackScreen,
            isActive:          s.isActive,
            viewerCount:       s.viewerCount,
          })
        } catch {
          cleanup(controller)
        }
      }, POLL_MS)
    },

    cancel() {
      // Appelé quand le client se déconnecte
      decrementViewer(code)
      if (interval) clearInterval(interval)
    },
  })

  // Gérer la déconnexion via AbortSignal
  req.signal.addEventListener('abort', () => {
    decrementViewer(code)
    if (interval) clearInterval(interval)
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

function cleanup(controller: ReadableStreamDefaultController) {
  try { controller.close() } catch { /* déjà fermé */ }
}

function decrementViewer(code: string) {
  prisma.liveSession.update({
    where: { code },
    data: { viewerCount: { decrement: 1 } },
  }).catch(() => null)
}
