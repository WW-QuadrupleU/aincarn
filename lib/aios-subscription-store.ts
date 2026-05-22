// Maps Clerk userId to Stripe customer + current subscription state.
//
// Source of truth for tier is this table; lib/aios-tier still respects
// the env allowlists as a fallback for internal accounts and testing.

import { neon } from '@neondatabase/serverless'
import type { AiosTier } from '@/lib/aios-tier'

type SqlClient = ReturnType<typeof neon>

let sqlClient: SqlClient | null = null
let schemaReady = false

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL
}

function getSql() {
  const url = getDatabaseUrl()
  if (!url) throw new Error('DATABASE_URL is not configured')
  if (!sqlClient) sqlClient = neon(url)
  return sqlClient
}

function queryRows(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : []
}

export type SubscriptionStatus =
  | 'inactive'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'

export type SubscriptionRecord = {
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string | null
  tier: AiosTier
  status: SubscriptionStatus
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  updatedAt: string
}

export function hasSubscriptionDatabase() {
  return Boolean(getDatabaseUrl())
}

export async function ensureSubscriptionsSchema() {
  if (schemaReady) return
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS aincarn_subscriptions (
      user_id text PRIMARY KEY,
      stripe_customer_id text NOT NULL,
      stripe_subscription_id text,
      tier text NOT NULL DEFAULT 'free',
      status text NOT NULL DEFAULT 'inactive',
      current_period_end timestamptz,
      cancel_at_period_end boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS aincarn_subscriptions_customer_idx
    ON aincarn_subscriptions (stripe_customer_id)
  `
  schemaReady = true
}

function rowToSubscription(row: Record<string, unknown>): SubscriptionRecord {
  return {
    userId: String(row.user_id),
    stripeCustomerId: String(row.stripe_customer_id),
    stripeSubscriptionId: row.stripe_subscription_id ? String(row.stripe_subscription_id) : null,
    tier: (String(row.tier) || 'free') as AiosTier,
    status: (String(row.status) || 'inactive') as SubscriptionStatus,
    currentPeriodEnd: row.current_period_end ? new Date(String(row.current_period_end)).toISOString() : null,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

export async function getSubscriptionByUserId(userId: string): Promise<SubscriptionRecord | null> {
  await ensureSubscriptionsSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM aincarn_subscriptions WHERE user_id = ${userId} LIMIT 1
  `
  const row = queryRows(rows)[0]
  return row ? rowToSubscription(row) : null
}

export async function getSubscriptionByCustomerId(customerId: string): Promise<SubscriptionRecord | null> {
  await ensureSubscriptionsSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM aincarn_subscriptions WHERE stripe_customer_id = ${customerId} LIMIT 1
  `
  const row = queryRows(rows)[0]
  return row ? rowToSubscription(row) : null
}

export async function upsertSubscriptionRecord(input: {
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId?: string | null
  tier: AiosTier
  status: SubscriptionStatus
  currentPeriodEnd?: Date | null
  cancelAtPeriodEnd?: boolean
}): Promise<SubscriptionRecord> {
  await ensureSubscriptionsSchema()
  const sql = getSql()
  const rows = await sql`
    INSERT INTO aincarn_subscriptions (
      user_id,
      stripe_customer_id,
      stripe_subscription_id,
      tier,
      status,
      current_period_end,
      cancel_at_period_end
    )
    VALUES (
      ${input.userId},
      ${input.stripeCustomerId},
      ${input.stripeSubscriptionId || null},
      ${input.tier},
      ${input.status},
      ${input.currentPeriodEnd ? input.currentPeriodEnd.toISOString() : null},
      ${Boolean(input.cancelAtPeriodEnd)}
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      tier = EXCLUDED.tier,
      status = EXCLUDED.status,
      current_period_end = EXCLUDED.current_period_end,
      cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      updated_at = now()
    RETURNING *
  `
  return rowToSubscription(queryRows(rows)[0])
}
