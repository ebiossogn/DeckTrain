'use client'

export function PrintButton({ title, count }: { title: string; count: number }) {
  return (
    <div style={{ background: '#0C0C14', padding: '16px', display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="no-print">
      <span style={{ color: '#E8F4FF', fontFamily: 'sans-serif', fontSize: 14 }}>
        {title} — {count} slide{count !== 1 ? 's' : ''}
      </span>
      <button
        onClick={() => window.print()}
        style={{ background: '#00D4FF', color: '#000', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
      >
        Imprimer / Enregistrer PDF
      </button>
    </div>
  )
}
