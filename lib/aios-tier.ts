// Aincarn OS tier and rate limit configuration.
//
// Tier mapping is currently env-driven so we can launch before payment
// integration. When Stripe / payment provider arrives, replace
// `getTierForUser` with a DB / metadata lookup.

export type AiosTier = 'free' | 'light' | 'pro' | 'power' | 'unlimited'

export type TierConfig = {
  tier: AiosTier
  label: string
  monthlyRunLimit: number // Infinity for unlimited
  description: string
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const num = Number(value)
  if (!Number.isFinite(num) || num < 0) return fallback
  return Math.floor(num)
}

export function getTierConfig(tier: AiosTier): TierConfig {
  switch (tier) {
    case 'unlimited':
      return {
        tier,
        label: 'Internal',
        monthlyRunLimit: Number.POSITIVE_INFINITY,
        description: '内部開発用の無制限プラン',
      }
    case 'power':
      return {
        tier,
        label: 'Power',
        monthlyRunLimit: parsePositiveInt(process.env.AINCARN_POWER_RUN_LIMIT, 400),
        description: 'AI実行を業務で使い込むヘビーユーザー向け',
      }
    case 'pro':
      return {
        tier,
        label: 'Pro',
        monthlyRunLimit: parsePositiveInt(process.env.AINCARN_PRO_RUN_LIMIT, 150),
        description: 'Aincarn OSを日常的に活用する人向け',
      }
    case 'light':
      return {
        tier,
        label: 'Light',
        monthlyRunLimit: parsePositiveInt(process.env.AINCARN_LIGHT_RUN_LIMIT, 60),
        description: '週に数回まとめて使う人向け',
      }
    case 'free':
    default:
      return {
        tier: 'free',
        label: 'Free',
        monthlyRunLimit: parsePositiveInt(process.env.AINCARN_FREE_RUN_LIMIT, 5),
        description: 'まずは試してみる無料プラン',
      }
  }
}

function parseTierList(env: string | undefined): string[] {
  if (!env) return []
  return env
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

// Allowlists by email or Clerk user id so test users can be promoted
// without a payment record. Used as a fallback when no Stripe
// subscription row exists for the user yet.
export function getTierForUser(input: { userId: string; email?: string | null }): AiosTier {
  const lowerEmail = (input.email || '').toLowerCase()
  const lowerId = input.userId.toLowerCase()

  if (parseTierList(process.env.AINCARN_UNLIMITED_USERS).some((entry) => entry === lowerEmail || entry === lowerId)) {
    return 'unlimited'
  }
  if (parseTierList(process.env.AINCARN_POWER_USERS).some((entry) => entry === lowerEmail || entry === lowerId)) {
    return 'power'
  }
  if (parseTierList(process.env.AINCARN_PRO_USERS).some((entry) => entry === lowerEmail || entry === lowerId)) {
    return 'pro'
  }
  if (parseTierList(process.env.AINCARN_LIGHT_USERS).some((entry) => entry === lowerEmail || entry === lowerId)) {
    return 'light'
  }
  return 'free'
}

// Resolve the effective tier by combining the Stripe subscription
// record with the env allowlists. The DB record wins when the
// subscription is active or trialing; otherwise we fall back to the
// allowlist tier (for internal accounts) and finally to free.
export async function resolveEffectiveTier(input: {
  userId: string
  email?: string | null
}): Promise<{ tier: AiosTier; source: 'subscription' | 'allowlist' | 'free' }> {
  try {
    const { getSubscriptionByUserId } = await import('@/lib/aios-subscription-store')
    const record = await getSubscriptionByUserId(input.userId)
    if (record && ['active', 'trialing'].includes(record.status)) {
      return { tier: record.tier, source: 'subscription' }
    }
  } catch {
    // DB unavailable; fall through to env allowlist
  }

  const allowlistTier = getTierForUser(input)
  if (allowlistTier !== 'free') return { tier: allowlistTier, source: 'allowlist' }
  return { tier: 'free', source: 'free' }
}

export function getUsageWindowStart() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
}

export function getUsageWindowReset() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0))
}
