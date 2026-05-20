import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token    = req.nextauth.token
    const path     = req.nextUrl.pathname
    const base     = req.nextUrl.origin
    const userType = token?.userType
    const mustChangePwd = token?.mustChangePassword

    // Page connexion admin — toujours accessible
    if (path === '/admin/login') {
      if (userType === 'admin') return NextResponse.redirect(`${base}/admin/overview`)
      return NextResponse.next()
    }

    // Forcer le changement de mot de passe
    if (mustChangePwd && path !== '/change-password') {
      return NextResponse.redirect(`${base}/change-password`)
    }

    // /change-password : accessible à tous les connectés
    if (path === '/change-password') return NextResponse.next()

    // Protection /admin → admins uniquement
    if (path.startsWith('/admin') && userType !== 'admin') {
      if (userType === 'formateur')   return NextResponse.redirect(`${base}/formateur`)
      if (userType === 'participant') return NextResponse.redirect(`${base}/participant`)
      return NextResponse.redirect(`${base}/login`)
    }

    // Protection /formateur → formateurs + admins
    if (path.startsWith('/formateur') && userType !== 'formateur' && userType !== 'admin') {
      if (userType === 'participant') return NextResponse.redirect(`${base}/participant`)
      return NextResponse.redirect(`${base}/login`)
    }

    // Protection /participant → participants + formateurs + admins
    if (path.startsWith('/participant') && userType !== 'participant' && userType !== 'formateur' && userType !== 'admin') {
      return NextResponse.redirect(`${base}/login`)
    }

    return NextResponse.next()
  },
  {
    pages: { signIn: '/login' },
    callbacks: {
      authorized: ({ req, token }) => {
        // La page /admin/login est toujours accessible sans authentification
        if (req.nextUrl.pathname === '/admin/login') return true
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/formateur/:path*',
    '/participant/:path*',
    '/change-password',
  ],
}
