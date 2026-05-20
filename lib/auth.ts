import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
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
    // ── Google OAuth ──────────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),

    // ── Email + mot de passe ──────────────────────────────────────────────────
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
        source: { label: 'Source', type: 'text' },
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

        /* ── 1. Table admin (User) ── */
        const adminUser = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (adminUser) {
          // Depuis la page publique, refuser avec message explicite
          if (credentials.source !== 'admin') {
            throw new Error('ADMIN_USE_ADMIN_LOGIN')
          }
          const isBlocked = await isAccountBlocked(credentials.email)
          if (!adminUser.isActive || isBlocked) {
            await logLoginAttempt(credentials.email, ip, false, ua)
            return null
          }
          const valid = await bcrypt.compare(credentials.password, adminUser.password)
          console.log('[auth] Password match:', valid)
          if (!valid) {
            await logLoginAttempt(credentials.email, ip, false, ua)
            await checkAndBlockAfterFailure(credentials.email)
            return null
          }
          await logLoginAttempt(credentials.email, ip, true, ua)
          await prisma.user.update({ where: { id: adminUser.id }, data: { lastLoginAt: new Date() } })
          const permissions = resolvePermissions(adminUser.role as AdminRole, adminUser.permissions)
          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name ?? adminUser.email,
            role: adminUser.role as AdminRole,
            userType: 'admin' as const,
            permissions,
            mustChangePassword: adminUser.mustChangePassword,
          }
        }

        /* ── 2. Table AppUser (formateurs / participants) ── */
        const appUser = await prisma.appUser.findUnique({ where: { email: credentials.email } })
        if (appUser) {
          if (!appUser.isActive) {
            await logLoginAttempt(credentials.email, ip, false, ua)
            return null
          }
          // Compte OAuth-only (pas de mot de passe local)
          if (!appUser.password) {
            await logLoginAttempt(credentials.email, ip, false, ua)
            return null
          }
          const valid = await bcrypt.compare(credentials.password, appUser.password)
          if (!valid) {
            await logLoginAttempt(credentials.email, ip, false, ua)
            return null
          }
          await logLoginAttempt(credentials.email, ip, true, ua)
          return {
            id: appUser.id,
            email: appUser.email,
            name: appUser.name,
            role: appUser.type as 'formateur' | 'participant',
            userType: appUser.type as 'formateur' | 'participant',
            permissions: [] as Permission[],
            mustChangePassword: appUser.tempPassword,
          }
        }

        await logLoginAttempt(credentials.email, ip, false, ua)
        return null
      },
    }),
  ],

  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },

  callbacks: {
    // ── Contrôle d'accès Google ────────────────────────────────────────────────
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false

        // Bloquer les comptes admin depuis OAuth
        const adminUser = await prisma.user.findUnique({ where: { email: user.email } })
        if (adminUser) return false

        const existing = await prisma.appUser.findFirst({
          where: {
            OR: [
              { googleId: account.providerAccountId },
              { email: user.email },
            ],
          },
        })

        if (existing) {
          // Associer le googleId si ce n'est pas encore fait
          if (!existing.googleId) {
            await prisma.appUser.update({
              where: { id: existing.id },
              data: { googleId: account.providerAccountId, emailVerified: true, isActive: true },
            })
          }
          return true
        }

        // Créer un nouveau compte formateur via Google
        await prisma.appUser.create({
          data: {
            email: user.email,
            name: user.name ?? user.email,
            password: '',
            type: 'formateur',
            isActive: true,
            emailVerified: true,
            googleId: account.providerAccountId,
          },
        })
        return true
      }
      return true
    },

    // ── Enrichissement du JWT ─────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account, trigger, session }: any) {
      if (user) {
        token.id                = user.id
        token.role              = user.role
        token.userType          = user.userType ?? 'admin'
        token.permissions       = user.permissions as Permission[]
        token.mustChangePassword = user.mustChangePassword ?? false
      }

      // Mise à jour du token quand update() est appelé côté client
      if (trigger === 'update' && session?.mustChangePassword !== undefined) {
        token.mustChangePassword = session.mustChangePassword
      }

      // Pour Google : récupérer l'AppUser depuis la DB et injecter role/userType
      if (account?.provider === 'google' && token.email) {
        const appUser = await prisma.appUser.findUnique({ where: { email: token.email } })
        if (appUser) {
          token.id          = appUser.id
          token.role        = appUser.type as 'formateur' | 'participant'
          token.userType    = appUser.type as 'formateur' | 'participant'
          token.permissions = []
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id                = token.id
        session.user.role              = token.role
        session.user.userType          = token.userType ?? 'admin'
        session.user.permissions       = token.permissions
        session.user.mustChangePassword = token.mustChangePassword ?? false
      }
      return session
    },
  },
}
