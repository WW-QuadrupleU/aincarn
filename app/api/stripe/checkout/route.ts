import { NextResponse } from 'next/server'
import { getSubscriptionUserId, getUserEmail } from '@/lib/subscription-auth'
import {
  getSubscriptionByUserId,
  hasSubscriptionDatabase,
  upsertSubscriptionRecord,
} from '@/lib/aios-subscription-store'
import { getStripe, getPlanByTier, getReturnUrl, hasStripe } from '@/lib/stripe'
import type { AiosTier } from '@/lib/aios-tier'

export const runtime = 'nodejs'

const ALLOWED_TIERS: AiosTier[] = ['light', 'pro', 'power']

export async function POST(request: Request) {
  try {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!hasSubscriptionDatabase()) {
    return NextResponse.json({ error: 'データベース未設定です' }, { status: 501 })
  }
  if (!hasStripe()) {
    return NextResponse.json({ error: 'Stripeが未設定です（STRIPE_SECRET_KEY未設定）' }, { status: 501 })
  }

  const body = await request.json().catch(() => ({}))
  const tier = String(body?.tier || '') as AiosTier
  if (!ALLOWED_TIERS.includes(tier)) {
    return NextResponse.json({ error: 'プランの指定が不正です' }, { status: 400 })
  }
  const plan = getPlanByTier(tier)
  if (!plan || !plan.priceId) {
    return NextResponse.json(
      { error: `${tier} の Stripe Price ID が未設定です（STRIPE_PRICE_${tier.toUpperCase()}）` },
      { status: 500 },
    )
  }

  const stripe = getStripe()
  const email = await getUserEmail(auth.userId)

  // Reuse the existing customer if we already created one, otherwise
  // let Stripe create a new one keyed to this Clerk userId.
  const existing = await getSubscriptionByUserId(auth.userId)
  let customerId = existing?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: email || undefined,
      metadata: { clerk_user_id: auth.userId },
    })
    customerId = customer.id
    await upsertSubscriptionRecord({
      userId: auth.userId,
      stripeCustomerId: customerId,
      tier: 'free',
      status: 'inactive',
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: getReturnUrl('/tools/aios?upgraded=1'),
    cancel_url: getReturnUrl('/tools/aios/pricing?canceled=1'),
    metadata: {
      clerk_user_id: auth.userId,
      tier,
    },
    subscription_data: {
      metadata: {
        clerk_user_id: auth.userId,
        tier,
      },
    },
  })

  return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[stripe checkout] failed', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Stripe Checkoutの開始に失敗しました。',
      },
      { status: 500 },
    )
  }
}
