import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const base  = new URL(req.url).origin

  if (!token) {
    return NextResponse.redirect(`${base}/login`)
  }

  if (token.mustChangePassword) {
    return NextResponse.redirect(`${base}/change-password`)
  }

  switch (token.userType) {
    case 'formateur':   return NextResponse.redirect(`${base}/formateur`)
    case 'participant': return NextResponse.redirect(`${base}/participant`)
    default:            return NextResponse.redirect(`${base}/admin/overview`)
  }
}
