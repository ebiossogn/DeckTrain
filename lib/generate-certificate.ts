import { jsPDF } from 'jspdf'

export interface CertificateData {
  participantName: string
  moduleTitle: string
  issuedBy: string
  issuedAt: Date
  code: string
}

// Ivoire/or palette
const IVORY   = '#FDFBF5'
const GOLD    = '#B8966A'
const GOLD_LT = '#D4B896'
const DARK    = '#2C2416'
const GRAY    = '#8C7B6B'

function hex2rgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

export function generateCertificatePDF(data: CertificateData): jsPDF {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const W = 297
  const H = 210

  // Fond ivoire
  doc.setFillColor(...hex2rgb(IVORY))
  doc.rect(0, 0, W, H, 'F')

  // Cadre extérieur or double
  doc.setDrawColor(...hex2rgb(GOLD))
  doc.setLineWidth(0.8)
  doc.rect(8, 8, W - 16, H - 16)
  doc.setLineWidth(0.3)
  doc.rect(11, 11, W - 22, H - 22)

  // Coins décoratifs
  const corner = (x: number, y: number, sx: number, sy: number) => {
    doc.setDrawColor(...hex2rgb(GOLD))
    doc.setLineWidth(1.2)
    doc.line(x, y, x + sx * 10, y)
    doc.line(x, y, x, y + sy * 10)
    doc.setLineWidth(0.4)
    doc.line(x + sx * 2, y + sy * 2, x + sx * 8, y + sy * 2)
    doc.line(x + sx * 2, y + sy * 2, x + sx * 2, y + sy * 8)
  }
  corner(14, 14,  1,  1)
  corner(W - 14, 14, -1,  1)
  corner(14, H - 14,  1, -1)
  corner(W - 14, H - 14, -1, -1)

  // Ligne décorative horizontale sous le header
  doc.setDrawColor(...hex2rgb(GOLD_LT))
  doc.setLineWidth(0.3)
  doc.line(20, 50, W - 20, 50)
  doc.line(20, 165, W - 20, 165)

  // ── Header ──
  // "DECKTRAIN" en petit
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...hex2rgb(GOLD))
  doc.setCharSpace(4)
  doc.text('DECKTRAIN', W / 2, 24, { align: 'center' })
  doc.setCharSpace(0)

  // Trait fin sous "DECKTRAIN"
  doc.setDrawColor(...hex2rgb(GOLD_LT))
  doc.setLineWidth(0.2)
  doc.line(W / 2 - 18, 26.5, W / 2 + 18, 26.5)

  // Titre principal
  doc.setFont('times', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(...hex2rgb(DARK))
  doc.text('CERTIFICAT DE FORMATION', W / 2, 40, { align: 'center' })

  // Sous-titre
  doc.setFont('times', 'italic')
  doc.setFontSize(11)
  doc.setTextColor(...hex2rgb(GRAY))
  doc.text('Ce certificat est décerné à', W / 2, 62, { align: 'center' })

  // ── Nom du participant ──
  doc.setFont('times', 'bolditalic')
  doc.setFontSize(34)
  doc.setTextColor(...hex2rgb(GOLD))
  doc.text(data.participantName, W / 2, 80, { align: 'center' })

  // Ligne dorée sous le nom
  const nameWidth = Math.min(doc.getTextWidth(data.participantName) + 10, 160)
  doc.setDrawColor(...hex2rgb(GOLD))
  doc.setLineWidth(0.5)
  doc.line(W / 2 - nameWidth / 2, 83, W / 2 + nameWidth / 2, 83)

  // Texte intermédiaire
  doc.setFont('times', 'italic')
  doc.setFontSize(11)
  doc.setTextColor(...hex2rgb(GRAY))
  doc.text('pour avoir suivi avec succès la formation', W / 2, 96, { align: 'center' })

  // ── Titre du module ──
  doc.setFont('times', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...hex2rgb(DARK))
  const moduleLine = doc.splitTextToSize(`"${data.moduleTitle}"`, 220)
  doc.text(moduleLine, W / 2, 108, { align: 'center' })

  // ── Footer : date + formateur + code ──
  const col1 = 60
  const col2 = W / 2
  const col3 = W - 60

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...hex2rgb(GRAY))
  doc.setCharSpace(1)
  doc.text('DATE D\'OBTENTION', col1, 172, { align: 'center' })
  doc.text('DÉLIVRÉ PAR', col2, 172, { align: 'center' })
  doc.text('CODE DE VÉRIFICATION', col3, 172, { align: 'center' })
  doc.setCharSpace(0)

  doc.setFont('times', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...hex2rgb(DARK))
  doc.text(
    data.issuedAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    col1, 179, { align: 'center' }
  )
  doc.text(data.issuedBy, col2, 179, { align: 'center' })

  // Code en style monospace
  doc.setFont('courier', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...hex2rgb(GOLD))
  doc.text(data.code, col3, 179, { align: 'center' })

  // Séparateurs verticaux du footer
  doc.setDrawColor(...hex2rgb(GOLD_LT))
  doc.setLineWidth(0.2)
  doc.line(col1 + 55, 168, col1 + 55, 183)
  doc.line(col2 + 55, 168, col2 + 55, 183)

  // ── Copyright ──
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...hex2rgb(GOLD_LT))
  doc.text('© CHRIST J. — DeckTrain · Vérifiable sur decktrain.app/verify/' + data.code, W / 2, 196, { align: 'center' })

  return doc
}

export function downloadCertificate(data: CertificateData) {
  const doc = generateCertificatePDF(data)
  const filename = `certificat-${data.participantName.replace(/\s+/g, '-').toLowerCase()}-${data.code}.pdf`
  doc.save(filename)
}
