import { NextResponse } from 'next/server'
import { isAiosInternalTester } from '@/lib/aios-test-access'
import { getSubscriptionUserId, getUserEmail } from '@/lib/subscription-auth'
import { getTierConfig, resolveEffectiveTier } from '@/lib/aios-tier'

export const runtime = 'nodejs'

export async function GET() {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const email = await getUserEmail(auth.userId)
  if (!isAiosInternalTester(auth.userId, email)) {
    return NextResponse.json({ internalAccess: false }, { headers: { 'Cache-Control': 'private, no-store' } })
  }
  const { tier } = await resolveEffectiveTier({ userId: auth.userId, email })
  const config = getTierConfig(tier)

  return NextResponse.json(
    { tier: config.tier, label: config.label, internalAccess: true },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
