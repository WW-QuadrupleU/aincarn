import { NextResponse } from 'next/server'
import { getSubscriptionUserId } from '@/lib/subscription-auth'
import {
  createSubscription,
  hasSubscriptionDatabase,
  listSubscriptions,
  normalizeSubscriptionInput,
} from '@/lib/subscription-store'

function configurationError() {
  return NextResponse.json(
    {
      error: 'Subscription storage is not configured',
      requiredEnv: ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY', 'DATABASE_URL'],
    },
    { status: 501 }
  )
}

export async function GET() {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  if (!hasSubscriptionDatabase()) return configurationError()

  const subscriptions = await listSubscriptions(authResult.userId)
  return NextResponse.json({ subscriptions })
}

export async function POST(request: Request) {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  if (!hasSubscriptionDatabase()) return configurationError()

  try {
    const input = normalizeSubscriptionInput(await request.json())
    const subscription = await createSubscription(authResult.userId, input)
    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '保存に失敗しました' },
      { status: 400 }
    )
  }
}
