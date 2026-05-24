import { NextResponse } from 'next/server'
import { hasAgentTokenDatabase, startDeviceLogin } from '@/lib/agent-token-store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!hasAgentTokenDatabase()) {
    return NextResponse.json({ error: 'Desktop login storage is not configured' }, { status: 501 })
  }

  const body = await request.json().catch(() => ({}))
  const deviceId = String(body?.deviceId || '').trim().slice(0, 120)
  const deviceName = String(body?.deviceName || '').trim().slice(0, 120)
  if (!deviceId) return NextResponse.json({ error: 'Device id is required' }, { status: 400 })

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
  const login = await startDeviceLogin({ deviceId, deviceName, origin })
  return NextResponse.json(login)
}
