// Stripe client + plan catalog.
//
// Price IDs come from env vars so the same code runs in test and live
// Stripe accounts. Each tier maps to a single recurring price ID.

import Stripe from 'stripe'
import type { AiosTier } from '@/lib/aios-tier'

let cachedClient: Stripe | null = null

export function hasStripe() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripe() {
  if (!hasStripe()) {
    throw new Error('Stripeが設定されていません（STRIPE_SECRET_KEY未設定）')
  }
  if (!cachedClient) {
    cachedClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-10-29.clover',
    })
  }
  return cachedClient
}

export type StripePlan = {
  tier: AiosTier
  label: string
  priceJpy: number
  description: string
  bullets: string[]
  recommended?: boolean
  priceId: string | null
}

function priceIdFor(tier: AiosTier): string | null {
  switch (tier) {
    case 'light':
      return process.env.STRIPE_PRICE_LIGHT || null
    case 'pro':
      return process.env.STRIPE_PRICE_PRO || null
    case 'power':
      return process.env.STRIPE_PRICE_POWER || null
    default:
      return null
  }
}

export function getStripePlans(): StripePlan[] {
  return [
    {
      tier: 'free',
      label: 'Free',
      priceJpy: 0,
      description: 'まずは試してみる',
      bullets: ['月5回までAI実行', '基本のプラン生成', 'Aincarn Memory保存'],
      priceId: null,
    },
    {
      tier: 'light',
      label: 'Light',
      priceJpy: 480,
      description: '週に数回まとめて使う人向け',
      bullets: ['月60回までAI実行', '全てのプロバイダ自動ルーティング', '実行履歴の保存'],
      priceId: priceIdFor('light'),
    },
    {
      tier: 'pro',
      label: 'Pro',
      priceJpy: 980,
      description: 'Aincarn OSを日常的に活用する人向け',
      bullets: ['月150回までAI実行', '優先サポート', '将来の新機能を優先公開'],
      recommended: true,
      priceId: priceIdFor('pro'),
    },
    {
      tier: 'power',
      label: 'Power',
      priceJpy: 1980,
      description: 'AI実行を業務で使い込むヘビーユーザー向け',
      bullets: ['月400回までAI実行', 'プラン生成にSonnet固定', 'Webhook / 一括書き出し（予定）'],
      priceId: priceIdFor('power'),
    },
  ]
}

export function getPlanByTier(tier: AiosTier): StripePlan | undefined {
  return getStripePlans().find((plan) => plan.tier === tier)
}

export function getTierForPriceId(priceId: string | null | undefined): AiosTier {
  if (!priceId) return 'free'
  if (priceId === process.env.STRIPE_PRICE_POWER) return 'power'
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro'
  if (priceId === process.env.STRIPE_PRICE_LIGHT) return 'light'
  return 'free'
}

export function getReturnUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://aincarn.com'
  const safePath = path.startsWith('/') ? path : `/${path}`
  return `${base.replace(/\/$/, '')}${safePath}`
}
