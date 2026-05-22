import type { Metadata } from 'next'
import AiosPricing from '@/components/AiosPricing'
import { getStripePlans } from '@/lib/stripe'

export const metadata: Metadata = {
  title: 'Aincarn OS 料金',
  description:
    'Aincarn OSのプラン。月額でAI実行回数の上限が変わります。Free・Light・Pro・Powerから選べます。',
}

export default function AiosPricingPage() {
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
        <AiosPricing plans={plans} />
      </div>
    </main>
  )
}
