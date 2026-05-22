import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CheckCircle2, XCircle, Award, Calendar, User, BookOpen, Zap } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function VerifyCertificatePage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()

  const cert = await prisma.certificate.findUnique({
    where: { code },
    include: {
      participant: { select: { name: true } },
      module:      { select: { title: true } },
    },
  }).catch(() => null)

  const valid = !!cert

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12 opacity-70 hover:opacity-100 transition-opacity">
        <Zap size={18} className="text-accent" />
        <span className="font-syne font-bold text-light-text dark:text-dark-text">
          Deck<span className="text-[#C8B89A]">Train</span>
        </span>
      </Link>

      <div className="w-full max-w-md">
        {valid ? (
          <div className="bg-light-surface dark:bg-dark-surface border border-emerald-400/25 rounded-2xl overflow-hidden shadow-xl">
            {/* Header vert */}
            <div className="bg-emerald-400/8 border-b border-emerald-400/20 px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-400">Certificat authentique</p>
                <p className="text-xs text-light-text/50 dark:text-dark-text/50 mt-0.5">
                  Ce document a été vérifié par DeckTrain
                </p>
              </div>
            </div>

            {/* Détails */}
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-light-text/40 dark:text-dark-text/40 mb-0.5">
                    Participant
                  </p>
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text">
                    {cert.participant.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-400/10 text-violet-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-light-text/40 dark:text-dark-text/40 mb-0.5">
                    Formation suivie
                  </p>
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text">
                    {cert.module.title}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-light-text/40 dark:text-dark-text/40 mb-0.5">
                    Date d'obtention
                  </p>
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text">
                    {new Date(cert.issuedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-light-text/40 dark:text-dark-text/40 mb-0.5">
                    Délivré par
                  </p>
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text">
                    {cert.issuedBy}
                  </p>
                </div>
              </div>
            </div>

            {/* Code */}
            <div className="px-6 pb-6">
              <div className="flex items-center gap-3 bg-light-bg dark:bg-dark-bg rounded-xl px-4 py-3 border border-light-text/8 dark:border-dark-text/8">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-light-text/35 dark:text-dark-text/35">
                  Code
                </span>
                <span className="font-mono text-sm font-bold text-accent tracking-widest ml-auto">
                  {cert.code}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-light-surface dark:bg-dark-surface border border-red-400/25 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-red-400/8 border-b border-red-400/20 px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-400/15 text-red-400 flex items-center justify-center flex-shrink-0">
                <XCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-red-400">Certificat introuvable</p>
                <p className="text-xs text-light-text/50 dark:text-dark-text/50 mt-0.5">
                  Ce code ne correspond à aucun certificat valide
                </p>
              </div>
            </div>
            <div className="px-6 py-6 text-center">
              <p className="text-sm text-light-text/55 dark:text-dark-text/55 leading-relaxed">
                Le code <span className="font-mono font-bold text-light-text dark:text-dark-text">{code}</span> est
                inexistant ou a peut-être été révoqué.
              </p>
              <p className="text-xs text-light-text/35 dark:text-dark-text/35 mt-3">
                Contactez l'organisme de formation pour vérification.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-light-text/25 dark:text-dark-text/25 text-center mt-8">
          © CHRIST J. — DeckTrain · Système de vérification de certificats
        </p>
      </div>
    </div>
  )
}
