import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import {
  extractIp,
  isIpRateLimited,
  isAccountBlocked,
  logLoginAttempt,
  checkAndBlockAfterFailure,
} from '@/lib/login-security'
import { resolvePermissions } from '@/types/roles'
import type { AdminRole, Permission } from '@/types/roles'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ip = extractIp(req as any)
        const ua = (req?.headers?.['user-agent'] as string) ?? undefined

        if (await isIpRateLimited(ip)) {
          await logLoginAttempt(credentials.email, ip, false, ua)
          return null
        }

        if (await isAccountBlocked(credentials.email)) {
          await logLoginAttempt(credentials.email, ip, false, ua)
          return null
        }

        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.isActive) {
          await logLoginAttempt(credentials.email, ip, false, ua)
          return null
        }

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) {
          await logLoginAttempt(credentials.email, ip, false, ua)
          await checkAndBlockAfterFailure(credentials.email)
          return null
        }

        await logLoginAttempt(credentials.email, ip, true, ua)
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

        const permissions = resolvePermissions(user.role as AdminRole, user.permissions)
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role as AdminRole,
          permissions,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id          = user.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role        = (user as any).role as AdminRole
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.permissions = (user as any).permissions as Permission[]
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id          = token.id
        session.user.role        = token.role
        session.user.permissions = token.permissions
      }
      return session
    },
  },
}
