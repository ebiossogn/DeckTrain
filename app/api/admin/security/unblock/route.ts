import { NextResponse } from 'next/server'
import { assertAuth } from '@/lib/api-auth'
import { unblockAccount } from '@/lib/login-security'

export async function POST(req: Request) {
  const err = await assertAuth()
  if (err) return err

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

  await unblockAccount(userId)
  return NextResponse.json({ ok: true })
}
