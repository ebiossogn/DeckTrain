import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FormateurSidebar } from '@/components/formateur/sidebar'

export default async function FormateurLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if (session.user.userType === 'participant') redirect('/participant')
  if (session.user.userType === 'admin') redirect('/admin/overview')

  return (
    <div className="flex h-screen bg-[#F5F5F2] dark:bg-[#0A0A0F] overflow-hidden transition-colors duration-300">
      <FormateurSidebar userName={session.user.name} userEmail={session.user.email} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">{children}</main>

        <footer className="px-8 py-3 border-t border-light-border dark:border-dark-border flex-shrink-0">
          <p className="text-xs text-text-secondary text-center label-dt">
            © {new Date().getFullYear()} CHRIST J. — Tous droits réservés
          </p>
        </footer>
      </div>
    </div>
  )
}
