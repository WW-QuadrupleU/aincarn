import { neon } from '@neondatabase/serverless'

export type SubscriptionInput = {
  serviceName: string
  planName?: string
  category: string
  monthlyCostUsd: number
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'one_time'
  renewalDate?: string
  status: 'active' | 'trial' | 'paused' | 'cancelled'
  notes?: string
}

export type SavedSubscription = SubscriptionInput & {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
}

type SqlClient = ReturnType<typeof neon>

let sqlClient: SqlClient | null = null
let schemaReady = false

export function hasSubscriptionDatabase() {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL)
}

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL
}

function getSql() {
  const url = getDatabaseUrl()
  if (!url) {
    throw new Error('DATABASE_URL is not configured')
  }

  if (!sqlClient) {
    sqlClient = neon(url)
  }

  return sqlClient
}

function rowToSubscription(row: Record<string, unknown>): SavedSubscription {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    serviceName: String(row.service_name),
    planName: row.plan_name ? String(row.plan_name) : '',
    category: String(row.category),
    monthlyCostUsd: Number(row.monthly_cost_usd),
    billingCycle: String(row.billing_cycle) as SavedSubscription['billingCycle'],
    renewalDate: row.renewal_date ? String(row.renewal_date) : '',
    status: String(row.status) as SavedSubscription['status'],
    notes: row.notes ? String(row.notes) : '',
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

function queryRows(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : []
}

export async function ensureSubscriptionSchema() {
  if (schemaReady) return

  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS aincarn_subscriptions (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      service_name text NOT NULL,
      plan_name text,
      category text NOT NULL DEFAULT 'AI',
      monthly_cost_usd numeric(12, 2) NOT NULL DEFAULT 0,
      billing_cycle text NOT NULL DEFAULT 'monthly',
      renewal_date date,
      status text NOT NULL DEFAULT 'active',
      notes text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS aincarn_subscriptions_user_idx
    ON aincarn_subscriptions (user_id, status, renewal_date)
  `

  // Repair migration: an earlier version of the Stripe tier store
  // accidentally shared this table name and applied a UNIQUE(user_id)
  // index plus NOT NULL constraints on stripe_*. That blocked users
  // from saving more than one external AI subscription. Undo those
  // here defensively; the tier store now lives in aincarn_user_tiers.
  await sql`DROP INDEX IF EXISTS aincarn_subscriptions_user_id_idx`
  await sql`ALTER TABLE aincarn_subscriptions ALTER COLUMN stripe_customer_id DROP NOT NULL`.catch(() => {})

  schemaReady = true
}

export function normalizeSubscriptionInput(value: unknown): SubscriptionInput {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const serviceName = String(input.serviceName || '').trim()
  const planName = String(input.planName || '').trim()
  const category = String(input.category || 'AI').trim() || 'AI'
  const monthlyCostUsd = Number(input.monthlyCostUsd)
  const billingCycle = String(input.billingCycle || 'monthly')
  const renewalDate = String(input.renewalDate || '').trim()
  const status = String(input.status || 'active')
  const notes = String(input.notes || '').trim()

  if (!serviceName) {
    throw new Error('サービス名を入力してください')
  }
  if (!Number.isFinite(monthlyCostUsd) || monthlyCostUsd < 0) {
    throw new Error('月額換算コストは0以上の数値で入力してください')
  }
  if (!['monthly', 'yearly', 'weekly', 'one_time'].includes(billingCycle)) {
    throw new Error('請求周期が不正です')
  }
  if (!['active', 'trial', 'paused', 'cancelled'].includes(status)) {
    throw new Error('ステータスが不正です')
  }

  return {
    serviceName,
    planName,
    category,
    monthlyCostUsd: Math.round(monthlyCostUsd * 100) / 100,
    billingCycle: billingCycle as SubscriptionInput['billingCycle'],
    renewalDate,
    status: status as SubscriptionInput['status'],
    notes,
  }
}

export async function listSubscriptions(userId: string): Promise<SavedSubscription[]> {
  await ensureSubscriptionSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT *
    FROM aincarn_subscriptions
    WHERE user_id = ${userId}
    ORDER BY
      CASE WHEN status IN ('active', 'trial') THEN 0 ELSE 1 END,
      renewal_date ASC NULLS LAST,
      updated_at DESC
  `
  return queryRows(rows).map(rowToSubscription)
}

export async function createSubscription(userId: string, input: SubscriptionInput): Promise<SavedSubscription> {
  await ensureSubscriptionSchema()
  const sql = getSql()
  const id = crypto.randomUUID()
  const renewalDate = input.renewalDate || null
  const rows = await sql`
    INSERT INTO aincarn_subscriptions (
      id,
      user_id,
      service_name,
      plan_name,
      category,
      monthly_cost_usd,
      billing_cycle,
      renewal_date,
      status,
      notes
    )
    VALUES (
      ${id},
      ${userId},
      ${input.serviceName},
      ${input.planName || null},
      ${input.category},
      ${input.monthlyCostUsd},
      ${input.billingCycle},
      ${renewalDate},
      ${input.status},
      ${input.notes || null}
    )
    RETURNING *
  `
  return rowToSubscription(queryRows(rows)[0])
}

export async function updateSubscription(
  userId: string,
  id: string,
  input: SubscriptionInput
): Promise<SavedSubscription | null> {
  await ensureSubscriptionSchema()
  const sql = getSql()
  const renewalDate = input.renewalDate || null
  const rows = await sql`
    UPDATE aincarn_subscriptions
    SET
      service_name = ${input.serviceName},
      plan_name = ${input.planName || null},
      category = ${input.category},
      monthly_cost_usd = ${input.monthlyCostUsd},
      billing_cycle = ${input.billingCycle},
      renewal_date = ${renewalDate},
      status = ${input.status},
      notes = ${input.notes || null},
      updated_at = now()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `
  return queryRows(rows)[0] ? rowToSubscription(queryRows(rows)[0]) : null
}

export async function deleteSubscription(userId: string, id: string): Promise<boolean> {
  await ensureSubscriptionSchema()
  const sql = getSql()
  const rows = await sql`
    DELETE FROM aincarn_subscriptions
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `
  return queryRows(rows).length > 0
}
