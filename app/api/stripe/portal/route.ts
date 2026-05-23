import { NextResponse } from 'next/server'
import { getSubscriptionUserId } from '@/lib/subscription-auth'
import { getSubscriptionByUserId, hasSubscriptionDatabase } from '@/lib/aios-subscription-store'
import { getReturnUrl, getStripe, hasStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!hasSubscriptionDatabase()) {
    return NextResponse.json({ error: 'データベース未設定です' }, { status: 501 })
  }
  if (!hasStripe()) {
    return NextResponse.json({ error: 'Stripeが未設定です' }, { status: 501 })
  }

  const record = await getSubscriptionByUserId(auth.userId)
  if (!record?.stripeCustomerId || !record.stripeCustomerId.startsWith('cus_')) {
    return NextResponse.json(
      { error: 'まだサブスクリプションが開始されていません。プランを選択してください。' },
      { status: 404 },
    )
  }

  const stripe = getStripe()
  const body = await request.json().catch(() => ({}))
  const isCancellationFlow = body?.flow === 'cancel' && Boolean(record.stripeSubscriptionId)
  let session

  if (isCancellationFlow) {
    try {
      session = await stripe.billingPortal.sessions.create({
        customer: record.stripeCustomerId,
        return_url: getReturnUrl('/tools/aios/pricing'),
        flow_data: {
          type: 'subscription_cancel',
          after_completion: {
            type: 'redirect',
            redirect: { return_url: getReturnUrl('/tools/aios/pricing?plan_changed=1') },
          },
          subscription_cancel: {
            subscription: record.stripeSubscriptionId!,
          },
        },
      })
    } catch {
      session = await stripe.billingPortal.sessions.create({
        customer: record.stripeCustomerId,
        return_url: getReturnUrl('/tools/aios/pricing'),
      })
    }
  } else {
    session = await stripe.billingPortal.sessions.create({
      customer: record.stripeCustomerId,
      return_url: getReturnUrl('/tools/aios'),
    })
  }

  return NextResponse.json({ url: session.url })
}
