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
  let customerId = existing?.stripeCustomerId?.startsWith('cus_') ? existing.stripeCustomerId : null

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

  if (existing && ['active', 'trialing', 'past_due'].includes(existing.status) && customerId) {
    if (existing.tier !== tier && existing.stripeSubscriptionId && plan.priceId) {
      const subscription = await stripe.subscriptions.retrieve(existing.stripeSubscriptionId)
      const item = subscription.items.data[0]
      if (!item?.id) {
        return NextResponse.json({ error: '変更対象のサブスクリプション項目を確認できませんでした。' }, { status: 400 })
      }
      const changeSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: getReturnUrl('/tools/aios?plan_changed=1'),
        flow_data: {
          type: 'subscription_update_confirm',
          after_completion: {
            type: 'redirect',
            redirect: {
              return_url: getReturnUrl('/tools/aios?plan_changed=1'),
            },
          },
          subscription_update_confirm: {
            subscription: existing.stripeSubscriptionId,
            items: [
              {
                id: item.id,
                price: plan.priceId,
                quantity: item.quantity || 1,
              },
            ],
          },
        },
      })
      return NextResponse.json({ url: changeSession.url })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: getReturnUrl('/tools/aios'),
    })
    return NextResponse.json({ url: portalSession.url })
  }

  const checkoutParams = {
    mode: 'subscription' as const,
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
  }

  let session
  try {
    session = await stripe.checkout.sessions.create(checkoutParams)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!message.includes('No such customer')) throw error

    const customer = await stripe.customers.create({
      email: email || undefined,
      metadata: { clerk_user_id: auth.userId },
    })
    await upsertSubscriptionRecord({
      userId: auth.userId,
      stripeCustomerId: customer.id,
      tier: 'free',
      status: 'inactive',
    })
    session = await stripe.checkout.sessions.create({
      ...checkoutParams,
      customer: customer.id,
    })
  }

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
