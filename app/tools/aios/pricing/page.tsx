import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AiosPricing from '@/components/AiosPricing'
import { isAiosInternalTester } from '@/lib/aios-test-access'
import { getSubscriptionUserId, getUserEmail } from '@/lib/subscription-auth'
import { getStripePlans } from '@/lib/stripe'
import { resolveEffectiveTier } from '@/lib/aios-tier'

export const metadata: Metadata = {
  title: 'Aincarn OS 料金',
  description:
    'Aincarn OSのプラン。月額でAI実行回数の上限が変わります。Free・Light・Pro・Powerから選べます。',
}

export const dynamic = 'force-dynamic'

export default async function AiosPricingPage() {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) notFound()

  const email = await getUserEmail(authResult.userId)
  if (!isAiosInternalTester(authResult.userId, email)) notFound()

  const currentTier = (await resolveEffectiveTier({ userId: authResult.userId, email })).tier
  const plans = getStripePlans().map((plan) => ({
    tier: plan.tier,
    label: plan.label,
    priceJpy: plan.priceJpy,
    description: plan.description,
    bullets: plan.bullets,
    recommended: Boolean(plan.recommended),
    available: plan.tier === 'free' ? true : Boolean(plan.priceId),
  }))

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <AiosPricing plans={plans} currentTier={currentTier} />
      </div>
    </main>
  )
}
