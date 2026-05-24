import { NextResponse } from 'next/server'
import { hasAgentTokenDatabase, pollDeviceLogin } from '@/lib/agent-token-store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!hasAgentTokenDatabase()) {
    return NextResponse.json({ error: 'Desktop login storage is not configured' }, { status: 501 })
  }

  const body = await request.json().catch(() => ({}))
  const deviceCode = String(body?.deviceCode || '').trim()
  const deviceId = String(body?.deviceId || '').trim().slice(0, 120)
  if (!deviceCode || !deviceId) return NextResponse.json({ error: 'Device code and device id are required' }, { status: 400 })

  const result = await pollDeviceLogin({ deviceCode, deviceId })
  return NextResponse.json(result)
}
