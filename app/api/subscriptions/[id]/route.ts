import { NextResponse } from 'next/server'
import { getSubscriptionUserId } from '@/lib/subscription-auth'
import {
  deleteSubscription,
  hasSubscriptionDatabase,
  normalizeSubscriptionInput,
  updateSubscription,
} from '@/lib/subscription-store'

type RouteContext = {
  params: Promise<{ id: string }>
}

function configurationError() {
  return NextResponse.json(
    {
      error: 'サブスク保存機能は現在準備中です',
    },
    { status: 501 }
  )
}

export async function PUT(request: Request, context: RouteContext) {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  if (!hasSubscriptionDatabase()) return configurationError()

  const { id } = await context.params
  try {
    const input = normalizeSubscriptionInput(await request.json())
    const subscription = await updateSubscription(authResult.userId, id, input)
    if (!subscription) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ subscription })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新に失敗しました' },
      { status: 400 }
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  if (!hasSubscriptionDatabase()) return configurationError()

  const { id } = await context.params
  const deleted = await deleteSubscription(authResult.userId, id)
  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
