import { NextResponse } from 'next/server'
import {
  createAgentToken,
  hasAgentTokenDatabase,
  listAgentTokens,
  revokeAgentToken,
} from '@/lib/agent-token-store'
import { getSubscriptionUserId } from '@/lib/subscription-auth'

export const runtime = 'nodejs'

function configurationError() {
  return NextResponse.json({ error: 'Desktop token storage is not configured' }, { status: 501 })
}

export async function GET() {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasAgentTokenDatabase()) return configurationError()

  const tokens = await listAgentTokens(auth.userId)
  return NextResponse.json({ tokens })
}

export async function POST(request: Request) {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasAgentTokenDatabase()) return configurationError()

  const body = await request.json().catch(() => ({}))
  const created = await createAgentToken({
    userId: auth.userId,
    label: String(body?.label || 'Desktop'),
    deviceName: String(body?.deviceName || ''),
  })

  return NextResponse.json(created, { status: 201 })
}

export async function DELETE(request: Request) {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasAgentTokenDatabase()) return configurationError()

  const body = await request.json().catch(() => ({}))
  const tokenId = String(body?.id || '').trim()
  if (!tokenId) return NextResponse.json({ error: 'Token id is required' }, { status: 400 })

  const token = await revokeAgentToken(auth.userId, tokenId)
  if (!token) return NextResponse.json({ error: 'Token not found' }, { status: 404 })
  return NextResponse.json({ token })
}
