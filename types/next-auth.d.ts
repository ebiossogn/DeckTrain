import { DefaultSession } from 'next-auth'
import type { AdminRole, Permission } from '@/types/roles'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: AdminRole
      permissions: Permission[]
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: AdminRole
    permissions: Permission[]
  }
}
