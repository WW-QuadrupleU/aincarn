import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe, getTierForPriceId, hasStripe } from '@/lib/stripe'
import {
  getSubscriptionByCustomerId,
  hasSubscriptionDatabase,
  upsertSubscriptionRecord,
  type SubscriptionStatus,
} from '@/lib/aios-subscription-store'

export const runtime = 'nodejs'

function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'past_due':
      return 'past_due'
    case 'unpaid':
      return 'unpaid'
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete'
    case 'canceled':
      return 'canceled'
    default:
      return 'inactive'
  }
}

async function resolveUserId(
  subscription: Stripe.Subscription,
  customerId: string,
): Promise<string | null> {
  const metaUser =
    typeof subscription.metadata?.clerk_user_id === 'string' ? subscription.metadata.clerk_user_id : null
  if (metaUser) return metaUser

  const existing = await getSubscriptionByCustomerId(customerId)
  if (existing) return existing.userId

  // Customer metadata fallback
  const stripe = getStripe()
  const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer
  const customerUser =
    typeof customer.metadata?.clerk_user_id === 'string' ? customer.metadata.clerk_user_id : null
  return customerUser
}

async function handleSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

  const userId = await resolveUserId(subscription, customerId)
  if (!userId) {
    console.warn('[stripe webhook] could not resolve user for subscription', subscription.id)
    return
  }

  const item = subscription.items.data[0]
  const priceId = item?.price?.id || null
  const tier = getTierForPriceId(priceId)
  const status = mapStatus(subscription.status)
  const currentPeriodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null

  await upsertSubscriptionRecord({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    tier: status === 'active' || status === 'trialing' ? tier : 'free',
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
  })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== 'subscription') return
  const subId = session.subscription
  if (!subId) return
  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(
    typeof subId === 'string' ? subId : subId.id,
  )
  await handleSubscription(subscription)
}

export async function POST(request: Request) {
  if (!hasStripe()) return NextResponse.json({ error: 'Stripe未設定' }, { status: 501 })
  if (!hasSubscriptionDatabase()) {
    return NextResponse.json({ error: 'DB未設定' }, { status: 501 })
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET未設定' }, { status: 501 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'signature missing' }, { status: 400 })
  }

  const rawBody = await request.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'invalid signature' },
      { status: 400 },
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscription(event.data.object as Stripe.Subscription)
        break
      default:
        break
    }
  } catch (error) {
    console.error('[stripe webhook] handler error', event.type, error)
    return NextResponse.json({ error: 'handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
