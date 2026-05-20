import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { LiveResults } from '@/components/surveys/live-results'
import { QRCodeSVG } from 'qrcode.react'
import type { Metadata } from 'next'

interface Props {
  params: { code: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const survey = await prisma.survey.findUnique({
    where: { code: params.code.toUpperCase() },
    select: { title: true },
  })
  return { title: survey ? `${survey.title} — Résultats Live` : 'Sondage' }
}

export default async function PresentSurveyPage({ params }: Props) {
  const survey = await prisma.survey.findUnique({
    where: { code: params.code.toUpperCase() },
    select: { id: true, title: true, description: true, code: true, isLive: true },
  })

  if (!survey) notFound()

  const respondUrl = `${process.env.NEXTAUTH_URL ?? ''}/surveys/${survey.code}`

  return (
    <div className="min-h-screen bg-[#0C0C14] flex flex-col">
      {/* Header barre */}
      <header className="px-8 py-4 border-b border-white/8 flex items-center gap-4">
        <span className="font-display font-bold text-xl"><span className="text-white">Deck</span><span className="text-or">Train</span></span>
        <div className="flex-1 mx-6">
          <h1 className="font-syne font-bold text-white text-lg leading-none">{survey.title}</h1>
          {survey.description && (
            <p className="text-white/40 text-xs mt-0.5">{survey.description}</p>
          )}
        </div>
        <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${survey.isLive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/8 text-white/40'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${survey.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
          {survey.isLive ? 'LIVE' : 'Hors ligne'}
        </div>
      </header>

      {/* Layout two-column */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Résultats live — colonne principale */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <LiveResults code={survey.code} pollInterval={2000} />
        </main>

        {/* QR + instructions — colonne droite */}
        <aside className="w-72 border-l border-white/8 px-6 py-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Rejoindre le sondage</p>
            <div className="bg-white rounded-2xl p-3 inline-block">
              <QRCodeSVG
                value={respondUrl || `/surveys/${survey.code}`}
                size={200}
                bgColor="#ffffff"
                fgColor="#0C0C14"
                level="M"
              />
            </div>
            <div className="mt-3 bg-white/8 border border-white/10 rounded-xl px-4 py-2.5 text-center">
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Code</p>
              <p className="font-syne font-bold text-accent text-2xl tracking-widest">{survey.code}</p>
            </div>
          </div>

          <div className="text-white/35 text-xs space-y-1.5">
            <p className="font-semibold text-white/50">Instructions</p>
            <p>1. Scannez le QR code ou allez sur :</p>
            <p className="font-mono text-accent/70 break-all text-[10px]">/surveys/{survey.code}</p>
            <p>2. Répondez aux questions</p>
            <p>3. Les résultats apparaissent en temps réel</p>
          </div>
        </aside>
      </div>

      <footer className="py-3 text-center text-white/20 text-xs border-t border-white/8">
        © CHRIST J. — DeckTrain
      </footer>
    </div>
  )
}
