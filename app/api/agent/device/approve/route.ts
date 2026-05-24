import { NextResponse } from 'next/server'
import { approveDeviceLogin, hasAgentTokenDatabase } from '@/lib/agent-token-store'
import { getSubscriptionUserId } from '@/lib/subscription-auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasAgentTokenDatabase()) {
    return NextResponse.json({ error: 'Desktop login storage is not configured' }, { status: 501 })
  }

  const body = await request.json().catch(() => ({}))
  const userCode = String(body?.userCode || '').trim().toUpperCase()
  if (!userCode) return NextResponse.json({ error: 'Login code is required' }, { status: 400 })

  const approved = await approveDeviceLogin(auth.userId, userCode)
  if (!approved) return NextResponse.json({ error: 'Login code is invalid or expired' }, { status: 404 })
  return NextResponse.json({ approved })
}
