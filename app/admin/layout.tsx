import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/sidebar'
import { SessionTimeoutProvider } from '@/components/providers/session-timeout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')

  return (
    <SessionTimeoutProvider>
      <div className="flex h-screen bg-light-bg dark:bg-dark-bg overflow-hidden transition-colors duration-300">
        <AdminSidebar userEmail={session.user.email} userRole={session.user.role as import('@/types/roles').AdminRole} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8">{children}</main>

          <footer className="px-8 py-3 border-t border-light-border dark:border-dark-border flex-shrink-0">
            <p className="text-xs text-text-secondary text-center label-dt">
              © {new Date().getFullYear()} CHRIST J. — Tous droits réservés
            </p>
          </footer>
        </div>
      </div>
    </SessionTimeoutProvider>
  )
}
