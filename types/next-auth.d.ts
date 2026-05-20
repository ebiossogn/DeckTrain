import { DefaultSession } from 'next-auth'
import type { AdminRole, Permission } from '@/types/roles'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: AdminRole | 'formateur' | 'participant'
      userType: 'admin' | 'formateur' | 'participant'
      permissions: Permission[]
      mustChangePassword: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: AdminRole | 'formateur' | 'participant'
    userType: 'admin' | 'formateur' | 'participant'
    permissions: Permission[]
    mustChangePassword: boolean
  }
}
